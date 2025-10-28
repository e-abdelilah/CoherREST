#!/usr/bin/env node


import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import readline from "readline";

// console output formatter
function printStep(message) {
  console.log(`[+] ${message}`);
}

// OpenAPI file path
async function askFilePath() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter the path to your OpenAPI file (.json or .yaml): ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Load OpenAPI Specification
function loadOpenApi(filePath) {
  printStep("Loading OpenAPI specification...");
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let data;
    if (filePath.endsWith(".json")) {
      data = JSON.parse(content);
    } else {
      data = yaml.load(content);
    }
    printStep("OpenAPI file loaded successfully.");
    return data;
  } catch (err) {
    console.error("Error loading OpenAPI file:", err.message);
    process.exit(1);
  }
}

// syntactic enrichment (Security Scheme)
function addSecurityScheme(data) {
  printStep("Adding syntactic enrichment: Security Scheme...");

  if (!data.components) data.components = {};
  if (!data.components.securitySchemes) data.components.securitySchemes = {};

  // Define a simple API key authentication scheme
  data.components.securitySchemes.ApiKeyAuth = {
    type: "apiKey",
    in: "header",
    name: "X-API-KEY",
    description: "API key required for access. Used to identify Admin users.",
  };

  // Apply the security scheme globally
  data.security = [
    {
      ApiKeyAuth: [],
    },
  ];

  printStep("Syntactic enrichment completed (Security Scheme added).");
  return data;
}

// semantic enrichment (RBAC + validation + sensitivity)
function enrichSemantics(data) {
  printStep("Analyzing API structure and adding semantic enrichment...");
  const paths = data.paths || {};

  for (const [route, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (["get", "post", "put", "delete", "patch"].includes(method.toLowerCase())) {
        // RBAC Rule (Admin only)
        operation["x-security-context"] = {
          requiredRole: "Admin",
          description: "Only Admins can access this endpoint",
        };

        // Validation Rule
        operation["x-validation-rules"] = [
          "If 'limit' parameter is present, it must be <= 100",
        ];

        // Sensitivity Rule
        operation["x-is-pii"] = route.toLowerCase().includes("user") || route.toLowerCase().includes("profile");
      }
    }
  }

  printStep("Semantic enrichment completed (RBAC, validation, PII metadata added).");
  return data;
}

// Save enriched specification
function saveEnrichedFile(data, originalPath) {
  const ext = path.extname(originalPath);
  const baseName = path.basename(originalPath, ext);
  const enrichedFile = path.join(path.dirname(originalPath), `${baseName}_enriched${ext}`);

  printStep("Generating enriched OpenAPI file...");
  try {
    if (ext === ".json") {
      fs.writeFileSync(enrichedFile, JSON.stringify(data, null, 2), "utf8");
    } else {
      fs.writeFileSync(enrichedFile, yaml.dump(data, { noRefs: true }), "utf8");
    }
    printStep(`Enriched file generated successfully: ${enrichedFile}`);
  } catch (err) {
    console.error("Error writing enriched file:", err.message);
    process.exit(1);
  }
}

// Main process
async function main() {
  console.log("\n=== CoherREST: Model-Driven REST API Coherence Tool ===");
  console.log("This tool performs syntactic (security) and semantic (RBAC, validation, sensitivity) enrichment of OpenAPI specs.");
  console.log("-------------------------------------------------------\n");

  const filePath = await askFilePath();

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }


  const openApiData = loadOpenApi(filePath);
  const withSecurity = addSecurityScheme(openApiData);
  const enrichedData = enrichSemantics(withSecurity);
  saveEnrichedFile(enrichedData, filePath);

  console.log("\n[✔] Process completed. Your OpenAPI specification has been syntactically and semantically enriched.\n");
}

main();

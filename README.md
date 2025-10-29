# CoherREST


**CoherREST** is a command-line tool that performs **syntactic and semantic enrichment** of OpenAPI specifications. It helps make REST APIs more **coherent, secure, and semantically meaningful**.

You can **test the enriched OpenAPI file online** using [Swagger Editor](https://editor.swagger.io/).

---

## Features

- **Syntactic enrichment**: Adds security schemes (e.g., API key authentication) to your OpenAPI spec.  
- **Semantic enrichment**: Adds metadata for RBAC, validation rules, and sensitive data (PII) detection.  
- **Supports JSON & YAML** OpenAPI files.  
- Generates an **enriched OpenAPI file** in the same folder.

---

## Installation

Install CoherREST using npm:

```bash
npm i coherrest
```

## Usage

Run the tool from the command line:

```bash
coherrest
```
1. Enter the path to your OpenAPI file (JSON or YAML) when prompted.
2. The tool generates an enriched file with _enriched appended to the original filename.
3. Open the enriched file in Swagger Editor to view and test your API.


## How it Works

1. Load OpenAPI file: Reads your JSON or YAML specification.
2. Syntactic enrichment: Adds a security scheme globally (API key authentication).
3. Semantic enrichment:
   - Adds RBAC rules (x-security-context)
   - Adds validation rules (x-validation-rules)
   - Marks sensitive fields (x-is-pii)
4. Save enriched file: Writes the updated OpenAPI file next to the original.


Original endpoint:
```yaml
paths:
  /users:
    get:
      summary: Get all users
```

Enriched endpoint:
```yaml
paths:
  /users:
    get:
      summary: Get all users
      x-security-context:
        requiredRole: Admin
        description: Only Admins can access this endpoint
      x-validation-rules:
        - If 'limit' parameter is present, it must be <= 100
      x-is-pii: true
```

## Author

[Abdelilah Ettarch](https://github.com/e-abdelilah)




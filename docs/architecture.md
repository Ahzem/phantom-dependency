# Phantom Dependency — Architecture & Security Blueprint 👻

## 1. Executive Summary
**Phantom Dependency** is an open-source, local-first dependency investigation tool built for the **Hacktoberfest Open-Source AI Challenge, Week 4: "Ghost in the Machine"**.

It helps developers discover forgotten, outdated, potentially abandoned, or concerning dependencies in JavaScript and TypeScript repositories. The user experience is framed through the metaphor of a haunted mansion: dependencies are ghosts, outdated packages are forgotten residents, and the investigation report is the **Dependency Graveyard**.

Crucially, **Phantom Dependency is a serious developer security and audit tool**. It favors evidence-backed facts over speculative fear, operates locally without cloud AI APIs, and strictly preserves privacy.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15 App Router)        │
│    - Dark Ghost Theme (Charcoal, Spectral Green, Amethyst) │
│    - Stepper Investigation Workflow                         │
│    - Graveyard Visualizer with Search, Filters & Modals     │
│    - Markdown & JSON Export Engine                          │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                    Backend (FastAPI & Pydantic)             │
│    ├── Core: Path Safety, Exception Handling, Config        │
│    ├── Pipeline Services:                                   │
│    │     ├─ ProjectService (Path validation)                │
│    │     ├─ ManifestService (package.json parser)           │
│    │     ├─ LockfileService (npm, pnpm, yarn lock resolver) │
│    │     ├─ SourceInspectionService (Conservative AST scan) │
│    │     ├─ VersionService (Semver comparison & registry)   │
│    │     ├─ SecurityService (OSV.dev advisory lookups)      │
│    │     └─ AIService (Ollama + Gemma 3 1B client)          │
│    └── Repositories: Local JSON Report Repository           │
└──────────────────────────▲───────────────▲──────────────────┘
                           │               │
        Local Ollama API   │               │ Opt-in Network Queries
        (http://127.0.0.1) │               │ (Only if explicitly enabled)
┌──────────────────────────▼──┐     ┌──────▼──────────────────┐
│  Ollama Inference Engine    │     │  Public Metadata APIS   │
│  Model: gemma3:1b           │     │  - npm Registry         │
│  Zero telemetry/cloud calls │     │  - OSV.dev Advisories   │
└─────────────────────────────┘     └─────────────────────────┘
```

---

## 3. Investigation Pipeline & Evidence Framework

### Step 1: Secure Path Validation & Isolation
- Verifies that the requested path exists, is a directory, and contains `package.json`.
- Strict path sanitization resolves symlinks and verifies subpaths.
- Never reads `.env`, `.env.*`, `id_rsa`, `.pem`, credentials, or private keys.
- Directory walk ignores `node_modules`, `.git`, `.next`, `dist`, `build`, `.turbo`, and hidden directories.
- Never runs `npm install`, lifecycle scripts, or arbitrary project code.

### Step 2: Manifest & Lockfile Resolution
- Parses declared dependencies: `dependencies`, `devDependencies`, `optionalDependencies`, `peerDependencies`.
- Resolves exact locked versions from `package-lock.json` (v1, v2, v3), `yarn.lock` (v1), or `pnpm-lock.yaml`.
- Distinguishes exact locked version from declared semver ranges (e.g. `^4.1.2` vs `4.1.2`).
- Never fabricates resolved versions if lockfile is missing or unparseable.

### Step 3: Conservative Source Code Inspection
- Statically walks project source files (`.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.svelte`, `.css`).
- Scans for ESM `import`, CommonJS `require()`, dynamic `import()`, and `@import`.
- Whitelists tooling packages referenced in `package.json` scripts (e.g. `prettier`, `eslint`) and build configs (`tailwind.config.*`, `vite.config.*`, `tsconfig.json`).
- Categorizes unreferenced runtime dependencies conservatively as **"Possibly Unused"**.

### Step 4: Optional Network Enrichment (Opt-in)
- Network enrichment is **off by default**.
- When enabled, queries npm registry for latest versions and release dates.
- Queries OSV.dev (`https://api.osv.dev/v1/query`) for verified security advisories.
- Offline fallback uses local vulnerability signatures.

### Step 5: Local AI Ghost Examination (Gemma 3 1B)
- Connects to local Ollama server at `http://127.0.0.1:11434`.
- Uses compact structured JSON prompts.
- Output is validated against a Pydantic schema.
- **Strict Guardrail**: AI is forbidden from inventing CVEs, dates, or commit histories. If details are missing, it must state they are unknown.
- If Ollama is offline or times out, deterministic heuristic templates are seamlessly substituted.

---

## 4. Dependency Graveyard Classifications

| Classification | Visual Indicator | Definition | Example Trigger |
| :--- | :--- | :--- | :--- |
| **Resting** | 🟢 Emerald | Stable, up-to-date, actively referenced. | Healthy, current package |
| **Aging** | 🟡 Amber | Behind latest release or stale (>24 months without release). | `lodash` 3.x when 4.x is out |
| **Whispering** | 🟣 Amethyst | Incomplete evidence, unreferenced in source code, or unresolvable. | Declared runtime package with 0 imports |
| **Haunted** | 🔴 Crimson | Confirmed security advisory or verified severe vulnerability. | Known CVE / OSV advisory |

---

## 5. Privacy & Security Guarantees
1. **Local-First AI**: Inference executes 100% on the developer's hardware.
2. **Zero Code Uploads**: Project source code is never transmitted.
3. **Opt-in Network Lookups**: Registry and advisory queries are optional and send only package names and version strings.
4. **Local Binding**: FastAPI backend binds to `127.0.0.1` with restricted CORS.
5. **No Code Execution**: Manifests and source files are read as plain text/JSON. No package scripts or binaries are executed.

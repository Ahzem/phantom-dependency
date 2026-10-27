# Phantom Dependency 👻

> *"Every project has a past. Discover the dependencies haunting yours."*

**Phantom Dependency** is an open-source, local-first AI dependency investigation tool for JavaScript and TypeScript codebases. Built for the **Hacktoberfest Open-Source AI Challenge, Week 4: "Ghost in the Machine"**.

---

## 🌟 The Metaphor & The Tool

Beneath its spooky haunted codebase aesthetic lies a serious developer security and audit tool:
- **Dependencies** are the spirits living in your codebase.
- **Outdated & Inactive packages** are the forgotten residents who stopped talking.
- **The Dependency Graveyard** is your actionable investigation report.

### 🛡️ Core Principles
1. **Fact over Fear:** Never label a package abandoned, malicious, or vulnerable solely because it is old. Every finding is backed by explicit evidence.
2. **Local-First & Private:** Source files are inspected statically on your machine. Code is never transmitted to an external service or cloud AI.
3. **Local AI Inference:** Powered by Ollama and Google's lightweight `gemma3:1b` model.
4. **Resilient Offline Fallback:** If Ollama is offline or uninstalled, the entire analysis runs seamlessly using deterministic rule-based templates.
5. **Non-Destructive:** Phantom Dependency is an investigation and audit tool. It never modifies `package.json`, lockfiles, or project source code.

---

## ⚰️ Dependency Graveyard Classifications

| Classification | Color | Meaning |
| :--- | :--- | :--- |
| **Resting** | 🟢 Green | Package appears stable, up-to-date, and actively referenced. |
| **Aging** | 🟡 Amber | Package is behind latest releases or has not published in >24 months. |
| **Whispering** | 🟣 Purple | Evidence is incomplete, unresolvable, or package is unreferenced in source code. |
| **Haunted** | 🔴 Rose | A confirmed security advisory (OSV/GHSA) or critical vulnerability exists. |

---

## 🏗️ Architecture

```
phantom-dependency/
├── apps/
│   ├── web/                     # Next.js 15 (App Router), React 19, Tailwind CSS
│   │   ├── src/app/             # Pages: Overview, Investigate, Graveyard, Reports, Settings
│   │   ├── src/components/      # UI, Layout, Cards, Modals, Filter bar
│   │   └── src/lib/             # Typed API client & utilities
│   └── api/                     # Python 3.12+ FastAPI backend
│       ├── app/api/routes/      # Health, AI, Projects, Analysis, Reports
│       ├── app/services/        # Manifest, Lockfile, Source inspection, Ollama AI
│       ├── app/utils/           # Path safety & Semver comparison
│       └── tests/               # 17 Pytest unit & integration tests
├── examples/
│   └── sample-project/          # Controlled testbed (outdated, unused, vulnerable, healthy)
├── docs/
│   └── architecture.md          # Technical blueprint & threat model
├── scripts/
│   └── dev.ps1                  # Windows 11 PowerShell one-command startup script
└── package.json                 # Monorepo root
```

---

## 🚀 Quick Start (Windows 11)

### Prerequisites
1. **Node.js** (v18+) and **pnpm**
2. **Python** (3.11+)
3. **Ollama** ([ollama.com](https://ollama.com))

### 1. Clone & Install
```powershell
git clone https://github.com/your-username/phantom-dependency.git
cd phantom-dependency

# Install frontend workspace dependencies
pnpm install
```

### 2. Pull the AI Model
```powershell
ollama pull gemma3:1b
```

### 3. Launch with One Command
Run the PowerShell dev script:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

Or run frontend and backend independently:
```powershell
# Backend (FastAPI)
cd apps\api
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Frontend (Next.js)
cd apps\web
pnpm dev
```

- Open Web Interface: **http://localhost:3000**
- API Documentation: **http://127.0.0.1:8000/docs**

---

## 🧪 Testing

### Backend Unit & Integration Tests
Run the 17 automated tests (covering path safety, manifest parsing, lockfiles, semver, source inspection, AI schema validation, and API routes):
```powershell
cd apps\api
.\.venv\Scripts\pytest.exe -v
```

### End-to-End Test Project
Target the included testbed project:
```
D:\Projects\WebApps\phantom-dependency\examples\sample-project
```
This tests:
- `chalk` (Resting: healthy & active)
- `lodash` (Aging: outdated major version 3.x)
- `minimist` (Haunted: known prototype pollution advisory)
- `moment` (Whispering: declared in dependencies, but 0 imports in source)
- `fake-ghost-helper` (Whispering: missing from registry)
- `prettier` (Dev dependency used via scripts)

---

## 🔒 Privacy & Security Disclosures
- **Offline by Default:** External registry lookups and advisory queries are disabled by default.
- **Opt-In Enrichment:** When enabled, queries send only package names and version strings.
- **Local AI:** Ollama inference executes strictly on your localhost.
- **Zero Source Code Transmission:** Source files are never sent over the network.
- **Path Isolation:** Filesystem scanner rejects symlink junctions and ignores `.env` files, credentials, and private keys.

---

## 📜 License
MIT License. Created for the **Hacktoberfest 2026 Ghost in the Machine Challenge**.

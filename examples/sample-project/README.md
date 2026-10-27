# Sample Haunted Project 👻

This is a controlled JavaScript test project used to evaluate **Phantom Dependency** deterministic analysis and AI explanations.

### Test Scenarios:
1. **chalk (^4.1.2)**: Direct dependency, active, imported in `src/index.js`. Status: Healthy / Resting.
2. **lodash (^3.10.1)**: Outdated dependency (major versions behind v4.17.21). Status: Aging.
3. **minimist (0.0.8)**: Known vulnerable dependency with security advisories. Status: Haunted.
4. **moment (^2.29.4)**: Declared in `package.json`, but never imported in source files. Status: Possibly Unused / Whispering.
5. **fake-ghost-helper (0.1.0)**: Unregistered package / missing registry metadata. Status: Unresolved / Whispering.
6. **prettier (^3.0.0)**: Dev dependency referenced in `package.json` scripts. Status: Valid dev tooling.

# Developer workflow

## Node workspace

```bash
cd Roundz
npm install
npm run dev:infra
npm run build
npm test
```

Root scripts:

- `npm run dev` - starts local infra and gateway workflow.
- `npm run build` - builds backend shared packages, services, and admin apps.
- `npm run typecheck` - aliases the production build graph.
- `npm run lint` - currently runs the typecheck/build gate.
- `npm run test` - runs shared config, DTO, and common package tests.

## pnpm and Turbo

`pnpm-workspace.yaml` and `turbo.json` are included so the same package graph can be executed by pnpm/Turbo-based CI without changing package boundaries.

## Debugging

VS Code launch configurations are provided for the gateway and auth service in `.vscode/launch.json`.

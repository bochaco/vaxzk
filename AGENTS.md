# AGENTS.md

## Commands

```bash
npm install                    # Install dependencies
npm run contract:compile       # Compile Compact contracts (REQUIRED after modifying contract/*.compact)
npm run dev                    # Start Vite dev server
npm run build                  # Type-check + build production
npm run lint                   # Lint with ESLint
npm run test                   # Run tests with Vitest
```

## Critical: Contract Recompilation

After modifying any `.compact` file in `contract/`, you MUST run `npm run contract:compile`. This:
1. Compiles `contract/vaxzk.compact` to `contract/managed/`
2. Copies ZK assets to `public/keys/` and `public/zkir/`

**Skipping this causes runtime `ContractConfigurationError`**.

## Architecture

- **Frontend**: React 19 + Vite + TypeScript (project name: `connect`)
- **Smart Contract**: Midnight Compact (`contract/vaxzk.compact`, `contract/Invites.compact`)
- **API Layer**: `src/contract-api/index.ts` - derives state from ledger

## Profiles

| Profile | Role |
|---------|------|
| Admin | Invite/revoke admins & clinics, manage vaccine types |
| User | View certificates, list clinics, verify vaccination |
| Health Facility | Manage clinic profile, generate certificates |

## Key Files

- `src/contract-api/common-types.ts` - Derived state types (VaxZkDerivedState)
- `src/components/admin/MetricsAdmin.tsx` - Admin metrics dashboard
- `contract/vaxzk.compact` - Main contract logic
- `contract/Invites.compact` - Invite management

## Test

Run `npm run test` for Vitest. No special prerequisites.
# VaxZK: ZK Vaccine Certificate Manager on Midnight

VaxZK is a decentralized application designed for the Midnight Network to manage vaccine certificates securely and privately using Zero-Knowledge proofs.

The application allows users to register, securely receive vaccine certificates from authorized organizations (e.g., WHO), view their private certificates, and generate ZK proofs via QR codes to verify their vaccination status without revealing their sensitive personal data.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Midnight Compact compiler](https://docs.midnight.network/getting-started/installation) (`compact`)
- [Lace wallet](https://www.lace.io/) browser extension with Midnight support

### Setup

```bash
npm install
npm run contract:compile   # compile the contract and copy ZK assets
npm run dev
```

### Contract changes

Whenever `contract/src/vaxzk.compact` is modified, recompile before running or building the app:

```bash
npm run contract:compile
```

This compiles the Compact source to `contract/src/managed/vaxzk/` and copies the verifier keys and ZK IR files into `public/keys/` and `public/zkir/`, where Vite serves them as static assets. **If this step is skipped after a contract change, the app will fail at runtime with a `ContractConfigurationError` when trying to deploy or call circuits.**

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run contract:compile` | Compile the contract and copy ZK assets to `public/` |
| `npm run contract:copy-assets` | Copy already-compiled ZK assets to `public/` (without recompiling) |
| `npm run lint` | Lint the codebase |
| `npm run preview` | Preview the production build |

---

### 1. Frontend Setup (React + Vite)
- We will initialize a Vite project for the DApp interface.
- Implement rich, dynamic, state-of-the-art UI with a Glassmorphism aesthetic and a sleek dark mode.
- Establish routing for:
  - `Home/Registration`: Wallet connection and user onboarding.
  - `My Certificates`: Viewing private state certificates.
  - `Verifier Proof`: Generating and scanning QR codes (ZK logic).
  - `Travel Requirements (Upcoming)`: Informational view.

### 2. Midnight Compact Smart Contract
- **Contract Name**: `vaccine_cert.compact`
- **Logic**:
  - **Public State**: A ledger of authorized entity public keys (e.g., WHO, Clinics).
  - **Private State**: The user's internal secure storage containing their certificate details (vaccine type, date, issuer signature).
  - **Circuit**: A local proof generator to assert "I possess a certificate signed by an authorized key, for a specific vaccine type" without exposing the exact issuer or exact timestamp to the verifier unless explicitly required.

### 3. Application Integration (`@midnight-network/*`)
- We will integrate the TypeScript backend/SDK layers to connect the Compact logic with the React frontend.
- Utilize standard Midnight Wallet integration (e.g. Lace Nightly/Midnight integration pattern).
- Provide QR code generation and scanning functionality via `qrcode.react` and generic QR scanner libraries.

### 4. Profiles

- **Admin**:
  - Can create and revoke other admins.
  - Can create and revoke Health Facilities.
  - Can create and edit existing vaccine types.
- **Users**:

- **Health Facilities**: Like Clinics, Pharmacies and Hospitals.
  - Can create and edit their profile, specifying the type of vaccine they can administer.
  - Can administer the vaccines.

### ACTUAL CONTRACT ID
     https://preprod.nightforge.jp/address/927b02ceb1bc3776e87cd5c316b1e43c2a93d6c5b92295f2609c010d1f51a678

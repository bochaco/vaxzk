# VaxZK: ZK Vaccine Certificate Manager on Midnight

VaxZK is a decentralized application designed for the Midnight Network to manage vaccine certificates securely and privately using Zero-Knowledge proofs.

The application allows users to register, securely receive vaccine certificates from authorized organizations (e.g., WHO), view their private certificates, and generate ZK proofs via QR codes to verify their vaccination status without revealing their sensitive personal data.

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
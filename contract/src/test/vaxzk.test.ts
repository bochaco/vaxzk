import { describe, it, expect, beforeEach } from "vitest";
import {
  setNetworkId,
  type NetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { fromHex } from "@midnight-ntwrk/midnight-js-utils";
import { CompactTypeJubjubPoint, type JubjubPoint } from "@midnight-ntwrk/compact-runtime";
import { pureCircuits, Role } from "../../managed/contract/index.js";
import { generateKeyPair, signVaxZkCertificate } from "../../../src/contract-api/signing.js";
import { VaxZkSimulator, type TestUser } from "./vaxzk-simulator.js";
import {
  randomBytes,
  randomCoinPublicKeyHex,
  randomTimestamp,
  encodeBytes20,
} from "./utils.js";

setNetworkId("undeployed" as NetworkId);

// ── JubjubPoint interning ─────────────────────────────────────────────────────
// The compiled Schnorr verify uses JavaScript === to compare two JubjubPoints.
// Since ecMulGenerator/ecAdd always return fresh objects, === always returns
// false — even for mathematically equal points. To make the simulator work, we
// patch CompactTypeJubjubPoint.fromValue to intern points by (x, y) so that
// identical coordinates always map to the same object reference.
const _jubjubCache = new Map<string, JubjubPoint>();
const _origFromValue = CompactTypeJubjubPoint.fromValue.bind(CompactTypeJubjubPoint);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(CompactTypeJubjubPoint as any).fromValue = function (value: any[]): JubjubPoint {
  const pt = _origFromValue(value);
  const key = `${pt.x},${pt.y}`;
  if (!_jubjubCache.has(key)) _jubjubCache.set(key, pt);
  return _jubjubCache.get(key)!;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const randomUser = (): TestUser => ({
  secretKey: randomBytes(32),
  pk: randomCoinPublicKeyHex(),
});

/** Computes the shielded admin ID for a user (mirrors isAdmin() in the circuit). */
const adminId = (user: TestUser): Uint8Array =>
  pureCircuits.getShieldedId(fromHex(user.pk));

/** Computes the shielded clinic ID for a user (mirrors isClinic() in the circuit). */
const clinicId = (user: TestUser): Uint8Array =>
  pureCircuits.getShieldedId(user.secretKey);

const mockProfile = (user?: TestUser) => ({
  ownerId: user ? adminId(user) : randomBytes(32),
  name: randomBytes(32),
  address: randomBytes(64),
  latitud: randomBytes(20),
  longitud: randomBytes(20),
  isOnline: true,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("VaxZk contract", () => {
  let admin: TestUser;
  let simulator: VaxZkSimulator;

  beforeEach(() => {
    admin = randomUser();
    simulator = new VaxZkSimulator(admin);
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("starts with the three built-in vaccines (HepB, PCV, Tdap)", () => {
      const l = simulator.getLedger();
      expect(l.vaccines.member(encodeBytes20("HepB"))).toBe(true);
      expect(l.vaccines.member(encodeBytes20("PCV"))).toBe(true);
      expect(l.vaccines.member(encodeBytes20("Tdap"))).toBe(true);
      expect(l.vaccines.size()).toBe(3n);
    });

    it("starts with initial clinics and empty issuers map", () => {
      const l = simulator.getLedger();
      expect(l.clinics.size()).toBe(2n);
      expect(l.issuers.isEmpty()).toBe(true);
    });

    it("starts with empty proof request and proof maps", () => {
      const l = simulator.getLedger();
      expect(l.vaccineProofReqs.isEmpty()).toBe(true);
      expect(l.vaccineProofs.isEmpty()).toBe(true);
    });
  });

  // ── getShieldedId pure circuit ─────────────────────────────────────────────

  describe("getShieldedId", () => {
    it("returns a 32-byte Uint8Array", () => {
      const result = pureCircuits.getShieldedId(randomBytes(32));
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(32);
    });

    it("is deterministic for the same input", () => {
      const input = randomBytes(32);
      expect(pureCircuits.getShieldedId(input)).toEqual(pureCircuits.getShieldedId(input));
    });

    it("produces distinct outputs for distinct inputs", () => {
      expect(pureCircuits.getShieldedId(randomBytes(32))).not.toEqual(
        pureCircuits.getShieldedId(randomBytes(32)),
      );
    });
  });

  // ── Clinic management ──────────────────────────────────────────────────────

  describe("addClinic", () => {
    it("admin can register a clinic", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      expect(simulator.getLedger().clinics.member(clinicId(clinic))).toBe(true);
    });

    it("rejects a duplicate clinic ID", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      expect(() => simulator.addClinic(clinicId(clinic), mockProfile(clinic))).toThrow();
    });

    it("non-admin cannot register a clinic", () => {
      const stranger = randomUser();
      simulator.switchUser(stranger);
      expect(() => simulator.addClinic(clinicId(randomUser()), mockProfile())).toThrow("You are not an admin");
    });
  });

  // ── Vaccine management ─────────────────────────────────────────────────────

  describe("addVaccine / delVaccine", () => {
    it("admin can add a new vaccine", () => {
      const name = encodeBytes20("MMR");
      simulator.addVaccine(name);
      expect(simulator.getLedger().vaccines.member(name)).toBe(true);
    });

    it("rejects adding a duplicate vaccine", () => {
      expect(() => simulator.addVaccine(encodeBytes20("HepB"))).toThrow();
    });

    it("admin can remove a registered vaccine", () => {
      const name = encodeBytes20("HepB");
      simulator.delVaccine(name);
      expect(simulator.getLedger().vaccines.member(name)).toBe(false);
    });

    it("rejects removing a vaccine that is not registered", () => {
      expect(() => simulator.delVaccine(encodeBytes20("Unknown"))).toThrow();
    });

    it("non-admin cannot add a vaccine", () => {
      const stranger = randomUser();
      simulator.switchUser(stranger);
      expect(() => simulator.addVaccine(encodeBytes20("MMR"))).toThrow("You are not an admin");
    });
  });

  // ── Certificate issuer management ─────────────────────────────────────────

  describe("addCertificateIssuer", () => {
    it("admin can register an issuer and get back a non-empty ID", () => {
      const { pk } = generateKeyPair();
      const id = simulator.addCertificateIssuer({
        uri: "https://issuer.test",
        name: "Test Issuer",
        key: pk,
        verificationEndpoint: "https://issuer.test/verify",
      });
      expect(id).toBeInstanceOf(Uint8Array);
      expect(id.length).toBe(32);
      expect(simulator.getLedger().issuers.member(id)).toBe(true);
    });

    it("non-admin cannot register an issuer", () => {
      const { pk } = generateKeyPair();
      simulator.switchUser(randomUser());
      expect(() =>
        simulator.addCertificateIssuer({
          uri: "https://bad.test",
          name: "Bad Actor",
          key: pk,
          verificationEndpoint: "https://bad.test/verify",
        }),
      ).toThrow("You are not an admin");
    });

    it("two sequential calls return distinct issuer IDs", () => {
      const id1 = simulator.addCertificateIssuer({
        uri: "https://issuer-a.test",
        name: "Issuer A",
        key: generateKeyPair().pk,
        verificationEndpoint: "https://issuer-a.test/verify",
      });
      const id2 = simulator.addCertificateIssuer({
        uri: "https://issuer-b.test",
        name: "Issuer B",
        key: generateKeyPair().pk,
        verificationEndpoint: "https://issuer-b.test/verify",
      });
      expect(id1).not.toEqual(id2);
    });
  });

  // ── Proof request ──────────────────────────────────────────────────────────

  describe("requestVaccineProof", () => {
    it("registered clinic can create a proof request and gets back a request ID", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);

      const proofReqId = simulator.requestVaccineProof({
        vaccine: encodeBytes20("HepB"),
        personalId: encodeBytes20("PASS-001"),
        validUntil: randomTimestamp(),
      });

      expect(proofReqId).toBeInstanceOf(Uint8Array);
      expect(proofReqId.length).toBe(32);
      expect(simulator.getLedger().vaccineProofReqs.member(proofReqId)).toBe(true);
    });

    it("non-clinic cannot request a vaccine proof", () => {
      const stranger = randomUser();
      simulator.switchUser(stranger);
      expect(() =>
        simulator.requestVaccineProof({
          vaccine: encodeBytes20("HepB"),
          personalId: encodeBytes20("PASS-001"),
          validUntil: randomTimestamp(),
        }),
      ).toThrow("You are not a registered clinic");
    });

    it("two sequential calls return distinct request IDs", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);
      const id1 = simulator.requestVaccineProof({
        vaccine: encodeBytes20("HepB"),
        personalId: encodeBytes20("PASS-001"),
        validUntil: randomTimestamp(),
      });
      const id2 = simulator.requestVaccineProof({
        vaccine: encodeBytes20("PCV"),
        personalId: encodeBytes20("PASS-002"),
        validUntil: randomTimestamp(),
      });
      expect(id1).not.toEqual(id2);
    });
  });

  // ── Submit vaccine proof ───────────────────────────────────────────────────

  describe("submitVaccineProof", () => {
    it("submits a valid signed proof and records it on-chain", () => {
      // 1. Generate issuer key pair and register on-chain.
      const { sk: issuerSk, pk: issuerPk } = generateKeyPair();
      const issuerId = simulator.addCertificateIssuer({
        uri: "https://who.int",
        name: "World Health Organization",
        key: issuerPk,
        verificationEndpoint: "https://who.int/verify",
      });

      // 2. Register a clinic and have it create a proof request.
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);

      const vaccine = encodeBytes20("HepB");
      const personalId = encodeBytes20("PASSPORT-XYZ");
      const validUntil = randomTimestamp();

      const proofReqId = simulator.requestVaccineProof({
        vaccine,
        personalId,
        validUntil,
      });

      // 3. Switch to a patient, sign the certificate, store it in private state.
      const patient = randomUser();
      simulator.switchUser(patient);

      // expirationDate must be >= validUntil to pass the circuit's date assertion.
      const expirationDate = validUntil + 1000n;

      // The message signed off-chain must match what the circuit builds:
      //   [vaccine as Field, personalId as Field, expirationDate as Field, ownPublicKey().bytes as Field]
      // ownPublicKey() in the circuit resolves to fromHex(patient.pk).
      const signedProof = signVaxZkCertificate(
        issuerSk,
        issuerId,
        vaccine,
        personalId,
        expirationDate,
        fromHex(patient.pk),
      );
      simulator.setVaxZkProof(signedProof);

      // 4. Submit the proof — the circuit should accept the Schnorr signature.
      simulator.submitVaccineProof(proofReqId);

      // 5. Confirm the proof is now on-chain.
      expect(simulator.getLedger().vaccineProofs.member(proofReqId)).toBe(true);
    });

    it("rejects a proof for an unknown request ID", () => {
      const unknownId = randomBytes(32);
      expect(() => simulator.submitVaccineProof(unknownId)).toThrow();
    });

    it("rejects a duplicate proof submission for the same request", () => {
      // Setup: issuer + clinic + proof request + valid signed proof.
      const { sk: issuerSk, pk: issuerPk } = generateKeyPair();
      const issuerId = simulator.addCertificateIssuer({
        uri: "https://issuer.test",
        name: "Issuer",
        key: issuerPk,
        verificationEndpoint: "https://issuer.test/verify",
      });

      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);

      const vaccine = encodeBytes20("PCV");
      const personalId = encodeBytes20("ID-DUPE");
      const validUntil = randomTimestamp();
      const proofReqId = simulator.requestVaccineProof({ vaccine, personalId, validUntil });

      const patient = randomUser();
      simulator.switchUser(patient);
      const expirationDate = validUntil + 500n;
      simulator.setVaxZkProof(
        signVaxZkCertificate(issuerSk, issuerId, vaccine, personalId, expirationDate, fromHex(patient.pk)),
      );

      // First submission succeeds.
      simulator.submitVaccineProof(proofReqId);

      // Second submission for the same request must be rejected.
      expect(() => simulator.submitVaccineProof(proofReqId)).toThrow();
    });

    it("rejects a proof whose vaccine does not match the request", () => {
      const { sk: issuerSk, pk: issuerPk } = generateKeyPair();
      const issuerId = simulator.addCertificateIssuer({
        uri: "https://issuer.test",
        name: "Issuer",
        key: issuerPk,
        verificationEndpoint: "https://issuer.test/verify",
      });

      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);

      const validUntil = randomTimestamp();
      const proofReqId = simulator.requestVaccineProof({
        vaccine: encodeBytes20("HepB"),
        personalId: encodeBytes20("ID-789"),
        validUntil,
      });

      const patient = randomUser();
      simulator.switchUser(patient);
      const expirationDate = validUntil + 1000n;
      // Sign with the wrong vaccine type.
      simulator.setVaxZkProof(
        signVaxZkCertificate(
          issuerSk,
          issuerId,
          encodeBytes20("PCV"),
          encodeBytes20("ID-789"),
          expirationDate,
          fromHex(patient.pk),
        ),
      );

      expect(() => simulator.submitVaccineProof(proofReqId)).toThrow(
        "The submitted proof doesn't match the vaccine type",
      );
    });

    it("rejects a proof whose personalId does not match the request", () => {
      const { sk: issuerSk, pk: issuerPk } = generateKeyPair();
      const issuerId = simulator.addCertificateIssuer({
        uri: "https://issuer.test",
        name: "Issuer",
        key: issuerPk,
        verificationEndpoint: "https://issuer.test/verify",
      });

      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);

      const vaccine = encodeBytes20("HepB");
      const validUntil = randomTimestamp();
      const proofReqId = simulator.requestVaccineProof({
        vaccine,
        personalId: encodeBytes20("PASS-001"),
        validUntil,
      });

      const patient = randomUser();
      simulator.switchUser(patient);
      const expirationDate = validUntil + 1000n;
      simulator.setVaxZkProof(
        signVaxZkCertificate(
          issuerSk,
          issuerId,
          vaccine,
          encodeBytes20("PASS-999"),
          expirationDate,
          fromHex(patient.pk),
        ),
      );

      expect(() => simulator.submitVaccineProof(proofReqId)).toThrow(
        "The submitted proof doesn't match the passport or ID number",
      );
    });

    it("rejects a proof whose expirationDate is before validUntil", () => {
      const { sk: issuerSk, pk: issuerPk } = generateKeyPair();
      const issuerId = simulator.addCertificateIssuer({
        uri: "https://issuer.test",
        name: "Issuer",
        key: issuerPk,
        verificationEndpoint: "https://issuer.test/verify",
      });

      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);

      const vaccine = encodeBytes20("Tdap");
      const personalId = encodeBytes20("PASS-EXP");
      const validUntil = randomTimestamp();
      const proofReqId = simulator.requestVaccineProof({ vaccine, personalId, validUntil });

      const patient = randomUser();
      simulator.switchUser(patient);
      simulator.setVaxZkProof(
        signVaxZkCertificate(
          issuerSk,
          issuerId,
          vaccine,
          personalId,
          validUntil - 1n,
          fromHex(patient.pk),
        ),
      );

      expect(() => simulator.submitVaccineProof(proofReqId)).toThrow(
        "The submitted certificate proof doesn't comply with validity date",
      );
    });

    it("rejects a proof with a tampered Schnorr response", () => {
      const { sk: issuerSk, pk: issuerPk } = generateKeyPair();
      const issuerId = simulator.addCertificateIssuer({
        uri: "https://issuer.test",
        name: "Issuer",
        key: issuerPk,
        verificationEndpoint: "https://issuer.test/verify",
      });

      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);

      const vaccine = encodeBytes20("HepB");
      const personalId = encodeBytes20("PASS-TAMPER");
      const validUntil = randomTimestamp();
      const proofReqId = simulator.requestVaccineProof({ vaccine, personalId, validUntil });

      const patient = randomUser();
      simulator.switchUser(patient);
      const expirationDate = validUntil + 1000n;
      const signedProof = signVaxZkCertificate(
        issuerSk,
        issuerId,
        vaccine,
        personalId,
        expirationDate,
        fromHex(patient.pk),
      );
      simulator.setVaxZkProof({
        ...signedProof,
        issuerSignature: {
          ...signedProof.issuerSignature,
          response: signedProof.issuerSignature.response + 1n,
        },
      });

      expect(() => simulator.submitVaccineProof(proofReqId)).toThrow("Invalid attestation signature");
    });

    it("rejects a proof signed for a different patient's public key", () => {
      const { sk: issuerSk, pk: issuerPk } = generateKeyPair();
      const issuerId = simulator.addCertificateIssuer({
        uri: "https://issuer.test",
        name: "Issuer",
        key: issuerPk,
        verificationEndpoint: "https://issuer.test/verify",
      });

      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);

      const vaccine = encodeBytes20("HepB");
      const personalId = encodeBytes20("PASS-WRONGPK");
      const validUntil = randomTimestamp();
      const proofReqId = simulator.requestVaccineProof({ vaccine, personalId, validUntil });

      const patient = randomUser();
      const wrongPatient = randomUser();
      simulator.switchUser(patient);
      const expirationDate = validUntil + 1000n;
      simulator.setVaxZkProof(
        signVaxZkCertificate(
          issuerSk,
          issuerId,
          vaccine,
          personalId,
          expirationDate,
          fromHex(wrongPatient.pk),
        ),
      );

      expect(() => simulator.submitVaccineProof(proofReqId)).toThrow("Invalid attestation signature");
    });

    it("rejects a proof signed by an unregistered issuer", () => {
      // Issuer key pair exists but is NOT registered on-chain.
      const { sk: unknownSk } = generateKeyPair();
      const unknownIssuerId = randomBytes(32); // not in issuers map

      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(clinic);

      const vaccine = encodeBytes20("Tdap");
      const personalId = encodeBytes20("ID-UNKNOWN");
      const validUntil = randomTimestamp();
      const proofReqId = simulator.requestVaccineProof({ vaccine, personalId, validUntil });

      const patient = randomUser();
      simulator.switchUser(patient);
      simulator.setVaxZkProof(
        signVaxZkCertificate(
          unknownSk,
          unknownIssuerId,
          vaccine,
          personalId,
          validUntil + 1000n,
          fromHex(patient.pk),
        ),
      );

      expect(() => simulator.submitVaccineProof(proofReqId)).toThrow(
        "The vaccine proof issuer is not a registered/valid entity",
      );
    });
  });

  // ── Clinic revocation ──────────────────────────────────────────────────────

  describe("revokeClinic", () => {
    it("admin can revoke an existing clinic", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.revokeClinic(clinicId(clinic));
      expect(simulator.getLedger().clinics.member(clinicId(clinic))).toBe(false);
    });

    it("rejects revoking a clinic that is not registered", () => {
      expect(() => simulator.revokeClinic(randomBytes(32))).toThrow("Clinic ID is not in the clinics list");
    });

    it("non-admin cannot revoke a clinic", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.switchUser(randomUser());
      expect(() => simulator.revokeClinic(clinicId(clinic))).toThrow("You are not an admin");
    });
  });

  // ── revokeClinic and ownerClinics ─────────────────────────────────────────

  describe("revokeClinic and ownerClinics", () => {
    it("revokeClinic removes the owner from ownerClinics, so they can no longer request proofs", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic), mockProfile(clinic));
      simulator.revokeClinic(clinicId(clinic));
      expect(simulator.getLedger().clinics.member(clinicId(clinic))).toBe(false);
      expect(simulator.getLedger().ownerClinics.member(clinicId(clinic))).toBe(false);

      simulator.switchUser(clinic);
      expect(() =>
        simulator.requestVaccineProof({
          vaccine: encodeBytes20("HepB"),
          personalId: encodeBytes20("PASS-REVOKED"),
          validUntil: randomTimestamp(),
        })
      ).toThrow("You are not a registered clinic");
    });
  });

  // ── Admin invite management ────────────────────────────────────────────────

  describe("registerInviteAdmin", () => {
    it("admin can register an invite code and invite count increments", () => {
      const before = simulator.getLedger().inviteAdminHash.size();
      simulator.registerInvite(Role.admin, randomBytes(32));
      expect(simulator.getLedger().inviteAdminHash.size()).toBe(before + 1n);
    });

    it("non-admin cannot register an invite", () => {
      simulator.switchUser(randomUser());
      expect(() => simulator.registerInvite(Role.admin, randomBytes(32))).toThrow("You are not an admin");
    });

    it("registering the same invite code twice does not increase the invite count", () => {
      const inviteCode = randomBytes(32);
      simulator.registerInvite(Role.admin, inviteCode);
      const countAfterFirst = simulator.getLedger().inviteAdminHash.size();
      simulator.registerInvite(Role.admin, inviteCode);
      expect(simulator.getLedger().inviteAdminHash.size()).toBe(countAfterFirst);
    });
  });

  describe("acceptInviteAdmin", () => {
    it("user with a valid invite code becomes admin and invite is consumed", () => {
      const inviteCode = randomBytes(32);
      simulator.registerInvite(Role.admin, inviteCode);
      const adminsBefore = simulator.getLedger().admins.size();
      const invitesBefore = simulator.getLedger().inviteAdminHash.size();

      const newAdmin = randomUser();
      simulator.switchUser(newAdmin);
      simulator.acceptInvite(Role.admin, inviteCode);

      expect(simulator.getLedger().admins.size()).toBe(adminsBefore + 1n);
      expect(simulator.getLedger().inviteAdminHash.size()).toBe(invitesBefore - 1n);
    });

    it("rejects an invalid invite code", () => {
      simulator.switchUser(randomUser());
      expect(() => simulator.acceptInvite(Role.admin, randomBytes(32))).toThrow("Invalid admin invite code");
    });

    it("rejects if the user is already an admin", () => {
      const inviteCode = randomBytes(32);
      simulator.registerInvite(Role.admin, inviteCode);
      expect(() => simulator.acceptInvite(Role.admin, inviteCode)).toThrow("user is already an admin");
    });
  });

  describe("acceptInviteClinic", () => {
    it("user with a valid clinic invite code becomes clinic owner and invite is consumed", () => {
      const inviteCode = randomBytes(32);
      simulator.registerInvite(Role.clinic, inviteCode);
      const clinicsBefore = simulator.getLedger().ownerClinics.size();
      const invitesBefore = simulator.getLedger().inviteClinicHash.size();

      const newClinicOwner = randomUser();
      simulator.switchUser(newClinicOwner);
      simulator.acceptInvite(Role.clinic, inviteCode);

      expect(simulator.getLedger().ownerClinics.size()).toBe(clinicsBefore + 1n);
      expect(simulator.getLedger().inviteClinicHash.size()).toBe(invitesBefore - 1n);
    });

    it("rejects an invalid clinic invite code", () => {
      simulator.switchUser(randomUser());
      expect(() => simulator.acceptInvite(Role.clinic, randomBytes(32))).toThrow("Invalid clinic invite code");
    });

    it("rejects if the user is already a clinic owner", () => {
      const inviteCode = randomBytes(32);
      simulator.registerInvite(Role.clinic, inviteCode);
      
      const user = randomUser();
      simulator.switchUser(user);
      simulator.acceptInvite(Role.clinic, inviteCode); // success
      
      const anotherInvite = randomBytes(32);
      simulator.switchUser(admin);
      simulator.registerInvite(Role.clinic, anotherInvite);
      
      simulator.switchUser(user);
      expect(() => simulator.acceptInvite(Role.clinic, anotherInvite)).toThrow("user is already a clinic");
    });
  });

  describe("revokeAdmin", () => {
    it("admin can revoke themselves and admin count decrements", () => {
      const before = simulator.getLedger().admins.size();
      simulator.revokeAdmin();
      expect(simulator.getLedger().admins.size()).toBe(before - 1n);
    });

    it("non-admin cannot revoke", () => {
      simulator.switchUser(randomUser());
      expect(() => simulator.revokeAdmin()).toThrow("You are not an admin");
    });
  });

  // ── Multi-admin ────────────────────────────────────────────────────────────

  describe("multi-admin", () => {
    it("admin2 can perform admin actions after accepting admin1's invite", () => {
      const inviteCode = randomBytes(32);
      simulator.registerInvite(Role.admin, inviteCode);

      const admin2 = randomUser();
      simulator.switchUser(admin2);
      simulator.acceptInvite(Role.admin, inviteCode);

      const vaccineName = encodeBytes20("MMR");
      simulator.addVaccine(vaccineName);
      expect(simulator.getLedger().vaccines.member(vaccineName)).toBe(true);
    });

    it("admin cannot perform admin actions after self-revoking", () => {
      const inviteCode = randomBytes(32);
      simulator.registerInvite(Role.admin, inviteCode);

      const admin2 = randomUser();
      simulator.switchUser(admin2);
      simulator.acceptInvite(Role.admin, inviteCode);

      simulator.revokeAdmin();

      expect(() => simulator.addVaccine(encodeBytes20("MMR"))).toThrow("You are not an admin");
    });
  });

  // ── Clinic invite management ───────────────────────────────────────────────

  describe("registerInviteClinic", () => {
    it("registered clinic can register an invite code and invite count increments", () => {
      const before = simulator.getLedger().inviteClinicHash.size();
      simulator.registerInvite(Role.clinic, randomBytes(32));
      expect(simulator.getLedger().inviteClinicHash.size()).toBe(before + 1n);
    });

    it("non-clinic cannot register a clinic invite", () => {
      simulator.switchUser(randomUser());
      expect(() => simulator.registerInvite(Role.clinic, randomBytes(32))).toThrow("You are not an admin");
    });
  });
});

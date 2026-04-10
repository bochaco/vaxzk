import { describe, it, expect, beforeEach } from "vitest";
import {
  setNetworkId,
  type NetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { fromHex } from "@midnight-ntwrk/midnight-js-utils";
import { CompactTypeJubjubPoint, type JubjubPoint } from "@midnight-ntwrk/compact-runtime";
import { pureCircuits } from "../../managed/contract/index.js";
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
    it("registers the deployer as the first admin", () => {
      expect(simulator.getLedger().admins.member(adminId(admin))).toBe(true);
    });

    it("starts with exactly one admin", () => {
      expect(simulator.getLedger().admins.size()).toBe(1n);
    });

    it("starts with the three built-in vaccines (HepB, PCV, Tdap)", () => {
      const l = simulator.getLedger();
      expect(l.vaccines.member(encodeBytes20("HepB"))).toBe(true);
      expect(l.vaccines.member(encodeBytes20("PCV"))).toBe(true);
      expect(l.vaccines.member(encodeBytes20("Tdap"))).toBe(true);
      expect(l.vaccines.size()).toBe(3n);
    });

    it("starts with empty clinics and issuers maps", () => {
      const l = simulator.getLedger();
      expect(l.clinics.isEmpty()).toBe(true);
      expect(l.issuers.isEmpty()).toBe(true);
    });

    it("starts with empty proof request and proof maps", () => {
      const l = simulator.getLedger();
      expect(l.vaccineProofReqs.isEmpty()).toBe(true);
      expect(l.vaccineProofs.isEmpty()).toBe(true);
    });
  });

  // ── Admin management ───────────────────────────────────────────────────────

  describe("addAdmin", () => {
    it("admin can add another admin", () => {
      const newAdmin = randomUser();
      simulator.addAdmin(adminId(newAdmin));
      expect(simulator.getLedger().admins.member(adminId(newAdmin))).toBe(true);
      expect(simulator.getLedger().admins.size()).toBe(2n);
    });

    it("rejects a duplicate admin ID", () => {
      expect(() => simulator.addAdmin(adminId(admin))).toThrow();
    });

    it("non-admin cannot add an admin", () => {
      const stranger = randomUser();
      simulator.switchUser(stranger);
      expect(() => simulator.addAdmin(adminId(randomUser()))).toThrow("You are not an admin");
    });
  });

  // ── Clinic management ──────────────────────────────────────────────────────

  describe("addClinic", () => {
    it("admin can register a clinic", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic));
      expect(simulator.getLedger().clinics.member(clinicId(clinic))).toBe(true);
    });

    it("rejects a duplicate clinic ID", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic));
      expect(() => simulator.addClinic(clinicId(clinic))).toThrow();
    });

    it("non-admin cannot register a clinic", () => {
      const stranger = randomUser();
      simulator.switchUser(stranger);
      expect(() => simulator.addClinic(clinicId(randomUser()))).toThrow("You are not an admin");
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
  });

  // ── Proof request ──────────────────────────────────────────────────────────

  describe("requestVaccineProof", () => {
    it("registered clinic can create a proof request and gets back a request ID", () => {
      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic));
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
      simulator.addClinic(clinicId(clinic));
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
      simulator.addClinic(clinicId(clinic));
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
      simulator.addClinic(clinicId(clinic));
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

    it("rejects a proof signed by an unregistered issuer", () => {
      // Issuer key pair exists but is NOT registered on-chain.
      const { sk: unknownSk } = generateKeyPair();
      const unknownIssuerId = randomBytes(32); // not in issuers map

      const clinic = randomUser();
      simulator.addClinic(clinicId(clinic));
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
});

import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  emptyZswapLocalState,
  type ContractAddress,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
  type CertIssuerInfo,
  type ClinicProfile,
  type VaccineProofRequest,
  type VaxZkProof,
} from "../../managed/contract/index.js";
import {
  type VaxZkPrivateState,
  witnesses,
  createVaxZkPrivateState,
} from "../witnesses.js";

export type TestUser = {
  /** Secret key used by the localSk() witness (clinic auth). */
  secretKey: Uint8Array;
  /** ZSwap coin public key hex (used by ownPublicKey() / admin auth). */
  pk: string;
};

/**
 * Testbed for exercising the VaxZk contract circuits without a live network.
 * Each method wraps an impure circuit call and keeps the CircuitContext in sync.
 */
export class VaxZkSimulator {
  readonly contract: Contract<VaxZkPrivateState>;
  readonly contractAddress: ContractAddress;
  circuitContext: CircuitContext<VaxZkPrivateState>;

  constructor(deployer: TestUser) {
    this.contractAddress = sampleContractAddress();
    this.contract = new Contract<VaxZkPrivateState>(witnesses);

    const { currentPrivateState, currentContractState, currentZswapLocalState } =
      this.contract.initialState(
        createConstructorContext(
          createVaxZkPrivateState(deployer.secretKey),
          deployer.pk,
        ),
      );

    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        this.contractAddress,
      ),
    };
  }

  /**
   * Switch to a different user. Updates both the ZSwap local state (which
   * determines ownPublicKey() / admin checks) and the private state secret key
   * (which determines localSk() / clinic checks).
   */
  public switchUser(user: TestUser): void {
    this.circuitContext.currentZswapLocalState = emptyZswapLocalState(user.pk);
    this.circuitContext.currentPrivateState = {
      ...this.circuitContext.currentPrivateState,
      secretKey: user.secretKey,
    };
  }

  /**
   * Update the VaxZkProof stored in the current private state. This is what
   * the getAttestedCertProofWitness witness reads when submitVaccineProof runs.
   */
  public setVaxZkProof(proof: VaxZkProof): void {
    this.circuitContext.currentPrivateState = {
      ...this.circuitContext.currentPrivateState,
      vaxZkProof: proof,
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public addAdmin(adminId: Uint8Array): [] {
    const res = this.contract.impureCircuits.addAdmin(this.circuitContext, adminId);
    this.circuitContext = res.context;
    return res.result;
  }

  public revokeAdmin(adminId: Uint8Array): [] {
    const res = this.contract.impureCircuits.revokeAdmin(this.circuitContext, adminId);
    this.circuitContext = res.context;
    return res.result;
  }

  public addClinic(clinicId: Uint8Array, clinicProfile: ClinicProfile): [] {
    const res = this.contract.impureCircuits.addClinic(this.circuitContext, clinicId, clinicProfile);
    this.circuitContext = res.context;
    return res.result;
  }

  public revokeClinic(clinicId: Uint8Array): [] {
    const res = this.contract.impureCircuits.revokeClinic(this.circuitContext, clinicId);
    this.circuitContext = res.context;
    return res.result;
  }

  public addCertificateIssuer(issuerInfo: CertIssuerInfo): Uint8Array {
    const res = this.contract.impureCircuits.addCertificateIssuer(this.circuitContext, issuerInfo);
    this.circuitContext = res.context;
    return res.result;
  }

  public addVaccine(name: Uint8Array): [] {
    const res = this.contract.impureCircuits.addVaccine(this.circuitContext, name);
    this.circuitContext = res.context;
    return res.result;
  }

  public delVaccine(name: Uint8Array): [] {
    const res = this.contract.impureCircuits.delVaccine(this.circuitContext, name);
    this.circuitContext = res.context;
    return res.result;
  }

  public requestVaccineProof(req: VaccineProofRequest): Uint8Array {
    const res = this.contract.impureCircuits.requestVaccineProof(this.circuitContext, req);
    this.circuitContext = res.context;
    return res.result;
  }

  public submitVaccineProof(proofReqId: Uint8Array): [] {
    const res = this.contract.impureCircuits.submitVaccineProof(this.circuitContext, proofReqId);
    this.circuitContext = res.context;
    return res.result;
  }
}

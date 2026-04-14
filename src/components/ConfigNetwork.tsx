export const CONTRACTID = "";
export const FIRSTCONTRACTID = "";
export const networkId = "preprod";

export const CONTRACT_STORAGE_KEY = "vaxzk_contract_";

/** Returns the active contract address: localStorage first, then falls back to empty. */
export function getContractId(): string {
  return localStorage.getItem(CONTRACT_STORAGE_KEY) ?? CONTRACTID;
}

/** Persists a newly deployed contract address so all views pick it up on reload. */
export function saveContractId(address: string): void {
  localStorage.setItem(CONTRACT_STORAGE_KEY, address);
}

/** Clears the stored contract address (useful when re-deploying). */
export function clearContractId(): void {
  localStorage.removeItem(CONTRACT_STORAGE_KEY);
}
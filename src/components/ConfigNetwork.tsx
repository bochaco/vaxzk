export const networkId = import.meta.env.VITE_NETWORK_ID ?? "preprod";
export const urlApp = "https://preprod.vaxzk.com.br";

const STORAGE_KEY = "vaxzk_contract_id";
const DEFAULT_CONTRACT_ID = "";

export function getContractId(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_CONTRACT_ID;
}

export function setContractId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}

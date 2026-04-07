import { deployContract } from '@midnight-ntwrk/midnight-js/contracts';
import { Contract } from './contracts/vaxzk/contract/index.js';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
// In a full Midnight DApp, indexer URI and node URI are typically fetched from connectedApi.getConfiguration()
// and passed into IndexerClient and NodeClient to construct publicDataProvider.

export async function deployVaxZkContract(connectedApi: ConnectedAPI) {
  // We mock the Midnight providers setup that would typically exist globally in the DApp.
  // Midnight JS requires a WalletProvider compliant object, which translates ConnectedAPI DApp Connector
  const walletProvider = connectedApi as any; 
  
  const providers = {
    walletProvider,
    // publicDataProvider, privateStateProvider, zkConfigProvider
  } as any; 

  // Note: vaxzk.compact's constructor takes no arguments, so we deploy directly.
  return deployContract<Contract<undefined>>(providers, {
      privateStateId: 'vaxzk-' + Math.random().toString(36).substring(7),
      initialPrivateState: undefined
  } as any);
}

// ================================
// contract.js — Soroban contract interaction layer
// Wraps the Xpens contract's add/delete/clear/get_expenses/get_summary
// calls behind a small, testable API used by the React app.
// ================================

import {
  Contract,
  rpc,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  Address,
} from '@stellar/stellar-sdk';
import { signTransaction, NETWORK_PASSPHRASE } from './wallet';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID;
const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org';

export const server = new rpc.Server(RPC_URL, { allowHttp: false });

function getContract() {
  if (!CONTRACT_ID || CONTRACT_ID.startsWith('CA...')) {
    throw new Error(
      'Contract not configured. Set VITE_CONTRACT_ID in your .env file after deploying the contract.'
    );
  }
  return new Contract(CONTRACT_ID);
}

/**
 * Builds, simulates, and (if needed) signs + submits a contract call.
 * Read-only calls resolve after simulation. Mutating calls resolve once
 * the transaction is confirmed on-ledger.
 */
async function invoke(method, args, { address, readOnly = false } = {}) {
  const contract = getContract();
  const source = await server.getAccount(address);

  let tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  if (readOnly) {
    return scValToNative(sim.result.retval);
  }

 const prepared = rpc.assembleTransaction(tx, sim).build();
  const signedXdr = await signTransaction(prepared.toXDR(), {
    address,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResult = await server.sendTransaction(signedTx);

  if (sendResult.status === 'ERROR') {
    throw new Error(`Transaction submission failed: ${sendResult.errorResult}`);
  }

  // Poll until the transaction is confirmed.
  let response = await server.getTransaction(sendResult.hash);
  let attempts = 0;
  while (response.status === 'NOT_FOUND' && attempts < 15) {
    await new Promise((r) => setTimeout(r, 1500));
    response = await server.getTransaction(sendResult.hash);
    attempts += 1;
  }

  if (response.status !== 'SUCCESS') {
    throw new Error(`Transaction did not succeed: ${response.status}`);
  }

  return {
    hash: sendResult.hash,
    returnValue: response.returnValue ? scValToNative(response.returnValue) : undefined,
  };
}

const addr = (a) => nativeToScVal(Address.fromString(a), { type: 'address' });
const str = (s) => nativeToScVal(s, { type: 'string' });
const i128 = (n) => nativeToScVal(n, { type: 'i128' });
const u64 = (n) => nativeToScVal(n, { type: 'u64' });

export async function addExpense(address, { desc, amount, category, date }) {
  return invoke(
    'add_expense',
    [addr(address), str(desc), i128(amount), str(category), u64(date)],
    { address }
  );
}

export async function deleteExpense(address, id) {
  return invoke('delete_expense', [addr(address), u64(id)], { address });
}

export async function clearExpenses(address) {
  return invoke('clear_expenses', [addr(address)], { address });
}

export async function getExpenses(address) {
  const result = await invoke('get_expenses', [addr(address)], {
    address,
    readOnly: true,
  });
  return result || [];
}

export async function getSummary(address) {
  return invoke('get_summary', [addr(address)], { address, readOnly: true });
}

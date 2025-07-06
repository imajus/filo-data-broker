import { decryptToString } from '@lit-protocol/encryption';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { LIT_ABILITY, LIT_NETWORK } from '@lit-protocol/constants';
import {
  createSiweMessage,
  generateAuthSig,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';
import { getWallet } from './signer.js';

const CHAIN = 'filecoinCalibrationTestnet';

const makeAccessControlConditions = (address) => [
  {
    chain: CHAIN,
    contractAddress: address,
    standardContractType: 'ERC721',
    method: 'balanceOf',
    parameters: [':userAddress'],
    returnValueTest: {
      comparator: '>',
      value: '0',
    },
  },
];

async function getSessionSigs(
  lit,
  wallet,
  capacityDelegationAuthSig = undefined
) {
  const sessionSigs = await lit.getSessionSigs({
    chain: CHAIN,
    expiration: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    resourceAbilityRequests: [
      {
        resource: new LitAccessControlConditionResource('*'),
        ability: LIT_ABILITY.AccessControlConditionDecryption,
      },
    ],
    authNeededCallback: async ({
      uri,
      expiration,
      resourceAbilityRequests,
    }) => {
      const toSign = await createSiweMessage({
        uri,
        expiration,
        resources: resourceAbilityRequests,
        walletAddress: wallet.address,
        nonce: await lit.getLatestBlockhash(),
        litNodeClient: lit,
      });
      const authSig = await generateAuthSig({
        signer: wallet,
        toSign,
      });
      return authSig;
    },
    capacityDelegationAuthSig,
  });
  return sessionSigs;
}

export async function decryptNFTGatedData(
  address,
  ciphertext,
  dataToEncryptHash
) {
  const lit = new LitNodeClientNodeJs({ litNetwork: LIT_NETWORK.DatilDev });
  await lit.connect();
  try {
    const sessionSigs = await getSessionSigs(lit, getWallet());
    const decrypted = await decryptToString(
      {
        accessControlConditions: makeAccessControlConditions(address),
        chain: CHAIN,
        ciphertext,
        dataToEncryptHash,
        sessionSigs,
      },
      lit
    );
    return decrypted;
  } finally {
    await lit.disconnect();
  }
}

import { encryptString } from '@lit-protocol/encryption';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { LIT_NETWORK } from '@lit-protocol/constants';

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

async function getLit() {
  const lit = new LitNodeClientNodeJs({
    litNetwork: LIT_NETWORK.DatilDev,
    debug: false,
  });
  await lit.connect();
  return lit;
}

export async function encryptDataWithNFTGatedAccess(address, plainText) {
  const lit = await getLit();
  try {
    const accessControlConditions = makeAccessControlConditions(address);
    const { ciphertext, dataToEncryptHash } = await encryptString(
      { accessControlConditions, dataToEncrypt: plainText },
      lit
    );
    return { ciphertext, dataToEncryptHash };
  } finally {
    await lit.disconnect();
  }
}

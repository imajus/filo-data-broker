import lighthouse from '@lighthouse-web3/sdk';
import kavach from '@lighthouse-web3/kavach';
import { parse } from 'csv-parse';

/**
 * Get the authentication message for a signer address
 * @param {string} signerAddress - The address of the signer
 * @returns {Promise<string>} - The authentication message
 */
export const getAuthMessage = async (signerAddress) => {
  const { message, error } = await kavach.getAuthMessage(signerAddress);
  if (error) {
    throw new Error(`Failed to get authentication message: ${error}`);
  }
  return message;
};

/**
 * Load a public dataset from Filecoin into memory
 * @param {string} cid - The CID of the dataset
 * @returns {Promise<Array>} - Array of data objects with proper field names
 */
export async function fetchPublicDataset(cid) {
  // Construct the IPFS gateway URL
  const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;
  // Make the HTTP GET request
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const body = await response.arrayBuffer();
  // Parse CSV
  return new Promise((resolve, reject) => {
    parse(
      Buffer.from(body),
      {
        columns: true, // Use first row as column headers
        skip_empty_lines: false,
        trim: true,
      },
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
}

/**
 * Load a dataset from Filecoin into memory
 * @param {string} cid - The CID of the dataset
 * @param {string} signerAddress - The address of the signer
 * @param {string} signedMessage - The signed authentication message
 * @returns {Promise<Array>} - Array of data objects with proper field names
 */
export async function fetchPrivateDataset(cid, signerAddress, signedMessage) {
  const encryptionKey = await lighthouse
    .fetchEncryptionKey(cid, signerAddress, signedMessage)
    .catch((err) => {
      // 🤷‍♂️
      if (Array.isArray(err.message)) {
        // WTF???
        const msgs = err.message.map(({ message }) => message.message);
        if (msgs.includes('Access Denied')) {
          throw new Error(
            'You are not authorized to access this dataset. Please purchase the dataset first to be able to query it.'
          );
        }
        throw new Error(`Encryption key fetch failed: ${msgs.join('; ')}`);
      } else if (typeof err.message === 'object') {
        // 🤦‍♂️
        throw new Error(`Encryption key fetch failed: ${err.message.message}`);
      } else if (
        err.message &&
        /^0x[a-fA-F0-9]{40} === 0x[a-fA-F0-9]{40}$/.test(err.message.trim())
      ) {
        throw new Error(
          'Your authentication message is expired. Please refresh and sign it again.'
        );
      }
      throw new Error(err.message ?? 'Unknown error');
    });
  const decrypted = await lighthouse.decryptFile(
    cid,
    encryptionKey.data.key,
    'text/csv'
  );
  // Parse CSV
  return new Promise((resolve, reject) => {
    parse(
      Buffer.from(decrypted),
      {
        columns: true, // Use first row as column headers
        skip_empty_lines: false,
        trim: true,
      },
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
}

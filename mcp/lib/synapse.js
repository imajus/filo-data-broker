import { ethers } from 'ethers';
import { Synapse } from '@filoz/synapse-sdk';
import { parse } from 'csv-parse';
import { getProvider } from './signer.js';

async function getSynapse(address) {
  return Synapse.create({
    signer: new ethers.VoidSigner(address, getProvider()),
    withCDN: true,
    pandoraAddress: '0x485da5B22E524F292108F485E5c56a6db6572547',
  });
}

async function getStorage(address) {
  const synapse = await getSynapse(address);
  return synapse.createStorage({ withCDN: true });
}

/**
 * Load a public dataset from Filecoin into memory
 * @param {string} address - The address of the dataset owner
 * @param {string} cid - The CID of the dataset
 * @returns {Promise<Array>} - Array of data objects with proper field names
 */
export async function fetchPublicDataset(address, cid) {
  const storage = await getStorage(address);
  const data = await storage.providerDownload(cid);
  // Parse CSV
  return new Promise((resolve, reject) => {
    parse(
      Buffer.from(data),
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
 * Load a private dataset from Filecoin into memory
 * @param {string} address - The address of the dataset owner
 * @param {string} cid - The CID of the data to fetch
 * @returns {Promise<any>} - The decrypted data
 */
export async function fetchPrivateDataset(address, cid) {
  //TODO: Implement decryption
  return fetchPublicDataset(address, cid);
}

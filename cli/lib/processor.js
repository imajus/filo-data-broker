import { ethers } from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
import kavach from '@lighthouse-web3/kavach';

/**
 * Data Processor class for handling data uploading
 */
export class Processor {
  /**
   * @param {string} apiKey - The API key for the Lighthouse API
   * @param {string} privateKey - The private key for the Ethereum account
   */
  constructor(apiKey, privateKey) {
    this.apiKey = apiKey;
    this.privateKey = privateKey;
    this.privateColumns = [];
  }

  /**
   * Set which columns contain private data
   * @param {Array} privateColumns - Array of column names that contain private data
   */
  setPrivateColumns(privateColumns) {
    this.privateColumns = privateColumns;
  }

  getSigner() {
    const signer = new ethers.Wallet(this.privateKey);
    return signer;
  }

  /**
   * Sign the authentication message
   * @returns {Promise<string>} - The JWT token
   */
  async signAuthMessage() {
    const signer = this.getSigner();
    const authMessage = await kavach.getAuthMessage(signer.address);
    const signedMessage = await signer.signMessage(authMessage.message);
    const { JWT, error } = await kavach.getJWT(signer.address, signedMessage);
    if (error) {
      throw new Error(error);
    }
    return JWT;
  }

  /**
   * Process a single CSV record
   * @param {Object} record - The row data object with column names as keys
   */
  async process(record) {
    // Separate private and public data
    const privateData = {};
    const publicData = {};
    // Process each column in the row
    Object.keys(record).forEach((columnName) => {
      const cellValue = record[columnName];
      if (this.privateColumns.includes(columnName)) {
        // Handle private data
        privateData[columnName] = cellValue;
      } else {
        // Handle public data
        publicData[columnName] = cellValue;
      }
    });
    const response = await lighthouse.textUploadEncrypted(
      JSON.stringify(privateData),
      this.apiKey,
      this.getSigner().address,
      await this.signAuthMessage()
    );
    console.log(response);
  }
}

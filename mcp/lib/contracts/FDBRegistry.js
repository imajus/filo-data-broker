import { ethers } from 'ethers';
import FDBRegistryData from './FDBRegistry.json' assert { type: 'json' };
import { getSigner } from '../signer.js';
import { ERC20Token } from './ERC20Token.js';

export class FDBRegistry {
  static instance = null;
  /** @type {ERC20Token} */
  #token = null;

  constructor() {
    this.contract = new ethers.Contract(
      FDBRegistryData.address,
      FDBRegistryData.abi,
      getSigner()
    );
  }

  /** @returns {FDBRegistry} */
  static getInstance() {
    if (!this.instance) {
      this.instance = new FDBRegistry();
    }
    return this.instance;
  }

  /**
   * Get the payment token instance
   * @returns {Promise<ERC20Token>} The payment token instance
   */
  async getPaymentToken() {
    if (!this.#token) {
      const address = await this.contract.getPaymentToken();
      this.#token = new ERC20Token(address);
    }
    return this.#token;
  }

  async listDatasets() {
    const collections = await this.contract.getActiveCollections();
    const datasets = Promise.all(
      collections.map(async (address) => {
        const info = await this.contract.getCollectionInfo(address);
        return {
          address: info.nftContract,
          owner: info.owner,
          name: info.name,
          symbol: info.symbol,
          description: info.description,
          price: info.price,
          publicColumns: info.publicColumns,
          privateColumns: info.privateColumns,
          publicCid: info.publicCid,
          privateCid: info.privateCid,
          createdAt: info.createdAt.toString(),
        };
      })
    );
    return datasets;
  }

  async getDatasetMetadata(address) {
    const info = await this.contract.getCollectionInfo(address);
    return {
      address: info.nftContract,
      owner: info.owner,
      name: info.name,
      symbol: info.symbol,
      description: info.description,
      price: info.price,
      publicColumns: info.publicColumns,
      privateColumns: info.privateColumns,
      publicCid: info.publicCid,
      privateCid: info.privateCid,
    };
  }

  /**
   * Purchase a dataset
   * @param {string} address - NFT address / Dataset ID
   * @param {BigInt} amount - Amount in USDFC to deposit
   */
  async purchase(address, amount) {
    const hasNFT = await this.contract.hasNFT(address);
    if (!hasNFT) {
      const token = await this.getPaymentToken();
      const balance = await token.balance();
      if (balance < amount) {
        const balanceStr = ethers.formatUnits(balance.toString(), 18);
        const amountStr = ethers.formatUnits(amount.toString(), 18);
        throw new Error(`Insufficient balance: ${balanceStr} < ${amountStr}`);
      }
      await token.approve(await this.contract.getAddress(), amount);
      const tx = await this.contract.purchase(address);
      await tx.wait();
    }
  }
}

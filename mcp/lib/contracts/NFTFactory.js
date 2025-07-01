import { ethers } from 'ethers';
import NFTFactoryData from './NFTFactory.json' with { type: 'json' };
import { getSigner } from '../signer.js';

export class NFTFactory {
  static instance = null;

  constructor() {
    const signer = getSigner();
    this.contract = new ethers.Contract(NFTFactoryData.address, NFTFactoryData.abi, signer);
  }

  /** @returns {NFTFactory} */
  static getInstance() {
    if (!this.instance) {
      this.instance = new NFTFactory();
    }
    return this.instance;
  }

  async listDatasets() {
    const collections = await this.contract.getActiveCollections();
    const datasets = Promise.all(collections.map(async address => {
      const info = await this.contract.getCollectionInfo(address);
      return {
        address: info.nftContract,
        owner: info.owner,
        name: info.name,
        symbol: info.symbol,
        description: info.description,
        price: Number(ethers.formatEther(info.price)),
        publicColumns: info.publicColumns,
        privateColumns: info.privateColumns,
        publicCid: info.publicCid,
        privateCid: info.privateCid,
        createdAt: info.createdAt.toString(),
      };
    }));
    return datasets;
  }

  async getDatasetMetadata(address) {
    const info = await this.contract.getCollectionInfo(address);
    return {
      address: info.nftContract,
      name: info.name,
      symbol: info.symbol,
      description: info.description,
      price: Number(ethers.formatEther(info.price)),
      publicColumns: info.publicColumns,
      privateColumns: info.privateColumns,
      publicCid: info.publicCid,
      privateCid: info.privateCid,
    };
  }

  /**
   * Purchase a dataset
   * @param {string} address
   * @param {number} price
   */
  async purchase(address, price) {
    const hasNFT = await this.contract.hasNFT(address);
    if (!hasNFT) {
      const tx = await this.contract.purchase(address, {
        value: ethers.parseEther(price.toString()),
      });
      await tx.wait();
    }
  }
}


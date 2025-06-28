import { ethers } from 'ethers';
import NFTFactoryData from './NFTFactory.json' with { type: 'json' };
import { getSigner } from '../signer.js';

//FIXME: This limit (16hrs) is too restrictive
export async function getFromBlock() {
  const provider = getSigner().provider;
  const latestBlock = await provider.getBlockNumber();
  const blocksPerHour = Math.floor(3600 / 35); // 35s per block
  const blocks16h = blocksPerHour * 16;
  const fromBlock = Math.max(0, latestBlock - blocks16h);
  return fromBlock;
}

export class NFTFactory {
  static instance = null;

  constructor() {
    const provider = getSigner().provider;
    this.contract = new ethers.Contract(NFTFactoryData.address, NFTFactoryData.abi, provider);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new NFTFactory();
    }
    return this.instance;
  }
  
  async listDatasets() {
    const collections = await this.contract.getActiveCollections();
    const datasets = Promise.all(collections.map(async address => {
      const metadata = await this.contract.getCollectionInfo(address);
      return {
        address: metadata.nftContract,
        owner: metadata.owner,
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        publicColumns: metadata.publicColumns,
        privateColumns: metadata.privateColumns,
        createdAt: metadata.createdAt.toString(),
      };
    }));
    return datasets;
  }

  async getDatasetMetadata(address) {
    const info = await this.contract.getCollectionInfo(address);
    const cid = await this.contract.getCollectionCid(address);
    return {
      address: info.nftContract,
      name: info.name,
      symbol: info.symbol,
      description: info.description,
      publicColumns: info.publicColumns,
      privateColumns: info.privateColumns,
      cid,
    };
  }
}


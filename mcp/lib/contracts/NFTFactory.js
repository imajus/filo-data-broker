import { ethers } from 'ethers';
import NFTFactoryData from './NFTFactory.json' with { type: 'json' };

const RPC_URL = `https://api.calibration.node.glif.io/rpc/v1`;

function getProvider() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return provider;
}

export class NFTFactory {
  static instance = null;

  constructor() {
    const provider = getProvider();
    this.contract = new ethers.Contract(NFTFactoryData.address, NFTFactoryData.abi, provider);
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
      const metadata = await this.contract.getCollectionInfo(address);
      return {
        address: metadata.nftContract,
        owner: metadata.owner,
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        publicColumns: metadata.publicColumns,
        privateColumns: metadata.privateColumns,
        price: Number(ethers.formatEther(metadata.price)),
        createdAt: metadata.createdAt.toString(),
      };
    }));
    return datasets;
  }

  async getDatasetMetadata(address) {
    const metadata = await this.contract.getCollectionInfo(address);
    return {
      address: metadata.nftContract,
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      publicColumns: metadata.publicColumns,
      privateColumns: metadata.privateColumns,
      price: Number(ethers.formatEther(metadata.price)),
      publicCid: metadata.publicCid,
      privateCid: metadata.privateCid,
    };
  }

  async hasDatasetAccess(address, sender) {
    const hasNFT = await this.contract.hasNFT(address, { from: sender });
    return hasNFT;
  }

  async preparePurchase(address, sender) {
    const info = await this.contract.getCollectionInfo(address);
    const tx = await this.contract.purchase.populateTransaction(address, {
      from: sender,
      value: info.price,
    });
    return tx;
  }
}


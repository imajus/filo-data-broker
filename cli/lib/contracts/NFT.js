import { ethers } from 'ethers';
import NFTFactoryData from './NFTFactory.json' with { type: 'json' };

const RPC_URL = 'https://api.calibration.node.glif.io/rpc/v1';

export class NFT {

  /**
   * @param {string | null} address - The address of the NFT collection
   * @param {string} privateKey - The private key for the Ethereum account
   */
  constructor(address, privateKey) {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(privateKey, provider);
    this.factory = new ethers.Contract(NFTFactoryData.address, NFTFactoryData.abi, signer);
    this.address = address;
  }
  
  /**
   * Create a new NFT collection
   * @param {string} name - The name of the collection
   * @param {string} description - The description of the collection
   * @param {string} columns - The columns of the collection (comma separated)
   * @returns {Promise<TransactionResponse>} - The transaction response
   */
  async createCollection(name, description, columns) {
    const tx = await this.factory.createCollection(name, 'FDB', description, columns);
    const receipt = await tx.wait();
    const event = receipt.logs.find(e => e.eventName === 'CollectionCreated');
    this.address = event.args.nftContract;
  }

  /**
   * Link a dataset to the NFT collection
   * @param {string} cid - The CID of the dataset
   * @returns {Promise<void>}
   */
  async linkDataset(cid) {
    const tx = await this.factory.setCollectionCid(this.address, cid);
    await tx.wait();
  }

  /**
   * Toggle the status of the NFT collection
   * @param {string} address - The address of the NFT collection
   * @returns {Promise<void>}
   */
  async toggleCollectionStatus() {
    const tx = await this.factory.toggleCollectionStatus(this.address);
    await tx.wait();
  }
}


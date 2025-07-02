import { ethers } from 'ethers';
import NFTFactoryData from './NFTFactory.json' with { type: 'json' };

export class NFT {
  /**
   * @param {string | null} address - The address of the NFT collection
   * @param {ethers.Signer} signer - The signer for the Ethereum account
   */
  constructor(address, signer) {
    this.factory = new ethers.Contract(
      NFTFactoryData.address,
      NFTFactoryData.abi,
      signer
    );
    this.address = address;
  }

  /**
   * Create a new NFT collection
   * @param {string} name - The name of the collection
   * @param {string} description - The description of the collection
   * @param {string[]} publicColumns - The public columns of the collection
   * @param {string[]} privateColumns - The private columns of the collection
   * @param {number} price - The price of the collection
   * @returns {Promise<TransactionResponse>} - The transaction response
   */
  async createCollection(name, description, publicColumns, privateColumns, price) {
    const tx = await this.factory.createCollection(
      name,
      'FDB',
      description,
      privateColumns.join(','),
      publicColumns.join(','),
      ethers.parseEther(price),
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find((e) => e.eventName === 'CollectionCreated');
    this.address = event.args.nftContract;
  }

  /**
   * Link a dataset to the NFT collection
   * @param {string} publicCid - The CID of the public dataset
   * @param {string} privateCid - The CID of the private dataset
   * @returns {Promise<void>}
   */
  async linkDataset(publicCid, privateCid) {
    const tx = await this.factory.setCollectionCid(this.address, publicCid, privateCid);
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

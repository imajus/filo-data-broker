import { ethers } from 'ethers';
import FDBRegistryData from './FDBRegistry.json' with { type: 'json' };

export class FDBRegistry {
  /**
   * @param {ethers.Signer} signer - The signer for the Ethereum account
   */
  constructor(signer) {
    this.factory = new ethers.Contract(
      FDBRegistryData.address,
      FDBRegistryData.abi,
      signer
    );
  }

  /**
   * Create a new NFT collection
   * @param {string} name - The name of the collection
   * @param {string} description - The description of the collection
   * @param {string[]} publicColumns - The public columns of the collection
   * @param {string[]} privateColumns - The private columns of the collection
   * @param {number} proofSetId - The proof set ID that holds the data
   * @param {number} price - The price of the collection in USDFC
   * @returns {Promise<string>} - The address of the NFT collection
   */
  async createCollection(
    name,
    description,
    publicColumns,
    privateColumns,
    price
  ) {
    const tx = await this.factory.createCollection(
      name,
      'FDB',
      description,
      privateColumns.join(','),
      publicColumns.join(','),
      ethers.parseEther(price)
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find((e) => e.eventName === 'CollectionCreated');
    return event.args.nftContract;
  }

  /**
   * Link a dataset to the NFT collection
   * @param {string} address - The address of the NFT collection
   * @param {string} proofSetId - The proof set ID that holds the data
   * @param {string} publicCid - The CID of the public dataset
   * @param {string} privateCid - The CID of the encrypted private dataset
   * @param {string} privateDataHash - The hash of the encrypted private dataset
   * @returns {Promise<void>}
   */
  async linkDataset(address, proofSetId, publicCid, privateCid, privateDataHash) {
    const privateDataHashHex = ethers.hexlify(ethers.decodeBase64(privateDataHash));
    const tx = await this.factory.linkCollectionToDataset(
      address,
      proofSetId,
      publicCid,
      privateCid,
      privateDataHashHex,
    );
    await tx.wait();
  }

  /**
   * List all active datasets with their lockup periods
   * @returns {Promise<Array>} - Array of dataset objects with lockup periods
   */
  async listDatasets() {
    const collections = await this.factory.getActiveCollections();
    return Promise.all(
      collections.map(async (address) => {
        const info = await this.factory.getCollectionInfo(address);
        const lockupPeriod = await this.factory.getCollectionLockupPeriod(
          address
        );
        return { name: info.name, price: info.price, lockupPeriod };
      })
    );
  }
}

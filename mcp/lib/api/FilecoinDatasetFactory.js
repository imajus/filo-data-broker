/** @implements {DatasetFactory} */
export class FilecoinDatasetFactory {
  constructor(address) {
    this.address = address;
  }
  
  async list() {
    return [];
  }
  
  async search(query) {
    return [];
  }
} 
/** @implements {Dataset} */
export class FilecoinDataset {
  name = null;
  description = null;
  columns = [];
  cid = null;

  constructor(address) {
    this.address = address;
  }

  get id() {
    return this.address;
  }
  
  async _initialize() {}
  
  async search(query) {
    return [];
  }
  
  async fetch() {
    return [];
  }
} 
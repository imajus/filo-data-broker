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

  async query(sql) {
    return [];
  }

  async fetch() {
    return [];
  }
}

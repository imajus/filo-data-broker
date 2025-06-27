import { LocalDatasetFactory } from './mock/LocalDatasetFactory.js';

let instance = null;

export function getDatasetFactory() {
  if (!instance) {
    instance = new LocalDatasetFactory();
  }
  return instance;
}

exports.createCollection = require("./nft-factory/create-collection")
exports.mintNFT = require("./nft-factory/mint-nft")
exports.batchMint = require("./nft-factory/batch-mint")
exports.getCollections = require("./nft-factory/get-collections")
exports.collectionStats = require("./nft-factory/collection-stats")
exports.syncContracts = require("./nft-factory/sync-contracts")

// PandoraService tasks
exports.addServiceProvider = require("./pandora-service/add-service-provider")
exports.listProviders = require("./pandora-service/list-providers")
exports.approveProvider = require("./pandora-service/approve-provider")
exports.getPricing = require("./pandora-service/get-pricing")

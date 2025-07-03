const { task } = require("hardhat/config")

task("collection-stats", "Get detailed statistics for a collection")
    .addParam("factory", "The FDBRegistry contract address")
    .addParam("collection", "The NFT collection contract address")
    .setAction(async (taskArgs) => {
        const { factory, collection } = taskArgs

        console.log(`Getting stats for collection: ${collection}`)
        console.log(`Using FDBRegistry at: ${factory}`)

        const fdbRegistry = await ethers.getContractAt("FDBRegistry", factory)
        const nft = await ethers.getContractAt("NFT", collection)

        // Get collection info from factory
        const collectionInfo = await fdbRegistry.getCollectionInfo(collection)

        // Get stats from factory
        const stats = await fdbRegistry.getCollectionStats(collection)

        // Get additional info from NFT contract
        const currentTokenId = await nft.getCurrentTokenId()
        const contractOwner = await nft.getContractOwner()

        console.log("\n=== Collection Information ===")
        console.log(`Name: ${collectionInfo.name}`)
        console.log(`Symbol: ${collectionInfo.symbol}`)
        console.log(`Contract Address: ${collectionInfo.nftContract}`)
        console.log(`Owner: ${collectionInfo.owner}`)
        console.log(`Base Token URI: ${collectionInfo.baseTokenURI}`)
        console.log(`Active: ${collectionInfo.isActive}`)
        console.log(`Created: ${new Date(collectionInfo.createdAt * 1000).toISOString()}`)

        console.log("\n=== Collection Stats ===")
        console.log(`Total Supply: ${stats.totalSupply}`)
        console.log(`Current Token ID: ${currentTokenId}`)
        console.log(`Contract Owner: ${contractOwner}`)

        // Check if we can get a sample token URI
        if (currentTokenId > 0) {
            try {
                const sampleTokenURI = await nft.tokenURI(0)
                console.log(`Sample Token URI (ID 0): ${sampleTokenURI}`)
            } catch (error) {
                console.log("No tokens minted yet or token URI not available")
            }
        }
    })

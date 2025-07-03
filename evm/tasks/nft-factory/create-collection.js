const { task } = require("hardhat/config")

task("create-collection", "Create a new NFT collection")
    .addParam("factory", "The FDBRegistry contract address")
    .addParam("name", "The collection name")
    .addParam("symbol", "The collection symbol")
    .addParam("baseuri", "The base token URI")
    .setAction(async (taskArgs) => {
        const { factory, name, symbol, baseuri } = taskArgs

        console.log(`Creating NFT collection: ${name} (${symbol})`)
        console.log(`Base URI: ${baseuri}`)
        console.log(`Using FDBRegistry at: ${factory}`)

        const fdbRegistry = await ethers.getContractAt("FDBRegistry", factory)

        const tx = await fdbRegistry.createCollection(name, symbol, baseuri)
        const receipt = await tx.wait()

        console.log(`Transaction hash: ${tx.hash}`)

        // Get the collection address from the event
        const event = receipt.events?.find((e) => e.event === "CollectionCreated")
        if (event) {
            const collectionAddress = event.args.nftContract
            console.log(`NFT Collection created at: ${collectionAddress}`)
            console.log(`Collection ID: ${event.args.collectionId}`)
        }

        console.log("Collection creation completed!")
    })

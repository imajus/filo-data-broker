const { task } = require("hardhat/config")

task("get-collections", "Get user collections or all collections")
    .addParam("factory", "The NFTFactory contract address")
    .addOptionalParam("user", "Get collections for a specific user address")
    .addOptionalParam("all", "Get all collections (true/false)")
    .setAction(async (taskArgs) => {
        const { factory, user, all } = taskArgs

        console.log(`Using NFTFactory at: ${factory}`)

        const nftFactory = await ethers.getContractAt("NFTFactory", factory)

        if (user) {
            console.log(`Getting collections for user: ${user}`)
            const collections = await nftFactory.getUserCollections(user)

            console.log(`Found ${collections.length} collections:`)
            for (let i = 0; i < collections.length; i++) {
                const collection = collections[i]
                console.log(`\nCollection ${i + 1}:`)
                console.log(`  Name: ${collection.name}`)
                console.log(`  Symbol: ${collection.symbol}`)
                console.log(`  Contract: ${collection.nftContract}`)
                console.log(`  Base URI: ${collection.baseTokenURI}`)
                console.log(`  Active: ${collection.isActive}`)
                console.log(`  Created: ${new Date(collection.createdAt * 1000).toISOString()}`)
            }
        } else if (all === "true") {
            console.log("Getting all collections...")
            const allCollections = await nftFactory.getAllCollections()
            const totalCollections = await nftFactory.getTotalCollections()

            console.log(`Total collections: ${totalCollections}`)
            console.log(`Collection addresses:`)
            allCollections.forEach((addr, index) => {
                console.log(`  ${index + 1}: ${addr}`)
            })
        } else {
            console.log("Please specify either --user <address> or --all true")
        }
    })

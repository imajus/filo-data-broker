const { task } = require("hardhat/config")

task("batch-mint", "Batch mint NFTs to multiple recipients")
    .addParam("factory", "The FDBRegistry contract address")
    .addParam("collection", "The NFT collection contract address")
    .addParam("recipients", "Comma-separated list of recipient addresses")
    .setAction(async (taskArgs) => {
        const { factory, collection, recipients } = taskArgs

        const recipientList = recipients.split(",").map((addr) => addr.trim())

        console.log(`Batch minting ${recipientList.length} NFTs`)
        console.log(`Collection: ${collection}`)
        console.log(`Recipients: ${recipientList.join(", ")}`)
        console.log(`Using FDBRegistry at: ${factory}`)

        const fdbRegistry = await ethers.getContractAt("FDBRegistry", factory)

        const tx = await fdbRegistry.batchMintNFTs(collection, recipientList)
        const receipt = await tx.wait()

        console.log(`Transaction hash: ${tx.hash}`)

        // Get token IDs from the NFT contract events
        const nft = await ethers.getContractAt("NFT", collection)
        const filter = nft.filters.TokenMinted()
        const events = await nft.queryFilter(filter, receipt.blockNumber, receipt.blockNumber)

        console.log(`Minted ${events.length} NFTs:`)
        events.forEach((event, index) => {
            console.log(`  Token ID ${event.args.tokenId} -> ${event.args.to}`)
        })

        console.log("Batch minting completed!")
    })

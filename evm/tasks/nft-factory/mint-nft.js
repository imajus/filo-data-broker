const { task } = require("hardhat/config")

task("mint-nft", "Mint an NFT in a collection")
    .addParam("factory", "The NFTFactory contract address")
    .addParam("collection", "The NFT collection contract address")
    .addParam("to", "The recipient address")
    .setAction(async (taskArgs) => {
        const { factory, collection, to } = taskArgs

        console.log(`Minting NFT to: ${to}`)
        console.log(`Collection: ${collection}`)
        console.log(`Using NFTFactory at: ${factory}`)

        const nftFactory = await ethers.getContractAt("NFTFactory", factory)

        const tx = await nftFactory.mintNFT(collection, to)
        const receipt = await tx.wait()

        console.log(`Transaction hash: ${tx.hash}`)

        // Get token ID from the NFT contract events
        const nft = await ethers.getContractAt("NFT", collection)
        const filter = nft.filters.TokenMinted(to)
        const events = await nft.queryFilter(filter, receipt.blockNumber, receipt.blockNumber)

        if (events.length > 0) {
            const tokenId = events[events.length - 1].args.tokenId
            console.log(`NFT minted with Token ID: ${tokenId}`)
        }

        console.log("NFT minting completed!")
    })

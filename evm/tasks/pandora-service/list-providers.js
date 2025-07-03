const { task } = require("hardhat/config")

task("list-providers", "List all approved service providers")
    .addParam("contract", "PandoraService contract address")
    .setAction(async (taskArgs, hre) => {
        const { ethers } = hre

        console.log("Fetching service providers from PandoraService...")
        console.log("Contract:", taskArgs.contract)

        // Get contract instance
        const PandoraService = await ethers.getContractFactory("PandoraService")
        const pandoraService = PandoraService.attach(taskArgs.contract)

        try {
            // Get all approved providers
            const providers = await pandoraService.getAllApprovedProviders()

            if (providers.length === 0) {
                console.log("No approved service providers found.")
                return
            }

            console.log(`\nFound ${providers.length} approved service provider(s):\n`)

            for (let i = 0; i < providers.length; i++) {
                const provider = providers[i]
                console.log(`Provider ${i + 1}:`)
                console.log(`  Owner: ${provider.owner}`)
                console.log(`  PDP URL: ${provider.pdpUrl}`)
                console.log(`  Retrieval URL: ${provider.pieceRetrievalUrl}`)
                console.log(`  Registered At Block: ${provider.registeredAt.toString()}`)
                console.log(`  Approved At Block: ${provider.approvedAt.toString()}`)
                console.log("")
            }
        } catch (error) {
            console.error("Error fetching service providers:", error.message)
            throw error
        }
    })

module.exports = {}

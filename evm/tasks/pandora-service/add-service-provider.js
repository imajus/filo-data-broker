const { task } = require("hardhat/config")

task("add-service-provider", "Add a service provider to PandoraService")
    .addParam("contract", "PandoraService contract address")
    .addParam("provider", "Provider address to add")
    .addParam("pdpUrl", "PDP service URL")
    .addParam("retrievalUrl", "Piece retrieval URL")
    .setAction(async (taskArgs, hre) => {
        const { ethers } = hre

        console.log("Adding service provider to PandoraService...")
        console.log("Contract:", taskArgs.contract)
        console.log("Provider:", taskArgs.provider)
        console.log("PDP URL:", taskArgs.pdpUrl)
        console.log("Retrieval URL:", taskArgs.retrievalUrl)

        // Get contract instance
        const PandoraService = await ethers.getContractFactory("PandoraService")
        const pandoraService = PandoraService.attach(taskArgs.contract)

        try {
            // Add service provider
            const tx = await pandoraService.addServiceProvider(
                taskArgs.provider,
                taskArgs.pdpUrl,
                taskArgs.retrievalUrl
            )

            console.log("Transaction hash:", tx.hash)
            console.log("Waiting for confirmation...")

            const receipt = await tx.wait()
            console.log("Service provider added successfully!")
            console.log("Gas used:", receipt.gasUsed.toString())

            // Get the provider ID from the event
            const event = receipt.events?.find((e) => e.event === "ProviderApproved")
            if (event) {
                console.log("Provider ID:", event.args.providerId.toString())
            }
        } catch (error) {
            console.error("Error adding service provider:", error.message)
            throw error
        }
    })

module.exports = {}

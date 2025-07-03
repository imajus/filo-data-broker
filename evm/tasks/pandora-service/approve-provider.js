const { task } = require("hardhat/config")

task("approve-provider", "Approve a pending service provider")
    .addParam("contract", "PandoraService contract address")
    .addParam("provider", "Provider address to approve")
    .setAction(async (taskArgs, hre) => {
        const { ethers } = hre

        console.log("Approving pending service provider...")
        console.log("Contract:", taskArgs.contract)
        console.log("Provider:", taskArgs.provider)

        // Get contract instance
        const PandoraService = await ethers.getContractFactory("PandoraService")
        const pandoraService = PandoraService.attach(taskArgs.contract)

        try {
            // Check if provider has pending registration
            const pendingInfo = await pandoraService.getPendingProvider(taskArgs.provider)
            if (pendingInfo.registeredAt.toString() === "0") {
                console.log("No pending registration found for this provider.")
                return
            }

            console.log("Pending provider info:")
            console.log("  PDP URL:", pendingInfo.pdpUrl)
            console.log("  Retrieval URL:", pendingInfo.pieceRetrievalUrl)
            console.log("  Registered at block:", pendingInfo.registeredAt.toString())

            // Approve the provider
            const tx = await pandoraService.approveServiceProvider(taskArgs.provider)

            console.log("Transaction hash:", tx.hash)
            console.log("Waiting for confirmation...")

            const receipt = await tx.wait()
            console.log("Service provider approved successfully!")
            console.log("Gas used:", receipt.gasUsed.toString())

            // Get the provider ID from the event
            const event = receipt.events?.find((e) => e.event === "ProviderApproved")
            if (event) {
                console.log("Provider ID:", event.args.providerId.toString())
            }
        } catch (error) {
            console.error("Error approving service provider:", error.message)
            throw error
        }
    })

module.exports = {}

require("hardhat-deploy")
require("hardhat-deploy-ethers")

module.exports = async ({ deployments, network, run }) => {
    const { deploy, get } = deployments

    // Move wallet creation inside the function where network is available
    const private_key = network.config.accounts[0]
    const wallet = new ethers.Wallet(private_key, network.provider)
    console.log("Wallet Ethereum Address:", wallet.address)

    // Get PandoraService deployment (should be deployed first by 00_pandora.js)
    const pandoraService = await get("PandoraService")
    console.log("PandoraService Address:", pandoraService.address)

    // Get constructor arguments from environment variables
    const paymentToken = process.env.USDFC_TOKEN_ADDRESS

    if (!paymentToken) {
        throw new Error("USDFC_TOKEN_ADDRESS environment variable is required")
    }

    console.log("Payment Token Address:", paymentToken)

    // Deploy FDBRegistry
    const constructorArgs = [paymentToken, pandoraService.address]
    const fdbRegistry = await deploy("FDBRegistry", {
        from: wallet.address,
        args: constructorArgs,
        log: true,
    })
    console.log(`FDBRegistry deployed to: ${fdbRegistry.address}`)

    // Only wait for initial deployment to allow block confirmations
    if (fdbRegistry.newlyDeployed) {
        console.log("Initial deployment detected. Waiting for 45 seconds...")
        await new Promise((resolve) => setTimeout(resolve, 45000))
    } else {
        console.log("Existing deployment detected. Skipping delay.")
    }

    // Verify the contract on block explorer
    try {
        console.log("Verifying FDBRegistry contract on block explorer...")
        await run("verify:verify", {
            address: fdbRegistry.address,
            constructorArguments: constructorArgs,
            force: true,
        })
        console.log("FDBRegistry contract verified successfully!")
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("FDBRegistry contract already verified!")
        } else {
            console.log("Error verifying FDBRegistry contract:", error.message)
        }
    }

    // Run post-deployment script to extract and write contract data
    try {
        console.log("Running post-deployment script...")
        await run("sync-contracts")
    } catch (error) {
        console.log("Error running post-deployment script:", error.message)
    }
}

module.exports.tags = ["FDBRegistry"]
module.exports.dependencies = ["PandoraService"]

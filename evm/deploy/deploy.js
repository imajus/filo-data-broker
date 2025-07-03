require("hardhat-deploy")
require("hardhat-deploy-ethers")

const private_key = network.config.accounts[0]
const wallet = new ethers.Wallet(private_key, ethers.provider)

module.exports = async ({ deployments, network, run }) => {
    const { deploy } = deployments
    console.log("Wallet Ethereum Address:", wallet.address)

    // Get constructor arguments from environment variables
    const paymentsContract = process.env.PAYMENTS_CONTRACT_ADDRESS
    const paymentToken = process.env.PAYMENT_TOKEN_ADDRESS

    if (!paymentsContract) {
        throw new Error("PAYMENTS_CONTRACT_ADDRESS environment variable is required")
    }
    if (!paymentToken) {
        throw new Error("PAYMENT_TOKEN_ADDRESS environment variable is required")
    }

    console.log("Payments Contract Address:", paymentsContract)
    console.log("Payment Token Address:", paymentToken)

    // Deploy NFTFactory
    const constructorArgs = [paymentsContract, paymentToken]
    const nftFactory = await deploy("NFTFactory", {
        from: wallet.address,
        args: constructorArgs,
        log: true,
    })
    console.log(`NFTFactory deployed to: ${nftFactory.address}`)
    // Verify the contract on block explorer
    try {
        console.log("Waiting for 45 seconds...")
        await new Promise((resolve) => setTimeout(resolve, 45000))
        console.log("Verifying NFTFactory contract on block explorer...")
        await run("verify:verify", {
            address: nftFactory.address,
            constructorArguments: constructorArgs,
            force: true,
        })
        console.log("NFTFactory contract verified successfully!")
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("NFTFactory contract already verified!")
        } else {
            console.log("Error verifying NFTFactory contract:", error.message)
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

module.exports.tags = ["NFTFactory"]

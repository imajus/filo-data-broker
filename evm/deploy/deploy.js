require("hardhat-deploy")
require("hardhat-deploy-ethers")

const private_key = network.config.accounts[0]
const wallet = new ethers.Wallet(private_key, ethers.provider)

module.exports = async ({ deployments, network, run }) => {
    const { deploy } = deployments
    console.log("Wallet Ethereum Address:", wallet.address)
    // Deploy NFTFactory
    const nftFactory = await deploy("NFTFactory", {
        from: wallet.address,
        args: [],
        log: true,
    })
    console.log(`NFTFactory deployed to: ${nftFactory.address}`)
    //FIXME: Getting "The address is not a smart contract" error
    // Verify the contract on block explorer
    // try {
    //     console.log("Verifying NFTFactory contract on block explorer...")
    //     await run("verify:verify", {
    //         address: nftFactory.address,
    //         constructorArguments: [],
    //     })
    //     console.log("NFTFactory contract verified successfully!")
    // } catch (error) {
    //     if (error.message.toLowerCase().includes("already verified")) {
    //         console.log("NFTFactory contract already verified!")
    //     } else {
    //         console.log("Error verifying NFTFactory contract:", error.message)
    //     }
    // }
}

module.exports.tags = ["NFTFactory"]

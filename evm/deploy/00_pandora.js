require("hardhat-deploy")
require("hardhat-deploy-ethers")

// Add service providers to the PandoraService
const providers = [
    {
        provider: "0xe9bc394383B67aBcEbe86FD9843F53d8B4a2E981",
        pdpUrl: "https://polynomial.computer/",
        pieceRetrievalUrl: "https://polynomial.computer/",
    },
    {
        provider: "0x4A628ebAecc32B8779A934ebcEffF1646F517756",
        pdpUrl: "https://pdp.zapto.org/",
        pieceRetrievalUrl: "https://pdp.zapto.org/",
    },
    {
        provider: "0x9f5087A1821eb3Ed8a137be368E5e451166EFAAe",
        pdpUrl: "https://yablu.net",
        pieceRetrievalUrl: "https://yablu.net",
    },
]

async function addProviders(pandoraService) {
    // Get the deployed PandoraService contract instance
    const pandoraServiceContract = await ethers.getContractAt(
        "PandoraService",
        pandoraService.address
    )
    // Add each provider sequentially
    for (let i = 0; i < providers.length; i++) {
        const provider = providers[i]
        console.log(`Adding provider ${i + 1}/${providers.length}: ${provider.provider}`)
        try {
            const tx = await pandoraServiceContract.addServiceProvider(
                provider.provider,
                provider.pdpUrl,
                provider.pieceRetrievalUrl
            )
            await tx.wait()
            console.log(`✓ Successfully added provider ${provider.provider}`)
        } catch (err) {
            console.error(`✗ Failed to add provider ${provider.provider}:`, err.message)
        }
    }
}

module.exports = async ({ deployments, network, run }) => {
    const { deploy } = deployments

    // Move wallet creation inside the function where network is available
    const private_key = network.config.accounts[0]
    const wallet = new ethers.Wallet(private_key, network.provider)
    console.log("Wallet Ethereum Address:", wallet.address)

    // Get constructor arguments from environment variables
    const pdpVerifierAddress = process.env.PDP_VERIFIER_ADDRESS
    const paymentsContractAddress = process.env.PAYMENTS_CONTRACT_ADDRESS
    const usdfcTokenAddress = process.env.USDFC_TOKEN_ADDRESS

    // Optional parameters with defaults
    const initialOperatorCommissionBps = process.env.INITIAL_OPERATOR_COMMISSION_BPS || "500" // 5%

    // Validate required environment variables
    if (!pdpVerifierAddress) {
        throw new Error("PDP_VERIFIER_ADDRESS environment variable is required")
    }
    if (!paymentsContractAddress) {
        throw new Error("PAYMENTS_CONTRACT_ADDRESS environment variable is required")
    }
    if (!usdfcTokenAddress) {
        throw new Error("USDFC_TOKEN_ADDRESS environment variable is required")
    }

    console.log("PDP Verifier Address:", pdpVerifierAddress)
    console.log("Payments Contract Address:", paymentsContractAddress)
    console.log("USDFC Token Address:", usdfcTokenAddress)
    console.log("Initial Operator Commission BPS:", initialOperatorCommissionBps)

    // Prepare initialization arguments
    const initializeArgs = [
        pdpVerifierAddress,
        paymentsContractAddress,
        usdfcTokenAddress,
        initialOperatorCommissionBps,
    ]

    // Deploy PandoraService with proxy
    const pandoraService = await deploy("PandoraService", {
        from: wallet.address,
        proxy: {
            proxyContract: "ERC1967Proxy",
            proxyArgs: ["{implementation}", "{data}"],
            execute: {
                init: {
                    methodName: "initialize",
                    args: initializeArgs,
                },
            },
        },
        log: true,
    })

    console.log(`PandoraService deployed to: ${pandoraService.address}`)
    console.log(`PandoraService implementation: ${pandoraService.implementation}`)

    // Only wait for initial deployment to allow block confirmations
    if (pandoraService.newlyDeployed) {
        console.log("Initial deployment detected. Waiting for 45 seconds...")
        await new Promise((resolve) => setTimeout(resolve, 45000))
    } else {
        console.log("Existing deployment detected. Skipping delay.")
    }

    await addProviders(pandoraService)

    // Verify the implementation contract on block explorer
    try {
        console.log("Verifying PandoraService implementation contract on block explorer...")
        await run("verify:verify", {
            address: pandoraService.implementation,
            constructorArguments: [],
            force: true,
        })
        console.log("PandoraService implementation contract verified successfully!")
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("PandoraService implementation contract already verified!")
        } else {
            console.log("Error verifying PandoraService implementation contract:", error.message)
        }
    }

    // Verify the proxy contract on block explorer
    try {
        console.log("Verifying PandoraService proxy contract on block explorer...")
        const proxyArgs = [pandoraService.implementation, "0x"]
        await run("verify:verify", {
            address: pandoraService.address,
            constructorArguments: proxyArgs,
            force: true,
        })
        console.log("PandoraService proxy contract verified successfully!")
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("PandoraService proxy contract already verified!")
        } else {
            console.log("Error verifying PandoraService proxy contract:", error.message)
        }
    }

    return pandoraService
}

module.exports.tags = ["PandoraService"]

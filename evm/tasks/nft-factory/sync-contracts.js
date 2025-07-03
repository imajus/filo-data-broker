const { task } = require("hardhat/config")

task("sync-contracts", "Syncs contract files from deployment artifacts").setAction(
    async (taskArgs, hre) => {
        const fs = require("fs")
        const path = require("path")

        const networkName = hre.network.name
        const deploymentPath = path.join(
            __dirname,
            "..",
            "..",
            "deployments",
            networkName,
            "FDBRegistry.json"
        )

        try {
            // Check if deployment file exists
            if (!fs.existsSync(deploymentPath)) {
                throw new Error(`Deployment file not found: ${deploymentPath}`)
            }

            // Read the deployment artifact
            const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"))

            // Extract address and ABI
            const contractData = {
                address: deploymentData.address,
                abi: deploymentData.abi,
            }

            // Define target paths
            const targetPaths = [
                path.join(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "cli",
                    "lib",
                    "contracts",
                    "FDBRegistry.json"
                ),
                path.join(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "mcp",
                    "lib",
                    "contracts",
                    "FDBRegistry.json"
                ),
            ]

            // Write to both target locations
            for (const targetPath of targetPaths) {
                // Ensure directory exists
                const dir = path.dirname(targetPath)
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                }

                // Write the contract data
                fs.writeFileSync(targetPath, JSON.stringify(contractData, null, 2))
                console.log(`✅ Updated contract data at: ${targetPath}`)
            }

            console.log(
                `🎉 Successfully synced FDBRegistry contract data from network: ${networkName}`
            )
            console.log(`📍 Contract address: ${contractData.address}`)
        } catch (error) {
            console.error("❌ Error syncing contract files:", error.message)
            throw error
        }
    }
)

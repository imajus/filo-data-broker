const { task } = require("hardhat/config")

task("get-pricing", "Get PandoraService pricing information")
    .addParam("contract", "PandoraService contract address")
    .setAction(async (taskArgs, hre) => {
        const { ethers } = hre

        console.log("Fetching pricing information from PandoraService...")
        console.log("Contract:", taskArgs.contract)

        // Get contract instance
        const PandoraService = await ethers.getContractFactory("PandoraService")
        const pandoraService = PandoraService.attach(taskArgs.contract)

        try {
            // Get service pricing
            const pricing = await pandoraService.getServicePrice()
            const effectiveRates = await pandoraService.getEffectiveRates()

            console.log("\n=== PandoraService Pricing Information ===")
            console.log("")

            console.log("Base Pricing (per TiB per month):")
            console.log(
                `  Without CDN: ${ethers.utils.formatUnits(
                    pricing.pricePerTiBPerMonthNoCDN,
                    6
                )} USDFC`
            )
            console.log(
                `  With CDN: ${ethers.utils.formatUnits(
                    pricing.pricePerTiBPerMonthWithCDN,
                    6
                )} USDFC`
            )
            console.log("")

            console.log("Commission Structure:")
            console.log("  Basic Service Commission: 5%")
            console.log("  CDN Service Commission: 40%")
            console.log("")

            console.log("Effective Rates (per TiB per month):")
            console.log("  Basic Service:")
            console.log(
                `    Service Fee: ${ethers.utils.formatUnits(
                    effectiveRates.basicServiceFee,
                    6
                )} USDFC`
            )
            console.log(
                `    SP Payment: ${ethers.utils.formatUnits(
                    effectiveRates.spPaymentBasic,
                    6
                )} USDFC`
            )
            console.log("  CDN Service:")
            console.log(
                `    Service Fee: ${ethers.utils.formatUnits(
                    effectiveRates.cdnServiceFee,
                    6
                )} USDFC`
            )
            console.log(
                `    SP Payment: ${ethers.utils.formatUnits(
                    effectiveRates.spPaymentWithCDN,
                    6
                )} USDFC`
            )
            console.log("")

            console.log("Technical Details:")
            console.log(`  Payment Token: ${pricing.tokenAddress}`)
            console.log(`  Epochs per Month: ${pricing.epochsPerMonth.toString()}`)
            console.log("")

            // Calculate per-epoch rates for different sizes
            console.log("Example Per-Epoch Rates:")
            const sizes = [
                { name: "1 GiB", bytes: ethers.BigNumber.from("1073741824") }, // 1 GiB
                { name: "1 TiB", bytes: ethers.BigNumber.from("1099511627776") }, // 1 TiB
                { name: "10 TiB", bytes: ethers.BigNumber.from("10995116277760") }, // 10 TiB
            ]

            for (const size of sizes) {
                const rateBasic = await pandoraService.calculateStorageRatePerEpoch(
                    size.bytes,
                    false
                )
                const rateCDN = await pandoraService.calculateStorageRatePerEpoch(size.bytes, true)

                console.log(`  ${size.name}:`)
                console.log(`    Basic: ${ethers.utils.formatUnits(rateBasic, 6)} USDFC per epoch`)
                console.log(`    CDN: ${ethers.utils.formatUnits(rateCDN, 6)} USDFC per epoch`)
            }
        } catch (error) {
            console.error("Error fetching pricing information:", error.message)
            throw error
        }
    })

module.exports = {}

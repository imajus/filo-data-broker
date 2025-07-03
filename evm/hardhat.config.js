require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-verify")
require("hardhat-deploy")
require("hardhat-deploy-ethers")
require("./tasks")
require("dotenv").config()

const PRIVATE_KEY = process.env.PRIVATE_KEY
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.23",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
                details: { yul: false },
            },
            viaIR: true,
        },
    },
    defaultNetwork: "calibrationnet",
    networks: {
        localnet: {
            chainId: 31415926,
            url: "http://127.0.0.1:1234/rpc/v1",
            accounts: [PRIVATE_KEY],
        },
        calibrationnet: {
            chainId: 314159,
            url: "https://api.calibration.node.glif.io/rpc/v1",
            accounts: [PRIVATE_KEY],
        },
        filecoinmainnet: {
            chainId: 314,
            url: "https://api.node.glif.io",
            accounts: [PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: {
            calibrationnet: "...",
        },
        customChains: [
            {
                network: "calibrationnet",
                chainId: 314159,
                urls: {
                    apiURL: "https://filecoin-testnet.blockscout.com/api",
                    browserURL: "https://filecoin-testnet.blockscout.com/",
                },
            },
        ],
    },
    sourcify: {
        enabled: false,
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
}

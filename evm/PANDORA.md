# PandoraService Deployment Guide

This guide explains how to deploy the PandoraService smart contract, which provides PDP (Proof of Data Possession) verification with integrated payment functionality.

## Prerequisites

Before deploying PandoraService, ensure you have the following contracts already deployed:

1. **PDP Verifier Contract** - The core PDP verification contract
2. **Payments Contract** - The FWS payments contract for handling storage payments
3. **USDFC Token Contract** - The ERC20 token used for payments

## Environment Variables

Set the following environment variables in your `.env` file:

### Required Variables

```bash
# Address of the deployed PDP Verifier contract
PDP_VERIFIER_ADDRESS=0x1234567890123456789012345678901234567890

# Address of the deployed FWS Payments contract
PAYMENTS_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Address of the USDFC token contract
USDFC_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
```

### Optional Variables (with defaults)

```bash
# Initial operator commission in basis points (default: 500 = 5%)
INITIAL_OPERATOR_COMMISSION_BPS=500

# Maximum number of epochs between consecutive proofs (default: 2880)
MAX_PROVING_PERIOD=2880

# Number of epochs in the challenge window (default: 288)
CHALLENGE_WINDOW_SIZE=288
```

## Deployment Commands

### Deploy to Local Network

```bash
npx hardhat deploy --tags PandoraService --network localhost
```

### Deploy to Calibration Testnet

```bash
npx hardhat deploy --tags PandoraService --network calibrationnet
```

### Deploy to Filecoin Mainnet

```bash
npx hardhat deploy --tags PandoraService --network mainnet
```

## Contract Architecture

The PandoraService contract is deployed as an upgradeable proxy using the UUPS (Universal Upgradeable Proxy Standard) pattern:

-   **Proxy Contract**: The address users interact with (remains constant)
-   **Implementation Contract**: Contains the actual contract logic (can be upgraded)

## Post-Deployment

After successful deployment, the script will:

1. Deploy the implementation contract
2. Deploy the proxy contract with initialization
3. Verify both contracts on the block explorer
4. Run the `sync-contracts` task to update ABI files

## Service Provider Management

After deployment, the contract owner can manage service providers:

### Add Service Provider

```bash
npx hardhat add-service-provider \
  --contract <PANDORA_SERVICE_ADDRESS> \
  --provider <PROVIDER_ADDRESS> \
  --pdp-url "https://provider.example.com/pdp" \
  --retrieval-url "https://provider.example.com/retrieve"
```

### Approve Pending Provider

```bash
npx hardhat approve-service-provider \
  --contract <PANDORA_SERVICE_ADDRESS> \
  --provider <PROVIDER_ADDRESS>
```

## Configuration Parameters Explained

### Initial Operator Commission BPS

-   Default: 500 (5%)
-   Range: 0-10000 (0%-100%)
-   Commission charged by the platform operator

### Max Proving Period

-   Default: 2880 epochs
-   Maximum time between required proofs
-   Longer periods reduce proof frequency but increase storage risk

### Challenge Window Size

-   Default: 288 epochs
-   Time window at the end of each proving period for submitting proofs
-   Must be smaller than the max proving period

## Pricing Structure

The contract implements a tiered pricing model:

-   **Basic Service**: 2 USDFC per TiB per month (5% commission)
-   **CDN Service**: 3 USDFC per TiB per month (40% commission)

## Upgrade Process

To upgrade the contract implementation:

1. Deploy new implementation
2. Call `upgradeTo()` on the proxy contract
3. Verify the new implementation

## Troubleshooting

### Common Issues

1. **Import Path Errors**: Ensure PDP and Payments contracts are deployed first
2. **Insufficient Gas**: Use higher gas limits for complex initialization
3. **Invalid Parameters**: Check that challenge window < max proving period

### Verification Failures

If contract verification fails, you can manually verify using:

```bash
npx hardhat verify --network <network> <contract_address>
```

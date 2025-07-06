# Filecoin Data Broker (FDB) - FEVM Data Marketplace

This project implements a comprehensive data marketplace on Filecoin EVM (FEVM) where dataset collections are represented as NFTs with public/private data access. The system integrates with FWS Payments for enterprise payment processing, PDP verification for data integrity, and provides automated revenue distribution with dynamic pricing and guaranteed storage availability.

## Project Overview

The Filecoin Data Broker combines multiple cutting-edge technologies:

- **FDBRegistry**: Main data marketplace registry with enhanced payment integration and reserve cost system
- **PandoraService**: Enterprise FWS payment rails with PDP verification and service provider registry
- **PDP Verification**: Cryptographic proof system ensuring data integrity with automated arbitration
- **NFT Access Control**: Dataset access tokens for private data portions
- **Dynamic Pricing**: Service-tier-based pricing with CDN add-ons (2-3 USDFC/TiB/month)
- **Reserve Cost System**: 7-day guaranteed storage availability with lockup extensions
- **Service Provider Registry**: Multi-step approval system for quality storage providers

## Setup & Installation

### Configure Environment Variables

Create a `.env` file based on the template:

```bash
cp .env.example .env
```

Add the required environment variables:

```bash
# Wallet Configuration
PRIVATE_KEY=abcdef...                              # Your deployer private key

# Core Contract Dependencies (Required for deployment)
PDP_VERIFIER_ADDRESS=0x...                        # PDPVerifier contract address
PAYMENTS_CONTRACT_ADDRESS=0x...                   # FWS Payments contract address
USDFC_TOKEN_ADDRESS=0x...                         # Payment token (USDFC) contract address

# Optional Configuration
ETHERSCAN_API_KEY=your_api_key                     # For contract verification
INITIAL_OPERATOR_COMMISSION_BPS=500               # Operator commission (default: 5%)
```

### Fund the Deployer Address

Go to the [Calibrationnet testnet faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html), and paste in your Ethereum address. This will send some calibration testnet FIL to the account.

## Architecture Overview

### Core Contracts

#### 1. FDBRegistry.sol

The main data marketplace registry that manages dataset collections with enhanced payment processing:

- **Collection Management**: Create and configure dataset collections with metadata
- **Enhanced Payment Processing**: USDFC token payments with reserve cost system and automatic fee distribution
- **Reserve Cost System**: 7-day guaranteed storage availability with dynamic cost calculation
- **Payment Distribution**: 10% deployer fee, 80% to data owner (including reserve cost)
- **PandoraService Integration**: Direct integration with FWS payment infrastructure and lockup extensions
- **Access Control**: NFT ownership grants access to private dataset portions
- **PDP Integration**: Links collections to proof sets for data verification
- **Balance Management**: Internal balance tracking with withdrawal functionality
- **Dynamic Pricing**: Collection price + reserve cost = total effective price

#### 2. NFT.sol

ERC-721 compliant dataset access tokens:

- **Dataset Access Rights**: NFTs represent access to private dataset portions
- **Registry-Controlled**: Only FDBRegistry can mint tokens
- **Sequential Token IDs**: Auto-incrementing token assignment
- **Metadata Integration**: Token URIs constructed as `{BASE_TOKEN_URI}{tokenId}.json`

#### 3. PandoraService.sol

Copied from the original [repository](https://github.com/FilOzone/filecoin-services/tree/pandora/deployed/calibnet-2738577/0xf49ba5eaCdFD5EE3744efEdf413791935FE4D4c5) and extended with:

- **getProofSetLeafCount**: Get the leaf count for a given proof set
- **getProofSetDailyCost**: Calculate the daily cost for a proof set
- **increaseLockupPeriod**: Increase the lockup period for a proof set's payment rail

### PDP (Provable Data Possession) System

Copied from the original [repository](https://github.com/FilOzone/pdp/tree/v1.0.0) with no modification Pandora Service compilation.

### FWS Payments Integration

Enterprise payment infrastructure copied from the [original](https://github.com/FilOzone/filecoin-services-payments/tree/deployed/calibnet/0x0E690D3e60B0576D01352AB03b258115eb84A047) repository with no modification Pandora Service compilation.

## Deployment

### Prerequisites

1. **Dependency Contracts**: Ensure these are deployed and addresses are available:
    - **PDPVerifier**: PDP verification contract
    - **FWS Payments**: Enterprise payment infrastructure
    - **USDFC Token**: Payment token contract
2. **Environment Variables**: Configure all required variables in `.env`
3. **Network Access**: Ensure deployer has sufficient FIL for gas fees

> **Note:** After deploying PandoraService, the deployment script will automatically add a set of default service providers and verify both the implementation and proxy contracts on the block explorer. The deployment uses the ERC1967Proxy pattern.

### Two-Stage Deployment Process

The deployment uses a sequential process with dependency management:

#### Stage 1: Deploy PandoraService

```bash
# Deploy PandoraService with proxy pattern and service provider setup
npx hardhat deploy --tags PandoraService --network calibrationnet
```

#### Stage 2: Deploy FDBRegistry

```bash
# Deploy FDBRegistry with PandoraService integration
npx hardhat deploy --tags FDBRegistry --network calibrationnet
```

#### Full Infrastructure Deployment

```bash
# Deploy both contracts in correct order
npx hardhat deploy --network calibrationnet
```

### Expected Output

```bash
Wallet Ethereum Address: 0x...
PDP Verifier Address: 0x...
Payments Contract Address: 0x...
USDFC Token Address: 0x...
PandoraService deployed to: 0x...
PandoraService implementation: 0x...
FDBRegistry deployed to: 0x...
```

Keep note of the deployed contract addresses for usage examples.

## CLI Tasks Usage Examples

### Contract Synchronization

Update smart contract addresses & ABIs in other platform projects:

```bash
# Sync contract ABIs for CLI/MCP integration
npx hardhat sync-contracts --network calibrationnet

# Sync specific contract only
npx hardhat sync-contracts \
  --contract FDBRegistry \
  --network calibrationnet
```

## Data Architecture

### Collection Data Structure

```solidity
struct Collection {
    address nftContract;      // NFT contract address
    address owner;           // Collection owner
    string name;             // Dataset name
    string symbol;           // Collection symbol
    string description;      // Dataset description
    string privateColumns;   // Private data columns
    string publicColumns;    // Public data columns
    uint256 price;           // Purchase price in USDFC
    uint256 createdAt;       // Creation timestamp
    bool isActive;           // Purchase availability
}
```

### Dataset Data Structure

```solidity
struct Dataset {
    uint256 proofSetId;      // PDP proof set identifier (links to the proof set for this dataset)
    string publicCid;        // IPFS CID for public data
    string privateCid;       // IPFS CID for private data
    bytes privateDataHash;   // Hash of the private data for integrity verification
}
```

### Enhanced Payment Flow

1. **Buyer** checks effective price (collection price + reserve cost)
2. **Buyer** approves USDFC token spending for total effective price
3. **Buyer** calls `purchase()` with collection address
4. **FDBRegistry** validates balance and allowance for total payment
5. **Tokens transferred** from buyer to FDBRegistry (collection price + reserve cost)
6. **Enhanced Fee Distribution**:
    - 10% deployer fee (from collection price only)
    - 80% to collection owner (collection price - deployer fee + full reserve cost)
7. **PandoraService** handles lockup period extension (7-day increment)
8. **NFT minted** to buyer granting dataset access
9. **Balances updated** for withdrawals
10. **Reserve cost** ensures 7-day guaranteed storage availability

### PDP Verification Flow

1. **Proof Set Creation**: Data organized into proof sets with unique IDs
2. **Challenge Generation**: PDPVerifier issues periodic cryptographic challenges
3. **Proof Submission**: Storage providers submit cryptographic proofs
4. **Verification**: Mathematical validation of proof authenticity
5. **Payment Adjustments**: Successful proofs maintain payments, failures trigger arbitration

## Error Handling

The contracts use custom errors for gas efficiency and clear debugging:

### FDBRegistry Errors

- `FDBRegistry__EmptyName()`: Collection name cannot be empty
- `FDBRegistry__EmptySymbol()`: Collection symbol cannot be empty
- `FDBRegistry__NotCollectionOwner()`: Caller doesn't own the collection
- `FDBRegistry__InsufficientPayment()`: Buyer lacks sufficient token balance
- `FDBRegistry__InsufficientAllowance()`: Insufficient ERC20 allowance for purchase
- `FDBRegistry__TransferFailed()`: Token transfer failed during payment
- `FDBRegistry__InsufficientBalance()`: Attempting withdrawal with zero balance

### Payment Error Recovery

The payment system includes robust error recovery:

1. **Balance Validation**: Check buyer token balance before transfer
2. **Allowance Validation**: Verify sufficient ERC20 approval
3. **Transfer Execution**: Attempt token transfer with failure handling
4. **State Recovery**: Restore previous state if transfer fails
5. **Event Emission**: Log successful operations for tracking

## Gas Optimization

- Uses `private` state variables with getter functions
- Custom errors instead of require strings
- Efficient storage layout
- Batch operations to reduce transaction costs
- Proxy pattern for upgradeable contracts

## Events

### FDBRegistry Events

- `CollectionCreated`: Emitted when a new dataset collection is created
- `CollectionStatusUpdated`: Emitted when collection status changes
- `NFTPurchased`: Emitted when dataset access is purchased
    ```solidity
    event NFTPurchased(
        address indexed nftContract,
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 price
    );
    ```
- `BalanceWithdrawn`: Emitted when earnings are withdrawn
- `DatasetLinked`: Emitted when a dataset is linked to a collection
    ```solidity
    event DatasetLinked(
        address indexed nftContract,
        uint256 proofSetId,
        string publicCid,
        string privateCid,
        bytes privateDataHash
    );
    ```

### PandoraService Events

- `ProofSetRailCreated`: Emitted when payment rails are created
- `ProviderApproved`: Emitted when storage providers are approved
- `PaymentArbitrated`: Emitted when payments are adjusted due to failed proofs

## Testing

### Compile and Test

```bash
# Compile contracts
npm run compile

# Run tests (when test files are created)
npm run test

# Check test coverage
npm run coverage
```

### Integration Testing Workflow

```bash
# Deploy to testnet
npx hardhat deploy --network calibrationnet

# Create test collection
npx hardhat create-collection \
  --registry <address> \
  --name "Test Dataset" \
  --symbol "TEST" \
  --price "1000000000000000000" \
  --network calibrationnet

# Set CIDs to activate
npx hardhat set-collection-cid \
  --registry <address> \
  --collection <address> \
  --public-cid "QmTestPublic..." \
  --private-cid "QmTestPrivate..." \
  --network calibrationnet

# Test purchase flow
npx hardhat approve-token \
  --token <address> \
  --spender <registry> \
  --amount "1000000000000000000" \
  --network calibrationnet

npx hardhat purchase-dataset \
  --registry <address> \
  --collection <address> \
  --network calibrationnet

# Verify access and balances
npx hardhat has-nft \
  --registry <address> \
  --collection <address> \
  --user <address> \
  --network calibrationnet

npx hardhat get-balance \
  --registry <address> \
  --user <address> \
  --network calibrationnet
```

## Access Control

1. **Collection Ownership**: Only collection owners can manage collections
2. **Registry Control**: Only FDBRegistry can mint tokens in NFT contracts
3. **Payment Validation**: Comprehensive balance and allowance checking
4. **Provider Management**: Approval system for storage providers

## Data Marketplace Business Model

### Enhanced Revenue Streams

- **Data Providers**: Receive 80% of collection price (minus deployer fee) + full reserve cost
- **Platform**: Collects 10% deployer fee from collection price portion only
- **Storage Providers**: Earn service-based commissions (5% basic, 40% CDN) plus reserve cost benefits
- **Reserve Cost Benefits**: 7-day guaranteed storage availability increases buyer confidence

### Enhanced Economic Incentives

- **Data Quality**: PDP verification ensures data availability and integrity
- **Provider Reliability**: Failed proofs trigger payment reductions via enhanced arbitration
- **Storage Guarantee**: 7-day reserve cost system ensures guaranteed availability
- **Service-Based Pricing**: Dynamic pricing rewards quality providers (5% vs 40% commission)
- **Market Efficiency**: Automated pricing and enhanced fee distribution
- **Access Control**: NFT ownership provides verifiable access rights
- **Quality Assurance**: Multi-step provider approval maintains service standards

## Troubleshooting

### Common Issues

#### Environment Variable Errors

```bash
Error: PDP_VERIFIER_ADDRESS environment variable is required
```

**Solution**: Ensure all required environment variables are set in `.env`

#### Contract Not Found

```bash
Error: Contract not deployed
```

**Solution**: Deploy contracts first or verify contract addresses

#### Gas Estimation Failures

```bash
Error: gas required exceeds allowance
```

**Solution**: Check gas limits and account balance

#### Network Connection Problems

```bash
Error: network does not respond
```

**Solution**: Verify RPC URL and network connectivity

### Recovery Procedures

#### Partial Deployment Recovery

```bash
# Check existing deployments
npx hardhat deployments:list --network calibrationnet

# Continue from failed stage
npx hardhat deploy --tags FDBRegistry --network calibrationnet
```

#### Contract State Validation

```bash
# Verify contract initialization
npx hardhat call FDBRegistry pandoraService --network calibrationnet
npx hardhat call PandoraService paymentsContractAddress --network calibrationnet

# Verify enhanced features
npx hardhat call FDBRegistry getCollectionEffectivePrice --network calibrationnet
npx hardhat call PandoraService getAllApprovedProviders --network calibrationnet
```

## License

MIT License

# Filecoin Data Broker (FDB) - FEVM Data Marketplace

This project implements a comprehensive data marketplace on Filecoin EVM (FEVM) where dataset collections are represented as NFTs with public/private data access. The system integrates with FWS Payments for enterprise payment processing, PDP verification for data integrity, and provides automated revenue distribution.

## Project Overview

The Filecoin Data Broker combines multiple cutting-edge technologies:
- **FDBRegistry**: Main data marketplace registry with payment integration
- **PandoraService**: Enterprise FWS payment rails with PDP verification
- **PDP Verification**: Cryptographic proof system ensuring data integrity
- **NFT Access Control**: Dataset access tokens for private data portions
- **Automated Payments**: Smart fee distribution with lockup mechanisms

## Setup & Installation

### Get a Private Key

You can get a private key from a wallet provider [such as Metamask](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/).

### Configure Environment Variables

Create a `.env` file based on the template:

```bash
cp .env.example .env
```

Add the required environment variables:

```bash
# Wallet Configuration
PRIVATE_KEY=abcdef...                              # Your deployer private key
RPC_URL=https://api.calibration.node.glif.io/rpc/v1  # Network RPC endpoint
ETHERSCAN_API_KEY=your_api_key                     # For contract verification

# Core Contract Dependencies (Required for deployment)
PDP_VERIFIER_ADDRESS=0x...                        # PDPVerifier contract address
PAYMENTS_CONTRACT_ADDRESS=0x...                   # FWS Payments contract address
USDFC_TOKEN_ADDRESS=0x...                         # Payment token (USDFC) contract address

# Optional Configuration
INITIAL_OPERATOR_COMMISSION_BPS=500               # Operator commission (default: 5%)
```

**Security Warning**: Never commit `.env` files containing sensitive information like private keys to public repositories!

### Fund the Deployer Address

Go to the [Calibrationnet testnet faucet](https://faucet.calibration.fildev.network/), and paste in your Ethereum address. This will send some calibration testnet FIL to the account.

## Architecture Overview

### Core Contracts

#### 1. FDBRegistry.sol

The main data marketplace registry that manages dataset collections with integrated payment processing:

- **Collection Management**: Create and configure dataset collections with metadata
- **Payment Processing**: USDFC token payments with automatic fee distribution (10%/10%/80%)
- **PandoraService Integration**: Direct integration with FWS payment infrastructure
- **Access Control**: NFT ownership grants access to private dataset portions
- **PDP Integration**: Links collections to proof sets for data verification
- **Balance Management**: Internal balance tracking with withdrawal functionality

#### 2. NFT.sol

ERC-721 compliant dataset access tokens:

- **Dataset Access Rights**: NFTs represent access to private dataset portions
- **Registry-Controlled**: Only FDBRegistry can mint tokens
- **Sequential Token IDs**: Auto-incrementing token assignment
- **Metadata Integration**: Token URIs constructed as `{BASE_TOKEN_URI}{tokenId}.json`

#### 3. PandoraService.sol

Enterprise FWS payment infrastructure with PDP verification:

- **Payment Rails**: Streaming payment channels for storage providers
- **PDP Integration**: Cryptographic proof verification for data integrity
- **Service Provider Registry**: Manages approved storage providers
- **Commission Management**: Dynamic rates (5% basic, 40% CDN service)
- **Arbitration System**: Automated dispute resolution for failed proofs

### PDP (Provable Data Possession) System

The PDP system provides cryptographic proof that storage providers actually possess the data:

- **PDPVerifier.sol**: Main verification engine with challenge generation
- **SimplePDPService.sol**: Basic PDP service implementation
- **Proofs.sol**: Proof generation and validation utilities
- **Cids.sol**: IPFS CID handling and validation
- **BitOps.sol**: Bit manipulation operations for proofs
- **Fees.sol**: PDP fee calculation and management

### FWS Payments Integration

Enterprise payment infrastructure:
- **Payments.sol**: Streaming payment channels and settlement
- **RateChangeQueue.sol**: Dynamic payment rate management
- **Lockup Mechanisms**: Time-based fund security and releases

## Features

### Data Marketplace Features

- **Dataset Collections**: NFT collections represent datasets with public and private data portions
- **Access Control**: NFT ownership grants access to private dataset content
- **Pricing System**: Collection owners set purchase prices for dataset access
- **Public/Private Data**: Separate IPFS CIDs for public vs private dataset portions
- **Column Schema**: Track public and private data column definitions
- **Data Activation**: Collections become purchasable when CIDs are set
- **PDP Verification**: Cryptographic proofs ensure data integrity and availability

### Payment System Features

- **USDFC Integration**: Uses USDFC token for all transactions
- **Automatic Fee Split**: 10% deployer fee, 10% FWS fee, 80% to collection owner
- **FWS Payment Rails**: Integration with enterprise payment infrastructure
- **Balance Management**: Internal balance tracking with withdrawal functionality
- **Payment Lockups**: Secure fund management with time-based releases
- **Arbitration**: Automated dispute resolution for payment adjustments

### PDP Verification Features

- **Proof Sets**: Data organized into cryptographically verifiable sets
- **Challenge Generation**: Periodic challenges ensure continuous data availability
- **Provider Registry**: Managed approval system for storage providers
- **Fault Handling**: Automatic payment adjustments for failed proofs
- **Commission Structure**: Dynamic rates based on service levels

## Deployment

### Prerequisites

1. **Dependency Contracts**: Ensure these are deployed and addresses are available:
   - **PDPVerifier**: PDP verification contract
   - **FWS Payments**: Enterprise payment infrastructure
   - **USDFC Token**: Payment token contract
2. **Environment Variables**: Configure all required variables in `.env`
3. **Network Access**: Ensure deployer has sufficient FIL for gas fees

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

## CLI Usage Examples

### Data Owner Workflow

#### 1. Create a Dataset Collection

```bash
npx hardhat create-collection \
  --registry 0x123...abc \
  --name "Climate Data 2024" \
  --symbol "CLIMATE24" \
  --description "Comprehensive climate dataset for 2024" \
  --public-columns "timestamp,location,temperature,humidity" \
  --private-columns "sensor_id,raw_data,calibration,metadata" \
  --proof-set-id 12345 \
  --price "1000000000000000000" \
  --size "107374182400" \
  --network calibrationnet
```

#### 2. Set Dataset CIDs (Activate Collection)

```bash
npx hardhat set-collection-cid \
  --registry 0x123...abc \
  --collection 0x456...def \
  --public-cid "QmPublicDataHash..." \
  --private-cid "QmPrivateDataHash..." \
  --network calibrationnet
```

#### 3. Monitor Sales and Withdraw Earnings

```bash
# Check collection statistics
npx hardhat collection-stats \
  --registry 0x123...abc \
  --collection 0x456...def \
  --network calibrationnet

# Check balance and withdraw earnings
npx hardhat get-balance \
  --registry 0x123...abc \
  --user 0x789...ghi \
  --network calibrationnet

npx hardhat withdraw \
  --registry 0x123...abc \
  --network calibrationnet
```

### Data Buyer Workflow

#### 1. Browse Available Datasets

```bash
# View all active dataset collections
npx hardhat get-active-collections \
  --registry 0x123...abc \
  --network calibrationnet

# Get details for specific collection
npx hardhat get-collection-details \
  --registry 0x123...abc \
  --collection 0x456...def \
  --network calibrationnet
```

#### 2. Purchase Dataset Access

```bash
# First approve token spending
npx hardhat approve-token \
  --token 0xabc...123 \
  --spender 0x123...abc \
  --amount "1000000000000000000" \
  --network calibrationnet

# Purchase dataset access (mints NFT automatically)
npx hardhat purchase-dataset \
  --registry 0x123...abc \
  --collection 0x456...def \
  --network calibrationnet
```

#### 3. Verify Access

```bash
# Check if user has access NFT
npx hardhat has-nft \
  --registry 0x123...abc \
  --collection 0x456...def \
  --user 0x789...ghi \
  --network calibrationnet

# Get owned collections
npx hardhat get-collections \
  --registry 0x123...abc \
  --user 0x789...ghi \
  --network calibrationnet
```

### Storage Provider Workflow

#### 1. Register as Service Provider

```bash
npx hardhat add-service-provider \
  --pandora 0x123...abc \
  --provider 0x456...def \
  --pdp-url "https://storage-provider.com/pdp" \
  --retrieval-url "https://storage-provider.com/retrieve" \
  --network calibrationnet
```

#### 2. Monitor Approval Status

```bash
# List all approved providers
npx hardhat list-providers \
  --pandora 0x123...abc \
  --network calibrationnet

# Get specific provider details
npx hardhat get-provider-details \
  --pandora 0x123...abc \
  --provider 0x456...def \
  --network calibrationnet
```

#### 3. Check Service Pricing

```bash
# Get pricing for CDN service
npx hardhat get-pricing \
  --pandora 0x123...abc \
  --size "107374182400" \
  --with-cdn true \
  --network calibrationnet
```

### NFT Operations

#### Mint Access Tokens

```bash
# Mint individual NFT
npx hardhat mint-nft \
  --registry 0x123...abc \
  --collection 0x456...def \
  --to 0x789...ghi \
  --network calibrationnet

# Batch mint to multiple recipients
npx hardhat batch-mint \
  --registry 0x123...abc \
  --collection 0x456...def \
  --recipients "0x789...ghi,0xabc...123,0xdef...456" \
  --network calibrationnet
```

### System Administration

#### Contract Synchronization

```bash
# Sync contract ABIs for CLI/MCP integration
npx hardhat sync-contracts --network calibrationnet

# Sync specific contract only
npx hardhat sync-contracts \
  --contract FDBRegistry \
  --network calibrationnet
```

#### Provider Management (Admin Only)

```bash
# Approve pending provider
npx hardhat approve-provider \
  --pandora 0x123...abc \
  --provider 0x456...def \
  --network calibrationnet

# List pending providers
npx hardhat list-pending-providers \
  --pandora 0x123...abc \
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
    string publicCid;        // IPFS CID for public data
    string privateCid;       // IPFS CID for private data
    uint256 proofSetId;      // PDP proof set identifier
    uint256 price;           // Purchase price in USDFC
    uint256 size;            // Dataset size in bytes
    uint256 createdAt;       // Creation timestamp
    bool isActive;           // Purchase availability
}
```

### Payment Flow

1. **Buyer** approves USDFC token spending to FDBRegistry
2. **Buyer** calls `purchase()` with collection address
3. **FDBRegistry** validates balance and allowance
4. **Tokens transferred** from buyer to FDBRegistry
5. **Fee split**: 10% to deployer, 10% to FWS Payments (via PandoraService), 80% to owner
6. **PandoraService** handles payment rail management and lockup increases
7. **NFT minted** to buyer granting dataset access
8. **Balances updated** for withdrawals

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

## Security Considerations

### Access Control
1. **Collection Ownership**: Only collection owners can mint tokens and manage collections
2. **Registry Control**: Only FDBRegistry can mint tokens in NFT contracts
3. **Payment Validation**: Comprehensive balance and allowance checking
4. **Provider Management**: Approval system for storage providers

### Payment Security
1. **Balance Validation**: Check buyer has sufficient tokens before transfer
2. **Allowance Checking**: Verify ERC20 approval before attempting transfer
3. **Transfer Safety**: Use OpenZeppelin SafeERC20 for token operations
4. **State Recovery**: Failed transfers restore previous contract state
5. **Reentrancy Protection**: FWS Payments contract uses ReentrancyGuard

### PDP Verification Security
1. **Cryptographic Proofs**: Mathematical validation of data possession
2. **Challenge Randomness**: Verifiable random challenge generation
3. **Timing Requirements**: Strict deadlines for proof submission
4. **Arbitration System**: Automated dispute resolution for failed proofs

### Smart Contract Security
1. **Input Validation**: All user inputs are validated and sanitized
2. **Integer Overflow**: Uses Solidity 0.8+ built-in overflow protection
3. **Gas Limits**: Batch operations limited to prevent out-of-gas errors
4. **Custom Errors**: Gas-efficient error handling over revert strings

## Filecoin Integration

### IPFS & Content Addressing

- **Public Data**: Openly accessible dataset samples and schemas
- **Private Data**: Full dataset accessible only to NFT owners
- **CAR Files**: Use [go-generate-car tool](tools/go-generate-car) for Filecoin storage
- **Content Addressing**: IPFS CIDs ensure data integrity and permanence

### Network Configuration

- **Default network**: Calibration testnet (chainId: 314159)
- **Local development**: localnet (chainId: 31415926)
- **Production**: Filecoin mainnet (chainId: 314)
- **Block explorer**: Filecoin testnet Blockscout for verification

## Data Marketplace Business Model

### Revenue Streams

- **Data Owners**: Receive 80% of purchase fees plus FWS payment benefits
- **Platform**: Collects 10% deployer fee from all transactions
- **FWS Services**: Receives 10% fee for payment infrastructure and PDP verification
- **Storage Providers**: Earn commissions (5% basic, 40% CDN) for storage services

### Economic Incentives

- **Data Quality**: PDP verification ensures data availability and integrity
- **Provider Reliability**: Failed proofs trigger payment reductions
- **Market Efficiency**: Automated pricing and fee distribution
- **Access Control**: NFT ownership provides verifiable access rights

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
```

## License

MIT License



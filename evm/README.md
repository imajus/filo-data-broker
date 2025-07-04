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

Enterprise FWS payment infrastructure with enhanced PDP verification and service provider management:

- **Dynamic Payment Rails**: Streaming payment channels with service-tier-based pricing
- **PDP Integration**: Cryptographic proof verification for data integrity with automated arbitration
- **Service Provider Registry**: Multi-step approval system for quality storage providers
- **Dynamic Pricing**: 2 USDFC/TiB/month (basic) vs 3 USDFC/TiB/month (CDN service)
- **Commission Management**: Service-based rates (5% basic, 40% CDN service)
- **Lockup Period Management**: Dynamic extensions based on reserve costs (7-day periods)
- **EIP-712 Signature Verification**: Client signatures required for proof set creation
- **Enhanced Arbitration**: Automated dispute resolution with payment reductions
- **Provider Quality Control**: Three approved providers with professional endpoints

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

### Enhanced Payment System Features

- **USDFC Integration**: Uses USDFC token for all transactions
- **Reserve Cost System**: 7-day guaranteed storage availability with dynamic cost calculation
- **Enhanced Fee Split**: 10% deployer fee, 80% to collection owner (including reserve cost)
- **Dynamic Pricing**: Collection price + reserve cost = total effective price
- **FWS Payment Rails**: Integration with enterprise payment infrastructure
- **Balance Management**: Internal balance tracking with withdrawal functionality
- **Lockup Period Extensions**: Reserve costs trigger 7-day lockup extensions
- **Service-Based Pricing**: 2 USDFC/TiB/month (basic) vs 3 USDFC/TiB/month (CDN)
- **Enhanced Arbitration**: Automated dispute resolution with payment reductions

### Enhanced PDP Verification Features

- **Proof Sets**: Data organized into cryptographically verifiable sets
- **Challenge Generation**: Periodic challenges ensure continuous data availability
- **Service Provider Registry**: Multi-step approval system with three quality providers
- **Professional Endpoints**: polynomial.computer, pdp.zapto.org, yablu.net
- **EIP-712 Signature Verification**: Client signatures required for proof set operations
- **Enhanced Fault Handling**: Automatic payment adjustments for failed proofs
- **Service-Based Commission**: 5% basic service, 40% CDN service with enhanced features
- **Quality Control**: Provider approval process ensures reliable service delivery

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

# Check effective pricing (collection price + reserve cost)
npx hardhat get-collection-effective-price \
  --registry 0x123...abc \
  --collection 0x456...def \
  --network calibrationnet

# Check reserve cost breakdown
npx hardhat get-collection-reserve-cost \
  --registry 0x123...abc \
  --collection 0x456...def \
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

#### 2. Purchase Dataset Access with Reserve Costs

```bash
# Check total effective price (collection + reserve cost)
npx hardhat get-collection-effective-price \
  --registry 0x123...abc \
  --collection 0x456...def \
  --network calibrationnet

# Approve token spending for total effective price
npx hardhat approve-token \
  --token 0xabc...123 \
  --spender 0x123...abc \
  --amount "1100000000000000000" \
  --network calibrationnet

# Purchase dataset access (mints NFT automatically)
npx hardhat purchase-dataset \
  --registry 0x123...abc \
  --collection 0x456...def \
  --network calibrationnet

# Check payment breakdown
npx hardhat get-purchase-breakdown \
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

#### 1. Register as Service Provider (Multi-Step Process)

```bash
# Step 1: Register provider (pending approval)
npx hardhat add-service-provider \
  --pandora 0x123...abc \
  --provider 0x456...def \
  --pdp-url "https://storage-provider.com/pdp" \
  --retrieval-url "https://storage-provider.com/retrieve" \
  --network calibrationnet

# Step 2: Check registration status
npx hardhat get-provider-status \
  --pandora 0x123...abc \
  --provider 0x456...def \
  --network calibrationnet
```

#### 2. Monitor Approval Status (Admin Required)

```bash
# List all approved providers (current: 3 providers)
npx hardhat list-providers \
  --pandora 0x123...abc \
  --network calibrationnet

# List pending providers awaiting approval
npx hardhat list-pending-providers \
  --pandora 0x123...abc \
  --network calibrationnet

# Admin: Approve pending provider
npx hardhat approve-provider \
  --pandora 0x123...abc \
  --provider 0x456...def \
  --network calibrationnet
```

#### 3. Check Service Pricing (Service-Based Rates)

```bash
# Get pricing for basic service (2 USDFC/TiB/month, 5% commission)
npx hardhat get-pricing \
  --pandora 0x123...abc \
  --size "107374182400" \
  --with-cdn false \
  --network calibrationnet

# Get pricing for CDN service (3 USDFC/TiB/month, 40% commission)
npx hardhat get-pricing \
  --pandora 0x123...abc \
  --size "107374182400" \
  --with-cdn true \
  --network calibrationnet

# Check provider commission earnings
npx hardhat get-provider-earnings \
  --pandora 0x123...abc \
  --provider 0x456...def \
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

### Enhanced Revenue Streams

- **Data Owners**: Receive 80% of collection price (minus deployer fee) + full reserve cost
- **Platform**: Collects 10% deployer fee from collection price portion only
- **Storage Providers**: Earn service-based commissions (5% basic, 40% CDN) plus reserve cost benefits
- **Quality Assurance**: Multi-step provider approval ensures reliable service delivery
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

## Enhanced Features Summary

### Reserve Cost System
- **7-Day Guarantee**: Reserve costs ensure 7 days of guaranteed storage availability
- **Dynamic Calculation**: Costs calculated based on proof set size and service type
- **Lockup Extensions**: Reserve costs trigger automatic 7-day lockup period extensions

### Service Provider Registry
- **Multi-Step Approval**: Registration → Admin Approval → Active Status
- **Quality Control**: Three approved providers with professional endpoints
- **Service Tiers**: Basic (5% commission) vs CDN (40% commission) service levels

### Dynamic Pricing
- **Service-Based Rates**: 2 USDFC/TiB/month (basic) vs 3 USDFC/TiB/month (CDN)
- **Effective Pricing**: Collection price + reserve cost = total buyer cost
- **Enhanced Fee Distribution**: Sophisticated payment splitting with reserve cost benefits

### Enhanced Security
- **EIP-712 Signatures**: Client signatures required for proof set creation
- **Payment Validation**: Comprehensive balance and allowance checking
- **Arbitration System**: Automated dispute resolution with payment adjustments

## License

MIT License



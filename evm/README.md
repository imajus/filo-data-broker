# NFT Data Marketplace - FEVM Hardhat Kit

This project implements a data marketplace on Filecoin EVM (FEVM) where NFT collections represent datasets with public/private data access. The system integrates with FWS Payments for advanced payment processing and revenue distribution.

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

# FWS Payments Integration (Required for deployment)
PAYMENTS_CONTRACT_ADDRESS=0x...                    # Deployed FWS Payments contract
PAYMENT_TOKEN_ADDRESS=0x...                        # ERC20 token address (USDFC)
```

**Security Warning**: Never commit `.env` files containing sensitive information like private keys to public repositories!

### Fund the Deployer Address

Go to the [Calibrationnet testnet faucet](https://faucet.calibration.fildev.network/), and paste in your Ethereum address. This will send some calibration testnet FIL to the account.

## Contracts

### 1. NFT.sol

A fully compliant ERC-721 NFT contract that represents dataset access tokens:

- Standard ERC-721 functionality (transfer, approve, etc.)
- ERC-721 Metadata extension for token URIs
- Owner-only minting (controlled by NFTFactory)
- Gas-efficient custom error handling
- Sequential token ID assignment

### 2. NFTFactory.sol

A factory contract for creating and managing dataset collections with integrated payments:

- **Payment Processing**: ERC20 token payments with automatic fee distribution
- **FWS Integration**: Direct integration with FWS Payments for advanced payment rails
- **Dataset Management**: Create collections representing datasets with public/private data
- **Access Control**: NFT ownership grants access to private dataset portions
- **Revenue Sharing**: Automatic 10%/10%/80% fee split (deployer/FWS/owner)
- **Collection Management**: Toggle active status, set pricing, manage CIDs
- **Batch Operations**: Efficient bulk minting and operations
- **Balance System**: Internal balance tracking with withdrawal functionality

### 3. FWS Payments Integration

The system integrates with **FWS Payments** (`contracts/fws/payments/Payments.sol`):

- **Payment Rails**: Enterprise-grade streaming payment channels
- **Settlement Engine**: Epoch-based payment processing
- **Lockup Mechanisms**: Time-based fund security
- **Operator Commissions**: Flexible fee collection system

## Features

### Dataset Marketplace Features

- **Data Collections**: NFT collections represent datasets with public and private data portions
- **Access Control**: NFT ownership grants access to private dataset content
- **Pricing System**: Collection owners set purchase prices for dataset access
- **Public/Private Data**: Separate IPFS CIDs for public vs private dataset portions
- **Column Schema**: Track public and private data column definitions
- **Data Activation**: Collections become purchasable when CIDs are set

### Payment System Features

- **ERC20 Integration**: Uses USDFC token for all transactions
- **Automatic Fee Split**: 10% deployer fee, 10% FWS fee, 80% to collection owner
- **FWS Payment Rails**: Integration with enterprise payment infrastructure
- **Balance Management**: Internal balance tracking with withdrawal functionality
- **Allowance Validation**: Comprehensive ERC20 approval checking
- **Error Recovery**: Failed payments restore previous state

### NFT Contract Features

- **ERC-721 Compliant**: Full implementation of the ERC-721 standard
- **Dataset Access Tokens**: NFTs represent access rights to private data
- **Owner Controls**: Only NFTFactory can mint tokens
- **Auto-incrementing Token IDs**: Sequential token assignment starting from 0
- **Gas Efficient**: Custom errors and optimized storage patterns

### NFTFactory Features

- **Collection Creation**: Deploy dataset collections with metadata and pricing
- **Payment Processing**: Handle purchases with automatic fee distribution
- **Access Control**: Only collection owners can mint and manage their collections
- **Batch Operations**: Mint multiple NFTs in a single transaction (up to 100)
- **Collection Management**: Toggle active status, update CIDs, manage pricing
- **Query Functions**: Get collections, check ownership, view statistics

## Deployment

### Prerequisites

1. **FWS Payments Contract**: Deploy or obtain the address of an existing FWS Payments contract
2. **Payment Token**: Deploy or obtain the address of an ERC20 token (e.g., USDFC)
3. **Environment Variables**: Configure all required variables in `.env`

### Deploy NFTFactory

Deploy the NFTFactory contract with payment integration:

```bash
npx hardhat deploy --network calibrationnet
```

The deployment process will:
1. **Validate Environment**: Check for required contract addresses
2. **Deploy Contract**: Deploy NFTFactory with payments integration
3. **Verify Contract**: Automatic Etherscan verification (45s delay)
4. **Sync Contracts**: Update ABI files for CLI/MCP integration

### Expected Output

```bash
Wallet Ethereum Address: 0x...
Payments Contract Address: 0x...
Payment Token Address: 0x...
NFTFactory deployed to: 0x...
Waiting for 45 seconds...
Verifying NFTFactory contract on block explorer...
NFTFactory contract verified successfully!
Running post-deployment script...
```

Keep note of the deployed NFTFactory address for usage examples.

## Usage Examples

### 1. Create a Dataset Collection

```bash
npx hardhat create-collection \
  --factory 0x123...abc \
  --name "Weather Data 2024" \
  --symbol "WEATHER24" \
  --description "Comprehensive weather dataset for 2024" \
  --publicColumns "timestamp,location,temperature" \
  --privateColumns "sensor_id,raw_data,calibration" \
  --price "1000000000000000000" \
  --network calibrationnet
```

### 2. Set Dataset CIDs (Activate Collection)

```bash
npx hardhat set-collection-cid \
  --factory 0x123...abc \
  --collection 0x456...def \
  --publicCid "QmPublicDataHash..." \
  --privateCid "QmPrivateDataHash..." \
  --network calibrationnet
```

### 3. Purchase Dataset Access

```bash
# First approve token spending
npx hardhat approve-token \
  --token 0xabc...123 \
  --spender 0x123...abc \
  --amount "1000000000000000000" \
  --network calibrationnet

# Then purchase access
npx hardhat purchase-dataset \
  --factory 0x123...abc \
  --collection 0x456...def \
  --network calibrationnet
```

### 4. Mint NFT to Grant Access

```bash
npx hardhat mint-nft \
  --factory 0x123...abc \
  --collection 0x456...def \
  --to 0x789...ghi \
  --network calibrationnet
```

### 5. Batch Mint for Multiple Users

```bash
npx hardhat batch-mint \
  --factory 0x123...abc \
  --collection 0x456...def \
  --recipients "0x789...ghi,0xabc...123,0xdef...456" \
  --network calibrationnet
```

### 6. Get User Collections

```bash
npx hardhat get-collections \
  --factory 0x123...abc \
  --user 0x789...ghi \
  --network calibrationnet
```

### 7. Get Active Datasets

```bash
npx hardhat get-active-collections \
  --factory 0x123...abc \
  --network calibrationnet
```

### 8. Check Dataset Access

```bash
npx hardhat has-nft \
  --factory 0x123...abc \
  --collection 0x456...def \
  --user 0x789...ghi \
  --network calibrationnet
```

### 9. Withdraw Earnings

```bash
npx hardhat withdraw \
  --factory 0x123...abc \
  --network calibrationnet
```

### 10. Get Balance

```bash
npx hardhat get-balance \
  --factory 0x123...abc \
  --user 0x789...ghi \
  --network calibrationnet
```

## Contract Architecture

### NFT Contract (Dataset Access Tokens)

- Uses the factory pattern - created by NFTFactory
- Owner is set to NFTFactory (only factory can mint)
- Token URIs constructed as: `{BASE_TOKEN_URI}{tokenId}.json`
- Represents access rights to private dataset portions
- Implements safe transfer checks for contract recipients

### NFTFactory Contract (Payment-Integrated Marketplace)

- **Payment System**: Integrates with FWS Payments and ERC20 tokens
- **Fee Structure**: 10% deployer fee, 10% FWS fee, 80% collection owner
- **Dataset Management**: Stores public/private CIDs, column schemas, pricing
- **Access Control**: NFT ownership grants private data access
- **Balance System**: Internal balance tracking with withdrawal mechanism
- **Collection Lifecycle**: Creation → CID setting → activation → purchases

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
    uint256 price;           // Purchase price in payment token
    uint256 createdAt;       // Creation timestamp
    bool isActive;           // Can be purchased
}
```

### Payment Flow

1. **Buyer** approves ERC20 token spending to NFTFactory
2. **Buyer** calls `purchase()` with collection address
3. **NFTFactory** validates balance and allowance
4. **Tokens transferred** from buyer to NFTFactory
5. **Fee split**: 10% to deployer, 10% to FWS Payments, 80% to owner
6. **NFT minted** to buyer granting dataset access
7. **Balances updated** for withdrawals

## Error Handling

The contracts use custom errors for gas efficiency and clear debugging:

### NFT Contract Errors

- `NFT__TokenDoesNotExist()`: Token ID doesn't exist
- `NFT__NotOwnerOrApproved()`: Caller not authorized for token operation
- `NFT__TransferToZeroAddress()`: Cannot transfer to zero address
- `NFT__ApprovalToCurrentOwner()`: Cannot approve current owner
- `NFT__TransferToNonERC721Receiver()`: Transfer to non-compliant contract

### NFTFactory Payment Errors

- `NFTFactory__InsufficientPayment()`: Buyer lacks sufficient token balance
- `NFTFactory__InsufficientAllowance()`: Insufficient ERC20 allowance for purchase
- `NFTFactory__TransferFailed()`: Token transfer failed during payment
- `NFTFactory__InsufficientBalance()`: Attempting withdrawal with zero balance

### NFTFactory Collection Errors

- `NFTFactory__EmptyName()`: Collection name cannot be empty
- `NFTFactory__EmptySymbol()`: Collection symbol cannot be empty
- `NFTFactory__NotCollectionOwner()`: Caller doesn't own the collection

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

## Events

### NFT Contract Events

- `Transfer`: Standard ERC-721 transfer event
- `Approval`: Standard ERC-721 approval event
- `ApprovalForAll`: Standard ERC-721 approval for all event
- `TokenMinted`: Custom event for new token mints

### NFTFactory Collection Events

- `CollectionCreated`: Emitted when a new dataset collection is created
- `CollectionStatusUpdated`: Emitted when collection status changes

### NFTFactory Payment Events

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
  ```solidity
  event BalanceWithdrawn(
      address indexed owner,
      uint256 amount
  );
  ```

### Event Usage for Analytics

- **Revenue Tracking**: Monitor `NFTPurchased` events for sales analytics
- **User Activity**: Track `Transfer` events for dataset access patterns
- **Collection Performance**: Monitor creation and activation events
- **Payment Flow**: Track balance changes and withdrawals

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

### Payment System Testing

For comprehensive payment testing:

1. **Deploy Payment Token**: Deploy ERC20 test token for payments
2. **Deploy FWS Payments**: Deploy or use existing FWS Payments contract
3. **Deploy NFTFactory**: Deploy with payment integration
4. **Fund Test Accounts**: Distribute payment tokens to test users
5. **Test Purchase Flow**: End-to-end purchase and access testing

### Integration Testing Workflow

```bash
# Deploy to testnet
npx hardhat deploy --network calibration

# Create test collection
npx hardhat create-collection --factory <address> --name "Test" --symbol "TEST" --price "1000000000000000000" --network calibration

# Set CIDs to activate
npx hardhat set-collection-cid --factory <address> --collection <address> --publicCid "QmTest..." --privateCid "QmTest..." --network calibration

# Test purchase flow
npx hardhat approve-token --token <address> --spender <factory> --amount "1000000000000000000" --network calibration
npx hardhat purchase-dataset --factory <address> --collection <address> --network calibration

# Verify balances and access
npx hardhat get-balance --factory <address> --user <address> --network calibration
npx hardhat has-nft --factory <address> --collection <address> --user <address> --network calibration
```

## Security Considerations

### Access Control
1. **Collection Ownership**: Only collection owners can mint tokens and manage collections
2. **Factory Control**: Only NFTFactory can mint tokens in NFT contracts
3. **Payment Validation**: Comprehensive balance and allowance checking

### Payment Security
1. **Balance Validation**: Check buyer has sufficient tokens before transfer
2. **Allowance Checking**: Verify ERC20 approval before attempting transfer
3. **Transfer Safety**: Use OpenZeppelin SafeERC20 for token operations
4. **State Recovery**: Failed transfers restore previous contract state
5. **Reentrancy Protection**: FWS Payments contract uses ReentrancyGuard

### Smart Contract Security
1. **Input Validation**: All user inputs are validated and sanitized
2. **Integer Overflow**: Uses Solidity 0.8+ built-in overflow protection
3. **Gas Limits**: Batch operations limited to 100 items maximum
4. **Custom Errors**: Gas-efficient error handling over revert strings

### Environment Security
1. **Private Key Management**: Use hardware wallets for mainnet deployments
2. **Environment Isolation**: Separate `.env` files per network
3. **Address Verification**: Double-check payment contract addresses
4. **Multi-Signature**: Consider multi-sig for contract ownership

### Deployment Security
1. **Contract Verification**: Automatic verification on block explorers
2. **Constructor Validation**: Environment variable checks before deployment
3. **Post-Deployment Testing**: Comprehensive testing after deployment
4. **Emergency Procedures**: Document emergency response procedures

## Dataset Marketplace Workflow

### For Data Owners

1. **Create Collection**: Deploy a new dataset collection with metadata
2. **Upload Data**: Store public and private data on IPFS/Filecoin
3. **Set CIDs**: Configure public and private data CIDs to activate collection
4. **Set Pricing**: Define purchase price for dataset access
5. **Manage Collection**: Toggle active status, update metadata as needed
6. **Withdraw Earnings**: Collect 80% of purchase fees plus FWS payment benefits

### For Data Buyers

1. **Browse Datasets**: Query active collections to find relevant datasets
2. **Review Metadata**: Check public data samples and column schemas
3. **Approve Payment**: Approve USDFC token spending for purchase amount
4. **Purchase Access**: Buy dataset access NFT through the marketplace
5. **Access Data**: Use NFT ownership to access private dataset portions
6. **Transfer Rights**: Optional: transfer NFT to grant access to others

### For Developers

1. **Environment Setup**: Configure `.env` with required contract addresses
2. **Deploy Infrastructure**: Deploy payment token and FWS Payments if needed
3. **Deploy Marketplace**: Deploy NFTFactory with payment integration
4. **Integration**: Use CLI tasks or JavaScript SDK for application integration
5. **Monitoring**: Track events for analytics and user activity

## IPFS/Filecoin Integration

The marketplace is designed for decentralized storage:

- **Public Data**: Openly accessible dataset samples and metadata
- **Private Data**: Full dataset accessible only to NFT owners
- **CAR Files**: Use [go-generate-car tool](tools/go-generate-car) for Filecoin storage
- **Content Addressing**: IPFS CIDs ensure data integrity and permanence

## License

MIT License



# NFT Smart Contracts - FEVM Hardhat Kit

This project includes two main smart contracts for creating and managing NFT collections on the Filecoin EVM (FEVM).

## Setup & Installation

### Get a Private Key

You can get a private key from a wallet provider [such as Metamask](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/).

### Add your Private Key as an Environment Variable

Add your private key as an environment variable by running this command:

```bash
export PRIVATE_KEY='abcdef'
```

If you use a .env file, don't commit and push any changes to .env files that may contain sensitive information, such as a private key! If this information reaches a public GitHub repository, someone can use it to check if you have any Mainnet funds in that wallet address, and steal them!

### Fund the Deployer Address

Go to the [Calibrationnet testnet faucet](https://faucet.calibration.fildev.network/), and paste in your Ethereum address. This will send some calibration testnet FIL to the account.

## Contracts

### 1. NFT.sol

A fully compliant ERC-721 NFT contract that implements:

- Standard ERC-721 functionality (transfer, approve, etc.)
- ERC-721 Metadata extension for token URIs
- Minting functionality (only owner)
- Custom error handling for gas efficiency
- Console logging for debugging

### 2. NFTFactory.sol

A factory contract for creating and managing multiple NFT collections:

- Create new NFT collections with custom parameters
- Mint NFTs in any collection you own
- Batch mint functionality for efficiency
- Collection management (activate/deactivate)
- Query functions for collections and statistics

## Features

### NFT Contract Features

- **ERC-721 Compliant**: Full implementation of the ERC-721 standard
- **Metadata Support**: Configurable base URI for token metadata
- **Owner Controls**: Only the collection owner can mint new tokens
- **Auto-incrementing Token IDs**: Tokens are minted with sequential IDs starting from 0
- **Gas Efficient**: Uses custom errors and optimized storage patterns

### NFTFactory Features

- **Collection Creation**: Deploy new NFT contracts with custom name, symbol, and base URI
- **Access Control**: Only collection owners can mint in their collections
- **Batch Operations**: Mint multiple NFTs in a single transaction (up to 100)
- **Collection Management**: Toggle collection active status
- **Query Functions**: Get user collections, all collections, and detailed statistics

## Deployment

Deploy the NFTFactory contract:

```bash
yarn hardhat deploy --network calibrationnet
```

This will compile the contracts in the contracts folder and deploy them to the Calibrationnet test network automatically!

Keep note of the deployed contract addresses for the next step.

## Usage Examples

### 1. Create a New Collection

```bash
yarn hardhat create-collection \
  --factory 0x123...abc \
  --name "My Awesome Collection" \
  --symbol "MAC" \
  --baseuri "https://api.myproject.com/metadata/" \
  --network calibrationnet
```

### 2. Mint a Single NFT

```bash
yarn hardhat mint-nft \
  --factory 0x123...abc \
  --collection 0x456...def \
  --to 0x789...ghi \
  --network calibrationnet
```

### 3. Batch Mint NFTs

```bash
yarn hardhat batch-mint \
  --factory 0x123...abc \
  --collection 0x456...def \
  --recipients "0x789...ghi,0xabc...123,0xdef...456" \
  --network calibrationnet
```

### 4. Get User Collections

```bash
yarn hardhat get-collections \
  --factory 0x123...abc \
  --user 0x789...ghi \
  --network calibrationnet
```

### 5. Get All Collections

```bash
yarn hardhat get-collections \
  --factory 0x123...abc \
  --all true \
  --network calibrationnet
```

### 6. Get Collection Statistics

```bash
yarn hardhat collection-stats \
  --factory 0x123...abc \
  --collection 0x456...def \
  --network calibrationnet
```

## Contract Architecture

### NFT Contract

- Uses the factory pattern - created by NFTFactory
- Owner is set to the deployer (via NFTFactory)
- Token URIs are constructed as: `{baseTokenURI}{tokenId}.json`
- Implements safe transfer checks for contract recipients

### NFTFactory Contract

- Manages multiple NFT collections
- Stores collection metadata and ownership information
- Provides batch operations for efficiency
- Includes collection status management (active/inactive)

## Error Handling

The contracts use custom errors for gas efficiency:

### NFT Contract Errors

- `NFT__TokenDoesNotExist()`: Token ID doesn't exist
- `NFT__NotOwnerOrApproved()`: Caller not authorized for token operation
- `NFT__TransferToZeroAddress()`: Cannot transfer to zero address
- `NFT__ApprovalToCurrentOwner()`: Cannot approve current owner
- `NFT__TransferToNonERC721Receiver()`: Transfer to non-compliant contract

### NFTFactory Contract Errors

- `NFTFactory__EmptyName()`: Collection name cannot be empty
- `NFTFactory__EmptySymbol()`: Collection symbol cannot be empty
- `NFTFactory__NotCollectionOwner()`: Caller doesn't own the collection

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

### NFTFactory Contract Events

- `CollectionCreated`: Emitted when a new collection is created
- `CollectionStatusUpdated`: Emitted when collection status changes

## Testing

To test the contracts:

```bash
# Compile contracts
npm run compile

# Run tests (when test files are created)
npm run test

# Check test coverage
npm run coverage
```

## Security Considerations

1. **Access Control**: Only collection owners can mint tokens
2. **Input Validation**: All user inputs are validated
3. **Reentrancy Protection**: Safe transfer implementations
4. **Integer Overflow**: Uses Solidity 0.8+ built-in overflow protection
5. **Gas Limits**: Batch operations limited to 100 items max

## License

MIT License



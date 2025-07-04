# Filecoin Data Broker MCP Server

A Model Context Protocol (MCP) server implementation that provides blockchain-based dataset trading functionality using Filecoin, IPFS, and Ethereum smart contracts.

## Overview

This project implements an MCP server that enables AI agents and applications to discover, purchase, and query datasets stored on Filecoin/IPFS with Ethereum NFT-based access controls. The server provides a secure, decentralized marketplace for data trading with encrypted private datasets and public dataset previews.

## Features

### Core Functionality

- **Blockchain-Based Dataset Trading**: Purchase dataset access through Ethereum NFT contracts
- **Encrypted Private Data**: Secure private dataset columns with Lighthouse encryption
- **Public Data Previews**: Query public columns without purchase
- **SQL Query Interface**: Standard SQL queries on purchased datasets
- **IPFS/Filecoin Storage**: Decentralized data storage and retrieval

### MCP Tools

- **`list_datasets`**: Lists available datasets with metadata, pricing, and column information
- **`query_dataset`**: Executes SQL queries on purchased datasets (public and private data)

### Dataset Types

- **Public Columns**: Available for querying without purchase, stored on IPFS
- **Private Columns**: Encrypted, require NFT ownership to decrypt and access
- **Hybrid Access**: Full dataset access includes both public and private data after purchase

## Architecture

### Core Components

- **Entry Point**: `bin/index.js` - MCP server startup with stdio transport
- **Server**: `server.js` - MCP server instance and tool registration
- **Dataset Factory**: `lib/dataset/factory.js` - Abstract dataset creation and management
- **Blockchain Integration**: `lib/contracts/FDBRegistry.js` - Ethereum contract interactions
- **Data Access**: `lib/lighthouse.js` - IPFS/Filecoin data retrieval with encryption support

### Dataset Implementations

- **FilecoinDataset**: `lib/dataset/filecoin/FilecoinDataset.js` - Production blockchain-based datasets
- **LocalDataset**: `lib/dataset/mock/LocalDataset.js` - Development/testing mock datasets

### Security & Data Processing

- **SQL Security**: `lib/sql.js` - Query sanitization and access control
- **Ethereum Integration**: `lib/signer.js` - Blockchain authentication and signing

## Setup

### Prerequisites

- Node.js ≥20.0.0 (required for private field syntax)
- Ethereum private key for blockchain access
- Access to Ethereum network (mainnet or testnet)

### Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Environment configuration**:
   Create a `.env` file with:

```bash
ETHEREUM_PRIVATE_KEY=0x...  # Your Ethereum private key
```

3. **Start the server**:

```bash
npm start
```

### Development Mode

For development with MCP inspector and auto-reload:

```bash
npm run dev
```

This provides a debugging interface for testing tool calls and responses.

## Usage

### Basic Workflow

1. **List Available Datasets**:

   - Use `list_datasets` tool to see available datasets
   - Review metadata, pricing, and column information
   - Public columns are immediately queryable

2. **Purchase Dataset Access**:

   - Datasets require NFT purchase for private column access
   - Purchase happens automatically during first private data query
   - Payment processed through Ethereum smart contract

3. **Query Datasets**:
   - Use `query_dataset` tool with SQL queries
   - Public data: Available without purchase
   - Private data: Available after NFT ownership verification

### Example Tool Usage

**List datasets**:

```json
{
  "tool": "list_datasets",
  "parameters": {}
}
```

**Query dataset**:

```json
{
  "tool": "query_dataset",
  "parameters": {
    "datasetId": "0x1234...",
    "sql": "SELECT name, age FROM customers WHERE age > 25 LIMIT 100"
  }
}
```

## Project Structure

```
mcp/
├── bin/
│   └── index.js                    # Main executable entry point
├── lib/
│   ├── contracts/
│   │   ├── FDBRegistry.js          # Ethereum contract singleton
│   │   └── FDBRegistry.json        # Contract ABI and address
│   ├── dataset/
│   │   ├── factory.js             # Dataset factory pattern
│   │   ├── filecoin/
│   │   │   ├── FilecoinDataset.js        # Blockchain dataset implementation
│   │   │   └── FilecoinDatasetFactory.js # Filecoin dataset factory
│   │   └── mock/
│   │       ├── LocalDataset.js           # Mock dataset for testing
│   │       └── LocalDatasetFactory.js    # Local dataset factory
│   ├── tools/
│   │   ├── list-datasets.js       # MCP tool: list datasets
│   │   └── query-dataset.js       # MCP tool: query datasets
│   ├── lighthouse.js              # IPFS/Filecoin integration
│   ├── signer.js                  # Ethereum signer configuration
│   └── sql.js                     # SQL processing and security
├── sample/                        # Sample datasets for testing
├── server.js                      # MCP server and tool registration
├── types.d.ts                     # TypeScript type definitions
└── package.json                   # ESM module configuration
```

## Development

### Coding Conventions

- **Module System**: ESM modules with `.js` extensions in imports
- **Private Fields**: Modern `#fieldName` syntax for encapsulation
- **Async Patterns**: Prefer async/await over Promise chains
- **Type Safety**: JSDoc comments with TypeScript syntax for type hints

### Testing with Local Datasets

For development without blockchain dependency:

1. Switch to `LocalDatasetFactory` in `lib/dataset/factory.js`
2. Use sample data from `sample/` directory
3. Test tool functionality with MCP inspector

### Adding New Tools

1. Create tool file in `lib/tools/` directory
2. Follow existing tool patterns with Zod schemas
3. Import and register in `server.js`
4. Test with `npm run dev` and MCP inspector

### Blockchain Development

- Test on testnet before mainnet deployment
- Use environment variables for network configuration
- Handle gas costs and transaction failures gracefully
- Implement proper error handling for network issues

## Security Considerations

### Access Control

- NFT ownership verification for private dataset access
- SQL query sanitization to prevent injection attacks
- Ethereum private key protection via environment variables

### Data Privacy

- Private dataset columns encrypted with Lighthouse
- Public columns available for preview without purchase
- Secure authentication flows for data decryption

### Query Security

- Row limits enforced on SQL queries
- Table name restrictions and input validation
- Error messages that don't leak sensitive information

## API Reference

### Dataset Interface

All datasets implement the standard `Dataset` interface:

```typescript
interface Dataset {
  id: string;
  name: string;
  description: string;
  publicColumns: string[];
  privateColumns: string[];
  price?: number;
  query(sql: string): Promise<any[]>;
}
```

### Blockchain Integration

- **Contract Management**: Singleton pattern via `FDBRegistry.getInstance()`
- **Purchase Flow**: Automatic NFT minting during first private data access
- **Price Handling**: Prices stored in Wei, converted for display
- **Error Handling**: Graceful handling of transaction failures

## Requirements

- Node.js ≥20.0.0
- Ethereum private key with sufficient balance for transactions
- Network access to Ethereum blockchain and IPFS gateways

## License

MIT

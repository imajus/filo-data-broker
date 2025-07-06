# Filecoin Data Broker MCP Server

A Model Context Protocol (MCP) server implementation that provides blockchain-based dataset trading functionality using Filecoin, IPFS, Ethereum smart contracts, and Lit Protocol for decentralized encryption.

## Overview

This project implements an MCP server that enables AI agents and applications to discover, purchase, and query datasets stored on Filecoin/IPFS with Ethereum NFT-based access controls. The server provides a secure, decentralized marketplace for data trading with Lit Protocol encrypted private datasets and public dataset previews.

## Features

### Core Functionality

- **Blockchain-Based Dataset Trading**: Purchase dataset access through Ethereum NFT contracts
- **Lit Protocol Integration**: Decentralized encryption and access control for private datasets
- **SynapseStorage Integration**: Enhanced data fetching and management capabilities
- **Automatic Purchase Flow**: Seamless NFT purchase during dataset queries
- **Public Data Previews**: Query public columns without purchase
- **SQL Query Interface**: Standard SQL queries on purchased datasets
- **IPFS/Filecoin Storage**: Decentralized data storage and retrieval

### MCP Tools

- **`list_datasets`**: Lists available datasets with metadata, pricing, and column information
- **`query_dataset`**: Executes SQL queries on datasets with automatic purchase handling

### Dataset Types

- **Public Columns**: Available for querying without purchase, stored on IPFS
- **Private Columns**: Encrypted with Lit Protocol, require NFT ownership to decrypt and access
- **Hybrid Access**: Full dataset access includes both public and private data after purchase

## Architecture

### Core Components

- **Entry Point**: `bin/index.js` - MCP server startup with stdio transport
- **Server**: `server.js` - MCP server instance and tool registration
- **Dataset Factory**: `lib/dataset/factory.js` - Abstract dataset creation and management
- **Blockchain Integration**: `lib/contracts/FDBRegistry.js` - Ethereum contract interactions
- **Encryption Layer**: `lib/lit.js` - Lit Protocol integration for decentralized encryption
- **Storage Layer**: `lib/synapse.js` - SynapseStorage for enhanced data operations

### Dataset Implementations

- **FilecoinDataset**: `lib/dataset/filecoin/FilecoinDataset.js` - Production blockchain-based datasets with Lit Protocol decryption
- **LocalDataset**: `lib/dataset/mock/LocalDataset.js` - Development/testing mock datasets

### Security & Data Processing

- **SQL Security**: `lib/sql.js` - Query sanitization and access control
- **Ethereum Integration**: `lib/signer.js` - Blockchain authentication and wallet management
- **Decentralized Encryption**: Lit Protocol for secure data access control

## Setup

### Prerequisites

- Node.js ≥20.0.0 (required for private field syntax)
- Ethereum private key for blockchain access
- Access to Ethereum network (mainnet or testnet)

### Installation

### Manual Execution

```bash
ETHEREUM_PRIVATE_KEY=... npx -y fdb-mcp --help
```

### Claude Desktop

```json
{
  "mcpServers": {
    "filoDataBroker": {
      "command": "npx",
      "args": ["-y", "fdb-mcp"],
      "env": {
        "ETHEREUM_PRIVATE_KEY": "..."
      }
    }
  }
}
```

### Development Mode

1. Edit `.env` file by filling required values
1. Start MCP inspector and auto-reload:

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

2. **Query Datasets with Automatic Purchase**:

   - Use `query_dataset` tool with SQL queries
   - System automatically handles NFT purchase for private data access
   - Payment processed through Ethereum smart contract when needed
   - Lit Protocol handles decryption of private datasets post-purchase

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
│   │   └── query-dataset.js       # MCP tool: query datasets with auto-purchase
│   ├── lit.js                     # Lit Protocol integration
│   ├── signer.js                  # Ethereum wallet configuration
│   ├── sql.js                     # SQL processing and security
│   └── synapse.js                 # SynapseStorage integration
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

- Public columns available for preview without purchase
- Lit Protocol provides decentralized encryption and access control
- Automatic purchase and decryption workflows for seamless data access

### Query Security

- Row limits enforced on SQL queries
- Table name restrictions and input validation
- Error messages that don't leak sensitive information

## License

MIT

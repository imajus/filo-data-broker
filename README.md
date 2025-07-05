## 🚀 Project Summary

**FiloDataBroker** is a proof-of-concept platform to help data providers monetize their structured CSV datasets while protecting sensitive information using Filecoin Web Services (FWS) and NFT-gated access.

The service enables import of data via a CLI tool, storage of public and private columns as separate CSV files on Filecoin (using Synapse SDK), NFT-gated access to private data, and on-chain dataset metadata. The system includes automatic dataset preservation fees and guaranteed 7-day storage availability through FWS Payments smart contracts.

---

## 🏗️ Architecture Overview

```
       Data Provider (CLI)
                |
                | EOA Private Key & USDFC Balance
                v
+-------------------------------+
|      Filecoin (via FWS)       |
|-------------------------------|
| - Public CSV (unencrypted)    |
| - Private CSV (encrypted*)    |
| - Dataset Preservation        |
+-------------------------------+
        |
        | NFT Contract per Dataset
        v
+-------------------------------+
|   Filecoin EVM (FDBRegistry   |
|   + Dataset Metadata)         |
+-------------------------------+
        |
        v
+-------------------------------+
|   MCP Server (STDIO only)     |
|   (Auto-purchases NFTs)       |
+-------------------------------+
        |
        v
   Data Consumer (CLI/LLM Apps)
   (EOA Private Key required)
```

Main Flows:

- **Public columns**: Uploaded as CSV to Filecoin (unencrypted) via Synapse SDK with FilCDN for fast retrieval.
- **Private columns**: Uploaded as separate CSV to Filecoin (encrypted\*) via Synapse SDK with FilCDN for fast retrieval.
- **NFT Access**: Each dataset has its own NFT contract; holding an NFT grants access to private data.
- **Metadata**: Dataset name, description, schema, and CIDs stored in FDBRegistry smart contract.
- **Preservation Fees**: Automatic 7-day storage guarantee through FWS Payments with lockup periods.
- **No backend DB, no web portal, no off-chain registry.**

(\*): The private data is supposed to be encrypted, but this has been put aside from the PoC implementation due to time constraints.

---

## 🧩 Layers & Components

### 1. **CLI Tool for Data Providers**

- Accepts CSV file as data source.
- Guides user to select public/private columns.
- Splits CSV into two files: one with public columns, one with private columns (same row count).
- Uploads both CSV files to Filecoin via Synapse SDK.
- Interacts with FDBRegistry smart contract storing dataset metadata and CIDs.
- Requires EOA private key with USDFC balance and small FIL amount for gas.

### 2. **FDBRegistry Smart Contract (On-chain Registry + NFT Factory)**

- Each dataset is represented by its own entry in FDBRegistry.
- Stores dataset metadata: name, description, publicColumns, privateColumns, publicCid, privateCid, price.
- Acts as NFT factory - creates and manages NFT collections for each dataset.
- Handles payment processing with 10% service fee deduction.
- Integrates with FWS Payments for dataset preservation fees and 7-day lockup periods.

### 3. **MCP Server (STDIO Local Mode)**

- Reads dataset registry from FDBRegistry contract events/metadata.
- Provides two tools: `list_datasets` and `query_dataset`.
- Automatically purchases NFTs when data consumer requests private data access.
- Downloads and merges public/private CSV files for querying.
- Requires data consumer's EOA private key with USDFC balance.
- STDIO mode only - no HTTP REST API support.

### 4. **Data Storage & Preservation**

- **Public data**: CSV file on Filecoin, CID stored on-chain, accessible via FilCDN for fast retrieval.
- **Private data**: CSV file on Filecoin, CID stored on-chain, accessible via FilCDN for fast retrieval.
- **FWS Integration**: Filecoin Web Services for verifiable storage deals and payments.
- **Preservation System**: Automatic 7-day storage guarantee with lockup period extensions.

---

## 🔄 Core Flows / User Stories

### Data Provider

1. **Prepare CSV**: User prepares a CSV file with their dataset.
2. **Run CLI Tool**: Selects public/private columns, sets dataset price in USDFC.
3. **CSV Splitting**: CLI splits CSV into public and private column files (equal row counts).
4. **Upload to Filecoin**: Both CSV files uploaded to Filecoin via Synapse SDK.
5. **Register Dataset**: Metadata stored in FDBRegistry contract with CIDs and pricing.

### Data Consumer (LLM, App, etc.)

1. **Discover Datasets**: Uses MCP server to list/search datasets and view schemas (public, no auth).
2. **Query Data**: Uses MCP server with EOA private key to query datasets.
3. **Automatic NFT Purchase**: MCP server automatically purchases NFT for private data access when needed.
4. **Data Access**: MCP downloads and merges public/private CSV files for complete dataset access.

---

## 🧪 PoC Limitations & Assumptions

- Only CSV files supported as data source in CLI for PoC.
- NFT ownership is the sole access and proof mechanism for private data and acts as proof of legal data access.
- No per-query auditing, no off-chain registry, no web portal, no backend DB.
- All dataset metadata stored on-chain in FDBRegistry contract.
- No encryption/decryption in PoC - can be added later with DePin platforms like Lit Protocol.
- MCP server automatically handles NFT purchasing - no manual authentication required.
- STDIO mode only for MCP server - no HTTP REST API mode.

---

## 💰 Pricing & Preservation System

### Payment Structure

- **Dataset Price**: Set by data provider in USDFC tokens
- **Service Fee**: 10% deducted from dataset price
- **Preservation Fee**: Automatically calculated based on dataset size and storage costs
- **Total Cost**: Dataset price + preservation fee (service fee deducted from dataset price portion)

### Dataset Preservation

- **7-Day Guarantee**: Each purchase triggers 7-day guaranteed storage availability
- **FWS Integration**: Uses Filecoin Web Services Payments for lockup periods
- **Automatic Extension**: Popular datasets maintain persistence even if original provider stops paying
- **Lockup Periods**: Preservation fees automatically transferred to FWS Payments with 7-day lockup extensions

---

## 🛠️ Technical Integration

### Synapse SDK Integration

Using the [Synapse SDK](https://raw.githubusercontent.com/FilOzone/synapse-sdk/refs/heads/master/README.md):

- **Storage Service Creation**: Creating Proof Sets for Filecoin storage operations
- **USDFC Payments**: Deposits and allowances for storage services
- **Upload Operations**: CSV data uploading to Proof Sets
- **Download Operations**: CSV data retrieval in MCP server
- **Payment Management**: Automatic handling of storage costs and lockup periods

### Filecoin Web Services (FWS)

- **Custom Deployment**: Deployed a custom copy of Pandora Service smart contract as an arbiter/listener implementation integrated with Synapse SDK - [0xAB18...FaA6](https://filecoin-testnet.blockscout.com/address/0xAB187e95508699b36b91b727365E1B24362eFaA6)
- **FilCDN Integration**: Leverages FilCDN for fast data retrieval and improved performance when accessing dataset content
- **Trustless Lockup Extensions**: Custom implementation allows increasing dataset lockup periods in a trustless manner, preventing data providers from withdrawing preservation funds
- **Data Persistence Guarantees**: Disallowing fund withdrawals provides guaranteed data persistence to data consumers for the locked period
- **Upstream Contribution**: Submitted [PR #72](https://github.com/FilOzone/filecoin-services/pull/72) to Pandora Service upstream repository with helpful functions for the implementation

### FilCDN Integration

- **CDN Support**: Enabled for faster data access via FilCDN

---

## ⚙️ Quick Start (For Hackathon Demo)

1. **Provider:**  
   a. Prepare your CSV file with public/private data columns or choose one of the sample datasets in `cli/sample` folder.
   b. Get private key from EOA with some USDFC tokens on Filecoin Calibration network  
   c. (optional) Run `npx fdb-cli balance` to check yout balance
   d. Run `npx fdb-cli setup` to do the initial FWS setup
   e. Run `npx fdb-cli import` to share the dataset:

   - Enter name & descriptio
   - Select private columns
   - Set dataset price in USDFC token (e.g. `0.1`)
   - The tool will split CSV to public/private chunks and upload them to Filecoin, register the dataset in FDBRegistry

2. **Consumer:**  
   a. Integrate MCP server with EOA private key to discover datasets to any LLM application, e.g. Claude Desktop (see detailed instruction [here](./mcp/README.md))
   b. Provide private key from EOA with some USDFC tokens for NFT purchases
   c. Query public data freely; MCP auto-purchases NFT for private data access  
   d. MCP downloads and merges CSV files for complete dataset querying

---

## 📚 Documentation

- [CLI Tool Usage](cli/README.md)
- [MCP Documentation](mcp/README.md)
- [EVM Smart Contracts](evm/README.md)

---

## 🤝 Contributing

PRs welcome! Bug reports, ideas, feedback—open an issue or send a pull request.

---

## 📝 License

MIT

## 🚀 Project Summary

**FiloDataBroker** is a proof-of-concept platform to help data providers monetize their structured CSV datasets while protecting sensitive information using decentralized storage and NFT-gated access.

The service enables import of data via a CLI tool, storage of public and private columns on IPFS/Filecoin (using Lighthouse SDK), NFT-gated access to encrypted private data, and on-chain dataset metadata. No centralized backend, no custom API keys, no off-chain registry—everything is decentralized and NFT-driven.

---

## 🏗️ Architecture Overview

```
       Data Provider (CLI)
                |
                | Lighthouse API Key & EOA Private Key
                v
+-------------------------------+
|         IPFS/Filecoin         |
|-------------------------------|
| - Public Data CSV             |
| - Private Data (Encrypted)    |
| - CIDs for Private Data       |
+-------------------------------+
        |
        | NFT Contract Deployed (per dataset)
        v
+-------------------------------+
|   Filecoin EVM (NFTs +       |
|   Dataset Metadata On-chain)  |
+-------------------------------+
        |
        v
+-------------------------------+
|   MCP Server (REST API)       |
|   (No DB, No Web Portal)      |
+-------------------------------+
        |
        v
   Data Consumer (CLI, LLM, App)
```

Main Flows:

- **Public columns**: Uploaded as CSV to IPFS/Filecoin (unencrypted).
- **Private columns**: Encrypted, uploaded as separate files to IPFS/Filecoin, CIDs referenced in public CSV.
- **NFT Access**: Each dataset has its own NFT contract; holding an NFT from the collection grants access to the private data.
- **Metadata**: Dataset name, description, schema, and CIDs are stored in the NFT contract on-chain.
- **No backend DB, no web portal, no off-chain registry.**

---

## 🧩 Layers & Components

### 1. **CLI Tool for Data Providers**

- Accepts CSV file as data source.
- Guides user to select public/private columns.
- Encrypts private data, uploads both public and private data to IPFS/Filecoin via Lighthouse SDK.
- Deploys a new NFT contract for each dataset on Filecoin EVM, storing dataset metadata and CIDs.
- Requires Lighthouse API key and Ethereum EOA private key.

### 2. **NFT Smart Contracts (On-chain Registry)**

- Each dataset is represented by its own NFT contract on Filecoin EVM.
- Stores dataset metadata (name, description, schema, CIDs for public/private data).
- NFT ownership is the sole access control for private data.

### 3. **MCP Server (REST API)**

- Reacts to NFTFactory contract to list all datasets (by reading on-chain events/metadata).
- Allows public search/listing of datasets and schemas (no authorization required).
- Allows querying of datasets; for private data, requires a signed message with NFT-owning EOA private key as argument.
- No frontend, no extra backend, no database.

### 4. **Data Storage**

- **Public data**: CSV file on IPFS/Filecoin (unencrypted), CID stored on-chain.
- **Private data**: Encrypted files on IPFS/Filecoin, CIDs referenced in public CSV and stored on-chain.

---

## 🔄 Core Flows / User Stories

### Data Provider

1. **Prepare CSV**: User prepares a CSV file with their dataset.
2. **Run CLI Tool**: Selects public/private columns, encrypts private data, uploads both to IPFS/Filecoin.
3. **Deploy NFT Contract**: CLI deploys a new NFT contract for the dataset, storing all metadata and CIDs on-chain.

### Data Consumer (LLM, App, etc.)

1. **Discover Datasets**: Uses MCP server to list/search datasets and view schemas (public, no auth).
2. **Purchase NFT**: Acquires NFT from the dataset's collection (Filecoin EVM, via external means).
3. **Query Data**: Uses MCP server to query datasets. For private data, provides a signed message with EOA private key; MCP verifies NFT ownership and provides access to encrypted data.
4. **Decrypt & Use**: Decrypts private data using access granted by NFT ownership.

---

## 🧪 PoC Limitations & Assumptions

- Only CSV files supported as data source in CLI for PoC.
- NFT ownership is the sole access and proof mechanism for private data and acts as a proof of legal data access.
- No per-query auditing, no off-chain registry, no web portal, no backend DB.
- All dataset metadata is stored on-chain in NFT contracts.
- Security, legal compliance, and data provider KYC out of initial scope.
- Querying private data requires passing a signed message with EOA private key to MCP server.

---

## ⚙️ Quick Start (For Hackathon Demo)

1. **Provider:**  
   a. Prepare your CSV file  
   b. Run CLI tool, select public/private columns  
   c. Upload data to IPFS/Filecoin, deploy NFT contract, store metadata on-chain

2. **Consumer:**  
   a. Use MCP server to find dataset  
   b. Acquire NFT from dataset's collection (Filecoin EVM)  
   c. Query public data freely; for private data, provide signed message with EOA private key to MCP server

---

## 📚 Documentation

- [CLI Tool Usage](cli/README.md)
- [MCP Documentation](mcp/README.md)

---

## 🤝 Contributing

PRs welcome! Bug reports, ideas, feedback—open an issue or send a pull request.

---

## 📝 License

MIT

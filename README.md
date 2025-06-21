## 🚀 Project Summary

**FiloDataBroker** is a proof-of-concept platform to help data providers (e.g., database owners) legally and simply monetize their structured datasets while protecting sensitive information.

The service enables import of data via a CLI tool, storage of public fields for fast query, secure storage and access control for sensitive fields using decentralized storage (Filecoin/IPFS), and token/NFT-gated access for data consumers (such as LLM-powered apps).

No unofficial scraping, no middlemen—creators get paid, and consumers use data legally.

---

## 🏗️ Architecture Overview

```
       Data Provider (CLI)
                |
                | API Key Auth
                v
+-------------------------------+
|   PoC Service Backend API     |
|-------------------------------|
| - Public Data Store (DB)      |
| - Sensitive Data Encrypted    |
| - NFT Minting & Gated Access  |
| - Dataset Registry/Discovery  |
+-------------------------------+
        |             |
        |             |
        v             v
MongoDB Source   IPFS/Filecoin (via Lighthouse API)
                   (Encrypted Sensitive Data)
               (Access controlled by NFT ownership)

                ^
                | API Key Auth
                |
       Data Consumer (MCP Client, LLM, App)
```

Main Flows:

- **Public fields**: Fast-access DB for query/search via API.
- **Private fields**: Encrypted, uploaded as row JSONs to IPFS/Filecoin, Lighthouse API enforces NFT-based access.
- **Payment/Access**: Data consumers buy per-dataset NFTs to gain access to sensitive data.

---

## 🧩 Layers & Components

### 1. **CLI Tool for Data Providers**

- Connects to MongoDB on local infastructure.
- Guides user to select dataset, public/private fields.
- Uploads public data to backend DB; private data encrypted, uploaded to IPFS/Filecoin (per row, via Lighthouse).
- Registers dataset metadata with backend service.
- Requires API Key (obtained from web portal).

### 2. **Backend Service**

- Hosts public/queryable datasets.
- Generates and mints ERC-721 NFTs for each dataset on Filecoin EVM.
- Registers datasets for discovery, manages API keys.
- Manages Lighthouse token-gating and sensitive data pointers (CIDs).
- Provides REST API endpoints for search, access, NFT status, etc.

### 3. **Frontend Web Portal**

- User signup/login and API key management.
- Dataset browsing/search/registry interface.
- NFT purchase/minting for dataset access (USDFC payments).

### 4. **Consumer API (MCP)**

- REST API for dataset discovery, list, schema, and query.
- Enforces API Key check and, for sensitive/private requests, verifies NFT holding using Lighthouse’s on-chain integration.
- Serves as a remote plugin for LLM apps.

### 5. **Data Storage**

- **Public data**: Fast-access backend database.
- **Private data**: Per-row encrypted JSONs uploaded to Filecoin/IPFS (via Lighthouse), CIDs referenced in backend DB.

---

## 🔄 Core Flows / User Stories

### Data Provider

1. **Registration**: Signs up on portal, receives API key.
2. **Run CLI Tool**: Connect to MongoDB, select data, define public/private fields.
3. **Secure Upload**: CLI batches and uploads, encrypts sensitive rows, uploads via Lighthouse API.
4. **Dataset Registered**: Confirmed/visible in backend registry and searchable.

### Data Consumer (LLM, App, etc.)

1. **Browse/Discover**: Uses portal or MCP to find relevant datasets.
2. **Purchase NFT**: For private access, buys NFT (one per dataset) via portal (Filecoin network, USDFC).
3. **Query Data**: Gets public data instantly; provides NFT/API key for private fields—MCP checks NFT, fetches and decrypts from IPFS/Filecoin using Lighthouse API.
4. **Consume Legally**: Holds NFT as proof of access; fully authorized to use the data.

---

## 🧪 PoC Limitations & Assumptions

- Only MongoDB supported as source in CLI for PoC.
- NFT purchase/hold used as sole access and proof mechanism for private data.
- No per-query auditing or on-chain registry for datasets (off-chain/web registry only).
- Hard-coded row/result limits for API queries.
- Security, legal compliance, and data provider KYC out of initial scope.

---

## ⚙️ Quick Start (For Hackathon Demo)

1. **Provider:**  
   a. Register on portal, get API key  
   b. Run CLI tool, connect to your MongoDB, select dataset/fields  
   c. Upload data, view dataset in registry

2. **Consumer:**  
   a. Find dataset on portal  
   b. Purchase NFT via "Buy Access" (get wallet ready, use USDFC)  
   c. Use API key and NFT to access full dataset from your LLM/application

---

## 📚 Documentation

- [CLI Tool Usage](cli/README.md)
- [MCP Documentation](mcp/README.md)
- [Web Portal Walkthrough](web/README.md)

---

## 🤝 Contributing

PRs welcome! Bug reports, ideas, feedback—open an issue or send a pull request.

---

## 📝 License

MIT

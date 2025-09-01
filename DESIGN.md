# FiloDataBroker: Product Design

## WordPress Content Monetization Platform for AI/LLM Use

### 1. Executive Summary

FiloDataBroker is a decentralized platform that empowers WordPress content creators to directly monetize their content for LLM training, analytics, and other data consumers. The platform leverages Filecoin's Proof of Data Possession (PDP) for verifiable hot storage and smart contracts for transparent payment rails, creating a legitimate marketplace for high-quality, schema-rich datasets.

### 2. Problem Statement

Content creators currently face several critical challenges:

- **Lost Monetization**: Content is scraped by bots for LLM training without compensation
- **No Control**: Creators cannot define what data is public vs. private or set access pricing
- **Black Market Data**: Middlemen profit from selling scraped datasets, often breaching copyright
- **Compliance Risks**: LLMs lack reliable proof of licensing/content rights
- **Technical Barriers**: Non-technical creators have no tools to reach data buyers or defend against scraping

### 3. Solution Overview

FiloDataBroker provides a complete ecosystem for legitimate data monetization:

```mermaid
flowchart TB
    subgraph WordPress Sites
      WP1[Content DB]
      WP2[WordPress Plugin]
      WP3[Content Protection]
      WP1 --> WP2
      WP2 --> WP3
    end

    subgraph Filecoin Infrastructure
      FC1[PDP Storage Provider]
      FC2[Public Dataset Storage]
      FC3[Private Dataset Storage]
      FC1 --> FC2
      FC1 --> FC3
    end

    subgraph On-chain Platform
      OC1[FDBRegistry Contract]
      OC2[NFT Access Passes]
      OC3[Payment Rails]
      OC1 --> OC2
      OC1 --> OC3
    end

    subgraph Data Consumers
      DC1[MCP Server Client]
      DC2[LLM Companies]
      DC3[Analytics Firms]
      DC1 --> DC2
      DC1 --> DC3
    end

    WP2 -->|Export & Upload| FC1
    WP2 -->|Register| OC1
    DC1 -->|Query & Purchase| OC1
    DC1 -->|Access Data| FC1
    OC3 -->|Payments| WP1
```

### 4. Target Users

| User Type            | Persona                                          | Key Needs                                                      |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| **Content Creators** | WordPress site owners, bloggers, media companies | Passive monetization, data control, no-code tools              |
| **Data Consumers**   | LLM/AI companies, analytics firms, researchers   | Legitimate data access, high-quality datasets, API integration |
| **Developers**       | Platform engineers at LLM providers              | Broad content feeds, verifiable licensing, easy integration    |
| **Web3 Collectors**  | DePIN/DeSoc enthusiasts                          | Proof of access, support for content creators                  |

### 5. Core Features & Requirements

### 5.1 WordPress Plugin

#### Functional Requirements

- **Data Export Configuration**
  - No-code UI for selecting exportable content fields
  - Public/private field mapping interface
  - Support for posts, metadata, custom fields
  - Automated dataset splitting (public/private)
- **Pricing & Monetization**

  - Simple pricing interface per dataset
  - Recommended pricing suggestions based on content value
  - Support for one-time and subscription models
  - Revenue tracking dashboard

- **Content Protection Integration**
  - Recommended setup of WordPress plugins for effective blocking
  - Potential one-click Cloudflare integration

#### Technical Requirements

- Compatible with WordPress 5.0+
- PHP 7.4+ support
- No performance impact
- Secure wallet integration (MetaMask, WalletConnect)

### 5.2 On-chain Storage and Registry

```mermaid
sequenceDiagram
    participant Creator as Content Creator
    participant Plugin as WP Plugin
    participant PDP as PDP Storage
    participant Registry as FDBRegistry
    participant NFT as NFT Factory

    Creator->>Plugin: Configure dataset export
    Plugin->>Plugin: Split public/private data
    Plugin->>PDP: Upload to Filecoin via PDP
    PDP-->>Plugin: Return CIDs
    Plugin->>Registry: Register dataset metadata
    Registry->>NFT: Prepare NFT template
    Note over Registry,NFT: Dataset ready for purchase
```

#### Functional Requirements

- **Dataset Management**

  - Immutable dataset registration
  - Metadata storage (name, description, schema)
  - Version control for dataset updates
  - Public/private CID tracking

- **Access Control**
  - NFT-based access passes for private data
  - Time-limited access options
  - Transferable access rights

#### Technical Requirements

- Gas-optimized smart contracts
- Filecoin PDP integration for hot storage
- IPFS-compatible content addressing

### 5.3 MCP Server (Data Access Layer)

```mermaid
flowchart LR
    subgraph MCP Server
      MS1[Discovery API]
      MS2[Payment Handler]
      MS3[Data Retrieval]
      MS4[SQL Query Engine]
    end

    subgraph Consumer Wallet
      CW[EOA/Wallet Key]
    end

    subgraph Data Access
      DA1[Public Datasets]
      DA2[Private Datasets]
      DA3[Merged View]
    end

    CW --> MS1
    MS1 --> MS2
    MS2 -->|NFT Check| DA2
    MS2 -->|Free Access| DA1
    MS3 --> DA3
    MS4 --> DA3
```

#### Functional Requirements

- **Dataset Discovery**

  - List available datasets with metadata
  - Search and filter capabilities
  - Schema inspection before purchase
  - Preview of public fields

- **Payment & Access**

  - Automated NFT minting on purchase
  - Wallet-based authentication
  - Proof of purchase verification
  - Access rights validation

- **Data Querying**
  - SQL interface via AlaSQL
  - In-memory data merging
  - Export to common formats (CSV, JSON)
  - Pagination for large datasets

#### Technical Requirements

- STDIO mode support for local operation
- <500ms query response time for 1GB datasets
- Support for concurrent queries
- Memory-efficient data handling

### 5.4 Payment Infrastructure

```mermaid
stateDiagram-v2
    [*] --> DatasetCreated: Creator uploads
    DatasetCreated --> Listed: Set pricing
    Listed --> Purchased: Consumer buys NFT
    Purchased --> Accessing: NFT verified
    Accessing --> Settled: Payment distributed
    Settled --> [*]
```

#### Functional Requirements

- **Payment Processing**
  - Smart contract-based escrow
  - Automatic creator payouts
  - Platform fee collection (2-5%)
  - Stablecoin support (USDFC)

#### Technical Requirements

- Integration with Filecoin payment rails
- Sub-second transaction confirmation
- Gas-optimized settlement
- Audit trail for all transactions

### 6. User Journeys

### 6.1 Creator Journey

```mermaid
journey
    title Content Creator Monetization Journey
    section Setup
      Install Plugin: 5: Creator
      Connect Wallet: 4: Creator
      Configure Export: 4: Creator
      Set Pricing: 5: Creator
    section Protection
      Enable Cloudflare: 3: Creator
      Block Scrapers: 5: Creator
    section Revenue
      Dataset Purchased: 5: Creator, Consumer
      Receive Payment: 5: Creator
      Track Analytics: 4: Creator
```

### 6.2 Consumer Journey

```mermaid
journey
    title Data Consumer Purchase Journey
    section Discovery
      Browse Datasets: 5: Consumer
      Inspect Schema: 4: Consumer
      Check Pricing: 3: Consumer
    section Purchase
      Connect Wallet: 4: Consumer
      Purchase NFT: 3: Consumer
      Receive Access: 5: Consumer
    section Usage
      Query Data: 5: Consumer
      Integrate with LLM: 4: Consumer
```

### 7. Technical Architecture

```mermaid
graph TB
    subgraph Frontend Layer
      UI1[WordPress Admin UI]
      UI2[MCP Client Interface]
    end

    subgraph Application Layer
      APP1[WP Plugin Logic]
      APP2[MCP Server]
    end

    subgraph Blockchain Layer
      BC1[FDBRegistry Contract]
      BC2[NFT Factory]
      BC3[Payment Rails]
      BC4[PDP Verifier]
      BC5[Pandora Service]
      BC6[Storage Provider]
    end

    subgraph Storage Layer
      ST2[FilCDN]
    end

    subgraph External Services
      EX1[Cloudflare]
      EX2[Price Oracles]
      EX3[Analytics]
    end

    UI1 --> APP1
    UI2 --> APP2

    APP1 --> BC1
    APP1 --> BC5
    BC5 --> BC6
    APP2 --> BC1
    APP2 --> ST2

    BC1 --> BC2
    BC3 --> BC4

    APP1 --> EX1
```

### 8. Unique Filecoin Properties

FiloDataBroker leverages several unique Filecoin capabilities that are crucial for the project's success:

### 8.1 Data Availability Verification via PDP

- **Built-in Protocol Verification**: Filecoin's Proof of Data Possession (PDP) provides cryptographic guarantees that data is immediately available without requiring retrieval
- **Hot Storage Assurance**: Unlike traditional cold storage, PDP enables sub-second access to data while maintaining verifiable availability
- **Continuous Verification**: Automated daily challenges ensure data remains accessible throughout the storage period

### 8.2 Flexible Streaming Payment Infrastructure

- **Filecoin Pay Integration**: Native support for continuous, rate-based payments between creators and consumers
- **Lockup Mechanisms**: Guaranteed payment windows protect both parties with pre-funded lockups
- **Automatic Settlement**: Smart contract-based settlement removes payment friction and ensures timely compensation

### 8.3 Trustless On-chain Access Rights

- **ERC721 Token Standard**: NFT-based access passes provide immutable proof of data purchase rights
- **Decentralized Verification**: Access rights are verified on-chain without requiring trusted intermediaries
- **Transferable Ownership**: Data access rights can be traded or transferred, creating a secondary market for valuable datasets

### 9. MVP Scope

### Phase 0: Hackathon PoC (done)

- [x] Simple FDBRegistry smart contract
- [x] PDP storage integration
- [x] Basic NFT access control
- [x] MCP server with basic querying
- [x] NFT minting on purchase
- [x] Multi-dataset support
- [x] Payment rail integration
- [x] Private data encryption
- [x] FilCDN integration

### Phase 1: WordPress Plugin PoC (Weeks 1-2)

- [ ] Basic WordPress plugin with export functionality
- [ ] Simple admin UI with web3 wallet integration
- [ ] Guidelines for setting up other plugins for blocking AI crawlers
- [ ] Collect feedback & adjust next phases accordingly

### Phase 2: Data Access (Weeks 1-2)

- [ ] Datasets updating & versioning
- [ ] Analytics dashboard in WordPress plugin
- [ ] Remote querying capabilities via MCP server

### Phase 3: Monetization (Months 1-2)

- [ ] Web2 data marketplace for AI/LLM applications
- [ ] Standard for AI/LLM applications integration
- [ ] Secure micro-payments integration into the MCP server

### 10. Future Enhancements

```mermaid
timeline
    title FiloDataBroker Roadmap

    Q4 2025 : MVP Launch
            : Basic Plugin
            : Integration Standard Development

    Q1 2026 : Enhanced Features
            : Advanced Querying
            : Micro-Payments

    Q2 2026 : Scale & Optimize
            : Enterprise Features
            : Data Marketplace

    Q3 2026 : Ecosystem Growth
            : Partner Integrations
            : Cross-chain Support

    Q4 2026 : Advanced Capabilities
            : AI-powered Pricing
            : Real-time Sync
```

### 11. Dependencies

- **External Dependencies**

  - Filecoin PDP mainnet stability
  - WordPress plugin approval
  - Cloudflare API availability
  - Web3 wallet adoption

- **Internal Dependencies**
  - Smart contract audits
  - Security reviews
  - Documentation completion
  - Community building

### 12. Open Questions

1. **Pricing Model**: Should we support dynamic pricing based on demand?
2. **Data Updates**: How to handle incremental updates to datasets?
3. **Privacy Compliance**: GDPR/CCPA implications for data export?
4. **Quality Assurance**: Automated vs. manual dataset verification?
5. **Network Effects**: Incentive mechanisms for early adopters?

### 13. Conclusion

FiloDataBroker represents a paradigm shift in content monetization, transforming WordPress sites from passive scraping victims into active participants in the data economy. By leveraging Filecoin's PDP for verifiable storage and smart contracts for transparent payments, we create a sustainable, legitimate marketplace that benefits both creators and consumers while maintaining the open nature of the web.

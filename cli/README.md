# Filo Data Broker CLI

A command-line interface tool for importing CSV data to FiloDataBroker registry with privacy-aware column selection, NFT collection creation, and Filecoin network integration for decentralized storage and payments.

## Installation

```bash
npm install
```

## Usage

```bash
# Set up payment rail (first time setup)
npx fdb-cli setup --private-key YOUR_PRIVATE_KEY

# Check wallet and payment balances
npx fdb-cli balance --private-key YOUR_PRIVATE_KEY

# Import data from a CSV file (interactive mode)
npx fdb-cli import --private-key YOUR_PRIVATE_KEY --file ./data.csv

# Show help
npx fdb-cli --help
npx fdb-cli setup --help
npx fdb-cli balance --help
npx fdb-cli import --help
```

## Features

- **CSV Header Analysis**: Automatically reads and displays CSV column names
- **Interactive Privacy Selection**: Choose which columns contain sensitive/private data
- **NFT Collection Creation**: Creates blockchain-based NFT collections for data ownership
- **Filecoin Network Integration**: Decentralized storage and payment processing
- **Payment Rail Management**: USDFC token support with allowances and deposits
- **Dual Data Upload**: Separate handling of public and private data with IPFS CIDs
- **Error Handling**: Comprehensive validation and progress reporting

## Development

```bash
# Install dependencies
npm install

# Test the CLI
npm start -- --help
```

## Commands

### setup

Set up the Synapse payment rail for data storage operations.

**Required Arguments:**

- `-p, --private-key <key>` - Ethereum account private key

**Process:**

1. 💳 **Payment Rail Setup**: Initializes Filecoin payment rail
2. 🔍 **Proofset Selection**: Selects optimal proofset for storage
3. 💰 **Reservation**: Reserves storage capacity with USDFC tokens

**Example:**

```bash
npx fdb-cli balance --private-key YOUR_PRIVATE_KEY
```

### balance

Check wallet and payment balances across different tokens and services.

**Required Arguments:**

- `-p, --private-key <key>` - Ethereum account private key

**Information Displayed:**

- 💰 **Wallet Balance**: USDFC token balance in wallet
- 🏦 **Deposit Balance**: Available USDFC in payment system
- 🔒 **Allowance**: Payment allowance for storage operations

**Example:**

```bash
npx fdb-cli balance --private-key YOUR_PRIVATE_KEY
```

### import

Import data from a CSV file to the Filo Data Broker with NFT collection creation and privacy configuration.

**Required Arguments:**

- `-f, --file <path>` - Path to the CSV file to import
- `-p, --private-key <key>` - Ethereum account private key

**Interactive Process:**

1. 📄 **CSV Analysis**: Reads and parses the CSV file
2. 📝 **Collection Setup**: Enter dataset name, description, and price
3. 📋 **Column Display**: Shows all available column names
4. 🔒 **Privacy Selection**: Interactive checkbox to select private data columns
5. 🎨 **NFT Creation**: Creates blockchain NFT collection
6. 📤 **Data Upload**: Uploads public and private data separately
7. 🔗 **Dataset Linking**: Links uploaded data to NFT collection

**Example:**

```bash
npx fdb-cli import -- --private-key YOUR_PRIVATE_KEY --file ./data.csv
```

**Sample Output:**

```
🚀 Starting data import...
CSV File: ./data.csv
Wallet Address: 0x...

? Enter the name of the dataset: My Dataset
? Enter the description of the dataset: A sample dataset for testing
? Enter the price for the dataset (in USDFC): 0.1

✅ CSV headers parsed successfully!

📋 Column names found:
  1. id
  2. name
  3. email
  4. phone
  5. address

🔒 Privacy Configuration
? Select which columns contain private/sensitive data: (Press <space> to select)
❯◯ id
 ◯ name
 ◯ email
 ◯ phone
 ◯ address

✅ Private data columns selected:
  🔒 email
  🔒 phone

📋 Public data columns:
  📝 id
  📝 name
  📝 address

▶️ Creating NFT collection...
✅ NFT collection created successfully!

📊 Starting row-by-row processing...
▶️ Starting public data upload...
✅ Public data uploaded successfully!
▶️ Starting private data upload...
✅ Private data uploaded successfully!
▶️ Linking dataset to NFT collection...
✅ Dataset linked to NFT collection!

📈 All done! Processing summary:
  • Total rows processed: 150
  • NFT collection address: 0x...
  • Public CID: Qm...
  • Private CID: Qm...
```

## Workflow

### First Time Setup

1. **Setup Payment Rail**:

   ```bash
   npx fdb-cli setup --private-key YOUR_PRIVATE_KEY
   ```

2. **Check Balances**:

   ```bash
   npx fdb-cli balance --private-key YOUR_PRIVATE_KEY
   ```

3. **Import Data**:
   ```bash
   npx fdb-cli import --private-key YOUR_PRIVATE_KEY --file ./data.csv
   ```

## Sample Datasets

1. `sample/bali.csv` - Bali Tourism Destinations:

   This dataset contains information about tourist attractions in Bali collected through automated scraping from Google Maps. It covers 761 tourist spots spread across 9 regencies/cities in Bali Island. The dataset aims to provide a comprehensive overview of the locations, categories, and popularity of Bali's tourist destinations.

1. `sample/quotes.csv` - Famous People Quotes:

   This dataset contains a collection of inspirational quotes scraped from quotes.toscrape.com, a website created specifically for practicing web scraping. It includes the quote text, author names, and associated tags for each quote.

1. `sample/youtube.csv` - YouTube Video Analytics:

   This dataset provides a rich collection of metadata from 2,000+ YouTube videos, offering a unique opportunity to explore how content performs on the world's largest video-sharing platform. With detailed information on video titles, views, likes, tags, durations, publishing dates, and more, this dataset allows you to dive deep into the world of digital content trends.

## Dependencies

- **@filoz/synapse-sdk**: Synapse network integration for decentralized storage and payments
- **commander**: Command-line argument parsing
- **chalk**: Terminal colors and styling
- **csv-parse**: CSV file parsing and **csv-stringify**: CSV file generation
- **inquirer**: Interactive command line prompts
- **fs-extra**: Enhanced file system operations
- **ethers**: Ethereum blockchain interaction
- **lodash-es**: Utility functions for data manipulation
- **get-stream**: Stream utilities
- **stream-transform**: Data stream transformation

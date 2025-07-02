# Filo Data Broker CLI

A command-line interface tool for importing CSV data to Filo Data Broker with privacy-aware column selection.

## Installation

```bash
npm install
```

## Usage

```bash
# Import data from a CSV file (interactive mode)
npm start import -- --api-key YOUR_API_KEY --private-key YOUR_PRIVATE_KEY --file ./data.csv

# Show help
npm start -- --help
npm start import --help
```

## Features

- **CSV Header Analysis**: Automatically reads and displays CSV column names
- **Interactive Privacy Selection**: Choose which columns contain sensitive/private data
- **Data Summary**: Shows row count, column count, and privacy breakdown
- **Error Handling**: Validates file existence and CSV format

## Development

```bash
# Install dependencies
npm install

# Test the CLI
npm start -- --help
```

## Commands

### import

Import data from a CSV file to the Filo Data Broker with interactive privacy configuration.

**Required Arguments:**

- `-k, --api-key <key>` - API key for authentication
- `-f, --file <path>` - Path to the CSV file to import
- `-p, --private-key <key>` - Ethereum account private key

**Interactive Process:**

1. 📄 **CSV Analysis**: Reads and parses the CSV file
2. 📋 **Column Display**: Shows all available column names
3. 🔒 **Privacy Selection**: Interactive checkbox to select private data columns
4. 📈 **Summary**: Displays import statistics and next steps

**Example:**

```bash
npm start import -- --api-key YOUR_API_KEY --private-key YOUR_PRIVATE_KEY --file ./data.csv
```

**Sample Output:**

```
🚀 Starting data import...
📄 Reading CSV file...
✓ CSV file parsed successfully!
📊 Found 150 data rows

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
```

## Global Installation

Then use directly:

```bash
npx filo-data-broker-cli import --api-key YOUR_API_KEY --private-key YOUR_PRIVATE_KEY --file ./data.csv
```

## Sample Datasets

1. `sample/bali.csv` - Bali Tourism Destinations:

   This dataset contains information about tourist attractions in Bali collected through automated scraping from Google Maps. It covers 761 tourist spots spread across 9 regencies/cities in Bali Island. The dataset aims to provide a comprehensive overview of the locations, categories, and popularity of Bali’s tourist destinations.

1. `sample/quotes.csv` - Famous People Quotes:

   This dataset contains a collection of inspirational quotes scraped from quotes.toscrape.com, a website created specifically for practicing web scraping. It includes the quote text, author names, and associated tags for each quote.

1. `sample/youtube.csv` - YouTube Video Analytics:

   This dataset provides a rich collection of metadata from 2,000+ YouTube videos, offering a unique opportunity to explore how content performs on the world’s largest video-sharing platform. With detailed information on video titles, views, likes, tags, durations, publishing dates, and more, this dataset allows you to dive deep into the world of digital content trends.

## Dependencies

- **commander**: Command-line argument parsing
- **chalk**: Terminal colors and styling
- **csv-parse**: CSV file parsing
- **inquirer**: Interactive command line prompts
- **fs-extra**: Enhanced file system operations
- **ethers**: Ethereum API

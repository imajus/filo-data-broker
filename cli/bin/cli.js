#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { pick } from 'lodash-es';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import packageJson from '../package.json' with { type: 'json' };
import { Processor } from '../lib/processor.js';
import { Uploader } from '../lib/uploader.js';
import { SynapsePayment } from '../lib/synapse/payment.js';
import { SynapseStorage } from '../lib/synapse/storage.js';
import { FDBRegistry } from '../lib/contracts/FDBRegistsry.js';

dotenv.config({ quiet: true });

const RPC_URL = 'https://api.calibration.node.glif.io/rpc/v1';
const PROOFSET_BASE_URL = 'https://pdp.vxb.ai/calibration/proofsets/';

const provider = new ethers.JsonRpcProvider(RPC_URL);

function proofSetUrl(proofSetId) {
  return `${PROOFSET_BASE_URL}${proofSetId}`;
}

function getWallet() {
  if (!process.env.PRIVATE_KEY) {
    console.log(
      chalk.red('❌ Error: PRIVATE_KEY environment variable is required')
    );
    console.log(
      chalk.yellow(`Usage: PRIVATE_KEY=<your-private-key> npx fdb-cli`)
    );
    process.exit(1);
  }
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}

const program = new Command();

program
  .name('filo-data-broker-cli')
  .description('Filo Data Broker CLI - A tool for importing data')
  .version(packageJson.version);

program
  .command('import')
  .description('Import data from a CSV file')
  .requiredOption('-f, --file <path>', 'Path to the CSV file to import')
  .action(async (options) => {
    if (!options.file) {
      console.log(chalk.red('❌ Error: CSV file path is required'));
      console.log(chalk.yellow('Usage: import -f <csv-file-path>'));
      return;
    }
    // Step 1: Check if file exists
    if (!(await fs.pathExists(options.file))) {
      console.log(chalk.red(`❌ Error: File not found at ${options.file}`));
      return;
    }
    const wallet = getWallet();
    const payment = await SynapsePayment.create(wallet);
    const proofSet = await payment.selectProofset();
    if (!proofSet) {
      console.log(chalk.red('❌ Error: No Proof Set found'));
      console.log(
        chalk.yellow(
          '\nℹ️ Please run `PRIVATE_KEY=<your-private-key> npm start setup` to set up the payment rail'
        )
      );
      return;
    }
    console.log(chalk.blue(`🗒️ CSV File: ${options.file}`));
    console.log(chalk.blue(`💳 Wallet Address: ${wallet.address}`));
    console.log(
      chalk.blue(`🤝 Proof Set: ${proofSetUrl(proofSet.pdpVerifierProofSetId)}`)
    );
    // Step 2: Request NFT collection details
    const { name, description, price } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the name of the dataset:',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter the description of the dataset:',
      },
      {
        type: 'input',
        name: 'price',
        message: 'Enter the price for the dataset (in USDFC):',
        validate: (input) => {
          try {
            const value = ethers.parseUnits(input, 18);
            if (value < 0n) {
              return 'Please enter a non-negative price.';
            }
            return true;
          } catch {
            return 'Please enter a valid number for the price.';
          }
        },
      },
    ]);
    console.log(chalk.green('🚀 Starting data import...'));
    const registry = new FDBRegistry(wallet);
    const uploader = new Uploader(wallet);
    const processor = new Processor(uploader);
    try {
      let rowCount = 0;
      const headers = await processor.headers(options.file);
      // Step 3: Display extracted column names immediately
      console.log(chalk.green('\n✅ CSV headers parsed successfully!'));
      console.log(chalk.cyan('\n📋 Column names found:'));
      headers.forEach((header, index) => {
        console.log(chalk.white(`  ${index + 1}. ${header}`));
      });
      // Step 4: Ask which columns hold private data (immediately after headers)
      console.log(chalk.yellow('\n🔒 Privacy Configuration'));
      const { privateColumns } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'privateColumns',
          message: 'Select which columns contain private/sensitive data:',
          choices: headers.map((header) => ({
            name: header,
            value: header,
          })),
          validate: (input) => {
            if (input.length === 0) {
              return 'Please select at least one column or press Ctrl+C to exit.';
            }
            return true;
          },
        },
      ]);
      // Display selected private columns
      console.log(chalk.green('\n✅ Private data columns selected:'));
      privateColumns.forEach((column) => {
        console.log(chalk.red(`  🔒 ${column}`));
      });
      // Display public columns
      const publicColumns = headers.filter(
        (header) => !privateColumns.includes(header)
      );
      if (publicColumns.length > 0) {
        console.log(chalk.green('\n📋 Public data columns:'));
        publicColumns.forEach((column) => {
          console.log(chalk.green(`  📝 ${column}`));
        });
      }
      console.log(chalk.yellow('\n📊 Starting row-by-row processing...'));
      const { publicData, privateData } = await processor.process(
        options.file,
        {
          publicColumns,
          privateColumns,
          onTick(result) {
            ++rowCount;
            const line = Object.values(pick(result, publicColumns)).toString();
            console.log(chalk.blue(`${line},******`));
          },
        }
      );
      // Step 5: Upload public & private data (parallel uploads are not supported)
      console.log(chalk.yellow('\n▶️ Starting public data upload...'));
      const publicCid = await uploader.uploadPublicData(publicData);
      console.log(chalk.green('\n✅ Public data uploaded successfully!'));
      console.log(chalk.yellow('\n▶️ Starting private data upload...'));
      const privateCid = await uploader.uploadPrivateData(privateData);
      console.log(chalk.green('\n✅ Private data uploaded successfully!'));
      // Step 6: Create NFT collection
      console.log(chalk.yellow('\n▶️ Creating NFT collection...'));
      const address = await registry.createCollection(
        name,
        description,
        publicColumns,
        privateColumns,
        proofSet.pdpVerifierProofSetId,
        price
      );
      console.log(chalk.green('\n✅ NFT collection created successfully!'));
      // Step 7: Link dataset to NFT collection
      console.log(chalk.yellow('\n▶️ Linking dataset to NFT collection...'));
      //TODO: Merge into createCollection
      await registry.linkDataset(
        address,
        publicCid.toString(),
        privateCid.toString()
      );
      console.log(chalk.green('\n✅ Dataset linked to NFT collection!'));
      console.log(chalk.blue('\n📈 All done! Processing summary:'));
      console.log(chalk.white(`  • Total rows processed: ${rowCount}`));
      console.log(chalk.white(`  • NFT collection address: ${address}`));
      console.log(chalk.white(`  • Public CID: ${publicCid}`));
      console.log(chalk.white(`  • Private CID: ${privateCid}`));
    } catch (err) {
      console.log(chalk.red(`❌ Processing Error: ${err.message}`));
    }
  });

program
  .command('setup')
  .description('Set up the payment rail')
  .action(async (options) => {
    const wallet = getWallet();
    console.log(chalk.blue(`Wallet Address: ${wallet.address}`));
    console.log(chalk.yellow('\n▶️ Setting up payment rail...'));
    try {
      const payment = await SynapsePayment.create(wallet);
      const accountInfo = await payment.reserve();
      const availableFunds = ethers.formatUnits(accountInfo.availableFunds, 18);
      const totalFunds = ethers.formatUnits(accountInfo.funds, 18);
      const lockupAmount = ethers.formatUnits(accountInfo.lockupCurrent, 18);
      const lockupRate = ethers.formatUnits(accountInfo.lockupRate * 2880n, 18);
      console.log(chalk.blue(`\n💰 Account Info:`));
      console.log(chalk.white(` • Available funds: ${availableFunds} USDFC`));
      console.log(chalk.white(` • Total funds: ${totalFunds} USDFC`));
      console.log(chalk.white(` • Lockup amount: ${lockupAmount} USDFC`));
      console.log(chalk.white(` • Lockup rate: ${lockupRate} USDFC / day`));
      //FIXME: Dirty hack to upsert Proof Set ID
      const storage = await SynapseStorage.create(wallet);
      const { selectedProofSetId } = await storage.preflight(65);
      console.log(
        chalk.blue(`\n🤝 Proof Set: ${proofSetUrl(selectedProofSetId)}`)
      );
      console.log(chalk.green('\n✅ Payment rail set up successfully!'));
    } catch (err) {
      console.log(chalk.red(`❌ Setup Error: ${err.message}`));
    }
  });

program
  .command('balance')
  .description('Check wallet and payment balances')
  .action(async (options) => {
    const wallet = getWallet();
    console.log(chalk.blue(`Wallet Address: ${wallet.address}`));
    console.log(chalk.yellow('\n▶️ Fetching balances...'));
    try {
      const payment = await SynapsePayment.create(wallet);
      const walletBalance = ethers.formatUnits(
        await payment.getWalletBalanceUSDFC(),
        18
      );
      const serviceBalance = ethers.formatUnits(
        await payment.getBalanceUSDFC(),
        18
      );
      const allowanceToken = ethers.formatUnits(
        await payment.getPaymentAllowanceUSDFC(),
        18
      );
      console.log(chalk.green('\n💰 Balance Information:'));
      console.log(chalk.blue(`Wallet balance: ${walletBalance} USDFC`));
      console.log(chalk.blue(`Deposit balance: ${serviceBalance} USDFC`));
      console.log(chalk.blue(`Deposit allowance: ${allowanceToken} USDFC`));
    } catch (err) {
      console.log(chalk.red(`❌ Balance Error: ${err.message}`));
    }
  });

program
  .command('datasets')
  .description('List all available datasets')
  .action(async (options) => {
    const wallet = getWallet();
    console.log(chalk.blue(`Wallet Address: ${wallet.address}`));
    console.log(chalk.yellow('\n▶️ Fetching datasets...'));
    try {
      const registry = new FDBRegistry(wallet);
      const datasets = await registry.listDatasets();
      if (datasets.length === 0) {
        console.log(chalk.yellow('\n📋 No datasets found.'));
        return;
      }
      console.log(chalk.green('\n📊 Available Datasets:'));
      datasets.forEach((dataset, index) => {
        const priceInUSDFC = ethers.formatUnits(dataset.price, 18);
        const lockupDays = (Number(dataset.lockupPeriod) / 2880).toFixed(2);
        console.log(chalk.white(`\n  ${index + 1}. ${dataset.name}`));
        console.log(chalk.cyan(`     Price: ${priceInUSDFC} USDFC`));
        console.log(chalk.cyan(`     Lockup: ${lockupDays} days`));
      });
    } catch (err) {
      console.log(chalk.red(`❌ Datasets Error: ${err.message}`));
    }
  });

program.parse();

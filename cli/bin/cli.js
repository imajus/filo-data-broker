#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { pick } from 'lodash-es';
import { ethers } from 'ethers';
import packageJson from '../package.json' with { type: 'json' };
import { Processor } from '../lib/processor.js';
import { Uploader } from '../lib/uploader.js';
import { SynapsePayment } from '../lib/synapse/payment.js';

const RPC_URL = 'https://api.calibration.node.glif.io/rpc/v1';
const provider = new ethers.JsonRpcProvider(RPC_URL);

const program = new Command();

program
  .name('filo-data-broker-cli')
  .description('Filo Data Broker CLI - A tool for importing data')
  .version(packageJson.version);

program
  .command('import')
  .description('Import data from a CSV file')
  .requiredOption('-p, --private-key <key>', 'Ethereum account private key')
  .requiredOption('-f, --file <path>', 'Path to the CSV file to import')
  .action(async (options) => {
    if (!options.file) {
      console.log(chalk.red('❌ Error: CSV file path is required'));
      console.log(
        chalk.yellow('Usage: import -p <key> -f <csv-file-path>')
      );
      return;
    }
    // Step 1: Check if file exists
    if (!(await fs.pathExists(options.file))) {
      console.log(chalk.red(`❌ Error: File not found at ${options.file}`));
      return;
    }
    const wallet = new ethers.Wallet(options.privateKey, provider);
    console.log(chalk.blue(`CSV File: ${options.file}`));
    console.log(chalk.blue(`Wallet Address: ${wallet.address}`));
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
      // Step 5: Create NFT collection
      console.log(chalk.yellow('\n▶️ Creating NFT collection...'));
      await uploader.nft.createCollection(name, description, publicColumns, privateColumns, price);
      console.log(chalk.green('\n✅ NFT collection created successfully!'));
      console.log(chalk.yellow('\n📊 Starting row-by-row processing...'));
      const { publicData, privateData } = await processor.process(options.file, {
        publicColumns,
        privateColumns,
        onTick(result) {
          ++rowCount;
          const line = Object.values(pick(result, publicColumns)).toString();
          console.log(chalk.blue(`${line},******`));
        },
      });
      // Step 6: Upload public & private data (parallel uploads are not supported)
      console.log(chalk.yellow('\n▶️ Starting public data upload...'));
      const publicCid = await uploader.uploadPublicData(publicData);
      console.log(chalk.green('\n✅ Public data uploaded successfully!'));
      console.log(chalk.yellow('\n▶️ Starting private data upload...'));
      const privateCid = await uploader.uploadPrivateData(privateData);
      console.log(chalk.green('\n✅ Private data uploaded successfully!'));
      // Step 7: Link dataset to NFT collection
      console.log(chalk.yellow('\n▶️ Linking dataset to NFT collection...'));
      await uploader.nft.linkDataset(publicCid.toString(), privateCid.toString());
      console.log(chalk.green('\n✅ Dataset linked to NFT collection!'));
      console.log(chalk.blue('\n📈 All done! Processing summary:'));
      console.log(chalk.white(`  • Total rows processed: ${rowCount}`));
      console.log(chalk.white(`  • NFT collection address: ${uploader.nft.address}`));
      console.log(chalk.white(`  • Public CID: ${publicCid}`));
      console.log(chalk.white(`  • Private CID: ${privateCid}`));
    } catch (err) {
      console.log(chalk.red(`❌ Processing Error: ${err.message}`));
    }
  });

program
  .command('setup')
  .description('Set up the payment rail')
  .requiredOption('-p, --private-key <key>', 'Ethereum account private key')
  .action(async (options) => {
    const wallet = new ethers.Wallet(options.privateKey, provider);
    console.log(chalk.blue(`Wallet Address: ${wallet.address}`));
    console.log(chalk.yellow('\n▶️ Setting up payment rail...'));
    try {
      const payment = await SynapsePayment.create(wallet);
      const proofset = await payment.selectProofset();
      console.log(chalk.blue(`Proofset: ${proofset?.pdpVerifierProofSetId ?? 'None'}`));
      await payment.reserve();
      console.log(chalk.green('💰 Payment rail set up successfully!'));
    } catch (err) {
      console.log(chalk.red(`❌ Setup Error: ${err.message}`));
    }
  });

program
  .command('balance')
  .description('Check wallet and payment balances')
  .requiredOption('-p, --private-key <key>', 'Ethereum account private key')
  .action(async (options) => {
    console.log(chalk.blue('Private Key: **********'));
    console.log(chalk.yellow('\n▶️ Fetching balances...'));
    try {
      const wallet = new ethers.Wallet(options.privateKey, provider);
      const payment = await SynapsePayment.create(wallet);
      const balance = {
        walletNative: ethers.formatEther(await payment.getWalletBalance()),
        walletToken: ethers.formatUnits(await payment.getWalletBalanceUSDFC(), 18),
        paymentToken: ethers.formatUnits(await payment.getBalanceUSDFC(), 18),
        allowanceToken: ethers.formatUnits(await payment.getPaymentAllowanceUSDFC(), 18),
      };
      console.log(chalk.green('\n💰 Balance Information:'));
      console.log(chalk.blue(`Wallet balance: ${balance.walletNative} FIL, ${balance.walletToken} USDFC`));
      console.log(chalk.blue(`Deposit balance: ${balance.paymentToken} USDFC`));
      console.log(chalk.blue(`Deposit allowance: ${balance.allowanceToken} USDFC`));
      const proofset = await payment.selectProofset();
      console.log(chalk.blue(`Proofset: ${proofset?.pdpVerifierProofSetId ?? 'None'}`));
    } catch (err) {
      console.log(chalk.red(`❌ Balance Error: ${err.message}`));
    }
  });

program.parse();

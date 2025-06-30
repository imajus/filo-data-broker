#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { pick } from 'lodash-es';
import packageJson from '../package.json' with { type: 'json' };
import { Processor } from '../lib/processor.js';
import { Uploader } from '../lib/uploader.js';

const program = new Command();

program
  .name('filo-data-broker-cli')
  .description('Filo Data Broker CLI - A tool for importing data')
  .version(packageJson.version);

program
  .command('import')
  .description('Import data from a CSV file')
  .requiredOption('-k, --api-key <key>', 'API key for authentication')
  .requiredOption('-p, --private-key <key>', 'Ethereum account private key')
  .requiredOption('-f, --file <path>', 'Path to the CSV file to import')
  .action(async (options) => {
    if (!options.file) {
      console.log(chalk.red('❌ Error: CSV file path is required'));
      console.log(
        chalk.yellow('Usage: import -k <api-key> -p <key> -f <csv-file-path>')
      );
      return;
    }
    // Step 1: Check if file exists
    if (!(await fs.pathExists(options.file))) {
      console.log(chalk.red(`❌ Error: File not found at ${options.file}`));
      return;
    }
    console.log(chalk.green('🚀 Starting data import...'));
    console.log(chalk.blue(`API Key: ${options.apiKey}`));
    console.log(chalk.blue(`CSV File: ${options.file}`));
    console.log(chalk.blue('Private Key: **********'));
    // Step 2: Request NFT collection details
    const { ethers } = await import('ethers');
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
        message: 'Enter the price for the dataset (in FIL):',
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
    console.log(chalk.yellow('\n📄 Setting up CSV stream...'));
    const uploader = new Uploader(options.apiKey, options.privateKey);
    const processor = new Processor({ uploader });
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
      await uploader.nft.createCollection(name, description, publicColumns, privateColumns, ethers.parseUnits(price, 18));
      console.log(chalk.green('\n✅ NFT collection created successfully!'));
      console.log(chalk.blue(`NFT collection address: ${uploader.nft.address}`));
      console.log(chalk.yellow('\n📊 Starting row-by-row processing...'));
      const { publicCid, privateCid } = await processor.process(options.file, {
        publicColumns,
        privateColumns,
        onTick(result) {
          ++rowCount;
          const line = Object.values(pick(result, publicColumns)).toString();
          console.log(chalk.blue(`${line},******`));
        },
      });
      console.log(chalk.green('✅ Data processing completed successfully!'));
      console.log(chalk.blue('\n📈 Processing Summary:'));
      console.log(chalk.white(`  • Total rows processed: ${rowCount}`));
      console.log(chalk.white(`  • Public CID: ${publicCid}`));
      console.log(chalk.white(`  • Private CID: ${privateCid}`));
      // Step 6: Link dataset to NFT collection
      console.log(chalk.yellow('\n▶️ Linking dataset to NFT collection...'));
      await uploader.nft.linkDataset(publicCid, privateCid);
      console.log(chalk.green('\n✅ Dataset linked to NFT collection!'));
    } catch (err) {
      console.log(chalk.red(`❌ Processing Error: ${err.message}`));
    }
  });

program.parse();

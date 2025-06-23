#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import packageJson from '../package.json' with { type: 'json' };
import { Processor } from '../lib/processor.js';

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
    // Step 2: Create streaming parser for CSV
    console.log(chalk.yellow('\n📄 Setting up CSV stream...'));
    const processor = new Processor(options);
    let rowCount = 0;
    try {
      const cid = await processor.process(options.file, {
        async onHeaders(headers) {
          // Step 3: Display extracted column names immediately
          console.log(chalk.green('\n✓ CSV headers parsed successfully!'));
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
          console.log(chalk.green('\n✓ Private data columns selected:'));
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
          // Store selected private columns
          processor.setColumns(publicColumns, privateColumns);
        },
        onTick(result) {
          ++rowCount;
          const line = Object.values(result).toString();
          console.log(chalk.blue(line));
        },
      });
      console.log(chalk.green('✓ Data processing completed successfully!'));
      console.log(chalk.blue('\n📈 Processing Summary:'));
      console.log(chalk.white(`  • Total rows processed: ${rowCount}`));
      console.log(chalk.white(`  • Output CID: ${cid}`));
    } catch (err) {
      console.log(chalk.red(`❌ Processing Error: ${err.message}`));
    }
  });

program.parse();

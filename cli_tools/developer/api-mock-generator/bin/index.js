#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { generateMockApi } = require('../lib/generator');

program
  .version('1.0.0')
  .description('Generate API mock servers with realistic data')
  .option('-i, --interactive', 'Interactive mode')
  .option('-n, --name <name>', 'API name')
  .option('-p, --port <port>', 'Port for mock server', '3000')
  .option('-c, --count <count>', 'Number of mock records', '10')
  .option('-o, --output <path>', 'Output directory', './mock-api')
  .parse(process.argv);

async function main() {
  try {
    const options = program.opts();
    let config = {
      port: parseInt(options.port),
      count: parseInt(options.count),
      output: options.output
    };

    if (options.interactive || !process.argv.slice(2).length) {
      config = await interactiveSetup(config);
    } else {
      config.name = options.name;
    }

    await generateMockApi(config);
    console.log(chalk.green('✅ Mock API generated successfully!'));
  } catch (error) {
    console.error(chalk.red('❌ Error:', error.message));
    process.exit(1);
  }
}

async function interactiveSetup(config) {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: '📡 API name:',
      default: 'my-api'
    },
    {
      type: 'list',
      name: 'dataType',
      message: '📊 Data type:',
      choices: ['users', 'products', 'posts', 'custom']
    },
    {
      type: 'number',
      name: 'count',
      message: '📈 Number of mock records:',
      default: config.count || 10
    },
    {
      type: 'confirm',
      name: 'includeCRUD',
      message: 'Include full CRUD operations?',
      default: true
    }
  ];

  const answers = await inquirer.prompt(questions);

  if (answers.dataType === 'custom') {
    const customSchema = await inquirer.prompt([
      {
        type: 'input',
        name: 'fields',
        message: 'Enter custom fields (comma-separated):',
        default: 'id,name,email'
      }
    ]);
    answers.customFields = customSchema.fields.split(',').map(f => f.trim());
  }

  return { ...config, ...answers };
}

main();
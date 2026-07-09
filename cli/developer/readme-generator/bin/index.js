#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { generateReadme } = require('../lib/generator');

program
  .version('1.0.0')
  .description('Generate professional README.md files')
  .option('-i, --interactive', 'Interactive mode for README generation')
  .option('-t, --title <title>', 'Project title')
  .option('-d, --description <description>', 'Project description')
  .option('-o, --output <path>', 'Output path for README.md', './README.md')
  .parse(process.argv);

async function main() {
  try {
    const options = program.opts();
    let config = { output: options.output };

    if (options.interactive || !process.argv.slice(2).length) {
      config = await interactiveSetup();
    } else {
      config = {
        title: options.title,
        description: options.description,
        output: options.output
      };
    }

    await generateReadme(config);
    console.log(chalk.green('✅ README.md generated successfully!'));
  } catch (error) {
    console.error(chalk.red('❌ Error:', error.message));
    process.exit(1);
  }
}

async function interactiveSetup() {
  const questions = [
    {
      type: 'input',
      name: 'title',
      message: '📁 Project title:',
      validate: input => input.length > 0 || 'Title is required'
    },
    {
      type: 'input',
      name: 'description',
      message: '📝 Project description:',
      validate: input => input.length > 10 || 'Description must be at least 10 characters'
    },
    {
      type: 'input',
      name: 'version',
      message: '📦 Version:',
      default: '1.0.0'
    },
    {
      type: 'input',
      name: 'author',
      message: '👤 Author:'
    },
    {
      type: 'list',
      name: 'license',
      message: 'Choose license:',
      choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'ISC', 'None']
    },
    {
      type: 'confirm',
      name: 'includeInstallation',
      message: 'Include installation instructions?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeUsage',
      message: 'Include usage examples?',
      default: true
    }
  ];

  return await inquirer.prompt(questions);
}

main();
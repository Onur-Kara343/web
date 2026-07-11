#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { generateEnv } = require('../lib/generator');

program
  .version('1.0.0')
  .description('Generate .env files with validation')
  .option('-i, --interactive', 'Interactive mode')
  .option('-t, --type <type>', 'Environment type: node, react, next, vue, custom')
  .option('-o, --output <path>', 'Output path for .env file', './.env')
  .option('-e, --example', 'Generate .env.example file as well', false)
  .parse(process.argv);

async function main() {
  try {
    const options = program.opts();
    let config = {
      output: options.output,
      generateExample: options.example
    };

    if (options.interactive || !process.argv.slice(2).length) {
      config = await interactiveSetup(config);
    } else {
      config.type = options.type;
    }

    await generateEnv(config);
    console.log(chalk.green('✅ Environment file generated successfully!'));
  } catch (error) {
    console.error(chalk.red('❌ Error:', error.message));
    process.exit(1);
  }
}

async function interactiveSetup(config) {
  const questions = [
    {
      type: 'list',
      name: 'type',
      message: '📋 Select environment type:',
      choices: [
        { name: '🟢 Node.js', value: 'node' },
        { name: '⚛️ React', value: 'react' },
        { name: '▲ Next.js', value: 'next' },
        { name: '🖖 Vue.js', value: 'vue' },
        { name: '🎯 Custom', value: 'custom' }
      ]
    },
    {
      type: 'confirm',
      name: 'generateExample',
      message: 'Generate .env.example file?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeComments',
      message: 'Include comments in .env file?',
      default: true
    },
    {
      type: 'checkbox',
      name: 'additionalVars',
      message: 'Select additional environment variables:',
      choices: [
        { name: '🔑 API_KEY', value: 'API_KEY' },
        { name: '🌐 API_URL', value: 'API_URL' },
        { name: '📧 EMAIL_HOST', value: 'EMAIL_HOST' },
        { name: '📦 REDIS_URL', value: 'REDIS_URL' },
        { name: '🗄️ DATABASE_URL', value: 'DATABASE_URL' }
      ]
    }
  ];

  const answers = await inquirer.prompt(questions);

  // Get values for custom variables
  if (answers.type === 'custom') {
    const customQuestions = [
      {
        type: 'input',
        name: 'variables',
        message: '📝 Enter variables (format: KEY=value, comma-separated):',
        default: 'PORT=3000,NODE_ENV=development'
      }
    ];
    const customAnswers = await inquirer.prompt(customQuestions);
    
    // Parse custom variables
    const vars = {};
    customAnswers.variables.split(',').forEach(item => {
      const [key, value] = item.trim().split('=');
      if (key && value) vars[key.trim()] = value.trim();
    });
    answers.customVars = vars;
  }

  return { ...config, ...answers };
}

main();
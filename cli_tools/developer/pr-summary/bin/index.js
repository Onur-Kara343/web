#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { generatePRSummary } = require('../lib/generator');

program
  .version('1.0.0')
  .description('Generate PR summaries')
  .option('-i, --interactive', 'Interactive mode')
  .option('-t, --title <title>', 'PR title')
  .option('-b, --branch <branch>', 'Source branch name')
  .option('-o, --output <path>', 'Output path', './PR_SUMMARY.md')
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
        branch: options.branch,
        output: options.output
      };
    }

    await generatePRSummary(config);
    console.log(chalk.green('✅ PR summary generated successfully!'));
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
      message: '📝 PR Title:',
      validate: input => input.length > 0 || 'Title is required'
    },
    {
      type: 'input',
      name: 'branch',
      message: '🌿 Source branch:',
      default: 'feature/description'
    },
    {
      type: 'input',
      name: 'description',
      message: '📄 PR Description:',
      default: 'This PR adds new features and fixes bugs'
    },
    {
      type: 'checkbox',
      name: 'changes',
      message: 'Select changes made:',
      choices: [
        { name: '✨ New feature', value: 'feature' },
        { name: '🐛 Bug fix', value: 'fix' },
        { name: '📝 Documentation', value: 'docs' },
        { name: '♻️ Refactoring', value: 'refactor' },
        { name: '🧪 Tests', value: 'tests' },
        { name: '⚡ Performance', value: 'perf' }
      ]
    },
    {
      type: 'confirm',
      name: 'includeChecklist',
      message: 'Include PR checklist?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeTesting',
      message: 'Include testing instructions?',
      default: true
    }
  ];

  return await inquirer.prompt(questions);
}

main();
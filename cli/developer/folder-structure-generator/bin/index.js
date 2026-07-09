#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { generateStructure } = require('../lib/generator');

program
  .version('1.0.0')
  .description('Generate folder structures with custom templates')
  .option('-i, --interactive', 'Interactive mode')
  .option('-t, --type <type>', 'Structure type: node, react, next, vue, custom')
  .option('-n, --name <name>', 'Project name')
  .option('-p, --path <path>', 'Base path for structure', './')
  .option('-o, --output <path>', 'Output file for structure template', './structure.json')
  .parse(process.argv);

async function main() {
  try {
    const options = program.opts();
    let config = {
      basePath: options.path,
      outputFile: options.output,
      projectName: options.name
    };

    if (options.interactive || !process.argv.slice(2).length) {
      config = await interactiveSetup(config);
    } else {
      config.type = options.type;
    }

    await generateStructure(config);
    console.log(chalk.green('✅ Folder structure generated successfully!'));
  } catch (error) {
    console.error(chalk.red('❌ Error:', error.message));
    process.exit(1);
  }
}

async function interactiveSetup(config) {
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: '📁 Project name:',
      default: 'my-project',
      validate: input => input.length > 0 || 'Project name is required'
    },
    {
      type: 'list',
      name: 'type',
      message: '📂 Select structure type:',
      choices: [
        { name: '🚀 Node.js Project', value: 'node' },
        { name: '⚛️ React Project', value: 'react' },
        { name: '▲ Next.js Project', value: 'next' },
        { name: '🖖 Vue.js Project', value: 'vue' },
        { name: '🎯 Custom Structure', value: 'custom' }
      ]
    },
    {
      type: 'confirm',
      name: 'includeFiles',
      message: 'Include initial files (index.js, package.json)?',
      default: true
    },
    {
      type: 'confirm',
      name: 'createFolders',
      message: 'Create folders now?',
      default: true
    }
  ];

  const answers = await inquirer.prompt(questions);

  // If custom, ask for more details
  if (answers.type === 'custom') {
    const customQuestions = [
      {
        type: 'input',
        name: 'folders',
        message: '📁 Enter folders (comma-separated):',
        default: 'src,src/components,src/utils,src/styles,tests,docs',
        validate: input => input.length > 0 || 'Folders are required'
      },
      {
        type: 'input',
        name: 'subfolders',
        message: '📁 Enter subfolders (comma-separated):',
        default: 'components/Button,components/Modal,utils/helpers,utils/validators'
      }
    ];
    const customAnswers = await inquirer.prompt(customQuestions);
    answers.customFolders = customAnswers.folders.split(',').map(f => f.trim());
    answers.customSubfolders = customAnswers.subfolders.split(',').map(f => f.trim());
  }

  return { ...config, ...answers };
}

main();
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class ReadmeGenerator {
  constructor(config) {
    this.config = config;
  }

  async generate() {
    const content = this.buildReadme();
    await this.saveFile(content);
    return content;
  }

  buildReadme() {
    const { title, description, version, author, license, includeInstallation, includeUsage } = this.config;

    let content = `# ${title || 'Project Title'}

## Description
${description || 'A brief description of your project'}

## Version
${version || '1.0.0'}

## Author
${author || 'Unknown'}

`;

    if (includeInstallation !== false) {
      content += `
## Installation

\`\`\`bash
npm install ${title?.toLowerCase().replace(/\s/g, '-') || 'project'}
\`\`\`
`;
    }

    if (includeUsage !== false) {
      content += `
## Usage

\`\`\`javascript
const project = require('${title?.toLowerCase().replace(/\s/g, '-') || 'project'}');

// Example usage
console.log('Hello World!');
\`\`\`
`;
    }

    content += `
## License
${license && license !== 'None' ? `This project is licensed under the ${license} License` : 'No license specified'}

## Contributing
Contributions are welcome! Please submit a pull request or open an issue.

## Support
If you encounter any problems, please open an issue on GitHub.
`;

    return content;
  }

  async saveFile(content) {
    const outputPath = this.config.output || './README.md';
    await fs.writeFile(outputPath, content);
    console.log(chalk.green(`📄 README written to ${outputPath}`));
  }
}

module.exports = {
  generateReadme: async (config) => {
    const generator = new ReadmeGenerator(config);
    return generator.generate();
  }
};
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class EnvGenerator {
  constructor(config) {
    this.config = config;
    this.variables = {};
  }

  async generate() {
    this.variables = this.buildVariables();
    await this.createEnvFile();
    if (this.config.generateExample) {
      await this.createExampleFile();
    }
    this.showSummary();
    return this.variables;
  }

  buildVariables() {
    const { type, additionalVars = [], customVars = {} } = this.config;
    
    const templates = {
      node: {
        NODE_ENV: 'development',
        PORT: '3000',
        DATABASE_URL: 'mongodb://localhost:27017/myapp',
        JWT_SECRET: 'your-secret-key',
        API_URL: 'http://localhost:3000/api'
      },
      react: {
        REACT_APP_API_URL: 'http://localhost:3000/api',
        REACT_APP_WS_URL: 'ws://localhost:3000/ws',
        REACT_APP_ENV: 'development'
      },
      next: {
        NODE_ENV: 'development',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
        DATABASE_URL: 'mongodb://localhost:27017/myapp',
        JWT_SECRET: 'your-secret-key',
        NEXT_PUBLIC_WS_URL: 'ws://localhost:3000/ws'
      },
      vue: {
        NODE_ENV: 'development',
        VUE_APP_API_URL: 'http://localhost:3000/api',
        VUE_APP_WS_URL: 'ws://localhost:3000/ws'
      }
    };

    const baseVars = templates[type] || {};
    
    // Add custom vars
    const allVars = { ...baseVars, ...customVars };
    
    // Add additional selected vars
    additionalVars.forEach(key => {
      if (!allVars[key]) {
        allVars[key] = this.getDefaultValue(key);
      }
    });

    return allVars;
  }

  getDefaultValue(key) {
    const defaults = {
      'API_KEY': 'your-api-key',
      'API_URL': 'https://api.example.com',
      'EMAIL_HOST': 'smtp.example.com',
      'REDIS_URL': 'redis://localhost:6379',
      'DATABASE_URL': 'mongodb://localhost:27017/db'
    };
    return defaults[key] || 'your-value-here';
  }

  async createEnvFile() {
    const outputPath = this.config.output || './.env';
    let content = '';
    
    // Add header
    if (this.config.includeComments !== false) {
      content += `# Environment Variables\n`;
      content += `# Generated on: ${new Date().toISOString()}\n`;
      content += `# Type: ${this.config.type || 'custom'}\n\n`;
    }

    // Add variables
    Object.entries(this.variables).forEach(([key, value]) => {
      if (this.config.includeComments !== false) {
        content += `# ${key}\n`;
      }
      content += `${key}=${value}\n\n`;
    });

    await fs.writeFile(outputPath, content);
    console.log(chalk.green(`📄 .env file written to ${outputPath}`));
  }

  async createExampleFile() {
    const outputPath = this.config.output || './.env';
    const examplePath = outputPath + '.example';
    let content = '';
    
    content += `# Environment Variables Template\n`;
    content += `# Copy this file to .env and fill in your values\n\n`;

    Object.keys(this.variables).forEach(key => {
      content += `${key}=\n`;
    });

    await fs.writeFile(examplePath, content);
    console.log(chalk.green(`📄 .env.example file written to ${examplePath}`));
  }

  showSummary() {
    console.log(chalk.blue('\n📋 Generated Environment Variables:'));
    console.log(chalk.white('─'.repeat(40)));
    
    Object.entries(this.variables).forEach(([key, value]) => {
      const displayValue = value.length > 30 ? value.substring(0, 27) + '...' : value;
      console.log(chalk.cyan(`  ${key}: ${chalk.white(displayValue)}`));
    });
    
    console.log(chalk.white('─'.repeat(40)));
    console.log(chalk.green(`✅ ${Object.keys(this.variables).length} variables generated`));
  }
}

module.exports = {
  generateEnv: async (config) => {
    const generator = new EnvGenerator(config);
    return generator.generate();
  }
};
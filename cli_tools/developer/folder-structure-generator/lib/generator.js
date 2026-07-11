const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class FolderStructureGenerator {
  constructor(config) {
    this.config = config;
    this.structure = [];
  }

  async generate() {
    this.structure = this.buildStructure();
    
    if (this.config.createFolders !== false) {
      await this.createFolders();
      await this.createInitialFiles();
      this.showStructure();
    }
    
    await this.saveTemplate();
    return this.structure;
  }

  buildStructure() {
    const { type, projectName, customFolders, customSubfolders } = this.config;
    const templates = {
      node: [
        'src',
        'src/controllers',
        'src/models',
        'src/routes',
        'src/middleware',
        'src/utils',
        'src/config',
        'src/services',
        'src/validators',
        'tests',
        'tests/unit',
        'tests/integration',
        'docs',
        'scripts',
        'logs'
      ],
      react: [
        'src',
        'src/components',
        'src/components/Common',
        'src/components/Layout',
        'src/pages',
        'src/hooks',
        'src/utils',
        'src/styles',
        'src/assets',
        'src/services',
        'src/store',
        'src/types',
        'public',
        'public/images',
        'tests',
        'tests/components',
        'tests/utils'
      ],
      next: [
        'src',
        'src/app',
        'src/app/api',
        'src/app/components',
        'src/app/hooks',
        'src/app/utils',
        'src/app/styles',
        'src/app/types',
        'public',
        'public/images',
        'public/fonts',
        'tests',
        'tests/unit',
        'tests/e2e'
      ],
      vue: [
        'src',
        'src/components',
        'src/components/Common',
        'src/views',
        'src/router',
        'src/store',
        'src/utils',
        'src/assets',
        'src/styles',
        'src/services',
        'tests',
        'tests/unit',
        'tests/e2e',
        'public'
      ],
      custom: this.buildCustomStructure(customFolders, customSubfolders)
    };

    const structure = templates[type] || templates.node;
    
    // Add root project name
    return structure.map(folder => path.join(this.config.projectName || 'project', folder));
  }

  buildCustomStructure(folders, subfolders) {
    const structure = [];
    const base = this.config.projectName || 'project';
    
    // Add main folders
    folders.forEach(folder => {
      structure.push(path.join(base, folder));
    });
    
    // Add subfolders
    subfolders.forEach(subfolder => {
      structure.push(path.join(base, subfolder));
    });
    
    return structure;
  }

  async createFolders() {
    const basePath = this.config.basePath || './';
    
    console.log(chalk.blue('\n📂 Creating folders...'));
    
    for (const folder of this.structure) {
      const fullPath = path.join(basePath, folder);
      if (!await fs.pathExists(fullPath)) {
        await fs.ensureDir(fullPath);
        console.log(chalk.green(`  ✅ Created: ${folder}`));
      } else {
        console.log(chalk.yellow(`  ⏭️  Already exists: ${folder}`));
      }
    }
  }

  async createInitialFiles() {
    if (this.config.includeFiles === false) return;

    const basePath = this.config.basePath || './';
    const projectName = this.config.projectName || 'project';
    const projectPath = path.join(basePath, projectName);

    // Create package.json for Node.js projects
    if (this.config.type === 'node') {
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        description: 'Node.js project',
        main: 'src/index.js',
        scripts: {
          start: 'node src/index.js',
          dev: 'nodemon src/index.js',
          test: 'jest',
          'test:watch': 'jest --watch'
        },
        dependencies: {
          express: '^4.18.2',
          cors: '^2.8.5',
          dotenv: '^16.0.0'
        },
        devDependencies: {
          nodemon: '^3.0.0',
          jest: '^29.0.0',
          eslint: '^8.0.0'
        }
      };
      await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
      console.log(chalk.green('  ✅ Created: package.json'));
    }

    // Create index.js
    const indexContent = this.getIndexFileContent();
    await fs.writeFile(path.join(projectPath, 'src', 'index.js'), indexContent);
    console.log(chalk.green('  ✅ Created: src/index.js'));

    // Create README
    const readmeContent = `# ${projectName}

## Structure
\`\`\`
${this.structure.map(f => f).join('\n')}
\`\`\`

## Getting Started
\`\`\`bash
npm install
npm start
\`\`\`

## License
MIT
`;
    await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);
    console.log(chalk.green('  ✅ Created: README.md'));

    // Create .gitignore
    const gitignore = `node_modules/
.env
.DS_Store
dist/
build/
*.log
`;
    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
    console.log(chalk.green('  ✅ Created: .gitignore'));
  }

  getIndexFileContent() {
    const type = this.config.type || 'node';
    
    const templates = {
      node: `const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(\`🚀 Server running on http://localhost:\${port}\`);
});
`,
      react: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

function App() {
  return (
    <div className="App">
      <h1>Hello React!</h1>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`,
      next: `// Next.js app directory structure
// This is a placeholder for the app/page.js file

export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
    </main>
  );
}
`,
      vue: `<template>
  <div id="app">
    <h1>Hello Vue.js!</h1>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
}
</style>`
    };

    return templates[type] || templates.node;
  }

  showStructure() {
    console.log(chalk.blue('\n📁 Generated Structure:'));
    console.log(chalk.white('─'.repeat(50)));
    
    const basePath = this.config.basePath || './';
    const projectName = this.config.projectName || 'project';
    
    this.structure.forEach((folder, index) => {
      const prefix = index === this.structure.length - 1 ? '└── ' : '├── ';
      const depth = folder.split(path.sep).length - 1;
      const indent = '  '.repeat(depth);
      console.log(chalk.cyan(`${indent}${prefix}${chalk.white(folder)}`));
    });
    
    console.log(chalk.white('─'.repeat(50)));
    console.log(chalk.green(`✅ ${this.structure.length} folders created`));
  }

  async saveTemplate() {
    const outputFile = this.config.outputFile || './structure.json';
    const template = {
      name: this.config.projectName || 'project',
      type: this.config.type || 'custom',
      structure: this.structure,
      createdAt: new Date().toISOString()
    };
    
    await fs.writeJson(outputFile, template, { spaces: 2 });
    console.log(chalk.green(`📄 Template saved to ${outputFile}`));
  }
}

module.exports = {
  generateStructure: async (config) => {
    const generator = new FolderStructureGenerator(config);
    return generator.generate();
  }
};
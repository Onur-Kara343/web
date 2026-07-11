const fs = require('fs-extra');
const path = require('path');
const { faker } = require('@faker-js/faker');

class ApiMockGenerator {
  constructor(config) {
    this.config = config;
    this.data = [];
  }

  async generate() {
    await this.generateMockData();
    await this.createServerFiles();
    await this.showInstructions();
    return this.data;
  }

  generateMockData() {
    const { count = 10, dataType = 'users', customFields = [] } = this.config;
    
    for (let i = 0; i < count; i++) {
      this.data.push(this.generateRecord(dataType, customFields));
    }
    
    return this.data;
  }

  generateRecord(type, customFields) {
    const base = {
      id: faker.string.uuid(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString()
    };

    if (type === 'users') {
      return {
        ...base,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        role: faker.helpers.arrayElement(['admin', 'user', 'moderator']),
        status: faker.helpers.arrayElement(['active', 'inactive', 'pending'])
      };
    }

    if (type === 'products') {
      return {
        ...base,
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()),
        category: faker.commerce.department(),
        description: faker.commerce.productDescription(),
        inStock: faker.datatype.boolean(),
        rating: faker.number.float({ min: 1, max: 5, precision: 0.1 })
      };
    }

    if (type === 'posts') {
      return {
        ...base,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        author: faker.person.fullName(),
        likes: faker.number.int({ min: 0, max: 1000 }),
        comments: faker.number.int({ min: 0, max: 100 }),
        tags: faker.helpers.arrayElements(['javascript', 'react', 'node', 'api', 'test'], 3)
      };
    }

    // Custom fields
    const custom = {};
    customFields.forEach(field => {
      custom[field] = this.generateCustomField(field);
    });

    return { ...base, ...custom };
  }

  generateCustomField(field) {
    const types = {
      name: () => faker.person.fullName(),
      email: () => faker.internet.email(),
      phone: () => faker.phone.number(),
      address: () => faker.location.streetAddress(),
      company: () => faker.company.name(),
      id: () => faker.string.uuid(),
      age: () => faker.number.int({ min: 18, max: 80 }),
      price: () => parseFloat(faker.commerce.price()),
      title: () => faker.lorem.sentence(),
      description: () => faker.lorem.paragraph()
    };

    if (types[field]) return types[field]();
    return faker.lorem.word();
  }

  async createServerFiles() {
    const outputDir = this.config.output || './mock-api';
    await fs.ensureDir(outputDir);

    // Create mock data file
    const dataPath = path.join(outputDir, 'data.json');
    await fs.writeJson(dataPath, { data: this.data });

    // Create Express server
    const serverContent = this.generateServerCode();
    const serverPath = path.join(outputDir, 'server.js');
    await fs.writeFile(serverPath, serverContent);

    // Create package.json
    const packageJson = {
      name: `${this.config.name || 'mock-api'}-server`,
      version: '1.0.0',
      description: 'Mock API server',
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        dev: 'nodemon server.js'
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5'
      },
      devDependencies: {
        nodemon: '^3.0.0'
      }
    };
    await fs.writeJson(path.join(outputDir, 'package.json'), packageJson);

    // Create README for the mock server
    const readme = `# ${this.config.name || 'Mock API'} Server

## Setup
\`\`\`bash
npm install
\`\`\`

## Start Server
\`\`\`bash
npm start
\`\`\`

## Endpoints
- GET  /api/data - Get all records
- GET  /api/data/:id - Get single record
${this.config.includeCRUD !== false ? `- POST /api/data - Create record
- PUT  /api/data/:id - Update record
- DELETE /api/data/:id - Delete record` : ''}

Server runs on http://localhost:${this.config.port || 3000}
`;
    await fs.writeFile(path.join(outputDir, 'README.md'), readme);

    console.log(`📁 Mock API generated in ${outputDir}`);
  }

  generateServerCode() {
    const port = this.config.port || 3000;
    const hasCRUD = this.config.includeCRUD !== false;

    return `
const express = require('express');
const cors = require('cors');
const data = require('./data.json');

const app = express();
const port = ${port};

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  next();
});

// GET all records
app.get('/api/data', (req, res) => {
  res.json(data);
});

// GET single record
app.get('/api/data/:id', (req, res) => {
  const record = data.data.find(item => item.id === req.params.id);
  if (record) {
    res.json(record);
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

${hasCRUD ? `
// POST - Create new record
app.post('/api/data', (req, res) => {
  const newRecord = {
    id: require('crypto').randomUUID(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.data.push(newRecord);
  res.status(201).json(newRecord);
});

// PUT - Update record
app.put('/api/data/:id', (req, res) => {
  const index = data.data.findIndex(item => item.id === req.params.id);
  if (index !== -1) {
    data.data[index] = { 
      ...data.data[index], 
      ...req.body, 
      updatedAt: new Date().toISOString() 
    };
    res.json(data.data[index]);
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

// DELETE - Remove record
app.delete('/api/data/:id', (req, res) => {
  const index = data.data.findIndex(item => item.id === req.params.id);
  if (index !== -1) {
    const deleted = data.data.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});
` : ''}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(\`🚀 Mock API server running on http://localhost:\${port}\`);
  console.log(\`📊 Total records: \${data.data.length}\`);
  console.log(\`🏥 Health check: http://localhost:\${port}/health\`);
});
`;
  }

  async showInstructions() {
    const outputDir = this.config.output || './mock-api';
    console.log('\n📡 To start the mock server, run:');
    console.log(`  cd ${outputDir}`);
    console.log('  npm install');
    console.log('  npm start');
    console.log(`\n🌐 Server will be available at: http://localhost:${this.config.port || 3000}`);
  }
}

module.exports = {
  generateMockApi: async (config) => {
    const generator = new ApiMockGenerator(config);
    return generator.generate();
  }
};
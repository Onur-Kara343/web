// readme-generator.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ReadmeGenerator {
  constructor(rootDir = '.') {
    this.rootDir = path.resolve(rootDir);
    this.stats = {
      dependencies: {},
      devDependencies: {},
      scripts: {},
      totalFiles: 0,
      totalLines: 0,
      languages: {},
      mainEntry: null
    };
  }

  async analyze() {
    console.log('🔍 Analysiere Codebase...');
    
    // Package.json analysieren
    await this.analyzePackageJson();
    
    // Dateistruktur analysieren
    await this.analyzeFileStructure(this.rootDir);
    
    // Main Entry Point finden
    this.findMainEntry();
    
    console.log(`✅ Analyse abgeschlossen: ${this.stats.totalFiles} Dateien, ${this.stats.totalLines} Zeilen`);
    return this.stats;
  }

  async analyzePackageJson() {
    const packagePath = path.join(this.rootDir, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      this.stats.dependencies = packageJson.dependencies || {};
      this.stats.devDependencies = packageJson.devDependencies || {};
      this.stats.scripts = packageJson.scripts || {};
      this.stats.name = packageJson.name;
      this.stats.description = packageJson.description;
      this.stats.version = packageJson.version;
    } else {
      console.log('⚠️ Keine package.json gefunden');
      this.stats.name = path.basename(this.rootDir);
    }
  }

  async analyzeFileStructure(dir, relativePath = '') {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      // Ignoriere node_modules, .git, .env, dist, build
      const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next'];
      if (ignoreDirs.includes(entry)) continue;
      
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        await this.analyzeFileStructure(fullPath, path.join(relativePath, entry));
      } else {
        this.stats.totalFiles++;
        
        // Dateisprache erkennen
        const ext = path.extname(entry).toLowerCase();
        const langMap = {
          '.js': 'JavaScript', '.ts': 'TypeScript', '.py': 'Python',
          '.java': 'Java', '.go': 'Go', '.rb': 'Ruby', '.php': 'PHP',
          '.html': 'HTML', '.css': 'CSS', '.json': 'JSON', '.md': 'Markdown'
        };
        
        const language = langMap[ext] || 'Other';
        this.stats.languages[language] = (this.stats.languages[language] || 0) + 1;
        
        // Zeilen zählen (nur Code-Dateien)
        if (['.js', '.ts', '.py', '.java', '.go', '.rb', '.php', '.html', '.css'].includes(ext)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n').length;
          this.stats.totalLines += lines;
        }
      }
    }
  }

  findMainEntry() {
    const possibleEntries = ['index.js', 'main.js', 'app.js', 'server.js', 'cli.js'];
    
    for (const entry of possibleEntries) {
      const entryPath = path.join(this.rootDir, entry);
      if (fs.existsSync(entryPath)) {
        this.stats.mainEntry = entry;
        break;
      }
    }
  }

  generateReadme() {
    const name = this.stats.name || path.basename(this.rootDir);
    const description = this.stats.description || `Eine professionelle ${name} Anwendung`;
    
    let readme = `# ${this.toTitleCase(name.replace(/-/g, ' '))}

${description}

## 📊 Projektstatistiken

- **Version:** ${this.stats.version || '1.0.0'}
- **Dateien:** ${this.stats.totalFiles}
- **Codezeilen:** ${this.stats.totalLines.toLocaleString()}
- **Sprachen:** ${Object.keys(this.stats.languages).join(', ')}

## 🚀 Installation

\`\`\`bash
# Repository klonen
git clone https://github.com/yourusername/${name}.git

# In Projektverzeichnis wechseln
cd ${name}

# Abhängigkeiten installieren
npm install
\`\`\`

## 💻 Verwendung

`;

    if (this.stats.mainEntry) {
      readme += `\`\`\`bash
# Anwendung starten
node ${this.stats.mainEntry}
\`\`\`

`;
    }

    if (Object.keys(this.stats.scripts).length > 0) {
      readme += `### NPM Scripts

| Script | Beschreibung |
|--------|-------------|
`;
      for (const [script, cmd] of Object.entries(this.stats.scripts)) {
        readme += `| \`npm run ${script}\` | ${cmd} |\n`;
      }
      readme += '\n';
    }

    if (Object.keys(this.stats.dependencies).length > 0) {
      readme += `## 📦 Hauptabhängigkeiten

`;
      for (const [dep, version] of Object.entries(this.stats.dependencies).slice(0, 10)) {
        readme += `- **${dep}** ${version}\n`;
      }
      readme += '\n';
    }

    readme += `## 📁 Projektstruktur

\`\`\`
${this.generateFileTree()}
\`\`\`

## 🔧 Entwicklung

\`\`\`bash
# Entwicklungsserver starten
npm run dev

# Tests ausführen
npm test

# Build erstellen
npm run build
\`\`\`

## 📝 API Dokumentation

`;

    if (this.hasApiRoutes()) {
      readme += `Das Projekt enthält API-Endpunkte unter \`/api\`.  
Detaillierte Dokumentation wird automatisch generiert.
`;
    } else {
      readme += `API-Dokumentation folgt in Kürze.
`;
    }

    readme += `
## 🤝 Contributing

1. Fork das Projekt
2. Erstelle einen Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit die Änderungen (\`git commit -m 'Add some AmazingFeature'\`)
4. Push zum Branch (\`git push origin feature/AmazingFeature\`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert.

## 👥 Autoren

- **Dein Name** - *Initialarbeit*

## 🙏 Danksagungen

- Hat jemandem geholfen
- Inspiration
- etc.

---

⭐️ Von [deinem GitHub Username](https://github.com/yourusername) erstellt
`;

    return readme;
  }

  generateFileTree(dir = this.rootDir, prefix = '', isLast = true, level = 0) {
    if (level > 2) return ''; // Nur 3 Ebenen tief
    
    let tree = '';
    const entries = fs.readdirSync(dir)
      .filter(entry => !['node_modules', '.git', 'dist', 'build', '.env'].includes(entry))
      .sort();
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const isLastEntry = i === entries.length - 1;
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      tree += `${prefix}${isLastEntry ? '└── ' : '├── '}${entry}${stat.isDirectory() ? '/' : ''}\n`;
      
      if (stat.isDirectory() && level < 2) {
        const newPrefix = prefix + (isLastEntry ? '    ' : '│   ');
        tree += this.generateFileTree(fullPath, newPrefix, isLastEntry, level + 1);
      }
    }
    
    return tree;
  }

  hasApiRoutes() {
    const apiPaths = ['/api', '/routes', '/controllers'];
    for (const apiPath of apiPaths) {
      const fullPath = path.join(this.rootDir, apiPath);
      if (fs.existsSync(fullPath)) {
        return true;
      }
    }
    return false;
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  async save(outputPath = './README.md') {
    await this.analyze();
    const readme = this.generateReadme();
    fs.writeFileSync(outputPath, readme, 'utf8');
    console.log(`✅ README.md wurde erstellt unter: ${outputPath}`);
    return outputPath;
  }
}

// CLI Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log(`
╔═══════════════════════════════════════╗
║   📚 README Generator Tool v1.0       ║
║   Generiere automatisch README.md     ║
╚═══════════════════════════════════════╝
  `);
  
  rl.question('📁 Projektpfad (Standard: aktuelles Verzeichnis): ', async (projectPath) => {
    const targetPath = projectPath.trim() || '.';
    
    if (!fs.existsSync(targetPath)) {
      console.error(`❌ Pfad "${targetPath}" existiert nicht!`);
      rl.close();
      return;
    }
    
    const generator = new ReadmeGenerator(targetPath);
    
    console.log('\n🔄 Generiere README.md...\n');
    await generator.save();
    
    console.log('\n✨ Fertig! README.md wurde erfolgreich erstellt.\n');
    rl.close();
  });
}

// Export für Modulnutzung
module.exports = ReadmeGenerator;

// CLI ausführen wenn direkt gestartet
if (require.main === module) {
  main();
}
#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";

const projectName = process.argv[2];

if (!projectName) {
  console.error("❌ Bitte gib einen Projektnamen an.");
  process.exit(1);
}

// readline Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("📍 Wo soll das Projekt erstellt werden? (Pfad): ", (inputPath) => {
  const basePath = path.join(inputPath.trim(), projectName);

// Ordnerstruktur
const structure = [
  "db",
  "middleware",
  "models",
  "routes",
  "public/js"
];

const files = {
  "public/index.html": `<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Login</h1>
  <script type="module" src="./js/auth.js"></script>
</body>
</html>`,

  "public/main.html": `<!DOCTYPE html>
<html>
<head>
  <title>Main</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Main Page</h1>
  <script type="module" src="./js/main.js"></script>
</body>
</html>`,

  "public/style.css": `body {
  font-family: Arial, sans-serif;
}`,

  "public/js/auth.js": `// Auth Module
export function login(user) {
  console.log("Login:", user);
}`,

  "public/js/api.js": `// API Module
export async function request(url, options = {}) {
  const res = await fetch(url, options);
  return res.json();
}`,

  "public/js/main.js": `// Main Frontend Logic
import { login } from "./auth.js";
import { request } from "./api.js";

login("testUser");

request("/api/test").then(data => {
  console.log(data);
});`,

  "server.js": `import express from "express";

const app = express();
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from server" });
});

app.listen(3000, () => {
  console.log("Server läuft auf Port 3000");
});`,

  ".env": `PORT=3000`,

  "package.json": JSON.stringify({
    name: projectName,
    version: "1.0.0",
    type: "module",
    scripts: {
      start: "node server.js"
    }
  }, null, 2)
};

// Ordner erstellen
  structure.forEach(dir => {
    fs.mkdirSync(path.join(basePath, dir), { recursive: true });
  });

  // Dateien erstellen
  Object.entries(files).forEach(([filePath, content]) => {
    fs.writeFileSync(path.join(basePath, filePath), content);
  });

  console.log(`\n✅ Projekt "${projectName}" wurde erstellt in:\n👉 ${basePath}`);

  rl.close();
});
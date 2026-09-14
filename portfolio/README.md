# 🌟 Portfolio – Onur Kara

Meine persönliche Portfolio-Website – **100% statisch**, kein Server, kein Backend.

## ✨ Features

- 🎨 Dark/Light Mode mit localStorage
- ⌨️ Typing-Effekt in der Hero-Section
- 📱 Voll responsive (Mobile Menu, Grid-Layouts)
- 🚀 Projekte & Skills dynamisch via JavaScript
- 📧 Kontaktformular über **Web3Forms** (kostenlos, kein Server)
- 🔗 GitHub-Repos live aus dem Browser geladen
- ⚡ Kein Build-Tool, kein Node, kein npm

## 🛠 Tech-Stack

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Font Awesome (via CDN)
- Web3Forms (Kontaktformular)
- GitHub REST API (Repos live)

## 🚀 Setup

1. Repository klonen:
   \`\`\`bash
   git clone https://github.com/deinusername/portfolio.git
   cd portfolio
   \`\`\`

2. **Web3Forms Access Key holen**:
   - Gehe zu [web3forms.com](https://web3forms.com)
   - E-Mail eingeben → Key kommt per Mail
   - Key in `js/main.js` bei \`CONFIG.web3formsKey\` eintragen

3. **Persönliche Daten eintragen**:
   - In `js/main.js` den \`CONFIG\`-Block oben ausfüllen:
     - `name`, `email`, `github`, `linkedin`, `x`, `cvUrl`

4. `index.html` im Browser öffnen – fertig! 🎉

## 🌐 Deployment (kostenlos)

### Option 1: GitHub Pages
1. Repo auf GitHub pushen
2. Settings → Pages → Branch: `main`, Ordner: `/ (root)`
3. Nach ~1 Min erreichbar unter `https://deinusername.github.io/portfolio`

### Option 2: Vercel
1. [vercel.com](https://vercel.com) → „New Project"
2. Repo importieren → Deploy
3. Sofort live mit eigener URL

### Option 3: Netlify
1. [netlify.com](https://netlify.com) → Ordner reinziehen
2. Fertig.

## 📝 Inhalte anpassen

- **Projekte**: Array \`projects\` in `js/main.js`
- **Skills**: Array \`skills\` in `js/main.js`
- **Profil-Daten**: \`CONFIG\`-Block in `js/main.js`
- **Farben**: CSS-Variablen in `style.css` (\`:root\`)

## 📄 Lizenz

MIT
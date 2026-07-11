const express = require('express');
const router = express.Router();

// Persönliche Daten aus .env
router.get('/', (req, res) => {
    res.json({
        email: process.env.PERSON_EMAIL,
        linkedin: process.env.PERSON_LINKEDIN,
        x: process.env.PERSON_X,
        cvUrl: process.env.PERSON_CV_URL,
        githubUsername: process.env.GITHUB_USERNAME
    });
});

// GitHub Repos live laden
router.get('/github-repos', async (req, res) => {
    const username = process.env.GITHUB_USERNAME;
    const token = process.env.GITHUB_TOKEN;
    
    try {
        const headers = token ? { 'Authorization': `token ${token}` } : {};
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, { headers });
        const repos = await response.json();
        
        res.json(repos.map(repo => ({
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language,
            updated_at: repo.updated_at
        })));
    } catch (error) {
        console.error('GitHub API Error:', error);
        res.status(500).json({ error: 'Konnte Repos nicht laden' });
    }
});

module.exports = router;
#!/usr/bin/env node

// Terinaleingabe: JSON
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Bitte geben Sie die JSON-Daten ein: ', (input) => {
    try {
        if (!input.trim()) {
            console.error('Keine JSON-Daten eingegeben.');
            rl.close();
            return;
        }
        const jsonData = JSON.parse(input);
        const formattedJson = JSON.stringify(jsonData, null, 4);
        console.log('Formatiertes JSON:');
        console.log(formattedJson);
    } catch (parseErr) {
        console.error('Fehler beim Parsen der JSON-Daten:', parseErr);
    }
    rl.close();
});


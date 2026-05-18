#!/usr/bin/env node

//Terminal Datei Eingabe
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Frage nach der Datei
rl.question('Bitte geben Sie den Pfad zur Datei ein: ', (filePath) => {
    const fs = require('fs');
    //Datei lesen
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Fehler beim Lesen der Datei:', err);
            rl.close();
            return;
        }
    //Dateigröße ermitteln
        const fileSizeInBytes = Buffer.byteLength(data, 'utf8');
        console.log(`Die Größe der Datei beträgt: ${fileSizeInBytes} Bytes`);
        rl.close();
    });
});
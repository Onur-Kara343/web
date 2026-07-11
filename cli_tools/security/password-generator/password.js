#!/usr/bin/env node

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Sicheren Passwort Erstellen
function createPassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

//Benutzer Eingabe für Passwortlänge
rl.question('Geben Sie die gewünschte Länge des Passworts ein (8-32): ', (answer) => {
    const length = parseInt(answer);
    if (isNaN(length) || length < 8 || length > 32) {
        console.log('Ungültige Zahl.');
        console.log('Programm wird beendet.');
        rl.close();
    } else {
        const password = createPassword(length);
        console.log(`Ihr generiertes Passwort: ${password}`);
        rl.close();
    }
    rl.close();
});
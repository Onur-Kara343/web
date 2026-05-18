#!/usr/bin/env node

// Morse Code Maps
const morseCodeMapabc = {
    'A': '.-','B': '-...','C': '-.-.','D': '-..','E': '.',
    'F': '..-.','G': '--.','H': '....','I': '..','J': '.---',
    'K': '-.-','L': '.-..','M': '--','N': '-.','O': '---',
    'P': '.--.','Q': '--.-','R': '.-.','S': '...','T': '-',
    'U': '..-','V': '...-','W': '.--','X': '-..-','Y': '-.--','Z': '--..'
};

const morseCodeMap123 = {
    '0': '-----','1': '.----','2': '..---','3': '...--','4': '....-',
    '5': '.....','6': '-....','7': '--...','8': '---..','9': '----.'
};

// 🔁 Reverse Map (Morse → Text)
const reverseMap = {};
[...Object.entries(morseCodeMapabc), ...Object.entries(morseCodeMap123)]
    .forEach(([key, value]) => {
        reverseMap[value] = key;
    });

// ➜ Text → Morse
function textToMorse(text) {
    let morseCode = '';
    for (let char of text.toUpperCase()) {
        if (morseCodeMapabc[char]) {
            morseCode += morseCodeMapabc[char] + ' ';
        } else if (morseCodeMap123[char]) {
            morseCode += morseCodeMap123[char] + ' ';
        } else if (char === ' ') {
            morseCode += '/ ';
        } else {
            morseCode += '? ';
        }
    }
    return morseCode.trim();
}

// ➜ Morse → Text
function morseToText(morse) {
    return morse
        .split(' ')
        .map(code => {
            if (code === '/') return ' ';
            return reverseMap[code] || '?';
        })
        .join('');
}

// Terminal
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// 🚀 Auswahl-Menü
console.log('\nWas möchtest du machen?');
console.log('1 → Deutsch zu Morsecode');
console.log('2 → Morsecode zu Deutsch\n');

readline.question('Wähle (1 oder 2): ', (choice) => {

    if (choice === '1') {
        readline.question('Text eingeben: ', (input) => {
            console.log('\nMorsecode:\n' + textToMorse(input));
            readline.close();
        });

    } else if (choice === '2') {
        readline.question('Morsecode eingeben (mit Leerzeichen, / für Wort): ', (input) => {
            console.log('\nText:\n' + morseToText(input));
            readline.close();
        });

    } else {
        console.log('Ungültige Eingabe 😅');
        readline.close();
    }
});
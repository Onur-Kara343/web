#!/usr/bin/env node

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function calculatePoints(maxPoints, achievedPoints) {
  if (maxPoints <= 0) return 'Ungültige maximale Punkte';
  if (achievedPoints < 0 || achievedPoints > maxPoints) {
    return 'Ungültige erreichte Punkte';
  }

  const points = Math.floor((achievedPoints / maxPoints) * 15);
  return points;
}

function getCategory(points) {
  if (points >= 13) return 'sehr gut';
  if (points >= 10) return 'gut';
  if (points >= 5) return 'befriedigend';
  if (points >= 3) return 'ausreichend';
  if (points >= 1) return 'mangelhaft';
  return 'ungenügend';
}

rl.question('Maximale Punkte der Arbeit: ', (maxPoints) => {
  maxPoints = parseFloat(maxPoints);
  rl.question('Erreichte Punkte: ', (achievedPoints) => {
    achievedPoints = parseFloat(achievedPoints);
    const points = calculatePoints(maxPoints, achievedPoints);
    if (typeof points === 'number') {
      const category = getCategory(points);
      console.log(`Die Punktzahl ist: ${points} (${category})`);
    } else {
      console.log(points); // Fehlerausgabe
    }
    rl.close();
  });
});

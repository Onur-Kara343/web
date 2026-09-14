const bigFiveQuestions = [
    // Extraversion (6 Fragen)
    { id: 1, text: "Ich bin oft der Mittelpunkt von Partys.", dimension: "extraversion", reverse: false },
    { id: 2, text: "Ich fühle mich nach geselligen Treffen oft erschöpft.", dimension: "extraversion", reverse: true },
    { id: 3, text: "Ich genieße es, neue Leute kennenzulernen.", dimension: "extraversion", reverse: false },
    { id: 4, text: "Ich halte mich lieber im Hintergrund.", dimension: "extraversion", reverse: true },
    { id: 5, text: "Ich bin voller Energie und Begeisterung.", dimension: "extraversion", reverse: false },
    { id: 6, text: "Ich brauche viel Zeit für mich allein.", dimension: "extraversion", reverse: true },
    
    // Gewissenhaftigkeit (6 Fragen)
    { id: 7, text: "Ich erledige Aufgaben immer gründlich.", dimension: "conscientiousness", reverse: false },
    { id: 8, text: "Ich lasse Dinge oft liegen.", dimension: "conscientiousness", reverse: true },
    { id: 9, text: "Ich halte meine Sachen ordentlich.", dimension: "conscientiousness", reverse: false },
    { id: 10, text: "Ich bin oft unorganisiert.", dimension: "conscientiousness", reverse: true },
    { id: 11, text: "Ich setze mir hohe Ziele.", dimension: "conscientiousness", reverse: false },
    { id: 12, text: "Ich schiebe Dinge gerne auf.", dimension: "conscientiousness", reverse: true },
    
    // Offenheit (6 Fragen)
    { id: 13, text: "Ich liebe es, neue Dinge auszuprobieren.", dimension: "openness", reverse: false },
    { id: 14, text: "Ich bleibe gerne bei dem, was ich kenne.", dimension: "openness", reverse: true },
    { id: 15, text: "Ich interessiere mich für Kunst und Kultur.", dimension: "openness", reverse: false },
    { id: 16, text: "Ich bin nicht besonders kreativ.", dimension: "openness", reverse: true },
    { id: 17, text: "Ich reise gerne an unbekannte Orte.", dimension: "openness", reverse: false },
    { id: 18, text: "Ich mag keine Veränderungen.", dimension: "openness", reverse: true },
    
    // Verträglichkeit (6 Fragen)
    { id: 19, text: "Ich nehme Rücksicht auf andere.", dimension: "agreeableness", reverse: false },
    { id: 20, text: "Ich setze mich oft gegen andere durch.", dimension: "agreeableness", reverse: true },
    { id: 21, text: "Ich helfe anderen gerne.", dimension: "agreeableness", reverse: false },
    { id: 22, text: "Ich bin eher egoistisch.", dimension: "agreeableness", reverse: true },
    { id: 23, text: "Ich kann mich gut in andere hineinversetzen.", dimension: "agreeableness", reverse: false },
    { id: 24, text: "Ich bin oft misstrauisch gegenüber anderen.", dimension: "agreeableness", reverse: true },
    
    // Neurotizismus (6 Fragen)
    { id: 25, text: "Ich mache mir oft Sorgen.", dimension: "neuroticism", reverse: false },
    { id: 26, text: "Ich bleibe auch in stressigen Situationen ruhig.", dimension: "neuroticism", reverse: true },
    { id: 27, text: "Ich bin schnell gereizt.", dimension: "neuroticism", reverse: false },
    { id: 28, text: "Ich bin meistens entspannt.", dimension: "neuroticism", reverse: true },
    { id: 29, text: "Ich fühle mich oft niedergeschlagen.", dimension: "neuroticism", reverse: false },
    { id: 30, text: "Ich kann gut mit Kritik umgehen.", dimension: "neuroticism", reverse: true }
];

module.exports = bigFiveQuestions;
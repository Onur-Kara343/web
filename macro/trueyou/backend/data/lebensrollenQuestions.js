const lebensrollenQuestions = [
    // Beruf/Karriere (6 Fragen)
    { id: 1, text: "Meine Arbeit ist ein wichtiger Teil meiner Identität.", dimension: "career", reverse: false },
    { id: 2, text: "Ich identifiziere mich stark mit meinem Beruf.", dimension: "career", reverse: false },
    { id: 3, text: "Karriere ist mir nicht so wichtig.", dimension: "career", reverse: true },
    { id: 4, text: "Ich möchte in meinem Job etwas bewegen.", dimension: "career", reverse: false },
    { id: 5, text: "Arbeit ist für mich nur Mittel zum Zweck.", dimension: "career", reverse: true },
    { id: 6, text: "Mein Beruf erfüllt mich.", dimension: "career", reverse: false },
    
    // Familie/Partner (6 Fragen)
    { id: 7, text: "Meine Familie ist das Wichtigste in meinem Leben.", dimension: "family", reverse: false },
    { id: 8, text: "Zeit mit meinem Partner ist mir heilig.", dimension: "family", reverse: false },
    { id: 9, text: "Kinder zu haben ist ein zentrales Lebensziel.", dimension: "family", reverse: false },
    { id: 10, text: "Ich möchte eine eigene Familie gründen.", dimension: "family", reverse: false },
    { id: 11, text: "Familienpflichten empfinde ich oft als Last.", dimension: "family", reverse: true },
    { id: 12, text: "Meine Beziehung gibt mir Halt.", dimension: "family", reverse: false },
    
    // Freundschaften (6 Fragen)
    { id: 13, text: "Freunde sind für mich wie Familie.", dimension: "friendship", reverse: false },
    { id: 14, text: "Ich pflege meine Freundschaften aktiv.", dimension: "friendship", reverse: false },
    { id: 15, text: "Ich habe nur wenige, aber enge Freunde.", dimension: "friendship", reverse: false },
    { id: 16, text: "Freundschaften sind mir sehr wichtig.", dimension: "friendship", reverse: false },
    { id: 17, text: "Ich verbringe gerne Zeit mit Freunden.", dimension: "friendship", reverse: false },
    { id: 18, text: "Neue Freundschaften zu schließen fällt mir schwer.", dimension: "friendship", reverse: true },
    
    // Hobbys/Interessen (6 Fragen)
    { id: 19, text: "Meine Hobbys sind ein wichtiger Ausgleich.", dimension: "hobbies", reverse: false },
    { id: 20, text: "Ich habe viele verschiedene Interessen.", dimension: "hobbies", reverse: false },
    { id: 21, text: "Für meine Hobbys nehme ich mir bewusst Zeit.", dimension: "hobbies", reverse: false },
    { id: 22, text: "Ich habe kaum Zeit für Hobbys.", dimension: "hobbies", reverse: true },
    { id: 23, text: "Meine Leidenschaften definieren mich.", dimension: "hobbies", reverse: false },
    { id: 24, text: "Hobbys sind für mich Zeitverschwendung.", dimension: "hobbies", reverse: true },
    
    // Selbstentwicklung (6 Fragen)
    { id: 25, text: "Persönliches Wachstum ist mir wichtig.", dimension: "growth", reverse: false },
    { id: 26, text: "Ich bilde mich ständig weiter.", dimension: "growth", reverse: false },
    { id: 27, text: "Spiritualität oder Philosophie interessieren mich.", dimension: "growth", reverse: false },
    { id: 28, text: "Ich reflektiere regelmäßig mein Leben.", dimension: "growth", reverse: false },
    { id: 29, text: "Neues zu lernen motiviert mich.", dimension: "growth", reverse: false },
    { id: 30, text: "Selbstoptimierung ist mir wichtig.", dimension: "growth", reverse: false }
];

module.exports = lebensrollenQuestions;
// controllers/testsController.js
const pool = require('../db/pool');

// ========== FRAGEN IMPORTS ==========
const bigFive = require('../data/bigFiveQuestions');
const bindungsstil = require('../data/bindungsstilQuestions');
const resilienz = require('../data/resilienzQuestions');
const jungArchetypen = require('../data/jungArchetypenQuestions');
const schattenseiten = require('../data/schattenseitenQuestions');
const kommunikationsstil = require('../data/kommunikationsstilQuestions');
const entscheidungstyp = require('../data/entscheidungstypQuestions');
const konfliktstil = require('../data/konfliktstilQuestions');
const emotionaleIntelligenz = require('../data/emotionaleIntelligenzQuestions');
const selbstwert = require('../data/selbstwertQuestions');
const lebensrollen = require('../data/lebensrollenQuestions');
const lebenswerte = require('../data/lebenswerteQuestions');
const motivationsprofil = require('../data/motivationsprofilQuestions');
const innereAntreiber = require('../data/innereAntreiberQuestions');
const stressprofil = require('../data/stressprofilQuestions');

// ========== HILFSFUNKTION ==========
function safeRequire(data) {
    return Array.isArray(data) ? data : (data.questions || data);
}

// ============================================================
// 🔥 ALLE BERECHNUNGSFUNKTIONEN - MÜSSEN VOR DEM TESTS-OBJEKT DEFINIERET WERDEN!
// ============================================================

// 1. BIG FIVE
function calculateBigFive(answers) {
    const scores = { extraversion: 0, conscientiousness: 0, openness: 0, agreeableness: 0, neuroticism: 0 };
    const counts = { extraversion: 0, conscientiousness: 0, openness: 0, agreeableness: 0, neuroticism: 0 };
    const questions = bigFive;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        let score = parseInt(answer);
        if (q.reverse) score = 6 - score;
        scores[q.dimension] += score;
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    const traits = [];
    if (averages.extraversion >= 4) traits.push("extravertiert");
    else if (averages.extraversion <= 2) traits.push("introvertiert");
    if (averages.conscientiousness >= 4) traits.push("gewissenhaft");
    else if (averages.conscientiousness <= 2) traits.push("spontan");
    if (averages.openness >= 4) traits.push("offen für Neues");
    else if (averages.openness <= 2) traits.push("traditionell");
    if (averages.agreeableness >= 4) traits.push("harmoniebedürftig");
    else if (averages.agreeableness <= 2) traits.push("wettbewerbsorientiert");
    if (averages.neuroticism >= 4) traits.push("emotional sensibel");
    else if (averages.neuroticism <= 2) traits.push("emotional stabil");
    
    const interpretation = traits.length > 0 ? `Deine Persönlichkeit ist geprägt durch: ${traits.join(", ")}.` : "Du hast eine ausgewogene Persönlichkeit.";
    
    return { scores, averages, interpretation, dominant_traits: traits };
}

// 2. BINDUNGSSTIL
function calculateBindungsstil(answers) {
    const scores = { secure: 0, anxious: 0, avoidant: 0 };
    const counts = { secure: 0, anxious: 0, avoidant: 0 };
    const questions = bindungsstil;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    let dominant = "secure";
    let maxScore = averages.secure;
    if (averages.anxious > maxScore) { dominant = "anxious"; maxScore = averages.anxious; }
    if (averages.avoidant > maxScore) { dominant = "avoidant"; maxScore = averages.avoidant; }
    
    const interpretations = {
        secure: "Du hast einen sicheren Bindungsstil. Du fühlst dich in Beziehungen wohl, kannst Nähe genießen und auch allein sein.",
        anxious: "Du hast einen ängstlichen Bindungsstil. Du sehnst dich nach Nähe, hast aber Angst vor Verlust.",
        avoidant: "Du hast einen vermeidenden Bindungsstil. Nähe und Intimität machen dir eher unwohl."
    };
    
    return { scores: averages, dominant, interpretation: interpretations[dominant] };
}

// 3. RESILIENZ
function calculateResilienz(answers) {
    const scores = { adaptability: 0, optimism: 0, self_efficacy: 0, emotion_regulation: 0, social_support: 0 };
    const counts = { adaptability: 0, optimism: 0, self_efficacy: 0, emotion_regulation: 0, social_support: 0 };
    const questions = resilienz;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        let score = parseInt(answer);
        if (q.reverse) score = 6 - score;
        scores[q.dimension] += score;
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    const total = Object.values(averages).reduce((a, b) => a + b, 0);
    const percentage = (total / 25) * 100;
    
    let level = "";
    if (percentage >= 80) level = "Sehr hohe Resilienz 🌟";
    else if (percentage >= 60) level = "Hohe Resilienz 💪";
    else if (percentage >= 40) level = "Mittlere Resilienz ⚖️";
    else if (percentage >= 20) level = "Geringe Resilienz 🌱";
    else level = "Sehr geringe Resilienz ⚠️";
    
    return { scores: averages, total_percentage: Math.round(percentage), level, interpretation: level };
}

// 4. JUNG-ARCHETYPEN
function calculateJungArchetypen(answers) {
    const scores = { hero: 0, sage: 0, explorer: 0, caregiver: 0, rebel: 0 };
    const counts = { hero: 0, sage: 0, explorer: 0, caregiver: 0, rebel: 0 };
    const questions = jungArchetypen;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    let dominant = "hero";
    let maxScore = 0;
    for (let dim in averages) {
        if (averages[dim] > maxScore) {
            maxScore = averages[dim];
            dominant = dim;
        }
    }
    
    const interpretations = {
        hero: "Der Held – Du stellst dich Herausforderungen und willst etwas bewegen.",
        sage: "Der Weise – Du suchst nach Wahrheit und Wissen.",
        explorer: "Der Entdecker – Du liebst Freiheit und neue Erfahrungen.",
        caregiver: "Der Fürsorger – Du kümmerst dich um andere.",
        rebel: "Der Rebell – Du hinterfragst Autoritäten und gehst eigene Wege."
    };
    
    return { scores: averages, dominant, interpretation: interpretations[dominant] };
}

// 5. SCHATTENSEITEN
function calculateSchattenseiten(answers) {
    const scores = { narcissism: 0, perfectionism: 0, control: 0, mistrust: 0, avoidance: 0 };
    const counts = { narcissism: 0, perfectionism: 0, control: 0, mistrust: 0, avoidance: 0 };
    const questions = schattenseiten;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    const warnings = [];
    if (averages.narcissism >= 4) warnings.push("Narzissmus");
    if (averages.perfectionism >= 4) warnings.push("Perfektionismus");
    if (averages.control >= 4) warnings.push("Kontrollzwang");
    if (averages.mistrust >= 4) warnings.push("Misstrauen");
    if (averages.avoidance >= 4) warnings.push("Vermeidung");
    
    const interpretation = warnings.length > 0 ? `Auffällige Schattenseiten: ${warnings.join(", ")}.` : "Keine stark ausgeprägten Schattenseiten.";
    
    return { scores: averages, warnings, interpretation };
}

// 6. KOMMUNIKATIONSSTIL
function calculateKommunikationsstil(answers) {
    const scores = { assertive: 0, diplomatic: 0, reserved: 0 };
    const counts = { assertive: 0, diplomatic: 0, reserved: 0 };
    const questions = kommunikationsstil;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    let dominant = "assertive";
    let maxScore = averages.assertive;
    if (averages.diplomatic > maxScore) { dominant = "diplomatic"; maxScore = averages.diplomatic; }
    if (averages.reserved > maxScore) { dominant = "reserved"; maxScore = averages.reserved; }
    
    const interpretations = {
        assertive: "Du bist durchsetzungsstark und direkt.",
        diplomatic: "Du bist harmonieorientiert und diplomatisch.",
        reserved: "Du bist zurückhaltend und schüchtern."
    };
    
    return { scores: averages, dominant, interpretation: interpretations[dominant] };
}

// 7. ENTSCHEIDUNGSTYP
function calculateEntscheidungstyp(answers) {
    const scores = { rational: 0, intuitive: 0, emotional: 0 };
    const counts = { rational: 0, intuitive: 0, emotional: 0 };
    const questions = entscheidungstyp;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    let dominant = "rational";
    let maxScore = averages.rational;
    if (averages.intuitive > maxScore) { dominant = "intuitive"; maxScore = averages.intuitive; }
    if (averages.emotional > maxScore) { dominant = "emotional"; maxScore = averages.emotional; }
    
    const interpretations = {
        rational: "Du entscheidest rational, mit Logik und Fakten.",
        intuitive: "Du entscheidest intuitiv, mit Bauchgefühl.",
        emotional: "Du entscheidest emotional, mit dem Herzen."
    };
    
    return { scores: averages, dominant, interpretation: interpretations[dominant] };
}

// 8. KONFLIKTSTIL
function calculateKonfliktstil(answers) {
    const scores = { harmonizing: 0, confrontational: 0, avoiding: 0 };
    const counts = { harmonizing: 0, confrontational: 0, avoiding: 0 };
    const questions = konfliktstil;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    let dominant = "harmonizing";
    let maxScore = averages.harmonizing;
    if (averages.confrontational > maxScore) { dominant = "confrontational"; maxScore = averages.confrontational; }
    if (averages.avoiding > maxScore) { dominant = "avoiding"; maxScore = averages.avoiding; }
    
    const interpretations = {
        harmonizing: "Du bist harmoniebedürftig und suchst Kompromisse.",
        confrontational: "Du bist konfrontativ und sprichst Probleme direkt an.",
        avoiding: "Du bist vermeidend und gehst Konflikten aus dem Weg."
    };
    
    return { scores: averages, dominant, interpretation: interpretations[dominant] };
}

// 9. EMOTIONALE INTELLIGENZ
function calculateEmotionaleIntelligenz(answers) {
    const scores = { self_awareness: 0, self_regulation: 0, empathy: 0, social_skills: 0, motivation: 0 };
    const counts = { self_awareness: 0, self_regulation: 0, empathy: 0, social_skills: 0, motivation: 0 };
    const questions = emotionaleIntelligenz;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        let score = parseInt(answer);
        if (q.reverse) score = 6 - score;
        scores[q.dimension] += score;
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    const total = Object.values(averages).reduce((a, b) => a + b, 0);
    const percentage = (total / 25) * 100;
    
    let level = "";
    if (percentage >= 80) level = "Sehr hohe EQ 🌟";
    else if (percentage >= 60) level = "Hohe EQ 💪";
    else if (percentage >= 40) level = "Mittlere EQ ⚖️";
    else if (percentage >= 20) level = "Geringe EQ 🌱";
    else level = "Sehr geringe EQ ⚠️";
    
    return { scores: averages, total_percentage: Math.round(percentage), level, interpretation: level };
}

// 10. SELBSTWERT
function calculateSelbstwert(answers) {
    const scores = { self_acceptance: 0, self_confidence: 0, self_worth: 0 };
    const counts = { self_acceptance: 0, self_confidence: 0, self_worth: 0 };
    const questions = selbstwert;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        let score = parseInt(answer);
        if (q.reverse) score = 6 - score;
        scores[q.dimension] += score;
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    const total = Object.values(averages).reduce((a, b) => a + b, 0);
    const percentage = (total / 15) * 100;
    
    let level = "";
    if (percentage >= 80) level = "Sehr hoher Selbstwert 🌟";
    else if (percentage >= 60) level = "Hoher Selbstwert 💪";
    else if (percentage >= 40) level = "Mittlerer Selbstwert ⚖️";
    else if (percentage >= 20) level = "Geringer Selbstwert 🌱";
    else level = "Sehr geringer Selbstwert ⚠️";
    
    return { scores: averages, total_percentage: Math.round(percentage), level, interpretation: level };
}

// 11. LEBENSROLLEN
function calculateLebensrollen(answers) {
    const scores = { career: 0, family: 0, friendship: 0, hobbies: 0, growth: 0 };
    const counts = { career: 0, family: 0, friendship: 0, hobbies: 0, growth: 0 };
    const questions = lebensrollen;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        let score = parseInt(answer);
        if (q.reverse) score = 6 - score;
        scores[q.dimension] += score;
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    let mostImportant = "career";
    let maxScore = 0;
    for (let dim in averages) {
        if (averages[dim] > maxScore) {
            maxScore = averages[dim];
            mostImportant = dim;
        }
    }
    
    const interpretations = {
        career: "Deine Karriere ist dir am wichtigsten.",
        family: "Deine Familie ist dir am wichtigsten.",
        friendship: "Deine Freundschaften sind dir am wichtigsten.",
        hobbies: "Deine Hobbys sind dir am wichtigsten.",
        growth: "Deine persönliche Entwicklung ist dir am wichtigsten."
    };
    
    return { scores: averages, most_important: mostImportant, interpretation: interpretations[mostImportant] };
}

// 12. LEBENSWERTE
function calculateLebenswerte(answers) {
    const scores = { security: 0, freedom: 0, achievement: 0, relationships: 0, meaning: 0 };
    const counts = { security: 0, freedom: 0, achievement: 0, relationships: 0, meaning: 0 };
    const questions = lebenswerte;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    let topValue = "security";
    let maxScore = 0;
    for (let dim in averages) {
        if (averages[dim] > maxScore) {
            maxScore = averages[dim];
            topValue = dim;
        }
    }
    
    const interpretations = {
        security: "Sicherheit ist dir am wichtigsten.",
        freedom: "Freiheit ist dir am wichtigsten.",
        achievement: "Erfolg ist dir am wichtigsten.",
        relationships: "Beziehungen sind dir am wichtigsten.",
        meaning: "Sinn und Erfüllung sind dir am wichtigsten."
    };
    
    return { scores: averages, top_value: topValue, interpretation: interpretations[topValue] };
}

// 13. MOTIVATIONSPROFIL
function calculateMotivationsprofil(answers) {
    const scores = { achievement_motivation: 0, power_motivation: 0, affiliation_motivation: 0 };
    const counts = { achievement_motivation: 0, power_motivation: 0, affiliation_motivation: 0 };
    const questions = motivationsprofil;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    let dominant = "achievement_motivation";
    let maxScore = averages.achievement_motivation;
    if (averages.power_motivation > maxScore) { dominant = "power_motivation"; maxScore = averages.power_motivation; }
    if (averages.affiliation_motivation > maxScore) { dominant = "affiliation_motivation"; maxScore = averages.affiliation_motivation; }
    
    const interpretations = {
        achievement_motivation: "Leistung treibt dich an.",
        power_motivation: "Macht und Einfluss treiben dich an.",
        affiliation_motivation: "Zugehörigkeit und Teamwork treiben dich an."
    };
    
    return { scores: averages, dominant, interpretation: interpretations[dominant] };
}

// 14. INNERE ANTREIBER
function calculateInnereAntreiber(answers) {
    const scores = { perfection_driver: 0, strength_driver: 0, hurry_driver: 0, please_driver: 0, effort_driver: 0 };
    const counts = { perfection_driver: 0, strength_driver: 0, hurry_driver: 0, please_driver: 0, effort_driver: 0 };
    const questions = innereAntreiber;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    const strongDrivers = [];
    if (averages.perfection_driver >= 4) strongDrivers.push("Perfektionismus");
    if (averages.strength_driver >= 4) strongDrivers.push("Stärke zeigen");
    if (averages.hurry_driver >= 4) strongDrivers.push("Eile");
    if (averages.please_driver >= 4) strongDrivers.push("Harmonie");
    if (averages.effort_driver >= 4) strongDrivers.push("Anstrengung");
    
    const interpretation = strongDrivers.length > 0 ? `Deine inneren Antreiber: ${strongDrivers.join(", ")}.` : "Keine starken inneren Antreiber.";
    
    return { scores: averages, strong_drivers: strongDrivers, interpretation };
}

// 15. STRESSPROFIL
function calculateStressprofil(answers) {
    const scores = { type_a: 0, type_b: 0, type_c: 0 };
    const counts = { type_a: 0, type_b: 0, type_c: 0 };
    const questions = stressprofil;
    
    answers.forEach((answer, idx) => {
        const q = questions[idx];
        if (!q) return;
        scores[q.dimension] += parseInt(answer);
        counts[q.dimension]++;
    });
    
    const averages = {};
    for (let dim in scores) {
        averages[dim] = parseFloat((scores[dim] / (counts[dim] || 1)).toFixed(1));
    }
    
    let dominant = "type_b";
    let maxScore = averages.type_b;
    if (averages.type_a > maxScore) { dominant = "type_a"; maxScore = averages.type_a; }
    if (averages.type_c > maxScore) { dominant = "type_c"; maxScore = averages.type_c; }
    
    const interpretations = {
        type_a: "Typ A – Du bist hektisch und ungeduldig.",
        type_b: "Typ B – Du bist ruhig und gelassen.",
        type_c: "Typ C – Du bist angespannt und besorgt."
    };
    
    return { scores: averages, dominant, interpretation: interpretations[dominant] };
}

// ============================================================
// 🔥 TEST-OBJEKT - JETZT NACH DEN BERECHNUNGSFUNKTIONEN!
// ============================================================

const tests = {
    big_five: {
        name: 'Big Five Persönlichkeitstest',
        questions: safeRequire(bigFive),
        premium: false,
        calculateResults: calculateBigFive
    },
    bindungsstil: {
        name: 'Bindungsstil Test',
        questions: safeRequire(bindungsstil),
        premium: false,
        calculateResults: calculateBindungsstil
    },
    resilienz: {
        name: 'Resilienz Test',
        questions: safeRequire(resilienz),
        premium: false,
        calculateResults: calculateResilienz
    },
    jung_archetypen: {
        name: 'Jung-Archetypen Test',
        questions: safeRequire(jungArchetypen),
        premium: true,
        calculateResults: calculateJungArchetypen
    },
    schattenseiten: {
        name: 'Schattenseiten Test',
        questions: safeRequire(schattenseiten),
        premium: true,
        calculateResults: calculateSchattenseiten
    },
    kommunikationsstil: {
        name: 'Kommunikationsstil Test',
        questions: safeRequire(kommunikationsstil),
        premium: true,
        calculateResults: calculateKommunikationsstil
    },
    entscheidungstyp: {
        name: 'Entscheidungstyp Test',
        questions: safeRequire(entscheidungstyp),
        premium: true,
        calculateResults: calculateEntscheidungstyp
    },
    konfliktstil: {
        name: 'Konfliktstil Test',
        questions: safeRequire(konfliktstil),
        premium: true,
        calculateResults: calculateKonfliktstil
    },
    emotionale_intelligenz: {
        name: 'Emotionale Intelligenz Test',
        questions: safeRequire(emotionaleIntelligenz),
        premium: true,
        calculateResults: calculateEmotionaleIntelligenz
    },
    selbstwert: {
        name: 'Selbstwert Test',
        questions: safeRequire(selbstwert),
        premium: true,
        calculateResults: calculateSelbstwert
    },
    lebensrollen: {
        name: 'Lebensrollen Test',
        questions: safeRequire(lebensrollen),
        premium: true,
        calculateResults: calculateLebensrollen
    },
    lebenswerte: {
        name: 'Lebenswerte Test',
        questions: safeRequire(lebenswerte),
        premium: true,
        calculateResults: calculateLebenswerte
    },
    motivationsprofil: {
        name: 'Motivationsprofil Test',
        questions: safeRequire(motivationsprofil),
        premium: true,
        calculateResults: calculateMotivationsprofil
    },
    innere_antreiber: {
        name: 'Innere Antreiber Test',
        questions: safeRequire(innereAntreiber),
        premium: true,
        calculateResults: calculateInnereAntreiber
    },
    stressprofil: {
        name: 'Stressprofil Test',
        questions: safeRequire(stressprofil),
        premium: true,
        calculateResults: calculateStressprofil
    }
};

// ========== CACHE BEFÜLLEN ==========
const testCache = {};
Object.keys(tests).forEach(key => {
    testCache[key] = tests[key];
});

// ========== API FUNKTIONEN ==========

// GET TEST – MIT CACHING
async function getTest(req, res) {
    const { testId } = req.params;
    const test = testCache[testId];

    if (!test) {
        return res.status(404).json({ error: 'Test nicht gefunden' });
    }

    res.json({
        test_id: testId,
        name: test.name,
        is_premium: test.premium,
        total_questions: test.questions.length,
        questions: test.questions.map(q => ({
            id: q.id,
            text: q.text,
            dimension: q.dimension
        }))
    });
}

// SUBMIT TEST – MIT VALIDIERUNG
async function submitTest(req, res) {
    const { testId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body;

    console.log('📝 Submit Test:', testId, 'User:', userId, 'Answers:', answers?.length);

    const test = testCache[testId];
    if (!test) {
        console.error('❌ Test nicht gefunden:', testId);
        return res.status(404).json({ error: 'Test nicht gefunden' });
    }

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Ungültiges Antwort-Format' });
    }

    if (answers.length !== test.questions.length) {
        return res.status(400).json({ 
            error: `Bitte alle Fragen beantworten (${test.questions.length} Fragen erwartet, ${answers.length} erhalten)` 
        });
    }

    for (let i = 0; i < answers.length; i++) {
        const val = parseInt(answers[i]);
        if (isNaN(val) || val < 1 || val > 5) {
            return res.status(400).json({ 
                error: `Ungültige Antwort bei Frage ${i + 1}: ${answers[i]}` 
            });
        }
    }

    try {
        const results = test.calculateResults(answers);
        console.log('✅ Ergebnisse berechnet:', Object.keys(results));

        const dbResult = await pool.query(
            `INSERT INTO test_results (user_id, test_id, results) 
             VALUES ($1, $2, $3) 
             RETURNING id, taken_at`,
            [userId, testId, results]
        );

        console.log('✅ Ergebnis gespeichert, ID:', dbResult.rows[0].id);

        res.json({
            message: 'Test erfolgreich abgeschlossen',
            results: results,
            id: dbResult.rows[0].id,
            taken_at: dbResult.rows[0].taken_at
        });
    } catch (error) {
        console.error('❌ Submit Test Error:', error);
        res.status(500).json({ error: 'Fehler beim Speichern der Ergebnisse: ' + error.message });
    }
}

// GET ALL RESULTS – MIT PAGINATION
async function getAllResults(req, res) {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    try {
        const results = await pool.query(
            `SELECT id, test_id, results, taken_at FROM test_results 
             WHERE user_id = $1 
             ORDER BY taken_at DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM test_results WHERE user_id = $1',
            [userId]
        );

        res.json({
            results: results.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('❌ Get Results Error:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Ergebnisse' });
    }
}

module.exports = { getTest, submitTest, getAllResults };
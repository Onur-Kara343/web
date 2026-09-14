const emotionaleIntelligenzQuestions = [
    // Selbstwahrnehmung (6 Fragen)
    { id: 1, text: "Ich erkenne meine Gefühle, während sie entstehen.", dimension: "self_awareness", reverse: false },
    { id: 2, text: "Ich verstehe, warum ich mich so fühle wie ich mich fühle.", dimension: "self_awareness", reverse: false },
    { id: 3, text: "Ich kann benennen, welche Emotion ich gerade spüre.", dimension: "self_awareness", reverse: false },
    { id: 4, text: "Oft bin ich mir meiner Gefühle nicht bewusst.", dimension: "self_awareness", reverse: true },
    { id: 5, text: "Ich weiß genau, was mich stresst.", dimension: "self_awareness", reverse: false },
    { id: 6, text: "Meine Stimmungsschwankungen sind mir ein Rätsel.", dimension: "self_awareness", reverse: true },
    
    // Selbstregulation (6 Fragen)
    { id: 7, text: "Ich kann meine Impulse gut kontrollieren.", dimension: "self_regulation", reverse: false },
    { id: 8, text: "In hitzigen Situationen bleibe ich ruhig.", dimension: "self_regulation", reverse: false },
    { id: 9, text: "Ich explodiere schnell vor Wut.", dimension: "self_regulation", reverse: true },
    { id: 10, text: "Ich kann mich nach einem Streit schnell wieder beruhigen.", dimension: "self_regulation", reverse: false },
    { id: 11, text: "Ich handle oft überstürzt.", dimension: "self_regulation", reverse: true },
    { id: 12, text: "Ich kann meine Emotionen regulieren, auch wenn sie stark sind.", dimension: "self_regulation", reverse: false },
    
    // Empathie (6 Fragen)
    { id: 13, text: "Ich kann mich gut in andere hineinversetzen.", dimension: "empathy", reverse: false },
    { id: 14, text: "Ich spüre, wenn es jemandem nicht gut geht.", dimension: "empathy", reverse: false },
    { id: 15, text: "Es fällt mir schwer, die Perspektive anderer zu verstehen.", dimension: "empathy", reverse: true },
    { id: 16, text: "Ich erkenne schnell, wenn jemand traurig ist.", dimension: "empathy", reverse: false },
    { id: 17, text: "Gefühle anderer sind mir oft egal.", dimension: "empathy", reverse: true },
    { id: 18, text: "Ich kann mitfühlen, auch wenn ich nicht betroffen bin.", dimension: "empathy", reverse: false },
    
    // Soziale Kompetenz (6 Fragen)
    { id: 19, text: "Ich komme leicht mit neuen Leuten ins Gespräch.", dimension: "social_skills", reverse: false },
    { id: 20, text: "Ich kann gut Teams führen.", dimension: "social_skills", reverse: false },
    { id: 21, text: "Konflikte zu lösen fällt mir schwer.", dimension: "social_skills", reverse: true },
    { id: 22, text: "Ich kann andere für meine Ideen begeistern.", dimension: "social_skills", reverse: false },
    { id: 23, text: "Ich bin ein guter Zuhörer.", dimension: "social_skills", reverse: false },
    { id: 24, text: "In Gruppen fühle ich mich unsicher.", dimension: "social_skills", reverse: true },
    
    // Motivation (6 Fragen)
    { id: 25, text: "Ich habe klare Ziele im Leben.", dimension: "motivation", reverse: false },
    { id: 26, text: "Rückschläge motivieren mich mehr, als sie mich entmutigen.", dimension: "motivation", reverse: false },
    { id: 27, text: "Ich gebe schnell auf, wenn es schwierig wird.", dimension: "motivation", reverse: true },
    { id: 28, text: "Ich arbeite gerne auf langfristige Ziele hin.", dimension: "motivation", reverse: false },
    { id: 29, text: "Optimismus hilft mir, Herausforderungen zu meistern.", dimension: "motivation", reverse: false },
    { id: 30, text: "Ich weiß oft nicht, was ich wirklich will.", dimension: "motivation", reverse: true }
];

module.exports = emotionaleIntelligenzQuestions;
const selbstwertQuestions = [
    // Selbstakzeptanz (10 Fragen)
    { id: 1, text: "Ich mag mich so, wie ich bin.", dimension: "self_acceptance", reverse: false },
    { id: 2, text: "Ich bin mit mir im Reinen.", dimension: "self_acceptance", reverse: false },
    { id: 3, text: "Es gibt vieles an mir, das ich nicht mag.", dimension: "self_acceptance", reverse: true },
    { id: 4, text: "Ich akzeptiere meine Fehler und Schwächen.", dimension: "self_acceptance", reverse: false },
    { id: 5, text: "Ich würde gerne jemand anderes sein.", dimension: "self_acceptance", reverse: true },
    { id: 6, text: "Ich bin zufrieden mit meinem Aussehen.", dimension: "self_acceptance", reverse: false },
    { id: 7, text: "Ich schäme mich oft für mich selbst.", dimension: "self_acceptance", reverse: true },
    { id: 8, text: "Ich stehe zu mir, auch wenn ich Fehler mache.", dimension: "self_acceptance", reverse: false },
    { id: 9, text: "Ich vergleiche mich ständig mit anderen und fühle mich minderwertig.", dimension: "self_acceptance", reverse: true },
    { id: 10, text: "Ich bin stolz auf das, was ich erreicht habe.", dimension: "self_acceptance", reverse: false },
    
    // Selbstvertrauen (10 Fragen)
    { id: 11, text: "Ich glaube an meine Fähigkeiten.", dimension: "self_confidence", reverse: false },
    { id: 12, text: "Ich traue mir zu, neue Dinge zu lernen.", dimension: "self_confidence", reverse: false },
    { id: 13, text: "Ich zweifle oft an meinen Entscheidungen.", dimension: "self_confidence", reverse: true },
    { id: 14, text: "In schwierigen Situationen vertraue ich auf mich.", dimension: "self_confidence", reverse: false },
    { id: 15, text: "Ich habe Angst zu versagen.", dimension: "self_confidence", reverse: true },
    { id: 16, text: "Ich kann mich gut durchsetzen.", dimension: "self_confidence", reverse: false },
    { id: 17, text: "Andere sind kompetenter als ich.", dimension: "self_confidence", reverse: true },
    { id: 18, text: "Ich traue mich, meine Meinung zu sagen.", dimension: "self_confidence", reverse: false },
    { id: 19, text: "Kritik verunsichert mich sehr.", dimension: "self_confidence", reverse: true },
    { id: 20, text: "Ich gehe Herausforderungen selbstbewusst an.", dimension: "self_confidence", reverse: false },
    
    // Selbstwertgefühl (10 Fragen)
    { id: 21, text: "Ich fühle mich wertvoll und geschätzt.", dimension: "self_worth", reverse: false },
    { id: 22, text: "Ich habe das Gefühl, nicht gut genug zu sein.", dimension: "self_worth", reverse: true },
    { id: 23, text: "Ich verdiene Liebe und Respekt.", dimension: "self_worth", reverse: false },
    { id: 24, text: "Ich denke oft, dass ich andere enttäusche.", dimension: "self_worth", reverse: true },
    { id: 25, text: "Ich bin genauso viel wert wie andere.", dimension: "self_worth", reverse: false },
    { id: 26, text: "Ich habe das Gefühl, nichts richtig zu machen.", dimension: "self_worth", reverse: true },
    { id: 27, text: "Ich bin dankbar für das, was ich bin.", dimension: "self_worth", reverse: false },
    { id: 28, text: "Ich denke, ich bin ein Versager.", dimension: "self_worth", reverse: true },
    { id: 29, text: "Ich kann stolz auf mich sein.", dimension: "self_worth", reverse: false },
    { id: 30, text: "Ich fühle mich oft einsam und unverstanden.", dimension: "self_worth", reverse: true }
];

module.exports = selbstwertQuestions;
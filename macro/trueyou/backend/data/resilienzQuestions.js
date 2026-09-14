const resilienzQuestions = [
    // Anpassungsfähigkeit (6 Fragen)
    { id: 1, text: "Ich kann mich schnell an neue Situationen anpassen.", dimension: "adaptability", reverse: false },
    { id: 2, text: "Veränderungen machen mir Angst.", dimension: "adaptability", reverse: true },
    { id: 3, text: "Ich finde mich auch in schwierigen Lagen zurecht.", dimension: "adaptability", reverse: false },
    { id: 4, text: "Neue Herausforderungen überfordern mich oft.", dimension: "adaptability", reverse: true },
    { id: 5, text: "Ich bin flexibel im Denken und Handeln.", dimension: "adaptability", reverse: false },
    { id: 6, text: "Unvorhergesehene Ereignisse bringen mich aus der Bahn.", dimension: "adaptability", reverse: true },
    
    // Optimismus (6 Fragen)
    { id: 7, text: "Ich blicke positiv in die Zukunft.", dimension: "optimism", reverse: false },
    { id: 8, text: "Ich erwarte oft das Schlimmste.", dimension: "optimism", reverse: true },
    { id: 9, text: "In jeder Krise sehe ich auch eine Chance.", dimension: "optimism", reverse: false },
    { id: 10, text: "Ich gehe oft vom Schlimmsten aus.", dimension: "optimism", reverse: true },
    { id: 11, text: "Ich bin zuversichtlich, dass sich Probleme lösen lassen.", dimension: "optimism", reverse: false },
    { id: 12, text: "Ich sehe eher die Hindernisse als die Möglichkeiten.", dimension: "optimism", reverse: true },
    
    // Selbstwirksamkeit (6 Fragen)
    { id: 13, text: "Ich vertraue auf meine Fähigkeiten.", dimension: "self_efficacy", reverse: false },
    { id: 14, text: "Ich zweifle oft an mir selbst.", dimension: "self_efficacy", reverse: true },
    { id: 15, text: "Ich glaube daran, Herausforderungen meistern zu können.", dimension: "self_efficacy", reverse: false },
    { id: 16, text: "Ich fühle mich oft hilflos.", dimension: "self_efficacy", reverse: true },
    { id: 17, text: "Ich bin überzeugt, meine Ziele zu erreichen.", dimension: "self_efficacy", reverse: false },
    { id: 18, text: "Ich traue mir nicht viel zu.", dimension: "self_efficacy", reverse: true },
    
    // Emotionsregulation (6 Fragen)
    { id: 19, text: "Ich kann meine Gefühle gut kontrollieren.", dimension: "emotion_regulation", reverse: false },
    { id: 20, text: "Emotionen überwältigen mich manchmal.", dimension: "emotion_regulation", reverse: true },
    { id: 21, text: "Ich bleibe auch in stressigen Situationen ruhig.", dimension: "emotion_regulation", reverse: false },
    { id: 22, text: "Meine Stimmung schwankt stark.", dimension: "emotion_regulation", reverse: true },
    { id: 23, text: "Ich kann mich schnell wieder beruhigen.", dimension: "emotion_regulation", reverse: false },
    { id: 24, text: "Ich bin oft gereizt oder angespannt.", dimension: "emotion_regulation", reverse: true },
    
    // Soziale Unterstützung (6 Fragen)
    { id: 25, text: "Ich habe Menschen, auf die ich mich verlassen kann.", dimension: "social_support", reverse: false },
    { id: 26, text: "In schweren Zeiten bin ich oft allein.", dimension: "social_support", reverse: true },
    { id: 27, text: "Ich kann offen über meine Probleme sprechen.", dimension: "social_support", reverse: false },
    { id: 28, text: "Mir fällt es schwer, um Hilfe zu bitten.", dimension: "social_support", reverse: true },
    { id: 29, text: "Mein Umfeld unterstützt mich, wenn ich es brauche.", dimension: "social_support", reverse: false },
    { id: 30, text: "Ich habe das Gefühl, niemand versteht mich wirklich.", dimension: "social_support", reverse: true }
];

module.exports = resilienzQuestions;
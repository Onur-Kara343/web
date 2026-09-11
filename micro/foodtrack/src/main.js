const positionData = {
    // ============================================================
    // 🎯 FLÜGELSPIELER
    // ============================================================
    winger: {
        label: '🎯 Flügelspieler',
        categories: {
            1: { name: '⚡ Offensive', weight: 0.55 },
            2: { name: '🎯 Spielgestaltung', weight: 0.35 },
            3: { name: '🛡️ Defensive', weight: 0.10 }
        },
        stats: [
            // ---------- OFFENSIVE (55%) ----------
            { id: 'xG', label: '📊 xG', cat: 1, weight: 80 },
            { id: 'goals', label: '⚽ Tore', cat: 1, weight: 80 },
            { id: 'shotsOnTarget', label: '🎯 Schüsse aufs Tor', cat: 1, weight: 80 },
            { id: 'touchesInBox', label: '📦 Ballkontakte im Strafraum', cat: 1, weight: 80 },
            { id: 'xGOT', label: '🎯 xGOT', cat: 1, weight: 80 },
            { id: 'bigChancesScored', label: '🌟 Großchancen verwertet', cat: 1, weight: 80 },
            { id: 'successfulDribbles', label: '💨 Erfolgreiche Dribblings', cat: 1, weight: 80 },
            { id: 'successfulOffensiveDuels', label: '⚔️ Erfolgreiche Offensivduelle', cat: 1, weight: 80 },
            { id: 'shotsTotal', label: '🎯 Abschlüsse gesamt', cat: 1, weight: 20 },
            { id: 'shotQuality', label: '📊 Schussqualität (xG/Schuss)', cat: 1, weight: 20 },
            { id: 'goalsMinusXG', label: '📊 Tore − xG', cat: 1, weight: 20 },
            { id: 'shotsOutsideBox', label: '🎯 Schüsse außerhalb Strafraum', cat: 1, weight: 20 },
            { id: 'offsides', label: '🚩 Abseits (weniger = besser)', cat: 1, weight: 20, reverse: true },
            { id: 'ballLossesAttack', label: '❌ Ballverluste im Angriff (weniger = besser)', cat: 1, weight: 20, reverse: true },

            // ---------- SPIELGESTALTUNG (35%) ----------
            { id: 'xA', label: '📊 xA', cat: 2, weight: 80 },
            { id: 'assists', label: '🎯 Assists', cat: 2, weight: 80 },
            { id: 'keyPasses', label: '🔑 Key Passes', cat: 2, weight: 80 },
            { id: 'bigChancesCreated', label: '🌟 Big Chances Created', cat: 2, weight: 80 },
            { id: 'chancesCreated', label: '💡 Chancen kreiert', cat: 2, weight: 80 },
            { id: 'progressivePasses', label: '🎯 Progressive Pässe', cat: 2, weight: 80 },
            { id: 'throughBalls', label: '🎯 Through Balls', cat: 2, weight: 80 },
            { id: 'smartPasses', label: '🧠 Smart Passes', cat: 2, weight: 80 },
            { id: 'successfulCrosses', label: '✅ Flanken erfolgreich', cat: 2, weight: 20 },
            { id: 'hockeyAssists', label: '🏒 Hockey Assists', cat: 2, weight: 20 },
            { id: 'passRateFinalThird', label: '🎯 Passquote Angriffsdrittel (%)', cat: 2, weight: 20 },
            { id: 'chancesFromSetPieces', label: '📐 Chancen nach Standards', cat: 2, weight: 20 },
            { id: 'deepCompletions', label: '🎯 Deep Completions', cat: 2, weight: 20 },

            // ---------- DEFENSIVE (10%) ----------
            { id: 'ballWins', label: '🔄 Ballgewinne', cat: 3, weight: 80 },
            { id: 'tacklesWon', label: '🛡️ Tacklings gewonnen', cat: 3, weight: 80 },
            { id: 'interceptions', label: '✋ Interceptions', cat: 3, weight: 80 },
            { id: 'defensiveDuelsWon', label: '⚔️ Defensivduelle gewonnen', cat: 3, weight: 80 },
            { id: 'counterPressingSuccess', label: '⚡ Erfolgreiches Gegenpressing', cat: 3, weight: 80 },
            { id: 'aerialDuelsWon', label: '🦅 Luftduelle gewonnen', cat: 3, weight: 80 },
            { id: 'blocks', label: '🚫 Blocks', cat: 3, weight: 20 },
            { id: 'clearances', label: '🧹 Klärungen', cat: 3, weight: 20 },
            { id: 'blockedPasses', label: '🚫 Geblockte Pässe', cat: 3, weight: 20 },
            { id: 'foulsPerDefAction', label: '💥 Fouls pro Defensivaktion (weniger = besser)', cat: 3, weight: 20, reverse: true },
            { id: 'errorsLeadingToShot', label: '❌ Fehler zu Schuss/Tor (weniger = besser)', cat: 3, weight: 20, reverse: true }
        ],
        references: {
            'xG': 0.5, 'goals': 0.5, 'shotsOnTarget': 2, 'touchesInBox': 4,
            'xGOT': 0.4, 'bigChancesScored': 1, 'successfulDribbles': 4,
            'successfulOffensiveDuels': 4, 'shotsTotal': 4, 'shotQuality': 0.15,
            'goalsMinusXG': 0, 'shotsOutsideBox': 1, 'offsides': 0,
            'ballLossesAttack': 3, 'xA': 0.3, 'assists': 0.3, 'keyPasses': 2,
            'bigChancesCreated': 1, 'chancesCreated': 3, 'progressivePasses': 4,
            'throughBalls': 1, 'smartPasses': 2, 'successfulCrosses': 2,
            'hockeyAssists': 1, 'passRateFinalThird': 65, 'chancesFromSetPieces': 1,
            'deepCompletions': 2, 'ballWins': 4, 'tacklesWon': 3, 'interceptions': 2,
            'defensiveDuelsWon': 4, 'counterPressingSuccess': 3, 'aerialDuelsWon': 2,
            'blocks': 1, 'clearances': 3, 'blockedPasses': 2, 'foulsPerDefAction': 0.5,
            'errorsLeadingToShot': 0
        }
    },

    // ============================================================
    // ⚽ MITTELSTÜRMER (9er)
    // ============================================================
    striker: {
        label: '⚽ Mittelstürmer (9er)',
        categories: {
            1: { name: '⚡ Offensive', weight: 0.70 },
            2: { name: '🎯 Spielgestaltung', weight: 0.20 },
            3: { name: '🛡️ Defensive', weight: 0.10 }
        },
        stats: [
            // ---------- OFFENSIVE (70%) ----------
            { id: 'xG', label: '📊 xG', cat: 1, weight: 80 },
            { id: 'goals', label: '⚽ Tore', cat: 1, weight: 80 },
            { id: 'shotsOnTarget', label: '🎯 Schüsse aufs Tor', cat: 1, weight: 80 },
            { id: 'touchesInBox', label: '📦 Ballkontakte im Strafraum', cat: 1, weight: 80 },
            { id: 'xGOT', label: '🎯 xGOT', cat: 1, weight: 80 },
            { id: 'bigChancesScored', label: '🌟 Großchancen verwertet', cat: 1, weight: 80 },
            { id: 'successfulDribbles', label: '💨 Erfolgreiche Dribblings', cat: 1, weight: 80 },
            { id: 'successfulOffensiveDuels', label: '⚔️ Erfolgreiche Offensivduelle', cat: 1, weight: 80 },
            { id: 'shotsTotal', label: '🎯 Abschlüsse gesamt', cat: 1, weight: 20 },
            { id: 'shotQuality', label: '📊 Schussqualität (xG/Schuss)', cat: 1, weight: 20 },
            { id: 'goalsMinusXG', label: '📊 Tore − xG', cat: 1, weight: 20 },
            { id: 'shotsOutsideBox', label: '🎯 Schüsse außerhalb Strafraum', cat: 1, weight: 20 },
            { id: 'offsides', label: '🚩 Abseits (weniger = besser)', cat: 1, weight: 20, reverse: true },
            { id: 'ballLossesAttack', label: '❌ Ballverluste im Angriff (weniger = besser)', cat: 1, weight: 20, reverse: true },

            // ---------- SPIELGESTALTUNG (20%) ----------
            { id: 'xA', label: '📊 xA', cat: 2, weight: 80 },
            { id: 'assists', label: '🎯 Assists', cat: 2, weight: 80 },
            { id: 'keyPasses', label: '🔑 Key Passes', cat: 2, weight: 80 },
            { id: 'bigChancesCreated', label: '🌟 Big Chances Created', cat: 2, weight: 80 },
            { id: 'chancesCreated', label: '💡 Chancen kreiert', cat: 2, weight: 80 },
            { id: 'progressivePasses', label: '🎯 Progressive Pässe', cat: 2, weight: 20 },
            { id: 'throughBalls', label: '🎯 Through Balls', cat: 2, weight: 20 },
            { id: 'smartPasses', label: '🧠 Smart Passes', cat: 2, weight: 20 },

            // ---------- DEFENSIVE (10%) ----------
            { id: 'ballWins', label: '🔄 Ballgewinne', cat: 3, weight: 80 },
            { id: 'tacklesWon', label: '🛡️ Tacklings gewonnen', cat: 3, weight: 80 },
            { id: 'interceptions', label: '✋ Interceptions', cat: 3, weight: 80 },
            { id: 'defensiveDuelsWon', label: '⚔️ Defensivduelle gewonnen', cat: 3, weight: 20 },
            { id: 'aerialDuelsWon', label: '🦅 Luftduelle gewonnen', cat: 3, weight: 20 },
            { id: 'errorsLeadingToShot', label: '❌ Fehler zu Schuss/Tor (weniger = besser)', cat: 3, weight: 20, reverse: true }
        ],
        references: {
            'xG': 0.5, 'goals': 0.5, 'shotsOnTarget': 2, 'touchesInBox': 4,
            'xGOT': 0.4, 'bigChancesScored': 1, 'successfulDribbles': 3,
            'successfulOffensiveDuels': 3, 'shotsTotal': 4, 'shotQuality': 0.15,
            'goalsMinusXG': 0, 'shotsOutsideBox': 1, 'offsides': 1,
            'ballLossesAttack': 3, 'xA': 0.2, 'assists': 0.2, 'keyPasses': 1,
            'bigChancesCreated': 0, 'chancesCreated': 1, 'progressivePasses': 2,
            'throughBalls': 0, 'smartPasses': 1, 'ballWins': 2, 'tacklesWon': 1,
            'interceptions': 0, 'defensiveDuelsWon': 2, 'aerialDuelsWon': 3,
            'errorsLeadingToShot': 0
        }
    },

    // ============================================================
    // 🎩 OFFENSIVER MITTELFELD (10er)
    // ============================================================
    attackingMid: {
        label: '🎩 Offensiver Mittelfeld (10er)',
        categories: {
            1: { name: '🎯 Spielgestaltung', weight: 0.50 },
            2: { name: '⚡ Offensive', weight: 0.35 },
            3: { name: '🛡️ Defensive', weight: 0.15 }
        },
        stats: [
            // ---------- SPIELGESTALTUNG (50%) ----------
            { id: 'xA', label: '📊 xA', cat: 1, weight: 80 },
            { id: 'assists', label: '🎯 Assists', cat: 1, weight: 80 },
            { id: 'keyPasses', label: '🔑 Key Passes', cat: 1, weight: 80 },
            { id: 'bigChancesCreated', label: '🌟 Big Chances Created', cat: 1, weight: 80 },
            { id: 'chancesCreated', label: '💡 Chancen kreiert', cat: 1, weight: 80 },
            { id: 'progressivePasses', label: '🎯 Progressive Pässe', cat: 1, weight: 80 },
            { id: 'throughBalls', label: '🎯 Through Balls', cat: 1, weight: 80 },
            { id: 'smartPasses', label: '🧠 Smart Passes', cat: 1, weight: 80 },
            { id: 'hockeyAssists', label: '🏒 Hockey Assists', cat: 1, weight: 20 },
            { id: 'passRateFinalThird', label: '🎯 Passquote Angriffsdrittel (%)', cat: 1, weight: 20 },
            { id: 'chancesFromSetPieces', label: '📐 Chancen nach Standards', cat: 1, weight: 20 },
            { id: 'deepCompletions', label: '🎯 Deep Completions', cat: 1, weight: 20 },

            // ---------- OFFENSIVE (35%) ----------
            { id: 'xG', label: '📊 xG', cat: 2, weight: 80 },
            { id: 'goals', label: '⚽ Tore', cat: 2, weight: 80 },
            { id: 'shotsOnTarget', label: '🎯 Schüsse aufs Tor', cat: 2, weight: 80 },
            { id: 'touchesInBox', label: '📦 Ballkontakte im Strafraum', cat: 2, weight: 80 },
            { id: 'xGOT', label: '🎯 xGOT', cat: 2, weight: 80 },
            { id: 'successfulDribbles', label: '💨 Erfolgreiche Dribblings', cat: 2, weight: 80 },
            { id: 'successfulOffensiveDuels', label: '⚔️ Erfolgreiche Offensivduelle', cat: 2, weight: 80 },
            { id: 'shotsTotal', label: '🎯 Abschlüsse gesamt', cat: 2, weight: 20 },
            { id: 'shotQuality', label: '📊 Schussqualität (xG/Schuss)', cat: 2, weight: 20 },

            // ---------- DEFENSIVE (15%) ----------
            { id: 'ballWins', label: '🔄 Ballgewinne', cat: 3, weight: 80 },
            { id: 'tacklesWon', label: '🛡️ Tacklings gewonnen', cat: 3, weight: 80 },
            { id: 'interceptions', label: '✋ Interceptions', cat: 3, weight: 80 },
            { id: 'defensiveDuelsWon', label: '⚔️ Defensivduelle gewonnen', cat: 3, weight: 20 },
            { id: 'counterPressingSuccess', label: '⚡ Erfolgreiches Gegenpressing', cat: 3, weight: 20 },
            { id: 'errorsLeadingToShot', label: '❌ Fehler zu Schuss/Tor (weniger = besser)', cat: 3, weight: 20, reverse: true }
        ],
        references: {
            'xA': 0.3, 'assists': 0.3, 'keyPasses': 2, 'bigChancesCreated': 1,
            'chancesCreated': 3, 'progressivePasses': 5, 'throughBalls': 1,
            'smartPasses': 2, 'hockeyAssists': 1, 'passRateFinalThird': 70,
            'chancesFromSetPieces': 1, 'deepCompletions': 2, 'xG': 0.3,
            'goals': 0.3, 'shotsOnTarget': 1, 'touchesInBox': 3, 'xGOT': 0.3,
            'successfulDribbles': 3, 'successfulOffensiveDuels': 3, 'shotsTotal': 2,
            'shotQuality': 0.15, 'ballWins': 3, 'tacklesWon': 2, 'interceptions': 1,
            'defensiveDuelsWon': 2, 'counterPressingSuccess': 2, 'errorsLeadingToShot': 0
        }
    },

    // ============================================================
    // 🔄 BOX-TO-BOX (8er)
    // ============================================================
    boxToBox: {
        label: '🔄 Box-to-Box (8er)',
        categories: {
            1: { name: '🎯 Spielgestaltung', weight: 0.40 },
            2: { name: '⚡ Offensive', weight: 0.30 },
            3: { name: '🛡️ Defensive', weight: 0.30 }
        },
        stats: [
            // ---------- SPIELGESTALTUNG (40%) ----------
            { id: 'xA', label: '📊 xA', cat: 1, weight: 80 },
            { id: 'assists', label: '🎯 Assists', cat: 1, weight: 80 },
            { id: 'keyPasses', label: '🔑 Key Passes', cat: 1, weight: 80 },
            { id: 'chancesCreated', label: '💡 Chancen kreiert', cat: 1, weight: 80 },
            { id: 'progressivePasses', label: '🎯 Progressive Pässe', cat: 1, weight: 80 },
            { id: 'smartPasses', label: '🧠 Smart Passes', cat: 1, weight: 80 },
            { id: 'passRateFinalThird', label: '🎯 Passquote Angriffsdrittel (%)', cat: 1, weight: 20 },

            // ---------- OFFENSIVE (30%) ----------
            { id: 'xG', label: '📊 xG', cat: 2, weight: 80 },
            { id: 'goals', label: '⚽ Tore', cat: 2, weight: 80 },
            { id: 'shotsOnTarget', label: '🎯 Schüsse aufs Tor', cat: 2, weight: 80 },
            { id: 'touchesInBox', label: '📦 Ballkontakte im Strafraum', cat: 2, weight: 80 },
            { id: 'successfulDribbles', label: '💨 Erfolgreiche Dribblings', cat: 2, weight: 80 },
            { id: 'successfulOffensiveDuels', label: '⚔️ Erfolgreiche Offensivduelle', cat: 2, weight: 80 },
            { id: 'shotsTotal', label: '🎯 Abschlüsse gesamt', cat: 2, weight: 20 },

            // ---------- DEFENSIVE (30%) ----------
            { id: 'ballWins', label: '🔄 Ballgewinne', cat: 3, weight: 80 },
            { id: 'tacklesWon', label: '🛡️ Tacklings gewonnen', cat: 3, weight: 80 },
            { id: 'interceptions', label: '✋ Interceptions', cat: 3, weight: 80 },
            { id: 'defensiveDuelsWon', label: '⚔️ Defensivduelle gewonnen', cat: 3, weight: 80 },
            { id: 'counterPressingSuccess', label: '⚡ Erfolgreiches Gegenpressing', cat: 3, weight: 80 },
            { id: 'aerialDuelsWon', label: '🦅 Luftduelle gewonnen', cat: 3, weight: 80 },
            { id: 'errorsLeadingToShot', label: '❌ Fehler zu Schuss/Tor (weniger = besser)', cat: 3, weight: 20, reverse: true }
        ],
        references: {
            'xA': 0.2, 'assists': 0.2, 'keyPasses': 1, 'chancesCreated': 1,
            'progressivePasses': 4, 'smartPasses': 1, 'passRateFinalThird': 65,
            'xG': 0.2, 'goals': 0.2, 'shotsOnTarget': 1, 'touchesInBox': 2,
            'successfulDribbles': 2, 'successfulOffensiveDuels': 2, 'shotsTotal': 2,
            'ballWins': 4, 'tacklesWon': 3, 'interceptions': 2, 'defensiveDuelsWon': 4,
            'counterPressingSuccess': 3, 'aerialDuelsWon': 2, 'errorsLeadingToShot': 0
        }
    },

    // ============================================================
    // ⚓ DEFENSIVER MITTELFELD (6er)
    // ============================================================
    defensiveMid: {
        label: '⚓ Defensiver Mittelfeld (6er)',
        categories: {
            1: { name: '🛡️ Defensive', weight: 0.50 },
            2: { name: '🎯 Spielgestaltung', weight: 0.30 },
            3: { name: '⚡ Offensive', weight: 0.20 }
        },
        stats: [
            // ---------- DEFENSIVE (50%) ----------
            { id: 'ballWins', label: '🔄 Ballgewinne', cat: 1, weight: 80 },
            { id: 'tacklesWon', label: '🛡️ Tacklings gewonnen', cat: 1, weight: 80 },
            { id: 'interceptions', label: '✋ Interceptions', cat: 1, weight: 80 },
            { id: 'defensiveDuelsWon', label: '⚔️ Defensivduelle gewonnen', cat: 1, weight: 80 },
            { id: 'counterPressingSuccess', label: '⚡ Erfolgreiches Gegenpressing', cat: 1, weight: 80 },
            { id: 'aerialDuelsWon', label: '🦅 Luftduelle gewonnen', cat: 1, weight: 80 },
            { id: 'blocks', label: '🚫 Blocks', cat: 1, weight: 20 },
            { id: 'clearances', label: '🧹 Klärungen', cat: 1, weight: 20 },
            { id: 'foulsPerDefAction', label: '💥 Fouls pro Defensivaktion (weniger = besser)', cat: 1, weight: 20, reverse: true },
            { id: 'errorsLeadingToShot', label: '❌ Fehler zu Schuss/Tor (weniger = besser)', cat: 1, weight: 20, reverse: true },

            // ---------- SPIELGESTALTUNG (30%) ----------
            { id: 'xA', label: '📊 xA', cat: 2, weight: 80 },
            { id: 'assists', label: '🎯 Assists', cat: 2, weight: 80 },
            { id: 'keyPasses', label: '🔑 Key Passes', cat: 2, weight: 80 },
            { id: 'progressivePasses', label: '🎯 Progressive Pässe', cat: 2, weight: 80 },
            { id: 'smartPasses', label: '🧠 Smart Passes', cat: 2, weight: 80 },
            { id: 'passRateFinalThird', label: '🎯 Passquote Angriffsdrittel (%)', cat: 2, weight: 20 },
            { id: 'deepCompletions', label: '🎯 Deep Completions', cat: 2, weight: 20 },

            // ---------- OFFENSIVE (20%) ----------
            { id: 'xG', label: '📊 xG', cat: 3, weight: 80 },
            { id: 'goals', label: '⚽ Tore', cat: 3, weight: 80 },
            { id: 'shotsOnTarget', label: '🎯 Schüsse aufs Tor', cat: 3, weight: 20 },
            { id: 'successfulDribbles', label: '💨 Erfolgreiche Dribblings', cat: 3, weight: 20 }
        ],
        references: {
            'ballWins': 5, 'tacklesWon': 4, 'interceptions': 3, 'defensiveDuelsWon': 5,
            'counterPressingSuccess': 4, 'aerialDuelsWon': 3, 'blocks': 1,
            'clearances': 3, 'foulsPerDefAction': 0.5, 'errorsLeadingToShot': 0,
            'xA': 0.1, 'assists': 0.1, 'keyPasses': 1, 'progressivePasses': 4,
            'smartPasses': 1, 'passRateFinalThird': 60, 'deepCompletions': 2,
            'xG': 0.05, 'goals': 0.05, 'shotsOnTarget': 0, 'successfulDribbles': 1
        }
    },

    // ============================================================
    // 🏃 AUSSENVERTEIDIGER
    // ============================================================
    fullBack: {
        label: '🏃 Außenverteidiger',
        categories: {
            1: { name: '🛡️ Defensive', weight: 0.40 },
            2: { name: '⚡ Offensive', weight: 0.35 },
            3: { name: '🎯 Spielgestaltung', weight: 0.25 }
        },
        stats: [
            // ---------- DEFENSIVE (40%) ----------
            { id: 'ballWins', label: '🔄 Ballgewinne', cat: 1, weight: 80 },
            { id: 'tacklesWon', label: '🛡️ Tacklings gewonnen', cat: 1, weight: 80 },
            { id: 'interceptions', label: '✋ Interceptions', cat: 1, weight: 80 },
            { id: 'defensiveDuelsWon', label: '⚔️ Defensivduelle gewonnen', cat: 1, weight: 80 },
            { id: 'aerialDuelsWon', label: '🦅 Luftduelle gewonnen', cat: 1, weight: 80 },
            { id: 'clearances', label: '🧹 Klärungen', cat: 1, weight: 20 },
            { id: 'errorsLeadingToShot', label: '❌ Fehler zu Schuss/Tor (weniger = besser)', cat: 1, weight: 20, reverse: true },

            // ---------- OFFENSIVE (35%) ----------
            { id: 'xG', label: '📊 xG', cat: 2, weight: 80 },
            { id: 'goals', label: '⚽ Tore', cat: 2, weight: 80 },
            { id: 'shotsOnTarget', label: '🎯 Schüsse aufs Tor', cat: 2, weight: 80 },
            { id: 'touchesInBox', label: '📦 Ballkontakte im Strafraum', cat: 2, weight: 80 },
            { id: 'successfulDribbles', label: '💨 Erfolgreiche Dribblings', cat: 2, weight: 80 },
            { id: 'successfulOffensiveDuels', label: '⚔️ Erfolgreiche Offensivduelle', cat: 2, weight: 80 },
            { id: 'successfulCrosses', label: '✅ Flanken erfolgreich', cat: 2, weight: 20 },

            // ---------- SPIELGESTALTUNG (25%) ----------
            { id: 'xA', label: '📊 xA', cat: 3, weight: 80 },
            { id: 'assists', label: '🎯 Assists', cat: 3, weight: 80 },
            { id: 'keyPasses', label: '🔑 Key Passes', cat: 3, weight: 80 },
            { id: 'chancesCreated', label: '💡 Chancen kreiert', cat: 3, weight: 80 },
            { id: 'progressivePasses', label: '🎯 Progressive Pässe', cat: 3, weight: 80 },
            { id: 'deepCompletions', label: '🎯 Deep Completions', cat: 3, weight: 20 }
        ],
        references: {
            'ballWins': 4, 'tacklesWon': 3, 'interceptions': 2, 'defensiveDuelsWon': 4,
            'aerialDuelsWon': 2, 'clearances': 3, 'errorsLeadingToShot': 0,
            'xG': 0.05, 'goals': 0.05, 'shotsOnTarget': 0, 'touchesInBox': 2,
            'successfulDribbles': 2, 'successfulOffensiveDuels': 2, 'successfulCrosses': 1,
            'xA': 0.2, 'assists': 0.2, 'keyPasses': 1, 'chancesCreated': 1,
            'progressivePasses': 3, 'deepCompletions': 2
        }
    },

    // ============================================================
    // 🛡 INNENVERTEIDIGER
    // ============================================================
    centerBack: {
        label: '🛡 Innenverteidiger',
        categories: {
            1: { name: '🛡️ Defensive', weight: 0.65 },
            2: { name: '🎯 Spielgestaltung', weight: 0.25 },
            3: { name: '⚡ Offensive', weight: 0.10 }
        },
        stats: [
            // ---------- DEFENSIVE (65%) ----------
            { id: 'ballWins', label: '🔄 Ballgewinne', cat: 1, weight: 80 },
            { id: 'tacklesWon', label: '🛡️ Tacklings gewonnen', cat: 1, weight: 80 },
            { id: 'interceptions', label: '✋ Interceptions', cat: 1, weight: 80 },
            { id: 'defensiveDuelsWon', label: '⚔️ Defensivduelle gewonnen', cat: 1, weight: 80 },
            { id: 'aerialDuelsWon', label: '🦅 Luftduelle gewonnen', cat: 1, weight: 80 },
            { id: 'blocks', label: '🚫 Blocks', cat: 1, weight: 80 },
            { id: 'clearances', label: '🧹 Klärungen', cat: 1, weight: 80 },
            { id: 'blockedPasses', label: '🚫 Geblockte Pässe', cat: 1, weight: 20 },
            { id: 'foulsPerDefAction', label: '💥 Fouls pro Defensivaktion (weniger = besser)', cat: 1, weight: 20, reverse: true },
            { id: 'errorsLeadingToShot', label: '❌ Fehler zu Schuss/Tor (weniger = besser)', cat: 1, weight: 20, reverse: true },

            // ---------- SPIELGESTALTUNG (25%) ----------
            { id: 'xA', label: '📊 xA', cat: 2, weight: 80 },
            { id: 'assists', label: '🎯 Assists', cat: 2, weight: 80 },
            { id: 'progressivePasses', label: '🎯 Progressive Pässe', cat: 2, weight: 80 },
            { id: 'smartPasses', label: '🧠 Smart Passes', cat: 2, weight: 80 },
            { id: 'deepCompletions', label: '🎯 Deep Completions', cat: 2, weight: 20 },

            // ---------- OFFENSIVE (10%) ----------
            { id: 'xG', label: '📊 xG', cat: 3, weight: 80 },
            { id: 'goals', label: '⚽ Tore', cat: 3, weight: 80 },
            { id: 'shotsOnTarget', label: '🎯 Schüsse aufs Tor', cat: 3, weight: 20 }
        ],
        references: {
            'ballWins': 5, 'tacklesWon': 3, 'interceptions': 3, 'defensiveDuelsWon': 5,
            'aerialDuelsWon': 4, 'blocks': 2, 'clearances': 5, 'blockedPasses': 2,
            'foulsPerDefAction': 0.5, 'errorsLeadingToShot': 0, 'xA': 0.02,
            'assists': 0.02, 'progressivePasses': 3, 'smartPasses': 1,
            'deepCompletions': 2, 'xG': 0.02, 'goals': 0.02, 'shotsOnTarget': 0
        }
    },

    // ============================================================
    // 🧤 TORWART
    // ============================================================
    goalkeeper: {
        label: '🧤 Torwart',
        categories: {
            1: { name: '🧤 Torwartspiel', weight: 0.75 },
            2: { name: '🎯 Spielgestaltung', weight: 0.15 },
            3: { name: '🛡️ Defensive', weight: 0.10 }
        },
        stats: [
            // ---------- TORWARTSPIEL (75%) ----------
            { id: 'saves', label: '🧤 Gehaltene Schüsse', cat: 1, weight: 80 },
            { id: 'saveRate', label: '📊 Paradenquote (%)', cat: 1, weight: 80 },
            { id: 'cleanSheet', label: '🧹 Clean Sheet (0 oder 1)', cat: 1, weight: 80 },
            { id: 'goalsAgainst', label: '🥅 Gegentore (weniger = besser)', cat: 1, weight: 80, reverse: true },
            { id: 'oneOnOneWon', label: '⚡ 1-gegen-1 gewonnen', cat: 1, weight: 80 },
            { id: 'penaltyAreaControl', label: '🏠 Strafraumbeherrschung', cat: 1, weight: 80 },
            { id: 'errorsLeadingToShots', label: '❌ Fehler zu Schüssen (weniger = besser)', cat: 1, weight: 80, reverse: true },
            { id: 'highClaims', label: '🙌 Hohe Bälle gefangen', cat: 1, weight: 20 },
            { id: 'sweeperActions', label: '🧹 Sweeper-Aktionen', cat: 1, weight: 20 },

            // ---------- SPIELGESTALTUNG (15%) ----------
            { id: 'passRate', label: '🎯 Passquote (%)', cat: 2, weight: 80 },
            { id: 'longPasses', label: '🎯 Lange Pässe erfolgreich', cat: 2, weight: 80 },
            { id: 'progressivePasses', label: '🎯 Progressive Pässe', cat: 2, weight: 20 },
            { id: 'ballLosses', label: '❌ Ballverluste (weniger = besser)', cat: 2, weight: 20, reverse: true },

            // ---------- DEFENSIVE (10%) ----------
            { id: 'yellowCards', label: '🟨 Gelbe Karten', cat: 3, weight: 80, max: 3 },
            { id: 'redCards', label: '🟥 Rote Karten', cat: 3, weight: 80, max: 1 },
            { id: 'foulsCommitted', label: '💥 Fouls begangen (weniger = besser)', cat: 3, weight: 20, reverse: true }
        ],
        references: {
            'saves': 3, 'saveRate': 65, 'cleanSheet': 0.3, 'goalsAgainst': 1.5,
            'oneOnOneWon': 1, 'penaltyAreaControl': 5, 'errorsLeadingToShots': 1,
            'highClaims': 2, 'sweeperActions': 2, 'passRate': 55, 'longPasses': 4,
            'progressivePasses': 2, 'ballLosses': 3, 'yellowCards': 0,
            'redCards': 0, 'foulsCommitted': 0
        }
    },

    // ============================================================
    // 🎭 FALSCHE 9
    // ============================================================
    falseNine: {
        label: '🎭 Falsche 9',
        categories: {
            1: { name: '🎯 Spielgestaltung', weight: 0.45 },
            2: { name: '⚡ Offensive', weight: 0.35 },
            3: { name: '🛡️ Defensive', weight: 0.20 }
        },
        stats: [
            // ---------- SPIELGESTALTUNG (45%) ----------
            { id: 'xA', label: '📊 xA', cat: 1, weight: 80 },
            { id: 'assists', label: '🎯 Assists', cat: 1, weight: 80 },
            { id: 'keyPasses', label: '🔑 Key Passes', cat: 1, weight: 80 },
            { id: 'bigChancesCreated', label: '🌟 Big Chances Created', cat: 1, weight: 80 },
            { id: 'chancesCreated', label: '💡 Chancen kreiert', cat: 1, weight: 80 },
            { id: 'progressivePasses', label: '🎯 Progressive Pässe', cat: 1, weight: 80 },
            { id: 'throughBalls', label: '🎯 Through Balls', cat: 1, weight: 80 },
            { id: 'smartPasses', label: '🧠 Smart Passes', cat: 1, weight: 80 },
            { id: 'passRateFinalThird', label: '🎯 Passquote Angriffsdrittel (%)', cat: 1, weight: 20 },

            // ---------- OFFENSIVE (35%) ----------
            { id: 'xG', label: '📊 xG', cat: 2, weight: 80 },
            { id: 'goals', label: '⚽ Tore', cat: 2, weight: 80 },
            { id: 'shotsOnTarget', label: '🎯 Schüsse aufs Tor', cat: 2, weight: 80 },
            { id: 'touchesInBox', label: '📦 Ballkontakte im Strafraum', cat: 2, weight: 80 },
            { id: 'xGOT', label: '🎯 xGOT', cat: 2, weight: 80 },
            { id: 'successfulDribbles', label: '💨 Erfolgreiche Dribblings', cat: 2, weight: 80 },
            { id: 'successfulOffensiveDuels', label: '⚔️ Erfolgreiche Offensivduelle', cat: 2, weight: 80 },
            { id: 'shotsTotal', label: '🎯 Abschlüsse gesamt', cat: 2, weight: 20 },

            // ---------- DEFENSIVE (20%) ----------
            { id: 'ballWins', label: '🔄 Ballgewinne', cat: 3, weight: 80 },
            { id: 'tacklesWon', label: '🛡️ Tacklings gewonnen', cat: 3, weight: 80 },
            { id: 'interceptions', label: '✋ Interceptions', cat: 3, weight: 80 },
            { id: 'defensiveDuelsWon', label: '⚔️ Defensivduelle gewonnen', cat: 3, weight: 80 },
            { id: 'counterPressingSuccess', label: '⚡ Erfolgreiches Gegenpressing', cat: 3, weight: 20 },
            { id: 'errorsLeadingToShot', label: '❌ Fehler zu Schuss/Tor (weniger = besser)', cat: 3, weight: 20, reverse: true }
        ],
        references: {
            'xA': 0.3, 'assists': 0.3, 'keyPasses': 2, 'bigChancesCreated': 1,
            'chancesCreated': 3, 'progressivePasses': 4, 'throughBalls': 1,
            'smartPasses': 2, 'passRateFinalThird': 68, 'xG': 0.3, 'goals': 0.3,
            'shotsOnTarget': 1, 'touchesInBox': 3, 'xGOT': 0.3, 'successfulDribbles': 3,
            'successfulOffensiveDuels': 3, 'shotsTotal': 2, 'ballWins': 3,
            'tacklesWon': 2, 'interceptions': 1, 'defensiveDuelsWon': 3,
            'counterPressingSuccess': 2, 'errorsLeadingToShot': 0
        }
    }
};

// ============================================================
// RENDER-FUNKTIONEN
// ============================================================

let currentPosition = 'winger';

function renderPositionButtons() {
    const container = document.getElementById('positionSelector');
    container.innerHTML = Object.entries(positionData).map(([key, pos]) => `
        <button class="pos-btn ${key === currentPosition ? 'active' : ''}" data-pos="${key}">
            ${pos.label}
        </button>
    `).join('');

    document.querySelectorAll('.pos-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPosition = this.dataset.pos;
            renderStats(currentPosition);
            document.getElementById('resultOverlay').classList.remove('active');
            updateTimeInfo();
        });
    });
}

function renderStats(position) {
    const grid = document.getElementById('statsGrid');
    const config = positionData[position];
    const stats = config.stats;

    document.getElementById('statCount').textContent = stats.length;

    grid.innerHTML = stats.map(stat => {
        const catLabel = config.categories[stat.cat].name;
        const weightClass = stat.weight === 80 ? 'tag-high' : 'tag-low';
        const tagLabel = stat.weight === 80 ? '80' : '20';
        const maxAttr = stat.max ? `max="${stat.max}"` : '';
        const reverseHint = stat.reverse ? ' ⬅️ weniger = besser' : '';

        return `
            <div class="stat-item">
                <div class="weight-tag ${weightClass}">${catLabel} · ${tagLabel}</div>
                <label>${stat.label}</label>
                <input type="number" id="stat_${stat.id}" value="0" min="0" ${maxAttr} step="1">
                <div class="hint">${reverseHint || ' '}</div>
            </div>
        `;
    }).join('');
}

function getStatValue(id) {
    const el = document.getElementById(`stat_${id}`);
    if (!el) return 0;
    return parseFloat(el.value) || 0;
}

function resetStats() {
    document.querySelectorAll('.stats-grid input[type="number"]').forEach(input => {
        input.value = 0;
    });
    document.getElementById('resultOverlay').classList.remove('active');
}

// ============================================================
// SPIELZEIT-FUNKTIONEN
// ============================================================

function updateTimeInfo() {
    const matchDuration = parseInt(document.getElementById('matchDuration').value) || 90;
    const ownMinutes = parseInt(document.getElementById('ownMinutes').value) || 0;
    const infoEl = document.getElementById('timeInfo');
    const badge = infoEl.querySelector('.time-badge');

    if (ownMinutes === 0) {
        badge.textContent = '⛔ Nicht gespielt';
        badge.className = 'time-badge danger';
        return;
    }

    const percentage = Math.round((ownMinutes / matchDuration) * 100);
    
    if (ownMinutes >= matchDuration) {
        badge.textContent = '🟢 Volle Spielzeit (90 min)';
        badge.className = 'time-badge';
    } else if (percentage >= 70) {
        badge.textContent = `🟡 ${percentage}% der Spielzeit (${ownMinutes} min)`;
        badge.className = 'time-badge warning';
    } else if (percentage >= 30) {
        badge.textContent = `🟠 ${percentage}% der Spielzeit (${ownMinutes} min)`;
        badge.className = 'time-badge warning';
    } else {
        badge.textContent = `🔴 Nur ${percentage}% der Spielzeit (${ownMinutes} min)`;
        badge.className = 'time-badge danger';
    }
}

// ============================================================
// RESULT OVERLAY - OPEN / CLOSE
// ============================================================

function openResult() {
    const overlay = document.getElementById('resultOverlay');
    const content = document.getElementById('resultContent');
    
    content.innerHTML = generateResultHTML();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeResult() {
    const overlay = document.getElementById('resultOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeResult();
});

document.getElementById('resultOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeResult();
});

// ============================================================
// BEWERTUNGS-LOGIC
// ============================================================

function generateResultHTML() {
    const config = positionData[currentPosition];
    const stats = config.stats;
    const categories = config.categories;
    const references = config.references;

    const matchDuration = parseInt(document.getElementById('matchDuration').value) || 90;
    const ownMinutes = parseInt(document.getElementById('ownMinutes').value) || 0;

    let timeFactor = 1.0;
    let timeFactorDisplay = '⛔ Nicht gespielt';

    if (ownMinutes > 0 && matchDuration > 0) {
        const rawFactor = matchDuration / ownMinutes;
        timeFactor = Math.min(rawFactor, 2.5);
        const percentage = ownMinutes / matchDuration;
        if (percentage < 0.5) {
            timeFactor = timeFactor * 1.1;
        }
        timeFactor = Math.round(timeFactor * 100) / 100;
        timeFactorDisplay = `⚡ Zeit-Faktor: ${timeFactor.toFixed(2)}x (${ownMinutes}/${matchDuration} min)`;
    } else if (ownMinutes === 0) {
        timeFactor = 0;
    }

    // STATS BEWERTEN
    let statsScores = [];
    let totalGoals = 0;
    let totalAssists = 0;
    let hasGoal = false;
    let hasAssist = false;

    stats.forEach(stat => {
        const value = getStatValue(stat.id);
        const ref = references[stat.id] || 1;
        const cat = stat.cat;
        const weight = stat.weight || 20;

        if (stat.id === 'goals') {
            totalGoals = value;
            if (value > 0) hasGoal = true;
        }
        if (stat.id === 'assists') {
            totalAssists = value;
            if (value > 0) hasAssist = true;
        }

        let statScore = 0;

        if (stat.id === 'yellowCards') {
            const maxVal = 3;
            let normalized = Math.min(value / maxVal, 1);
            if (stat.reverse) normalized = 1 - normalized;
            statScore = normalized * 10;
        } else if (stat.id === 'redCards') {
            const maxVal = 1;
            let normalized = Math.min(value / maxVal, 1);
            if (stat.reverse) normalized = 1 - normalized;
            statScore = normalized * 10;
        } else if (value === 0) {
            statScore = 3;
        } else {
            const ratio = value / ref;
            
            if (ratio <= 0.5) {
                statScore = 3 + ratio * 6;
            } else if (ratio <= 1) {
                statScore = 6 + (ratio - 0.5) * 4;
            } else if (ratio <= 1.5) {
                statScore = 8 + (ratio - 1) * 2;
            } else {
                statScore = Math.min(9 + (ratio - 1.5) * 1, 10);
            }
            
            if (stat.reverse) {
                if (value === 0) {
                    statScore = 10;
                } else {
                    const reverseRatio = value / ref;
                    if (reverseRatio <= 0.5) {
                        statScore = 10 - reverseRatio * 4;
                    } else if (reverseRatio <= 1) {
                        statScore = 8 - (reverseRatio - 0.5) * 4;
                    } else if (reverseRatio <= 1.5) {
                        statScore = 6 - (reverseRatio - 1) * 4;
                    } else {
                        statScore = Math.max(4 - (reverseRatio - 1.5) * 2, 2);
                    }
                    statScore = Math.max(statScore, 2);
                }
            }
        }

        if (timeFactor > 0 && ownMinutes > 0 && statScore > 0) {
            statScore = Math.min(statScore * timeFactor, 10);
        }

        statsScores.push({
            id: stat.id,
            label: stat.label,
            value: value,
            score: statScore,
            cat: cat,
            weight: weight
        });
    });

    // KATEGORIEN 80/20
    let catWeightedAverages = {};
    let catAverages = {};

    Object.keys(categories).forEach(catKey => {
        const cat = parseInt(catKey);
        const catStats = statsScores.filter(s => s.cat === cat);
        
        let total80Score = 0, total80Count = 0;
        let total20Score = 0, total20Count = 0;
        
        catStats.forEach(s => {
            if (s.weight === 80) {
                total80Score += s.score;
                total80Count++;
            } else {
                total20Score += s.score;
                total20Count++;
            }
        });
        
        const avg80 = total80Count > 0 ? total80Score / total80Count : 0;
        const avg20 = total20Count > 0 ? total20Score / total20Count : 0;
        
        catWeightedAverages[cat] = (avg80 * 0.8) + (avg20 * 0.2);
        catAverages[cat] = { avg80, avg20, count80: total80Count, count20: total20Count };
    });

    // KATEGORIEN-GEWICHTUNG
    let totalCatScore = 0, totalCatWeight = 0;

    Object.keys(categories).forEach(catKey => {
        const cat = parseInt(catKey);
        const weight = categories[cat].weight;
        if (catWeightedAverages[cat] !== undefined) {
            totalCatScore += catWeightedAverages[cat] * weight;
            totalCatWeight += weight;
        }
    });

    let avgCatScore = totalCatWeight > 0 ? totalCatScore / totalCatWeight : 0;

    // SCORER-BONUS (MASSIV)
    let scorerBonus = 0;
    let scorerBonusText = '';

    if (ownMinutes > 0) {
        if (hasGoal) {
            scorerBonus += 1.5;
            if (totalGoals >= 2) scorerBonus += 0.5;
            if (totalGoals >= 3) scorerBonus += 0.4;
            if (totalGoals >= 4) scorerBonus += 0.3;
        }
        
        if (hasAssist) {
            scorerBonus += 1.5;
            if (totalAssists >= 2) scorerBonus += 0.5;
            if (totalAssists >= 3) scorerBonus += 0.4;
        }
        
        if (hasGoal && hasAssist) {
            scorerBonus += 0.5;
        }
        
        scorerBonus = Math.min(scorerBonus, 4.5);
        const totalScorer = totalGoals + totalAssists;
        scorerBonusText = ` +${scorerBonus.toFixed(1)} Scorer-Bonus (${totalScorer} Scorer · ${totalGoals} Tore, ${totalAssists} Assists)`;
    }

    // ENDGÜLTIGE NOTE
    let grade = 6.0;
    
    if (ownMinutes > 0 && avgCatScore > 0) {
        const correction = (avgCatScore - 6.0) * 0.5;
        grade = 6.0 + correction;
        grade = grade + scorerBonus;
        grade = Math.min(Math.max(grade, 2.0), 10.0);
    } else if (ownMinutes === 0) {
        grade = 2.0;
    }
    
    const roundedGrade = Math.round(grade * 10) / 10;

    // LABEL
    let label, analysis;
    if (roundedGrade >= 9.5) {
        label = '🏆 ABSOLUTE WELTKLASSE!';
        analysis = 'Ein perfektes Spiel! Du hast in allen Bereichen deiner Position brilliert.';
    } else if (roundedGrade >= 9.0) {
        label = '⭐ Weltklasse!';
        analysis = 'Eine weltklasse Leistung! Du warst der überragende Spieler auf dem Platz.';
    } else if (roundedGrade >= 8.5) {
        label = '🌟 Herausragend!';
        analysis = 'Eine herausragende Leistung! Du hast deine Rolle perfekt erfüllt.';
    } else if (roundedGrade >= 8.0) {
        label = '👍 Sehr gut!';
        analysis = 'Eine sehr gute Performance! Du warst einer der Besten.';
    } else if (roundedGrade >= 7.5) {
        label = '📈 Gut!';
        analysis = 'Eine solide Leistung mit starken Ansätzen.';
    } else if (roundedGrade >= 7.0) {
        label = '📊 Ordentlich';
        analysis = 'Ein ordentliches Spiel – du hast deine Aufgabe erfüllt.';
    } else if (roundedGrade >= 6.5) {
        label = '😐 Durchschnittlich';
        analysis = 'Ein durchschnittliches Spiel. Es gibt Luft nach oben.';
    } else if (roundedGrade >= 6.0) {
        label = '📊 Solide Basis';
        analysis = 'Ein solides Grundniveau. Arbeite an deinen Schwächen.';
    } else if (roundedGrade >= 5.0) {
        label = '🤔 Verbesserungswürdig';
        analysis = 'Es war nicht dein bester Tag. Setze dir klare Ziele.';
    } else if (roundedGrade >= 4.0) {
        label = '😰 Schwach';
        analysis = 'Ein schwacher Auftritt in den wichtigen Bereichen.';
    } else {
        label = '💀 Desaströs';
        analysis = 'Das war eine Katastrophe. Konzentriere dich auf die Basics.';
    }

    if ((hasGoal || hasAssist) && ownMinutes > 0) {
        analysis += ` 🔥 ${totalGoals} Tore, ${totalAssists} Assists – MASSIVER Einfluss auf die Bewertung!`;
    }

    if (ownMinutes > 0 && timeFactor > 1.0) {
        analysis += ` 💪 Du hast in nur ${ownMinutes} Minuten beeindruckt (${timeFactor.toFixed(2)}x Effizienz)!`;
    } else if (ownMinutes === 0) {
        analysis = '⛔ Du hast keine Spielzeit absolviert. Keine Bewertung möglich.';
    }

    // KATEGORIEN-ÜBERSICHT
    let catOverviewHtml = '';
    const colors = ['#4ecdc4', '#ffe66d', '#ff6b6b'];
    Object.keys(categories).forEach(catKey => {
        const cat = parseInt(catKey);
        const name = categories[cat].name;
        const weight = categories[cat].weight;
        const avg = catWeightedAverages[cat] !== undefined ? catWeightedAverages[cat] : 0;
        const avg80 = catAverages[cat] ? catAverages[cat].avg80 : 0;
        const avg20 = catAverages[cat] ? catAverages[cat].avg20 : 0;
        catOverviewHtml += `
            <div class="result-cat-item">
                <span class="cat-dot" style="background:${colors[cat-1]}"></span>
                <span class="cat-name">${name}</span>
                <span class="cat-weight">${(weight * 100).toFixed(0)}%</span>
                <span class="cat-score">${avg.toFixed(1)}</span>
                <span style="font-size:0.6rem;opacity:0.3;">(80:${avg80.toFixed(1)} · 20:${avg20.toFixed(1)})</span>
            </div>
        `;
    });

    // TOP-STATS
    const sortedStats = [...statsScores]
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    const topStatsHtml = sortedStats.map(s => `
        <div class="result-top-stat">
            <div class="ts-label">${s.label}</div>
            <div class="ts-value">${s.value}</div>
            <div class="ts-grade">${s.score.toFixed(1)} / 10</div>
        </div>
    `).join('');

    // DETAIL-STATS
    const detailStatsHtml = statsScores.map(data => {
        const weightClass = data.weight === 80 ? 'weight-high' : 'weight-low';
        const weightIcon = data.weight === 80 ? '🔴' : '⚪';
        return `
            <div class="result-ds-item ${weightClass}">
                <div class="ds-label">${weightIcon} ${data.label}</div>
                <div class="ds-value">${data.value}</div>
                <div class="ds-grade">${data.score.toFixed(1)}</div>
            </div>
        `;
    }).join('');

    // KOMPLETTES HTML
    return `
        <div class="result-grade-section">
            <div class="result-grade">${roundedGrade.toFixed(1)}</div>
            <div class="result-grade-label">${label}</div>
            <div class="result-grade-detail">${config.label} · ${statsScores.length} Stats</div>
            <div class="result-time-factor">${timeFactorDisplay} ${scorerBonusText}</div>
        </div>

        <div class="result-cat-overview">
            ${catOverviewHtml}
        </div>

        <div class="result-analysis">
            ${analysis}
        </div>

        <div style="font-size:0.7rem;opacity:0.3;margin:0.5rem 0;text-align:center;">
            ⚡ Top 5 Statistiken
        </div>
        <div class="result-top-stats">
            ${topStatsHtml || '<p style="text-align:center;opacity:0.4;font-size:0.8rem;grid-column:1/-1;">Keine Top-Stats verfügbar</p>'}
        </div>

        <div style="font-size:0.7rem;opacity:0.3;margin:0.8rem 0 0.3rem 0;text-align:center;">
            📊 Alle Statistiken im Detail
        </div>
        <div class="result-detail-stats">
            ${detailStatsHtml}
        </div>

        <div class="result-footer">
            <span>⚽ FootRank · Positions-spezifische Bewertung</span>
            <span>80/20 Gewichtung · Basis 6.0</span>
            <span>${new Date().toLocaleString()}</span>
        </div>
    `;
}

// ============================================================
// EVENT-LISTENER & INIT
// ============================================================

document.getElementById('matchDuration').addEventListener('input', updateTimeInfo);
document.getElementById('ownMinutes').addEventListener('input', updateTimeInfo);

renderPositionButtons();
renderStats('winger');
updateTimeInfo();
/**
 * WordManager.js - Enhanced word detection and management module
 */

export class WordManager {
    constructor() {
        this.dictionary = new Set();
        this.wordsFound = [];
        this.targetWords = ['CHAT', 'MAISON', 'MUSIQUE', 'JARDIN', 'LIVRE', 'TABLE', 'FENÊTRE', 'PORTE'];
        this.wordDetector = new WordDetector();
        this.wordClues = new Map();
        this.activeClues = [];
        this.wordCategories = {
            'ANIMAUX': ['CHAT', 'CHIEN', 'LION', 'TIGRE', 'ÉLÉPHANT', 'GIRAFE', 'ZÈBRE', 'PANTHÈRE'],
            'MAISON': ['MAISON', 'APPARTEMENT', 'CHAMBRE', 'CUISINE', 'SALON', 'BALCON', 'JARDIN'],
            'MUSIQUE': ['MUSIQUE', 'PIANO', 'GUITARE', 'VIOLON', 'TAMBOUR', 'FLÛTE', 'HARPE'],
            'NATURE': ['ARBRE', 'FLEUR', 'SOLEIL', 'LUNE', 'ÉTOILE', 'PLAGE', 'MONTAGNE', 'RIVIÈRE'],
            'VILLE': ['VILLE', 'RUE', 'ÉCOLE', 'HÔPITAL', 'RESTAURANT', 'CAFÉ', 'THÉÂTRE', 'CINÉMA']
        };
    }

    async init() {
        try {
            await this.loadDictionary();
            this.generateWordClues();
            console.log('📚 WordManager initialized with enhanced features');
        } catch (error) {
            console.error('❌ WordManager initialization failed:', error);
            throw error;
        }
    }

    reset() {
        this.wordsFound = [];
        this.activeClues = [];
    }

    async loadDictionary() {
        // Enhanced French dictionary with categories
        const frenchWords = [
            // Animals
            'CHAT', 'CHIEN', 'LION', 'TIGRE', 'ÉLÉPHANT', 'GIRAFE', 'ZÈBRE', 'PANTHÈRE', 'LÉOPARD',
            'RENARD', 'LOUP', 'OURS', 'SINGE', 'GORILLE', 'CHIMPANZÉ', 'ORANG-OUTAN', 'KANGOUROU',
            'KOALA', 'PINGOUIN', 'AIGLE', 'FAUCON', 'PERROQUET', 'TOUCAN', 'FLAMANT', 'CYGNE',
            
            // House & Home
            'MAISON', 'APPARTEMENT', 'CHAMBRE', 'CUISINE', 'SALON', 'BALCON', 'JARDIN', 'GARAGE',
            'CAVE', 'GRENIER', 'BUREAU', 'SALLE', 'COULOIR', 'ESCALIER', 'ASCENSEUR', 'TOIT',
            'MUR', 'FENÊTRE', 'PORTE', 'CHEMINÉE', 'TERRASSE', 'PISCINE', 'CLÔTURE', 'ALLÉE',
            
            // Music
            'MUSIQUE', 'PIANO', 'GUITARE', 'VIOLON', 'TAMBOUR', 'FLÛTE', 'HARPE', 'TROMPETTE',
            'SAXOPHONE', 'CLARINETTE', 'ACCORDÉON', 'BANJO', 'MANDOLINE', 'CYMBALES', 'TAMBOURIN',
            'ORCHESTRE', 'CHŒUR', 'MÉLODIE', 'RHYTHME', 'HARMONIE', 'CONCERT', 'OPÉRA', 'SYMPHONIE',
            
            // Nature
            'ARBRE', 'FLEUR', 'SOLEIL', 'LUNE', 'ÉTOILE', 'PLAGE', 'MONTAGNE', 'RIVIÈRE', 'OCÉAN',
            'FORÊT', 'CHAMP', 'PRAIRIE', 'SAVANE', 'DÉSERT', 'GLACIER', 'VOLCAN', 'ÎLE', 'PÉNINSULE',
            'ISTHME', 'CAP', 'BAIE', 'GOLFE', 'DÉTROIT', 'CANAL', 'LAC', 'ÉTANG', 'MARÉCAGE',
            'CASCADE', 'SOURCE', 'PUITS', 'FONTAINE', 'AQUEDUC', 'DIGUE', 'BARRAGE', 'ÉCLUSE',
            
            // City & Places
            'VILLE', 'RUE', 'ÉCOLE', 'HÔPITAL', 'RESTAURANT', 'CAFÉ', 'THÉÂTRE', 'CINÉMA', 'MUSÉE',
            'BIBLIOTHÈQUE', 'PARC', 'STADE', 'PISCINE', 'GYMNASE', 'MARCHÉ', 'BANQUE', 'POSTE',
            'GARE', 'AÉROPORT', 'HÔTEL', 'MAIRIE', 'ÉGLISE', 'TEMPLE', 'MOSQUÉE', 'SYNAGOGUE',
            'CIMETIÈRE', 'PONT', 'TUNNEL', 'ROUTE', 'AUTOROUTE', 'CHEMIN', 'SENTIER', 'PASSAGE',
            'AVENUE', 'BOULEVARD', 'PLACE', 'SQUARE', 'BOIS', 'PRÉ', 'PARC', 'JARDIN',
            
            // Technology
            'ORDINATEUR', 'TÉLÉPHONE', 'RADIO', 'TÉLÉVISION', 'INTERNET', 'RÉSEAU', 'SATELLITE',
            'ANTENNE', 'CÂBLE', 'FIL', 'PRISE', 'INTERRUPTEUR', 'LAMPE', 'AMPOULE', 'LUMIÈRE',
            'ÉLECTRICITÉ', 'GAZ', 'EAU', 'AIR', 'VENT', 'PLUIE', 'NEIGE', 'GLACE', 'VAPEUR',
            'FUMÉE', 'BRUME', 'NUAGE', 'ORAGE', 'TONNERRE', 'ÉCLAIR', 'ARC', 'PLUIE', 'AVERSES',
            'ORAGE', 'FOUDRE', 'GRÊLE', 'GIVRE', 'ROSÉE', 'BRUME', 'BROUILLARD', 'SMOG',
            
            // Actions & Activities
            'NETTOYER', 'LAVER', 'ESSUYER', 'BROSSER', 'BALAYER', 'ASPIRER', 'PASSER', 'REPASSER',
            'COUDRE', 'TISSER', 'TRICOTER', 'BRODER', 'PEINDRE', 'DESSINER', 'ÉCRIRE', 'LIRE',
            'COMPTER', 'CALCULER', 'MESURER', 'PESER', 'COMPARER', 'CLASSER', 'TRIER', 'RANGER',
            'ORGANISER', 'PLANIFIER', 'PRÉPARER', 'CONSTRUIRE', 'RÉPARER', 'MONTER', 'DÉMONTER',
            'ASSEMBLER', 'DÉSASSEMBLER', 'COUPER', 'COLLER', 'CLOUER', 'VISSER', 'PERCER', 'FORER',
            'SCULPTER', 'GRAVER', 'IMPRIMER', 'PHOTOGRAPHIER', 'FILMER', 'ENREGISTRER',
            
            // Communication
            'DIFFUSER', 'ÉMISSION', 'RÉCEPTION', 'TRANSMISSION', 'COMMUNICATION', 'CONVERSATION',
            'DISCUSSION', 'DÉBAT', 'ARGUMENT', 'OPINION', 'IDÉE', 'PENSÉE', 'RÉFLEXION', 'MÉDITATION',
            'RÊVERIE', 'IMAGINATION', 'CRÉATIVITÉ', 'INVENTION', 'DÉCOUVERTE', 'RECHERCHE', 'ÉTUDE',
            'ANALYSE', 'SYNTHÈSE', 'THÉORIE', 'PRATIQUE', 'EXPÉRIENCE', 'EXPÉRIMENTATION', 'OBSERVATION',
            'HYPOTHÈSE', 'CONCLUSION', 'RÉSULTAT', 'EFFET', 'CAUSE', 'CONSÉQUENCE', 'INFLUENCE',
            'IMPACT', 'CHANGEMENT', 'ÉVOLUTION', 'PROGRESSION', 'DÉVELOPPEMENT', 'AMÉLIORATION',
            'PERFECTIONNEMENT', 'OPTIMISATION', 'MAXIMISATION', 'MINIMISATION', 'RÉDUCTION',
            'AUGMENTATION', 'MULTIPLICATION', 'DIVISION', 'ADDITION', 'SOUSTRACTION', 'CALCUL',
            
            // Mathematics & Science
            'MATHÉMATIQUE', 'GÉOMÉTRIE', 'ALGÈBRE', 'ARITHMÉTIQUE', 'STATISTIQUE', 'PROBABILITÉ',
            'LOGARITHME', 'EXPONENTIEL', 'TRIGONOMÉTRIE', 'CALCULUS', 'INTÉGRALE', 'DÉRIVÉE',
            'FONCTION', 'VARIABLE', 'CONSTANTE', 'PARAMÈTRE', 'COEFFICIENT', 'EXPOSANT', 'RACINE',
            'PUISSANCE', 'CARRÉ', 'CUBE', 'QUART', 'MOITIÉ', 'TIERS', 'QUART', 'CINQUIÈME',
            'SIXIÈME', 'SEPTIÈME', 'HUITIÈME', 'NEUVIÈME', 'DIXIÈME', 'CENTIÈME', 'MILLIÈME',
            'MILLION', 'MILLIARD', 'BILLION', 'TRILLION', 'ZÉRO', 'UN', 'DEUX', 'TROIS', 'QUATRE',
            'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF', 'DIX', 'ONZE', 'DOUZE', 'TREIZE', 'QUATORZE',
            'QUINZE', 'SEIZE', 'DIX-SEPT', 'DIX-HUIT', 'DIX-NEUF', 'VINGT', 'TRENTE', 'QUARANTE',
            'CINQUANTE', 'SOIXANTE', 'SOIXANTE-DIX', 'QUATRE-VINGT', 'QUATRE-VINGT-DIX', 'CENT',
            'MILLE', 'PREMIER', 'DEUXIÈME', 'TROISIÈME', 'QUATRIÈME', 'CINQUIÈME', 'SIXIÈME',
            'SEPTIÈME', 'HUITIÈME', 'NEUVIÈME', 'DIXIÈME', 'DERNIER', 'PRÉCÉDENT', 'SUIVANT',
            'ACTUEL', 'PRÉSENT', 'PASSÉ', 'FUTUR', 'ANCIEN', 'NOUVEAU', 'MODERNE', 'CONTEMPORAIN',
            
            // Art & Culture
            'TRADITIONNEL', 'CLASSIQUE', 'ANTIQUE', 'MÉDIÉVAL', 'RENAISSANCE', 'BAROQUE', 'ROCOCO',
            'NÉOCLASSIQUE', 'ROMANTIQUE', 'RÉALISTE', 'IMPRESSIONNISTE', 'EXPRESSIONNISTE', 'CUBISTE',
            'SURRÉALISTE', 'ABSTRAIT', 'CONCEPTUEL', 'MINIMALISTE', 'POSTMODERNE', 'AVANT-GARDE',
            'EXPÉRIMENTAL', 'INNOVANT', 'CRÉATIF', 'ORIGINAL', 'UNIQUE', 'PARTICULIER', 'SPÉCIAL',
            'EXCEPTIONNEL', 'EXTRAORDINAIRE', 'REMARQUABLE', 'NOTABLE', 'IMPORTANT', 'ESSENTIEL',
            'FONDAMENTAL', 'BASIQUE', 'ÉLÉMENTAIRE', 'PRIMAIRE', 'SECONDAIRE', 'TERTIAIRE',
            'QUATERNAIRE', 'QUINAIRE', 'SÉNAIRE', 'SEPTENAIRE', 'OCTONAIRE', 'NOVENAIRE', 'DÉCENAIRE',
            'CENTENAIRE', 'MILLÉNAIRE', 'BIMILLÉNAIRE', 'TRIMILLÉNAIRE', 'QUADRIMILLÉNAIRE',
            'QUINQUAMILLÉNAIRE', 'SEXAMILLÉNAIRE', 'SEPTAMILLÉNAIRE', 'OCTAMILLÉNAIRE', 'NOVAMILLÉNAIRE',
            'DÉCAMILLÉNAIRE', 'CENTAMILLÉNAIRE', 'BILLENAIRE', 'TRILLENAIRE', 'QUADRILLENAIRE',
            'QUINQUILLENAIRE', 'SEXILLENAIRE', 'SEPTILLENAIRE', 'OCTILLENAIRE', 'NOVILLENAIRE',
            'DÉCILLENAIRE', 'CENTILLENAIRE', 'MILLILLENAIRE', 'BILLILLENAIRE', 'TRILLILLENAIRE',
            'QUADRILLILLENAIRE', 'QUINQUILLILLENAIRE', 'SEXILLILLENAIRE', 'SEPTILLILLENAIRE',
            'OCTILLILLENAIRE', 'NOVILLILLENAIRE', 'DÉCILLILLENAIRE', 'CENTILLILLENAIRE'
        ];
        
        this.dictionary = new Set(frenchWords);
        
        // Add target words to dictionary if not already present
        this.targetWords.forEach(word => {
            this.dictionary.add(word);
        });
    }

    generateWordClues() {
        this.wordClues.clear();
        
        // Generate clues for target words
        this.targetWords.forEach(word => {
            const clue = this.generateClueForWord(word);
            this.wordClues.set(word, clue);
        });
        
        // Generate clues for category words
        Object.entries(this.wordCategories).forEach(([category, words]) => {
            words.forEach(word => {
                if (!this.wordClues.has(word)) {
                    const clue = this.generateClueForWord(word);
                    this.wordClues.set(word, clue);
                }
            });
        });
    }

    generateClueForWord(word) {
        const clues = {
            'CHAT': { hint: 'Animal domestique qui miaule', category: 'ANIMAUX', difficulty: 1 },
            'MAISON': { hint: 'Endroit où on habite', category: 'MAISON', difficulty: 1 },
            'MUSIQUE': { hint: 'Art des sons et mélodies', category: 'MUSIQUE', difficulty: 2 },
            'JARDIN': { hint: 'Espace vert avec des plantes', category: 'NATURE', difficulty: 1 },
            'LIVRE': { hint: 'Objet pour lire des histoires', category: 'CULTURE', difficulty: 1 },
            'TABLE': { hint: 'Meuble pour manger ou travailler', category: 'MAISON', difficulty: 1 },
            'FENÊTRE': { hint: 'Ouverture dans le mur pour voir dehors', category: 'MAISON', difficulty: 2 },
            'PORTE': { hint: 'Entrée et sortie d\'une pièce', category: 'MAISON', difficulty: 1 },
            'CHIEN': { hint: 'Meilleur ami de l\'homme', category: 'ANIMAUX', difficulty: 1 },
            'PIANO': { hint: 'Instrument à touches noires et blanches', category: 'MUSIQUE', difficulty: 2 },
            'ARBRE': { hint: 'Plante avec un tronc et des feuilles', category: 'NATURE', difficulty: 1 },
            'SOLEIL': { hint: 'Étoile qui éclaire la Terre', category: 'NATURE', difficulty: 1 },
            'VILLE': { hint: 'Grande agglomération urbaine', category: 'LIEUX', difficulty: 1 },
            'ÉCOLE': { hint: 'Lieu d\'apprentissage', category: 'LIEUX', difficulty: 1 },
            'RESTAURANT': { hint: 'Endroit pour manger dehors', category: 'LIEUX', difficulty: 2 }
        };
        
        return clues[word] || { 
            hint: `Mot de ${word.length} lettres`, 
            category: 'GÉNÉRAL', 
            difficulty: Math.min(Math.floor(word.length / 3) + 1, 3) 
        };
    }

    // Added for tests: return a copy of the dictionary as an array
    getWordList() {
        return Array.from(this.dictionary);
    }

    // Added for tests: process an array and keep only valid dictionary words (uppercase)
    processWordList(words) {
        if (!Array.isArray(words)) return [];
        return words
            .map(w => (typeof w === 'string' ? w.toUpperCase() : ''))
            .filter(w => w && this.dictionary.has(w));
    }

    getActiveClues() {
        return this.activeClues;
    }

    addActiveClue(word) {
        const clue = this.wordClues.get(word);
        if (clue && !this.activeClues.find(c => c.word === word)) {
            this.activeClues.push({
                word: word,
                hint: clue.hint,
                category: clue.category,
                difficulty: clue.difficulty,
                timeAdded: Date.now()
            });
        }
    }

    removeActiveClue(word) {
        this.activeClues = this.activeClues.filter(clue => clue.word !== word);
    }

    update() {
        // Update active clues (remove old ones)
        const now = Date.now();
        this.activeClues = this.activeClues.filter(clue => 
            now - clue.timeAdded < 30000 // Remove clues older than 30 seconds
        );
    }

    render(ctx) {
        // Render active word clues
        this.renderActiveClues(ctx);
        
        // Render word completion indicators
        this.renderWordIndicators(ctx);
    }

    renderActiveClues(ctx) {
        if (this.activeClues.length === 0) return;
        
        const startY = 50;
        const lineHeight = 25;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, startY - 10, 300, this.activeClues.length * lineHeight + 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        this.activeClues.forEach((clue, index) => {
            const y = startY + index * lineHeight;
            
            // Word
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`${clue.word}:`, 20, y);
            
            // Hint
            ctx.fillStyle = 'white';
            ctx.fillText(clue.hint, 20 + ctx.measureText(`${clue.word}: `).width, y);
        });
    }

    renderWordIndicators(ctx) {
        // Render progress indicators for target words
        const startX = ctx.canvas.width - 200;
        const startY = 50;
        const lineHeight = 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(startX - 10, startY - 10, 210, this.targetWords.length * lineHeight + 20);
        
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        this.targetWords.forEach((word, index) => {
            const y = startY + index * lineHeight;
            const isCompleted = this.wordsFound.includes(word);
            
            ctx.fillStyle = isCompleted ? '#00FF00' : '#FF6B6B';
            ctx.fillText(`${isCompleted ? '✓' : '○'} ${word}`, startX, y);
        });
    }

    checkWordCompletion(grid) {
        const words = this.wordDetector.scanGrid(grid);
        const validWords = words.filter(word => this.dictionary.has(word));
        
        // Add new words to active clues
        validWords.forEach(word => {
            if (!this.wordsFound.includes(word)) {
                this.addActiveClue(word);
            }
        });
        
        return validWords;
    }

    completeWord(word) {
        if (!this.wordsFound.includes(word)) {
            this.wordsFound.push(word);
            this.removeActiveClue(word);
            return true;
        }
        return false;
    }

    getWordProgress() {
        const completed = this.wordsFound.length;
        const total = this.targetWords.length;
        return { completed, total, percentage: (completed / total) * 100 };
    }

    getRandomWordFromCategory(category) {
        const words = this.wordCategories[category] || [];
        return words[Math.floor(Math.random() * words.length)];
    }

    getWordDifficulty(word) {
        const clue = this.wordClues.get(word);
        return clue ? clue.difficulty : 1;
    }
}

class WordDetector {
    constructor() {
        this.dictionary = new Set();
    }

    scanGrid(grid) {
        const words = [];
        
        // Check horizontal words
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const word = this.findWordsInRow(grid[row].slice(col));
                words.push(...word);
            }
        }
        
        // Check vertical words
        for (let col = 0; col < grid[0].length; col++) {
            for (let row = 0; row < grid.length; row++) {
                const column = grid.map(r => r[col]).slice(row);
                const word = this.findWordsInRow(column);
                words.push(...word);
            }
        }
        
        // Check diagonal words (top-left to bottom-right)
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const diagonal = this.getDiagonal(grid, row, col, 1, 1);
                const word = this.findWordsInRow(diagonal);
                words.push(...word);
            }
        }
        
        // Check diagonal words (top-right to bottom-left)
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const diagonal = this.getDiagonal(grid, row, col, 1, -1);
                const word = this.findWordsInRow(diagonal);
                words.push(...word);
            }
        }
        
        return words;
    }

    getDiagonal(grid, startRow, startCol, deltaRow, deltaCol) {
        const diagonal = [];
        let row = startRow;
        let col = startCol;
        
        while (row >= 0 && row < grid.length && col >= 0 && col < grid[row].length) {
            diagonal.push(grid[row][col]);
            row += deltaRow;
            col += deltaCol;
        }
        
        return diagonal;
    }

    findWordsInRow(letters) {
        const words = [];
        const letterString = letters.map(cell => cell ? cell.letter : '').join('');
        
        for (let i = 0; i < letterString.length; i++) {
            for (let j = i + 2; j <= letterString.length; j++) {
                const word = letterString.substring(i, j);
                if (this.validateWord(word)) {
                    words.push(word);
                }
            }
        }
        
        return words;
    }

    validateWord(word) {
        return word.length >= 3 && this.dictionary.has(word);
    }
}

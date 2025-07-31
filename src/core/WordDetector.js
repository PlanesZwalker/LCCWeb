// WordDetector.js

export class WordDetector {
  constructor(dictionary) {
    this.dictionary = dictionary || new Set([
      'CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'TIGER', 'BEAR', 'WOLF',
      'DEER', 'FOX', 'DUCK', 'GOOSE', 'SWAN', 'EAGLE', 'HAWK', 'OWL',
      'CROW', 'ROBIN', 'SPARROW', 'FINCH', 'CANARY', 'PARROT', 'PENGUIN',
      'OSTRICH', 'EMU', 'KIWI', 'ALBATROSS', 'SEAGULL', 'PELICAN', 'HERON',
      'STORK', 'CRANE', 'FLAMINGO', 'PEACOCK', 'PHEASANT', 'QUAIL', 'PARTRIDGE',
      'GROUSE', 'PTARMIGAN', 'CHICKEN', 'TURKEY', 'GUINEA', 'PIGEON', 'DOVE',
      'TURTLE', 'SNAKE', 'LIZARD', 'FROG', 'TOAD', 'SALAMANDER', 'NEWT',
      'AXOLOTL', 'CAECILIAN', 'TADPOLE', 'POLLIWOG', 'BULLFROG', 'TREEFROG',
      'GLASSFROG', 'POISONFROG', 'DARTFROG', 'MANTELLA', 'DISCUS', 'ANGELFISH',
      'GOLDFISH', 'BETTA', 'GUPPY', 'MOLLY', 'PLATY', 'SWORDTAIL', 'TETRA',
      'NEON', 'CARDINAL', 'EMPEROR', 'CLOWN', 'DAMSEL', 'BUTTERFLY', 'SURGEON',
      'TANG', 'WRASSE', 'GOBY', 'BLENNY', 'SCORPION', 'LIONFISH', 'STONEFISH',
      'SCORPIONFISH', 'FROGFISH', 'ANGLER', 'DEVIL', 'BATFISH', 'TRIGGERFISH',
      'FILEFISH', 'PUFFER', 'BOX', 'COWFISH', 'TRUNKFISH', 'SEAHORSE', 'PIPE',
      'DRAGON', 'RIDGEBACK', 'WEEDY', 'LEAFY', 'PYGMY', 'GIANT', 'COMMON',
      'DWARF', 'POTBELLY', 'PIGLET', 'BOAR', 'SOW', 'GILT', 'BARROW', 'HOG',
      'PORKER', 'SHOTE', 'PIGGY', 'PORKY', 'HAM', 'BACON', 'SAUSAGE', 'CHOP',
      'LOIN', 'BELLY', 'JOWL', 'TROTTER', 'HOCK', 'SHANK', 'SPARE', 'RIB',
      'TENDERLOIN', 'SIRLOIN', 'TRI', 'TIP', 'ROAST', 'STEAK', 'CUTLET',
      'MEDALLION', 'ESCALOPE', 'MIGNON', 'FILET', 'STRIP', 'TENDER', 'FLANK',
      'SKIRT', 'PLATE', 'BRISKET', 'CHUCK', 'SHOULDER', 'ARM', 'BLADE',
      'PICNIC', 'BUTT', 'HAM', 'LEG', 'SHANK', 'TROTTER', 'HOCK', 'ANKLE',
      'KNUCKLE', 'JOINT', 'BONE', 'CARTILAGE', 'TENDON', 'LIGAMENT', 'MUSCLE',
      'FAT', 'MARBLING', 'GRISLE', 'SILVERSKIN', 'MEMBRANE', 'SHEATH',
      'FASCIA', 'APONEUROSIS', 'PERIOSTEUM', 'PERICHONDRIUM', 'SYNOVIUM',
      'BURSA', 'MENISCUS', 'DISC', 'VERTEBRA', 'SPINE', 'COLUMN', 'CORD',
      'BRAIN', 'SKULL', 'CRANIUM', 'FACE', 'JAW', 'MANDIBLE', 'MAXILLA',
      'ZYGOMA', 'TEMPORAL', 'OCCIPITAL', 'PARIETAL', 'FRONTAL', 'SPHENOID',
      'ETHMOID', 'LACRIMAL', 'NASAL', 'VOMER', 'CONCHA', 'TURBINATE',
      'SEPTUM', 'SINUS', 'CAVITY', 'ORBIT', 'SOCKET', 'EYE', 'GLOBE',
      'RETINA', 'CORNEA', 'IRIS', 'PUPIL', 'LENS', 'VITREOUS', 'AQUEOUS',
      'CHOROID', 'SCLERA', 'CONJUNCTIVA', 'EYELID', 'LASH', 'BROW', 'TEAR',
      'DUCT', 'GLAND', 'NERV', 'OPTIC', 'OCULOMOTOR', 'TROCHLEAR', 'ABDUCENS',
      'FACIAL', 'VESTIBULOCOCHLEAR', 'GLOSSOPHARYNGEAL', 'VAGUS', 'ACCESSORY',
      'HYPOGLOSSAL', 'TRIGEMINAL', 'OLFACTORY', 'SPINAL', 'CERVICAL', 'THORACIC',
      'LUMBAR', 'SACRAL', 'COCCYGEAL', 'CERVICAL', 'THORACIC', 'LUMBAR',
      'SACRAL', 'COCCYGEAL', 'CERVICAL', 'THORACIC', 'LUMBAR', 'SACRAL',
      'COCCYGEAL', 'CERVICAL', 'THORACIC', 'LUMBAR', 'SACRAL', 'COCCYGEAL',
    ]);
  }

  isWord(word) {
    return this.dictionary.has(word.toUpperCase());
  }

  findWords(grid) {
    const words = [];
    const rows = grid.length;
    const cols = grid[0].length;

    // Check horizontal words
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Check right
        for (let len = 3; len <= Math.min(8, cols - col); len++) {
          const word = grid[row].slice(col, col + len).join('');
          if (this.isWord(word)) {
            words.push({
              word,
              start: { row, col },
              end: { row, col: col + len - 1 },
              direction: 'horizontal',
            });
          }
        }
      }
    }

    // Check vertical words
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Check down
        for (let len = 3; len <= Math.min(8, rows - row); len++) {
          const word = [];
          for (let i = 0; i < len; i++) {
            word.push(grid[row + i][col]);
          }
          const wordStr = word.join('');
          if (this.isWord(wordStr)) {
            words.push({
              word: wordStr,
              start: { row, col },
              end: { row: row + len - 1, col },
              direction: 'vertical',
            });
          }
        }
      }
    }

    // Check diagonal words (top-left to bottom-right)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        for (let len = 3; len <= Math.min(8, Math.min(rows - row, cols - col)); len++) {
          const word = [];
          for (let i = 0; i < len; i++) {
            word.push(grid[row + i][col + i]);
          }
          const wordStr = word.join('');
          if (this.isWord(wordStr)) {
            words.push({
              word: wordStr,
              start: { row, col },
              end: { row: row + len - 1, col: col + len - 1 },
              direction: 'diagonal',
            });
          }
        }
      }
    }

    return words;
  }

  addWord(word) {
    this.dictionary.add(word.toUpperCase());
  }

  removeWord(word) {
    this.dictionary.delete(word.toUpperCase());
  }

  getDictionary() {
    return Array.from(this.dictionary);
  }
}

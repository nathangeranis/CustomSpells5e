import { SpellCalculator } from './classes/SpellCalculator.js';
import { SpellCreatorApp } from './classes/SpellCreatorApp.js';
import { SpellReviewApp } from './classes/SpellReviewApp.js';
import { SpellCreatorControls } from './classes/SpellCreatorControls.js';
import { 
    MODULE_ID,
    MODULE_TITLE,
    SPELL_LEVEL_POINTS,
    COMPONENT_VALUE_COSTS,
    AVAILABLE_CLASSES,
    DAMAGE_TYPES,
    STATUS_EFFECTS,
    SAVE_TYPES
} from './data/reference-data.js';

console.log('All imports verified successfully');
console.log('Module ID:', MODULE_ID);
console.log('Available Classes:', AVAILABLE_CLASSES.length);
console.log('SpellCalculator:', typeof SpellCalculator);
console.log('SpellCreatorApp:', typeof SpellCreatorApp);
console.log('SpellReviewApp:', typeof SpellReviewApp);
console.log('SpellCreatorControls:', typeof SpellCreatorControls);

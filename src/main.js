import { SpellCreatorControls } from './classes/SpellCreatorControls.js';
import { MODULE_ID, MODULE_TITLE } from './data/reference-data.js';

console.log(`${MODULE_TITLE} | Initializing`);

SpellCreatorControls.setControlHooks();

Hooks.on('init', () => {
  console.log(`${MODULE_TITLE} | Initializing Custom Spells 5e Module`);
});

Hooks.on("ready", () => {
  // Register module settings
  // e.g., game.settings.register(MODULE_ID, 'someSetting', { ... });
});

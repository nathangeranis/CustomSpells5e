import { SpellCreatorApp } from './SpellCreatorApp.js';
import { SpellReviewApp } from './SpellReviewApp.js';
import { MODULE_ID, MODULE_TITLE } from '../data/reference-data.js';

export class SpellCreatorControls {
    static setControlHooks() {
        Hooks.on("getSceneControlButtons", (controls) => {
            if (!controls.tokens) {
                console.warn(`${MODULE_TITLE} | No tokens control group found`);
                return;
            }
            const tokenControls = controls.tokens.tools;
            if (!tokenControls) return;
            
            if(!tokenControls["spell-creator"]){
                tokenControls["spell-creator"] = {
                    name: "spell-creator",
                    title: "Open Spell Creator",
                    icon: "fas fa-magic",
                    onClick: () => new SpellCreatorApp().render(true),
                    button: true
                };
                console.log(`${MODULE_TITLE} | Added spell creator button to scene controls`);
            }

            if(game.user.isGM && !tokenControls["spell-review"]){
                tokenControls["spell-review"] = {
                    name: "spell-review",
                    title: "Spell Review Queue",
                    icon: "fas fa-clipboard-check",
                    onClick: () => new SpellReviewApp().render(true),
                    button: true
                };
                console.log(`${MODULE_TITLE} | Added spell review button to scene controls`);
            }
        });
        console.log(`${MODULE_TITLE} | Initialized control hooks`);
    }
}

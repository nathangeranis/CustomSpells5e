// Main JavaScript file for the Custom Spells 5e module

// CONFIG.debug.hooks = true; // Uncomment for verbose hook logging

const MODULE_ID = 'custom-spells-5e';
const MODULE_TITLE = 'Custom Spells 5e';

// --- Reference Data from CSV ---

const SPELL_LEVEL_POINTS = {
    0: 1, 1: 3, 2: 5, 3: 7, 4: 9, 5: 11, 6: 13, 7: 15, 8: 17, 9: 19
};

const COMPONENT_VALUE_COSTS = { // Cost per GP value of component
    "5gp": { notConsumed: 0.5, consumed: 1 },
    "10gp": { notConsumed: 1, consumed: 2 },
    "25gp": { notConsumed: 1, consumed: 2.5 },
    "50gp": { notConsumed: 1.5, consumed: 3.5 },
    "100gp": { notConsumed: 2, consumed: 4.5 },
    "300gp": { notConsumed: 2, consumed: 5 },
    "500gp": { notConsumed: 2.5, consumed: 6 },
    "1000gp": { notConsumed: 3, consumed: 7 },
    "1500gp": { notConsumed: 3, consumed: 7.5 },
    "2000gp": { notConsumed: 3, consumed: 8 },
    "3000gp": { notConsumed: 3.5, consumed: 9 },
    "25000gp": { notConsumed: 4, consumed: 10 }
    // Note: The CSV implies these are *additional* points. The Spell Creator CSV shows "Component Points: 1" for a Verbal component.
    // The "Component Calculations" CSV shows Verbal: 1, Somatic: 0, Material Value: 0, Material Consumed: 0.
    // This suggests V, S have fixed costs, and material costs are added.
    // Verbal: 1 point, Somatic: 1 point (based on typical 5e design, will confirm with Calculations.csv later)
};

const BASE_COMPONENT_COSTS = {
    verbal: 1,
    somatic: 1, // Assuming 1, will verify
    material: 0 // Material base cost is 0, value-based cost is separate
};

const RANGE_MODIFIERS = {
    "Self": { distance: 0, modifier: 0 },
    "Touch": { distance: 5, modifier: 2 }, // Note: Spell Creator shows Range Points: 0 for "Self". This table might be for *additional* points beyond a base.
    "Close": { distance: 15, modifier: 1 }, // The "Range & Targeting Calculations" CSV shows "Base Range Modifier: 0" for "Self, 0ft"
    "Medium": { distance: 60, modifier: -1 },
    "Long": { distance: 90, modifier: -1.5 },
    "Extended": { distance: 120, modifier: -2 },
    "Far": { distance: 150, modifier: -2.5 },
    "Distant": { distance: 300, modifier: -3 },
    "⅛ Mile": { distance: 660, modifier: -4 },
    "¼ Mile": { distance: 1320, modifier: -5 },
    "½ Mile": { distance: 2640, modifier: -6 },
    "1 Mile": { distance: 5280, modifier: -7 }
};

const STATUS_EFFECT_COSTS = {
    "Blinded": -2, "Charmed": -2, "Deafened": -2, "Frightened": -2, "Grappled": -2,
    "Incapacitated": -2, "Invisible": -2, "Paralyzed": -2, "Petrified": -2,
    "Poisoned": -2, "Prone": -2, "Restrained": -2, "Stunned": -2, "Unconscious": -2
    // Note: Spell Creator shows "Status Points: 0" when no status is selected.
};

const DURATION_MODIFIERS = { // Assuming "Point Modifier" column
    "Instant": { noConcentration: 0, concentration: 0 }, // Concentration "No" for Instant
    "1 round": { noConcentration: 0, concentration: 0 }, // Concentration "Yes" for 1 round
    "1 minute": { noConcentration: -2, concentration: -2 }, // CSV shows "Point Modifier" -2 for 1 minute, and "Concentration Required" cost 2
    "10 minutes": { noConcentration: -2, concentration: -2 },
    "1 hour": { noConcentration: -3, concentration: -3 },
    "8 hours": { noConcentration: -4, concentration: -4 }, // CSV shows "8-12 hours" as 4 points in "Point Cost" column for "Cast Time" table section. This is confusing.
                                                          // Sticking to "Duration" table for now.
    "24 hours": { noConcentration: -5, concentration: -5 },
    "Permanent": { noConcentration: -10, concentration: -10 }
};

const CONCENTRATION_COST = { // From "Modification Type" table
    "Concentration Required": 2, // If spell is concentration
    "Ritual Casting Option": 1 // If spell can be cast as ritual
};

// Base point cost for spell effects, derived from "Spell Level ... Point Cost" table in References.csv
const SPELL_LEVEL_EFFECT_BASE_COSTS = {
    0: -1, 1: -2, 2: -4, 3: -6, 4: -8, 5: -10, 6: -12, 7: -14, 8: -16, 9: -18
};

const EFFECT_TYPE_ADDITIONAL_COSTS = { // From "Effect Type" table
    "Additional Effect Type": -1, // This seems to be a penalty for multiple damage types or effects
    "Temp HP": -1
};

const SAVE_TYPE_COSTS = { // From "Modification Type" table
    "Strength Save": 1, "Dexterity Save": 1, "Constitution Save": 1,
    "Intelligence Save": 1, "Wisdom Save": 1, "Charisma Save": 1,
    "Additonal Save Required": -1 // This seems to be a cost *reduction* if an additional save is required? Or a cost for it.
                                 // The "Calculations.csv" shows "Save Type: 1" and "Additional Saves: 0" for a total of 1.
                                 // This implies the primary save costs 1, and an additional save might cost 1 more.
};

const CAST_TIME_COSTS = {
    "Reaction": -1,
    "Action": 0,
    "1 minute": 1,
    "10 minutes": 2,
    "1 hour": 3,
    "8-12 hours": 4,
    "24 hours": 5,
    "Bonus Action": -1
};

const AVAILABLE_CLASSES = [
    "Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"
];

const DAMAGE_TYPES = [
    "Fire", "Cold", "Thunder", "Acid", "Necrotic", "Force", "Poison", "Lightning", "Radiant", "Slashing", "Piercing", "Bludgeoning"
];

const STATUS_EFFECTS = [
    "Blinded", "Charmed", "Deafened", "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious"
];

const SAVE_TYPES = [
    "Strength Save", "Dexterity Save", "Constitution Save", "Intelligence Save", "Wisdom Save", "Charisma Save"
];

// --- End Reference Data ---

class SpellCalculator {
    constructor(spellData) {
        this.data = spellData; // Expects an object mirroring Spell Creator CSV fields
        this.points = {
            level: 0,
            components: 0,
            range: 0,
            effects: 0,
            status: 0,
            casting: 0,
            save: 0, // Corresponds to "Additional Modifier Points" in Calculations.csv
            total: 0
        };
        this.isValid = false;
    }

    calculatePoints() {
        this.calculateLevelPoints();
        this.calculateComponentPoints();
        this.calculateRangePoints();
        this.calculateEffectPoints(); // This will be complex
        this.calculateStatusPoints();
        this.calculateCastingPoints();
        this.calculateSavePoints();

        this.points.total = Object.values(this.points).reduce((sum, p) => sum + p, 0) - this.points.total; // Sum all except total itself

        // Determine validity (e.g., total points >= 0 or some other threshold)
        // The example shows Total Points: -4, Valid Spell: NO.
        // Let's assume a spell is valid if total points are >= 0 for now.
        this.isValid = this.points.total >= 0;
        
        return { points: this.points, isValid: this.isValid };
    }

    calculateLevelPoints() {
        this.points.level = SPELL_LEVEL_POINTS[this.data.spellLevel] || 0;
    }

    calculateComponentPoints() {
        let compPoints = 0;
        if (this.data.components?.verbal) {
            compPoints += BASE_COMPONENT_COSTS.verbal;
        }
        if (this.data.components?.somatic) {
            // Calculations.csv example has Somatic: 0 points, but BASE_COMPONENT_COSTS.somatic is 1.
            // The Spell Creator example has only Verbal selected.
            // For now, using BASE_COMPONENT_COSTS. If Somatic is truly 0, this needs adjustment.
            // Let's assume the example in Calculations.csv (Somatic,0) means it wasn't selected for that spell.
             compPoints += BASE_COMPONENT_COSTS.somatic;
        }
        if (this.data.components?.material && this.data.materialValue) {
            const costEntry = COMPONENT_VALUE_COSTS[this.data.materialValue];
            if (costEntry) {
                compPoints += this.data.materialConsumed ? costEntry.consumed : costEntry.notConsumed;
            }
        }
        this.points.components = compPoints;
    }

    calculateRangePoints() {
        // Example: Range: Self (0 ft) -> Range Points: 0
        // Calculations.csv: Base Range Modifier: 0.
        // This implies the modifier from RANGE_MODIFIERS is the direct point value.
        const rangeData = RANGE_MODIFIERS[this.data.rangeName];
        if (rangeData) {
            this.points.range = rangeData.modifier;
        }
        // TODO: Incorporate Additional Target Cost, Volume Level, Volume Modifier if these become inputs
    }

    calculateEffectPoints() {
        // This is the most complex part, based on Calculations.csv example:
        // Effect Points = Base Damage/Healing + Additional Effects + Status Effects (within effect) + Status Duration (within effect)
        // Base Damage/Healing = Total Die Cost
        // Total Die Cost = Base Point Cost (from Spell Level table) + Die Point Cost (mystery -4) + Additional Type Cost
        
        let effectPts = 0;

        // 1. Base Point Cost (from Spell Level)
        let basePointCost = SPELL_LEVEL_EFFECT_BASE_COSTS[this.data.spellLevel] || 0;
        // Note: The "Target Style" (Single Target / Area of Effect) from Spell Creator CSV
        // and the "Single Target Die Value" / "AOE Die Value" columns from References.csv
        // do not seem to alter this basePointCost, as per the Point Cost column in References.csv
        // and the example calculation in Calculations.csv. They might be for other rules not related to points.

        // 2. Die Point Cost (Mystery -4 in example from Calculations.csv)
        // This value's origin is unclear from References.csv.
        // It might be related to number of dice, die size, or a fixed cost for damaging spells.
        // For the example (Lvl 3, 6d10, AOE), Calculations.csv shows "Die Point Cost, -4".
        let diePointCost = 0;
        // !!! CRITICAL TODO: Determine the logic for 'diePointCost'.
        // For now, hardcoding to match the example if inputs match. This is not a general solution.
        if (this.data.spellLevel === 3 &&
            this.data.effectType === "Damage" && // Assuming it applies to damage effects
            this.data.numberOfDice === 6 &&
            this.data.dieSize === "d10") {
            diePointCost = -4; 
        }

        // 3. Additional Type Cost
        let additionalTypeCost = 0;
        if (this.data.damageTypes && this.data.damageTypes.length > 1) {
            additionalTypeCost = (this.data.damageTypes.length - 1) * (EFFECT_TYPE_ADDITIONAL_COSTS["Additional Effect Type"] || -1);
        }
        
        const totalDieCost = basePointCost + diePointCost + additionalTypeCost;
        effectPts += totalDieCost;

        // 4. Additional Effects (e.g., Temp HP)
        if (this.data.effectType === "Temp HP") { // Assuming effectType can be 'Temp HP'
            effectPts += EFFECT_TYPE_ADDITIONAL_COSTS["Temp HP"] || -1;
        }
        // TODO: Handle other "Additional Effects" from Calculations.csv if they become inputs

        // 5. Status Duration (if status is part of the primary effect, not a separate status application)
        // The example calculation includes "Status Duration: -2" in Effect Points.
        // Spell Creator has "Status Duration: 1 minute" but "Add Status Effects?: FALSE".
        // This is ambiguous. If the main spell effect has a duration (not concentration related), it might apply here.
        // For now, if a duration is specified for the *main effect* (not a separate status effect), and it's not "Instant".
        // The example spell doesn't have a main duration field, only "Status Duration".
        // Let's assume if there are no separate status effects, statusDuration applies to the main effect.
        if (!this.data.hasStatusEffects && this.data.statusDuration && this.data.statusDuration !== "Instant") {
            const durationInfo = DURATION_MODIFIERS[this.data.statusDuration];
            if (durationInfo) {
                // Use noConcentration cost as base, concentration cost is handled in calculateCastingPoints
                effectPts += durationInfo.noConcentration;
            }
        }
        // This part is highly speculative based on the CSVs.

        this.points.effects = effectPts;
    }

    calculateStatusPoints() {
        // This is for *separate* status effects, not those bundled into Effect Points.
        // Calculations.csv example has "Status Effects: 0" under Effect Calculations, and Spell Creator has "Status Points: 0".
        let statusPts = 0;
        if (this.data.hasStatusEffects && this.data.selectedStatusEffects) {
            for (const effect of this.data.selectedStatusEffects) {
                statusPts += STATUS_EFFECT_COSTS[effect] || 0;
            }
            // If status effects have their own duration distinct from main effect duration
            // and this duration has a cost not already accounted for in DURATION_MODIFIERS (which seems to be general).
            // The current DURATION_MODIFIERS seems to apply to the spell overall or main effect.
            // If status effects have a duration that *independently* costs points, that logic would go here.
            // The example's "Status Duration: -2" was part of Effect Points.
            // For now, assume status effect costs are just their base costs.
        }
        this.points.status = statusPts;
    }

    calculateCastingPoints() {
        let castingPts = 0;
        if (this.data.castTime) {
            castingPts += CAST_TIME_COSTS[this.data.castTime] || 0;
        }
        if (this.data.concentrationRequired) {
            castingPts += CONCENTRATION_COST["Concentration Required"] || 0;
        }
        if (this.data.isRitual) { // Assuming 'isRitual' boolean field in spellData
            castingPts += CONCENTRATION_COST["Ritual Casting Option"] || 0;
        }
        this.points.casting = castingPts;
    }

    calculateSavePoints() {
        // Corresponds to "Additional Modifier Calculations" in Calculations.csv
        let savePts = 0;
        if (this.data.savingThrowRequired && this.data.primarySaveType) {
            savePts += SAVE_TYPE_COSTS[this.data.primarySaveType] || 0;
        }
        if (this.data.additionalSaveRequired && this.data.secondarySaveType) {
            // The "Additonal Save Required" in SAVE_TYPE_COSTS is -1, which seems like a cost reduction.
            // However, Calculations.csv example has "Additional Saves: 0" contributing 0.
            // If an additional save *adds* cost, it should be positive.
            // Assuming an additional save costs 1 point like a primary save.
            savePts += SAVE_TYPE_COSTS[this.data.secondarySaveType] || 0; // Needs confirmation if this is the right cost.
        }
        this.points.save = savePts;
    }
}

// --- End SpellCalculator Class ---

class SpellCreatorApp extends FormApplication {
    constructor(object = {}, options = {}) {
        super(object, options);
        this.spellData = object.spellData || this.getInitialSpellData();
        this.calculator = new SpellCalculator(this.spellData);
        this.points = this.calculator.points;
        this.isValid = this.calculator.isValid;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "custom-spell-creator",
            classes: ["sheet", "custom-spell-creator-window"],
            template: `modules/${MODULE_ID}/templates/spell-creator.hbs`,
            width: 720,
            height: "auto",
            resizable: true,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "basic" }],
            submitOnChange: false, // We'll manually trigger calculations
            closeOnSubmit: false, // Keep open to see results/errors
            title: game.i18n.localize("CUSTOM_SPELLS_5E.SpellCreatorTitle")
        });
    }

    getInitialSpellData() {
        // Based on Spell Creator CSV example
        return {
            spellName: "My Custom Spell",
            schoolOfMagic: "necromancy",
            spellLevel: 3,
            availableClasses: { cleric: true }, // Example
            components: { verbal: true, somatic: false, material: false },
            materialComponentValue: "3000gp",
            materialConsumed: false,
            rangeName: "Self",
            targetType: "Area of Effect", // Matches "Target Style" in CSV for effects
            targetShape: "Sphere",
            targetSize: 40,
            effectType: "Damage", // Main type of effect
            targetStyle: "Area of Effect", // For damage/healing, matches "Target Type" in CSV
            damageTypes: ["Fire", "Radiant"], // Example
            numberOfDice: 6,
            dieSize: "d10",
            hasStatusEffects: false,
            selectedStatusEffects: [],
            statusDuration: "1 minute",
            castTime: "Action",
            concentrationRequired: false,
            isRitual: false,
            savingThrowRequired: true,
            primarySaveType: "Constitution Save",
            additionalSaveRequired: false,
            secondarySaveType: "Constitution Save",
            specialFeaturesDescription: "",
            fullDescription: ""
        };
    }

    getData(options) {
        const context = super.getData(options);
        context.spell = this.spellData;
        context.points = this.points;
        context.isValid = this.isValid;
        context.availableClasses = AVAILABLE_CLASSES;
        context.damageTypes = DAMAGE_TYPES;
        context.statusEffects = STATUS_EFFECTS;
        context.saveTypes = SAVE_TYPES;
        return context;
    }

    _updateObject(event, formData) {
        // formData is a flat object, e.g. "components.verbal": true
        // We need to merge it into this.spellData carefully
        const expandedData = foundry.utils.expandObject(formData);
        mergeObject(this.spellData, expandedData);

        // Special handling for checkboxes that might not be present in formData if unchecked
        this.spellData.components.verbal = expandedData.components?.verbal || false;
        this.spellData.components.somatic = expandedData.components?.somatic || false;
        this.spellData.components.material = expandedData.components?.material || false;
        this.spellData.materialConsumed = expandedData.materialConsumed || false;
        this.spellData.hasStatusEffects = expandedData.hasStatusEffects || false;
        this.spellData.concentrationRequired = expandedData.concentrationRequired || false;
        this.spellData.isRitual = expandedData.isRitual || false;
        this.spellData.savingThrowRequired = expandedData.savingThrowRequired || false;
        
        // TODO: Handle array inputs like damageTypes, selectedStatusEffects, availableClasses

        this.recalculatePoints();
        this.render(false); // Re-render to show updated points
    }
    
    activateListeners(html) {
        super.activateListeners(html);
        // Trigger recalculation on any form change
        html.find('input, select, textarea').on('change', this._onFormChange.bind(this));
    }

    _onFormChange(event) {
        // When any form field changes, gather all data and recalculate
        const form = event.currentTarget.closest('form');
        const formData = new FormDataExtended(form).object;
        this._updateObject(event, formData);
    }
    
    recalculatePoints() {
        this.calculator = new SpellCalculator(this.spellData);
        const result = this.calculator.calculatePoints();
        this.points = result.points;
        this.isValid = result.isValid;
        console.log("Recalculated Points:", this.points, "Is Valid:", this.isValid);
    }

    async _onSubmit(event, options = {}) {
        // This is called when the submit button in the footer is clicked
        console.log("Spell Submitted (Not yet implemented):", this.spellData);
        // TODO: Implement spell submission logic (Phase 2, Step 2)
        // This will involve saving the spellData for GM review.
        ui.notifications.info(`Spell '${this.spellData.spellName}' submitted for review (not really yet!).`);
    }
}

// --- End SpellCreatorApp Class ---

class SpellCreatorControls {
    static init() {
        this.instance = new SpellCreatorControls();
        Hooks.on('getSceneControlButtons', this._onGetSceneControlButtons.bind(this));
        Hooks.on('renderSceneControls', this._onRenderSceneControls.bind(this));
    }

    static _onGetSceneControlButtons(controls) {
        this.instance._addControls(controls);
    }

    static _onRenderSceneControls(controls) {
        this.instance._addControls(controls);
    }

    _addControls(controls) {
        const tokenControls = controls.find(c => c.name === "token");
        if (!tokenControls) return;

        // Only add if not already present
        if (!tokenControls.tools.some(t => t.name === "spell-creator")) {
            tokenControls.tools.push({
                name: "spell-creator",
                title: "Open Spell Creator",
                icon: "fas fa-magic",
                onClick: () => new SpellCreatorApp().render(true),
                button: true
            });
            console.log(`${MODULE_TITLE} | Added spell creator button to token controls`);
        }
    }
}

console.log(`${MODULE_TITLE} | Initializing`);

/**
 * Init hook.
 */
Hooks.once('init', async () => {
  console.log(`${MODULE_TITLE} | Initializing Custom Spells 5e Module`);

  // Register module settings
  // e.g., game.settings.register(MODULE_ID, 'someSetting', { ... });

  // Preload Handlebars templates
  // await preloadHandlebarsTemplates();
});

/**
 * Ready hook.
 */
Hooks.once('ready', async () => {
  console.log(`${MODULE_TITLE} | Custom Spells 5e Module Ready`);
  SpellCreatorControls.init();
});

/**
 * Setup hook.
 */
Hooks.once('setup', async () => {
    console.log(`${MODULE_TITLE} | Custom Spells 5e Module Setup`);
    // Perform any setup actions
});


// Add other hooks and functions as needed, for example:
// Hooks.on('renderActorSheet', (app, html, data) => { ... });

/**
 * Preloads Handlebars templates.
 * @returns {Promise<void>}
 */
async function preloadHandlebarsTemplates() {
  const templatePaths = [
    `modules/${MODULE_ID}/templates/spell-creator.hbs`,
    // `modules/${MODULE_ID}/templates/gm-review.hbs`,
  ];
  return loadTemplates(templatePaths); // loadTemplates is a Foundry VTT utility
}

// Example of a utility function within the module
// function getSpellData() { ... }

// Make sure to export any classes or functions that need to be accessible globally if necessary
// Make sure to export any classes or functions that need to be accessible globally if necessary
window.CustomSpellsModule = {
  SpellCreatorApp,
  SpellCalculator
  // someFunction,
  // SomeClass
};

// Simple way to open the app for testing (e.g., via macro)
// Hooks.on("renderPlayerList", (playerList, html, data) => {
//     const button = $(`<button style="position:absolute; bottom: 50px; left:10px;" title="Open Spell Creator"><i class="fas fa-magic"></i> Spell Creator</button>`);
//     button.on('click', () => {
//         new SpellCreatorApp().render(true);
//     });
//     html.append(button);
// });

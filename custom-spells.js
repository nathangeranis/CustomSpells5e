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
    "⅛ Mile": { distance: 660, modifier: 4 },
    "¼ Mile": { distance: 1320, modifier: 5 },
    "½ Mile": { distance: 2640, modifier: 6 },
    "1 Mile": { distance: 5280, modifier: 7 }
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
    "1 minute": { noConcentration: -2, concentration: 2 }, // CSV shows "Point Modifier" -2 for 1 minute, and "Concentration Required" cost 2
    "10 minutes": { noConcentration: -2, concentration: 2 },
    "1 hour": { noConcentration: -3, concentration: 2 },
    "8 hours": { noConcentration: -4, concentration: 2 }, // CSV shows "8-12 hours" as 4 points in "Point Cost" column for "Cast Time" table section. This is confusing.
                                                          // Sticking to "Duration" table for now.
    "24 hours": { noConcentration: -5, concentration: 2 },
    "Permanent": { noConcentration: -10, concentration: 2 }
};

const CONCENTRATION_COST = { // From "Modification Type" table
    "Concentration Required": 2, // If spell is concentration
    "Ritual Casting Option": 1 // If spell can be cast as ritual
};

// Base point cost for spell effects, derived from "Spell Level ... Point Cost" table in References.csv
const SPELL_LEVEL_EFFECT_BASE_COSTS = {
    0: -1, 1: -2, 2: -4, 3: -6, 4: -8, 5: -10, 6: -12, 7: 14, 8: -16, 9: -18
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

        // Determine validity (e.g., total points are >= 0 or some other threshold)
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
        
        let effectPts = 0;

        // 1. Base Point Cost (from Spell Level)
        let basePointCost = SPELL_LEVEL_EFFECT_BASE_COSTS[this.data.spellLevel] || 0;

        // 2. Die Point Cost (Mystery -4 in example from Calculations.csv)
        let diePointCost = 0;
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

        // 5. Status Duration (if status is part of the primary effect, not a separate status application)
        if (!this.data.hasStatusEffects && this.data.statusDuration && this.data.statusDuration !== "Instant") {
            const durationInfo = DURATION_MODIFIERS[this.data.statusDuration];
            if (durationInfo) {
                effectPts += durationInfo.noConcentration;
            }
        }

        this.points.effects = effectPts;
    }

    calculateStatusPoints() {
        let statusPts = 0;
        if (this.data.hasStatusEffects && this.data.selectedStatusEffects) {
            for (const effect of this.data.selectedStatusEffects) {
                statusPts += STATUS_EFFECT_COSTS[effect] || 0;
            }
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
        let savePts = 0;
        if (this.data.savingThrowRequired && this.data.primarySaveType) {
            savePts += SAVE_TYPE_COSTS[this.data.primarySaveType] || 0;
        }
        if (this.data.additionalSaveRequired && this.data.secondarySaveType) {
            savePts += SAVE_TYPE_COSTS[this.data.secondarySaveType] || 0;
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
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "custom-spell-creator",
            classes: ["sheet", "custom-spell-creator-window"],
            template: `modules/${MODULE_ID}/templates/spell-creator.hbs`,
            width: 900,
            height: 700,
            resizable: true,
            minWidth: 800,
            minHeight: 600,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "basic" }],
            submitOnChange: false,
            closeOnSubmit: false,
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
        
        // Add option arrays for selectOptions
        context.schools = [
            {value: "abjuration", label: "Abjuration"},
            {value: "conjuration", label: "Conjuration"},
            {value: "divination", label: "Divination"},
            {value: "enchantment", label: "Enchantment"},
            {value: "illusion", label: "Illusion"},
            {value: "necromancy", label: "Necromancy"},
            {value: "transmutation", label: "Transmutation"}
        ];
        
        context.ranges = [
            {value: "Self", label: "Self"},
            {value: "Touch", label: "Touch"},
            {value: "Close", label: "Close (15 ft)"},
            {value: "Medium", label: "Medium (60 ft)"},
            {value: "Long", label: "Long (90 ft)"},
            {value: "Extended", label: "Extended (120 ft)"},
            {value: "Far", label: "Far (150 ft)"},
            {value: "Distant", label: "Distant (300 ft)"},
            {value: "⅛ Mile", label: "⅛ Mile (660 ft)"},
            {value: "¼ Mile", label: "¼ Mile (1320 ft)"},
            {value: "½ Mile", label: "½ Mile (2640 ft)"},
            {value: "1 Mile", label: "1 Mile (5280 ft)"}
        ];
        
        context.targetStyles = [
            {value: "Single Target", label: "Single Target"},
            {value: "Area of Effect", label: "Area of Effect"}
        ];
        
        context.dieSizes = [
            {value: "d4", label: "d4"},
            {value: "d6", label: "d6"},
            {value: "d8", label: "d8"},
            {value: "d10", label: "d10"},
            {value: "d12", label: "d12"}
        ];
        
        context.castTimes = [
            {value: "Action", label: "Action"},
            {value: "Bonus Action", label: "Bonus Action"},
            {value: "Reaction", label: "Reaction"},
            {value: "1 minute", label: "1 minute"},
            {value: "10 minutes", label: "10 minutes"},
            {value: "1 hour", label: "1 hour"}
        ];
        
        return context;
    }

    _updateObject(event, formData) {
        // formData is a flat object, e.g. "components.verbal": true
        // We need to merge it into this.spellData carefully
        const expandedData = foundry.utils.expandObject(formData);
        foundry.utils.mergeObject(this.spellData, expandedData);

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
        
        // Wizard step navigation
        html.find('.wizard-steps .step').on('click', this._onStepClick.bind(this));
        html.find('[data-action="next"]').on('click', this._onNextStep.bind(this));
        html.find('[data-action="prev"]').on('click', this._onPrevStep.bind(this));

        // Form change handling
        html.find('input, select, textarea').on('change', this._onFormChange.bind(this));
        
        // Initialize first step
        this._setActiveStep('basic');
    }

    _onStepClick(event) {
        const step = event.currentTarget.dataset.step;
        if (this._validateCurrentStep()) {
            this._setActiveStep(step);
        }
    }

    _onNextStep() {
        const steps = ['basic', 'components', 'range', 'effects', 'casting', 'review'];
        const currentIndex = steps.indexOf(this.currentStep);
        if (currentIndex < steps.length - 1 && this._validateCurrentStep()) {
            this._setActiveStep(steps[currentIndex + 1]);
        }
    }

    _onPrevStep() {
        const steps = ['basic', 'components', 'range', 'effects', 'casting', 'review'];
        const currentIndex = steps.indexOf(this.currentStep);
        if (currentIndex > 0) {
            this._setActiveStep(steps[currentIndex - 1]);
        }
    }

    _setActiveStep(step) {
        this.currentStep = step;
        
        // Update UI
        this.element.find('.wizard-steps .step').removeClass('active');
        this.element.find(`.wizard-steps .step[data-step="${step}"]`).addClass('active');
        
        // Show/hide content sections
        this.element.find('.wizard-content > div').addClass('hidden');
        this.element.find(`.wizard-content .${step}`).removeClass('hidden').addClass('active');
        
        // Update navigation buttons
        const steps = ['basic', 'components', 'range', 'effects', 'casting', 'review'];
        const currentIndex = steps.indexOf(step);
        
        this.element.find('[data-action="prev"]').toggleClass('hidden', currentIndex === 0);
        this.element.find('[data-action="next"]').toggleClass('hidden', currentIndex === steps.length - 1);
        this.element.find('[data-action="submit"]').toggleClass('hidden', currentIndex !== steps.length - 1);
    }

    _validateCurrentStep() {
        // Basic validation for current step
        switch(this.currentStep) {
            case 'basic':
                return !!this.spellData.spellName && !!this.spellData.spellLevel;
            case 'components':
                return this.spellData.components.verbal || 
                       this.spellData.components.somatic || 
                       this.spellData.components.material;
            default:
                return true;
        }
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
        try {
            // Load current spell database
            const dbPath = `modules/${MODULE_ID}/packs/custom-spells.db`;
            let spellDB = await fetch(dbPath).then(r => r.json());
            
            // Add submission metadata
            const submission = {
                spellData: this.spellData,
                points: this.points,
                submittedBy: game.user.id,
                submittedAt: new Date().toISOString(),
                status: "pending",
                reviewedBy: null,
                reviewedAt: null
            };

            // Add to pending queue
            spellDB.pendingSpells.push(submission);

            // Save updated database
            await FilePicker.upload("data", dbPath, 
                new File([JSON.stringify(spellDB, null, 2)], "custom-spells.db", {type: "application/json"}));

            ui.notifications.info(`Spell '${this.spellData.spellName}' submitted for GM review!`);
            this.close();
        } catch (err) {
            console.error("Error submitting spell:", err);
            ui.notifications.error("Failed to submit spell for review");
        }
    }
}

// --- End SpellCreatorApp Class ---

class SpellReviewApp extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "custom-spell-review",
            title: "Spell Review Queue",
            template: `modules/${MODULE_ID}/templates/spell-review.hbs`,
            width: 800,
            height: 600,
            resizable: true
        });
    }

    async getData(options) {
        const dbPath = `modules/${MODULE_ID}/packs/custom-spells.db`;
        const spellDB = await fetch(dbPath).then(r => r.json());
        
        // Map user IDs to names
        const pendingWithNames = spellDB.pendingSpells.map(spell => {
            const user = game.users.get(spell.submittedBy);
            return {
                ...spell,
                submittedBy: user ? user.name : 'Unknown'
            };
        });

        return {
            pendingSpells: pendingWithNames
        };
    }

    activateListeners(html) {
        html.find('.approve-spell').on('click', this._onApprove.bind(this));
        html.find('.deny-spell').on('click', this._onDeny.bind(this));
        html.find('.request-changes').on('click', this._onRequestChanges.bind(this));
    }

    async _onApprove(event) {
        const item = $(event.currentTarget).closest('.spell-review-item');
        await this._updateSpellStatus(item.data('id'), 'approved');
    }

    async _onDeny(event) {
        const item = $(event.currentTarget).closest('.spell-review-item');
        await this._updateSpellStatus(item.data('id'), 'denied');
    }

    async _onRequestChanges(event) {
        const item = $(event.currentTarget).closest('.spell-review-item');
        await this._updateSpellStatus(item.data('id'), 'changes-requested');
    }

    async _updateSpellStatus(index, status) {
        try {
            const dbPath = `modules/${MODULE_ID}/packs/custom-spells.db`;
            let spellDB = await fetch(dbPath).then(r => r.json());
            
            // Update spell status
            const spell = spellDB.pendingSpells[index];
            spell.status = status;
            spell.reviewedBy = game.user.id;
            spell.reviewedAt = new Date().toISOString();

            // Move to appropriate list
            spellDB.pendingSpells.splice(index, 1);
            if (status === 'approved') {
                spellDB.approvedSpells.push(spell);
                 await this._addSpellToCompendiumAndPlayer(spell.spellData);
            } else if (status === 'denied') {
                spellDB.deniedSpells.push(spell);
            } else {
                // For changes requested, keep in pending but mark status
                spellDB.pendingSpells.push(spell);
            }

            // Save updated database
            await FilePicker.upload("data", dbPath, 
                new File([JSON.stringify(spellDB, null, 2)], "custom-spells.db", {type: "application/json"}));

            ui.notifications.info(`Spell ${status.replace('-', ' ')} successfully`);
            this.render(true); // Refresh the view
        } catch (err) {
            console.error("Error updating spell status:", err);
            ui.notifications.error("Failed to update spell status");
        }
    }

    async _addSpellToCompendiumAndPlayer(spellData) {
        try {
            // Get the compendium
            const compendiumName = 'custom-spells-5e.custom-spells-compendium';
            const compendium = game.packs.get(compendiumName);

            if (!compendium) {
                console.error(`Compendium ${compendiumName} not found`);
                ui.notifications.error(`Compendium ${compendiumName} not found`);
                return;
            }

            // Create the item
            const itemData = {
                name: spellData.spellName,
                type: 'spell',
                img: 'icons/svg/magic.svg', // Default icon
                data: spellData,
                flags: {
                    [MODULE_ID]: {
                        customSpell: true
                    }
                }
            };

            // Create the item in the compendium
            const item = await Item.create(itemData, { compendium: compendium.collection });
            console.log(`Created spell item ${item.name} in compendium`);

            // Add to player's character sheet (first player for simplicity)
            const player = game.users.find(u => u.isGM).character; // Find the first GM's character
            if (player) {
                await player.createEmbeddedDocuments('Item', [itemData]);
                ui.notifications.info(`Added spell ${item.name} to player ${player.name}`);
            } else {
                console.warn('No player character found to add the spell to.');
                ui.notifications.warn('No player character found to add the spell to.');
            }

        } catch (err) {
            console.error("Error adding spell to compendium and player:", err);
            ui.notifications.error("Failed to add spell to compendium and player");
        }
    }
}

class SpellCreatorControls {
    static setControlHooks() {
        Hooks.on("getSceneControlButtons", (controls, b, c) => {
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
    };
}

console.log(`${MODULE_TITLE} | Initializing`);

SpellCreatorControls.setControlHooks();
/**
 * Init hook.
 */
Hooks.on('init', () => {
  console.log(`${MODULE_TITLE} | Initializing Custom Spells 5e Module`);
});

Hooks.on("ready", () => {
  // Register module settings
  // e.g., game.settings.register(MODULE_ID, 'someSetting', { ... });
});

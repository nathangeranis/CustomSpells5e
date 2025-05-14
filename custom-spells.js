// [Previous content remains exactly the same until SpellCreatorApp class]

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
            submitOnChange: false,
            closeOnSubmit: false,
            title: game.i18n.localize("CUSTOM_SPELLS_5E.SpellCreatorTitle")
        });
    }

    getInitialSpellData() {
        return {
            spellName: "My Custom Spell",
            schoolOfMagic: "necromancy",
            spellLevel: 3,
            availableClasses: { cleric: true },
            components: { verbal: true, somatic: false, material: false },
            materialComponentValue: "3000gp",
            materialConsumed: false,
            rangeName: "Self",
            targetType: "Area of Effect",
            targetShape: "Sphere",
            targetSize: 40,
            effectType: "Damage",
            targetStyle: "Area of Effect",
            damageTypes: ["Fire", "Radiant"],
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

    parseArrayInput(input) {
        if (!input) return [];
        if (Array.isArray(input)) return input;
        return [input];
    }

    parseClassInput(formData) {
        const classes = {};
        for (const cls of AVAILABLE_CLASSES) {
            classes[cls.toLowerCase()] = !!formData[`availableClasses.${cls}`];
        }
        return classes;
    }

    _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);
        mergeObject(this.spellData, expandedData);

        // Handle checkboxes
        this.spellData.components.verbal = expandedData.components?.verbal || false;
        this.spellData.components.somatic = expandedData.components?.somatic || false;
        this.spellData.components.material = expandedData.components?.material || false;
        this.spellData.materialConsumed = expandedData.materialConsumed || false;
        this.spellData.hasStatusEffects = expandedData.hasStatusEffects || false;
        this.spellData.concentrationRequired = expandedData.concentrationRequired || false;
        this.spellData.isRitual = expandedData.isRitual || false;
        this.spellData.savingThrowRequired = expandedData.savingThrowRequired || false;
        
        // Handle array inputs
        this.spellData.damageTypes = this.parseArrayInput(formData["damageTypes[]"]);
        this.spellData.selectedStatusEffects = this.parseArrayInput(formData["selectedStatusEffects[]"]);
        this.spellData.availableClasses = this.parseClassInput(formData);

        this.recalculatePoints();
        this.render(false);
    }
    
    activateListeners(html) {
        super.activateListeners(html);
        html.find('input, select, textarea').on('change', this._onFormChange.bind(this));
    }

    _onFormChange(event) {
        const form = event.currentTarget.closest('form');
        const formData = new FormDataExtended(form).object;
        this._updateObject(event, formData);
    }
    
    recalculatePoints() {
        this.calculator = new SpellCalculator(this.spellData);
        const result = this.calculator.calculatePoints();
        this.points = result.points;
        this.isValid = result.isValid;
    }

    async _onSubmit(event, options = {}) {
        ui.notifications.info(`Spell '${this.spellData.spellName}' submitted for review`);
    }
}

// [Rest of the file remains exactly the same]

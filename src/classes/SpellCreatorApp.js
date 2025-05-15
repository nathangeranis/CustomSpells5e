import { SpellCalculator } from './SpellCalculator.js';
import * as REF from '../data/reference-data.js';

export class SpellCreatorApp extends FormApplication {
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
            template: `modules/${REF.MODULE_ID}/templates/spell-creator.hbs`,
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
        return {
            classes: REF.AVAILABLE_CLASSES,
            damageTypes: REF.DAMAGE_TYPES,
            statusEffects: REF.STATUS_EFFECTS,
            saveTypes: REF.SAVE_TYPES
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        // Form submission handler
        html.find('button[type="submit"]').click(this._onSubmit.bind(this));
        
        // Recalculate points when form changes
        html.find('input, select').change(this._onFormChange.bind(this));
    }

    async _onSubmit(event) {
        event.preventDefault();
        const formData = this._getSubmitData();
        this.spellData = foundry.utils.mergeObject(this.spellData, formData);
        
        // Calculate points and validate
        const { points, isValid } = this.calculator.calculatePoints();
        this.points = points;
        this.isValid = isValid;
        
        if (this.isValid) {
            await this._submitSpellForReview();
            this.close();
        } else {
            ui.notifications.error("Invalid spell configuration - please adjust your selections");
        }
    }

    _onFormChange(event) {
        const formData = this._getSubmitData();
        this.spellData = foundry.utils.mergeObject(this.spellData, formData);
        const { points } = this.calculator.calculatePoints();
        this.points = points;
        this.render();
    }

    async _submitSpellForReview() {
        const spellData = {
            ...this.spellData,
            submittedBy: game.user.id,
            submissionDate: new Date().toISOString(),
            status: "pending"
        };

        // Save to custom spells DB
        const dbPath = `modules/${REF.MODULE_ID}/packs/custom-spells.db`;
        let spellDB = await fetch(dbPath).then(r => r.json());
        spellDB.pendingSpells.push(spellData);
        await fetch(dbPath, {
            method: 'POST',
            body: JSON.stringify(spellDB)
        });

        ui.notifications.info("Spell submitted for GM review");
    }

    async getData() {
        return {
            spell: this.spellData,
            points: this.points,
            isValid: this.isValid,
            config: {
                levels: Object.keys(REF.SPELL_LEVEL_POINTS),
                ranges: Object.keys(REF.RANGE_MODIFIERS),
                castingTimes: Object.keys(REF.CAST_TIME_COSTS)
            }
        };
    }
}

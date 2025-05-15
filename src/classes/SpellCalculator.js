import * as REF from '../data/reference-data.js';

export class SpellCalculator {
    constructor(spellData) {
        this.data = spellData;
        this.points = {
            level: 0,
            components: 0,
            range: 0,
            effects: 0,
            status: 0,
            casting: 0,
            save: 0,
            total: 0
        };
        this.isValid = false;
    }

    calculatePoints() {
        this.calculateLevelPoints(REF.SPELL_LEVEL_POINTS);
        this.calculateComponentPoints(REF.COMPONENT_VALUE_COSTS, REF.BASE_COMPONENT_COSTS);
        this.calculateRangePoints(REF.RANGE_MODIFIERS);
        this.calculateEffectPoints(REF.SPELL_LEVEL_EFFECT_BASE_COSTS, REF.EFFECT_TYPE_ADDITIONAL_COSTS);
        this.calculateStatusPoints(REF.STATUS_EFFECT_COSTS);
        this.calculateCastingPoints(REF.CAST_TIME_COSTS);
        this.calculateSavePoints(REF.SAVE_TYPE_COSTS);

        this.points.total = Object.values(this.points).reduce((sum, p) => sum + p, 0) - this.points.total;
        this.isValid = this.points.total >= 0;
        
        return { points: this.points, isValid: this.isValid };
    }

    calculateLevelPoints(levelPoints) {
        this.points.level = levelPoints[this.data.level] || 0;
    }

    calculateComponentPoints(valueCosts, baseCosts) {
        let total = 0;
        if (this.data.components.V) total += baseCosts.V;
        if (this.data.components.S) total += baseCosts.S;
        if (this.data.components.M) {
            total += baseCosts.M;
            if (this.data.componentValue) {
                const costData = valueCosts[this.data.componentValue];
                total += this.data.consumed ? costData.consumed : costData.notConsumed;
            }
        }
        this.points.components = total;
    }

    calculateRangePoints(rangeModifiers) {
        this.points.range = rangeModifiers[this.data.range] || 0;
    }

    calculateEffectPoints(baseCosts, typeCosts) {
        let total = baseCosts[this.data.level] || 0;
        if (this.data.effectType) {
            total += typeCosts[this.data.effectType] || 0;
        }
        this.points.effects = total;
    }

    calculateStatusPoints(statusCosts) {
        this.points.status = this.data.statusEffects
            ? this.data.statusEffects.reduce((sum, effect) => sum + (statusCosts[effect] || 0), 0)
            : 0;
    }

    calculateCastingPoints(castCosts) {
        this.points.casting = castCosts[this.data.castingTime] || 0;
        if (this.data.concentration) {
            this.points.casting += REF.CONCENTRATION_COST;
        }
    }

    calculateSavePoints(saveCosts) {
        this.points.save = this.data.saveType 
            ? saveCosts[this.data.saveType.split(' ')[0]] || 0 
            : 0;
    }
}

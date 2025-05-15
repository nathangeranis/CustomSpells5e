// Reference data for Custom Spells 5e module
export const MODULE_ID = 'custom-spells-5e';
export const MODULE_TITLE = 'Custom Spells 5e';

export const SPELL_LEVEL_POINTS = {
    0: 1, 1: 3, 2: 5, 3: 7, 4: 9, 5: 11, 6: 13, 7: 15, 8: 17, 9: 19
};

export const COMPONENT_VALUE_COSTS = {
    "5gp": { notConsumed: 0.5, consumed: 1 },
    "10gp": { notConsumed: 1, consumed: 2 },
    "25gp": { notConsumed: 2, consumed: 4 },
    "50gp": { notConsumed: 3, consumed: 6 },
    "100gp": { notConsumed: 4, consumed: 8 },
    "250gp": { notConsumed: 5, consumed: 10 },
    "500gp": { notConsumed: 6, consumed: 12 },
    "1000gp": { notConsumed: 8, consumed: 16 }
};

export const BASE_COMPONENT_COSTS = {
    "V": 0.5,
    "S": 1,
    "M": 2
};

export const RANGE_MODIFIERS = {
    "Self": 0,
    "Touch": 1,
    "30 feet": 2,
    "60 feet": 3,
    "120 feet": 4
};

export const STATUS_EFFECT_COSTS = {
    "Blinded": 2,
    "Charmed": 2,
    "Deafened": 1,
    "Frightened": 2,
    "Grappled": 2,
    "Incapacitated": 3,
    "Invisible": 3,
    "Paralyzed": 4,
    "Petrified": 5,
    "Poisoned": 2,
    "Prone": 1,
    "Restrained": 2,
    "Stunned": 3,
    "Unconscious": 4
};

export const DURATION_MODIFIERS = {
    "Instantaneous": 0,
    "1 round": 1,
    "1 minute": 2,
    "10 minutes": 3,
    "1 hour": 4,
    "8 hours": 5,
    "24 hours": 6,
    "7 days": 7,
    "30 days": 8
};

export const CONCENTRATION_COST = 2;

export const SPELL_LEVEL_EFFECT_BASE_COSTS = {
    0: 1, 1: 3, 2: 5, 3: 7, 4: 9, 5: 11, 6: 13, 7: 15, 8: 17, 9: 19
};

export const EFFECT_TYPE_ADDITIONAL_COSTS = {
    "Damage": 1,
    "Healing": 1,
    "Buff": 2,
    "Debuff": 2,
    "Summon": 3,
    "Teleport": 3,
    "Utility": 1
};

export const SAVE_TYPE_COSTS = {
    "Strength": 1,
    "Dexterity": 1,
    "Constitution": 1,
    "Intelligence": 1,
    "Wisdom": 1,
    "Charisma": 1
};

export const CAST_TIME_COSTS = {
    "1 action": 0,
    "1 bonus action": 1,
    "1 reaction": 1,
    "1 minute": 2,
    "10 minutes": 3,
    "1 hour": 4,
    "8 hours": 5
};

export const AVAILABLE_CLASSES = [
    "Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"
];

export const DAMAGE_TYPES = [
    "Fire", "Cold", "Thunder", "Acid", "Necrotic", "Force", "Poison", "Lightning", "Radiant", "Slashing", "Piercing", "Bludgeoning"
];

export const STATUS_EFFECTS = [
    "Blinded", "Charmed", "Deafened", "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious"
];

export const SAVE_TYPES = [
    "Strength Save", "Dexterity Save", "Constitution Save", "Intelligence Save", "Wisdom Save", "Charisma Save"
];

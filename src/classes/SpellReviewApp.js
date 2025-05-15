import * as REF from '../data/reference-data.js';

export class SpellReviewApp extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "custom-spell-review",
            title: "Spell Review Queue",
            template: `modules/${REF.MODULE_ID}/templates/spell-review.hbs`,
            width: 800,
            height: 600,
            resizable: true
        });
    }

    async getData(options) {
        const dbPath = `modules/${REF.MODULE_ID}/packs/custom-spells.db`;
        const spellDB = await fetch(dbPath).then(r => r.json());
        
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
        super.activateListeners(html);
        
        // Approve/Reject buttons
        html.find('.approve-spell').click(this._onApproveSpell.bind(this));
        html.find('.reject-spell').click(this._onRejectSpell.bind(this));
    }

    async _onApproveSpell(event) {
        const spellId = event.currentTarget.dataset.spellId;
        const dbPath = `modules/${REF.MODULE_ID}/packs/custom-spells.db`;
        let spellDB = await fetch(dbPath).then(r => r.json());
        
        // Find and approve spell
        const spellIndex = spellDB.pendingSpells.findIndex(s => s.id === spellId);
        if (spellIndex >= 0) {
            const approvedSpell = {
                ...spellDB.pendingSpells[spellIndex],
                status: "approved",
                approvedBy: game.user.id,
                approvalDate: new Date().toISOString()
            };

            // Move to approved spells
            spellDB.pendingSpells.splice(spellIndex, 1);
            spellDB.approvedSpells.push(approvedSpell);

            // Save updated DB
            await fetch(dbPath, {
                method: 'POST',
                body: JSON.stringify(spellDB)
            });

            // Add to compendium
            await this._addToCompendium(approvedSpell);
            
            ui.notifications.info(`Spell "${approvedSpell.name}" approved`);
            this.render();
        }
    }

    async _onRejectSpell(event) {
        const spellId = event.currentTarget.dataset.spellId;
        const dbPath = `modules/${REF.MODULE_ID}/packs/custom-spells.db`;
        let spellDB = await fetch(dbPath).then(r => r.json());
        
        // Find and reject spell
        const spellIndex = spellDB.pendingSpells.findIndex(s => s.id === spellId);
        if (spellIndex >= 0) {
            const rejectedSpell = {
                ...spellDB.pendingSpells[spellIndex],
                status: "rejected",
                rejectedBy: game.user.id,
                rejectionDate: new Date().toISOString()
            };

            // Move to rejected spells
            spellDB.pendingSpells.splice(spellIndex, 1);
            spellDB.rejectedSpells.push(rejectedSpell);

            // Save updated DB
            await fetch(dbPath, {
                method: 'POST',
                body: JSON.stringify(spellDB)
            });

            ui.notifications.info(`Spell "${rejectedSpell.name}" rejected`);
            this.render();
        }
    }

    async _addToCompendium(spellData) {
        const pack = game.packs.get(`${REF.MODULE_ID}.custom-spells`);
        if (pack) {
            await pack.createEntity(spellData);
        }
    }
}

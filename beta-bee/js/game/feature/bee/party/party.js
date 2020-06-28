ig.module("game.feature.bee.party.party").requires("game.feature.party.party").defines(function() {
    function addEnumValue(instance, name) {

        if (instance[name] !== undefined) {
            return instance[name];
        }

        // find the highest value
        let max = 0;
        for (const value in instance) {
            max = Math.max(max, instance[value]);
        }

        // make it higher
        ++max;
        instance[name] = max;
        return max;
    }

    const NO = !1;
    sc.PartyModel.inject({
        init: function() {
            this.parent();
            addEnumValue(sc.PARTY_MSG, 'SET_MEMBERS');
            addEnumValue(sc.PARTY_MSG, 'ADDED_MEMBER');
            addEnumValue(sc.PARTY_MSG, 'REMOVED_MEMBER');
        },
        onMapEnter: function() {
            this.parent();
            for (const partyMember in this.partyEntities) {
                sc.Model.notifyObserver(this, sc.PARTY_MSG.ADDED_MEMBER, [partyMember, this.models[partyMember]]);
            }
        },
        addPartyMember: function(name, npcEntity, e, skipEffect, temporary) {
            const willBeAdded = !this.isPartyMember(name);
            this.parent(name, npcEntity, e, skipEffect, temporary);
            if (willBeAdded) {
                sc.Model.notifyObserver(this, sc.PARTY_MSG.ADDED_MEMBER, [name, this.models[name]]);
            }
        },
        removePartyMember: function(name, npcEntity, skipEffect) {
            if (this.isPartyMember(name)) {
                sc.Model.notifyObserver(this, sc.PARTY_MSG.REMOVED_MEMBER, [name, null]);
            }
            this.parent(name, npcEntity, skipEffect);

        }
    });

    // add civilians
    sc.PARTY_OPTIONS.push("civilian.mirabelle");
    sc.PARTY_OPTIONS.push("civilian.emilie");
});
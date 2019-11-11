ig.module("bee.party.party").requires("game.feature.party.party", "game.feature.party.party-member-model").defines(function() {
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
		addPartyMember: function(name, npcEntity, e , skipEffect, temporary) {
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

	sc.SkillTree.inject({
		overrideAutoSkills: false,
		autoSkillsOverride: [],
		autoSkill: function(skills, level, skillRanking) {
			if (this.overrideAutoSkills) {
				skills.splice(0);
				const newSkills = this.autoSkillsOverride.map((e) => this.skills[e.id]);
				skills.splice.apply(skills, [0,0].concat(newSkills));
				return;
			}
			this.parent(skills, level, skillRanking);
		}
	});
	sc.PartyMemberModel.inject({
		updateAutoEquip: function() {
			if (!sc.PLAYABLE_OPTIONS.includes(this.name)) {
				return this.parent();
			}
			return NO;
		},
		canEatSandwich: function() {
			if(!sc.PLAYABLE_OPTIONS.includes(this.name)) {
				return this.parent();
			}
			return NO;
		},
		setElementMode: function(element) {
			this.parent(element);
			sc.Model.notifyObserver(this, sc.PARTY_MEMBER_MSG.ELEMENT_MODE_CHANGE);
		}
	});
});
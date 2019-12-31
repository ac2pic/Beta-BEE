ig.module("game.feature.bee.party.party").requires("game.feature.party.party-member-model").defines(function () {

	const NO = !1;
	sc.PartyMemberModel.inject({
		updateAutoEquip: function () {
			if (!sc.PLAYABLE_OPTIONS.includes(this.name)) {
				return this.parent();
			}
			return NO;
		},
		canEatSandwich: function () {
			if (!sc.PLAYABLE_OPTIONS.includes(this.name)) {
				return this.parent();
			}
			return NO;
		},
		setElementMode: function (element) {
			this.parent(element);
			sc.Model.notifyObserver(this, sc.PARTY_MEMBER_MSG.ELEMENT_MODE_CHANGE);
		}
	});
});
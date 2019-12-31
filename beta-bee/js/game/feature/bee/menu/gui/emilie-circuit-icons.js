ig.module("game.feature.bee.menu.gui.emilie-circuit-icons").requires("game.feature.menu.gui.status.status-view-combat-arts",
	"game.feature.menu.gui.circuit.circuit-effect-display", "game.main").defines(function () {

	const EmilieCircuitIcons = ig.Class.extend({
		init: function () {
			this.model = sc.model.player;
			sc.Model.addObserver(this.model, this);
		},
		modelChanged: function (object, event) {
			if (object === this.model) {
				if (event === sc.PLAYER_MSG.CONFIG_CHANGED) {
					if (this.model.name === 'Emilie') {
						sc.CircuitTreeDetail.Node.inject({
							icons: new ig.Image("media/gui/circuit-icons-emilie.png")
						});
						sc.CircuitSwapBranchesInfoBox.Skill.inject({
							icons: new ig.Image("media/gui/circuit-icons-emilie.png")
						});
						sc.StatusViewCombatArtsEntry.inject({
							skillIcons: new ig.Image("media/gui/circuit-icons-emilie.png")
						});
					} else {
						sc.CircuitTreeDetail.Node.inject({
							icons: new ig.Image("media/gui/circuit-icons.png")
						});
						sc.CircuitSwapBranchesInfoBox.Skill.inject({
							icons: new ig.Image("media/gui/circuit-icons.png")
						});
						sc.StatusViewCombatArtsEntry.inject({
							skillIcons: new ig.Image("media/gui/circuit-icons.png")
						});
					}
				}
			}

		}
	});

	ig.addGameAddon(function () {
		return new EmilieCircuitIcons();
	});

});
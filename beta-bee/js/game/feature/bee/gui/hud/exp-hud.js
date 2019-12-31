ig.module("game.feature.bee.gui.hud.exp-hud").requires("game.feature.gui.hud.exp-hud").defines(function () {
	sc.ExpHudGui.inject({
		ignore: false,
		modelChanged: function () {
			if (this.ignore) {
				return;
			}
			this.parent(...arguments);
		}
	});
});
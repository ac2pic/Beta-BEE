ig.module("game.feature.combat.gui.status-bar-injection").requires("game.feature.combat.gui.status-bar").defines(function() {
	ig.GUI.StatusBar.inject({
		showHpBar: function() {
			if (this.target.isPlayer && this.target.model.name.indexOf("civilian") > -1) {
				return false;
			}
			return this.parent();
		}
	});
});
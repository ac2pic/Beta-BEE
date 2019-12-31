ig.module("game.feature.bee.gui.hud.hp-hud").requires("game.feature.gui.hud.hp-hud").defines(function () {
	sc.HpHudGui.inject({
		modelChanged: function (instance, event, args) {
			if (!args) {
				return this.parent(instance, event);
			}
			if (instance === sc.model.player.params) {
				if (event === sc.COMBAT_PARAM_MSG.HP_CHANGED) {
					// it's assumed it's forced
					this.hpNumber.setNumber(instance.currentHp, true);

					// necessary code grabbed from main code
					if (instance.getHpFactor() <= sc.HP_LOW_WARNING) {
						this.hpNumber.setColor(sc.GUI_NUMBER_COLOR.RED);
						if (sc.options.get("low-health-warning"))
							ig.overlay.setCorner("RED", 1, 0.4, 0.5)
					} else {
						this.hpNumber.setColor(sc.GUI_NUMBER_COLOR.WHITE);
						if (sc.options.get("low-health-warning"))
							ig.overlay.setCorner("RED", 0, 0.4)
					}
					this.critical = false;
					if (instance.currentHp <= 0)
						this.critical = !instance.defeated;
				}
			}
		}
	});
	sc.HpHudBarGui.inject({
		modelChanged: function (instance, event, args) {
			if (!args) {
				return this.parent(instance, event);
			}
			if (instance === sc.model.player.params) {
				if (event === sc.COMBAT_PARAM_MSG.HP_CHANGED) {
					// it's assumed it's forced
					this.targetHp = instance.currentHp;
					this.maxHP = instance.currentHp;
					this.currentHp = instance.currentHp;
				}
			}
		}
	});
});
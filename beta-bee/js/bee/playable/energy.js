ig.module("bee.playable.energy").defines(function() {
	sc.PlayableEnergy = ig.Class.extend({
		energy: 0,
		set: function(energy) {
			if (isFinite(energy)) {
				this.energy = energy;
			}
		},
		get: function() {
			return this.energy;
		},
		reset: function() {
			this.energy = 0;
		},
		getSaveData: function() {
			return this.energy;
		},
		setLoadData: function(energy) {
			if (isFinite(energy)) {
				this.energy = energy;
			} else {
				this.energy = 0;
			}
		}
	});
});
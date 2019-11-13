ig.module("bee.playable.mood.mood").defines(function() {
	const MOODS = ["HAPPY", "SAD", "NEUTRAL", "ANGRY", "DEPRESSED"];

	sc.PLAYABLE_MOODS = {};
	
	for (let i = 0; i < MOODS.length; ++i) {
		sc.PLAYABLE_MOODS[MOODS[i]] = i;
	}


	sc.PlayableMood = ig.Class.extend({
		config: null,
		mood: sc.PLAYABLE_MOODS.NEUTRAL,
		setConfig: function(config) {
			this.config = config;
		},
		getMultipler: function() {
			return this.config[this.mood] || 0;
		},
		set: function(mood) {
			this.mood = mood;
		},
		get: function(format = true) {
			if (format) {
				return MOODS[this.mood];
			}
			return this.mood;
		},
		getSaveData: function() {
			return this.get();
		},
		setLoadData: function(mood) {
			this.mood = sc.PLAYABLE_MOODS[mood] || sc.PLAYABLE_MOODS.NEUTRAL;
		},
		reset: function() {
			this.mood = sc.PLAYABLE_MOODS.NEUTRAL;
		}
	});
});
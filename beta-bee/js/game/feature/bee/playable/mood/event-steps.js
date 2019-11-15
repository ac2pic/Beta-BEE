ig.module("game.feature.bee.playable.mood.event-steps").requires("impact.feature.base.event-steps", "game.feature.bee.playable.mood.mood").defines(function() {
	ig.EVENT_STEP.CHANGE_PLAYABLE_MOOD = ig.EventStepBase.extend({
		mood: 0,
		_wm: new ig.Config({
			attributes: {
				name: {
					_type: "String",
					_info: "Playable member to change mood of."
				},
				mood: {
					_type: "String",
					_info: "What mood to change to.",
					_select: sc.PLAYABLE_MOODS
				}
			}
		}),
		init: function(data) {
			assertContent(data, "name", "mood");
			this.name = data.name;
			this.mood = sc.PLAYABLE_MOODS[data.mood] || sc.PLAYABLE_MOODS.NEUTRAL;
		},
		start: function() {
			const config = sc.playableModel.getConfig(this.name);
			if (!config) {
				throw Error(`${this.name} is not a valid Playable character.`);
			}

			const mood = config.getMood();
			if (!mood) {
				throw Error(`PlayableConfig does not have a PlayableMood!`);
			}
			mood.set(this.mood);
		}
	});
});
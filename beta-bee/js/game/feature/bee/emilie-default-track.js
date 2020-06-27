ig.module("game.feature.emilie-default-track").requires("game.main").defines(function() {
	
	function toTitle(str) {
		if (str) {
			return str[0].toUpperCase() + str.substring(1);
		}
		return str;
	}

	const EmilieDefaultTrack = ig.Class.extend({
		currentMember: "",
		currentAreaName: "",
		init: function() {
			this.model = sc.model.player;
			sc.Model.addObserver(this.model, this);
		},
		modelChanged: function(object, event) {
			if (object === this.model) {
				if (event === sc.PLAYER_MSG.CONFIG_CHANGED) {
					this.currentMember = this.model.name;
				}
			}
			
		},
		levelLoadStartOrder: 1,
		onLevelLoadStart: function(map) {
			if (map.attributes && map.attributes.bgm) {
				const trackSetName = "emilie" + toTitle(map.attributes.bgm);
				if (ig.vars.get("plot.emilie.line") !== null && ig.BGM_DEFAULT_TRACKS[trackSetName]) {
					map.attributes.bgm = trackSetName;
				}
			}		
		}
	});

	ig.addGameAddon(function() {
		return new EmilieDefaultTrack();
	});
});
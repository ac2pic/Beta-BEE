ig.module("bee.inject.player.player-level").requires("game.feature.player.player-level").defines(function(){
	
	sc.LEVEL_CURVES.LINEAR = {
		getFactor: function() {
			return 1;
		},
		ignorePartyCount: true
	};
});
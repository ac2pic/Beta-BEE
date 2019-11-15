ig.module("game.feature.bee.player.player-config").requires("game.feature.player.player-config").defines(function() {
    sc.PlayerSubConfig.inject({
        cloneCopy: {},
        init: function(element, actions) {
            this.cloneCopy = {element, actions};
            this.parent(element, actions);
        },
        copy: function() {
            const {element, actions} = this.cloneCopy;
            return new sc.PlayerSubConfig(element, actions);
        }
    });
});

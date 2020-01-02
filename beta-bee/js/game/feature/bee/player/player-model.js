ig.module("game.feature.bee.player.player-model").requires("game.feature.player.player-model").defines(function() {
    function addEnumValue(instance, name) {

        if (instance[name] !== undefined) {
            return instance[name];
        }

        // find the highest value
        let max = 0;
        for (const value in instance) {
            max = Math.max(max, instance[value]);
        }

        // make it higher
        ++max;
        instance[name] = max;
        return max;
    }
    sc.PlayerModel.inject({
        init: function() {
            this.parent();
            addEnumValue(sc.PLAYER_MSG, 'PLAYER_REMOVED');
            addEnumValue(sc.PLAYER_MSG, 'PLAYER_SET');
        },
        setConfig: function(config) {
            if (this.config) {
                sc.Model.notifyObserver(this, sc.PLAYER_MSG.PLAYER_REMOVED, [this.name, null]);
            }
            this.parent(config);
            sc.Model.notifyObserver(this, sc.PLAYER_MSG.PLAYER_SET, [this.name, this]);
        },
        onVarAccess: function(path, pathArr) {
            if (pathArr[0] === "player") {
                if (pathArr[1] === "name") {
                    return this.name;
                } else if (pathArr[1] === "class") {
                    return this.config && this.config.clazz;
                }
            }
            return this.parent(path, pathArr);
        }

    });
});
ig.module("game.feature.bee.storage.storage").requires("impact.feature.storage.storage").defines(function() {

    ig.Storage.inject({
        data: new ig.StorageData(window.BEE_DEBUG ? "bb.save.dev" : "bb.save")
    });
});
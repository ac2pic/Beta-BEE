ig.module("game.feature.common-event.time-up").requires("game.feature.common-event.common-event").defines(function() {

    sc.TimerEntry.inject({
        tick: function() {
            this.parent();
            if (this.stopped && this.timer === this.duration) {
                sc.commonEvents.triggerEvent("TIME_UP", {
                    name: this.name
                });
            }
        }
    });
    sc.COMMON_EVENT_TYPE.TIME_UP = {
        check: function(config, event) {
            return config.name === event.name;
        }
    };
});
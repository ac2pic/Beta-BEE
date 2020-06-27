ig.module("game.feature.think.think-msg-model").requires("impact.base.game").defines(function() {
    sc.ThinkMsgModel = ig.GameAddon.extend({
        messages: {},
        tempMessages: [],
        init: function() {
            this.parent("ThinkingMessageModel");
            sc.Model.addObserver(sc.model, this);
        },
        addNamedMsg: function(name, instance) {
            if (!this.messages[name]) {
                ig.gui.addChildGui(instance);
                this.messages[name] = instance;
            }
        },
        addTempMsg: function(instance) {
            ig.gui.addChildGui(instance);
            this.tempMessages.push(instance);
        },
        removeNamedMsg: function(name) {
            if (this.messages[name]) {
                ig.gui.removeChildGui(this.messages[name]);
                this.messages[name].destroy();
                delete this.messages[name];
            }
        },
        removeTempMsgs: function() {
            this.tempMessages.forEach((msg) => {
                ig.gui.removeChildGui(msg);
                msg.destroy();
            });
            this.tempMessages.splice(0);
            this.tempMessages = [];
        },
        _removeAll: function() {
            for (let msgId in this.messages) {
                this.removeNamedMsg(msgId);
            }
            this.removeTempMsgs();
        },
        modelChanged: function(model, type) {
            if (type === sc.GAME_MODEL_MSG.STATE_CHANGED) {
                if (model.currentState !== sc.GAME_MODEL_STATE.CUTSCENE) {
                    console.log('State changed. Removing all saved messages.');
                    this._removeAll();
                }
            }
        }
    });

    ig.addGameAddon(function() {
        return sc.thinkMsg = new sc.ThinkMsgModel
    });

});
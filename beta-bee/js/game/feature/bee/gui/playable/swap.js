ig.module("game.feature.bee.gui.playable.swap").requires("game.feature.bee.playable.controls").defines(function() {
    ig.PartySwapBase = ig.GuiElementBase.extend({
        callbacks: {
            start: null,
            stop: null
        },
        duration: 0,
        timer: 0.5,
        disabled: true,
        finished: false,
        gfx: new ig.Image("media/gui/emilie-arrows.png"),
        transitions: {
            DEFAULT: {
                state: {
                    offsetY: -40
                },
                time: 0,
                timeFunction: KEY_SPLINES.EASE
            },
            VISIBLE: {
                state: {
                    offsetY: 60
                },
                time: 0.5,
                timeFunction: KEY_SPLINES.EASE
            },
            HIDDEN: {
                state: {
                    offsetY: -40
                },
                time: 0.5,
                timeFunction: KEY_SPLINES.EASE
            }
        },
        init: function() {
            this.parent();
            this.hook.zIndex = 99;
            this.setSize(20, 20);
            this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
        },
        update: function() {
            this.parent();
            if (!this.disabled) {
                this.duration = this.duration + ig.system.tick;

                if (this.duration >= this.timer) {
                    this.duration = 0;
                    this.disabled = true;
                    this.onFinish();
                }
            }

        },
        updateDrawables: function(renderer) {
            renderer.addGfx(this.gfx, -25, -24, 0, 0, 48, 48);
        },
        start: function(callback) {
            ig.gui.addGuiElement(this);
            this.doStateTransition("VISIBLE", null, false, () => {
                this.duration = 0;
                this.disabled = false;
                if (this.callbacks.start) {
                    this.callbacks.start();
                }
            });
        },
        stop: function(callback) {
            this.doStateTransition("HIDDEN", null, false, callback);
        },
        cancel: function() {
            this.reset();
            this.onFinish();
        },
        onFinish: function() {
            if (!this.finished) {
                this.finished = true;
                this.stop(() => {
                    if (this.callbacks.stop) {
                        this.callbacks.stop();
                    }
                    ig.gui.removeGuiElement(this);
                });
            }

        },
        reset: function() {
            this.callbacks.stop = null;
            this.callbacks.start = null;
        }
    });

    ig.PartySwapBlock = ig.PartySwapBase.extend({
        updateDrawables: function(renderer) {
            renderer.addGfx(this.gfx, -25, -24, 0, 51, 48, 48);
        }
    });


    ig.PartySwap = ig.PartySwapBase.extend({
        gfxAngle: 180,
        duration: 0,
        timer: 0.5,
        offsets: [
            [new ig.Image("media/gui/emilie-arrows.png"), -4, -9, 102, 7, 20, 22],
            [new ig.Image("media/gui/emilie-arrows.png"), -4, -9, 127, 7, 20, 22]
        ],
        setOffsets: function(index, img, x, y, srcX, srcY, sizeX, sizeY) {
            this.offsets[index] = [...arguments].slice(1);
        },
        updateDrawables: function(renderer) {
            renderer.addGfx(this.gfx, -25, -24, 0, 0, 48, 48);

            let [img, x, y, srcX, srcY, sizeX, sizeY] = this.offsets[0];
            renderer.addTransform().setRotate(Math.PI * (this.gfxAngle / 180));
            renderer.addGfx(img, x, y, srcX, srcY, sizeX, sizeY);
            renderer.undoTransform();

            [img, x, y, srcX, srcY, sizeX, sizeY] = this.offsets[1];
            renderer.addTransform().setRotate(Math.PI * ((this.gfxAngle + 180) / 180));
            renderer.addGfx(img, x, y, srcX, srcY, sizeX, sizeY);
            renderer.undoTransform();
        }
    });

    ig.SwapManager = ig.GameAddon.extend({
        queue: [],
        current: null,
        blocked: false,
        init: function() {
            this.parent("SwapManager");
            sc.Model.addObserver(sc.playableController, this);
        },
        onPreUpdate: function() {
            if (!this.blocked) {
                if (this.queue.length) {
                    this.blocked = true;
                    const current = this.queue.shift();
                    this.current = current;
                    current.callbacks.stop = () => {
                        this.blocked = false;
                    };
                    current.start();
                }
            }
        },
        forceCancelCurrent: function() {
            if (this.current) {
                this.current.cancel();
                this.blocked = false;
                this.current = null;
            }
        },
        modelChanged: function(model, event) {
            if (model === sc.playableController) {
                this.forceCancelCurrent();
                if (event === sc.PLAYABLE_CONTROL.SWITCHED) {
                    this.queue.push(new ig.PartySwap);
                } else if (event === sc.PLAYABLE_CONTROL.BLOCKED) {
                    this.queue.push(new ig.PartySwapBlock);
                }
            }
        },
        onReset: function() {
            this.queue.splice(0).forEach(element => {
                element.cancel();
            });
            this.forceCancelCurrent();
        }
    });

    ig.addGameAddon(function() {
        return ig.swapManager = new ig.SwapManager;
    });
});
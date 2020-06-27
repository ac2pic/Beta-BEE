ig.module("game.feature.player.entities.player-injection").requires("game.feature.player.entities.player").defines(function() {
	ig.ENTITY.Player.inject({
		attackCounterLoop: -1,
		maxAttackCount: 3,
		setAttackCount(num) {
			num -= 1;
			if (num < 1) {
				throw new RangeError('Attack count must be greater than 1');
			} 
			this.maxAttackCount = num;
			
		},
		update: function() {
			const willReset = this.attackResetTimer > 0 && (this.attackResetTimer - ig.system.tick) <= 0;
			if (willReset) {
				this.attackCounterLoop = -1;
			}
			this.parent();
		},
		handleStateStart: function(a, b) {
			this.parent(a, b);
			if(a.startState === 3) {
				if (this.attackResetTimer === 0) {
					if(this.maxAttackCount < 4) {
						if(this.attackCounter === this.maxAttackCount) {
							this.attackCounter = 100;
						}
					} else {
						if (this.attackCounterLoop < 0) {
							if (this.attackCounter < 3) {
								return;
							}
							this.attackCounterLoop++;    
						}
						const count = this.maxAttackCount - (3 + this.attackCounterLoop * 2);
						if (count <= 0) {
							this.attackCounterLoop = -1;
							this.attackCounter = 100;
						} else if (count === 1) {
							this.attackCounter = this.attackCounter%2;
							this.attackCounterLoop++;
						} else if (this.attackCounter === 3) {
							this.attackCounter = 1;
							this.attackCounterLoop++;
						}
					} 
				}
			}
		}
	});
	
});
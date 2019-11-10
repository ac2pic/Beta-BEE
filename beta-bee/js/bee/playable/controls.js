ig.module("bee.playable.controls").requires("game.feature.model.options-model").defines(function()  {
	function calculateNewPos(entity) {
		const pos = ig.game.getEntityPosition(entity);
		return Vec3.createC(pos.x, pos.y , pos.z);
	}
	function switchTo(partyName) {
		 
		const partyEntity = sc.party.partyEntities[partyName];
		if (!partyEntity || 
			!sc.PLAYABLE_OPTIONS.includes(partyName)) {
			console.error(`Can't switch to ${partyName}.`);
			return;
		}
		const partyPos = calculateNewPos(partyEntity);
		
		const playerEntity = ig.game.playerEntity;
		const playerEntityName = playerEntity.model.name;
		const playerPos = calculateNewPos(playerEntity);
		
		ig.game.playerEntity.cancelAction();
		
		
		// make the switch 
		sc.party.removePartyMember(partyName, null, true);
		sc.model.player.setConfig(ig.cacheList["PlayerConfig"][partyName]);
		
		
		sc.party.addPartyMember(playerEntityName, null, null, true);
		
		
		
		
		
		// this makes it appears as if 
		// they didn't move
		
		ig.game.playerEntity.setPos(partyPos.x, partyPos.y, partyPos.z);
		
		const oldPlayer = sc.party.partyEntities[playerEntityName];
		oldPlayer.setPos(playerPos.x, playerPos.y, playerPos.z);
		const event = new ig.Event({
			steps: [{
				type: "SET_CAMERA_TARGET",
				entity: ig.game.playerEntity,
				speed: "NORMAL",
				transition: "EASE_IN_OUT"
			}]
		});
		
		return ig.game.events.callEvent(event, ig.EventRunType.BLOCKING);
	}

	sc.PlayableController = ig.GameAddon.extend({
		switchTo: null,
		canSwitch: function() {
			const playerEntity = ig.game.playerEntity;
			if (!playerEntity)
				return false;
			const playerModel = sc.model.player;

			if (playerEntity.dying !== sc.DYING_STATE.ALIVE)
				return false;
			if (playerEntity.jumping)
				return false;
			const respawn = playerEntity.respawn;
			if (respawn.timer !== 0)
				return false;
			
			if (sc.model.isLoading() || sc.model.isTeleport())
				return false;
			if (sc.model.isPaused() || sc.model.isMenu()) 
				return false;
			return sc.model.isGame();
		},
		onPreUpdate: function() {
			if (this.switchTo) {
				// when switching and respawning
				// the effects may still show on 
				// the new player
				switchTo(this.switchTo);
				this.switchTo = null;
			} else {
				for (let i = 1; i <= 3; ++i) {
					if (ig.input.pressed("p" + i)) {
						let member = sc.party.currentParty[i - 1];
						this.switchTo = member;
						return;					
					}	
				}
			}
					
		},
		onPostUpdate: function() {
			if (!this.switchTo)
				return;
			
			if (!this.canSwitch()) {
				this.switchTo = null;
				return;
			}
			const member = this.switchTo;
			const entity = sc.party.partyEntities[member];
			const model = sc.party.models[member];
			const playableModel = sc.playableModel.getConfig(this.switchTo);
			if (entity) {
				
				if (entity.jumping || 
					!model.isAlive() ||
					entity.respawn.timer !== 0) {
					this.switchTo = null;
					return;
				} else {
					if (window.DEBUG) {
						debugger;	
					}
				}
			}
		}
	});
	
	ig.addGameAddon(function() {
		return sc.playableController = new sc.PlayableController;
	});
});
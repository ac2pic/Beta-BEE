ig.module("game.feature.bee.playable.controls").requires("game.feature.model.options-model").defines(function () {

	sc.PLAYABLE_CONTROL = {
		QUEUE: 0,
		SWITCHED: 1,
		BLOCKED: 2
	};

	function calculateNewPos(entity) {
		const pos = ig.game.getEntityPosition(entity);
		return Vec3.createC(pos.x, pos.y, pos.z);
	}

	function switchTo(partyName) {

		const partyEntity = sc.party.partyEntities[partyName];
		if (!partyEntity ||
			!sc.PLAYABLE_OPTIONS.includes(partyName)) {
			console.error(`Can't switch to ${partyName}.`);
			return;
		}


		sc.party.setContactType(partyName, sc.PARTY_MEMBER_TYPE.UNKNOWN);

		const partyPos = calculateNewPos(partyEntity);

		const playerEntity = ig.game.playerEntity;
		const playerEntityName = playerEntity.model.name;
		const playerPos = calculateNewPos(playerEntity);

		// make the switch 
		sc.party.removePartyMember(partyName, null, true);
		sc.model.player.setConfig(ig.cacheList["PlayerConfig"][partyName]);


		sc.party.addPartyMember(playerEntityName, null, null, true);
		sc.party.setContactType(playerEntityName, sc.PARTY_MEMBER_TYPE.FRIEND);


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
		observers: [],
		switchTo: null,
		canSwitch: function () {
			const playerEntity = ig.game.playerEntity;
			if (!playerEntity)
				return false;
			const playerModel = sc.model.player;

			// Just incase the current player
			// is not registered as a party member
			if (!sc.PLAYABLE_OPTIONS.includes(playerModel.name))
				return false;
			if (playerEntity.dying !== sc.DYING_STATE.ALIVE)
				return false;
			if (playerEntity.jumping)
				return false;
			if (playerEntity.currentAnim === "fall")
				return false;
			const respawn = playerEntity.respawn;
			if (respawn.timer !== 0)
				return false;

			if (!!playerEntity.currentAction)
				return false;

			if (sc.model.isLoading() ||
				sc.model.isPaused() ||
				sc.model.isTeleport() ||
				sc.model.isMenu() ||
				!sc.model.isGame())
				return false;

			const attachedEntities = playerEntity.entityAttached;
			return attachedEntities.filter(e => {
				if (e.getRemainingTime) {
					return e.getRemainingTime() > 0.2;
				}

				return false;
			}).length === 0;
		},
		onPreUpdate: function () {
			if (this.switchTo) {

				sc.Model.notifyObserver(this, sc.PLAYABLE_CONTROL.SWITCHED, [sc.model.player.name, this.switchTo]);
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

		onPostUpdate: function () {
			if (!this.switchTo)
				return;

			if (!this.canSwitch()) {
				this.switchTo = null;
				sc.Model.notifyObserver(this, sc.PLAYABLE_CONTROL.BLOCKED);
				return;
			}



			const member = this.switchTo;
			const entity = sc.party.partyEntities[member];
			const model = sc.party.models[member];
			if (entity) {

				if (entity.jumping ||
					!model.isAlive() ||
					entity.respawn.timer !== 0) {
					this.switchTo = null;
					sc.Model.notifyObserver(this, sc.PLAYABLE_CONTROL.BLOCKED);
					return;
				} else {
					if (window.DEBUG) {
						debugger;
					}
				}
			} else {
				// currently dead. Can't switch to them
				this.switchTo = null;
				sc.Model.notifyObserver(this, sc.PLAYABLE_CONTROL.BLOCKED);
			}
		},
		reset: function () {
			this.switchTo = null;
		},
		onTeleport: function () {
			this.reset();
		},
		onReset: function () {
			this.reset();
		}
	});

	ig.addGameAddon(function () {
		return sc.playableController = new sc.PlayableController;
	});
});
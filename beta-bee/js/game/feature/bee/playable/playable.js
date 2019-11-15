ig.module("game.feature.bee.playable.playable").requires("impact.feature.storage.storage", "game.feature.bee.calendar.calendar").defines(function() {
	sc.PlayableModel = ig.GameAddon.extend({
		configs: {},
		schedules: {},
		init: function() {
			this.parent("Playable");
			ig.storage.register(this);
			const calendar = sc.calendar.add('schedules');
			const date = new sc.DayState;

			calendar.setDate(date);

			const period = date.getPeriod();
			period.setInterval(["MIDNIGHT", "MORNING", "NOON", "AFTERNOON", "EVENING"]);


			for (const playableMember of sc.PLAYABLE_OPTIONS) {
				this.addConfig(playableMember, calendar);
			}

			sc.Model.addObserver(sc.party, this);
			sc.Model.addObserver(sc.model.player, this);
			sc.combat.addCombatListener(this);

			ig.vars.registerVarAccessor("playable", this, null);
		},
		onVarAccess: function(path, pathArr) {
			if (pathArr[0] === "playable") {
				const config = this.getConfig(pathArr[1]);
				if (config) {
					const newPath = [pathArr[0]].concat(pathArr.slice(2));
					return config.onVarAccess(newPath.join("."), newPath);
				}
			}
			return null;
		},
		addConfig(name, calendar) {
			const config = this.configs[name] = new sc.PlayableConfig(name);
			const schedule = this.schedules[name] = new sc.PlayableSchedule(name);
			config.setSchedule(schedule);
			schedule.setCalendar(calendar);
		},
		hasConfig(name) {
			return this.configs[name] instanceof sc.PlayableConfig;
		},
		getConfig(name) {
			return this.configs[name];
		},
		modelChanged: function(instance, event, args) {
			if (instance === sc.party) {
				switch(event) {
					case sc.PARTY_MSG.ADDED_MEMBER:
					case sc.PARTY_MSG.REMOVED_MEMBER: {
						const member = args[0];
						const model = args[1];
						if(this.hasConfig(member)) {
							const config = this.getConfig(member);
							config.setPartyMemberModel(model);
							if (config.isFirstTime()) {
								config.updateFields();
							}
							config.applyToPartyModel();
							
						}
						break;
					}
					default:
						break;
				}
			} else if (instance === sc.model.player) {
				switch(event) {
					case sc.PLAYER_MSG.PLAYER_REMOVED:
					case sc.PLAYER_MSG.PLAYER_SET: {
						const member = args[0];
						const model = args[1];  
						if(this.hasConfig(member)) {
							const config = this.getConfig(member);
							config.setPlayerModel(model);
							if (config.isFirstTime()) {
								config.updateFields();
							}
							config.applyToPlayerModel();
						}
						break;
					}
				}
			}
		 },
		// has to be after sc.GameModel.onReset 
		// Lea's config gets added there
		resetOrder: Infinity,
		onReset: function() {
			for (const name in this.configs) {
				const member = this.configs[name];
				member.reset();
			}
		},
		onCombatEvent: function(combatant, event) {
			switch(event) {
				case sc.COMBAT_EVENT.DEFEATED: {
					if (!combatant.enemyType)
						return;
					let credits = combatant.enemyType.credit;
					let level = combatant.enemyType.level;
					if (combatant.level.override) {
						credits = sc.EnemyLevelScaling.adaptCredits(credits, level, combatant.level.override);
					}
					for (const name in this.configs) {
						const member = this.configs[name];
						if (!member.isPlayer() && member.isParty()) {
							member.credit += credits;
						}
					}
					break;
				}
				default:
					break;
			}
		},
		onStorageSave: function(data) {
			data.playableMembers = {};
			for (const playableMemberName in this.configs) {
				const config = this.getConfig(playableMemberName);
				data.playableMembers[playableMemberName] = config.getSaveData();
			}
		},
		onStoragePreLoad: function(data) {
			if (data.playableMembers) {
				for (const playableMemberName in data.playableMembers) {
					const configData = data.playableMembers[playableMemberName] || {};
					const config = this.getConfig(playableMemberName);
					if (config) {
						config.setLoadData(configData);
					}
				}
			}
		}
	});


	ig.addGameAddon(function() {
		return sc.playableModel = new sc.PlayableModel;
	});
});

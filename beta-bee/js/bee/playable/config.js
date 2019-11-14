ig.module("bee.playable.playable.config").requires("bee.playable.playable").defines(function() {
	let hudGui = undefined;
	
	function getPartyHudGui(model) {
		if (!hudGui) {
			hudGui = ig.gui.guiHooks.filter(e => e.gui instanceof sc.StatusHudGui).pop().gui;	
		}
		const partyGui = hudGui.partyGui;		
		return partyGui.memberGuis.filter(e => e.model === model)[0];
	}
	
	const PLAYABLE_VERSION = 2;
	// this is for syncing
	// PartyMemberModel and PlayerModel
	sc.PlayableConfig = ig.JsonLoadable.extend({
		cacheType: "PlayableConfig",
		name: "Best Player",
		version: 0,
		count: 0,
		itemFavs: [],
		itemNew: [],
		itemToggles: {},
		credit: 0,
		level: 1,
		exp: 0,
		hp: 0,
		currentElementMode: 0,
		core: {},
		equip: {},
		spLevel: 0,
		items: [],
		skills: [],
		skillPoints: [],
		skillPointsExtra: [],
		mood: null,
		partyModel: null,
		playerModel: null,
		schedule: null,
		init: function(name) {
			this.parent(name.toLowerCase());
			this.name = name;
			this.mood = new sc.PlayableMood;
		},
		getJsonPath: function() {
			return ig.root + this.path.toPath("data/playable/", ".json");
		},
		onload: function(data) {
			this.mood.setConfig(data.mood);
			this.schedule.set(data.schedule);
		},
		onerror: function(error) {
			console.log(error);
		},
		setSchedule: function(schedule) {
			this.schedule = schedule;
			this.schedule.setConfig(this);
		},
		getMood: function() {
			return this.mood;
		},
		setPartyMemberModel: function(model) {
			this.removePartyObserver();
			this.partyModel = model;
			if (model) {
				this.count += 1;
				this.addPartyObserver();
			}
		},
		setPlayerModel: function(model) {
			this.removePlayerObserver();
			this.playerModel = model;
			if (model) {
				this.count += 1;
				this.addPlayerObserver();
			}
		},
		isFirstTime() {
			return this.count === 1 || this.version !== PLAYABLE_VERSION;
		},
		isPlayer() {
			return this.playerModel instanceof sc.PlayerModel;
		},
		isParty() {
			return this.partyModel instanceof sc.PartyMemberModel;
		},
		applyToModels: function() {
			this.applyToPartyModel();
			this.applyToPlayerModel();
		},
		applyToPartyModel: function() {
			if (this.isParty()) {
				const model = this.partyModel;
				
				sc.skilltree.overrideAutoSkills = true;
				sc.skilltree.autoSkillsOverride = this.skills.filter((e) => !!e);
				
				// update sp level 
				model.setSpLevel(this.spLevel);
				
				// copy equipment
				model.equip = ig.copy(this.equip);
				
				// need to do this now because changing
				// element mode changes the hp
				const element = this.currentElementMode;

				// set it to the correct params before notifying

				// fixes hp bug and getting statusInflict error 
				const baseParams = model.elementConfigs[element].baseParams;
				for (const param in baseParams) {
					model.params.baseParams[param] = baseParams[param];
				}
				
				// save old hp value 
				const hp = this.hp;

				model.setElementMode(this.currentElementMode);	
				
				
				
				if (model.exp !== this.exp) {
					console.log('PartyMember Exp:', model.exp, this.exp);
				}
				
				// update level for new partyMember
				// this updates the stats
				model.setLevel(this.level, this.exp); 
				
				
				sc.skilltree.autoSkillsOverride = [];
				sc.skilltree.overrideAutoSkills = false;


				model.params.currentHp = hp;

				// instant change
				sc.Model.notifyObserver(model.params, sc.COMBAT_PARAM_MSG.HP_CHANGED, true);

				const hudGui = getPartyHudGui(model);
				
				// this visually forces hp bar to stored hp
				const hpBar = hudGui.hpExpSpGui.hpBar;
				hpBar.currentHp = this.hp;
				hpBar.maxHp = model.params.baseParams.hp;
				hpBar.targetHp = this.hp;
			} 
		},
		applyToPlayerModel: function() {
			if (this.isPlayer()) {
				// this handles setting everything up
				const model = this.playerModel;
				
				if (model.exp !== this.exp) {
					console.log('Player Exp:', model.exp, this.exp);
				}

				model.preLoad(this.buildPreLoad());
				ig.lang.labels.sc.gui.options["hp-bars"].group[1] = `Party Only`;
				
				model.params.currentHp = this.hp;
				// force update it
				sc.Model.notifyObserver(model.params, sc.COMBAT_PARAM_MSG.HP_CHANGED, true);
			}
		},
		buildPreLoad() {
			const config = {};
			config.itemFavs = this.itemFavs;
			config.itemNew = this.itemNew;
			config.itemToggles = this.itemToggles;
			config.credit = this.credit;
			config.level = this.level;
			config.exp = this.exp;
			config.chapter = sc.model.player.chapter;
			config.currentElementMode = this.currentElementMode;
			config.hp = this.hp;
			config.core = ig.copy(this.core);
			config.items = ig.copy(this.items);
			config.equip = ig.copy(this.equip);
			config.spLevel = this.spLevel;
			config.skills = this.skills;
			config.skillPoints = this.skillPoints;
			config.skillPointsExtra = this.skillPointsExtra;
			config.skillVersion = sc.skilltree.version;
			return config;
		},
		updateFields() {
			// just in case both are active
			if (this.isPlayer()) {
				const model = this.playerModel;
				this.itemFavs = ig.copy(model.itemFavs);
				this.itemNew = ig.copy(model.itemNew);
				this.itemToggles = ig.copy(model.itemToggles);
				this.credit = model.credit;
				this.level = model.level;
				this.exp = model.exp;
				this.currentElementMode = model.currentElementMode;
				const hpDiff = model.params.currentHp - model.params.getStat("hp");
				
				model.params.increaseHp(hpDiff, true);
				this.core = ig.copy(model.core);
				this.items = ig.copy(model.items);
				this.equip = ig.copy(model.equip);
				this.spLevel = model.spLevel;
				this.skills = ig.copy(model.skills);
				this.skillPoints = ig.copy(model.skillPoints);
				this.skillPointsExtra = ig.copy(model.skillPointsExtra);
				this.version = PLAYABLE_VERSION;		
			} else if(this.isParty()) {
				const model = this.partyModel;
				
				this.level = model.level;
				this.exp = model.exp;
				this.equip = ig.copy(model.equip);
				this.spLevel = model.spLevel;
				this.currentElementMode = model.currentElementMode;
				this.hp = model.params.currentHp;
				// needs to be expanded
				this.skills = []; 
				for(const skill of model.skills) {
					this.skills[skill.id] = skill;
				}
				this.version = PLAYABLE_VERSION;
			}
		},
		addPlayerObserver: function() {
			if (this.isPlayer()) {
				sc.Model.addObserver(this.playerModel, this);
				sc.Model.addObserver(this.playerModel.params, this);
			}
		},
		removePlayerObserver: function() {
			if (this.isPlayer()) {
				sc.Model.removeObserver(this.playerModel, this);
				sc.Model.removeObserver(this.playerModel.params, this);
			}			
		},
		addPartyObserver: function()  {
			if (this.isPlayer())
				return;
			if (this.isParty()) {
				sc.Model.addObserver(this.partyModel, this);
				sc.Model.addObserver(this.partyModel.params, this);
			}
		},
		removePartyObserver: function() {
			if (this.isParty()) {
				sc.Model.removeObserver(this.partyModel, this);
				sc.Model.removeObserver(this.partyModel.params, this);
			}			
		},
		modelChanged: function(instance, event) {
			if (instance === this.partyModel) {
				switch(event) {
					case sc.PARTY_MEMBER_MSG.EXP_CHANGE:
						this.exp = instance.exp;
						break;
					case sc.PARTY_MEMBER_MSG.LEVEL_CHANGE:
						this.level = instance.level;
						break;
					// when party switches element mode
					case sc.PARTY_MEMBER_MSG.ELEMENT_MODE_CHANGE: {
						this.currentElementMode = instance.currentElementMode;
						this.hp = instance.params.currentHp;
						break;	
					}
					default:
						break;
				}
			} else if (instance === this.playerModel) {
				switch(event) {
					case sc.PLAYER_MSG.EXP_CHANGE:
						this.exp = instance.exp;
						break;
					case sc.PLAYER_MSG.LEVEL_CHANGE:
						this.level = instance.level;
						break;
					case sc.PLAYER_MSG.CREDIT_CHANGE:
						this.credit = instance.credit;
						break;
					case sc.PLAYER_MSG.ELEMENT_MODE_CHANGE: {
						this.currentElementMode = instance.currentElementMode;
						this.hp = instance.params.currentHp;
						break;
					}
					case sc.PLAYER_MSG.CP_CHANGE: {
						for(let i = 0; i < this.skillPoints.length; i++) {
							this.skillPoints[i] = instance.skillPoints[i];
							this.skillPointsExtra[i] = instance.skillPointsExtra[i];					
						}
						break;
					}
					case sc.PLAYER_MSG.CORE_CHANGED:
						this.core = ig.copy(instance.core);
						break;
					case sc.PLAYER_MSG.ITEM_FAVORITES_CHANGED:
					// todo: simplify these code
					case sc.PLAYER_MSG.ITEM_USED:
					case sc.PLAYER_MSG.ITEM_OBTAINED:
					case sc.PLAYER_MSG.ITEM_REMOVED:
					case sc.PLAYER_MSG.ITEM_TOGGLED: {
						for (let i = 0; i < instance.items.length; ++i) {
							this.items[i] = instance.items[i];
						}
						for (let i = 0; i < instance.itemToggles.length; ++i) {
							this.itemToggles[i] = instance.itemToggles[i];
						}
						for (let i = 0; i < instance.itemFavs.length; ++i) {
							this.itemFavs[i] = instance.itemFavs[i];
						}
						for (let i = 0; i < instance.itemNew.length; ++i) {
							this.itemNew[i] = instance.itemNew[i];
						}
						break;
					}
					default:
						break;
					
				}
			} 
			if (this.isPlayer()) {
				if (instance === this.playerModel.params) {
					if (event === sc.COMBAT_PARAM_MSG.HP_CHANGED) {
						this.hp = instance.currentHp;
					}
				}
			} else if (this.isParty()) {
				if (instance === this.partyModel.params) {
					if (event === sc.COMBAT_PARAM_MSG.HP_CHANGED) {
						this.hp = instance.currentHp;
					}					
				}
			}
		},
		getSaveData: function() {
			const data = {};
			data.count = this.count;
			data.itemFavs = this.itemFavs;
			data.itemNew = this.itemNew;
			data.itemToggles = this.itemToggles;
			data.credit = this.credit;
			data.level = this.level;
			data.exp = this.exp;
			data.currentElementMode = this.currentElementMode;
			data.hp = this.hp;
			data.core = this.core;
			data.items = ig.copy(this.items);
			data.equip = ig.copy(this.equip);
			data.spLevel = this.spLevel;
			data.skills = this.skills;
			data.skillPoints = this.skillPoints;
			data.skillPointsExtra = this.skillPointsExtra;
			data.version = this.version;
			data.mood = this.mood.getSaveData();
			return data;
		},
		setLoadData: function(data) {
			this.version = data.version || this.version;
			this.count = data.count || this.count;
			this.itemFavs = data.itemFavs || this.itemFavs;
			this.itemNew = data.itemNew || this.itemNew;
			this.itemToggles = data.itemToggles || this.itemToggles;
			this.credit = data.credit || this.credit;
			this.level = data.level || this.level;
			if (!isNaN(data.exp)) {
				this.exp = data.exp;
			}
			if (!isNaN(data.currentElementMode)) {
				this.currentElementMode = data.currentElementMode;
			}
			this.hp = data.hp || 0;
			this.core = data.core || this.core;
			this.items = ig.copy(data.items) || this.items;
			this.equip = ig.copy(data.equip) || this.equip;
			if (!isNaN(data.spLevel)) {
				this.spLevel = data.spLevel;
			}
			this.skills = data.skills || this.skills;
			this.skillPoints = data.skillPoints || this.skillPoints;
			this.skillPointsExtra = data.skillPointsExtra || this.skillPointsExtra;
			this.mood.setLoadData(data.mood);
		},
		reset: function() {
			this.version = 0;
			this.count = 0;
			this.itemFavs = [];
			this.itemNew = [];
			this.itemToggles = {};
			this.credit = 0;
			this.level = 1;
			this.exp = 0;
			this.currentElementMode = 0;
			this.hp = 1;
			this.core = {};
			this.equip = {};
			this.spLevel = 0;
			this.items = [];
			this.skills = [];
			this.skillPoints = Array(5).fill(1);
			this.skillPointsExtra = Array(5).fill(0);
			this.partyModel = null;
			this.playerModel = null;
			this.mood.reset();	
			this.schedule.reset();	
		},
		onVarAccess: function(path, pathArr) {
			if (pathArr[0] === "playable") {
				switch (pathArr[1]) {
					case "mood": {
						return this.mood.get();
					}
					case "version":
					case "credit":
					case "count":
					case "name":
						return this[pathArr[1]];
					default:
						break;
				}
			}
			return null;
		}
	});
});
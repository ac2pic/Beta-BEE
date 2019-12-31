ig.module("game.feature.bee.playable.schedule.events").defines(function () {
	function createScheduleEventGenerator(base, baseConfig = {}) {
		return function (objectCode, config = {}) {
			const baseConfigCopy = ig.copy(baseConfig);
			for (const baseConfigKey in baseConfigCopy) {
				if (config[baseConfigKey] === undefined) {
					config[baseConfigKey] = baseConfigCopy[baseConfigKey];
				}
			}
			for (let configEntry in config) {
				objectCode[configEntry] = config[configEntry];
			}

			const eventClass = base.extend(objectCode);
			for (let configEntry in config) {
				eventClass[configEntry] = config[configEntry];
			}

			return eventClass;
		}

	}

	sc.SCHEDULE_EVENTS = {};


	sc.BaseScheduleEvent = ig.Class.extend({
		/**
		 * 
		 * @param {Object} data - Schedule Event paramaters 
		 * @param {sc.PlayableConfig} config
		 */
		init: function (data, config) {
			this.data = data;
			this.config = config;
		},
		run: function () {},
		canExecute: function () {
			return true;
		}
	});

	const eventGenerator = createScheduleEventGenerator(sc.BaseScheduleEvent, {
		branchable: false
	});

	sc.SCHEDULE_EVENTS.LOG = eventGenerator({
		run: function () {
			const message = ig.TextParser.bakeVars(this.data.value);
			console.log(message);
		}
	});

	// Branching starts

	const branchEventStaticVars = {
		branchable: true,
		branches: []
	};

	sc.BaseBranchEvent = eventGenerator({
		getBranch: function () {
			return null;
		}
	}, branchEventStaticVars);

	const branchEventGenerator = createScheduleEventGenerator(sc.BaseBranchEvent, branchEventStaticVars);

	sc.SCHEDULE_EVENTS.IF = branchEventGenerator({
		condition: null,
		then: [],
		else: [],
		init: function (data, config) {
			this.parent(data, config);
			this.condition = new ig.VarCondition(data.condition);
		},
		getBranch: function () {
			const {
				then: thenBranch,
				else: elseBranch
			} = this.data;
			if (this.condition.evaluate()) {
				return thenBranch;
			}
			return elseBranch;
		}
	}, {
		branches: ["then", "else"]
	});

});
ig.module("bee.playable.schedule.events").defines(function() {
	function createScheduleEventGenerator(base, baseConfig) {
		return function(name, objectCode, config) {
			const baseConfigCopy = ig.copy(baseConfig);
			for (const baseConfigKey in baseConfigCopy) {
				if (config[baseConfigKey] === undefined) {
					config[baseConfigKey] = baseConfigCopy[baseConfigKey];
				}
			}
			sc.SCHEDULE_EVENTS[name] = base.extend(objectCode);
			for (let configEntry in config) {
				sc.SCHEDULE_EVENTS[name][configEntry] = config[configEntry];
			}
		}

	}

	sc.SCHEDULE_EVENTS = {};

	sc.BaseScheduleEvent = ig.Class.extend({
		init: function() {},
		run: function() {},
		canExecute: function() { return true;}
	});

	const baseEventGenerator = createScheduleEventGenerator(sc.BaseScheduleEvent, {
		branchable: false
	});
	

	sc.BaseBranchEvent = sc.BaseScheduleEvent.extend({
		getBranch: function() { return [];}
	});

	case baseBranchEventGenerator = createScheduleEventGenerator(sc.BaseScheduleEvent, {
		branchable: true,
		branches: []
	})





	baseEventGenerator('LOG', sc.BaseScheduleEvent);

	baseBranchEventGenerator('IF',{
		condition: null,
		ifBranch: [],
		elseBranch: null, 
		init: function(data) {
			this.condition = ig.VarCondition(data.condition);
			if (Array.isArray(data.then)) {
				this.ifBranch = data.then;
			}

			if (Array.isArray(data.else)) {
				this.elseBranch = data.else;
			}
		},
		getBranch: function() {

		}
	}, {
		branches: ["then", "else"]
	});
	
});

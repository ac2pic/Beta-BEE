ig.module("bee.calendar.event-steps").requires("impact.feature.base.event-steps").defines(function() {
	ig.EVENT_STEP.CHANGE_CALENDAR_DATE = ig.EventStepBase.extend({
		day: 0,
		period: "",
		notify: false,
		_wm: new ig.Config({
			attributes: {
				name: {
					_type: "String",
					_info: "The calendar name"
				},
				day: {
					_type: "NumberExpression",
					_info: "What day to set it to. Must be positive integer."
				},
				changeType: {
					_type: "String",
					_info: "How to move calendar to date.",
					_select: {
						set: 1,
						iterate: 1
					},
					_default: "set"
				},
				period: {
					_type: "String",
					_info: "What time of day to set it to."
				},
				deferNotify: {
					_type: "Boolean",
					_info: "If true: Will notify new value after it's set.",
					_default: false
				},
				notify: {
					_type: "Boolean",
					_info: "Whether to notify listeners.",
					_default: false
				}
			}
		}),
		init: function(data) {
			assertContent(data, "name", "day", "period");
			this.name = name;
			this.day = data.day;
			this.period = data.period;
			this.changeType = data.changeType || "iterate";
			this.notify = data.notify || false;
			this.deferNotify = data.deferNotify || false;
		},
		start: function() {
			const name = ig.Event.getExpressionValue(this.name);
			const calendar = sc.calendar.get(name);

			if (!calendar) {
				throw Error(`There is no calendar with name "${name}".`);
			}

			const day = ig.Event.getExpressionValue(this.day);
			const period = ig.Event.getExpressionValue(this.period);
			if (this.deferNotify) {
				this.notify = false;
			}
			switch (this.changeType) {
				case "iterate": {
					calendar.change(day, period, this.notify);
					break;
				}
				case "set":
				default: {
					calendar.set(day, period, this.notify);
					break;
				}	
			}
			if (this.deferNotify) {
				calendar.notify(sc.DAY_MSG.STARTED, sc.TIME_OF_DAY_MSG.STARTED);
			}
		}
	});

	ig.EVENT_STEP.SET_CALENDAR_DATE = ig.EventStepBase.extend({
		day: 0,
		period: "",
		notify: false,
		_wm: new ig.Config({
			attributes: {
				name: {
					_type: "String",
					_info: "The calendar name"
				},
				day: {
					_type: "NumberExpression",
					_info: "What day to set it to. Must be positive integer."
				},
				period: {
					_type: "String",
					_info: "What time of day to set it to."
				},
				notify: {
					_type: "Boolean",
					_info: "Whether to notify listeners.",
					_default: false
				}
			}
		}),
		init: function(data) {
			assertContent(data, "name", "day", "period");
			this.name = data.name;
			this.day = data.day;
			this.period = data.period;
			this.notify = data.notify || false;
		},
		start: function() {
			const name = ig.Event.getExpressionValue(this.name);
			const calendar = sc.calendar.get(name);

			if (!calendar) {
				throw Error(`There is no calendar with name "${name}".`);
			}


			const day = ig.Event.getExpressionValue(this.day);
			const period = ig.Event.getExpressionValue(this.period);
			calendar.set(day, period, false);
			if (this.notify) {
				calendar.notify(sc.DAY_MSG.STARTED, sc.TIME_OF_DAY_MSG.STARTED);
			}
		}
	});
});
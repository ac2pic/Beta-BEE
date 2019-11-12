import "./events.js";

ig.module("bee.playable.schedule").requires("bee.playable.playable").defines(function() {
	sc.PlayableSchedule = ig.JsonLoadable.extend({
		schedules: [],
		daySchedule: {},
		periodSchedule: {},
		cacheType: "PlayableSchedule",
		init: function(name) {
			this.name = name;
			this.parent(name.toLowerCase());
			sc.calendar.addObserver(this);
		},
		getJsonPath: function() {
			return ig.root + this.path.toPath("data/playable/schedule/", ".json");
		},
		onload: function(data) {
			for (let i = 0; i < data.length; ++i) {
				const daySchedule = data[i];
				const currentDay = {};
				this.schedules.push(currentDay);
				for (const period in daySchedule) {
					const currentSchedule = daySchedule[period];
					const currentPeriod = currentDay[period] = {};
					const events = ["STARTED", "ENDED"];
					for(const event of events) {
						const currentEventSchedule = currentSchedule[event] || [];
						currentPeriod[event] = currentEventSchedule.map((e) => {
							return new sc.SCHEDULE_EVENTS[e.type](e.settings);
						})
					} 
				}
			}
		},
		onerror: function(data) {
			console.log(`F. ${this.name} didn't load it's schedule.`);
		},
		execute: function(period, event) {
			let schedule = this.daySchedule[period];
			if (!schedule)
				return;
			schedule = schedule[event] || [];

			for(let i = 0; i < schedule.length; ++i) {
				schedule[i].run();
			}
		},
		modelChanged: function (instance, event, args) {
			if (instance === sc.calendar.day) {
				switch (event) {
					case sc.DAY_MSG.STARTED: {
						this.daySchedule = this.schedules[instance.day] || {};
						break;
					}
					case sc.DAY_MSG.ENDED: {
						this.daySchedule = {};
						break;
					}
					default:
						break;
				}
			} else if (instance === sc.calendar.day.timeOfDay) {
				const period = instance.get();
				switch (event) {
					case sc.TIME_OF_DAY_MSG.STARTED: {
						this.execute(period, 'STARTED');
						break;
					}
					case sc.TIME_OF_DAY_MSG.ENDED: {
						this.execute(period, 'ENDED');
						break;
					}
					default:
						break;
				}
			}
		}
	});
});

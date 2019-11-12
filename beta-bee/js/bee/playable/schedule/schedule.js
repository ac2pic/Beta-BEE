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
						this.generateScheduleEvents(currentPeriod[event], currentEventSchedule);
					}
				}
			}
		},
		generateScheduleEvents: function(schedule, scheduleEvents = []) {
			for (const {type, settings} of scheduleEvents) {
				if (!sc.SCHEDULE_EVENTS[type])
					continue;
				if (sc.SCHEDULE_EVENTS[type].branchable) {

				} else {
					
				}
			}
			// new sc.SCHEDULE_EVENTS[e.type](e.settings);
		},
		onerror: function(data) {
			console.log(`F. ${this.name} didn't load it's schedule.`);
		},
		execute: function(schedule) {

			if (!schedule)
				return;
			for(let i = 0; i < schedule.length; ++i) {
				if (schedule[i].canExecute()) {

					schedule[i].run();
				}
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
				let event;
				switch (event) {
					case sc.TIME_OF_DAY_MSG.STARTED: {
						event = "STARTED";
						break;
					}
					case sc.TIME_OF_DAY_MSG.ENDED: {
						event = "ENDED";
						break;
					}
					default:
						event = "";
						break;
				}
				if (event) {
					let schedule = this.daySchedule[period];
					if (schedule) {
						const schedulePeriod = schedule[period];
						if (schedulePeriod[event]) {
							this.execute(schedulePeriod[event]);
						} 
						
					}
				}
				
			}
		}
	});
});

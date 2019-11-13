import "./events.js";

ig.module("bee.playable.schedule").requires("bee.playable.playable").defines(function() {

	sc.PlayableSchedule = ig.JsonLoadable.extend({
		schedules: [],
		daySchedule: {},
		periodSchedule: {},
		calendar: null,
		config: null,
		cacheType: "PlayableSchedule",
		init: function(name) {
			this.parent(name.toLowerCase());
			this.name = name;
		},
		setConfig: function(config) {
			this.config = config;
		},
		setCalendar: function(calendar) {
			if (this.calendar) {
				this.calendar.removeObserver(this);
			}
			this.calendar = calendar;
			this.calendar.addObserver(this);
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
						currentPeriod[event] = this.generateScheduleEvents(currentSchedule[event]);
					}
				}
			}
		},
		generateScheduleEvents: function(schedule, scheduleEvents = []) {
			for (const event of schedule) {
				if (!event)
					continue;

				const eventClass = sc.SCHEDULE_EVENTS[event.type];
				if (!eventClass)
					continue;

				const eventCopy = ig.copy(event);
				
				if (eventClass.branchable) {
					const branches = eventClass.branches;
					for (const branch of branches) {
						eventCopy[branch] = this.generateScheduleEvents(event[branch]);
					}
				} 
				scheduleEvents.push(new eventClass(eventCopy, this.config));
			}
			return scheduleEvents;
		},
		onerror: function(data) {
			console.log(`F. ${this.name} didn't load it's schedule.`);
		},
		execute: function(schedule) {
			if (!schedule)
				return;
			for(let i = 0; i < schedule.length; ++i) {
				const task = schedule[i];
				if (task.canExecute()) {
					if(task.branchable) {
						this.execute(task.getBranch());	
					} else {
						schedule[i].run();
					}
				}
			}
		},
		modelChanged: function (instance, event, args) {
			if (instance === this.calendar.getDayInstance()) {
				const {day} = instance.get(false);
				switch (event) {
					case sc.DAY_MSG.STARTED: {
						this.daySchedule = this.schedules[day] || {};
						break;
					}
					case sc.DAY_MSG.ENDED: {
						this.daySchedule = {};
						break;
					}
					default:
						break;
				}
			} else if (instance === this.calendar.getPeriodInstance()) {
				const period = instance.get();
				let scheduleEvent;
				switch (event) {
					case sc.TIME_OF_DAY_MSG.STARTED: {
						scheduleEvent = "STARTED";
						break;
					}
					case sc.TIME_OF_DAY_MSG.ENDED: {
						scheduleEvent = "ENDED";
						break;
					}
					default:
						scheduleEvent = "";
						break;
				}
				if (scheduleEvent) {
					let schedule = this.daySchedule[period];
					if (schedule) {
						const schedulePeriod = schedule[scheduleEvent];
						this.execute(schedulePeriod);
					}
				}
				
			}
		}
	});
});

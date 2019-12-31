ig.module("game.feature.bee.playable.schedule.schedule").requires("game.feature.bee.playable.playable").defines(function () {

	function binarySearch(arr, value, min = -1, max = -1) {
		if (min === -1 && max === -1) {
			min = 0;
			max = arr.length - 1;
		}

		if (min > max) {
			return -1;
		}

		let midpoint = Math.floor((min + max) / 2);
		// equals then return
		if (arr[midpoint] === value) {
			return midpoint;
		}
		if (value < arr[midpoint]) {
			return binarySearch(arr, value, min, midpoint - 1);
		}

		return binarySearch(arr, value, midpoint + 1, max);
	}

	sc.PlayableSchedule = ig.Class.extend({
		scheduleDayNumbers: [],
		schedules: [],
		daySchedule: {},
		calendar: null,
		config: null,
		init: function (name) {
			this.name = name;
		},
		setConfig: function (config) {
			this.config = config;
		},
		setCalendar: function (calendar) {
			if (this.calendar) {
				this.calendar.removeObserver(this);
			}
			this.calendar = calendar;
			this.calendar.addObserver(this);
		},
		set: function (data) {
			const deferDays = [];

			const outOfOrderDays = [];

			let maxDay = Infinity;
			for (let i = data.length - 1; i >= 0; --i) {
				const daySchedule = data[i];
				if (!isFinite(data[i].day) || data[i].day === null) {
					deferDays.push(data.splice(i, 1)[0]);
					continue;
				}

				if (data[i].day > maxDay) {
					outOfOrderDays.push(data.splice(i, 1)[0]);
					continue;
				}

				if (data[i].day === maxDay) {
					// ignore. No duplicates allowed
					data.splice(i, 1);
					continue;
				}

				maxDay = data[i].day;
			}

			// sort by least to greatest
			outOfOrderDays.sort((first, second) => first.day - second.day);
			maxDay = Infinity;
			for (let i = outOfOrderDays.length - 1; i >= 0; --i) {
				// no duplicates allowed
				if (outOfOrderDays[i].day === maxDay) {
					outOfOrderDays.splice(i, 1);
					continue;
				}
				maxDay = outOfOrderDays[i].day;
			}

			// merge them
			data.push(...outOfOrderDays);

			if (data.length) {
				maxDay = data.last().day;
			} else {
				maxDay = -1;
			}
			++maxDay;

			for (let i = 0; i < deferDays.length; ++i) {
				deferDays[i].day = maxDay + i;
			}

			// merge them
			data.push(...deferDays);

			// actually set them up
			// know that it is somewhat valid
			for (let i = 0; i < data.length; ++i) {
				let daySchedule = data[i];
				const currentDay = {};
				this.schedules.push(currentDay);
				const period = this.calendar.getPeriod();

				currentDay.day = daySchedule.day;
				for (const periodName in daySchedule) {
					if (period.isValidValue(periodName)) {
						const currentSchedule = daySchedule[periodName];
						const currentPeriod = currentDay[periodName] = {};
						const events = ["STARTED", "ENDED"];
						for (const event of events) {
							currentPeriod[event] = this.generateScheduleEvents(currentSchedule[event]);
						}
					}
				}
			}

			// for binarySearch
			this.scheduleDayNumbers = this.schedules.map(date => date.day);

		},
		generateScheduleEvents: function (schedule, scheduleEvents = []) {
			if (Array.isArray(schedule)) {
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
			}
			return scheduleEvents;
		},
		onerror: function (data) {
			console.log(`F. ${this.name} didn't load it's schedule.`);
		},
		execute: function (schedule) {
			if (!schedule)
				return;
			for (let i = 0; i < schedule.length; ++i) {
				const task = schedule[i];
				if (task.canExecute()) {
					if (task.branchable) {
						this.execute(task.getBranch());
					} else {
						schedule[i].run();
					}
				}
			}
		},
		// implement binary search
		getScheduleByDay: function (day) {
			const dayIndex = binarySearch(this.scheduleDayNumbers, day);
			if (dayIndex > -1) {
				return this.schedules[dayIndex];
			}
			return null;
		},
		modelChanged: function (instance, event, args) {
			if (instance === this.calendar.getDate()) {
				const {
					day
				} = instance.get(false);
				switch (event) {
					case sc.DAY_MSG.STARTED: {
						this.daySchedule = this.getScheduleByDay(day) || {};
						break;
					}
					case sc.DAY_MSG.ENDED: {
						this.daySchedule = {};
						break;
					}
					default:
						break;
				}
			} else if (instance === this.calendar.getPeriod()) {
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
		},
		reset: function () {
			this.daySchedule = {};
		}
	});
});
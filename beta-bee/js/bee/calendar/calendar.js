ig.module("bee.calendar.calendar").requires("impact.base.game").defines(function() {

	sc.BaseCalendarComponent = ig.Class.extend({
		observers: [],
		notify: function(value, args) {
			sc.Model.notifyObserver(this, value, args);
		},
		set: function() {},
		change: function() {},
		getSaveData: function() {},
		setLoadData: function() {}
	});

	const TIME_OF_DAY = ["MIDNIGHT", "MORNING", "NOON", "AFTERNOON", "EVENING"];
	sc.TIME_OF_DAY = {
		NONE: -1
	};

	for (let i = 0; i < TIME_OF_DAY.length; ++i) {
		const time = TIME_OF_DAY[i];
		sc.TIME_OF_DAY[time] = i;
	}

	sc.TIME_OF_DAY_MSG = {
		STARTED: 0,
		ENDED: 1
	};

	sc.TimeOfDayState = sc.BaseCalendarComponent.extend({
		period: sc.TIME_OF_DAY.MIDNIGHT,
		set: function(period, notifyChange = true) {
			// don't need to do anything if nothing changed
			if (this.period === period) {
				return;
			}
			const time = TIME_OF_DAY[period];
			const timeOfDay = sc.TIME_OF_DAY[time];
			if (isNaN(timeOfDay)) {
				throw Error(`${period} is not in sc.TIME_OF_DAY.`);
			}
			this.period = period;

			if (notifyChange) {
				this.notify(sc.TIME_OF_DAY_MSG.STARTED);
			}
		},
		change: function(period) {
			if (period >= TIME_OF_DAY.length || period < 0) {
				throw Error(`${period} is not in sc.TIME_OF_DAY.`);
			}

			if (period < this.period) {
				throw Error(`Time of Day must at or later than ${sc.TIME_OF_DAY[this.period]}.`);
			}

			let maxPeriod = Math.min(period + 1, TIME_OF_DAY.length);
			for(let oldPeriod = this.period + 1; oldPeriod < maxPeriod; ++oldPeriod) {
				this.remove(true);
				this.set(oldPeriod);
			} 
		},
		remove: function(notifyChange) {
			if (notifyChange) {
				this.notify(sc.TIME_OF_DAY_MSG.ENDED);
				this.period = sc.TIME_OF_DAY.NONE;
			}
		},
		get: function() {
			return TIME_OF_DAY[this.period];
		},
		reset: function() {
			this.period = sc.TIME_OF_DAY.MIDNIGHT;
		},
		getSaveData: function() {
			return this.period;
		},
		setLoadData: function(period) {
			if (isNaN(period)) {
				this.set(sc.TIME_OF_DAY.MIDNIGHT, false);
			} else {
				this.set(period, false);
			}
		}
	});



	sc.DAY_MSG = {
		STARTED: 0,
		ENDED: 1
	};

	sc.DayState = sc.BaseCalendarComponent.extend({
		day: 0,
		timeOfDay: new sc.TimeOfDayState,
		set: function(newDay, newPeriod, notifyChange = true) {
			if (isNaN(newDay)) {
				throw Error('Day must be a number.');
			}

			if (newDay < 0) {
				throw Error('Day must be positive.');
			}
			
			if (newDay <= this.day) {
				throw Error(`Day must be greater than ${this.day}.`);
			}
			if (notifyChange) {
				this.notify(sc.DAY_MSG.ENDED);
			}
			
			this.day = newDay;
			if (notifyChange) {
				this.notify(sc.DAY_MSG.STARTED);
			}
			this.timeOfDay.set(newPeriod, notifyChange);
		},
		change: function(newDay, newPeriod) {
			for(let nextDay = this.day + 1; nextDay <= newDay; ++nextDay) {
				this.timeOfDay.change(sc.TIME_OF_DAY.EVENING);
				this.timeOfDay.remove(true);
				this.set(nextDay, sc.TIME_OF_DAY.MIDNIGHT);
			}
			this.timeOfDay.set(newPeriod);
		},
		get: function() {
			const data = {};
			data.day = this.day;
			data.period = this.timeOfDay.get();
			return data;
		},
		reset: function() {
			this.day = 0;
			this.timeOfDay.reset();
		},
		getSaveData: function() {
			const data = {};
			data.day = this.day;
			data.period = this.timeOfDay.getSaveData();
			return data;
		},
		setLoadData: function(data) {
			this.day = data.day;
			if (isNaN(day)) {
				this.day = 0;
			} else {
				this.day = data.day;
			}
			this.timeOfDay.setLoadData(data.period);
		}			
	});

	function observerFunc(instance, event) {
		if (instance === sc.calendar.day) {
			const day = instance.day;
			switch (event) {
				case sc.DAY_MSG.STARTED: {
					console.log(`Day ${day} has started`);
					break;
				} 
				case sc.DAY_MSG.ENDED: {
					console.log(`Day ${day} has ended.`);
				}
			}
		} else if (instance === sc.calendar.day.timeOfDay) {
			const timeOfDay = instance.get();
			switch (event) {
				case sc.TIME_OF_DAY_MSG.STARTED: {
					console.log(`It is now ${timeOfDay}.`);
					break;
				} 
				case sc.TIME_OF_DAY_MSG.ENDED: {
					console.log(`It is no longer ${timeOfDay}.`);
				}
			}				
		}
	}

	sc.CalendarModel = ig.GameAddon.extend({
		day: new sc.DayState,
		modelChanged: observerFunc,
		init: function() {
			this.parent("Calendar");
			ig.storage.register(this);
			sc.Model.addObserver(this.day, this);
			sc.Model.addObserver(this.day.timeOfDay, this);
		},
		onStorageSave: function(data) {
			data.calendar = this.day.getSaveData();
		},
		set: function(newDay, newPeriod, notifyChange) {
			this.day.set(newDay, newPeriod, notifyChange);
		},
		get: function() {
			return this.day.get();
		},
		onReset: function() {
			this.day.reset();
		},
		change: function(newDay, newPeriod) {
			this.day.change(newDay, newPeriod);
		},
		onStoragePreLoad: function(data) {
			this.day.setLoadData(data);
		}
	});

	ig.addGameAddon(function() {
		return sc.calendar = new sc.CalendarModel;
	});
});
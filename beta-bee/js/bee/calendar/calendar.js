ig.module("bee.calendar.calendar").requires("impact.base.game").defines(function() {

	sc.BaseCalendarComponent = ig.Class.extend({
		observers: [],
		interval: [],
		notify: function(value, args = []) {
			sc.Model.notifyObserver(this, value, args);
		},
		addObserver: function(instance) {
			sc.Model.addObserver(this, instance);
		},
		removeObserver: function(instance) {
			sc.Model.removeObserver(this, instance);
		},
		next: function() { return true; },
		set: function() {},
		change: function() {},
		get: function() { },
		gotoLast: function() {
			if (this.interval.length) {
				this.change(this.interval.length - 1);
			}
		},
		getSaveData: function() {},
		setLoadData: function() {},
		setInterval: function(interval = []) { 
			this.interval = interval;
		},
		calc: function(value) { 
			if (this.interval.length) {
				return this.interval[value%this.interval.length];
			}
			return value;
		},
		isInRange: function (value) {
			if (this.interval.length) {
				return !(value < 0 || value >= this.interval.length);
			}
			return true;
		} 
	});

	sc.TIME_OF_DAY_MSG = {
		STARTED: 0,
		ENDED: 1
	};

	sc.TimeOfDayState = sc.BaseCalendarComponent.extend({
		period: 0,
		set: function(period, notifyChange = true) {
			// don't need to do anything if nothing changed
			if (this.period === period) {
				return;
			}
			if (!this.isInRange(period)) {
				throw Error(`${period} is not in the specified timeInterval.`);
			}
			this.period = period;

			if (notifyChange) {
				this.notify(sc.TIME_OF_DAY_MSG.STARTED);
			}
		},
		change: function(period) {
			const timeOfDay = this.interval;
			if (!this.isInRange(period)) {
				throw Error(`${period} is not in the specified timeInterval.`);
			}

			if (period < this.period) {
				throw Error(`Time of Day must at or later than ${this.calc(this.period)}.`);
			}

			let maxPeriod = Math.min(period + 1, timeOfDay.length);
			for(let oldPeriod = this.period + 1; oldPeriod < maxPeriod; ++oldPeriod) {
				this.remove(true);
				this.set(oldPeriod);
			} 
		},
		next: function() {
			let nextPeriod = this.period + 1;
			if (this.isInRange(nextPeriod)) {
				this.change(nextPeriod);
				return true;
			}
			return false;
		},
		remove: function(notifyChange) {
			if (notifyChange) {
				this.notify(sc.TIME_OF_DAY_MSG.ENDED);
				this.period = -1;
			}
		},
		get: function(format = true) {
			if (format) {
				return this.calc(this.period);
			} 
			return this.period;
			
		},
		reset: function() {
			this.period = 0;
		},
		getSaveData: function() {
			return this.period;
		},
		setLoadData: function(period) {
			if (isNaN(period)) {
				this.set(0, false);
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
		change: function(newDay, newPeriod, notifyChange = true) {
			for(let nextDay = this.day + 1; nextDay <= newDay; ++nextDay) {
				this.timeOfDay.gotoLast();
				this.timeOfDay.remove(true);
				this.set(nextDay, 0);
			}
			this.timeOfDay.change(newPeriod);
		},
		get: function(format = true) {
			const data = {};
			if (format) {
				data.day = this.calc(this.day);
			} else {
				data.day = this.day;
			}
			data.period = this.timeOfDay.get(format);
			return data;
		},
		next: function() {
			let nextDay = this.day + 1;
			this.change(nextDay, 0);
			return true;
		},
		nextPeriod: function() {
			return this.timeOfDay.next();
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
		addObserver: function(instance) {
			this.parent(instance);
			this.timeOfDay.addObserver(instance);
		},
		removeObserver: function(instance) {
			this.parent(instance);
			this.timeOfDay.removeObserver(instance);
		},
		setLoadData: function(data) {
			const day = data.day;
			if (isNaN(day)) {
				this.day = 0;
			} else {
				this.day = day;
			}
			this.timeOfDay.setLoadData(data.period);
		},
		getTimeOfDayInstance: function() {
			return this.timeOfDay;
		}
	});

	sc.CalendarState = ig.Class.extend({
		day: null,
		formatFunction: null,
		init: function() {
			this.day = new sc.DayState;
		},
		setPeriodInterval: function(value) {
			const timeOfDay = this.getPeriodInstance();
			timeOfDay.setInterval(value);
		},
		setDayInterval: function(value) {
			this.day.setInterval(value);
		},
		setFormatFunction: function(func) {
			if (typeof func === "function") {
				this.formatFunction = func;
			}
		},
		format: function(valueToFormat, typeOfFormat) {
			const func = this.formatFunction;
			if (typeof func === "function") {
				return func(this, valueToFormat, typeOfFormat);
			}
			return valueToFormat;
		},
		onVarAccess: function(request, pathArr) {
			if (pathArr[0] === "calendar") {
				if (pathArr.length === 2) {
					const dayData = this.day.get();
					const typeOfFormat = pathArr[1];
					const valueToFormat = dayData[typeOfFormat];
					return this.format(valueToFormat, typeOfFormat);
				} else if(pathArr.length === 3) {
					return this.format(pathArr[1], pathArr[2]);
				} else if (pathArr.length === 4) {
					const raw = pathArr[3] === "raw" ;
					return this.get(!raw)[pathArr[1]];
				}
			}
		},
		addObserver: function(instance) {
			this.day.addObserver(instance);
		},
		removeObserver: function(instance) {
			this.day.removeObserver(instance);
		},
		getDayInstance: function() {
			return this.day;
		},
		getPeriodInstance: function() {
			return this.day.getTimeOfDayInstance();
		},
		notify: function(dayEvent, timeOfDayEvent) {
			if (!isNaN(dayEvent)) {
				this.day.notify(dayEvent);
			}

			if (!isNaN(timeOfDayEvent)) {
				this.day.timeOfDay.notify(timeOfDayEvent);
			}
		},
		change: function(newDay, newPeriod) {
			this.day.change(newDay, newPeriod);
		},
		set: function(newDay, newPeriod, notifyChange) {
			this.day.set(newDay, newPeriod, notifyChange);
		},
		get: function(format = true) {
			return this.day.get(format);
		},
		nextDay: function() {
			return this.day.next();
		},
		nextPeriod: function() {
			return this.day.nextPeriod();	
		},
		getSaveData: function() {
			return this.day.getSaveData();
		},
		setLoadData: function(data) {
			this.day.setLoadData(data);
		},
		reset: function() {
			this.day.reset();
		}
	});

	sc.Calendar = ig.GameAddon.extend({
		calendarStates: {},
		init: function() {
			this.parent("Calendar");
			ig.storage.register(this);
			ig.vars.registerVarAccessor("calendar", this, null);
		},
		onVarAccess: function(request, pathArr) {
			if (pathArr[0] === "calendar") {
				const calendar = this.get(pathArr[1]);
				if (calendar) {
					const newPath = [pathArr[0]].concat(pathArr.slice(2));
					return calendar.onVarAccess(request, newPath);
				}
			}
			return null;
		},
		add: function(name) {
			const instance = new sc.CalendarState;
			this.calendarStates[name] = instance;
			return instance;
		},
		remove: function(name) {
			delete this.calendarStates[name];
			this.calendarStates[name] = undefined;
			return true;
		},
		get: function(name) {
			return this.calendarStates[name] || null;
		},
		onStorageSave: function(data) {
			data.calendar = {};
			for (const calendarName in this.calendarStates) {
				data.calendar[calendarName] = this.calendarStates[calendarName].getSaveData();
			}
		},
		onStoragePreLoad: function(data) {
			for (const calendarName in data.calendar) {
				const calendar = this.get(calendarName);
				if (calendar) {
					calendar.setLoadData(data.calendar[calendarName]);
				}
			}
		},
		onReset: function() {
			for (const calendarName in this.calendarStates) {
				const calendar = this.get(calendarName);
				calendar.reset();
			}
		}
		
	});

	ig.addGameAddon(function() {
		return sc.calendar = new sc.Calendar;
	});
});
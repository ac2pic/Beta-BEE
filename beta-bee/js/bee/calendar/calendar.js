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
			if (this.isInRange(value)) {
				if (this.interval.length) {
					return this.interval[value%this.interval.length];
				}
			}
			return null;
		},
		isInRange: function (value) {
			if (this.interval.length) {
				return !(value < 0 || value >= this.interval.length);
			}
			return true;
		},
		isValidValue: function (value) {
			if (this.interval.length) {
				return this.interval.includes(value);
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
		onVarAccess: function(path, pathArr) {
			if (pathArr[1] === "period") {
				return this.calc(pathArr[0]);
			}
			return null;
		},
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
		timeOfDay: null,
		init: function() {
			this.timeOfDay = new sc.TimeOfDayState;
		},
		isInRange: function (value) {
			if (!isFinite(value) || value === null)
				return false;
			return value >= this.day;
		},
		calc: function(value) {
			value = Number(value);
			if (this.isInRange(value)) {
				return value;
			}
			return null;
		},
		onVarAccess: function(path, pathArr) {
			if (pathArr[1] === "date") {
				return this.calc(pathArr[0]);
			} else if (pathArr[1] === "period") {
				return this.timeOfDay.onVarAccess(path, pathArr);
			}
			let data = this.get(pathArr[1] !== "raw");
			if (pathArr[0] === "period") {
				return data.period;
			} else if (pathArr[0] === "date") {
				return data.day;
			}
			return null;
		},
		addObserver: function(instance) {
			this.parent(instance);
			this.timeOfDay.addObserver(instance);
		},
		removeObserver: function(instance) {
			this.parent(instance);
			this.timeOfDay.removeObserver(instance);
		},
		isInRange: function (value) {
			return isFinite(value) && value >= this.day;
		},
		set: function(newDay, newPeriod, notifyChange = true) {
			if (this.isInRange(newDay)) {
				throw Error(`Day must be at least ${this.day} but is ${newDay}.`);
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
		getPeriod: function() {
			return this.timeOfDay;
		},
		getSaveData: function() {
			const data = {};
			data.day = this.day;
			data.period = this.timeOfDay.getSaveData();
			return data;
		},
		setLoadData: function(data) {
			const day = data.day;
			if (!isFinite(day)) {
				this.day = 0;
			} else {
				this.day = day;
			}
			this.timeOfDay.setLoadData(data.period);
		},
		reset: function() {
			this.day = 0;
			this.timeOfDay.reset();
		}
	});

	sc.CalendarState = ig.Class.extend({
		date: null,
		formatFunction: null,
		setDate: function(date) {
			this.date = date;
		},
		onVarAccess: function(request, pathArr) {
			if (pathArr.length > 1) {
				if(pathArr[0] === "calendar") {
					// calendar.1.date
					// calendar.1.period
					// calendar.period
					// calendar.period.raw 
					
					if (pathArr.length <= 3) {
						const newArr = pathArr.slice(1);
						return this.date.onVarAccess(newArr.join("."), newArr);
					}
				}
			}
			return null;
		},
		addObserver: function(instance) {
			this.date.addObserver(instance);
		},
		removeObserver: function(instance) {
			this.date.removeObserver(instance);
		},
		getDate: function() {
			return this.date;
		},
		getPeriod: function() {
			return this.date.getPeriod();
		},
		notify: function(dateEvent, periodEvent) {
			if (isFinite(dateEvent)) {
				this.date.notify(dateEvent);
			}

			if (isFinite(periodEvent)) {
				const period = this.date.getPeriod();
				period.notify(periodEvent);
			}
		},
		set: function(newDate, newPeriod, notifyChange) {
			this.date.set(newDate, newPeriod, notifyChange);
		},
		change: function(newDate, newPeriod) {
			this.date.change(newDate, newPeriod);
		},
		get: function(format = true) {
			return this.date.get(format);
		},
		nextDate: function() {
			return this.date.next();
		},
		nextPeriod: function() {
			return this.date.nextPeriod();	
		},
		getSaveData: function() {
			return this.date.getSaveData();
		},
		setLoadData: function(data) {
			this.date.setLoadData(data);
		},
		reset: function() {
			this.date.reset();
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
					return calendar.onVarAccess(newPath.join("."), newPath);
				}
			}
			return null;
		},
		add: function(name, date) {
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
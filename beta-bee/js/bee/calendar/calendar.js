ig.module("bee.calendar.calendar").requires("impact.base.game")defines(function() {
	sc.Calendar = ig.GameAddon.extend({
		day: 0,
		month: 0,
		year: 0,
		init: function() {
			this.parent("Calendar");
			ig.storage.register(this);
		},
		onStorageSave: function(data) {
			data.calendar = {
				day: this.day,
				month: this.month,
				year: this.year
			};
		},
		onStoragePreLoad: function(data) {
			const calendar = data.calendar || {day: 0, month: 0, year: 0};
			this.day = calendar.day;
			this.month = calendar.month;
			this.year = calendar.year;
		}
	});
});
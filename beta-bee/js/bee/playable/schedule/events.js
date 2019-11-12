ig.module("bee.playable.schedule.events").defines(function() {
	sc.SCHEDULE_EVENTS = {};
	
	sc.BaseScheduleEvent = ig.Class.extend({
		init: function() {},
		run: function() {}
	});

	sc.SCHEDULE_EVENTS.LOG = sc.BaseScheduleEvent.extend({
		value: "",
		init: function(data) {
			this.value = data.value;
		},
		run: function() {
			console.log(this.value);
		}
	});
});

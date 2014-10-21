define([
	'jquery',
	'underscore',
	'backbone',
	'utils',
	'moment'
], function($, _, Backbone, utils, moment){


	/**
	 *	Course - BackboneModel
	 *	@desc	holding one single course
	 */
	var Course = Backbone.Model.extend({

		// setting starting and ending to simplify later parsing and display of daily courses
		parse: function(course){
			var split = (course.dates[0].timespan).split(' ');
			(split[1]) ? this.set('starting', split[1]) : '';
			(split[3]) ? this.set('ending', split[3]) : '';
			return course;
		}
	});


	/**
	 *	CourseList - BackboneCollection
	 * 	@desc 	holding all available courses of a user (present and past courses)
	 */
	var CourseList = Backbone.Collection.extend({
		model: Course,
		url: 'js/json/courses-hgessner.json',
	});


	/**
	 *	CourseDetailView - BackboneView
	 *	@desc	detail view for a course
	 */
	var CourseDetailView = Backbone.View.extend({
		model: Course,
		el: '#loadingSpinner',

		initialize: function(){
			this.template = utils.rendertmpl('course_detail');
		},

		render: function(){
			console.log(this.model);
			this.$el.html(this.template({course: this.model}));
			return this;
		}
	});


	/**
	 *	CalendarDay - Backbone.Model
	 *	@desc	model for one selected day containing all relevant courses
	 *			ordering will be done by timeslots
	 */
	var CoursesForDay = Backbone.Collection.extend({
		model: Course
	});


	/**
	 *	CourseSlot - BackboneModel
	 *	@desc	model for a courseslot / timeslot for a given day
	 *			consists of a timeslot and a course model if available
	 */
	var CourseSlot = Backbone.Model.extend({
		defaults: {
			"timeslotbegin": "",
			"timeslotend": "",
			model: Course
		}
	});


	/**
	 *	CourseSlots - BackboneCollection
	 *	@desc	colletion holding all timeslots for a day
	 */
	var CourseSlots = Backbone.Collection.extend({
		model: CourseSlot,

		initialize: function(){
			for (var i=0; i<7; i++){
				var courseslot = new CourseSlot();
				courseslot.set('timeslotbegin', (parseInt("0800")+i*200).toString());
				courseslot.set('timeslotend', (parseInt("1000")+i*200).toString());
				this.add(courseslot);
			}
			this.models[0].set('timeslotbegin', '0800');
		}
	});


	/**
	 *	CalendarDayView - BackboneView
	 * 	@desc	view for one specific day
	 */
	var CalendarDayView = Backbone.View.extend({
		collection: CoursesForDay,
		events: {
			'click li': 'renderCourseDetails'
		},

		initialize: function(){
			this.template = utils.rendertmpl('calendar_day');
			this.CourseSlots = new CourseSlots();
		},

		prepareDaySchedule: function(){
			// TODO: Better to transform it to collection
			var that = this;
			// iterate over collection and paste into timetable array
			_.each(this.collection.models, function(course){
				var currentDate = course.get('currentDate');
				var courseBegin = course.get('dates')[currentDate].begin;
				var courseEnd = course.get('dates')[currentDate].end;
				_.each(that.CourseSlots.models, function(courseslot){
					var timeslotbegin = courseslot.get('timeslotbegin');
					var timeslotend = courseslot.get('timeslotend');
					if ((timeslotbegin <= courseBegin) && (courseEnd <= timeslotend)){
						courseslot.set('model', course);
					}
				});
			});
		},

		renderCourseDetails: function(ev){
			// get model and display view
			ev.preventDefault();
			var courseID = $(ev.target).closest('li').attr('id');

			this.CourseDetailView = new CourseDetailView({model: this.collection.get(courseID)});
			this.CourseDetailView.render();
		},

		render: function(){
			this.$el.html(this.template({CourseSlots: this.CourseSlots}));
			this.$el.trigger("create");
			return this;
		}
	});


	/**
	 *	CalendarPageView - BackboneView
	 * 	Main View fpr calendar
	 */
	var CalendarPageView = Backbone.View.extend({

		attributes: {"id": "calendar"},

		initialize: function(vars){
			// get passed day parameter and init collections
			this.day = vars.day;
			// check for valid date otherwise use current day
			if (!this.day || !moment(this.day, "YYYY-MM-DD", true).isValid()){
				this.day = new Date();
			}
			day = moment(this.day);

			this.CourseList = new CourseList();
			this.CoursesForDay = new CoursesForDay();

			this.listenTo(this.CourseList, "sync", this.renderDay);
			this.listenTo(this.CourseList, "error", this.errorHandler);

			this.listenToOnce(this, "prepareCourses", this.prepareCourses);
			this.listenTo(this, 'getCoursesForDay', this.getCoursesForDay);

			this.template = utils.rendertmpl('calendar');
		},

		prepareCourses: function(){
			new utils.LoadingView({collection: this.CourseList, el: this.$("#loadingSpinner")});
			this.CourseList.fetch();
		},

		renderDay: function(){
			this.trigger('getCoursesForDay');

			this.CalendarDayView = new CalendarDayView({el: this.$("#coursesForDay"), collection: this.CoursesForDay});
			this.CalendarDayView.prepareDaySchedule();
			this.CalendarDayView.render();
		},

		// TODO: Error Handler
		errorHandler: function(){
			console.log('error');
		},

		// get current selected day and filter relevant courses to display
		getCoursesForDay: function(){

			// filter out all courses relevant for the current date
			var coursesForDay = _.filter(this.CourseList.models, function(course){
				if (course.get('starting')){
					var courseStarting = moment(course.get('starting'), "DD.MM.YYYY");
				}
				if (course.get('ending')){
					var courseEnding = moment(course.get('ending'), "DD.MM.YYYY");
				}
				var containsCurrentDay = false;

				if (courseStarting && courseEnding){
					if ((courseStarting <= day) && (courseEnding >= day)){
						// iterate over all dates of a course
						var coursedates = course.get('dates');
						for(var i=0; i < coursedates.length; i++){
							if (coursedates[i].weekdaynr == day.day()){
								containsCurrentDay = true;
								course.set('currentDate', i);
							}
						}
					}
				}
				return containsCurrentDay;

			});

			this.CoursesForDay.add(coursesForDay);
		},

		render: function(){
			this.$el.html(this.template({day: this.day}));
			this.$el.trigger("create");
			this.trigger("prepareCourses");
			return this;
		}
	});

	return CalendarPageView;
});
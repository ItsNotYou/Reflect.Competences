/*
* studiesController
*/
app.controllers.studies = BackboneMVC.Controller.extend({
    name: 'studies',
	modules: {
		'calendar' : 'calendarView',
		'lectures' : 'lecturesView',
		'grades' : 'gradesView',
		'moodle' : 'moodleView'
	},
	/*
	* Um Initialisierungsfunktionen auszuführen
	*/
    init:function(){
    },
	
	default:function(){
		this.index();
	},
	
	calendar:function(day){
		app.loadPage('calendar', 'index', {day:day});
    },

    lectures:function(vvzUrls){
		app.loadPage('lectures', 'index').done(function(){
			
		});
		var vvzHistory = app.currentView.vvzHistory;
		if (vvzUrls != undefined) {
			vvzHistory.reset(JSON.parse(vvzUrls));
		} else {
			vvzHistory.reset();
		}

		this.listenTo(app.currentView, "openVvzUrl", function(vvzHistory) {
			var param = JSON.stringify(vvzHistory.toJSON());
			var url = "studies/lectures/" + encodeURIComponent(param)
			//this.navigate(url);
			alert(1);
			//customHistory.push(url);
		});
		
    },
	
	grades:function(){
		app.loadPage('grades', 'index');
    },
	
	
	moodle:function(courseid){
		app.loadPage('moodle', 'index', {model: app.session, courseid: courseid});
    },
	
});
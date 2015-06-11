/*
* studiesController
*/
app.controllers.studies = BackboneMVC.Controller.extend({
    name: 'studies',
	modules: {
		'calendar' : 'calendarView',
		'lectures' : 'lecturesView',
		'grades' : 'gradesView'
	},
	/*
	* Um Initialisierungsfunktionen auszuführen
	*/
    init:function(){
    },
	
	default:function(){
		
	},
	
	calendar:function(day){
		app.loadPage('calendar', 'index', {day:day});
    },

    lectures:function(vvzUrls){
		var _this = this;
		app.loadPage('lectures', 'index').done(function(){
			var vvzHistory = app.currentView.vvzHistory;
			if (vvzUrls != undefined) {
				vvzHistory.reset(JSON.parse(vvzUrls));
			} else {
				vvzHistory.reset();
			}
	
			/*_this.listenTo(app.currentView, "openVvzUrl", function(vvzHistory) {
				var param = JSON.stringify(vvzHistory.toJSON());
				var url = "studies/lectures/" + encodeURIComponent(param)
			});*/
		});
    },	
	
	grades:function(){
		app.loadPage('grades', 'index');
    },
	
});
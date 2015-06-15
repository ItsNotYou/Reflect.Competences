define(['jquery', 'underscore', 'backbone', 'utils', 'Session'], function($, _, Backbone, utils, Session){

	var Grades = Backbone.Model.extend({

		initialize: function(){
			// get Session information for username / password
			this.session = new Session();
			this.url = "https://api.uni-potsdam.de/endpoints/pulsAPI?action=acm&auth=H2LHXK5N9RDBXMB&datatype=json2";
			this.url += "&user=" + encodeURIComponent(this.session.get('up.session.username'));
			this.url += "&password=" + encodeURIComponent(this.session.get('up.session.password'));
		},

		parse: function(result) {
			return result.jsonObject;
		}
	});

	var GradesView = Backbone.View.extend({

		initialize: function() {
			this.template = utils.rendertmpl("gradeList");
			this.listenTo(this.model, "sync", this.render);
		},

		render: function() {
			this.$el.empty();
			this.$el.append(this.template({grades: this.model.get("grades")}));
			this.$el.trigger("create");
		}
	});

	var GradeAveragesView = Backbone.View.extend({

		initialize: function() {
			
			this.template = utils.rendertmpl("gradeAverages");
			this.listenTo(this.model, "sync", this.render);
		},

		render: function() {
			var averages = undefined;
			if (this.model.get("averageGrade") && this.model.get("lps")) {
				averages = {grade: this.model.get("averageGrade"), lps: this.model.get("lps")};
			}

			this.$el.empty();
			this.$el.append(this.template({averages: averages}));
			this.$el.trigger("create");
		}
	});

	app.views.GradesIndex = Backbone.View.extend({

		attributes: {"id": "grades"},

		initialize: function(p){
			this.page = p.page;
			this.template = utils.rendertmpl('grades');
			
			this.model = new Grades();
			this.listenTo(this.model, "error", this.requestFail);
			_.bindAll(this, 'render', 'requestFail', 'prepareGrade');
			this.render();
		},

		requestFail: function(error) {
			var errorPage = new utils.ErrorView({el: '#gradesHost', msg: 'Zurzeit nicht verfügbar.', module: 'grades', err: error});
		},

		prepareGrade: function() {
			new GradesView({model: this.model, el: this.$("#gradesTable")});
			new GradeAveragesView({model: this.model, el: this.$("#averageData")});
			new utils.LoadingView({model: this.model, el: this.$("#loadingSpinner")});
			this.model.fetch(utils.cacheDefaults());
		},

		render: function(){
			this.$el.html(this.template({}));
			this.page.html(this.$el);
			this.$el.trigger("create");
			this.trigger("render");
			this.prepareGrade();
			return this;
		}
	});
	
	app.views.GradesPage = Backbone.View.extend({
		initialize: function(){
			this.template = utils.rendertmpl('grades');
		},

		render: function(){
			this.$el.html(this.template({}));
			return this;
		}
	});

	return app.views;
});
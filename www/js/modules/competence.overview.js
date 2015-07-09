define([
	'jquery',
	'underscore',
	'backbone',
	'utils',
	'moment',
	'Session',
	'underscore.string',
	'modules/competence.models',
	'cache',
	'hammerjs'
], function($, _, Backbone, utils, moment, Session, _str, Models){

	var context = new Models.Context({username: "Franz"});
	var collection = context.get("competences");
	collection.fetch();

	var CompetenceListView = Backbone.View.extend({

		initialize: function() {
			this.template = utils.rendertmpl("competence.list");

			this.listenTo(this.collection, "sync", this.render);
			this.listenTo(this.collection, "error", this.errorHappened);
		},

		errorHappened: function(a, b, c, d, e) {
		},

		render: function() {
			this.$el.html(this.template({competences: this.collection}));
			this.$el.trigger("create");
			return this;
		}
	});

	var CompetenceView = Backbone.View.extend({

		events: {
			"submit": "submitCompetence"
		},

		initialize: function(options) {
			this.template = utils.rendertmpl("competence.item");
			this.page = options.page;

			this.listenTo(this.collection, "sync", _.bind(this.render, this));
		},

		submitCompetence: function(ev) {
			ev.preventDefault();

			var comment = this.$("#comment").val();
			var model = this.collection.find(function(competence) { return competence.get("name") === this.page}, this);

			model.set("comment", comment);
			model.save({
				success: function() {
					alert("Success");
					debugger;
				},
				error: function() {
					alert("Error");
					debugger;
				}
			});
		},

		render: function() {
			var model = this.collection.find(function(competence) { return competence.get("name") === this.page}, this);
			this.$el.empty();
			if (model) {
				this.$el.append(this.template({competence: model}));
				new CompetenceListView({el: this.$(".subcompetences"), collection: model.get("children")}).render();
			} else {
				this.$el.append("<div>Wir warten noch auf Daten</div>");
			}
			this.$el.trigger("create");

			return this;
		}
	});

	var CompetenceOverviewPageView = Backbone.View.extend({

		attributes: {"id": "competenceOverview"},

		initialize: function(options) {
			this.template = utils.rendertmpl("competence.overview");
			this.page = options.page;
		},

		render: function() {
			this.$el.html(this.template({}));
			this.$el.trigger("create");

			if (this.page) {
				new CompetenceView({el: this.$("#competenceList"), collection: collection, page: this.page}).render();
			} else {
				new CompetenceListView({el: this.$("#competenceList"), collection: collection}).render();
			}

			return this;
		}
	});

	return {
		CompetenceOverviewPageView: CompetenceOverviewPageView
	};
});
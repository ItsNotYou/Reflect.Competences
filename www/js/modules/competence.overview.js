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

	var CompetenceListView = Backbone.View.extend({

		events: {
			"click a": "open"
		},

		initialize: function() {
			this.template = utils.rendertmpl('competence.list');

			this.listenTo(this.collection, "sync", this.render);
			this.listenTo(this.collection, "error", this.errorHappened);
		},

		open: function(event) {
			event.preventDefault();

			var id = $(event.currentTarget).attr("href").slice(1);
			var model = this.collection.at(parseInt(id));

			new CompetenceListView({el: this.$el, collection: model.get("children")}).render();
		},

		errorHappened: function(a, b, c, d, e) {
		},

		render: function() {
			this.$el.html(this.template({competences: this.collection}));
			this.$el.trigger("create");
			return this;
		}
	});

	var CompetenceOverviewPageView = Backbone.View.extend({

		attributes: {"id": "competenceOverview"},

		initialize: function() {
			this.template = utils.rendertmpl('competence.overview');
		},

		render: function() {
			this.$el.html(this.template({}));
			this.$el.trigger("create");

			var collection = new Models.CompetenceCollection();
			new CompetenceListView({el: this.$("#competenceList"), collection: collection});
			collection.fetch();

			return this;
		}
	});

	return {
		CompetenceOverviewPageView: CompetenceOverviewPageView
	};
});
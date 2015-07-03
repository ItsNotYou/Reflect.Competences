define([
	'jquery',
	'underscore',
	'backbone',
	'utils',
	'moment',
	'Session',
	'underscore.string',
	'cache',
	'hammerjs'
], function($, _, Backbone, utils, moment, Session, _str){

	var CompetenceCollection = Backbone.Collection.extend({

		url: function() {
			var url = "http://localhost:8084/competences/xml/competencetree/%s/%s/nocache/";
			return _str.sprintf(url, encodeURIComponent("university"), encodeURIComponent("all"));
		},

		parse: function(response) {
			var competences = response.childNodes[0].childNodes[0].childNodes;
			var parseCompetence = function(competence) {
				var result = {};
				result.icon = competence.getAttribute("icon");
				result.name = competence.getAttribute("name");
				result.children = [];

				var childNodes = competence.childNodes;
				for (var count = 0; count < childNodes.length; count++) {
					var child = childNodes[count];
					if (child.nodeName === "isCompulsory") {
						result.isCompulsory = child.childNodes[0] === "true";
					} else if (child.nodeName === "competence") {
						result.children.push(parseCompetence(child));
					}
				}

				return result;
			};
			var result = _.map(competences, parseCompetence);
			return _.map(competences, parseCompetence);
		}
	});

	var CompetenceOverviewPageView = Backbone.View.extend({

		attributes: {"id": "competenceOverview"},

		initialize: function() {
			this.template = utils.rendertmpl('competence.overview');

			var collection = new CompetenceCollection();
			this.listenTo(collection, "sync", this.syncComplete);
			this.listenTo(collection, "error", this.errorHappened);
			collection.fetch({dataType: "xml"});
		},

		syncComplete: function(a, b, c, d, e) {
		},

		errorHappened: function(a, b, c, d, e) {
		},

		render: function() {
			this.$el.html(this.template({}));
			this.$el.trigger("create");
			return this;
		}
	});

	return {
		CompetenceOverviewPageView: CompetenceOverviewPageView
	};
});
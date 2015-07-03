define([
	'jquery',
	'underscore',
	'backbone',
	'utils',
	'moment',
	'Session',
	'underscore.string',
	'uri/URI',
	'cache',
	'hammerjs'
], function($, _, Backbone, utils, moment, Session, _str, URI){

	var serverUrl = "http://localhost/competence-server/competences";

	var CompetenceModel = Backbone.Model.extend({

		initialize: function(content) {
			this.set("children", new CompetenceCollection(content.children));
		}
	});

	var CompetenceCompletion = Backbone.Model.extend({

		initialize: function() {
		},

		url: function() {
			var url = new URI(serverUrl + "/json/link/create");
			url.segment(this.get("course"))
				.segment(this.get("creator"))
				.segment(this.get("role"))
				.segment(this.get("linkedUser"));
			url.search({
				competences: this.get("competence").get("name"),
				evidences: this.get("evidence")
			});
			return url.toString();
		},

		save: function(attributes, options) {
			var options = options || {};
			options.attrs = {};
			return Backbone.Model.prototype.save.apply(this, [attributes, options]);
		}
	});

	var CompetenceCollection = Backbone.Collection.extend({
		model: CompetenceModel,

		url: function() {
			var url = new URI(serverUrl + "/xml/competencetree");
			url.segment("university")
				.segment("all")
				.segment("nocache");
			return url.toString();
		},

		parse: function(response) {
			var competences = response.childNodes[0].childNodes[0].childNodes;

			var parseCompetence = function(competence) {
				var result = {};
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

			return _.map(competences, parseCompetence);
		},

		fetch: function(options) {
			var options = options || {};
			options.dataType = "xml";
			return Backbone.Collection.prototype.fetch.apply(this, [options]);
		}
	});

	var competence = new CompetenceModel({name: "Hörverstehen A1"});
	var evidence = new CompetenceCompletion({course: "university", creator: "Hendrik", role: "student", linkedUser: "Hendrik", competence: competence, evidence: "App-Reflexion,linkZurReflexionsApp", comment: "Stimmt, Herr XY war tatsächlich vor Ort"});
	console.log(evidence.url());
	evidence.save();

	return {
		CompetenceCollection: CompetenceCollection
	};
});
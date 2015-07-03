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

	var AcquiredCompetences = Backbone.Collection.extend({

		url: function() {
			var url = new URI(serverUrl + "/json/link/overview");
			url.segment(this.user);
			return url.toString();
		},

		parse: function(response) {
			var competences = response.mapUserCompetenceLinks;
			var asEntry = function(key) {
				return _.extend({name: key}, competences[key][0]);
			}
			return _.map(_.keys(competences), asEntry);
		},

		findByCompetence: function(competence) {
			return this.find(function(model) {
				return competence.get("name") === model.get("name");
			});
		}
	});

	var CompetenceComment = Backbone.Model.extend({

		url: function() {
			var url = new URI(serverUrl + "/json/link/comment");
			url.segment(this.get("linkId"));
			url.segment(this.get("linkedUser"))
			url.segment(this.get("course"))
			url.segment(this.get("role"));
			url.search({ text: this.get("text") });
			return url.toString();
		},

		save: function(attributes, options) {
			var options = options || {};
			options.attrs = {};
			return Backbone.Model.prototype.save.apply(this, [attributes, options]);
		}
	});

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
	var evidence = new CompetenceCompletion({course: "2", creator: "Hendrik", role: "student", linkedUser: "Hendrik", competence: competence, evidence: "App-Reflexion,linkZurApp", comment: "Stimmt, Herr XY war tatsächlich vor Ort"});
	console.log(evidence.url());
	evidence.save();

	var acquired = new AcquiredCompetences();
	acquired.user = "Hendrik";
	acquired.fetch({success: function() { console.log("acquired", acquired.toJSON()); }});
	acquired.on("sync", function() {
		var evidenceLink = acquired.findByCompetence(competence);
		console.log("evidence link id", evidenceLink.get("abstractLinkId"));

		var comment = new CompetenceComment(evidence.attributes);
		comment.set("linkId", evidenceLink.get("abstractLinkId"));
		comment.set("text", comment.get("comment"));
		comment.save();
	});

	return {
		CompetenceCollection: CompetenceCollection
	};
});
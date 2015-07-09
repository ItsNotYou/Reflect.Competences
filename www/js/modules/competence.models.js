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
	var evidence = {
		link: "https://github.com/ItsNotYou/Reflect.Competences",
		name: "Reflect.Competences"
	};

	var Context = Backbone.Model.extend({

		initialize: function(attrs) {
			if (!attrs.course) {
				this.set("course", "university");
			}

			var competences = new Competences();
			competences.context = this;
			this.set("competences", competences);
		}
	});

	var Competence = Backbone.Model.extend({

		_competenceCompletionUrl: function() {
			var url = new URI(serverUrl + "/json/link/create");
			url.segment(this.get("context").get("course"))
				.segment(this.get("context").get("username"))
				.segment("student")
				.segment(this.get("context").get("username"));
			url.search({
				competences: this.get("name"),
				evidences: evidence.link + "," + evidence.name
			});
			return url.toString();
		},

		_fetchCompetenceLink: function(competenceName, success, error) {
			var responseSuccess = function(response) {
				var evidences = response.mapUserCompetenceLinks[competenceName];
				var ev = _.find(evidences, function(ev) {
					return ev.evidenceTitel === evidence.link && ev.evidenceUrl === evidence.name;
				});

				if (ev) success(ev.abstractLinkId);
				else error();
			};

			$.ajax({
				url: new URI(serverUrl + "/json/link/overview").segment(this.get("context").get("username")).toString(),
				type: "GET",
				success: responseSuccess,
				error: error
			});
		},

		_commentSubmitUrl: function(abstractLinkId) {
			var url = new URI(serverUrl + "/json/link/comment");
			url.segment(abstractLinkId);
			url.segment(this.get("context").get("username"))
			url.segment(this.get("context").get("course"))
			url.segment("student");
			url.search({ text: this.get("comment") });
			return url.toString();
		},

		_wrapError: function(options) {
			var model = this;
		    var error = options.error;
		    return function(resp) {
				if (error) error(model, resp, options);
				model.trigger('error', model, resp, options);
			};
		},

		save: function(options) {
			var options = options || {};

			var saveComment = _.bind(function() {
				var saveCommentByLink = _.bind(function(abstractLinkId) {
					$.ajax({
						url: this._commentSubmitUrl(abstractLinkId),
						type: "POST",
						dataType: "text",
						success: _.bind(function() {
							if (options.success) options.success(this);
							this.trigger("sync");
						}, this),
						error: this._wrapError(options)
					});
				}, this);

				if (this.get("comment")) {
					this._fetchCompetenceLink(this.get("name"), saveCommentByLink, this._wrapError(options));
				}
			}, this);

			$.ajax({
				url: this._competenceCompletionUrl(),
				type: "POST",
				dataType: "text",
				success: saveComment,
				error: this._wrapError(options)
			});

			this.trigger("request");
			return undefined;
		}
	});

	var Competences = Backbone.Collection.extend({
		model: Competence,

		url: function() {
			var url = new URI(serverUrl + "/xml/competencetree");
			url.segment(this.context.get("course"))
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

				result.context = this.context;
				result.children = new Competences(result.children);
				return result;
			};

			return _.map(competences, parseCompetence, this);
		},

		fetch: function(options) {
			var options = options || {};
			options.dataType = "xml";
			return Backbone.Collection.prototype.fetch.apply(this, [options]);
		}
	});

	/*var context = new Context({course: "2", username: "Franz"});
	var competence = new Competence({context: context, name: "Hörverstehen A2", comment: "Franz war hier"});
	competence.save({
		success: function() { console.log("success"); },
		error: function() { console.log("error"); }
	});*/

	return {
		Context: Context
	};
});
define([
	'jquery',
	'underscore',
	'backbone',
	'router',
	'underscore-string',
	'utils',
	'jquerymobile'], function($, _, Backbone, Router, _str, utils){

		var initialize= function(){
			Router.initialize();

			/**
	 	 	 * Override Backbone.sync to automatically include auth headers according to the url in use
	 	 	 */
			function overrideBackboneSync() {
				var authUrls = ["http://api.uni-potsdam.de/endpoints/roomsAPI"];
				var isStartOf = function(url) {
					return function(authUrl) {
						return _.str.startsWith(url, authUrl);
					};
				};

				var sync = Backbone.sync;
				Backbone.sync = function(method, model, options) {
					var url = options.url || _.result(model, "url");
					if (url && _.any(authUrls, isStartOf(url))) {
						options.headers = _.extend(options.headers || {}, { "Authorization": utils.getAuthHeader() });
					}
					sync(method, model, options);
				};
			}

			/**
		 	 * Initialize Backbone override
		 	 */
			$(overrideBackboneSync);

		};

		return {
			initialize: initialize
		};
});
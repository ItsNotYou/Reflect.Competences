define(['jquery', 'underscore', 'backbone', 'utils'], function($, _, Backbone, utils){

	app.views.CampusPage = Backbone.View.extend({
		attributes: {"id": "campus"},

		initialize: function(){
			this.template = utils.rendertmpl('campus');
		},

		render: function(){
			$(this.el).html(this.template({}));
			$(this.el).trigger("create");
			return this;
		}
	});
});
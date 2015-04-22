define(['jquery', 'underscore', 'backbone', 'utils'], function($, _, Backbone, utils){

	app.views.ImpressumIndex = Backbone.View.extend({
		attributes: {"id": "impressum"},

		initialize: function(){
			this.template = utils.rendertmpl('impressum');
		},

		render: function(){
			$(this.el).html(this.template({}));
			this.page.html(this.$el);
			return this;
		}
	});

	return app.views;
});
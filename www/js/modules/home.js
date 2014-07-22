define(['jquery', 'underscore', 'backbone', 'utils'], function($, _, Backbone, utils){

	app.views.MainPage = Backbone.View.extend({
		attributes: {"id": 'home'},

		initialize: function(){
			this.template = utils.rendertmpl('main.menu');
		},

		render: function(){
			$(this.el).html(this.template({}));
			$(this.el).trigger("create");
			return this;
		}
	});

});
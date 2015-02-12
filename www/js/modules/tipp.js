define(['jquery', 'underscore', 'backbone', 'utils'], function($, _, Backbone, utils){
	//Models--------------------------------------
	//model for tipp items
	var Tipp = Backbone.Model.extend({
	});

	// collection for tipp items
	var Tipps = Backbone.Collection.extend({
		model: Tipp,
		url: 'js/json/tipps.json',
		comparator: 'name',
	});

	//Views-------------------------------------------
	// view for single tipp (details)
	var TippView = Backbone.View.extend({
		tagName: 'div',
		attributes: {"data-role": 'collapsible'},

		initialize: function(){
			_.bindAll(this, 'render');
			this.template = utils.rendertmpl('tipp_detail');
		},

		render: function(){
			this.$el.html(this.template({tipp: this.model.toJSON()}));
			return this;
		}
	});

	// view for several tipps (list)
	var TippsView = Backbone.View.extend({
		anchor: '#tipp-list',

		initialize: function(){
			_.bindAll(this, 'fetchSuccess', 'fetchError', 'render');
			this.collection.fetch({
				success: this.fetchSuccess,
				error: this.fetchError
			});
		},

		fetchSuccess: function() {
			this.render();
		},

		fetchError: function() {
			throw new Error('Error loading JSON file');
		},

		render: function(){
			this.el = $(this.anchor);
			this.collection.each(function(tipp){
				var tippView = new TippView({model: tipp});
				$(this.el).append(tippView.render().el);
			}, this);

			this.el.trigger("create");
			return this;
		}
	});

	// view for the emergency page
	var TippPageView = Backbone.View.extend({

		initialize: function() {
			this.template = utils.rendertmpl('tipp');
		},

		render: function() {
			this.$el.html(this.template({}));
			var tipps = new Tipps();

			var tippsView = new TippsView({collection: tipps});
			this.$el.trigger("create");
			return this;
		}
	});

	return TippPageView;
});
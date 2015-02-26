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

		initialize: function(){
			_.bindAll(this, 'render');
			this.template = utils.rendertmpl('tipp_list');
		},

		render: function(){
			// console.log(this.template({tipp: this.model.toJSON()}));
			this.$el.html(this.template({tipp: this.model.toJSON()}));
			return this;
		}
	});

	// view for several tipps (list)
	var TippListView = Backbone.View.extend({

		initialize: function(){
			_.bindAll(this, 'fetchSuccess', 'fetchError', 'render');
			// this.template = utils.rendertmpl('tipp_list');
			this.collection = new Tipps();
			this.collection.fetch({
				success: this.fetchSuccess,
				error: this.fetchError
			});
			this.render();
		},

		fetchSuccess: function() {
			this.render();
		},

		fetchError: function() {
			throw new Error('Error loading JSON file');
		},

		render: function(){
			this.collection.each(function(tipp){
				var tippView = new TippView({model: tipp});
				this.$el.append(tippView.render().$el);
				// var tippview = this.$el.html(this.template({tipp: tippmodel.toJSON()}));
				// this.$el.append(this.template({tipp: tippmodel.toJSON()}));
			}, this);

			this.$el.trigger("create");
			return this;
		}
	});


	var TippsDetailView = Backbone.View.extend({

	});


	//
	var TippPageView = Backbone.View.extend({

		initialize: function(options) {
			this.template = utils.rendertmpl('tipp');
			this.tippname = options.tippname;
			this.listenTo(this, "renderTippList", this.renderTippList);
			this.listenTo(this, "renderTippDetails", this.renderTippDetails);
		},

		render: function() {
			// console.log('render', this.tippname);
			if(this.tippname){
				this.renderTippDetails();
			}else{
				this.renderTippList();
			}
		},

		renderTippList: function(){	
			// console.log('renderTippList', this.template({}));
			this.$el.html(this.template({}));
			
			var tippList = new TippListView({el: this.$("#tipp-list")});
			this.$el.trigger("create");
			return this;
		},

		renderTippDetails: function(){
			// console.log('renderTippDetails', this.template({}));
			this.$el.html(this.template({name: this.tippname}));

			var tippDetailView = new TippsDetailView({name: this.tippname});
			this.$el.trigger("create");
			return this;		
		}
	});

	return TippPageView;
});
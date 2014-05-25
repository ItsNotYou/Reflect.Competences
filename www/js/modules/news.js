define(['jquery', 'underscore', 'backbone', 'helper', 'date'], function($, _, Backbone, helper, date){

	/*
	 *	Backbone Model - NewsEntry
	 */
	var NewsEntry = Backbone.Model.extend({
		url: 'http://headkino.de/potsdamevents/json/news/view/',

		initialize: function(){
			this.url=this.url+this.id;
		},

		parse: function(response){
			console.log(response);
			return response.vars;
		}
	});

	/*
	 *	Backbone Model - NewsListItem
	 *	can be Source or NewsEntry
	 */

	var NewsListItem = Backbone.Model.extend({

	});

	/*
	 *	Backbone Model - News
	 */
	var News = Backbone.Collection.extend({
		model: NewsListItem,
		url: 'js/json/news.json',

		initialize: function(){
		},

		parse: function(response){
			console.log(response);
			return response.vars.news;
		},
	});

	var NewsSource = Backbone.Collection.extend({
		model: News
	})

	var NewsEntryView = Backbone.View.extend({
		el: '#news-content',

		initialize: function(){
			this.template = helper.rendertmpl('news.detail');
			_.bindAll(this, 'fetchSuccess', 'fetchError', 'render');
			this.model.fetch({
				success: this.fetchSuccess,
				error: this.fetchError,
				dataType: 'jsonp' });
		},

		fetchSuccess: function(){
			this.render();
		},

		fetchError: function(){
			throw new Error('Error loading NewsEntry-JSON file');
		},

		render:function(){
			$(this.el).html(this.template({news: this.model.toJSON()}));
			$(this.el).trigger("create");
			return this;
		}
	});

	var NewsSourceView = Backbone.View.extend({
		el: '#news-content',

		initialize: function(){
			this.template = helper.rendertmpl('news.source');
		},

		render:function(){
			console.log(this.collection);
			$(this.el).html(this.template({newsSource: this.collection.toJSON()}));
			$(this.el).trigger("create");
			return this;
		}
	});

	var NewsView = Backbone.View.extend({
		el: '#news-content',

		initialize: function(){
			this.template = helper.rendertmpl('news.index');
			_.bindAll(this, 'fetchSuccess', 'fetchError', 'render');
			this.collection.fetch({
				success: this.fetchSuccess,
				error: this.fetchError
			});
		},

		fetchSuccess: function(){
			this.render();
		},

		fetchError: function(){
			throw new Error('Error loading News-JSON file');
		},

		render: function(){
			$(this.el).html(this.template({news: this.collection.toJSON()}));
			$(this.el).trigger("create");
			return this;
		}

	});

	var NewsPageView = Backbone.View.extend({
		attributes: {"id": "news"},

		initialize: function(options){
			this.options = options || {};
			this.template = helper.rendertmpl('news');
		},

		render: function(){

			$(this.el).html(this.template({}));
			console.log(this.options.action);
			console.log(this.options.aid);

			if (!this.options.action){
				var news = new News();
				var newsView = new NewsView({collection: news, el: $("#news-content", this.el)});
			} else {
				// handle page action
				if(this.options.action='view'){
					var newsEntry = new NewsEntry({id: this.options.aid});
					var newsEntryView = new NewsEntryView({model: newsEntry, el: $("#news-content", this.el)});
				}
			}

			$(this.el).trigger("create");
			return this;
		},

		news: function(page, id){
			console.log(page);
			console.log(id);
		}
	});

	return NewsPageView;



});


/*


/*
		events: {
			"click ul li.news-entry" : 'renderNewsEntry',
			"click ul li.news-divider" : 'renderNewsSource'
		},


		renderNewsEntry: function(ev){
	      ev.preventDefault();
	      var newsId = $(ev.target).closest('li').attr('id')
	      var newsEntry = this.collection.find(function(model) {
	      	return model.get('News').id == newsId;
	      });

	      var newsEntryView = new NewsEntryView({model: newsEntry});
	      newsEntryView.render();
		},

		renderNewsSource: function(ev){
			ev.preventDefault();
			var newsId = $(ev.target).closest('li').attr('id')
			console.log(this.collection);
			var filteredNews = this.collection.filter(function(model) {
				return model.get('NewsSource').id == newsId;
			});

			var newsSource = new NewsSource(filteredNews);
			console.log(newsSource);


			var newsSourceView = new NewsSourceView({collection: newsSource});
			newsSourceView.render();
		}


*/
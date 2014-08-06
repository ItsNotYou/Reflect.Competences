define(['jquery', 'underscore', 'backbone', 'utils', 'date'], function($, _, Backbone, helper, date){
	var classes = {};

	/*
	 *	Backbone Model - NewsEntry
	 */
	app.models.NewsEntry = Backbone.Model.extend({
		url: 'http://headkino.de/potsdamevents/json/news/view/',

		initialize: function(){
			this.url = this.url+this.id;
		},

		parse: function(response){
			//console.log(response);
			if(response.vars) 
				response = response.vars;
			return response;
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
	app.models.News = Backbone.Collection.extend({
		model: app.models.NewsEntry,
		url: 'http://headkino.de/potsdamevents/json/news/',

		initialize: function(){
		},

		parse: function(response){
			if(response.vars) 
				response = response.vars;
			this.response = response;
			return response.news;
		},
	});

	var NewsSource = Backbone.Collection.extend({
		model: app.models.News
	})

	app.views.NewsView = Backbone.View.extend({
		el: '#news-content',
		inCollection : 'news.index.news', //controller.action.variable
		idInCollection : 'id', //name oder . getrennter Pfad, wo die id in der collection steht für ein objekt
		initialize: function(p){
			this.template = helper.rendertmpl('news.view');
			_.bindAll(this, 'render');
			console.log(p);
			this.model = new app.models.NewsEntry(p);
		},

		render:function(){
			var vars = $.extend(this.model.toJSON(), this.p);
			if(!vars.news)
				vars.news = vars;
			$(this.el).html(this.template(vars));
			$(this.el).trigger("create");
			return this;
		}
	});

	app.views.NewsSource = Backbone.View.extend({
		el: '#news-content',

		initialize: function(p){
			this.template = helper.rendertmpl('news.source');

			_.bindAll(this, 'render');
			console.log(p);
			this.collection = new app.models.News();
			this.collection.fetch({
				success: this.render,
				dataType: 'json' });
		},

		render:function(){
			console.log(this.collection);
			$(this.el).html(this.template({news: this.collection.toJSON()}));
			$(this.el).trigger("create");
			return this;
		}
	});

	app.views.NewsIndex = Backbone.View.extend({
		el: '#news-content',

		initialize: function(){
			this.template = helper.rendertmpl('news.index');
			this.collection = new app.models.News();
		},

		render: function(){
			$(this.el).html(this.template({news: this.collection.toJSON()}));
			$(this.el).trigger("create");
			return this;
		}

	});

	app.views.NewsPage = Backbone.View.extend({
		attributes: {"id": "news"},

		initialize: function(options){
			this.options = options || {};
			this.template = helper.rendertmpl('news');
		},

		render: function(){

			$(this.el).html(this.template({}));
			console.log(this.options.action);
			console.log(this.options.aid);

			/*if (!this.options.action){
				var news = new News();
				var newsView = new NewsView({collection: news, el: $("#news-content", this.el)});
			} else {
				// handle page action
				if(this.options.action='view'){
					var newsEntry = new NewsEntry({id: this.options.aid});
					var newsEntryView = new NewsEntryView({model: newsEntry, el: $("#news-content", this.el)});
				}
			}*/

			$(this.el).trigger("create");
			return this;
		},

		news: function(page, id){
			console.log(page);
			console.log(id);
		}
	});

	return classes; //NewsPageView;
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
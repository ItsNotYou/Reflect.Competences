define(['jquery', 'underscore', 'backbone', 'helper', 'date'], function($, _, Backbone, helper, date){

	/*
	 *
	 */
	var Event = Backbone.Model.extend({
	});

	var Events = Backbone.Collection.extend({
		model: Event,
		url: 'js/json/events.json',

		initialize: function(){
		},

		parse: function(response){
			return response.vars.events;
		},

	});

	var EventView = Backbone.View.extend({
		el: '#events',

		initialize: function(){
			this.template = helper.rendertmpl('events.detail');
		},

		render:function(){
			console.log(this.model);
			$(this.el).html(this.template({event: this.model.toJSON()}));
			$(this.el).trigger("create");
			return this;
		}

	});

	var EventsView = Backbone.View.extend({
		el: '#events',

		events: {
			"click ul li" : 'renderEvent',
		},

		initialize: function(){
			this.template = helper.rendertmpl('events.index');

			_.bindAll(this, 'fetchSuccess', 'fetchError', 'render');
			this.collection.fetch({
				success: this.fetchSuccess,
				error: this.fetchError
			});

			//this.going = LocalStore.get('going', {}); //Liste der vorgemerkten Events laden
	   		//this.disabledLocations = LocalStore.get('disabledLocations', {});

		},



		fetchSuccess: function(){
			this.render();
		},

		fetchError: function(){
			throw new Error('Error loading Opening-JSON file');
		},

		render: function(){
			$(this.el).html(this.template({events: this.collection.toJSON()}));
			$(this.el).trigger("create");
			return this;
		},

		renderEvent: function(ev) {

	      ev.preventDefault();

	      var eventId = $(ev.target).closest('li').attr('id')
	      alert(eventId);

	      var event = this.collection.find(function(model) {

	      	return model.get('Event').id == eventId;
	      });

	      var eventView = new EventView({model: event});
	      eventView.render();
	      //var book = App.collections.searchResults.get(bookId);
/*
	      var BookDetailView = new App.view.BookDetailView({
	          model: book
	        });
	      BookDetailView.render();
*/
	      //book.updateLocation();
	    }
	});

	var EventsPageView = Backbone.View.extend({
		attributes: {"id": "events"},

		initialize: function(){
			this.template = helper.rendertmpl('events');
		},

		render: function(){
			$(this.el).html(this.template({}));

			var events = new Events();
			console.log($("#events", this.el));
			var eventsView = new EventsView({collection: events, el: $("#events", this.el)});

			$(this.el).trigger("create");
			return this;
		}
	});

	return EventsPageView;
});

//going[id] marker in template missing
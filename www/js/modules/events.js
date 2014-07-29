define(['jquery', 'underscore', 'backbone', 'utils', 'date'], function($, _, Backbone, utils, date){

	/*
	 *
	 */
	app.models.Event = Backbone.Model.extend({
		url: 'http://headkino.de/potsdamevents/json/events/view/',
		initialize: function(){
			this.url = this.url + this.id;
		},
		parse: function(response){
			if(response.vars) 
				response = response.vars;
			return response;
		}
	});

	app.models.Events = Backbone.Collection.extend({
		model: app.models.Event,
		//url: 'js/json/events.json',
		url: 'http://headkino.de/potsdamevents/json/events/',

		initialize: function(){
		},

		parse: function(response){
			console.log(response);
			if(response.vars)
				response = response.vars;
			this.response = response;
			return response.events;
		},

	});

	app.views.EventsView = Backbone.View.extend({
		el: '#events',
		inCollection : 'events.index.events', //controller.action.variable
		idInCollection : 'id', //name oder . getrennter Pfad, wo die id in der collection steht für ein objekt
		initialize: function(p){
			this.template = utils.rendertmpl('events.view');
			this.model = new app.models.Event(p);
		},

		render:function(){
			var vars = $.extend(this.model.toJSON(), this.p);
			if(!vars.event)
				vars.event = vars;
			$(this.el, this.page).html(this.template(vars));
			$(this.el, this.page).trigger("create");
			return this;
		}

	});

	app.views.EventsIndex = Backbone.View.extend({
		el: '#events',

		initialize: function(p){
			this.template = utils.rendertmpl('events.index');
			this.collection = new app.models.Events(p);
			//this.going = LocalStore.get('going', {}); //Liste der vorgemerkten Events laden
	   		//this.disabledLocations = LocalStore.get('disabledLocations', {});
		},

		fetchError: function(){
			throw new Error('Error loading JSON file'); 
		},

		render: function(){
			console.log($.extend({events: this.collection.toJSON()}, this.p));
			$(this.el).html(this.template($.extend({events: this.collection.toJSON()}, this.p)));
			$(this.el).trigger("create");
			return this;
		}
	});

	app.views.EventsPage = Backbone.View.extend({

		initialize: function(vars){
			this.template = utils.rendertmpl('events');
		},

		render: function(){
			$(this.el).html(this.template({}));
			$(this.el).trigger("create");
			return this;
		}
	});

});

//going[id] marker in template missing
define(['jquery', 'underscore', 'backbone', 'utils', 'modules/transport.util'], function($, _, Backbone, utils, ht){


  window.Transport = {
    model: {},
    collection: {},
    views: {},
    view: {},
  };

  var TransportViewsTransportList = Backbone.View.extend({

    initialize: function(options) {
      this.stationName = options.stationName;
      var transports = this.collection;
      this.$ul = this.$el.find('ul#transport-list');
      transports.on("reset", this.render, this);
      transports.on("add", this.addOne, this);
      _.bindAll(this, 'addOne');
    },

    template: utils.rendertmpl('transport_listitem_view'),

    addOne: function(journey) {
      this.$ul.append(this.template({journey: journey}));
    },

    render: function() {
      this.$el.find('.stationName').html(this.stationName);
      this.$ul.empty();
      this.collection.each(this.addOne);
      return this;
    }
  });

  var NavigationView = Backbone.View.extend({

    events: {
      "vclick a" : function(ev){
        ev.preventDefault();
        var buttonName = $(ev.target).html();
        this.trigger('select', buttonName);
      }
    },

    activeButton: function(buttonText){
      this.$el.find('a').removeClass('ui-btn-active');
      this.$el.find('a').filter(function(){
        return $(this).text() === buttonText;
      }).addClass('ui-btn-active');
    }
  });

  /*
   *  Transport Page View
   */
  var TransportPageView = Backbone.View.extend({
    attributes: {"id": "transport"},

    initialize: function(){
      this.template = utils.rendertmpl('transport');
      _.bindAll(this, 'spinnerOn', 'spinnerOff');
      this.spinner();

      // check for existing journeys
      if (ht.stations()['G-see'].journeys.length == 0){
        ht.fetchJourneysForAllStations();
      }
    },

    spinner: function(){
      var view = this;
      view.spinnerOn();
      _.each(ht.stations(), function(station){
        station.journeys.once('add', view.spinnerOff);
      });
    },

    spinnerOn:  utils.addLoadingSpinner('transport-result-wrapper'),
    spinnerOff: utils.removeLoadingSpinner('transport-result-wrapper'),

    render: function(){
      $(this.el).html(this.template({}));

      var view = this;

      transportViewTransportList = new TransportViewsTransportList({
        el: this.$el.find('#search-results'),
        events: {
          'vclick #later-button' : function(){
            view.spinner();
            // we just fetch departing journeys for all stations
            _.each(ht.stations(), function(station){
              station.fetchJourneys();
            });
          }
        },
        collection: ht.stations()['G-see'].journeys,
        stationName: ht.stations()['G-see'].name,
      });
      transportViewTransportList.render();

      transportViewNavbar = new NavigationView({
        el: this.$el.find("#from-station-navbar")
      });

      transportViewNavbar.on('select', function(buttonName){
        transportViewTransportList.collection = ht.stations()[buttonName].journeys;
        transportViewTransportList.stationName = ht.stations()[buttonName].name;
        transportViewTransportList.render();
      });

      $(this.el).trigger("create");
      return this;
    }

  });

  return TransportPageView;

});
define(['jquery', 'underscore', 'backbone', 'utils'], function($, _, Backbone, utils){

	var dateutils = {
            // I give this function a German name,
            // because someone introduced German weekday names as keys in opening.json
            tage: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            wochentag: function(date) {
              if (date) {
                return this.tage[date.getDay()]
              }
            },
            hoursColonMinutes: function(date){
              if (date) {
                return date.getHours() + ':' + date.getMinutes();
              }
            },
            openingForWochentag: function(timesArr, wochentag) {
              if (! _.isArray(timesArr)){ return;}
              var day = _.find(timesArr, function(timesForDay){
                //console.log('find day', wochentag, timesArr, timesForDay);
                return timesForDay.day == wochentag;
              });
              if (day){
                return day.opening;
              }
              return false;
            },
            statusAtPlaceAndDate: function(place, date) {
              if (date && place) {
                var _wochentag = this.wochentag(date);
                var opening = this.openingForWochentag(place.times, _wochentag);

                if (opening === false) {
                  return 'closed';
                };

                if ((opening == null) || _.isString(opening)) {
                  return 'closed';
                };

                var time = this.hoursColonMinutes(date);
                if (_.isArray(opening)) {
                  var open = _.some(opening, function(fromTo){
                    return ((fromTo[0] < time) && (fromTo[1] > time))
                  });
                  return (open)? 'open' : 'closed';
                }

                return 'problem'
            }
		}
	};

	app.models.Opening = Backbone.Model.extend({
	});

	app.models.Openings = Backbone.Collection.extend({
		model: app.models.Opening,
		url: 'js/json/opening.json'
	});

	app.views.OpeningView = Backbone.View.extend({
		tagName: 'div',
		attributes: {"data-role": 'collapsible'},

		initialize: function(){
			_.bindAll(this, 'render');
			this.template = utils.rendertmpl('opening_detail');
		},

		render: function(){
			$(this.el).html(this.template({opening: this.model.toJSON()}));
			return this;
		}
	});

	app.views.OpeningIndex = Backbone.View.extend({
		anchor: '#opening-list',

		initialize: function(){
			_.bindAll(this, 'render');
			this.collection = new app.models.Openings();
		},

		beforeRender: function() {
			//this.collection = _.sortBy(this.collection.attributes, 'name');
      		this.collection = this.addTextToTimes(this.collection);
     		var now = new Date();
	
		 	_.each(this.collection.models, function(model){
				model.attributes.statusOpenNow = dateutils.statusAtPlaceAndDate(model.attributes, now);
		 	});
		},

		addTextToTimes: function (collection) {
			var parentThis = this;
            _.each(collection.models, function(model) {
              // console.log('place',place);
              _.each(model.get('times'), function(day){
                // console.log('day', day);
                if(_.isString(day.opening)) {
                  day.opening_text = day.opening;
                  return;
                }

                if(_.isArray(day.opening)){
                  var text = _.map(day.opening, function(fromToArr){
                    // console.log('fromToArr', fromToArr);
                    if (_.isArray(fromToArr)) {
                      return parentThis.fromToDaytimeString(fromToArr[0], fromToArr[1]);
                    } else {
                      return fromToArr;
                    }
                  }).join(' | ');
                  day.opening_text = text;
                  // console.log('text', text);
                  return;
                }

                //console.log('Neither String nor Array');
              })
            });
            return collection;
        },

        fromToDaytimeString: function(from, to) {
			var string = '' + from + ' - ' + to + ' Uhr';
            // console.log('string',string);
            return string;
        },
		render: function() {
			this.el = $(this.anchor);
			// iterate over collection and call EmergencyCallViews render method
			this.collection.each(function(opening){
				var openingView = new app.views.OpeningView({model: opening});
				$(this.el).append(openingView.render().el);
			}, this);
			this.el.trigger("create");
			return this;
		}

	});

	/*
	 *	Opening Page View
	 */
	app.views.OpeningPage = Backbone.View.extend({
    	attributes: {"id": "opening"},

		initialize: function(){
			this.template = utils.rendertmpl('opening');
		},

    	render: function(){
    		$(this.el).html(this.template({}));
    		$(this.el).trigger("create");
    		return this;
		}

  });

});
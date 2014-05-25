/*
* EventController
*/
app.controllers.events = BackboneMVC.Controller.extend({
    name: 'events',
	places: false,
	views:["views/events.index","views/events.view","views/events.set_locations","views/events.place"], //View files des Controllers
	
    view:function(id){
		var self = this;
		app.loadPage(this.name, 'view', 'events/view/' + id, {going:LocalStore.get('going', {})}).done(function(d){
			if(d)
				self.currentEvent = d.vars.event;
			app.activeCon().scrollTop(0); //View nach oben scrollen
		});
    },
	
	/*
	* Um Initialisierungsfunktionen auszuführen
	*/
    init:function(){
	   this.going = LocalStore.get('going', {}); //Liste der vorgemerkten Events laden
	   this.disabledLocations = LocalStore.get('disabledLocations', {}); //
    },
	
	/*
	* Eventliste anzeigen
	*/
    index:function(filter){
		var self = this;
		this.filter = filter;
		app.loadPage(this.name, 'index', 'events', {going:LocalStore.get('going', {})}).done(function(d){
			if(!d) return;
			self.places = d.vars.places; //places lokal speichern
			self.filterIndex(); //Events filtern nach locations und gewählter Zeitraum
			self.setActiveBtn(); //Aktiven Button markieren im Footer
			self.addPullToRefresh(); //Pull-To-Refresh hinzufügen
		});
    },
	
	/*
	* Eventliste einer Location anzeigen
	*/
	place:function(id){
		app.loadPage(this.name, 'place', 'events/place/'+id).done(function(){
			
		});
	},
	
	/*
	* Locations auswählen
	*/
	set_locations: function(){
		if(this.places) { //Wenn die Locations schon lokal vorhanden sind Seite anzeigen
			app.loadPage(this.name, 'set_locations', {places:this.places, disabledLocations:this.disabledLocations}).done(function(){
				track('events/set_locations'); //Aktion tracken
			});
		} else { //Sonst zu events/index gehen
			app.route('events/index');
		}
	},
	
	filter:'',
	/*
	* Eventliste nach filter filtern
	*/
	filterIndex: function(w){
		if(!this.filter)
			this.filter = 'next';
		if(!w) {
			w = this.filter;
		} else
			track('events/filter/'+w);
		var lstr = '', lim = '';
		for(var i in this.disabledLocations) {
			lstr += lim + 'li.location-'+i;
			lim = ',';
		}
		$('#thelist').children('li').css('display', 'none');
		$('#thelist').children('li.show-'+w).not(lstr).css('display', 'block');
		$('#thelist').trigger('resize');
		$('#thelist').trigger('resize');
		this.filter = w;
		this.setActiveBtn();
		window.setTimeout(function(){$(window).trigger('resize');}, 10);
	},
	
	/*
	* Eventliste Pull to Refresh hinzufügen unter iOS
	*/
	addPullToRefresh:function(){
		app.activeCon().pullToRefresh({
			refresh: function (callback) {
				app.refresh(callback);
			}
		});
	},
	
	/*
	* Sticky Headers in der Eventliste hinzufügen (Feature ist deaktiviert aufgrund von nicht befriedigenden Ergebnissen)
	*/
	stickListDividers: function(){
		return;
		$('body').stacks({
			body: '.ui-content', // This is the container that will house your floating element.
			title: '.up-divider', // The identifier for the elements you want to be fixed, can be any type of jQuery selector
			margin: 0,
			offset: 0,
			fixAndroid: $.os.android,
			touch: $.os.ios,
			fixiOS: $.os.ios
		})
	},
	
	/*
	* Locations toggeln
	*/
	toggleLocation: function(it){
		var elements = $('#locationlist').find('.ch-location');
		this.disabledLocations = {};
		track('location/toggle/'+$(it).data('id')+'/'+it.checked);
		var self = this;
		elements.each(function(i, el) {
			if(!el.checked)
				self.disabledLocations[$(el).data('id')] = $(el).data('id');
		});
		LocalStore.set('disabledLocations', this.disabledLocations);
	},
	
	/*
	* Aktiven Button im Footer der Eventliste anhand des aktuellen filters markieren
	*/
	setActiveBtn:function(){
		var klasse = 'ui-btn-active';
		$('.btn-filter-events.'+klasse).removeClass(klasse);
		$('#btn-'+this.filter+'-events', app.footer).addClass(klasse);
	},
	
	/*
	* Das aktuell angezeigte Event im Kalender speichern
	*/
	saveToCalendar:function(){
		if(!this.currentEvent)
			return;
		var e = this.currentEvent;
		var saved = false;

		window.plugins.calendar.createEvent(e.Event.name, e.Place.name, e.Event.description, new Date(parseInt(e.Event.startTime) * 1000), new Date((parseInt(e.Event.startTime) + 3600) * 1000 ),
			function(m){ //Bei erfolgreichem Speichern ausgeführt, unter Android leider nicht ausgeführt
				navigator.notification.alert(e.Event.name + ' am ' + e.Event.DateString + ' wurde deinem Kalender hinzugefügt.', null, 'Gespeichert'); //Nachricht ausgeben
				LocalStore.set('going', e.Event.id, e.Event.id); //Vorgemerkt im Local Storage speichern
				$('#savedInCal'+e.Event.id).show(); //VOrgemerkt Häckchen anzeigen
				saved = true;
				track('events/calendar/'+e.Event.id+'/saved'); //Aktion tracken
			},
			function(m){ //Bei einem Fehler beim Speichern ausgeführt
				if(m != 'User cancelled')
				navigator.notification.alert("Das Event konnte nicht in deinem Kalender gespeichert werden. Bitte überprüfe in den Einstellungen ob du der App den Zugriff auf deinen Kalender erlaubst.", null, 'Fehler'); //Fehlermeldung ausgeben
				saved = false;
				track('events/calendar/'+e.Event.id+'/canceled'); //Aktion tracken
			}
		);
	},
	
});
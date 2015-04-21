var app = {models:{},views:{},controllers:{}};
define([
	'jquery',
	'underscore',
	'backbone',
	'backboneMVC',
	'underscore-string',
	'utils',
	'q',
	'fastclick',
	'jquerymobile',
	'datebox',
	'LocalStore',
	], function($, _, Backbone, BackboneMVC, _str, utils, Q, FastClick){
		//AppRouter-Klasse erstellen
		var AppRouter = BackboneMVC.Router.extend({
			before:function(route){ //wird komischerweise nur ausgeführt, wenn zurücknavigiert wird. Und genau dafür wird diese Funktion benutzt.
				window.backDetected = true; 
			}
		});
		
		
		app = {
			c: {}, //Controller-Objekte werden in diesem Array abgelegt
			controllers: {}, //Controllerklassen
			controllerList: ["controllers/main", "controllers/events", "controllers/news", "controllers/opening"], //In der app vorhandene Controller
			viewType:"text/x-underscore-template", //Templateenginekennung (Underscore)
			requests : [], //Speichert die Rückgabe für jede URL (Cache)
			cacheTimes: [], //Speichert für jede URL die letzte Zeit, wann diese vom Server geladen wurde
			jsonUrl: 'http://headkino.de/potsdamevents/json/', //Base-Url, die auf dem Server angefragt wird
			going : {}, //Liste aller Event-IDs zu denen der Benutzer geht
			testcode: '', //Testcode
			views:{},
			models:{},
			data: {},
			authUrls: ["https://api.uni-potsdam.de/endpoints/roomsAPI",
					"https://api.uni-potsdam.de/endpoints/libraryAPI",
					"https://api.uni-potsdam.de/endpoints/pulsAPI",
					"https://api.uni-potsdam.de/endpoints/moodleAPI",
					"https://api.uni-potsdam.de/endpoints/transportAPI/1.0/",
					"https://api.uni-potsdam.de/endpoints/errorAPI",
					"https://api.uni-potsdam.de/endpoints/personAPI"
			],
			cache: {},
			viewFileExt: 'js', //Dateiendung der View files
			router : new AppRouter(), //Router zuweisen
			/*
			* Intitialisierung
			*/
			initialize: function(){
				detectUA($, navigator.userAgent);
					/**
				 * Override Backbone.sync to automatically include auth headers according to the url in use
				 */
				new FastClick(document.body);
				
				$(document).ready(function() {
  					document.addEventListener("deviceready", onDeviceReady, false);
				});

				/**
				 *	functions get exectuted when device is ready and handles hiding of splashscreen and backButton navigation
				 */
				function onDeviceReady() {
    				// hide splashscreen
    				navigator.splashscreen.hide();
    				// EventListener for BackButton
    				document.addEventListener("backbutton", function(e){
    					if(window.approuter.history.length == 1){
    						e.preventDefault();
    						navigator.app.exitApp();
    					}else{
    						$.mobile.changePage.defaults.transition = 'slidefade';
    						$.mobile.changePage.defaults.reverse = 'reverse';
    						var lastPage = app.router.history[app.router.history.length-2].name;
    						app.router.history.splice(-2);
    						Backbone.history.navigate(lastPage, {trigger:true});
    					}
    				}, false);
				}
				/**
		 	 	 * Override Backbone.sync to automatically include auth headers according to the url in use
		 	 	 */
				function overrideBackboneSync() {
					var authUrls = app.authUrls;
					var isStartOf = function(url) {
						return function(authUrl) {
							return _.str.startsWith(url, authUrl);
						};
					};

					var sync = Backbone.sync;
					Backbone.sync = function(method, model, options) {
						var url = options.url || _.result(model, "url");
						if (url && _.any(authUrls, isStartOf(url))) {
							options.headers = _.extend(options.headers || {}, { "Authorization": utils.getAuthHeader() });
						}
						sync(method, model, options);
					};
				}

				/**
			 	 * Initialize Backbone override
			 	 */
				$(overrideBackboneSync);

				// Initialize external link override
				$(document).on("click", "a", utils.overrideExternalLinks);

				// Register global error handler
				window.onerror = utils.onError;
				
				this.baseUrl = document.location.pathname; 
				this.baseUrl = this.baseUrl.replace(/\/index\.html/, ''); //Anwendungsurl ermitteln
				var that = this;
				$(document).one('app:controllersLoaded', function(){ //Wird ausgeführt wenn alle Controller und Viewtemplates geladen wurden
					that.updateLayout(); //Layout aktualisieren
					that.bindEvents(); //Globale Events zuordnen
					Backbone.history.start({pushState: false, root: that.baseUrl}); //Backbone URL-Routing-Funktion starten
					if(!window.location.hash) { //Wenn keine URL übergeben wurde, das Hauptmenü aufrufen
						that.route("main/menu"); 
					} else { //Sonst aktuelle URL in die app.history aufnehmen
						app.history.push(Backbone.history.fragment); 
					}
				});
				this.loadControllers(this.controllerList); //Alle Controller laden
				$(document).on("click", "a", utils.overrideExternalLinks);
			},
			history:[], //trackt aufgerufene URLs unabhängig von Backbone um auf Fehler besser reagieren zu können
			/*
			* Wrapper für die Backbone route Funktion
			* @url: zu routende URL
			* @noTrigger: true: nur url ändern aber nicht Aktion ausführen
			*/
			route:function(url, noTrigger){
				var trigger = !noTrigger;
				if(trigger) {
					this.history.push(url);
				}
				if(url.charAt(0) == '#')
					url = url.slice(1); 
				if(url == 'home' || url == '')
					url = 'main/menu';
				this.router.navigate(url, {trigger: trigger, replace: false}); //Url auf Controller routen
			},
			/*
			* Initialisiert den Refresh einer URL vom Server
			*/
			refresh:function(callback){
				var url = Backbone.history.fragment; //Aktuelle URL
				this.refreshing = true; //Globales Refreshing aktivieren
				this.setCallback(callback); //Callback setzten
				this.route(url); //Zu refreshende Url routen
			},
			/*
			* Zur letzten URL zurückwechseln, die in app.history gespeichert ist 
			* @noTrigger: Aktion ausführen: false, sonst true
			*/
			previous: function(noTrigger){
				if(this.history[this.history.length - 2]) {
					this.history.pop();
					this.route(this.history[this.history.length - 1], noTrigger);
				}
			},
			callback : function(){},
			/*
			* Globale Callback-Funktion setzen, die nach Request ausgeführt wird
			* @callback: Zu setzende Callback-Funktion
			*/
			setCallback:function(callback){
				var self = this;
				this.callback = function(){
					callback(arguments);
					self.callback = function(){};
				}
			},
			/*
			* Daten und Template verbinden
			* @view: View Url
			* @d: Daten Objekt (vom Server)
			*/
			render: function(view, d){
				var temp = this.template(view); //Template-String aus dem DOM holen
				if(d && d.vars)
					d = d.vars;
				//var temp = _.template(t); //Underscore-Template laden
				return temp(d); //Template mit Daten parsen und zurückgeben
			},
			
			
			/*
			* Wenn nötig Daten vom Server laden, Seite rendern und Seitenübergang vollführen
			* @c: Controllername
			* @a: Actionsname
			* @url: anzufragende URL oder Objekt mit Daten für den View
			* @transition: Als String: jQueryMobile-Pagetransitionsname (Standard: slide), 
						   Oder als Objekt: Parameter für das Rendern des View
			*/
			loadPage: function(c, a, params, transition){
				var q = Q.defer();
				
				/*if(!this.currentView){
					$('#pagecontainer').children().first().remove();
				}*/
				
				
				var page = new app.views[utils.capitalize(c) + 'Page'];
				//console.log(page.el);
				// prepare new view for DOM display
				//$(page.el).attr(page.attributes);
				
				page.render();
				console.log(utils.capitalize(c) + utils.capitalize(a));

				var d = {};
				var response = {};
			
				/*$('body').css('overflow', 'hidden');
				$('#nav-panel').css('display', 'none');*/
				
				var pageContent = page.$el.attr("data-role", "page");
				var pageTitle = pageContent.find('meta[name="title"]').attr('content');

				var header = utils.renderheader({title:pageTitle});
				
				pageContent.css('padding-top', '54px'); 
				$pageContainer = $('#pagecontainer');
				var $header = $pageContainer.find('.ui-header');
				$pageContainer.append(pageContent);
				if($header.length > 0) {
					$header.replaceWith(header);
				} else {
					$pageContainer.append(header);
				}
				var transition = $.mobile.changePage.defaults.transition;
				var reverse = $.mobile.changePage.defaults.reverse;
				
				//$('#pagecontainer').html($(page.el)); //Nur eine Seite im Container, damit keine ID-Konflikte auftreten
				
				var transition = $.mobile.defaultPageTransition;
				// Erste Seite nicht sliden
				if (this.firstPage){
					transition = 'none';
					this.firstPage = false;
				}
				var content = false;
				if(!app.data[c]) 
					app.data[c] = {};
				
				/**
				* Success function, die nachdem Daten vom Server oder aus dem Cache geholt wurden, oder wenn nichts zu holen ist, ausgeführt wird.
				* @param s state object (After request with model.fetch or collection.fetch or custom: 'cached' or 'set' to indicate whether it was fetched from cache or from a collection)
				* @param d data object
				*/
				var success = function(s, d){ 
					if(content) {
						console.log('content');
						if(content.fetchSuccess)
							content.fetchSuccess(s, d);
						content.p = params;
						if(content.beforeRender)
							content.beforeRender();
						if(s == 'set') { //Model aus collection geholt
							if(content.model) {
								content.model.set(d);
								content.model.p = params;
							}
						} else if(s == 'cached') { //Daten aus dem Cache geholt
							if(content.model) {
								content.model.set(content.model.parse(d));
								content.model.p = params;
							}
							if(content.collection) {
								content.collection.set(content.collection.parse(d));
								content.collection.p = params;
							}
						} else { //Daten vom Server geholt
							if(content.collection) {
								response = d = content.collection.toJSON();
								content.collection.p = params;
								if(content.collection.response)
									response = content.collection.response;
							}
							if(content.model) {
								response = d = content.model.toJSON();
								content.model.p = params;
								if(content.model.response)
									response = content.model.response;
							}
						}
						console.log(response);
						if(_.keys(response).length > 0) {
							//alert('response');
							if(!app.data[c]) 
								app.data[c] = {};
							//console.log(app.data[c]);
							app.data[c][a] = response; //Daten speichern
							if(content.model)
								app.cache[content.model.url] = response;
							else if(content.collection) {
								app.cache[content.collection.url] = response;
							}
							//console.log(app.cache);
						}
						content.render();
						var $metas = content.$el.find('meta'); //Meta infos aus Seite in den Header integrieren
						
						if($metas.length > 0){
							var metas = {};
							$metas.each(function(){
								metas[$(this).attr('name')] = $(this).attr('content');
							});
							if(!metas.title) 
								metas.title = pageTitle;
							var header = utils.renderheader(metas);
							//alert(header);
							$pageContainer.find('.ui-header').replaceWith(header);
							$footer = $pageContainer.find('.ui-footer');
							if($footer.length > 0) {
								pageContent.addClass('ui-page-footer-fixed');
							}
						}
					}
					//console.log(page.el);
					//alert(2);
					Q($.mobile.changePage(pageContent, {changeHash: false, transition: transition, reverse: reverse})).done(function(){
						if(!this.currentView){
							//$('#pagecontainer').children().first().remove();
							$('body').css('overflow', 'auto');
							$("body").fadeIn(100);
						}
						this.currentView = page;
						if(_.keys(response).length > 0)
							q.resolve(response, content);
						else
							q.resolve(d, content);
					});
				}
				
				console.log(app.views);
				if(app.views[utils.capitalize(c) + utils.capitalize(a)]) { //Wenn eine View-Klasse für Content vorhanden ist: ausführen
					content = new app.views[utils.capitalize(c) + utils.capitalize(a)](params);
					content.page = $(page.el);
					console.log($(page.el));
			
					if((content.model || content.collection) && content.inCollection) { //Element aus der geladenen Collection holen und nicht vom Server
						var parts = content.inCollection.split('.');
						//console.log(app.data);
						//console.log(content.inCollection);
						try {
							var list = eval('app.data.' + content.inCollection);
						} catch(e) {
						}
						//console.log(list);
						if(list) {
							try {
								var filteredList = _.filter(list, function(item){
									return _.some(item, function(item){
										return eval('item.' + content.idInCollection) == params.id;
									});
								});
							} catch(e){
							}
						}
						//console.log(filteredList);
						if(filteredList)
							d = filteredList[0];
						//console.log(d);
					}
					if(content.collection) { //Content hat eine COllection
						if(app.cache[content.collection.url]) {
							//console.log(app.cache[content.collection.url]);
							//alert('cached');
							success('cached', app.cache[content.collection.url]);
						} else {
							content.collection.fetch({
								success: success,
								error: function(){
								},
								dataType: 'json'
							});
						}
					} else {
						if(content.model) { //Content hat ein Model
							console.log(d);
							if(_.keys(d).length > 0) { //Model bereits in Collection gefunden
								success('set', d);
							}
							else
							if(app.cache[content.model.url]) {
								success('cached', app.cache[content.model.url]);
							} else
								content.model.fetch({
									success: success,
									error: function(){
									},
									dataType: 'json'
								});
						} else { //Content einfach so
							success();
						}
					}
				} else 
					success();

				return q.promise;
				///OLD CODE
				/*this.currentView = page;
				var q = Q.defer();
				if(this.locked) {
					q.resolve();
					return q.promise;
				}
				this.locked = true; //App für weitere Seitenaufruge sperren bis die Seite geladen und gewechselt wurde
				var params = {};
				if(typeof(transition) == 'object') { //Wenn die Transition ein Objekt ist, sind das zusätzliche Parameter für den View
					params = transition;
					transition = false;
				}
		
				if(!transition)
					transition = 'slide'; //Standardtransition
		
				var b = transition[0], back;
				if(back = b == '-') { //Wenn das erste Zeichen im Transitionsname ein '-' ist, die Transition in engegengesetzte Richtung (<-) durchführen (Zum Hauptmenü z.B.)
					transition = transition.substr(1);
				}
				if(window.backDetected) { //Wenn zurücknavigiert wurde Transition auch in engegengesetzte Richtung (<-) durchführen
					back = true;
					window.backDetected = false;
				}
				window.reverseTransition = back;
				var self = this; var samePage = false;
				var callback = function(d){
					if($.mobile.activePage.data('appfunction') == c+'.'+a) {
						$.mobile.activePage.data('appurl', url); //Dem aktuellen Seitencontainer die aktuelle URL zuweisen
						app.locked = false; //App für Clicks freigeben
						q.resolve(d);
						samePage = true;
					}
					var vars = d ? (d.vars ? $.extend(true, {}, d.vars) :$.extend(true, {}, d)) : {}; //Params für den View, wenn vorhanden, in das Datenobjekt integrieren
					$.extend(vars, params);
		
					var html = app.render(c+'.'+a, vars);  //View rendern
					var $con = $('.ui-content', '#'+c+'-'+a); //SeitenContainer selektieren
		
					if(self.refreshing) {
						$con.append(html); //Wenn die Seite durch einen Refresh geladen wird, gerenderten View an die Seite anhängen
						self.callback(); //Und die Callback-Funktion ausführen
					} else {
						$con[0].innerHTML = html; //Gerenderten View in den DOM einfügen
					}
					$con.enhanceWithin(); //jQueryMobile Styling in Container aktualisieren
					
					self.refreshing = false;
					if(samePage) { //Wenn die Seite nicht gewechselt werden muss
						app.locked = false; //App für Clicks freigeben und raus
						return;
					}
					//$.mobile.pageContainer.change will be needed in future versions, 'cause mobile.changePage will be deprecated
					Q($.mobile.changePage('#'+c+'-'+a,{allowSamePageTransition:true,reloadPage:false,changeHash:true,transition:transition, reverse:back})) //Seitenübergang vollführen
					.then(function(){
						$.mobile.activePage.data('appurl', url); //Dem aktuellen Seitencontainer die aktuelle URL zuweisen
						$.mobile.activePage.data('appfunction', c+'.'+a); //Dem aktuellen Seitencontainer den aktuellen Controllerfunktionsnamen zuweisen
						$('a:hover').blur(); //Damit die Hover Class des gedrückten Buttons entfernt wird, Focus genrell clearen
						app.locked = false; //App für Clicks freigeben und raus
						q.resolve(d);
					});
				}
			
				if(url && url != null && typeof(url) == 'string') //Wenn die URL ein String ist, URL anfragen
					app.get(url).done(callback);
				else //Sonst url als Datenobjekt interpretieren und Callback mit URL als Daten ausführen
					callback(url);
				return q.promise;*/
			},
			
			/**
			* Daten vom Server laden
			* @zu ladende URL
			*/
			get: function(url){
				var q = Q.defer();
				if(app.requests[url] && !this.refreshing && app.cacheTimes[url] && Date.now() - app.cacheTimes[url] < 5 * 3600000) { //Alle 5 Stunden wird aktualisiert, sonst aus dem Cache holen, wenn vorhanden
					q.resolve(app.requests[url]);
				} else {
					$.getJSON(this.jsonUrl + url).done(function(d){ app.requests[url] = d; app.cacheTimes[url] = Date.now(); q.resolve(d);}); //Url anfragen
				}
				return q.promise;
			},
			/*
			* Layout aktualsieren (Nach Resize, Orientation Changed, Initialisierung)
			*/
			updateLayout:function(){
				if(!this.header) { //Initialisierung der Variablen
					this.body = $('#wrapper');
					this.header = $('#the_header');
					this.headerContent = $('#header-content');
					this.footerContent = $('#footer-content');
					this.footer = $('#the_footer');
					this.footerHeight = this.footer.height();
					this.layoutCSS = $('#layout-style-css');
					var self = this;
					$(window).resize(function(){ //Layout aktualisieren, wenn die Fenstergröße verändert wird
						self.contentOuter = $('.ui-content').outerHeight() - $('.ui-content').height();
						self.updateLayout();
					});
					if($.os.ios7) //Unter iOS7 dem Header oben mehr Platz geben, da die Menüleiste in die App "hineinragt"
						this.header.addClass('ios7');
					$(window).resize();
					return;
				}
				var hheight = this.header.is(':visible') * this.header.outerHeight(true);
				var fheight = (this.footer.is(':visible')) * this.footer.outerHeight(true);
				if(window.footerAnimating) fheight = 1;
				var height = this.body.height() - hheight - fheight - this.contentOuter + 3;
				this.layoutCSS.html('.ui-content{height:'+height+'px !important;} .app-page{padding-top:'+(hheight - 1)+'px !important;}'); //Seiteninhaltscontainergröße festlegen
			},
			
			/**
			* Globale Events setzen
			*/
			bindEvents:function(){
				var self = this;
				$.ajaxSetup({
					  "error":function() { //Globale AJAX-Fehlerfunktion, wenn z.B. keine Internetverbindung besteht
						  app.locked = false;
						  $('.ui-btn-active', app.activePage()).removeClass('ui-btn-active'); //Aktuell fokussierten Button deaktivieren, dass die selektierungsfarbe verschwindet
						  app.previous(true);
						  var s = 'Es konnte keine Verbindung zum Server hergestellt werden. Bitte überprüfe deine Internetverbindung';
						  if(navigator.notification) //Über Plugin für App
							navigator.notification.alert(s, null, 'Kein Internet'); //Fehlermeldung ausgeben
						  else
							alert(s); //Für Browser
					  }
				});
				$(document).on('pagebeforechange', function(e, a){ //Bevor zur nächsten Seite gewechselt wird
					var toPage = a.toPage;
					if(typeof(a.toPage) == 'string') return;
					var header = $('.header', toPage);
					var footer = $('.footer', toPage);
					/*if($.os.ios) { //Unter iOS Headerinhalt langsam ein- und ausblenden bei Seitenwechesel
						var dur = 300;
						self.headerContent.fadeOut(dur, function(){
							self.headerContent[0].innerHTML = header[0].innerHTML;
							self.headerContent.fadeIn(dur);
						});
					} else { //Unter Android und anderen den Headerinhalt einfach einfügen (Performancegründe)
						self.headerContent[0].innerHTML = header[0].innerHTML;
					}*/
					var duration = 350, animating = 'footer';
					window.footerAnimating = true;
					var dir = window.reverseTransition ? 1 : -1; //Transitionsrichtung für Footeranimation ermitteln
					if(footer.length > 0) { //Wenn die Seite einen Footer hat, anzeigen und animieren
						/*
						self.footer[0].style.display = 'block';
						self.footer.animate({'left':0}, duration, function(){
							window.footerAnimating = false;
							self.updateLayout();
						});*/
					} else {  //Sonst Footer ausblenden
						self.footer.animate({'left':(self.footer.width() * dir)+'px'}, duration, function(){
							self.footer[0].style.display = 'none';
							self.updateLayout();
							window.footerAnimating = false;
						});
					}
					self.updateLayout(animating);
				});
				
				$(document).on('click', 'a[data-rel="back"]', function(){ //Backbutton clicks auf zurücknavigieren mappen
					window.history.back();
				});
		
				$(document).on('click', 'a', function(e){ //Alle Link-Klicks abfangen für internes Backbone-Routing
					var href = $(this).attr('href') || '';
					var target = $(this).attr('target');
					var mapRequest = !(href.indexOf('maps:') == -1 && href.indexOf('geo:') == -1);
					if(href && href.indexOf('javascript:') == -1 && href.indexOf('http://') == -1 && !mapRequest) {
						$('.ui-btn-active', app.activePage()).removeClass('ui-btn-active');
						$(this).addClass('ui-btn-active');
						self.route(href);
					}
					if(!target || target != '_system') {
						e.preventDefault();
					} else {
						if(href)
							track(href);
					}
				})
			},
			/*
			* Momentan aktive Seite zurückgeben
			*/
			activePage: function(){
				return $.mobile.activePage;
			},
			/*
			* InhaltsContainer der momentan aktiven Seite zurückgeben
			*/
			activeCon:function(){
				return $('.ui-content', this.activePage());
			},
			/*
			* SeitenContainer mit @id zurückgeben
			*/
			getPage:function(id){
				return $('#'+id);
			},
			/*
			* @Url in Geräteinternem Browser öffnen
			*/
			openBrowser:function(url){
				track(url);
				try {
					//Für Android
					var ref = navigator.app.loadUrl(url, { openExternal:true });
				} catch (e){
				}
				try {
					//Für iOS
					var ref = window.open(url, '_system'); 
				} catch (e){
					
				}
			},
			/*
			* Alle Controllers und deren Viewtemplates laden
			* @urls: Liste der URLs zu den Controller Dateien
			*/
			loadControllers: function(urls) {
				var that = this;
				require(urls, function(){
					var views = [], modules = [], classNames = [], viewNames = [], appc = [];
					var c = 0, d = 0;
					for(var i in app.controllers) {
						that.controllersLoaded = true;
						app.c[i] = appc[i] = (new app.controllers[i]);
						console.log(app.c[i]);
						if(app.c[i].init) {
							console.log(app.c[i].init);
							app.c[i].init();
						}
						for(var j in appc[i].views) {
							views[c] = 'text!'+appc[i].views[j]+'.' + that.viewFileExt;
							viewNames[c] = appc[i].views[j];
							c++;
						}
						if(appc[i].modules) 
						for(var name in appc[i].modules) {
							modules[d] = 'js/modules/'+name+'.' + that.viewFileExt;
							//alert(modules[d]);
							//classNames[d] = appc[i].modules[name]; //deprectaed
							
							d++;
						}
					}
					require(modules, function(){
						/*for(var i in arguments)
							window[classNames[i]] = arguments[i];*/
						$(document).trigger('app:controllersLoaded');
					});
					
					/*require(views, function(data){
						for(var c in views) {
							var id = that.getTemplateID(viewNames[c]);
							$('body').append($("<script type='" + that.viewType + "' id='" + id + "'>" + arguments[c] + "</script>"));
						}
						$(document).trigger('app:controllersLoaded');
					});*/
				});
			},
			/*
			* Templatename im DOM codieren, damit keine Fehler auftreten
			* @url: View-URL
			*/
			getTemplateID: function(url){
				return url.replace(/\//g, '.');
				return url.replace(/\//g, '-').replace(/\./g, '__');
			},
			/*
			* Templatestring für einen View zurückgeben
			* @url: View-URL
			*/
			template: function(url){
				var id = this.getTemplateID(url);
				return utils.rendertmpl(id);
			}
		}	

		return app;
});

/*
* Betriebssystem ermitteln
*/
var detectUA = function($, userAgent) {
	$.os = {};
	$.os.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
	$.os.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
	$.os.androidICS = $.os.android && userAgent.match(/(Android)\s4/) ? true : false;
	$.os.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
	$.os.iphone = !$.os.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
	$.os.ios7 = userAgent.match(/(iPhone\sOS)\s([7_]+)/) ? true : false;
	$.os.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
	$.os.touchpad = $.os.webos && userAgent.match(/TouchPad/) ? true : false;
	$.os.ios = $.os.ipad || $.os.iphone;
	$.os.playbook = userAgent.match(/PlayBook/) ? true : false;            
	$.os.blackberry10 = userAgent.match(/BB10/) ? true : false;
	$.os.blackberry = $.os.playbook || $.os.blackberry10|| userAgent.match(/BlackBerry/) ? true : false;
	$.os.chrome = userAgent.match(/Chrome/) ? true : false;
	$.os.opera = userAgent.match(/Opera/) ? true : false;
	$.os.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false;
	$.os.ie = userAgent.match(/MSIE 10.0/i) ? true : false;
	$.os.ieTouch = $.os.ie && userAgent.toLowerCase().match(/touch/i) ? true : false;
	$.os.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window);
	//features
	$.feat = {};
	var head = document.documentElement.getElementsByTagName("head")[0];
	$.feat.nativeTouchScroll = typeof(head.style["-webkit-overflow-scrolling"]) !== "undefined" && ($.os.ios||$.os.blackberry10);
	$.feat.cssPrefix = $.os.webkit ? "Webkit" : $.os.fennec ? "Moz" : $.os.ie ? "ms" : $.os.opera ? "O" : "";
	$.feat.cssTransformStart = !$.os.opera ? "3d(" : "(";
	$.feat.cssTransformEnd = !$.os.opera ? ",0)" : ")";
	if ($.os.android && !$.os.webkit)
		$.os.android = false;
}

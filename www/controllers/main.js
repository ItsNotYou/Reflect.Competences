/*
* MainController
*/
app.controllers.main = BackboneMVC.Controller.extend({
    name: 'main',
	views:["home"], //View files des Controllers
	modules:{"home" : "HomePageView"},
	
	/*
	* Um evt. Initialisierungsfunktionen auszuführen
	*/
    init:function(){
    },
	
	default:function(){
		this.index();
	},
	/**
	* Zeigt das Hauptmenü an
	*/
    menu:function(){
		var self = this;
		app.loadPage(this.name, 'menu', {}, '-slide'); //Zeigt das Hauptmenü an
    },
	
	logout:function(){
		var self = this;
		app.loadPage(this.name, 'logout', {}, 'slide'); //Zeigt das Hauptmenü an
    }
	
});
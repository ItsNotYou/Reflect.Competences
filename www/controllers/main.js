/*
* MainController
*/
app.controllers.main = BackboneMVC.Controller.extend({
    name: 'main',
	views:["main.menu"], //View files des Controllers
	modules:{"home" : "HomePageView"},
	
	/*
	* Um evt. Initialisierungsfunktionen auszuführen
	*/
    init:function(){
    },
	
	default:function(){
		this.index();
	},
	/*
	* Zeigt das Menü an
	*/
    menu:function(){
		var self = this;
		app.loadPage(this.name, 'menu', {}, '-slide'); //Zeigt das Hauptmenü an
    }
	
});
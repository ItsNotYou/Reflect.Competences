/*
* MainController
*/
app.controllers.main = BackboneMVC.Controller.extend({
    name: 'main',
	views:["views/main.menu"], //View files des Controllers
	
	/*
	* Um evt. Initialisierungsfunktionen auszuführen
	*/
    init:function(){
    },
	
	/*
	* Zeigt das Menü an
	*/
    menu:function(){
		var self = this;
		app.loadPage(this.name, 'menu', null, '-slide'); //Zeigt das Hauptmenü an
		track('main/menu'); //Trackt die Aktion
    }
	
});
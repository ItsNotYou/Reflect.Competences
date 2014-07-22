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
		alert(2);
    },
	
	/*
	* Zeigt das Menü an
	*/
    menu:function(){
		var self = this;
		alert(1);
		app.loadPage(new HomePageView, this.name, 'menu', null, '-slide'); //Zeigt das Hauptmenü an
    }
	
});
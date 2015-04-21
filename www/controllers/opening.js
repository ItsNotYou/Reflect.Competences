/*
* OpeningController
*/
app.controllers.opening = BackboneMVC.Controller.extend({
    name: 'opening',
	places: false,
	views:["opening","opening_detail"], //View files des Controllers
	modules : {'opening' : 'openingPageView'},
	
	/*
	* Um Initialisierungsfunktionen auszuführen
	*/
    init:function(){
    },
	
	default:function(){
		this.index();
	},
	/*
	* Öffnungszeiten anzeigen
	*/
    index:function(){
		app.loadPage(this.name, 'index');
    },
	
	
});
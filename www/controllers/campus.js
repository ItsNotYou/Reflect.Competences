/*
* campusController
*/
app.controllers.campus = BackboneMVC.Controller.extend({
    name: 'campus',
	views:["campus.index"], //View files des Controllers
	modules:{"campus" : "CampuesPageView"},
	
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
    index:function(){
		var self = this;
		app.loadPage(this.name, 'index', {}, '-slide');
    }
	
});
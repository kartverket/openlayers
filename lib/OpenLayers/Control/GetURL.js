/**
 * @requires OpenLayers/Control.js
 */
OpenLayers.Control.GetURL = 
    OpenLayers.Class( OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonGetURL',

    // css classess of control panels to be hidden/show on toggling fullscreen
    classElemToHide:  ['.searchDiv', '.logoDiv', '.olControlNoSelect', '.selZoom'],
    
    elemsToHideSelector: '',
    
    title: 'GetURL',

    widget: null,

    initialize: function(options) {
        var self = this;
        OpenLayers.Control.prototype.initialize.apply(self,[options]);
        //$(document).bind('click', function (e) {
        //}); // bind
        
        //self.elemsToHideSelector = self.classElemToHide.join(',');
        self.type = OpenLayers.Control.TYPE_BUTTON;
    }, // initialize
    
    draw: function () {
        var self   = this, cName = 'getURL-button nkButton';
	var mapped = 'OpenLayers_Control_GetURL' + self.map.id;
        var imgLoc = OpenLayers.Util.getImageLocation("norges_fs.png");
        var btn    = OpenLayers.Util.createButton( mapped, null, null, imgLoc, 'static');
                    
        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind( self.toggleGetURL, self )
        );
        
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;

        if (self.div == null) {
            self.div = btn;
        } else {
            self.div.appendChild(btn);
        }
              
        return self.div;
    }, // draw
     

    hideControls: function ( target) {        
	var self = this, main =  target || $( self.div );
	main.removeClass('active');
    }, //hideControls


    showControls: function ( target ) {
	var self   = this, main = target || $( self.div );
	var widget = main.find('> .widget'), url = window.location.href;
	if ( ! widget.size() ) {
	    widget = $( 
		'<div class="widget">'+ 
		    '<div class="wrapper">' +
		      '<div class="cnt"></div>'+
		      '<div class="arrow"><div class="arrow"></div></div>' +
		    '</div>'+
		'</div>'
	    ).appendTo( main );
	}
	var cnt = widget.find( '.cnt' );
	if ( ! cnt.size() ) cnt = widget;
	
	cnt.html( url ), main.addClass('active');
    }, // showControls

    enable: function () {
    }, // enable


    disable: function () {
    }, // disable

   
    toggleGetURL: function ( e ) {
	var self = this, main = $(self.div);
	main.hasClass('active') ? 
	   self.hideControls( main ) : self.showControls( main );
    }, // toggleGetURL
    
    toggleControls: function () {      
	var self = this;
    },//togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.GetURL"
}); // OpenLayers.Control.GetURL

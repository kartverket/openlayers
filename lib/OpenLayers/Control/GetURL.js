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
    cnt: null,

    initialize: function(options) {
        var self = this;
        OpenLayers.Control.prototype.initialize.apply(self,[options]);

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
        btn.innerHTML = '<!--[if !IE]>--><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="72.151px" height="38.936px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 72.151 38.936" class="icon embed"><path d="m 51.541,0 -6.91,5.549 14.83,13.918 -14.635,13.919 6.91,5.55 20.415,-19.469 z M 20.415,0 0,19.469 20.61,38.936 27.52,33.387 12.69,19.469 27.325,5.55 z" /><!--<![endif]-->';

        if (self.div == null) {
            self.div = btn;
        } else {
            self.div.appendChild(btn);
        }

	self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

	self.widget = OpenLayers.Util.createWidget( self.cnt, 1 );
	self.div.appendChild( self.widget );
  
        return self.div;
    }, // draw
     

    hideControls: function () {        
	OpenLayers.Element.removeClass( this.div, 'active' );
    }, //hideControls


    showControls: function () {
	this.cnt.innerHTML = window.location.href;
	OpenLayers.Element.addClass( this.div, 'active' );
    }, // showControls

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable
   
    toggleGetURL: function () {
	OpenLayers.Element.hasClass( this.div, 'active' ) ? 
	    this.hideControls() : this.showControls();
    }, // toggleGetURL
    
    toggleControls: function () {      
	var self = this;
    },//togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.GetURL"
}); // OpenLayers.Control.GetURL

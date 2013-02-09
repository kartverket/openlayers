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

	self.widget = document.createElement("div");
        OpenLayers.Element.addClass(self.widget, "widget");
	self.div.appendChild( self.widget );

	self.wrapper = document.createElement("div");
        OpenLayers.Element.addClass(self.wrapper, "wrapper");
	self.widget.appendChild( self.wrapper )

	self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");
	self.wrapper.appendChild( self.cnt )

	self.widgetArrow1 = document.createElement("div");
        OpenLayers.Element.addClass(self.widgetArrow1, "arrow");
	self.wrapper.appendChild( self.widgetArrow1 );

        self.widgetArrow2 = document.createElement("div");
        OpenLayers.Element.addClass(self.widgetArrow2, "arrow");
	self.widgetArrow1.appendChild( self.widgetArrow2 );
              
        return self.div;
    }, // draw
     

    hideControls: function ( target) {        
	var self = this, list = self._hasClass( self.div, 'active', true);
	if ( list.length > 1 ) self.div.setAttribute('class', list.join(' ') );
    }, //hideControls


    showControls: function () {
	var self  = this, list = self._hasClass( self.div, 'active', true);
	self.cnt.innerHTML = window.location.href;
	if ( list.length <= 1 ) {
	  list.push('active'), self.div.setAttribute('class', list.join(' ') );
	}

    }, // showControls

    enable: function () {
    }, // enable


    disable: function () {
    }, // disable

   
    toggleGetURL: function ( e ) {
	var self = this;
	self._hasClass( self.div, 'active' ) ? 
	    self.hideControls() : self.showControls();
    }, // toggleGetURL
    
    toggleControls: function () {      
	var self = this;
    },//togglecontrols

    _hasClass: function ( dom, name, getList ) {         
	var r = new RegExp( '(^|\\s+)'+ name + '($|\\s+)');
	var l = (dom.getAttribute('class') || '').split( r  );
	return getList ? l : (l.length > 1);	
    },//togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.GetURL"
}); // OpenLayers.Control.GetURL

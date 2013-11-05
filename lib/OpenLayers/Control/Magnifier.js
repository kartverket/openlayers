/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.Magnifier = 
    OpenLayers.Class( OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonMagnifier',

    // css classess of control panels to be hidden/show on toggling fullscreen
    classElemToHide:  ['.searchDiv', '.logoDiv', '.olControlNoSelect', '.selZoom'],
    
    elemsToHideSelector: '',
    title: null,
    widget: null,    
    cnt: null,

    element: null,
    ovmap: null,
    size: {w: 180, h: 90},
    layers: []  ,    
    minRectSize: 15,
    minRectDisplayClass: "RectReplacement",
    minRatio: 8,
    maxRatio: 32,    
    mapOptions: null,
    autoPan: false,
    handlers: {},
    resolutionFactor: 1,
    maximized: false,
    maximizeTitle: "",
    minimizeTitle: "",


    initialize: function(options) {
        var self = this;
        OpenLayers.Control.prototype.initialize.apply(self,[options]);

        //self.elemsToHideSelector = self.classElemToHide.join(',');
        self.type = OpenLayers.Control.TYPE_BUTTON;
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Get URL': 'Vis URL'
        });
        
        this.title = OpenLayers.Lang.translate('Get URL');        
    }, // initialize
    
    draw: function () {
        var self   = this, cName = 'getURL-button nkButton';
	var mapped = 'OpenLayers_Control_Magnifier' + self.map.id;
        var btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');
                    
        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind( self.toggleZoomOverlayer, self )
        );
        
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="228px" height="228px" class="icon magnifying-glass" preserveAspectRatio="xMidYMid meet" viewBox="0 0 228 228"><path class="reflection" d="M96.999,162.436c-17.655,0-34.254-6.875-46.739-19.359c-25.772-25.771-25.772-67.706,0-93.479c3.515-3.515,9.213-3.515,12.728,0c3.515,3.515-27.96,40.959,6.601,75.519c33.823,33.823,70.634,1.716,74.149,5.231c3.515,3.515,3.515,9.213,0,12.728C131.254,155.561,114.655,162.436,96.999,162.436"/><path d="M226.036,188.242l-45.055-44.501c-0.2-0.197-0.466-0.309-0.757-0.381c7.812-13.844,12.274-29.83,12.274-46.859c0-52.743-42.756-95.5-95.5-95.5c-52.742,0-95.5,42.757-95.5,95.5c0,52.743,42.758,95.5,95.5,95.5c16.557,0,32.128-4.216,45.702-11.627c-0.071,0.689,0.062,1.279,0.451,1.665l45.056,44.501c1.115,1.102,3.801,0.187,6.001-2.04l29.859-30.232C226.27,192.04,227.151,189.344,226.036,188.242 M17.173,96.501c0-44.017,35.811-79.826,79.826-79.826c44.018,0,79.827,35.809,79.827,79.826s-35.81,79.827-79.827,79.827C52.984,176.328,17.173,140.519,17.173,96.501"/></svg>');

        if (self.div == null) {
          self.div = btn;
        } else {
          self.div.appendChild(btn);
        }
	self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

	self.widget = OpenLayers.Util.createWidget( self.cnt, 1 );
        OpenLayers.Element.addClass(self.widget, "zoomOverlayerWidget");
	document.body.appendChild( self.widget );

	self.track = document.createElement("div");
        OpenLayers.Element.addClass(self.track, "widget zoomOverlayerTrack");
	document.body.appendChild( self.track );

	OpenLayers.Event.observe( self.track, 'mousemove', 
            OpenLayers.Function.bind( self.mouseMove, self )
        );	

	self.div.appendChild( self.widget );
  
	//self.createMap();

        return self.div;
    }, // draw

    /**
     * Method: createMap
     * Construct the map that this control contains
     */
    __createMap: function() {
	self._kiet('her jeg...');

        OpenLayers.Control.prototype.draw.apply(this, arguments);
        if (this.layers.length === 0) {
            if (this.map.baseLayer) {
                var layer = this.map.baseLayer.clone();
                this.layers = [layer];
            } else {
                this.map.events.register("changebaselayer", this, this.baseLayerDraw);
                return this.div;
            }
        }


        // create the overview map
        var options = OpenLayers.Util.extend(
                        {controls: [], maxResolution: 'auto', 
                         fallThrough: false}, this.mapOptions);
        this.ovmap = new OpenLayers.Map(this.cnt, options);
 
	// prevent ovmap from being destroyed when the page unloads, because
        // the OverviewMap control has to do this (and does it).
        //OpenLayers.Event.stopObserving(window, 'unload', this.ovmap.unloadDestroy);

        this.ovmap.addLayers(this.layers);

        if (this.ovmap.getProjection() != this.map.getProjection()) {
            var sourceUnits = this.map.getProjectionObject().getUnits() ||
                this.map.units || this.map.baseLayer.units;
            var targetUnits = this.ovmap.getProjectionObject().getUnits() ||
                this.ovmap.units || this.ovmap.baseLayer.units;
            this.resolutionFactor = sourceUnits && targetUnits ?
                OpenLayers.INCHES_PER_UNIT[sourceUnits] /
                OpenLayers.INCHES_PER_UNIT[targetUnits] : 1;
        }
    },

    hideControls: function () {        
	var self = this, btn = self.div, widget = self.widget, track = self.track;

    	OpenLayers.Element.removeClass( btn,    'active' );
    	OpenLayers.Element.removeClass( widget, 'active' );
    	OpenLayers.Element.removeClass( track,  'active' );
    }, //hideControls
	
    showControls: function () {
	var self = this, btn = self.div, widget = self.widget, track = self.track;
	var target = document.getElementById('map');
	
    	OpenLayers.Element.addClass( btn,    'active' );
    	OpenLayers.Element.addClass( widget, 'active' );
    	OpenLayers.Element.addClass( track,  'active' );
    }, // showControls

    mouseMove : function( e ) {
	var self  = this, widget = self.widget, track = self.track; 
	var where = [e.pageX, e.pageY], position = [];
	var size  = [widget.clientWidth,widget.clientHeight]; 
	var limit = [track.clientWidth, track.clientHeight];

	for ( var i=0; i<where.length; i++ ) {
	  var l = parseInt(size[i]/2), r = size[i]-l;
	  var p = where[i] - l, m = where[i] + r;
	  if ( p < 0 ) 
	    p = 0;
	  else if ( m > limit[i] )
	    p = limit[i] - size[i];
	  position[i] = p;
	}

	var style = 'left:'+position[0]+'px;top:'+position[1]+'px;';
	widget.setAttribute( 'style', style );
    },

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable
   
    toggleZoomOverlayer: function () {
	OpenLayers.Element.hasClass( this.div, 'active' ) ? 
	    this.hideControls() : this.showControls();
    }, // toggleMagnifier
    
    toggleControls: function () {      
	var self = this;
    },//togglecontrols

    CLASS_NAME: "OpenLayers.Control.Magnifier"
}); // OpenLayers.Control.Magnifier

OpenLayers.Util.extend(OpenLayers.Lang.nb, {
    'Copy the following address to share this page': 'Klipp og lim følgende tekst for å dele denne siden'
});

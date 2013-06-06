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
        btn.innerHTML = OpenLayers.Util.hideFromOldIE(
	  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" '+
	  'width="72.151px" height="38.936px" preserveAspectRatio="xMidYMid meet" '+
	  'viewBox="0 0 72.151 38.936" class="icon embed">'+
	  '<path d="m 51.541,0 -6.91,5.549 14.83,13.918 -14.635,13.919 '+
	  '6.91,5.55 20.415,-19.469 z M 20.415,0 0,19.469 20.61,38.936 '+
	  '27.52,33.387 12.69,19.469 27.325,5.55 z" />'
	);

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

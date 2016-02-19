/**
 * @requires OpenLayers/Control/ZoomBox.js
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/Button.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.ZoomToSelection = OpenLayers.Class(
    OpenLayers.Control.Panel, {
    
    title: null,
    
    zoomBox: null,

    createControlMarkup: function(control) {
        var button, 
            span;

        button = document.createElement('button');

        if (control.text) {
            span = document.createElement('span');
            span.innerHTML = control.text;
            button.appendChild(span);
        }
        return button;
    },
    setMap: function(map) {
        this.map = map;

        var zoomBox,
            zoomBoxes = this.map.getControlsByClass('OpenLayers.Control.ZoomBox');

        if (zoomBoxes.length === 0) {
            zoomBox = new OpenLayers.Control.ZoomBox({zoomOnClick: false, text: 'neio'});
            this.map.addControls([zoomBox]);
            this.zoomBox = zoomBox;
        } else {
            this.zoomBox = zoomBoxes[0];
        }

        if (this.handler) {
            this.handler.setMap(map);
        }
    },

    initialize: function(options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Zoom to selection': 'Zoom til valgt område'
        });
        
        this.title = OpenLayers.Lang.translate('Zoom to selection');        
    }, // initialize
    
    draw: function () {
	var self = this;
        var position, size, imgLocation, btn;

        OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);

/*
       btn = new OpenLayers.Control.Button({displayClass: 'olControlZoomBoxBtn',
                                            autoActivate: false,
                                            title: 'Zoom Box',
                                            type: OpenLayers.Control.TYPE_TOGGLE,
                                            eventListeners: { 
                                                'activate' : this.controls[0].activate,
                                                'deactivate': this.controls[0].deactivate
                                            }});
*/
        btn = OpenLayers.Util.createButton(
                    'OpenLayers_Control_SelectZoom' + self.map.id,
                    null,
                    null,
                    null, "static");
        
        btn.title = self.title;
        btn.className = 'button button-zoom-to-selection';
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 32 26" preserveAspectRatio="xMidYMid meet" class="icon zoom-to-selection"><g class="selection-dots"><circle cx="2" cy="2"  r="1.5" /><circle cx="2" cy="8"  r="1.5" /><circle cx="2" cy="14" r="1.5" /><circle cx="2" cy="20" r="1.5" /><circle cx="8"  cy="2"  r="1.5" /><circle cx="8"  cy="20" r="1.5" /><circle cx="14" cy="2"  r="1.5" /><circle cx="14" cy="20" r="1.5" /><circle cx="20" cy="2"  r="1.5" /><circle cx="20" cy="20" r="1.5" /><circle cx="26" cy="2"  r="1.5" /><circle cx="26" cy="8"  r="1.5" /><circle cx="26" cy="14" r="1.5" /><circle cx="26" cy="20" r="1.5" /></g><path class="crosshair" d="M25,19v-4h3v4h4v3h-4v4h-3v-4h-4v-3z" /></svg>');

        //OpenLayers.Element.addClass(btn, 'zoom-to-selection-button');
                
        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind( self.toggleControls, self )
        );

	OpenLayers.Util.appendToggleToolClick({'self':self});

        if (self.div == null) {
            self.div = btn;
        } else {
            self.div.appendChild(btn);
        }
        
        return self.div;                                               
    }, // draw
    redraw: function () {

    },

    hideControls: function (skipToggle) {
	var self = this, btn = self.div;
        if ( ! OpenLayers.Element.hasClass(btn, 'zoom-to-selection-selected') ) return;

        self.zoomBox.deactivate();
        OpenLayers.Element.removeClass(btn, 'zoom-to-selection-selected');

        if (!skipToggle) OpenLayers.Util.renderToggleToolClick({'self': this}, false);
    }, //hideControls

    showControls: function () {
        var self = this, btn = self.div;

        OpenLayers.Util.renderToggleToolClick({'self': this}, true);

        self.zoomBox.activate();
        OpenLayers.Element.addClass(btn, 'zoom-to-selection-selected');
    }, // showControls

    toggleControls: function () {      
	this.zoomBox.active ? this.hideControls() : 
	    this.showControls();
    },//togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.ZoomToSelection"
}); // OpenLayers.Control.ZoomToSelection

       


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
        var position, 
            size, 
            imgLocation,
            btn;

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
                    'OpenLayers_Control_SelectZoom' + this.map.id,
                    null,
                    null,
                    null, "static");
        
        btn.title = this.title;
        btn.style.cursor = "pointer";
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="26" viewBox="0 0 32 26" preserveAspectRatio="xMidYMid meet" class="icon zoom-to-selection"><g class="selection-dots"><circle cx="2" cy="2"  r="1.5" /><circle cx="2" cy="8"  r="1.5" /><circle cx="2" cy="14" r="1.5" /><circle cx="2" cy="20" r="1.5" /><circle cx="8"  cy="2"  r="1.5" /><circle cx="8"  cy="20" r="1.5" /><circle cx="14" cy="2"  r="1.5" /><circle cx="14" cy="20" r="1.5" /><circle cx="20" cy="2"  r="1.5" /><circle cx="20" cy="20" r="1.5" /><circle cx="26" cy="2"  r="1.5" /><circle cx="26" cy="8"  r="1.5" /><circle cx="26" cy="14" r="1.5" /><circle cx="26" cy="20" r="1.5" /></g><path class="crosshair" d="M25,19v-4h3v4h4v3h-4v4h-3v-4h-4v-3z" /></svg>');

        OpenLayers.Element.addClass(btn, 'zoom-to-selection-button');
        
        
        var that = this;
        OpenLayers.Event.observe(btn, 'click',
            //penLayers.Function.bind(this.toggleSelectZoom, this)
            function() {
                if ( that.zoomBox.active ) {
                    that.zoomBox.deactivate();
                    // exemplary class, not defined
                    OpenLayers.Element.removeClass(that.div, 'zoom-to-selection-selected');
                } else {
                    that.zoomBox.activate();
                    OpenLayers.Element.addClass(that.div, 'zoom-to-selection-selected');
                }    
            }
        );

        //this.defaultControl = this.controls[0];

        if (this.div == null) {
            this.div = btn;
        } else {
            this.div.appendChild(btn);
        }
        
        return this.div;                                               
    }, // draw
    redraw: function () {

    },
    
    CLASS_NAME: "OpenLayers.Control.ZoomToSelection"
}); // OpenLayers.Control.ZoomToSelection

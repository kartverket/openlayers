/**
 * @requires OpenLayers/Controls/ZoomBox.js
 * @requires OpenLayers/Controls/Panel.js
 */
OpenLayers.Control.SelectZoom = OpenLayers.Class(
    OpenLayers.Control.Panel, {
    
    title: "Zoom to selection",
    
    initialize: function(options) {
        var btn;
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        this.addControls([new OpenLayers.Control.ZoomBox({zoomOnClick: false})]);
        
        btn = new OpenLayers.Control.Button({displayClass: 'olControlZoomBoxBtn',
                                            autoActivate: false,
                                            title: 'Zoom Box',
                                            type: OpenLayers.Control.TYPE_TOGGLE,
                                            eventListeners: { 
                                                'activate' : this.controls[0].activate,
                                                'deactivate': this.controls[0].deactivate
                                            }});
        
    
        //this.addControls([btn]);
                
        
        //this.displayClass = 'olControlNavToolbar';
    }, // initialize
    
    draw: function () {
        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
        var position, 
            size, 
            imgLocation;

        position = new OpenLayers.Pixel(1,300);
        size = new OpenLayers.Size(68,58);
        imgLocation = OpenLayers.Util.getImageLocation("select-zoom.png");

        this.div = OpenLayers.Util.createDiv(
                    'OpenLayers_Control_SelectZoom' + this.map.id,
                    position,
                    size,
                    imgLocation, "absolute");
        
        this.div.title = this.title;
        this.div.style.cursor = "pointer";
        OpenLayers.Element.addClass(this.div, 'selZoom');
        
        
        var that = this;
        OpenLayers.Event.observe(this.div, 'click',
            //penLayers.Function.bind(this.toggleSelectZoom, this)
            function() {
                if ( that.controls[0].active ) {
                    that.controls[0].deactivate();
                    // exemplary class, not defined
                    OpenLayers.Element.removeClass(that.div,'selected');
                } else {
                    that.controls[0].activate();
                    OpenLayers.Element.addClass(that.div,'selected');
                }    
            }
        );

        //this.defaultControl = this.controls[0];
        
        return this.div;                                               
    }, // draw
    
    
    CLASS_NAME: "OpenLayers.Control.SelectZoom"
}); // OpenLayers.Control.SelectZoom

/**
 * @requires OpenLayers/Control.js
 */
OpenLayers.Control.Logo = OpenLayers.Class( OpenLayers.Control, {
    
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
    },
    
    draw: function () {
        var size, position, imgLocation;
        
        position = new OpenLayers.Pixel(80, 1);
        size = new OpenLayers.Size(197,58);
        imgLocation = OpenLayers.Util.getImageLocation("logo.png");
        
        this.div = OpenLayers.Util.createDiv(
            'OpenLayers_Control_Logo' + this.map_id,
            position,
            size,
            imgLocation, "absolute"
        ); // this.div
        
        OpenLayers.Element.addClass(this.div, 'logoDiv');
        return this.div;
    }, // draw
        
    CLASS_NAME: "OpenLayers.Control.Logo"
}); // OpenLayers.Control.Logo
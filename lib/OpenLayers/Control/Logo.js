/**
 * @requires OpenLayers/Control.js
 */
OpenLayers.Control.Logo = OpenLayers.Class( OpenLayers.Control, {
    
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
    },
    
    draw: function () {
        var imgLocation, img;

        OpenLayers.Control.prototype.draw.apply(this, arguments);
        imgLocation = OpenLayers.Util.getImageLocation("logo.png");

        img = OpenLayers.Util.createImage(
            'OpenLayers_Control_Logo' + this.map.id,
            null,
            null,
            imgLocation, 
            null,
            null,
            null,
            null,
            "Norgeskart.no - Kartverket"
        ); // this.div

        if (this.div === null) {
            this.div = img;
        } else {
            this.div.appendChild(img);
        }
        
        OpenLayers.Element.addClass(this.div, 'logoDiv');
        return this.div;
    }, // draw
        
    CLASS_NAME: "OpenLayers.Control.Logo"
}); // OpenLayers.Control.Logo

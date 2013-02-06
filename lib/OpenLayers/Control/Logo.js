/**
 * @requires OpenLayers/Control.js
 */
OpenLayers.Control.Logo = OpenLayers.Class( OpenLayers.Control, {
    
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
    },
    
    draw: function () {
        var size, position, imgLocation, div;

        OpenLayers.Control.prototype.draw.apply(this, arguments);

        position = new OpenLayers.Pixel(80, 1);
        size = new OpenLayers.Size(197,58);
        imgLocation = OpenLayers.Util.getImageLocation("logo.png");
        div = OpenLayers.Util.createDiv(
            'OpenLayers_Control_Logo' + this.map.id,
            position,
            size,
            imgLocation, "absolute"
        ); // this.div

        if (this.div === null) {
            this.div = div;
        } else {
            this.div.appendChild(div);
        }
        
        return this.div;
    } // draw
}); // OpenLayers.Control.Logo

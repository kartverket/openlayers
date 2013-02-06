/**
 * @requires OpenLayers/PanZoomBar.js
 */
OpenLayers.Control.ZoomBar = OpenLayers.Class( OpenLayers.Control.PanZoomBar, {
    initialize: function (options) {
       OpenLayers.Control.PanZoomBar.prototype.initialize.apply(this,[options]); 
    }, // initialize
    
    draw: function () {
        var sz, centered, px;

        OpenLayers.Control.prototype.draw.apply(this, arguments);
        px = new OpenLayers.Pixel(14,50);
        this.buttons = [];

        sz = new OpenLayers.Size(18,18);
        var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);

        this._addButton("zoomin", "zoom-plus-mini.png", centered.add(0, 5), sz);
        centered = this._addZoomBar(centered.add(0, sz.h + 5));
        this._addButton("zoomout", "zoom-minus-mini.png", centered, sz);

        return this.div;
    }, // draw
    
    CLASS_NAME: "OpenLayers.Control.ZoomBar"
}); // OpenLayes.Control.ZoomBar
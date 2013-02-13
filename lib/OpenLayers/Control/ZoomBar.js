/**
 * @requires OpenLayers/Control/PanZoomBar.js
 */
OpenLayers.Control.ZoomBar = OpenLayers.Class( OpenLayers.Control.PanZoomBar, {
    initialize: function (options) {
       OpenLayers.Control.PanZoomBar.prototype.initialize.apply(this,[options]); 
    }, // initialize
    
    draw: function () {
	// === The original codes. ===
	/*	
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
	*/
	
	// === The codes is changed by kiet. ===
        var sz, centered, px, div = this.div;

	// Force to add zoombar in the wrapper;
	var wrapper = document.createElement("div");
        OpenLayers.Element.addClass( wrapper, "sliderWrapper" );
	div.appendChild( wrapper );
	this.div = wrapper;

        OpenLayers.Control.prototype.draw.apply(this, arguments);
        px = new OpenLayers.Pixel(14,-15);
        this.buttons = [];

        sz = new OpenLayers.Size(18,10);
        var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);

	// The zoom buttons '+' and '-' do not work well.
	// That's why they are not included in the codes.
        //this._addButton("zoomin", "zoom-plus-mini.png", centered.add(0, 5), sz);
        centered = this._addZoomBar(centered.add(0, sz.h + 5));
        //this._addButton("zoomout", "zoom-minus-mini.png", centered, sz);

	this.div = div;
        return this.div;

    }, // draw
    
    CLASS_NAME: "OpenLayers.Control.ZoomBar"
}); // OpenLayes.Control.ZoomBar
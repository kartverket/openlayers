/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Popup/Framed.js
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/BaseTypes/Bounds.js
 * @requires OpenLayers/BaseTypes/Pixel.js
 * @requires OpenLayers/BaseTypes/Size.js
 */

/**
 * Class: OpenLayers.Popup.FramedCloud
 * 
 * Inherits from: 
 *  - <OpenLayers.Popup.Framed>
 */
OpenLayers.Popup.FramedSideAnchored = 
  OpenLayers.Class(OpenLayers.Popup.Framed, {

    /** 
     * Property: contentDisplayClass
     * {String} The CSS class of the popup content div.
     */
    contentDisplayClass: "olFramedSideAnchoredPopupContent",

    /**
     * APIProperty: autoSize
     * {Boolean} Framed SideAnchored is autosizing by default.
     */
    autoSize: true,

    /**
     * APIProperty: panMapIfOutOfView
     * {Boolean} Framed SideAnchored does pan into view by default.
     */
    panMapIfOutOfView: true,

    /**
     * APIProperty: imageSize
     * {<OpenLayers.Size>}
     */
    imageSize: null,

    /**
     * APIProperty: isAlphaImage
     * {Boolean} The FramedSideAnchored does use an alpha image (in honor of the 
     *     decent browser users out there)
     */
    isAlphaImage: true,

    /** 
     * APIProperty: fixedRelativePosition
     * {Boolean} The Framed SideAnchored popup works in just one fixed position.
     */
    fixedRelativePosition: true,

    relativePosition: "tc",

    /**
     * Property: positionBlocks
     * {Object} Hash of differen position blocks, keyed by relativePosition
     *     two-character code string (ie "tl", "tr", "bl", "br")
     */
    positionBlocks: {
        "tl": { // top left
            'offset': new OpenLayers.Pixel(0, 0),
            'padding': new OpenLayers.Bounds(10, 10, 10, 10), // left, bottom, right, top
            'blocks': []
        },
        "tr": { // top right
            'offset': new OpenLayers.Pixel(0, 0),
            'padding': new OpenLayers.Bounds(10, 10, 10, 10),
            'blocks': []
        },
        "bl": { // bottom right
            'offset': new OpenLayers.Pixel(0, 0),
            'padding': new OpenLayers.Bounds(10, 10, 10, 10),
            'blocks': []
        },
        "br": { // bottom left
            'offset': new OpenLayers.Pixel(0, 0),
            'padding': new OpenLayers.Bounds(10, 10, 10, 10),
            'blocks': []
        },
        "tc": { // top center
            'offset': new OpenLayers.Pixel(5, -18),
            'padding': new OpenLayers.Bounds(10, 10, 10, 10),
            'blocks': []
        },
        "cr": { // center right
            'offset': new OpenLayers.Pixel(-6, 0),
            'padding': new OpenLayers.Bounds(10, 10, 10, 10),
            'blocks': []
        },
        "bc": { // bottom center
            'offset': new OpenLayers.Pixel(-6, 6),
            'padding': new OpenLayers.Bounds(10, 10, 10, 10),
            'blocks': []
        },
        "cl": { // center left
            'offset': new OpenLayers.Pixel(6, 0),
            'padding': new OpenLayers.Bounds(10, 10, 10, 10),
            'blocks': []
        },
        "cc": { // center center
            'offset': new OpenLayers.Pixel(0, 0),
            'padding': new OpenLayers.Bounds(10, 10, 10, 10),
            'blocks': []
        }
    },

    updateRelativePosition: function () {
        var positionClass = 'positioned';
        for (positionCode in this.positionBlocks) {
            if (this.positionBlocks.hasOwnProperty(positionCode)) {
                OpenLayers.Element.removeClass(this.groupDiv, positionCode);
            }
        }
        OpenLayers.Element.addClass(this.div, positionClass);
        OpenLayers.Element.addClass(this.groupDiv, this.relativePosition);

        OpenLayers.Popup.Framed.prototype.updateRelativePosition.apply(this, arguments);
    },

    /** 
     * Method: calculateNewPx
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>}
     * 
     * Returns:
     * {<OpenLayers.Pixel>} The the new px position of the popup on the screen
     *     relative to the passed-in px.
     */
    calculateNewPx:function(px) {
        var newPx = px.offset(this.anchor.offset);
        
        //use contentSize if size is not already set
        var size = this.size || this.contentSize;
/*
        var top = (this.relativePosition.charAt(0) == 't');
        newPx.y += (top) ? -size.h : this.anchor.size.h;
*/
        var yPos = this.relativePosition.charAt(0);
        switch (yPos) {
            case 't':
                newPx.y += -size.h;
                break;
            case 'b':
                newPx.y += this.anchor.size.h;
                break;
            case 'c':
                newPx.y += -size.h / 2;
                break;
            default:
                break;
        }

        var xPos = this.relativePosition.charAt(1);
        switch (xPos) {
            case 'l':
                newPx.x += -size.w;
                break;
            case 'r':
                newPx.x += this.anchor.size.w;
                break;
            case 'c':
                newPx.x += -size.w / 2;
                break;
            default:
                break;
        }
        newPx = newPx.offset(this.positionBlocks[this.relativePosition].offset);

        return newPx;   
    },

    /**
     * APIProperty: minSize
     * {<OpenLayers.Size>}
     */
    minSize: new OpenLayers.Size(105, 10),

    /**
     * APIProperty: maxSize
     * {<OpenLayers.Size>}
     */
    maxSize: new OpenLayers.Size(350, 400),

    /** 
     * Constructor: OpenLayers.Popup.FramedSideAnchored
     * 
     * Parameters:
     * id - {String}
     * lonlat - {<OpenLayers.LonLat>}
     * contentSize - {<OpenLayers.Size>}
     * contentHTML - {String}
     * anchor - {Object} Object to which we'll anchor the popup. Must expose 
     *     a 'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>) 
     *     (Note that this is generally an <OpenLayers.Icon>).
     * closeBox - {Boolean}
     * closeBoxCallback - {Function} Function to be called on closeBox click.
     */
    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox, 
                        closeBoxCallback, offset, extraClassName) {

        var pos, x, y;

        OpenLayers.Popup.Framed.prototype.initialize.apply(this, arguments);
        OpenLayers.Element.addClass(this.groupDiv, 'arrow-anchor');
        this.groupDiv.style.position = 'relative';
        this.groupDiv.style.overflow = 'visible';
        this.contentDiv.className = this.contentDisplayClass;
//        this.contentDiv.style.overflow = "visible";
        this.div.style.overflow = "visible";
        if (offset) {
            for (pos in this.positionBlocks) {
                if (this.positionBlocks.hasOwnProperty(pos)) {
                    x = this.positionBlocks[pos]['offset'].x;
                    y = this.positionBlocks[pos]['offset'].y;
                    
                    if (typeof offset.x === "number") {
                        x = offset.x;
                    } 
                    if (typeof offset.addX === "number") {
                        x += offset.addX;
                    }

                    if (typeof offset.y === "number") {
                        y = offset.y;
                    }
                    if (typeof offset.addY === "number") {
                        y += offset.addY;
                    }
                    this.positionBlocks[pos]['offset'] = new OpenLayers.Pixel(x, y);
                }
            }
        }
        if (extraClassName) {
            OpenLayers.Element.addClass(this.div, extraClassName);
        }
    },

    CLASS_NAME: "OpenLayers.Popup.FramedSideAnchored"
});

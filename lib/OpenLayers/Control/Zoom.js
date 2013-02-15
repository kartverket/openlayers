/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Events/buttonclick.js
 */

/**
 * Class: OpenLayers.Control.Zoom
 * The Zoom control is a pair of +/- links for zooming in and out.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.Zoom = OpenLayers.Class(OpenLayers.Control, {
    
    /**
     * APIProperty: zoomInText
     * {String}
     * Text for zoom-in link.  Default is "+".
     */
    zoomInText: "+",

    /**
     * APIProperty: zoomInId
     * {String}
     * Instead of having the control create a zoom in link, you can provide 
     *     the identifier for an anchor element already added to the document.
     *     By default, an element with id "olZoomInLink" will be searched for
     *     and used if it exists.
     */
    zoomInId: "olZoomInLink",

    /**
     * APIProperty: zoomOutText
     * {String}
     * Text for zoom-out link.  Default is "\u2212".
     */
    zoomOutText: "\u2212",

    /**
     * APIProperty: zoomOutId
     * {String}
     * Instead of having the control create a zoom out link, you can provide 
     *     the identifier for an anchor element already added to the document.
     *     By default, an element with id "olZoomOutLink" will be searched for
     *     and used if it exists.
     */
    zoomOutId: "olZoomOutLink",

    /**
     * Method: draw
     *
     * Returns:
     * {DOMElement} A reference to the DOMElement containing the zoom links.
     */
    draw: function() {
        var div = OpenLayers.Control.prototype.draw.apply(this);
	var wrapper = document.createElement('div');
	OpenLayers.Element.addClass( wrapper, 'wrapper');	
	div.appendChild( wrapper );
	
        var links = this.getOrCreateLinks( wrapper );
        var zoomIn = links.zoomIn;
        var zoomOut = links.zoomOut;
        var eventsInstance = this.map.events;
        
        if (zoomOut.parentNode !== div) {
            eventsInstance = this.events;
            eventsInstance.attachToElement(zoomOut.parentNode);
        }
        eventsInstance.register("buttonclick", this, this.onZoomClick);
        
        this.zoomInLink = zoomIn;
        this.zoomOutLink = zoomOut;

        return div;
    },
    
    /**
     * Method: getOrCreateLinks
     * 
     * Parameters:
     * el - {DOMElement}
     *
     * Return: 
     * {Object} Object with zoomIn and zoomOut properties referencing links.
     */
    getOrCreateLinks: function(el) {
        var zoomIn = document.getElementById(this.zoomInId),
            zoomOut = document.getElementById(this.zoomOutId);
        if (!zoomIn) {
            zoomIn = document.createElement("button");
            zoomIn.innerHTML = '<!--[if !IE]>--><svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="plus icon"><path fill-rule="evenodd" d="m 14,27.5 13.5,0 0,-13.5 9,0 0,13.5 13.5,0 0,9 -13.5,0 0,13.5 -9,0 0,-13.5 -13.5,0 z M 63,32 C 63,49.120827 49.120827,63 32,63 14.879173,63 1,49.120827 1,32 1,14.879173 14.879173,1 32,1 49.120827,1 63,14.879173 63,32z"/></svg><!--<![endif]-->';
            zoomIn.className = "olControlZoomIn";
            el.appendChild(zoomIn);
        }
        OpenLayers.Element.addClass(zoomIn, "olButton");
        if (!zoomOut) {
            zoomOut = document.createElement("button");
            zoomOut.appendChild(document.createTextNode(this.zoomOutText));
            zoomOut.innerHTML = '<!--[if !IE]>--><svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="minus icon"><path fill-rule="evenodd" d="m 14,27.5 36,0 0,9 -36,0 zM 63,32 C 63,49.120827 49.120827,63 32,63 14.879173,63 1,49.120827 1,32 1,14.879173 14.879173,1 32,1 49.120827,1 63,14.879173 63,32z"/></svg><!--<![endif]-->';
            zoomOut.className = "olControlZoomOut";
            el.appendChild(zoomOut);
        }
        OpenLayers.Element.addClass(zoomOut, "olButton");
        return {
            zoomIn: zoomIn, zoomOut: zoomOut
        };
    },
    
    /**
     * Method: onZoomClick
     * Called when zoomin/out link is clicked.
     */
    onZoomClick: function(evt) {
        var button = evt.buttonElement;
        if (button === this.zoomInLink) {
            this.map.zoomIn();
        } else if (button === this.zoomOutLink) {
            this.map.zoomOut();
        }
    },

    /** 
     * Method: destroy
     * Clean up.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister("buttonclick", this, this.onZoomClick);
        }
        delete this.zoomInLink;
        delete this.zoomOutLink;
        OpenLayers.Control.prototype.destroy.apply(this);
    },

    CLASS_NAME: "OpenLayers.Control.Zoom"
});

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Events/buttonclick.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 * @requires OpenLayers/Control/PanZoomBar.js
 */
OpenLayers.Control.ZoomBarWithButtons = OpenLayers.Class( OpenLayers.Control.PanZoomBar, {

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

    wrapper: null,
    buttonWrapper: null,
    sliderWrapper: null,

    initialize: function (options) {
        OpenLayers.Control.PanZoomBar.prototype.initialize.apply(this,[options]); 
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Country': 'Norge',
            'Region': 'Landsdel',
            'County': 'Fylke',
            'Municipality': 'Kommune',
            'Street': 'Gate',
            'House': 'Hus',
            'Zoom in': 'Zoom inn',
            'Zoom out': 'Zoom ut' 
        });
    }, // initialize
    
    draw: function () {
        var sz, 
            centered, 
            px,
            sliderWrapper,
            buttonWrapper,
            links,
            zoomIn,
            zoomOut,
            eventsInstance,
            div = this.div;

        OpenLayers.Control.prototype.draw.apply(this, arguments);
        if (!this.wrapper) {
            this.wrapper = document.createElement("div");
            OpenLayers.Element.addClass(this.wrapper, "zoombar-and-buttons-wrapper");
            this.div.appendChild(this.wrapper);
        }
        if (!this.sliderWrapper) {

        	// Force to add zoombar in the wrapper;
        	this.sliderWrapper = document.createElement("div");
            OpenLayers.Element.addClass(this.sliderWrapper, "sliderWrapper");
        	this.div.appendChild(this.sliderWrapper);
            
            px = new OpenLayers.Pixel(14,-15);
            this.buttons = [];

            sz = new OpenLayers.Size(18, 10);
            centered = new OpenLayers.Pixel(px.x + sz.w / 2, px.y);
            centered = this._addZoomBar(centered.add(0, sz.h + 5), this.sliderWrapper);

            this.wrapper.appendChild(this.sliderWrapper);
        }
        if (!this.buttonWrapper) {
            this.buttonWrapper = document.createElement('div');
            OpenLayers.Element.addClass(this.buttonWrapper, 'wrapper');
        
            links = this.getOrCreateLinks(this.buttonWrapper);
            zoomIn = links.zoomIn;
            zoomOut = links.zoomOut;
            eventsInstance = this.map.events;
            
            if (zoomOut.parentNode !== div) {
                eventsInstance = this.events;
                eventsInstance.attachToElement(zoomOut.parentNode);
            }
            eventsInstance.register("buttonclick", this, this.onZoomClick);
            
            this.zoomInLink = zoomIn;
            this.zoomOutLink = zoomOut;
            this.wrapper.appendChild(this.buttonWrapper);
        }

        return this.div;        

    }, // draw
    redraw: function () {
/*
        if (this.div != null) {
            this.removeButtons();
            this._removeZoomBar();
        }  
*/
        this.draw();
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
            zoomIn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="plus icon"><path fill-rule="evenodd" d="m 14,27.5 13.5,0 0,-13.5 9,0 0,13.5 13.5,0 0,9 -13.5,0 0,13.5 -9,0 0,-13.5 -13.5,0 z M 63,32 C 63,49.120827 49.120827,63 32,63 14.879173,63 1,49.120827 1,32 1,14.879173 14.879173,1 32,1 49.120827,1 63,14.879173 63,32z"/></svg>');
            zoomIn.className = "olControlZoomIn";
            zoomIn.setAttribute('title', OpenLayers.Lang.translate('Zoom in'));
            el.appendChild(zoomIn);
        }
        OpenLayers.Element.addClass(zoomIn, "olButton");
        if (!zoomOut) {
            zoomOut = document.createElement("button");
            zoomOut.appendChild(document.createTextNode(this.zoomOutText));
            zoomOut.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="minus icon"><path fill-rule="evenodd" d="m 14,27.5 36,0 0,9 -36,0 zM 63,32 C 63,49.120827 49.120827,63 32,63 14.879173,63 1,49.120827 1,32 1,14.879173 14.879173,1 32,1 49.120827,1 63,14.879173 63,32z"/></svg>');
            zoomOut.className = "olControlZoomOut";
            zoomOut.setAttribute('title', OpenLayers.Lang.translate('Zoom out'));
            el.appendChild(zoomOut);
        }
        OpenLayers.Element.addClass(zoomOut, "olButton");
        return {
            zoomIn: zoomIn, 
            zoomOut: zoomOut
        };
    },
    /** 
    * Method: _addZoomBar
    * 
    * Parameters:
    * centered - {<OpenLayers.Pixel>} where zoombar drawing is to start.
    */
    _addZoomBar:function(centered, parentElement) {
        var id,
            minZoom,
            zoomsToEnd,
            slider,
            sz,
            div,
            self,
            level,
            parent = parentElement || this.div;

        id = this.id + "_" + this.map.id;
        minZoom = this.map.getMinZoom();
        zoomsToEnd = this.map.getNumZoomLevels() - 1 - this.map.getZoom();
        slider = OpenLayers.Util.createDiv(id,
                       centered.add(-1, zoomsToEnd * this.zoomStopHeight), 
                       {w: 20, h: 9},
                       null,
                       "absolute");

        slider.style.cursor = "move";
        slider.className = "slider";
        this.slider = slider;
        
        this.sliderEvents = new OpenLayers.Events(this, slider, null, true, {includeXY: true});
        this.sliderEvents.on({
            "touchstart": this.zoomBarDown,
            "touchmove": this.zoomBarDrag,
            "touchend": this.zoomBarUp,
            "mousedown": this.zoomBarDown,
            "mousemove": this.zoomBarDrag,
            "mouseup": this.zoomBarUp
        });
        
        sz = {
            w: this.zoomStopWidth,
            h: this.zoomStopHeight * (this.map.getNumZoomLevels() - minZoom)
        };

        div = null;
        if (OpenLayers.Util.alphaHack()) {
            div = OpenLayers.Util.createAlphaImageDiv(id, centered,
                                      {w: sz.w, h: this.zoomStopHeight},
                                      null,
                                      "absolute", null, "crop");
            div.style.height = sz.h + "px";
        } else {      
            div = OpenLayers.Util.createDiv(
                'OpenLayers_Control_PanZoomBar_Zoombar' + this.map.id,
                centered,
                //sz,
                {'w': 3, 'h': sz.h }, // kiet: force to get thin line as track for slider.
                null, 
                'static' // kiet: added to let the track to reveal the layout height.
            );
        }
        div.style.cursor = "pointer";
        div.className = "olButton track";
        this.zoombarDiv = div;
        
        parent.appendChild(div);

        this.startTop = parseInt(div.style.top);
        parent.appendChild(slider);

        this.map.events.register("zoomend", this, this.moveZoomBar);

        centered = centered.add(0, 
            this.zoomStopHeight * (this.map.getNumZoomLevels() - minZoom));

        self  = this, height = self.zoomStopHeight; 
        level = self.map.getNumZoomLevels();

        OpenLayers.Event.observe(parent, 'click', function (e) {
            var offsets,
                client,
                difference,
                zoom;

            offsets    = OpenLayers.Util.pagePosition(self.div);
            client     = e.clientY;
            difference =  Math.round((client - offsets[1]) / height);
            zoom = level - (difference - 8); 
            if (zoom < 2) {
                zoom = 2;   // 43616-70 hack
            }
            self.map.zoomTo(zoom);
        });

        return centered; 
    },

     /**
     * Method: onZoomClick
     * Called when zoomin/out link is clicked.
     */
    onZoomClick: function (evt) {
        var button = evt.buttonElement;
        if (button === this.zoomInLink) {
            this.map.zoomIn();
        } else if (button === this.zoomOutLink) {
            if (this.map.getZoom() > 3) {   // 43616-70 hack
                this.map.zoomOut();
            }
        }
    },
    /**
    * Method: zoomBarDrag
    * Called when zoombar is dragged
    */
    zoomBarDrag: function (evt) {
        if (this.mouseDragStart != null) {
            var deltaY = this.mouseDragStart.y - evt.xy.y;
            var offsets = OpenLayers.Util.pagePosition(this.zoombarDiv);
            var sliderClass = 'slider';
            var zoombarHeight = parseInt(this.zoombarDiv.style.height);
            if ((evt.clientY - offsets[1]) > 0 && 
                (evt.clientY - offsets[1]) < zoombarHeight - 2) {
                var newTop = parseInt(this.slider.style.top) - deltaY;
                this.slider.style.top = newTop+"px";
                this.mouseDragStart = evt.xy.clone();

                var positionRatio = newTop / zoombarHeight;

                if (positionRatio > 14 / 18) {
                    sliderClass += ' country-level';
                    this.slider.innerHTML = '<span>' + OpenLayers.Lang.translate('Country') + '</span>';
                } else if (positionRatio > 12 / 18) {
                    sliderClass += ' county-level';
                    this.slider.innerHTML = '<span>' + OpenLayers.Lang.translate('Region') + '</span>';
                } else if (positionRatio > 8 / 18) {
                    sliderClass += ' county-level';
                    this.slider.innerHTML = '<span>' + OpenLayers.Lang.translate('County') + '</span>';
                } else if (positionRatio > 5 / 18) {
                    sliderClass += ' municipality-level';
                    this.slider.innerHTML = '<span>' + OpenLayers.Lang.translate('Municipality') + '</span>';
                } else if (positionRatio > 2 / 18) {
                    sliderClass += ' street-level';
                    this.slider.innerHTML = '<span>' + OpenLayers.Lang.translate('Street') + '</span>';
                } else if (positionRatio > 1 / 18) {
                    sliderClass += ' house-level';
                    this.slider.innerHTML = '<span>' + OpenLayers.Lang.translate('House') + '</span>';
                }

                this.slider.className = sliderClass;

            }
            // set cumulative displacement
            this.deltaY = this.zoomStart.y - evt.xy.y;
            OpenLayers.Event.stop(evt);
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

    disable: function(){
        OpenLayers.Element.addClass(this.div, 'disabled');
    },
    
    enable: function(){
        OpenLayers.Element.removeClass(this.div, 'disabled');
    }, 

    CLASS_NAME: "OpenLayers.Control.ZoomBarWithButtons"
}); // OpenLayes.Control.ZoomBar

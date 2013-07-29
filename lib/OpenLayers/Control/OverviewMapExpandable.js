/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/** 
 * @requires OpenLayers/Control/OverviewMap.js
 */

/**
 * Class: OpenLayers.Control.OverviewMapExpandable
 * The OverviewMapExpandable control creates a small overview map, useful to display the 
 * extent of a zoomed map and your main map and provide additional 
 * navigation options to the user. The small map can be switched between two configurations. 
 * The 'maximized' configuration can switch to a more detailed map layer.
 *
 * Inherits from:
 *  - <OpenLayers.Control.OverviewMap>
 */
 
OpenLayers.Control.OverviewMapExpandable = OpenLayers.Class(OpenLayers.Control.OverviewMap, {

  configuration: {
    'default': {
      size: {
        w: 80,
        h: 90
      }
    },
    'maximized': {
      size: {
        w: 240,
        h: 270
      }
    }
  },
  sizeRatio: null,
  currentConfiguration: 'default',

  initialize: function (options) {
    OpenLayers.Control.OverviewMap.prototype.initialize.apply(this, [options]);
  },
  
  draw: function () {
    OpenLayers.Control.OverviewMap.prototype.draw.apply(this, arguments);
    this.addToggleElement();
    if (this.detailedLayer) {
      this.ovmap.addLayer(this.detailedLayer);
      this.ovmap.layers[1].setVisibility(true);
    }
  },

  destroy: function () {
    OpenLayers.Event.stopObservingElement(this.toggleSizeDiv);
    this.div.removeChild(this.toggleSizeDiv);
    this.toggleSizeDiv = null;
    OpenLayers.Control.OverviewMap.prototype.destroy.apply(this, arguments);
  },

  setMap: function (map) {
    var i, j;
    OpenLayers.Control.OverviewMap.prototype.setMap.apply(this, arguments);
    if (this.detailedLayerId) {
      for (i = 0, j = this.map.layers.length; i < j; i += 1) {
        if (this.map.layers[i].shortid && this.map.layers[i].shortid === this.detailedLayerId) {
          this.detailedLayer = this.map.layers[i].clone();
          break;
        }
      }
    } 
  },
  getSizeRatio: function () {
    var wRatio, hRatio;
    if (this.sizeRatio) {
      return this.sizeRatio;
    } 
    wRatio = this.configuration['maximized'].size.w / this.configuration['default'].size.w;
    hRatio = this.configuration['maximized'].size.h / this.configuration['default'].size.h;
    this.sizeRatio = Math.min(wRatio, hRatio);
    return this.sizeRatio;
  },
  resize: function (width, height) {
    var extent;

    this.size.w = width;
    this.size.h = height;
    this.mapDiv.style.width = this.size.w + 'px';
    this.mapDiv.style.height = this.size.h + 'px';

    this.ovmap.updateSize();

    if (this.ovmap.getProjection() != this.map.getProjection()) {
      var sourceUnits = this.map.getProjectionObject().getUnits() ||
          this.map.units || this.map.baseLayer.units;
      var targetUnits = this.ovmap.getProjectionObject().getUnits() ||
          this.ovmap.units || this.ovmap.baseLayer.units;
      this.resolutionFactor = sourceUnits && targetUnits ?
          OpenLayers.INCHES_PER_UNIT[sourceUnits] /
          OpenLayers.INCHES_PER_UNIT[targetUnits] : 1;
    }
//    this.updateRectToMap();
    this.update();
  },

  createMap: function () {
    OpenLayers.Control.OverviewMap.prototype.createMap.apply(this, arguments);
    this.handlers.click.deactivate();
    this.handlers.click.destroy();
    this.handlers.click = new OpenLayers.Handler.Click(
        this, {
          "click": this.mapDivClick,
          "dblclick": this.mapDivClick
        },{
          "single": true, "double": true,
          "stopSingle": true, "stopDouble": true,
          "pixelTolerance": 1,
          map: this.ovmap
        }
    );
    this.handlers.click.activate();
  },

  zoom: function (ratio) {
    var logRatio;
    if (ratio <= 0) {
      throw {name: 'IllegalArgumentException' ,message: 'illegal zoom ratio: ' + ratio};
    } else {
      logRatio = Math.log(ratio);
    }
    this.minRatio -= logRatio;
    this.maxRatio -= logRatio;
    this.ovmap.setCenter(this.ovmap.getCenter(), this.ovmap.getZoom() + logRatio / Math.log(2));
    return this;
  },

  addToggleElement: function () {
    var that = this;
    this.toggleSizeDiv = document.createElement('div');

    this.toggleSizeDiv.className = this.displayClass + 'ToggleSizeButton olButton';
    if (this.maximizeTitle) {
      this.toggleSizeDiv.title = this.maximizeTitle;
    }

    this.div.appendChild(this.toggleSizeDiv);
    OpenLayers.Event.observe(this.toggleSizeDiv, 'click',
      OpenLayers.Function.bind(that.toggleSize, that)
    );
  },

  toggleSize: function (e) {
    if (this.currentConfiguration === 'default') {
      this.maximizeControl(e);
      this.currentConfiguration = 'maximized';
    } else {
      this.minimizeControl(e);
      this.currentConfiguration = 'default';
    }
  },

  /**
   * Method: maximizeControl
   * Enlarge the control.
   * add the minimize icon
   *
   * Parameters:
   * e - {<OpenLayers.Event>}
   */
  maximizeControl: function(e) {
    OpenLayers.Element.removeClass(this.div, 'default-size');
    OpenLayers.Element.addClass(this.div, 'maximized-size');
    if (this.ovmap.layers.length > 1) {
//      this.ovmap.setBaseLayer(this.ovmap.layers[1]);
      this.ovmap.layers[1].setVisibility(true);
    }
    this.resize(this.configuration.maximized.size.w, this.configuration.maximized.size.h);
    this.zoom(this.getSizeRatio());
    this.updateRectToMap();
    this.updateOverview();

    if (this.maximizeTitle) {
      this.toggleSizeDiv.title = this.minimizeTitle;
    }
    if (e != null) {
      OpenLayers.Event.stop(e);                                            
    }
  },

  /**
   * Method: minimizeControl
   * Shrink the size of the control
   * add the maximize icon
   * 
   * Parameters:
   * e - {<OpenLayers.Event>}
   */
  minimizeControl: function(e) {
    OpenLayers.Element.removeClass(this.div, 'maximized-size');
    OpenLayers.Element.addClass(this.div, 'default-size');
    if (this.ovmap.layers.length > 1) {
//      this.ovmap.setBaseLayer(this.ovmap.layers[0]);
      this.ovmap.layers[1].setVisibility(false);
    }
    this.resize(this.configuration.default.size.w, this.configuration.default.size.h);
    this.zoom(1 / this.getSizeRatio());
    this.updateRectToMap();
    this.updateOverview();

    if (this.minimizeTitle) {
      this.toggleSizeDiv.title = this.maximizeTitle;
    }
    if (e != null) {
      OpenLayers.Event.stop(e);                                            
    }
  },

  CLASS_NAME: 'OpenLayers.Control.OverviewMapExpandable'

});

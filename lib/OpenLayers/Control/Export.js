/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 * @requires OpenLayers/Control/DrawFeature.js
 * @requires OpenLayers/Handler/RegularPolygon.js
 * @requires OpenLayers/Handler/ResizableBox.js
 * @requires OpenLayers/Handler/Keyboard.js
 * @requires OpenLayers/Util/htmlEncode.js
 */

var PX_TO_CM = 1.0/300*2.54;

OpenLayers.Control.Export = 
    OpenLayers.Class(OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonEmbed',
    crossSVG: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" class="icon close" preserveAspectRatio="xMidYMid meet"><rect x="1.5" y="1.5" width="33" height="33" /><path class="cross" d="M9,9l18,18M27,9l-18,18"/></svg>',
    title: null,
    widget: null,
    cnt: null,
    stepProgressPanel: null,
    stepSpecificPanel: null,
    stepSpecificElements: null,
    activeStep: null,
    nextButton: null,
    backButton: null,
    data: null,
    areaElement: null,
    selectedAreaBounds: null,
    boxControl: null,
    markerAdder: null,
    tracking: null,
    attr : {'type':'embedLight','names':['base','square','left','top','right','bottom']},
    maskLayer : null,
    areaSelectedBounds : null,
    featureMask: null,
    backupControls: null,

    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.type = OpenLayers.Control.TYPE_BUTTON;
        
        this.navButtons = {};
        this.navButtons.next = null;
        this.navButtons.back = null;

        this.title = OpenLayers.Lang.translate('Export');
        this.widgetStates = {};
        this.stepSpecificElements = {};
        this.data = {};

    }, // initialize
    setMap: function (map, tracking) {
        this.map = map, this.tracking = tracking;

        if (this.handler) {
            this.handler.setMap(map);
        }
        this.map.events.on();
    },

    draw: function () {
        var self = this, 
            cName = 'embed-button nkButton',
            mapped, 
            btn, 
            toolElement, 
            panel;

        mapped = 'OpenLayers_Control_Export' + self.map.id;
        btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');

        OpenLayers.Event.observe(btn, 'click',
            OpenLayers.Function.bind(self.toggleWidget, self)
        );
        
	    OpenLayers.Util.appendToggleToolClick({'self':self});

        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" viewBox="0 0 80 50" class="icon embed"><path d="m 18.14827,44.48105 c 0,0 0.11862,-16.9621 10.67545,-24.67215 10.55684,-7.71005 17.31796,-6.52389 17.31796,-6.52389 L 46.2603,2.84679 72,22.18122 46.2603,41.1598 46.02306,29.53542 c 0,0 -8.18451,-1.30478 -16.36902,3.32125 C 21.46952,37.4827 18.14827,44.48105 18.14827,44.48105 z M 27.87479,0 l 0,10.55684 -17.55519,0 0,43.05766 50.6491,0 0,-12.09885 10.08237,0 0,22.18122 L 0,63.69687 0,0 z"/></svg>');

        if (self.div == null) {
            self.div = btn;
        } else {
            if (OpenLayers.Element.hasClass(self.div, 'panel')) {
                panel = self.div;
                toolElement = document.createElement('div');
                OpenLayers.Element.addClass(toolElement, 'tool');
                OpenLayers.Element.addClass(toolElement, 'embed');
                toolElement.appendChild(btn);
                panel.appendChild(toolElement);
                self.div = toolElement;
            } else {
                self.div.appendChild(btn);
            }
        }

        self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

        self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
        self.div.appendChild(self.widget);

	self.insertContent( self.cnt );

        return self.div;
    }, // draw

    insertContent : function( holder ) { 
	if ( ! holder ) return;
	var self = this, stepCount = 0, stepElements = [];

	holder.innerHTML = '';

	OpenLayers.Element.addClass(holder, "embedContent");

        var header = document.createElement('header');
        header.innerHTML = '<h1 class="h">' + OpenLayers.Lang.translate('Export') + '</h1>';

        self.stepProgressPanel = document.createElement('ol');
        self.stepProgressPanel.setAttribute('class', 'progress');

        for (var step in self.steps) {
            if (self.steps.hasOwnProperty(step)) {
                stepCount++;
                var item = document.createElement('li');
                item.setAttribute('class', step);
                item.innerHTML = OpenLayers.Lang.translate(
		    'step <span class="step-number">${stepCount}</span> of ', {'stepCount': stepCount}
		);
                stepElements.push( item );
                self.stepProgressPanel.appendChild( item );
            }
        }

        while (stepElements.length > 0) {
            var stepCountElement = document.createElement('span');
            stepCountElement.innerHTML = '' + stepCount;
            stepElements.pop().appendChild(stepCountElement);
        }

        header.appendChild(self.stepProgressPanel);
        holder.appendChild(header);

        self.stepSpecificPanel = document.createElement('div');
        self.stepSpecificPanel.setAttribute('class', 'step-specific');

        holder.appendChild(self.stepSpecificPanel);

        // add the bottom navigation (next/previous) buttons
        var buttonsPanel = document.createElement('div');
        buttonsPanel.setAttribute('class', 'buttons-panel');

        self.backButton = document.createElement('button');
        self.backButton.setAttribute('class', 'back');
        self.backButton.innerHTML = OpenLayers.Lang.translate('Previous');
        buttonsPanel.appendChild(self.backButton);

        self.nextButton = document.createElement('button');
        self.nextButton.setAttribute('class', 'next');
        self.nextButton.innerHTML = OpenLayers.Lang.translate('Next');
        buttonsPanel.appendChild(self.nextButton);


        OpenLayers.Event.observe(self.backButton, 'click', function (evt) {
            self.previousStep();
            return false;
        });

        OpenLayers.Event.observe(self.nextButton, 'click', function (evt) {
            self.nextStep();
            return false;
        });

        holder.appendChild( buttonsPanel );
    }, // insertContent

    updateStepProgressPanel: function () {
        OpenLayers.Element.removeClass(this.stepProgressPanel, 'info-active');
        OpenLayers.Element.removeClass(this.stepProgressPanel, 'earea-active');
        OpenLayers.Element.removeClass(this.stepProgressPanel, 'format-active');
        OpenLayers.Element.addClass(this.stepProgressPanel, this.activeStep + '-active');

	if ( typeof(this.tracking)=='function' ) { 
	  this.tracking({
	      'step'   : this.activeStep,
	      'module' : this,
	      'clicked': this.clicked
	  });
	}
    },

    nextStep: function () {
        var removeCurrent,
            drawNext,
            validate,
            next;

        switch (this.activeStep) {
        case 'info':
            next = 'earea';
            break;
        case 'earea':
            next = 'format';
            break;
        case 'format':
            next = null;
            break;
        default:
            break;
        }

	this.clicked  = 'next';
        removeCurrent = this.steps[this.activeStep].remove;

        if (next) {
            validate = this.steps[this.activeStep].validate;
            if (!validate || (validate && validate.apply(this))) {
                removeCurrent.apply(this);
                drawNext = this.steps[next].draw;
                drawNext.apply(this);
                this.activeStep = next;
                this.updateStepProgressPanel();		
            }
        } else {
            // clicked next at last step
            removeCurrent.apply(this);
            this.hideControls();
	    if ( typeof(this.tracking)=='function' ) {
		this.tracking({
		    'step'   : 'end',
		    'module' : this,
		    'clicked': this.clicked
		});
            }
        }
    },

    previousStep: function () {
        var removeCurrent,
            drawPrevious,
            previous;

        switch (this.activeStep) {
        case 'info':
            previous = null;
            break;
        case 'earea':
            previous = 'info';
            break;
        case 'format':
            previous = 'earea';
            break;
        default:
            break;
        }

	this.clicked  = 'previous';
        removeCurrent = this.steps[this.activeStep].remove;
        removeCurrent.apply(this);

        if (previous) {
            drawPrevious = this.steps[previous].draw;
            drawPrevious.apply(this);
            this.activeStep = previous;
        }
        this.updateStepProgressPanel();
    },

    selectType: function (type) {
        if (type === 'STATIC' || type === 'DYNAMIC') {
            this.data.type = type;
            if (type === 'STATIC') {
                OpenLayers.Element.removeClass(this.stepSpecificElements.dynamicButton, 'active');
                OpenLayers.Element.addClass(this.stepSpecificElements.staticButton, 'active');
            } else {
                OpenLayers.Element.removeClass(this.stepSpecificElements.staticButton, 'active');
                OpenLayers.Element.addClass(this.stepSpecificElements.dynamicButton, 'active');
            }
        }
        this.nextStep();
    },
    setIncludeTools: function (include) {
        this.data.includeTools = include;
    },
    removeMarker: function (id){
        var markerElement,
            linkElement,
            elements, 
            i, 
            j, 
            e,
            marker,
            markerIsDeleted = false;

        markerElement = document.getElementById('marker-' + id);
        linkElement = document.getElementById('remove-marker-' + id);
        // delete reference to removeElement
        elements = this.stepSpecificElements;
        for (i = 0, j = elements.markerRemoveLinks.length; i < j; i += 1) {
            if (elements.markerRemoveLinks[i] === linkElement) {
                elements.markerRemoveLinks.splice(i, 1);
                break;
            }
        }

        for (e in elements) {
            if (elements.hasOwnProperty(e) && elements[e] === markerElement) {
                OpenLayers.Event.stopObservingElement(elements[e]);
                elements[e].parentNode.removeChild(elements[e]);
                elements[e] = null;
                delete elements[e];
            }
        }
        // delete DOM elements
        OpenLayers.Event.stopObservingElement(linkElement);
        linkElement.parentNode.removeChild(linkElement);
        linkElement = null;
        OpenLayers.Event.stopObservingElement(markerElement);
        markerElement.parentNode.removeChild(markerElement);
        markerElement = null;


        // delete data
        for (i = 0, j = this.data.markers.length; i < j; i += 1) {
            marker = this.data.markers[i];
            if (markerIsDeleted) {
                if (marker.feature) {
                    marker.feature.attributes.nr = parseInt(marker.feature.attributes.nr) - 1;
                    marker.feature.layer.drawFeature(marker.feature, 'default');
                }
            } else if (parseInt(marker.id) === parseInt(id)) {
                if (marker.feature) {
                    this.removeMarkerFeature(marker.feature);
                    marker.feature = null;
                    delete marker.feature;
                }
                this.data.markers.splice(i, 1);
                i -= 1;
                j -= 1;
                markerIsDeleted = true;
            }
        }

    },
    steps: {
        info: {
            draw: function () {

                var panel = this.stepSpecificPanel,
                    elements = this.stepSpecificElements;

                this.backButton.style['visibility']='hidden';
                this.nextButton.innerHTML=OpenLayers.Lang.translate('Next');

                OpenLayers.Element.addClass(panel, 'info');
                elements.heading = document.createElement('h2');
                elements.heading.setAttribute('class', 'h');
                elements.heading.innerHTML = OpenLayers.Lang.translate('Export maps');
                panel.appendChild(elements.heading);

                elements.p1 = document.createElement('p');
                elements.p1.innerHTML = OpenLayers.Lang.translate('This guide helps you to select a map area for print or export from the base map or overlay service.');
                panel.appendChild(elements.p1);

                elements.p3 = document.createElement('p');
                elements.p3.innerHTML = OpenLayers.Lang.translate('All map data is subject to the copyright of the service owner. Where provided, we will display license information as reported by the service.');
                panel.appendChild(elements.p3);

            },
            remove: function () {
                var panel = this.stepSpecificPanel;
                OpenLayers.Element.removeClass(panel, 'info');
                this.removeStepSpecificElements();
            }
        },
        earea: {
            draw: function () {

                this.backButton.style['visibility']='visible';
                this.nextButton.innerHTML=OpenLayers.Lang.translate('Next');
                if (this.div && OpenLayers.Element.hasClass(this.div, 'active')) {
                    this.enableMaskControls();
                    //this.translateFeatureToMask();
                }

                var panel = this.stepSpecificPanel,
                    elements = this.stepSpecificElements,
                    that = this,
                    attr = that.attr;

                OpenLayers.Element.addClass(panel, 'earea');
                
                elements.heading = document.createElement('h2');
                elements.heading.setAttribute('class', 'h');
                elements.heading.innerHTML = OpenLayers.Lang.translate('Choose area');
                panel.appendChild(elements.heading);

                elements.modeOptionsContainer = document.createElement('div');
                elements.modeOptionsContainer.setAttribute('class', 'mode-options-container');

                elements.instructions = document.createElement('p');
                elements.instructions.setAttribute('class', 'draw-instructions');
                elements.instructions.innerHTML = OpenLayers.Lang.translate('Hold down left mouse button and draw desired embed area on the map. You may later adjust the size of the area with the buttons that appear on the corners of the drawn rectangle.');

                elements.modeOptionsContainer.appendChild(elements.instructions);


                panel.appendChild(elements.modeOptionsContainer);

                if ( ! attr['nodes'] ) that.insertDragArea();

            },
            validate: function () {
                var d = this.data;
                return d.width && d.height && d.centerX && d.centerY;
            },
            remove: function () {
                var panel = this.stepSpecificPanel;
                //this.boxControl.deactivate();
                OpenLayers.Element.removeClass(panel, 'earea');
                this.removeStepSpecificElements();
            }
        },

        format: {
            draw: function () {

                this.nextButton.innerHTML=OpenLayers.Lang.translate('Close');
                var panel = this.stepSpecificPanel,
                    elements = this.stepSpecificElements;

                elements.that = this;

                OpenLayers.Element.addClass(panel, 'format');
                elements.heading = document.createElement('h2');
                elements.heading.setAttribute('class', 'h');
                elements.heading.innerHTML = OpenLayers.Lang.translate('Choose data layer and output format');
                panel.appendChild(elements.heading);

                elements.recommendation = document.createElement('p');
                elements.recommendation.setAttribute('class', 'recommendation');
                elements.recommendation.innerHTML = OpenLayers.Lang.translate('From the drop down boxes below, select the source and format of the exported data.');
                panel.appendChild(elements.recommendation);

                var table = document.createElement('table');
                panel.appendChild(table);

                elements.sourceSelector = document.createElement('tr');
                var sources = {}
                for (var l in map.layers) {
                  var layer = map.layers[l];
                  if (layer.getVisibility()) {
                    var dataUrl = layer.dataUrl || layer.url;
                    if (!!dataUrl) {
                      if (!sources[dataUrl]) {sources[dataUrl]=[];}
                      sources[dataUrl].push(layer);
                    }
                  }
                }
                var code = '<td>'+OpenLayers.Lang.translate('Source')+': </td><td><select>';
                var lastSource = Object.keys(sources).slice(-1);
                for (var s in sources) {
                  var layers = sources[s];
                  var domain = /\/\/(.*?)\//.exec(s)[1];
                  var desc = domain + ' ('+layers.length+")";
                  var selected = (s == lastSource) && "selected" || "";
                  code += '<option value="'+s+'" '+selected+'>'+desc+'</option>';
                }
                code += "</select></td>";
                elements.sourceSelector.innerHTML = code;
                elements.sources = sources;
                table.appendChild(elements.sourceSelector);

                elements.layerSelector = document.createElement('tr');
                table.appendChild(elements.layerSelector);

                elements.formatSelector = document.createElement('tr');
                table.appendChild(elements.formatSelector);

                elements.sizeSelector = document.createElement('tr');
                table.appendChild(elements.sizeSelector);
                
                elements.preview = document.createElement('tr');
                table.appendChild(elements.preview);

                elements.link = document.createElement('tr');
                table.appendChild(elements.link);

                function updateSizeSelector() {
                  elements.format = elements.formatSelector.children[1].children[0].value;
                  if ((elements.layer.dataType || elements.layer.type) == 'wms') {
                    var code ='<td>'+OpenLayers.Lang.translate('Size') + ": </td><td><select>;";
                    var points = elements.that.attr['points'];
      	            var size = elements.that.getSizeOfPoints( points );
                    var bl = map.getLonLatFromPixel(new OpenLayers.Pixel(points[0][0], points[1][1]));
                    var tr = map.getLonLatFromPixel(new OpenLayers.Pixel(points[1][0], points[0][1]));
                    var bbox = bl.lon+","+bl.lat+","+tr.lon+","+tr.lat;
                    code += "<option value='1'>"+OpenLayers.Lang.translate("As shown")+" ("+size[0]+"x"+size[1]+" "+OpenLayers.Lang.translate("px")+")</option>";
                    code += "<option value='2'>2x ("+size[0]*2+"x"+size[1]*2+" "+OpenLayers.Lang.translate("px")+")</option>";
                    if ((size[0]<1000) && (size[1]<1000)) {
                      code += "<option value='4'>4x ("+size[0]*4+"x"+size[1]*4+" "+OpenLayers.Lang.translate("px")+")</option>";
                    }
                    if ((size[0]<500) && (size[1]<500)) {
                      code += "<option value='8'>8x ("+size[0]*8+"x"+size[1]*8+" "+OpenLayers.Lang.translate("px")+")</option>";
                    }
                    var a4scale = Math.min( 3507 / Math.max(size[0],size[1]) , 2480 / Math.min(size[0],size[1] ));
                    var a3scale = a4scale * 2;
                    code += "<option value='"+a4scale+"'>A4 @ 300dpi ("+OpenLayers.Util.preciseRound(size[0]*a4scale*PX_TO_CM,2)+"x"+OpenLayers.Util.preciseRound(size[1]*a4scale*PX_TO_CM,2)+"cm)</option>";
                    code += "<option value='"+a3scale+"'>A3 @ 300dpi ("+OpenLayers.Util.preciseRound(size[0]*a3scale*PX_TO_CM,2)+"x"+OpenLayers.Util.preciseRound(size[1]*a3scale*PX_TO_CM,2)+"cm)</option>";
                    code += "</select>&nbsp;";
                    elements.sizeSelector.innerHTML = code;
                  } else { 
                    elements.sizeSelector.innerHTML = "<td colspan=2></td>";
                  }
                  updateLink();
                }

                function updateFormatSelector() {
                  var layer   = map.getLayer(elements.layerSelector.children[1].children[0].value);
                  var formats = layer.dataFormats || ["missing"];
                  var type    = layer.dataType || layer.type || "missing";
                  var code = '<td>'+OpenLayers.Lang.translate('Format') + ": </td><td><select>;";
                  for (var f in formats) {
                    code += '<option value="'+formats[f]+'">'+type.toUpperCase() + ": " + formats[f]+'</option>';
                  }
                  code += "</select></td>";
                  elements.formatSelector.innerHTML = code;
                  elements.layer = layer;
                  updateSizeSelector();
                  updateLink();
                }

                function updateLayerSelector() { 
                  var source = elements.sourceSelector.children[1].children[0].value;
                  var layers = elements.sources[source];
                  var code = '<td>' + OpenLayers.Lang.translate('Layer') + ": </td><td><select>;";
                  for (var l in layers) {
                    code += '<option value="'+layers[l].id+'">'+layers[l].name+'</option>';
                  }
                  code += "</select></td>";
                  elements.layerSelector.innerHTML = code; 
                  elements.source = source;
                  updateFormatSelector();
                }

                updateLayerSelector();

                function updateLink() { 
                  var points = elements.that.attr['points'];
                  var bl = map.getLonLatFromPixel(new OpenLayers.Pixel(points[0][0], points[1][1]));
                  var tr = map.getLonLatFromPixel(new OpenLayers.Pixel(points[1][0], points[0][1]));
                  var bbox = bl.lon+","+bl.lat+","+tr.lon+","+tr.lat;
                  var format  = encodeURIComponent(elements.format);
                  var BASE_URL = elements.layer.dataURL || elements.source; 

                  if ((elements.layer.dataType || elements.layer.type) == "wms") {
                    var pscale = elements.sizeSelector.children[1].children[0].value;
      	            var size = elements.that.getSizeOfPoints(points);
                    var width   = size[0] * pscale;
                    var height  = size[1] * pscale;
                    var preview_format = format;
                    var prev_x  = Math.min(300, width );
                    var hratio  = Math.floor(prev_x * size[1] / size[0]);
                    var show_preview = true;
                  
 /*                   if (!NK.ticket || (NK.ticketedService != service) || (new Date().getTime() - NK.ticketIssued > 3600000 )) {
                      $.ajax("http://norgeskart.no/ws/esk.py?"+service,{async:false}).done(function(msg){ // can only be done once the service is known, shouldn't bee too long
                          NK.ticket = msg.replace(/[\"\r\n]/g, '');
                          NK.ticketedService = service;
                          NK.ticketIssued = new Date().getTime();
                        });
                      }*/
                    if ((format == "image%2Ftiff") || (format=="application%2Fx-pdf") || (format=="image%2Fvnd.wap.wbmp")) {
                      preview_format = "image/png";
                    }
                    var layer = elements.layer.dataLayers || elements.layer.params.LAYERS;
                    var WMS_URL = BASE_URL+"?service=WMS&request=GetMap&CRS="+map.projection.projCode+"&FORMAT="+format+"&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&LAYERS="+layer+"&VERSION=1.3.0&WIDTH="+width+"&HEIGHT="+height+"&BBOX="+bbox;
                    var preview = "<img border=0 style='background-color:#fff' width="+prev_x+" height="+hratio+" src='"+BASE_URL+"?service=WMS&request=GetMap&CRS="+map.projection.projCode+"&FORMAT="+preview_format+"&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&LAYERS="+layer+"&VERSION=1.3.0&WIDTH="+prev_x+"&HEIGHT="+hratio+"&BBOX="+bbox+"'/>";
                    elements.link.innerHTML = "<td colspan=2>"+OpenLayers.Lang.translate("Preview")+":<br/><a target='_blank' style='color:#fff' href='"+WMS_URL+"'>"+preview+"<br/>"+OpenLayers.Lang.translate("Download dataset from source")+"</a></td>";
                  } else if ((elements.layer.dataType || elements.layer.type) == "wfs") {
                      var typeName = elements.layer.dataLayers || elements.layer.protocol.featureType;
                      var WFS_URL = BASE_URL+"?service=WFS&request=GetFeature&srsName="+map.projection.projCode+"&typeName="+typeName+"&version=1.1.0";
                      elements.link.innerHTML = "<td colspan=2><a target='_blank' style='color:#fff' href='"+WFS_URL+"'>"+OpenLayers.Lang.translate("Download dataset from source")+"</a></td>";

                  } else {
                      elements.link.innerHTML = "<td colspan=2>"+OpenLayers.Lang.translate("Missing download support for layer type")+" "+(elements.layer.type || "unknown")+"</td>";
                  }
                };

                OpenLayers.Event.observe(elements.sourceSelector, 'change', updateLayerSelector); 
                OpenLayers.Event.observe(elements.layerSelector, 'change', updateFormatSelector); 
                OpenLayers.Event.observe(elements.formatSelector, 'change', updateSizeSelector); 
                OpenLayers.Event.observe(elements.sizeSelector, 'change', updateLink); 

                if (!this.div || !OpenLayers.Element.hasClass(this.div, 'active')) {
                    this.adjustWidgetPosition();
                }
            },
            validate: function () {
                //return this.data.longDesc && this.data.shortDesc;
                return true;
            },
            remove: function () {
                var panel = this.stepSpecificPanel,
                    elements = this.stepSpecificElements;

                OpenLayers.Element.removeClass(panel, 'format');

                OpenLayers.Event.stopObservingElement(elements.sourceSelector);
                OpenLayers.Event.stopObservingElement(elements.layerSelector);
                OpenLayers.Event.stopObservingElement(elements.formatSelector);
                OpenLayers.Event.stopObservingElement(elements.sizeSelector);

                delete elements.that;
                delete elements.sources;
                delete elements.source;
                delete elements.layer;
                delete elements.format;
                this.removeStepSpecificElements();
            }
        }
    },

    
    enableMaskControls: function(){
        var self = this;
        $('.embedLight.adjust').css('visibility', 'visible');
        if (self.maskLayer) {
            self.maskLayer.setVisibility(false);
        }
    },
    
    disableMaskControls: function(){
        var self = this;
        $('.embedLight.adjust').css('visibility', 'hidden');
        if (self.maskLayer) {
            self.maskLayer.setVisibility(true);
        }
    },

    getViewportBounds: function(){

        var self = this, size, tl, tr, bl, br, 
            p1, p2, p3, p4, pts = [];

        size = self.map.getSize();

        tl = self.map.getLonLatFromPixel({x:0, y:0});
        tr = self.map.getLonLatFromPixel({x:size.w, y:0});
        bl = self.map.getLonLatFromPixel({x:0, y:size.h});
        br = self.map.getLonLatFromPixel({x:size.w, y:size.h});

        p1 = new OpenLayers.Geometry.Point(tl.lon, tl.lat);
        p2 = new OpenLayers.Geometry.Point(bl.lon, bl.lat);
        p3 = new OpenLayers.Geometry.Point(br.lon, br.lat);
        p4 = new OpenLayers.Geometry.Point(tr.lon, tr.lat);

        pts.push(p1, p2, p3, p4);

        return new OpenLayers.Geometry.LinearRing(pts);

    },
    
    translateMaskToFeature: function(){

        if (!this.attr['nodes'] || !this.div || !OpenLayers.Element.hasClass(this.div, 'active')) {
            return;
        }

        var self = this, outerBounds, innerBounds, polygon;

        if (!self.maskLayer) {
            self.addMaskLayer();
        } else {
            self.maskLayer.removeAllFeatures();
        }

        outerBounds = self.getViewportBounds();
        innerBounds = self.areaSelectedBounds;

        // Create vector and add to layer
        polygon = new OpenLayers.Geometry.Polygon([outerBounds, innerBounds]);
        self.featureMask = new OpenLayers.Feature.Vector(polygon, {}, null);
        self.maskLayer.addFeatures([self.featureMask]);
        
        self.disableMaskControls();

        // Preserve feature mask despite map changes
        self.map.events.unregister('move', self, self.adjustFeatureOuterBounds);
        self.map.events.unregister('zoomend', self, self.adjustFeatureOuterBounds);
        self.map.events.register('move', self, self.adjustFeatureOuterBounds);
        self.map.events.register('zoomend', self, self.adjustFeatureOuterBounds);

    },
    
    adjustFeatureOuterBounds: function(){
        var self = this, polygon, tl, tr, bl, br, p1, p2, p3, p4, pts = [];

        if (!self.areaSelectedBounds || !self.featureMask) return;

        outerBounds = self.getViewportBounds();

        polygon = new OpenLayers.Geometry.Polygon([outerBounds, self.areaSelectedBounds]);
        self.featureMask = new OpenLayers.Feature.Vector(polygon, {}, null);

        self.maskLayer.removeAllFeatures();
        self.maskLayer.addFeatures([self.featureMask]);
    },
    
    addMaskLayer: function(){

        var self = this;

        var maskStyles = new OpenLayers.StyleMap({
            'default' : new OpenLayers.Style({
                fillColor : '#000000',
                fillOpacity : 0.5,
                strokeWidth : 0
            })
        });

        self.maskLayer = new OpenLayers.Layer.Vector('embedMaskLayer', {
            shortid : 'embedMaskLayer',
            styleMap : maskStyles
        });

        self.map.addLayer(self.maskLayer);

    },
    
    adjustWidgetPosition: function(){

        var self = this, 
            widget = document.getElementById('PMwidget');

        if (widget && $(widget).offset().top < 0) {

            var h = 675, s = OpenLayers.Util.getWindowSize(),  w = [
                    parseInt( OpenLayers.Util.getStyle(widget,'width')  ) || 0,
                    parseInt( OpenLayers.Util.getStyle(widget,'height') ) || 0
                ];

            w[2] = w[0]/2, w[3] = w[1] /2;
            s[2] = s[0]/2, s[3] = s[1] /2;
            
            var t = h + w[3], m = s[3] - t, d = 10;
            if ( m <= 0 ) {
                if ( t+w[3]+d > s[1] ) m += (t+w[3] - s[1] - d);
                self.map.moveByPx( 0, m );
            }
        }
    },

    removeStepSpecificElements: function () {
        var panel = this.stepSpecificPanel,
            elements = this.stepSpecificElements,
            e;

        for (e in elements) {
            if (elements.hasOwnProperty(e)) {
                OpenLayers.Event.stopObservingElement(elements[e]);
                elements[e].parentNode.removeChild(elements[e]);
                elements[e] = null;
                delete elements[e];
            }
        }
    },
    getIframe: function ( onPreview, panel ) {
        var iframe = document.createElement('iframe'),
            shortDesc = this.data.shortDesc || '',
            longDesc = this.data.longDesc || '';

        iframe.setAttribute('src', this.getURL());
        iframe.setAttribute('width', this.data.width);
        iframe.setAttribute('height', this.data.height);
        iframe.setAttribute('title', shortDesc);
        iframe.setAttribute('longdesc', longDesc);
        return iframe;
    },
    getURL: function () {
        var hash,
            url,
            i, j, m, x, y, hashLayers,
            markers = this.data.markers;

        // Include selected map layer
        hashLayers = window.location.hash.toString().split('/');
        hashLayers.splice(0,3);
        hashLayers = hashLayers.join('/');

        x = this.data.centerX.toString().split('.')[0];
        y = this.data.centerY.toString().split('.')[0];

        //hash = window.location.hash.replace(/#([0-9]+\/){3}/, '#' + this.map.zoom + '/' + this.data.centerX + '/' + this.data.centerY + '/').replace('/+embed.box', '');
        hash = '#' + this.map.zoom + '/' + x + '/' + y + '/' + hashLayers + '+embed.box';

        if (markers && markers.length) {
            for (i = 0, j = markers.length; i < j; i += 1) {
                m = markers[i];
                hash += '/m/' + m.x + '/' + m.y + '/' + encodeURIComponent(m.label);
            }
        }

        switch (this.data.type) {
            case 'STATIC':
                extraPath = 'statisk.html';
                break;
            case 'DYNAMIC':
                if (this.data.includeTools) {
                    extraPath = 'dynamisk-med-navigasjon.html';
                } else {
                    extraPath = 'dynamisk.html';
                }
                break;
            default:
                extraPath = '';
        }

        url = window.location.protocol + '//' + window.location.host + window.location.pathname + extraPath + hash;

        return url;
    },

    setLongDesc: function (value) {
        this.data.longDesc = value;
    },

    setShortDesc: function (value) {
        this.data.shortDesc = value;
    },
    
    hideControls: function (skipToggle) { 
	var self = this, btn = self.div;
	if ( ! btn || ! OpenLayers.Element.hasClass(btn,'active') ) return;
        
	OpenLayers.Element.removeClass( btn, 'active' ); 
    //delete self.widget;
	self.deleteStepData();
	self.removeDragArea();

    if (!skipToggle) OpenLayers.Util.renderToggleToolClick({'self': self}, false);

    }, //hideControls

    deleteStepData : function() {

	var self = this, data = self.data || {}, i = 0, j = 0;

        for ( var d in data ) {
            if ( ! data.hasOwnProperty(d) ) continue;

            if (d === 'markers') {
                for (i = 0, j = data[d].length; i < j; i += 1) {
                    if (data[d][i].feature) {
                        self.removeMarkerFeature(data[d][i].feature);
                        data[d][i].feature = null;
                        delete data[d][i].feature;
                    }
                }
            }

            data[d] = null;
            delete data[d];
        }

        self.steps[self.activeStep].remove.apply(self);
        self.activeStep = null;
        if (self.areaElement) {
            OpenLayers.Event.stopObservingElement(self.areaElement);
            self.areaElement.parentNode.removeChild(self.areaElement);
            self.areaElement = null;            
        }

        /*
            Note: the "pekere" layer is automatically created by 
            NK.functions.addLabeledMarker if it doesn't exist.
        */
        var markerLayer = self.map.getLayersBy('shortid', 'pekere');
        if (markerLayer.length) {
            markerLayer[0].destroy();
        }
	
	/*
        if (self.boxControl) {
            self.boxControl.deactivate();
            self.map.removeControl(self.boxControl);
            self.boxControl = null;
            delete self.boxControl;
        }

        if (self.boxLayer) {
            self.boxLayer.destroyFeatures();
            self.map.removeLayer(self.boxLayer);
            self.boxLayer.destroy();
            self.boxLayer = null;
            delete self.boxLayer;
        }
	*/
    }, // deleteStepData
	
    showControls: function () {
        var html = '',
            inputForm,
            selected,
            button,
            coordinates,
            that = this,
            inSystem,
            outSystem,
            fieldset,
            eastLabel, eastInput,
            northLabel, northInput;

	    OpenLayers.Util.renderToggleToolClick({'self':this}, true);

        this.activeStep = 'info';
        this.steps[this.activeStep].draw.apply(this);
        this.updateStepProgressPanel();  
        OpenLayers.Element.addClass(this.div, 'active');
    }, // showControls

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable
   
    toggleWidget: function () {
        OpenLayers.Element.hasClass( this.div, 'active' ) ? this.hideControls() : this.showControls();
    }, // toggleGetURL
    
    toggleControls: function () {      
       var self = this;
    },//togglecontrols

    getSizeOfPoints : function( points ) {
	return ! points ? [0,0]:
	    [points[1][0]-points[0][0], points[1][1]-points[0][1]]
    },
	
    describeSquareSize : function() {

	var self  = this, attr = self.attr;
	var nodes = attr['nodes'], points = attr['points'];
        if ( ! nodes || ! nodes['square'] || ! points ) return;	
	
	var wrapper = nodes['square'].firstChild || nodes['square'];
	var size = self.getSizeOfPoints( points );
        if (size[0]>size[1]) {
  	  wrapper.innerHTML = OpenLayers.Util.preciseRound(size[0]/size[1],2)+':1';
        } else {
  	  wrapper.innerHTML = '1:'+OpenLayers.Util.preciseRound(size[1]/size[0],2);
        }
        wrapper.innerHTML += "<br/>"+size[0]+"x"+size[1];
    },

    setDragAreaShadow : function( pin, end ) {

	var self  = this, attr = self.attr;
	var nodes = attr['nodes'], points = pin || attr['points'];
    var hidden = false;
        
        if ( ! nodes || ! points ) return;

        if (self.maskLayer && self.maskLayer.getVisibility()) hidden = true;;

        var size = self.getSizeOfPoints( points );
        var view = OpenLayers.Util.getWindowSize(), style = '';

        style = 'top:0;bottom:0;left:0;width:'+points[0][0]+'px;';
        if (hidden) style += 'visibility:hidden;';
        nodes['left'].setAttribute( 'style', style );
	    
        style = 'top:0;height:'+points[0][1]+'px;' +
	    'left:'+points[0][0]+'px;width:'+(size[0])+'px;';
        if (hidden) style += 'visibility:hidden;';
        nodes['top'].setAttribute( 'style', style );
	
        style = 'top:0;bottom:0;right:0;left:'+points[1][0]+'px;';
        if (hidden) style += 'visibility:hidden;';
        nodes['right'].setAttribute( 'style', style );
	
        style = 'top:'+points[1][1]+'px;bottom:0;'+
	    'left:'+points[0][0]+'px;width:'+size[0]+'px;';
        if (hidden) style += 'visibility:hidden;';
        nodes['bottom'].setAttribute( 'style', style );

    	style = 'left:'+points[0][0]+'px;top:'+points[0][1]+'px;';
        if (hidden) style += 'visibility:hidden;';
    	nodes['square'].setAttribute( 'style', style );

    	self.describeSquareSize( points );
        self.setAreaSelectedBounds( points );

        self.map.events.unregister('move', self, self.updatePoints);
        self.map.events.unregister('zoomend', self, self.updatePoints);
        self.map.events.register('move', self, self.updatePoints);
        self.map.events.register('zoomend', self, self.updatePoints);

    	if ( ! end ) return;
    	
    	for (var i=0; i<attr['names'].length; i++ ) {
    	    if ( nodes[attr['names'][i]] ) 
    		OpenLayers.Element.addClass( nodes[attr['names'][i]],'adjust');
    	}
        /*
    	var x = parseInt(points[0][0]+(size[0]/2)); 
    	var y = parseInt(points[0][1]+(size[1]/2)); 
    	var c = self.map.getLonLatFromPixel({'x':x,'y':y});
    	
    	self.data.width   = size[0], self.data.height  = size[1];
    	self.data.centerX = c.lon,   self.data.centerY = c.lat;
        */
        self.updatePoints();
    	//self.describeSquareSize( points );

    }, // 

    setAreaSelectedBounds: function(points){

        if (!points || !points.length) return;

        var self = this, tl, tr, bl, br, p1, p2, p3, p4, 
            size, pts = [];

        size = self.getSizeOfPoints(points);

        tl = self.map.getLonLatFromPixel({x:points[0][0], y:points[0][1]});
        tr = self.map.getLonLatFromPixel({x:(points[0][0] + size[0]), y:points[0][1]});
        bl = self.map.getLonLatFromPixel({x:points[0][0], y:points[1][1]});
        br = self.map.getLonLatFromPixel({x:points[1][0], y:points[1][1]});

        p1 = new OpenLayers.Geometry.Point(tl.lon, tl.lat);
        p2 = new OpenLayers.Geometry.Point(bl.lon, bl.lat);
        p3 = new OpenLayers.Geometry.Point(br.lon, br.lat);
        p4 = new OpenLayers.Geometry.Point(tr.lon, tr.lat);

        pts.push(p1, p2, p3, p4);

        self.areaSelectedBounds = new OpenLayers.Geometry.LinearRing(pts);
        //testFeature = new OpenLayers.Feature.Vector(areaSelectedBounds, {}, null);

    },

    updatePoints: function(){

        if (!this.areaSelectedBounds) {
            return;
        }

        var self = this,
            b = self.areaSelectedBounds.getBounds(),
            center,
            pixelBounds;

        tlp = this.map.getPixelFromLonLat(new OpenLayers.LonLat(b.left, b.top));
        brp = this.map.getPixelFromLonLat(new OpenLayers.LonLat(b.right, b.bottom));

        self.attr['points'][0][0] = tlp.x;
        self.attr['points'][0][1] = tlp.y;
        self.attr['points'][1][0] = brp.x;
        self.attr['points'][1][1] = brp.y;

        self.setDragAreaShadow(self.attr['points']);
        
        // Update self.data attributes for iFrame and URL generation
        center = b.getCenterLonLat();
        pixelBounds = new OpenLayers.Bounds(
            Math.min(tlp.x, brp.x),
            Math.min(tlp.y, brp.y),
            Math.max(tlp.x, brp.x),
            Math.max(tlp.y, brp.y)
        );
        
        self.data.width = Math.abs(pixelBounds.getWidth());
        self.data.height = Math.abs(pixelBounds.getHeight());
        self.data.centerX = center.lon;
        self.data.centerY = center.lat;

    },

    moveDragArea : function (e) {
        e.preventDefault();
	    var self = this, 
            attr = self.attr,
            nodes = attr['nodes'] || {},
            dTarget,
            isTop,
            isLeft,
            allow,
            x,
            y,
            s,
            pos = {},
            downPos = {},
            i;

	    if (!nodes['base'] || !attr['downEvent']) {
            return;
        }

        if (e.type === 'touchmove') {
            for (i = 0; i < e.changedTouches.length; i += 1) {
                if (e.changedTouches[i] === attr['downEvent'].touch) {
                    pos.x = e.changedTouches[i].clientX;
                    pos.y = e.changedTouches[i].clientY;
                    e.preventDefault();
                    e.stopPropagation();
                }
            }

            if ( ! pos.x ) pos.x = e.targetTouches[0].pageX;
            if ( ! pos.y ) pos.y = e.targetTouches[0].pageY;

        } else if (e.type === 'mousemove') {
            pos.x = e.clientX;
            pos.y = e.clientY;
        }

	    dTarget = attr['downEvent'].target;
    	if (OpenLayers.Element.hasClass(dTarget, 'tool')) {
    	    OpenLayers.Element.removeClass(nodes['base'], 'adjust');
    	    isTop  = OpenLayers.Element.hasClass(dTarget, 'top');
    	    isLeft = OpenLayers.Element.hasClass(dTarget, 'left');

            if (isTop && isLeft) {         // top - left
                attr['points'][0] = [pos.x, pos.y];
            } else if (isTop && !isLeft)  { // top - right
                attr['points'][0][1] = pos.y;
                attr['points'][1][0] = pos.x;
            } else if (isLeft) {             // bottom - left
                attr['points'][0][0] = pos.x;
                attr['points'][1][1] = pos.y;
            } else {                           // bottom - right
                attr['points'][1] = [pos.x, pos.y];
            }
    	    
    	    allow = attr['points'][0][0] < attr['points'][1][0] && attr['points'][0][1] < attr['points'][1][1];
    	    
    	    if (allow) {
                self.setDragAreaShadow(attr['points']);
            }
    	} else if (nodes['square'] && self.activeStep === 'earea') {
    	    x = [attr['downEvent'].clientX, pos.x, pos.x];
    	    y = [attr['downEvent'].clientY, pos.y, pos.y];
    	    
    	    if (x[0] > x[1]) { 
                x[1] = x[0];
                x[0] = x[2];
            }
    	    if (y[0] > y[1]) {
                y[1] = y[0];
                y[0] = y[2];
            }
    	    
    	    s = 'left:' + x[0] + 'px;top:' + y[0] + 'px;' + 'width:' + (x[1] - x[0]) + 'px;height:' + (y[1] - y[0]) + 'px;';

    	    nodes['square'].setAttribute('style', s );
    	    attr['points'] = [[x[0], y[0]], [x[1], y[1]]];
    	    self.describeSquareSize();
    	}
    },

    downDragArea: function (e) {
    	var self = this,
            attr = self.attr,
            nodes = attr['nodes'] || {};


    	//if ( self.activeStep != 'earea' ) { attr['downEvent'] = null; return;}
    	if (nodes['base'] && OpenLayers.Element.hasClass(nodes['base'], 'adjust')) {
    	    if (!OpenLayers.Element.hasClass(e.target, 'tool')) {
                if (self.activeStep === 'earea') {
                    self.resetDragArea();
                }
    	    }
    	}
        if (e.type === 'mousedown') {
            attr['downEvent'] = e;
        } else if (e.type === 'touchstart') {
            attr['downEvent'] = {
                touch: e.changedTouches[0],
                clientX: e.changedTouches[0].clientX,
                clientY: e.changedTouches[0].clientY,
                target: e.target
            };
        }
    },

    upDragArea : function (e) {
    	var self = this,
            attr = self.attr;

    	attr['events']    = [attr['downEvent'], e];
    	attr['downEvent'] = null;	
    	self.setDragAreaShadow(attr['points'], true);
    },

    insertDragArea : function( e ) {

    	var self = this, 
            attr = self.attr, 
            wrapper = document.body,
            i,
            name;

    	attr['nodes'] = {};
    	for (i = 0; i < attr['names'].length; i += 1) {
    	    name = attr['names'][i];
    	    attr['nodes'][name] = document.createElement('div');
    	    attr['nodes'][name].setAttribute( 'class', attr['type'] );
    	    attr['nodes'][name].setAttribute( 'id', attr['type']+'OF'+name );
    	   
    	    if (name === 'top' || name === 'bottom') {
        		attr['nodes'][name].innerHTML = 
        		    '<div class="tool left ' + name + '"></div>' +
    	       	    '<div class="tool right ' + name + '"></div>';		    
    	    } else if (name === 'square') {
        		attr['nodes'][name].innerHTML = '<div class="tool"></div>';
    	    }

    	    wrapper.appendChild(attr['nodes'][name]);
    	    
    	    OpenLayers.Event.observe(attr['nodes'][name], 'mousemove', 
    	      OpenLayers.Function.bind(self.moveDragArea, self)
    	    );

    	    OpenLayers.Event.observe(attr['nodes'][name], 'mousedown', 
    	      OpenLayers.Function.bind(self.downDragArea, self)
    	    );

    	    OpenLayers.Event.observe(attr['nodes'][name], 'mouseup', 
    	      OpenLayers.Function.bind(self.upDragArea, self)
    	    );

            OpenLayers.Event.observe(attr['nodes'][name], 'touchstart', 
              OpenLayers.Function.bind(self.downDragArea, self)
            );
            OpenLayers.Event.observe(attr['nodes'][name], 'touchend', 
              OpenLayers.Function.bind(self.upDragArea, self)
            );
            
            OpenLayers.Event.observe(attr['nodes'][name], 'touchmove', 
              OpenLayers.Function.bind(self.moveDragArea, self)
            );
    	}
    },

    removeDragArea : function() {
        var self = this,
            attr = self.attr,
            nodes = attr['nodes'] || {},
            i,
            name,
            target;

        for (i = 0; i < attr['names'].length; i += 1) {
            name   = attr['names'][i]; 
            target = document.getElementById(attr['type'] + 'OF' + name);
            if (target) {
                target.parentNode.removeChild(target);
            }
            nodes[name] = null;
        }
        attr['downEvent'] = null;
        attr['points'] = null; 
        attr['events'] = null;
        attr['nodes'] = null;

        if (self.maskLayer) {
            self.maskLayer.removeAllFeatures();
            self.map.removeLayer(self.maskLayer);
            delete self.maskLayer;
        }

        if (self.areaSelectedBounds) {
            delete self.areaSelectedBounds;
        }
    },

    resetDragArea : function() {
        var self = this,
            attr = self.attr,
            nodes = attr['nodes'] || {},
            i,
            name,
            target,
            children,
            j;

        for (i = 0; i < attr['names'].length; i += 1) {
            name = attr['names'][i];
            target = document.getElementById(attr['type'] + 'OF' + name) || nodes[name];
            if (!target) {
                continue;
            }
            target.removeAttribute('style');
            target.removeAttribute('class'); 
            target.setAttribute('class', attr['type']);

            children = target.children || [];

            for (j = 0; i < children.length; j += 1) { 
                children[j].removeAttribute('style'); 
            }
        }
        attr['downEvent'] = null;
        attr['points'] = null;
        attr['events'] = null;
    },
    
    CLASS_NAME: "OpenLayers.Control.Export"
}); // OpenLayers.Control.Transformations

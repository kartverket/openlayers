/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.OverlayGroupPanel = 
    OpenLayers.Class(OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonOverlayGroupPanelButton',
    title: null,
    widget: null,
    cnt: null,
    group: '',
    svgIcon: null,
    groupedLayers: null,
    layers: null, // list of all layers (for convenient travesal)
    groupHeaders: null,

    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.type = OpenLayers.Control.TYPE_BUTTON;
        if (options.group) {
            this.group = options.group;
        }
        if (options.svgIcon) {
            this.svgIcon = options.svgIcon;
        }
        if (options.buttonText) {
            this.buttonText = options.buttonText;
        }
        this.title = options.title;
        this.groupedLayers = {
            layers: [],
            groups: {}
        };
        this.layers = [];
        if (options.groupHeaders) {
            this.groupHeaders = options.groupHeaders;
        }

    }, // initialize

    buildLayerGroupStructure: function () {
        var i, j, k, l,
            layer,
            subGroup,
            groups,
            currentGroup,
            layerData;

        // populate groupedLayers
        for (i = 0, j = this.map.layers.length; i < j; i += 1) {
            layer = this.map.layers[i];

            if (!layer.isBaseLayer) {
                if (layer.layerGroup && layer.layerGroup.indexOf(this.group) !== -1) {

                    // add this layer to the group/layer hierarchy
                    subGroup = layer.layerGroup.replace(this.group, '');
                    if (subGroup.indexOf('.') === 0) {
                        subGroup = subGroup.substring(1);   
                    }

                    currentGroup = this.groupedLayers;

                    if (subGroup.length > 0) {
                        groups = subGroup.split('.');
                        for (k = 0, l = groups.length; k < l; k += 1) {
                            if (!currentGroup.groups[groups[k]]) {
                                currentGroup.groups[groups[k]] = {
                                    layers: [],
                                    groups: {}
                                };
                            }
                            currentGroup = currentGroup.groups[groups[k]];
                        }
                    }
                    layerData = {
                        'layer': layer
                    };
                    currentGroup.layers.push(layerData);
                    this.layers.push(layerData);
                }
            }
        }
    },

    addEventListeners: function () {
        var i,
            j,
            that = this,
            group;

        for (i = 0, j = this.layers.length; i < j; i += 1) {
            OpenLayers.Event.observe(this.layers[i].link, 'click', function (evt) {
                var i, j, layerData;
                evt.preventDefault();
                for (i = 0, j = that.layers.length; i < j; i += 1) {
                    if (that.layers[i].link === evt.target) {
                        layerData = that.layers[i];
                        break;
                    }
                }
                if (layerData) {
                    layerData.layer.setVisibility(!!!layerData.layer.getVisibility());
                    that.updateLayer(layerData);
                }
            });
        }
        if (this.groupHeaders) {
            for (group in this.groupHeaders) {
                if (this.groupHeaders.hasOwnProperty(group) && this.groupHeaders[group].headerElement) {
                    OpenLayers.Event.observe(this.groupHeaders[group].headerElement, 'click', function (evt) {
                        var i, j, group, grp;
                        evt.preventDefault();
                        for (grp in that.groupHeaders) {
                            if (that.groupHeaders.hasOwnProperty(grp) && that.groupHeaders[grp].headerElement === evt.currentTarget) {
                                group = that.groupHeaders[grp];
                                break;
                            }
                        }
                        if (group) {
                            if (OpenLayers.Element.hasClass(group.headerElement, 'active')) {
                                OpenLayers.Element.removeClass(group.headerElement, 'active');
                            } else {
                                OpenLayers.Element.addClass(group.headerElement, 'active');
                            }
                        }
                    });
                }
            } 
        }
    },
    removeEventListeners: function () {

    },
    updateLayer: function (layerData) {
        if (layerData.layer.getVisibility()) {
            OpenLayers.Element.addClass(layerData.link, 'active');
        } else {
            OpenLayers.Element.removeClass(layerData.link, 'active');
        }
    },
    updateStatus: function () {
        var i,
            j,
            that = this,
            layer;

        for (i = 0, j = this.layers.length; i < j; i += 1) {
            this.updateLayer(this.layers[i]);
        }
    },

    draw: function () {
        var self = this, 
            cName = 'OverlayGroupPanel-button nkButton',
            mapped, 
            btn, 
            buttonContent = '',
            toolElement, 
            panel,
            menu;

        this.buildLayerGroupStructure();

	    mapped = 'OpenLayers_Control_OverlayGroupPanel' + self.map.id;
        btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');

        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind(self.toggleWidget, self)
        );

        // hack to support non-ascii characters in the title
        var tmp = document.createElement('div')
        tmp.innerHTML = self.title;
        btn.title = tmp.textContent || tmp.innerText;
        tmp = null;
        delete tmp;

        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        if (this.svgIcon) {
            buttonContent += OpenLayers.Util.hideFromOldIE(this.svgIcon);
        }
        if (this.buttonText) {
            buttonContent += '<span>' + this.buttonText + '</span>';
        }
        if (this.buttonText && this.svgIcon) {
            OpenLayers.Element.addClass(btn, 'button-text-with-icon');
        }

        btn.innerHTML = buttonContent;

        if (self.div == null) {
            self.div = btn;
        } else {
            if (OpenLayers.Element.hasClass(self.div, 'panel')) {
                panel = self.div;
                toolElement = document.createElement('div');
                OpenLayers.Element.addClass(toolElement, 'tool');
                OpenLayers.Element.addClass(toolElement, 'overlay-group-panel');
                toolElement.appendChild(btn);
                panel.appendChild(toolElement);
                self.div = toolElement;
            } else {
                self.div.appendChild(btn);
            }
        }
        if (this.group) {
            OpenLayers.Element.addClass(this.div, this.group.replace(/\./g, '-'));
        }

    	self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

        self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
        menu = this.drawMenu(this.groupedLayers);
        this.cnt.appendChild(menu);  

        this.addEventListeners();
        this.updateStatus();

        self.div.appendChild(self.widget);
  
        return self.div;
    }, // draw
     
    hideControls: function () {
    	OpenLayers.Element.removeClass( this.div, 'active' );
        this.transformButton = null;
        this.inputForm = null;
    }, //hideControls

    drawLayerControl: function (layerData) {
        var checked,
            inputElem,

        checked = layerData.layer.getVisibility();

        // create input element
        inputElem = document.createElement("input");
        inputElem.id = this.id + "_input_" + layer.name;
        inputElem.name = this.id + "raster_layer_selector";
        inputElem.type = "radio";
        inputElem.value = layer.name;
        inputElem.checked = checked;
        inputElem.defaultChecked = checked;
        inputElem.className = "olButton";
        if (checked) {
            OpenLayers.Element.addClass(inputElem, "is-checked");
        }        
    },

    drawMenu: function (group, className) {

        var i, 
            j, 
            layer, 
            subGroup,
            groupHeader,
            groupHeading, 
            menu, 
            menuItem, 
            link, 
            menuElementCount = 0;

        menu = document.createElement('ul');

        if (className) {
            menu.setAttribute('class', className);
        }
        for (subGroup in group.groups) {
            if (group.groups.hasOwnProperty(subGroup)) {
                menuItem = document.createElement('li');
                if (this.groupHeaders && this.groupHeaders[subGroup]) {
                    groupHeader = document.createElement('header');

                    if (this.groupHeaders[subGroup].heading) {
                        groupHeading = document.createElement('h1');
                        OpenLayers.Element.addClass(groupHeading, 'h');
                        groupHeading.innerHTML = this.groupHeaders[subGroup].heading;
                        groupHeader.appendChild(groupHeading);
                    }
                    groupHeader.setAttribute('tabindex', 0);
                    menuItem.appendChild(groupHeader);
                    this.groupHeaders[subGroup].headerElement = groupHeader;
                }
                menuItem.appendChild(this.drawMenu(group.groups[subGroup], subGroup));
                OpenLayers.Event.observe(menuItem, 'focusout', function (evt) {
                    OpenLayers.Element.removeClass(this, 'focused');
                });
                OpenLayers.Event.observe(menuItem, 'focusin', function (evt) {
                    OpenLayers.Element.addClass(this, 'focused');
                });
                menu.appendChild(menuItem);
                menuElementCount += 1;
            }
        }
        for (i = 0, j = group.layers.length; i < j; i +=1) {
            menuItem = document.createElement('li');
            link = document.createElement('a');
            link.setAttribute('href', '#/' + (group.layers[i].layer.getVisibility() ? '-' : '+') + group.layers[i].layer.shortid);
            link.innerHTML = group.layers[i].layer.name;
            group.layers[i].link = link;
            menuItem.appendChild(link);
            group.layers[i].inputElem = menuItem;
            menu.appendChild(menuItem);
            menuElementCount += 1;
        }
        OpenLayers.Element.addClass(menu, 'containing-' + menuElementCount);
        return menu;
    },
    showControls: function () {
        var that = this;
        this.updateStatus();
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
    
    CLASS_NAME: "OpenLayers.Control.OverlayGroupPanel"
}); // OpenLayers.Control.Transformations

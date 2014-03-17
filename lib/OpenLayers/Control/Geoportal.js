/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */

OpenLayers.Control.Geoportal = OpenLayers.Class(OpenLayers.Control, {
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonGeoportal',
    elemsToHideSelector: '',
    title: null,
    widget: null,
    cnt: null,
    btnSubmit: null,

    initialize: function (options) {
        var self = this;
        OpenLayers.Control.prototype.initialize.apply(self, [options]);
        self.type = OpenLayers.Control.TYPE_BUTTON;
        this.title = OpenLayers.Lang.translate('Geoportal Layers');
    }, // initialize

    draw: function () {
        var self = this,
            cName = 'Geoportal-button nkButton',
            mapped,
            btn;

        mapped = 'OpenLayers_Control_Geoportal' + self.map.id;
        btn = OpenLayers.Util.createButton(mapped, null, null, null, 'static');

        OpenLayers.Event.observe(btn, 'click', OpenLayers.Function.bind(self.toggleWidget, self));
        OpenLayers.Util.appendToggleToolClick({'self': self});

        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="18.00239" height="17.992767" id="svg5952"> <defs id="defs5954"> <linearGradient id="linearGradient2485"> <stop id="stop2486" style="stop-color:#ffffff;stop-opacity:1" offset="0" /> <stop id="stop2487" style="stop-color:#aaaaaa;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient id="linearGradient3480-1"> <stop id="stop3482-7" style="stop-color:#646464;stop-opacity:1" offset="0" /> <stop id="stop3484-4" style="stop-color:#000000;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient id="linearGradient5704"> <stop id="stop5706" style="stop-color:#5a5a5a;stop-opacity:1" offset="0" /> <stop id="stop5708" style="stop-color:#000000;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient x1="974.19751" y1="182.46863" x2="979.80444" y2="184.8026" id="linearGradient3147" xlink:href="#linearGradient2485" gradientUnits="userSpaceOnUse" gradientTransform="translate(-963.99154,-169)" /> <linearGradient x1="968.88806" y1="178.31856" x2="977.93347" y2="181.70978" id="linearGradient3149" xlink:href="#linearGradient5704" gradientUnits="userSpaceOnUse" gradientTransform="translate(-963.99154,-169)" /> <linearGradient x1="974.19751" y1="182.46863" x2="979.80444" y2="184.8026" id="linearGradient3152" xlink:href="#linearGradient2485" gradientUnits="userSpaceOnUse" gradientTransform="translate(-963.99154,-169)" /> <linearGradient x1="967.73901" y1="178.93727" x2="974.57471" y2="184.71498" id="linearGradient3154" xlink:href="#linearGradient3480-1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-963.99154,-169)" /> </defs> <metadata id="metadata5957"> <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> <dc:title></dc:title> </cc:Work> </rdf:RDF> </metadata> <path d="m 5.5084634,16.5 10.9999996,0 -4,-5 -10.9999996,0 4,5 z" id="rect4045" style="opacity:0.48093842;color:#000000;fill:url(#linearGradient3152);fill-opacity:1;fill-rule:evenodd;stroke:url(#linearGradient3154);stroke-width:0.99994743;stroke-linecap:square;stroke-linejoin:round;stroke-miterlimit:0;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;display:inline" /> <path d="m 5.5084634,13.5 10.9999996,0 -4,-5 -10.9999996,0 4,5 z" id="path4802" style="color:#000000;fill:url(#linearGradient3147);fill-opacity:1;fill-rule:evenodd;stroke:url(#linearGradient3149);stroke-width:0.99994743;stroke-linecap:square;stroke-linejoin:round;stroke-miterlimit:0;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;display:inline" /> <path d="m 3.0084634,3 0,-2 2,0 0,2 2,0 0,2 -2,0 0,2 -2,0 0,-2 -2,0 0,-2 2,0 z" id="path4048" style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:none" /> </svg>');

        if (self.div == null) {
            self.div = btn;
        } else {
            self.div.appendChild(btn);
        }

        self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

        self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
        self.div.appendChild(self.widget);

        return self.div;
    }, // draw

    hideControls: function () {
        OpenLayers.Element.removeClass(this.div, 'active');
    }, //hideControls

    showControls: function () {
        var that = this,
            html = '<div class="header">';

        html += '<h1 class="h">' + OpenLayers.Lang.translate('Add Layers') + '</h1>';
        html += '<p>' + OpenLayers.Lang.translate('Write a URL to an WMS Services and choose the layers.') + ':</p>';
        html += '</div>';
        html += '<div class="geoportal-panel"><form id="geoportal-form">';
        html += '<input id="geoportalUrl" type="url" style="width: 324px"><button id="geoportalUrl-submit" type="button">Add Layer</button>';
        html += '</form></div><div id="layerList"></div>';
        this.cnt.innerHTML = html;

        this.btnSubmit = document.getElementById('geoportalUrl-submit');
        OpenLayers.Event.observe(this.btnSubmit, 'click',
            OpenLayers.Function.bind(that.getLayers, that)
        );
        OpenLayers.Util.renderToggleToolClick({'self': this});
        OpenLayers.Element.addClass(this.div, 'active');

        NK.functions.addLayerSwitcher();
    }, // showControls

    onClick: function (event) {
        /*
         Start bugfix: 43616-162
         */
        var targ, e = event;
        if (e) {
            if (e.target) {
                targ = e.target;
            } else if (e.srcElement) {
                targ = e.srcElement;
            }
            if (targ.nodeType == 3) targ = targ.parentNode; // Safari quirk
        }
        if (targ.nodeName.toLowerCase() === 'select' ||
            targ.nodeName.toLowerCase() === 'option') {
            e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
            return false;
        }
        /*
         End bugfix: 43616-162
         */

        if ((!!event.target && (event.target.id === this.submitBtnId || $(event.target).parents('#' + this.submitBtnId).length > 0)) || event.srcElement === this.submitBtnId) {
            this.getLayers();
            return false;
        }
    }, // onClick

    getLayers: function () {
        var layerURL = document.getElementById('geoportalUrl').value;
        this.getCapabilities(layerURL);
    }, // getLayers

    getCapabilities: function (url) {
        var reqUrl = $.ajax({
            url: url,
            type: 'GET',
            data: {service: 'WMS', request: 'getCapabilities'},
            dataType: 'xml'
        });
        var layers = [];

        reqUrl.done(function (xml) {
            $(xml).find('Layer').each(function () {
                layers.push($(this).children('Name').text());
                var name = $(this).children('Name').text();
                var layer = $(this).children('Name').text();
                NK.functions.addDynamicLayer(name, url, layer);
            });
            console.log(layers);
        });
    }, // getCapabilities

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable

    toggleWidget: function () {
        OpenLayers.Element.hasClass(this.div, 'active') ? this.hideControls() : this.showControls();
    }, // toggleWidget

    toggleControls: function () {
        var self = this;
    }, //togglecontrols

    CLASS_NAME: "OpenLayers.Control.Geoportal"
}); // OpenLayers.Control.GetURL

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
    this.title = OpenLayers.Lang.translate('Layer list');
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
    btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="25" height="25" id="svg5952"> <defs id="defs5954"> <linearGradient id="linearGradient2485"> <stop id="stop2486" style="stop-color:#ffffff;stop-opacity:1" offset="0" /> <stop id="stop2487" style="stop-color:#aaaaaa;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient id="linearGradient3480-1"> <stop id="stop3482-7" style="stop-color:#646464;stop-opacity:1" offset="0" /> <stop id="stop3484-4" style="stop-color:#000000;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient id="linearGradient5704"> <stop id="stop5706" style="stop-color:#5a5a5a;stop-opacity:1" offset="0" /> <stop id="stop5708" style="stop-color:#000000;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient x1="974.19751" y1="182.46863" x2="979.80444" y2="184.8026" id="linearGradient3147" xlink:href="#linearGradient2485" gradientUnits="userSpaceOnUse" gradientTransform="translate(-963.99154,-169)" /> <linearGradient x1="968.88806" y1="178.31856" x2="977.93347" y2="181.70978" id="linearGradient3149" xlink:href="#linearGradient5704" gradientUnits="userSpaceOnUse" gradientTransform="translate(-963.99154,-169)" /> <linearGradient x1="974.19751" y1="182.46863" x2="979.80444" y2="184.8026" id="linearGradient3152" xlink:href="#linearGradient2485" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1.4479147,0,0,1.4479147,-1396.2292,-245.30489)" /> <linearGradient x1="967.73901" y1="178.93727" x2="974.57471" y2="184.71498" id="linearGradient3154" xlink:href="#linearGradient3480-1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1.4479147,0,0,1.4479147,-1396.2292,-245.30489)" /> <linearGradient x1="974.19751" y1="182.46863" x2="979.80444" y2="184.8026" id="linearGradient3147-1" xlink:href="#linearGradient2485-7" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1.4479147,0,0,1.4479147,-1396.2292,-249.52041)" /> <linearGradient id="linearGradient2485-7"> <stop id="stop2486-4" style="stop-color:#ffffff;stop-opacity:1" offset="0" /> <stop id="stop2487-0" style="stop-color:#aaaaaa;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient x1="968.88806" y1="178.31856" x2="977.93347" y2="181.70978" id="linearGradient3149-9" xlink:href="#linearGradient5704-4" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1.4479147,0,0,1.4479147,-1396.2292,-249.52041)" /> <linearGradient id="linearGradient5704-4"> <stop id="stop5706-8" style="stop-color:#5a5a5a;stop-opacity:1" offset="0" /> <stop id="stop5708-8" style="stop-color:#000000;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient x1="974.19751" y1="182.46863" x2="979.80444" y2="184.8026" id="linearGradient3152-2" xlink:href="#linearGradient2485-7" gradientUnits="userSpaceOnUse" gradientTransform="translate(-963.99154,-169)" /> <linearGradient id="linearGradient3075"> <stop id="stop3077" style="stop-color:#ffffff;stop-opacity:1" offset="0" /> <stop id="stop3079" style="stop-color:#aaaaaa;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient x1="967.73901" y1="178.93727" x2="974.57471" y2="184.71498" id="linearGradient3154-4" xlink:href="#linearGradient3480-1-5" gradientUnits="userSpaceOnUse" gradientTransform="translate(-963.99154,-169)" /> <linearGradient id="linearGradient3480-1-5"> <stop id="stop3482-7-5" style="stop-color:#646464;stop-opacity:1" offset="0" /> <stop id="stop3484-4-1" style="stop-color:#000000;stop-opacity:1" offset="1" /> </linearGradient> <linearGradient y2="184.8026" x2="979.80444" y1="182.46863" x1="974.19751" gradientTransform="translate(-964.07986,-171.91144)" gradientUnits="userSpaceOnUse" id="linearGradient3087" xlink:href="#linearGradient2485-7" collect="always" /> <linearGradient y2="184.71498" x2="974.57471" y1="178.93727" x1="967.73901" gradientTransform="translate(-964.07986,-171.91144)" gradientUnits="userSpaceOnUse" id="linearGradient3089" xlink:href="#linearGradient3480-1-5" collect="always" /> <linearGradient collect="always" xlink:href="#linearGradient2485-7" id="linearGradient3136" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1.4479147,0,0,1.4479147,-1396.2292,-249.58452)" x1="974.19751" y1="182.46863" x2="979.80444" y2="184.8026" /> <linearGradient collect="always" xlink:href="#linearGradient3480-1-5" id="linearGradient3138" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1.4479147,0,0,1.4479147,-1396.2292,-249.58452)" x1="967.73901" y1="178.93727" x2="974.57471" y2="184.71498" /> </defs> <metadata id="metadata5957"> <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> <dc:title /> </cc:Work> </rdf:RDF> </metadata> <path d="m 7.5240676,23.283287 15.9270604,0 -5.791658,-7.239573 -15.927061,0 5.7916586,7.239573 z" id="rect4045" style="opacity:0.48093842;color:#000000;fill:url(#linearGradient3152);fill-opacity:1;fill-rule:evenodd;stroke:url(#linearGradient3154);stroke-width:1.44783854;stroke-linecap:square;stroke-linejoin:round;stroke-miterlimit:0;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;display:inline" connector-curvature="0" inkscape:connector-curvature="0" /> <path d="m 7.5240676,19.003659 15.9270594,0 -5.791659,-7.239574 -15.927059,0 5.7916586,7.239574 z" id="rect4045-7" style="opacity:0.48093842;color:#000000;fill:url(#linearGradient3136);fill-opacity:1;fill-rule:evenodd;stroke:url(#linearGradient3138);stroke-width:1.44783854;stroke-linecap:square;stroke-linejoin:round;stroke-miterlimit:0;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;display:inline" connector-curvature="0" inkscape:connector-curvature="0" /> <path connector-curvature="0" d="m 7.5240676,14.72403 15.9270594,0 -5.791659,-7.2395735 -15.927059,0 5.7916586,7.2395735 z" id="path4802-1" style="color:#000000;fill:url(#linearGradient3147-1);fill-opacity:1;fill-rule:evenodd;stroke:url(#linearGradient3149-9);stroke-width:1.44783854;stroke-linecap:square;stroke-linejoin:round;stroke-miterlimit:0;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;display:inline" inkscape:connector-curvature="0" /></svg>');

    if (self.div == null) {
      self.div = btn;
    } else {
      self.div.appendChild(btn);
    }

    self.cnt = document.createElement("div");
    OpenLayers.Element.addClass(self.cnt, "cnt");
    OpenLayers.Element.addClass(self.cnt, "embedContent");

    self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
    self.div.appendChild(self.widget);

    return self.div;
  }, // draw

  hideControls: function () {
    OpenLayers.Element.removeClass(this.div, 'active');
  }, //hideControls

  showControls: function (url) {
    var html = '';

    html += '<div class="header" id="tabs-container">'
    html += '<div class="heading">';
    html += '<h1 class="h">'+OpenLayers.Lang.translate('Thematic overlays')+'</h1>';
    html += '<button class="close" id="geoportal-panel-close-btn">&times;</button>';
    html += '</div>';
    html += '<a href="#showLayersTab" id="showLayer">'+OpenLayers.Lang.translate('Layer list')+'</a>&nbsp;&mdash;&nbsp;';
    html += '<a href="#legendTab" id="showLegend">'+OpenLayers.Lang.translate('Legends')+'</a>';
    html += '<div class="tab">';
    html += '<div class="tab-content" id="showLayersTab"><div id="layerList" style="width:436px; max-height:75vh; overflow-y:scroll"></div></div>';
    html += '<div class="tab-content" id="legendTab"><div id="legendBox"">'+OpenLayers.Lang.translate('No legend available.')+'</div></div>';
    html += '</div>';

    this.cnt.innerHTML = html;

    OpenLayers.Util.renderToggleToolClick({'self': this});
    OpenLayers.Element.addClass(this.div, 'active');
    
    var geoportalPanelCloseBtn = document.getElementById('geoportal-panel-close-btn');
    if (geoportalPanelCloseBtn !== null) {
      OpenLayers.Event.observe(geoportalPanelCloseBtn, 'click', OpenLayers.Function.bind(this.hideControls, this));
    }

    NK.functions.addLayerSwitcher();

    $(".tab-content").hide();
    $("#showLayersTab").fadeIn();
    $("#showLayer").click(this, function (event) { 
      event.preventDefault();
      event.data.displayLayerList();
    });   
    $("#showLegend").click(this, function (event) { 
      event.preventDefault();
      event.data.displayLegend();
    });
  }, // showControls

  displayLayerList: function(event) {
    var menuLink = $('#showLayer');
    if (!!event) {event.preventDefault();}
    $(menuLink).parent().parent().parent().children().children().removeClass("current");
    $(menuLink).parent().addClass("current");
    var tab = $(menuLink).attr("href");
    $(".tab-content").not(tab).hide();
    $(tab).fadeIn();
  },

  displayLegend: function(event) {
    var menuLink = $('#showLegend');
    if (!!event) {event.preventDefault();}
    $(menuLink).parent().parent().parent().children().children().removeClass("current");
    $(menuLink).parent().addClass("current");
    var tab = $(menuLink).attr("href");
    $(".tab-content").not(tab).hide();
    $(tab).fadeIn();
  },

  enable: function () {
  }, // enable

  disable: function () {
  }, // disable

  toggleWidget: function () {
    OpenLayers.Element.hasClass(this.div, 'active') ? this.hideControls() : this.showControls();
  }, // toggleWidget

  toggleControls: function () {
  }, //togglecontrols

  CLASS_NAME: "OpenLayers.Control.Geoportal"
}); // OpenLayers.Control.GetURL

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */

OpenLayers.Control.AddLayer = OpenLayers.Class(OpenLayers.Control, {
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
    this.title = OpenLayers.Lang.translate('Add Layer');
  }, // initialize

  draw: function () {
    var self = this,
      cName = 'Geoportal-button nkButton',
      mapped,
      btn;

    mapped = 'OpenLayers_Control_AddLayer' + self.map.id;
    btn = OpenLayers.Util.createButton(mapped, null, null, null, 'static');

    OpenLayers.Event.observe(btn, 'click', OpenLayers.Function.bind(self.toggleWidget, self));
    OpenLayers.Util.appendToggleToolClick({'self': self});

    btn.title = self.title;
    btn.className = btn.className === "" ? cName : btn.className + " " + cName;
    btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="icon"><path d="M 2,8 8,8 8,2 14,2 14,8 20,8 20,14 14,14 14,20 8,20 8,14 2,14 Z"/><path d="M 32,42 62,32 62,26 32,18 2,26 2,32 Z"/><path d="M 32,52 62,42 62,36 32,46 2,36 2,42 Z"/><path d="M 32,62 62,52 62,46 32,56 2,46 2,52 Z"/></svg>');

    
    var panel = document.createElement("div");
    panel.id = 'addlayer';
    OpenLayers.Element.addClass(panel, "tool");

    self.div.appendChild(panel);
    self.div = panel;
    panel.appendChild(btn);

    self.cnt = document.createElement("div");
    OpenLayers.Element.addClass(self.cnt, "cnt");
    OpenLayers.Element.addClass(self.cnt, "embedContent");

    self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
    
    var times = document.createElement('button');
    times.setAttribute('class', 'times');
    times.setAttribute('title', OpenLayers.Lang.translate('Done'));
    times.innerHTML = '&times;';
    self.widget.appendChild(times);
    OpenLayers.Event.observe(times, 'click', OpenLayers.Function.bind(this.hideControls, this));
    
    panel.appendChild(self.widget);

    return panel;
  }, // draw

  hideControls: function () {
    OpenLayers.Element.removeClass(this.div, 'active');
  }, //hideControls

  showControls: function (url) {
    var that = this;
    var html = '';

    url = url || "";
    
    html += '<h1 class="h">' + OpenLayers.Lang.translate('Connect to service') + '</h1>';
    html += '<p><strong>' + OpenLayers.Lang.translate('e.g.') + '</strong>: http://openwms.statkart.no/skwms1/wms.topo2</p>';
    html += '<form id="geoportal-form">';
    html += '<input class="form-control" id="geoportalUrl" type="url" value="' + url + '"/>';
    html += '<label class="radio"><input checked name="gp-service-type" type="radio" value="wms" />WMS</label>';
    html += '<label class="radio"><input name="gp-service-type" type="radio" value="wfs"/>WFS</label>';
    html += '<button class="btn pull-right" id="geoportalUrl-submit" type="button">' + OpenLayers.Lang.translate('Connect') + '</button>';
    html += '</form>';

    this.cnt.innerHTML = html;

    this.btnSubmit = document.getElementById('geoportalUrl-submit');
    OpenLayers.Event.observe(this.btnSubmit, 'click',
      OpenLayers.Function.bind(that.getLayers, that)
    );
    OpenLayers.Util.renderToggleToolClick({'self': this});
    OpenLayers.Element.addClass(this.div, 'active');

  }, // showControls

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

  getLayers: function () {
    var layerURL = document.getElementById('geoportalUrl').value;
    var type = $("input[name='gp-service-type']:checked").val();
    if (type == "wms") {
      NK.functions.addWMSLayer(layerURL);
    } else if (type == "wfs") {
      NK.functions.addWFSLayer(layerURL);
    }
  }, // getLayers


  CLASS_NAME: "OpenLayers.Control.AddLayer"
}); // OpenLayers.Control.GetURL

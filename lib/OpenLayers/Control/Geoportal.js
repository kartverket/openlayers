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
    btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="icon"><path d="M 32,32 62,22 62,16 32,8 2,16 2,22 Z" /><path d="M 32,42 62,32 62,26 32,36 2,26 2,32 Z" /><path d="M 32,52 62,42 62,36 32,46 2,36 2,42 Z" /><path d="M 32,62 62,52 62,46 32,56 2,46 2,52 Z" /></svg>');

    if (self.div == null) {
      self.div = btn;
    } else {
      self.div.appendChild(btn);
    }

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
    
    self.div.appendChild(self.widget);

    return self.div;
  }, // draw

  hideControls: function () {
    OpenLayers.Element.removeClass(this.div, 'active');
  }, //hideControls

  showControls: function (url) {
    var html = '';
    html += '<div class="tabs" id="tabs-container">';
    html += '<h1 class="h">'+OpenLayers.Lang.translate('Thematic overlays')+'</h1>';
    html += '<nav>';
    html += '<a class="active" href="#tab-layers">'+OpenLayers.Lang.translate('Layer list')+'</a>';
    html += '<a href="#tab-legend">'+OpenLayers.Lang.translate('Legends')+'</a>';
    html += '</nav>';
    html += '<div class="tab active" id="tab-layers">';
    html += '<div id="layerList"></div>';
    html += '</div>';
    html += '<div class="tab" id="tab-legend">';
    html += '<div id="legendBox">' + OpenLayers.Lang.translate('No legend available') + '</div>';
    html += '</div>';
    html += '</div>';
    this.cnt.innerHTML = html;

    OpenLayers.Util.renderToggleToolClick({'self': this});
    OpenLayers.Element.addClass(this.div, 'active');
    
    NK.functions.addLayerSwitcher();
    
    $('#tabs-container').find('nav a').on('click', this.switchTab);
  }, // showControls
  
  switchTab: function (event) {
    event.preventDefault();
    var self = $(this);
    self.closest('#tabs-container').find('nav a').removeClass('active');
    self.addClass('active');
    
    self.closest('#tabs-container').find('.tab').removeClass('active');
    var id = self.attr('href').split('#').pop();
    $('#' + id).addClass('active');
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
  
  displayLayerList: function (event) {
    //Depracated
  }, // displayLayerList
  
  displayLegend: function (event) {
    //Depracated
  }, // displayLegend

  CLASS_NAME: "OpenLayers.Control.Geoportal"
}); // OpenLayers.Control.GetURL

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
    btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="64px" height="64px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 64 64" class="icon"><path stroke="#fff" stroke-width="2" d="M 2,38 42,38 62,62 22,62 Z"/><path stroke="#fff" stroke-width="2" d="M 2,21 42,21 62,45 22,45 Z"/><path stroke="#fff" stroke-width="2" d="M 2,2 42,2 62,26 22,26 Z"/></svg>');

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
    html += '<nav class="tabs">';
    html += '<a href="#showLayersTab" id="showLayer">'+OpenLayers.Lang.translate('Layer list')+'</a>';
    html += '<a href="#legendTab" id="showLegend">'+OpenLayers.Lang.translate('Legends')+'</a>';
    html += '</nav>';
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
    $("#showLayer").addClass('active');
    $("#showLayer").click(this, function (event) { 
      event.preventDefault();
      $("#showLegend").removeClass('active');
      $(this).addClass('active');
      event.data.displayLayerList();
    });   
    $("#showLegend").click(this, function (event) { 
      event.preventDefault();
      $("#showLayer").removeClass('active');
      $(this).addClass('active');
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

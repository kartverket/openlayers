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
  activeStep: null,

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
    OpenLayers.Element.addClass(self.cnt, "embedContent");

    self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
    self.div.appendChild(self.widget);

    return self.div;
  }, // draw

  hideControls: function () {
    OpenLayers.Element.removeClass(this.div, 'active');
  }, //hideControls

  showControls: function (url) {
    var that = this;
    var html = '';

    url = url || "";

    html += '<div class="header" id="tabs-container">'+OpenLayers.Lang.translate('Connect to service');
    html += '<header><ol class="type-active tabs-menu">';
    html += '<li class="tjenesteTab"><span class="step-number current"><a href="#addLayerTab" id="addLayer">1</a></span> of <span>3</span><span class="step-label">'+OpenLayers.Lang.translate('Service')+'</span></li>';
    html += '<li class="lagTab"><span class="step-number"><a href="#showLayersTab" id="showLayer">2</a></span> of <span>3</span><span class="step-label">'+OpenLayers.Lang.translate('Layer')+'</span></li>';
    html += '<li class="legendTab"><span class="step-number"><a href="#legendTab" id="legend">3</a></span> of <span>3</span><span class="step-label">'+OpenLayers.Lang.translate('Legend')+'</span></li>';
    html += '</ol></header>';
    html += '<div class="tab">';
    html += '<div class="tab-content" id="addLayerTab">';
    html += '<form id="geoportal-form" style="height: 300px;">';
    html += OpenLayers.Lang.translate('Base URL')+':<br/>';
    html += '<i>'+OpenLayers.Lang.translate('e.g.')+': http://openwms.statkart.no/skwms1/wms.topo2</i><br/>';
    html += '<input id="geoportalUrl" type="url" style="width:100%;" value="'+url+'"/>';
    html += '<span style="margin-top:3px">WMS: <input checked name="gp-service-type" type="radio" value="wms"/> WFS: <input name="gp-service-type" type="radio" value="wfs"/></span>';
    html += '<button id="geoportalUrl-submit" type="button" style="float:right; margin:3px">'+OpenLayers.Lang.translate('Connect')+'</button>';
    html += '</form>';
    html += '</div>';
    html += '<div class="tab-content" id="showLayersTab"><div id="layerList" style="height: 300px;  width:436px; overflow-y: scroll;"></div></div>';
    html += '<div class="tab-content" id="legendTab"><div id="legendBox" style="height: 300px; overflow-y: scroll;">'+OpenLayers.Lang.translate('No legend available.')+'</div></div>';
    html += '</div>';
    html += '<div class="buttons-panel" id="buttonTab"><button class="back" id="backButton">'+OpenLayers.Lang.translate('Previous')+'</button><button class="next" id="nextButton">'+OpenLayers.Lang.translate('Next')+'</button></div>';
    html += '</div>';

    this.cnt.innerHTML = html;

    this.btnSubmit = document.getElementById('geoportalUrl-submit');
    OpenLayers.Event.observe(this.btnSubmit, 'click',
      OpenLayers.Function.bind(that.getLayers, that)
    );
    OpenLayers.Util.renderToggleToolClick({'self': this});
    OpenLayers.Element.addClass(this.div, 'active');

    that.backButton = document.getElementById('backButton');
    document.getElementById('backButton').style.visibility = 'hidden';
    document.getElementById('nextButton').style.visibility = 'hidden';
    that.nextButton = document.getElementById('nextButton');
    OpenLayers.Event.observe(that.backButton, 'click', function (evt) {
      that.previousStep();
      return false;
    });

    OpenLayers.Event.observe(that.nextButton, 'click', function (evt) {
      that.nextStep();
      return false;
    });

    NK.functions.addLayerSwitcher();

    $(".tab-content").hide();
    $("#addLayerTab").fadeIn();

    $(".tabs-menu a").click(function (event) {
      event.preventDefault();
      $(this).parent().parent().parent().children().children().removeClass("current");
      $(this).parent().addClass("current");
      var tab = $(this).attr("href");
      $(".tab-content").not(tab).hide();
      $(tab).fadeIn();
    });
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
    var type = $("input[name='gp-service-type']:checked").val();
    if (type == "wms") {
      NK.functions.addWMSLayer(layerURL);
    } else if (type == "wfs") {
      NK.functions.addWFSLayer(layerURL);
    }
  }, // getLayers

  displayLayerList: function(event) {
    this.currentStep = 'show';
    var menuLink = $('#showLayer');
    if (!!event) {event.preventDefault();}
    $(menuLink).parent().parent().parent().children().children().removeClass("current");
    $(menuLink).parent().addClass("current");
    var tab = $(menuLink).attr("href");
    $(".tab-content").not(tab).hide();
    $(tab).fadeIn();
    this.backButton.style.visibility='visible';
    this.nextButton.style.visibility='visible';
  },

  updateStepProgressPanel: function () {
    OpenLayers.Element.removeClass(this.stepProgressPanel, 'addLayerTab-active');
    OpenLayers.Element.removeClass(this.stepProgressPanel, 'showLayersTab-active');
    OpenLayers.Element.removeClass(this.stepProgressPanel, 'legendTab-active');
    OpenLayers.Element.addClass(this.stepProgressPanel, this.activeStep + '-active');

    if (typeof(this.tracking) == 'function') {
      this.tracking({
        'step': this.activeStep,
        'module': this,
        'clicked': this.clicked
      });
    }
  },
  currentStep:'add',

  nextStep: function () {
    if (this.currentStep === 'add') {
      var menuLink = $('#showLayer');
      this.currentStep = 'show';
      document.getElementById('backButton').style.visibility = 'visible';
      $(menuLink).parent().parent().parent().children().children().removeClass("current");
      $(menuLink).parent().addClass("current");
      var tab = $(menuLink).attr("href");
      $(".tab-content").not(tab).hide();
      $(tab).fadeIn();
    } else if (this.currentStep === 'show') {
      var menuLink = $('#legend');
      this.currentStep = 'legend';
      //document.getElementById('nextButton').style.visibility = 'hidden';
      document.getElementById('nextButton').innerHTML = OpenLayers.Lang.translate("Close");
      $(menuLink).parent().parent().parent().children().children().removeClass("current");
      $(menuLink).parent().addClass("current");
      var tab = $(menuLink).attr("href");
      $(".tab-content").not(tab).hide();
      $(tab).fadeIn();
    } else if (this.currentStep === 'legend') {
      this.currentStep='add';
      this.hideControls();
    }
  },

  previousStep: function () {
    if (this.currentStep === 'add') {
    } else if (this.currentStep === 'show') {
      var menuLink = $('#addLayer');
      this.currentStep = 'add';
      document.getElementById('backButton').style.visibility = 'hidden';
      $(menuLink).parent().parent().parent().children().children().removeClass("current");
      $(menuLink).parent().addClass("current");
      var tab = $(menuLink).attr("href");
      $(".tab-content").not(tab).hide();
      $(tab).fadeIn();
    } else if (this.currentStep === 'legend') {
      var menuLink = $('#showLayer');
      this.currentStep = 'show';
      //document.getElementById('nextButton').style.visibility = 'visible';
      document.getElementById('nextButton').innerHTML = OpenLayers.Lang.translate("Next");
      $(menuLink).parent().parent().parent().children().children().removeClass("current");
      $(menuLink).parent().addClass("current");
      var tab = $(menuLink).attr("href");
      $(".tab-content").not(tab).hide();
      $(tab).fadeIn();
    }
  },

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
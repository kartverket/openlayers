/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */

OpenLayers.Control.Help = OpenLayers.Class(OpenLayers.Control, {

  // remember that suffixes are added to this class: ItemActive or ItemInactive
  btnClass           : 'olControlButtonHelp',
  elemsToHideSelector: '',
  title              : null,
  widget             : null,
  cnt                : null,
  faqUrl             : '',

  initialize: function (options) {
    var self = this;
    OpenLayers.Control.prototype.initialize.apply(self, [options]);
    self.type = OpenLayers.Control.TYPE_BUTTON;
    this.title = OpenLayers.Lang.translate('Keyboard shortcuts');
  }, // initialize

  draw: function () {
    var self = this,
      cName = 'nkButton btn',
      mapped,
      btn;

    mapped = 'OpenLayers_Control_Help' + self.map.id;
    btn = OpenLayers.Util.createButton(mapped, null, null, null, 'static');

    OpenLayers.Event.observe(btn, 'click', OpenLayers.Function.bind(self.toggleWidget, self));

    OpenLayers.Util.appendToggleToolClick({'self': self});

    btn.title = self.title;
    btn.className = btn.className === "" ? cName : btn.className + " " + cName;
    btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 96.999999 97.000002" enable-background="new 0 0 841.9 595.3" xml:space="preserve"  width="24" height="24" > <g id="g3572" transform="translate(-372.3,-249.3)"> <g id="g3574"> <rect x="411.79999" y="287.29999" width="17" height="45" id="rect3576" style="fill:#ffffff" /> <circle cx="420.60001" cy="273.29999" r="8.8999996" id="circle3578" style="fill:#ffffff" /> </g> <g id="g3580"> <path d="m 420.8,346.3 c -26.7,0 -48.5,-21.8 -48.5,-48.5 0,-26.7 21.8,-48.5 48.5,-48.5 26.7,0 48.5,21.8 48.5,48.5 0,26.8 -21.7,48.5 -48.5,48.5 z m 0,-89 c -22.3,0 -40.5,18.2 -40.5,40.5 0,22.3 18.2,40.5 40.5,40.5 22.3,0 40.5,-18.2 40.5,-40.5 0,-22.3 -18.1,-40.5 -40.5,-40.5 z" id="path3582" style="fill:#ffffff" /> </g> </g> </svg>');

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

  insertFaq: function (response, status, request) {
    var faq = request.responseText.replace(/[\"\r\n]/g, '');
    $("#faqBox").html(faq);
    $(".faq-panel").accordion({
      heightStyle: "fill",
      collapsible: true,
      heightStyle: "content"
    });
    $(".help-menu").accordion({
      collapsible: true,
      heightStyle: "content",
      active     : false
    });
  },

  showControls: function () {
    // user OS sniffing to display correct key name/symbol
    var mac = (navigator.platform && navigator.platform.indexOf('Mac') !== -1) || (navigator.userAgent && navigator.userAgent.indexOf('iPhone') !== -1);
    var ctrlKey = mac ? '⌘ ' : 'Ctrl + ';
    var html = '';
    html += '<div id="shortcuts" class="help-menu">';
    html += '<h5 class="h">' + OpenLayers.Lang.translate('Keyboard shortcuts') + '</h5>';
    html += '<div class="shortcuts-panel">';
    html += '<div class="header">';
    html += '<p>' + OpenLayers.Lang.translate('You can navigate using the following keyboard shortcuts') + ':</p>';
    html += '<p>' + OpenLayers.Lang.translate('Press TAB to change selected control. Press ENTER to activate the selected control.') + '</p>';
    html += '</div>';
    html += '<table class="table table-condensed"><thead><tr><th scope="col">' + OpenLayers.Lang.translate('Keyboard shortcut') + '</th><th scope="col">' + OpenLayers.Lang.translate('Function') + '</th></tr></thead>';
    html += '<tbody><tr><td>F11</td><td>Fullskjerm</td></tr>';
    html += '<tr><td>' + ctrlKey + 'P</td><td>Skriv ut</td></tr>';
    html += '<tr><td>+ og -</td><td>Zoom</td></tr>';
    html += '<tr><td>Piltaster</td><td>Panorere</td></tr>';
    html += '<tr><td>Home, End, PageUp, PageDown</td><td>Panorere raskt</td></tr>';
    html += '</tbody></table>';
    html += '</div>';

    html += '<h5 class="h">Ofte stilte sp\u00f8rsm\u00e5l om norgeskart.no</h5>';
    html += '<div id="faqBox" class="faq-panel">'
    html += '</div>';

    html += '</div>';
    this.cnt.innerHTML = html;

    OpenLayers.Util.renderToggleToolClick({'self': this});
    OpenLayers.Element.addClass(this.div, 'active');

    $.ajax({
      url    : this.faqUrl,
      success: this.insertFaq,
      type   : 'GET'
    });
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

  CLASS_NAME: "OpenLayers.Control.Help"
}); // OpenLayers.Control.GetURL

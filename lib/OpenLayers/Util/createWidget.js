/**
 * @requires OpenLayers/Util.js
 */

/**
 * Function: createWidget
 *
 * Parameters:
 *   - content {DOM} shall be append to the widget. Otherwise empty
 *     content wrapper will be added in the widget
 *   - wCount {Integer} refers to the wrapper count within the widget
 *     shall be created.
 *   - close {Boolean}, the true refers to append close button in
 *     the widget. Otherwise no close button will be appended.
 * Returns:
 * {DOMElement} A DOM Button created with the specified attributes.
 */
OpenLayers.Util.createWidget = function( content, wCount, close ) {
  var widget, w, cnt, closeBtn;

  widget = document.createElement('div');
  OpenLayers.Element.addClass(widget, 'widget');

  var wrapper = widget, count = !wCount || isNaN(wCount) ? 0 : wCount;

  if (close) {
    closeBtn = document.createElement('button');
    OpenLayers.Element.addClass(closeBtn, 'close');
    wrapper.appendChild(closeBtn);
  }

  while (count-- > 0) {
    w = document.createElement('div');
    OpenLayers.Element.addClass(w, 'wrapper');
    wrapper.appendChild(w);
    wrapper = w;
  }

  cnt = content || document.createElement('div');

  if (!content) {
    OpenLayers.Element.addClass(cnt, 'widgetCnt');
  }

  wrapper.appendChild(cnt);

  return widget;
};
if (typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */

OpenLayers.Control.Search = OpenLayers.Class(OpenLayers.Control, {
    EVENT_TYPES: ["doSearch"],
    size: null,
    element: null,
    submitBtnId: "searchSubmit",
    searchUrl: '',
    streetAddressesSearchUrl: '',
    addressSearchUrl: '',
    propertySearchUrl: '',
    resultsPerPage: 15,
    markerLayer: null,
    menu : null,
    timer : null,
    searchTimer: null,
    lastPhrase : null,
    searchRequests : {
        ssr       : null,
        register  : null,
        gbrnr     : null,
        address   : null
    },
    searchData: {
        ssr      : null,
        register : null,
        address  : null,
        gbrnr    : null
    },
    closeButtonHtml: null,
    buttonIcon: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="38.829px" height="44.827px" viewBox="0 0 38.829 44.827" class="search icon" preserveAspectRatio="xMidYMid meet"><path d="M38.351,39.891L27.486,25.419h-0.785l-0.789,0.788l-1.159-1.602c2.576-2.611,4.169-6.192,4.169-10.145C28.922,6.488,22.436,0,14.461,0C6.487,0,0,6.488,0,14.461c0,7.975,6.487,14.462,14.461,14.462c2.362,0,4.589-0.582,6.562-1.589l1.447,1.649l-0.871,0.872v0.414c0,0,10.698,13.435,11.362,14.098c0.663,0.664,2.155,0.414,2.155,0.414s2.157-1.245,3.234-2.321C39.428,41.381,38.351,39.891,38.351,39.891 M5.108,14.461c0-5.155,4.196-9.353,9.353-9.353c5.158,0,9.353,4.198,9.353,9.353c0,5.159-4.194,9.354-9.353,9.354C9.304,23.815,5.108,19.62,5.108,14.461"/></svg>',

    initialize: function(options) {
        this.EVENT_TYPES = OpenLayers.Control.Search.prototype.EVENT_TYPES.concat(
            OpenLayers.Control.prototype.EVENT_TYPES);

        OpenLayers.Control.prototype.initialize.apply(this,[options]);
        this.closeButtonHtml = '<a href="#" class="close">' + OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" class="icon close" preserveAspectRatio="xMidYMid meet"><rect x="1.5" y="1.5" width="33" height="33" /><path class="cross" d="M9,9l18,18M27,9l-18,18"/></svg>') + 'lukk</a>';
        this.allowSelection = true;
        this.type = OpenLayers.Control.TYPE_BUTTON;
        this.title = OpenLayers.Lang.translate('Search');

    }, // initialize

    draw: function () {
        var inputElem,
            inputResultsPerPage,
            inputResultPageNumber,
            submitBtn,
            formElem;

        OpenLayers.Control.prototype.draw.apply(this, []);

        this.element = document.createElement('div');
        this.element.id = 'OpenLayers_Control_Search' + this.map.id;

        OpenLayers.Element.addClass(this.element, 'searchDiv');
        formElem = document.createElement('form');
        formElem.setAttribute('action', this.searchUrl);
        formElem.setAttribute('class', 'navbar-form navbar-left');
        formElem.setAttribute('role', 'search');
        formElem.onsubmit = function () {return false};

        var divgroup = document.createElement('div');
        divgroup.setAttribute('class', 'input-group');
        this.inputElem = inputElem = document.createElement('input');
        inputElem.setAttribute('name', 'searchInput');
        inputElem.setAttribute('id', 'searchInput');
        inputElem.setAttribute('class', 'form-control');
        inputElem.setAttribute('type', 'search');
        inputElem.setAttribute('autocomplete', 'off');
        inputElem.setAttribute('autocorrect', 'off');
        inputElem.setAttribute('autocapitalize', 'off');
        inputElem.setAttribute('spellcheck', 'false');
        inputElem.setAttribute('placeholder', 'Finn område, adresse, koordinat');

        inputResultsPerPage = document.createElement('input');
        inputResultsPerPage.setAttribute('name', 'searchResultsPerPage');
        inputResultsPerPage.setAttribute('id', 'searchResultsPerPageInput');
        inputResultsPerPage.setAttribute('value', this.resultsPerPage);
        inputResultsPerPage.setAttribute('type', 'hidden');

        inputResultPageNumber = document.createElement('input');
        inputResultPageNumber.setAttribute( 'name', 'searchResultsPageNumber' );
        inputResultPageNumber.setAttribute( 'id', 'searchResultsPageNumberInput' );
        inputResultPageNumber.setAttribute( 'value', '0' );
        inputResultPageNumber.setAttribute( 'type', 'hidden' );

        submitBtn = document.createElement( 'span' );
        submitBtn.setAttribute( 'id', this.submitBtnId );
        submitBtn.setAttribute('class', 'submit-button input-group-addon');
        submitBtn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="439px" height="438px" viewBox="0 0 439 438" class="icon search" preserveAspectRatio="xMidYMid meet"><path d="M432.155,368.606l-2.64-2.639l0.005-0.004l-105.53-105.539c14.662-25.259,23.18-54.54,23.379-85.837C347.985,78.772,270.817,0.612,175.01,0.01c-0.387-0.001-0.761-0.002-1.145-0.002C78.595,0.012,1.045,76.951,0.431,172.366c-0.605,95.81,76.561,173.967,172.359,174.579c0.379,0.002,0.751,0.004,1.133,0.004c31.845,0,61.686-8.627,87.357-23.63l105.439,105.45l0.009-0.01l2.638,2.636c7.973,7.975,20.897,7.967,28.871,0l33.918-33.917C440.124,389.511,440.128,376.578,432.155,368.606z M173.07,302.708c-71.252-0.456-128.852-58.802-128.401-130.059c0.456-70.798,58.414-128.399,129.198-128.403l0.864,0.002c34.518,0.216,66.884,13.863,91.137,38.426c24.251,24.564,37.485,57.105,37.262,91.63c-0.216,34.371-13.767,66.64-38.149,90.859c-24.376,24.212-56.715,37.545-91.058,37.545L173.07,302.708z"/></svg>') + '<span>søk</span>';

        formElem.appendChild(inputResultsPerPage);
        formElem.appendChild(inputResultPageNumber);
        divgroup.appendChild(inputElem);
        divgroup.appendChild(submitBtn);
        formElem.appendChild(divgroup);
        this.element.innerHTML = '';
        this.element.appendChild(formElem);
        this.div.appendChild(this.element);

        OpenLayers.Event.observe(this.div, 'click',
            OpenLayers.Function.bind(this.onClick, this)
        );

        // overriding default events and allows filling the search input
        this.events = new OpenLayers.Events(this, this.div, null, true);
        this.events.on({
            "mousedown": this.defaultEvent,
            "mousemove": this.defaultEvent,
            "mouseup": this.defaultEvent,
            "mouseout": this.defaultEvent,
            "dblclick": this.defaultEvent,
            "focus": this.defaultEvent,
            scope: this
        });

        if (!!this.keyboardHelper) {
          $(inputElem).keyboard({
            layout: 'custom',
            customLayout: {
              'default': [
                'Å Æ Ø Ä Ö',
                'Á Č Đ Ŋ Š Ŧ Ž'
              ]
            },
            restrictInput: false,
            useCombos: false,
            alwaysOpen: true,
            visible: true,
            usePreview: false,
            position: {
              of: null,
              at2: 'right bottom'
            }
          });

          $(inputElem).focus(this, function(event) {
            event.data.openKeyboard();
          });
          $(inputElem).blur(this, function(event) {
            event.data.closeKeyboard();
          });
        }

        // kind of live search
        var that = this;

        var searchFunction = function(e) {
                var searchInput = $('#searchInput'),
                    resultsList = $('#searchResults'),
                    loadingNotice = $('#searchLoadingNotice'),
                    newValue    = searchInput.val().trim(),
                    searchTimer;

                if ( e.keyCode == 13 ) {
                   return false;
                }

                if (newValue.length < 2) {

                   resultsList.remove();
                   if (that.searchTimer) window.clearTimeout(searchTimer);
                   that.abortRequests();

                   var markerLayer = that.getMarkerLayer();
                   if (markerLayer) {
                       markerLayer.removeAllFeatures();
                       markerLayer.setVisibility(false);
                   }
                   return false;
                } else {
                    if (newValue === that.lastPhrase) {
                        // Same phrase as before, ignore key event
                        return false;
                    }
                    if (that.searchTimer) window.clearTimeout(searchTimer);
                    that.lastPhrase = newValue;
                }
                if ( resultsList.length === 0 ) {
                    resultsList = $( '<div/>', { 'id': 'searchResults', html : this.closeButtonHtml});
                    $('.searchDiv').after(resultsList);
                }

                resultsList.html(this.closeButtonHtml);
                if (loadingNotice.length === 0) {
                    loadingNotice = $('<div/>', {'id':'searchLoadingNotice', html: OpenLayers.Lang.translate('Searching') + '...'});
                }
                resultsList.append(loadingNotice);
                resultsList.show();

                $('#searchResults').find('a.close').on( "click", function(e){
                    $('#searchResults').remove();
                    if (that.searchTimer) window.clearTimeout(searchTimer);
                    that.abortRequests();
                    return false;
                });

                that.searchTimer = setTimeout(function() {
                    // launch with delay
                    if ( that.lastPhrase == $('#searchInput').val() ) {
                        if (NK.functions && NK.functions.updateHistory) {
                            NK.functions.updateHistory();
                        }
                        $('#searchResultsPageNumberInput').val(0);
                        that.doSearch();
                    }
                }, 1000);
        };

        $(document).on("keyup",  '#searchInput', searchFunction);
        $(document).on("search", '#searchInput', searchFunction); //support for html5 input type search events

        // navigating to coordinates from search result
        var cmap = this.map;
        $(document).on("click", '.search-place', function(){
            var center = new OpenLayers.LonLat(
                $(this).data("east"),
                $(this).data("north")
            );
            var coor_from = new OpenLayers.Projection("EPSG:4326");
            var coor_to   = new OpenLayers.Projection(cmap.getProjection());
            center.transform(coor_from, coor_to);

            var zoom, dzoom;
            dzoom = $(this).data("zoom");
            if ( dzoom > cmap.getZoom() ) {
                zoom = dzoom;
            } else {
                zoom = cmap.getZoom();
            }

            if ($(this).parent().parent().hasClass('addresses')) zoom = 15;

            cmap.setCenter(center, zoom );
            $('#searchResults').remove();
        });

        this.map.events.register('searchForPhrase', this, this.searchForPhraseEventHandler);
        return this.div;
    }, // draw
    showControls: function () {
        OpenLayers.Util.renderToggleToolClick({'self': this});
        OpenLayers.Element.addClass(this.div, 'active');
    },
    hideControls: function () {
        OpenLayers.Util.renderToggleToolClick({'self': this});
        OpenLayers.Element.removeClass(this.div, 'active');
    },
    toggleWidget: function () {
        OpenLayers.Element.hasClass(this.div, 'active') ? this.hideControls() : this.showControls();
    },
    searchForPhraseEventHandler: function (evt) {
        this.doSearch(evt.phrase);
    },
    abortRequests: function(){
        var self = this;
        $.each(self.searchRequests, function(key, req){
            if (req !== null) {
                req.abort();
            }
        });
    },
    showPlace: function () {
    //   console.log(this);
    },

    parseInput: function (input) {
        var parsedInput = {},
            reResult, what3words,
            decimalPairComma,
            decimalPairDot,
            decimalCoordinatesNE,
            degMinNE,
            degMinEN,
            degMinSecNE,
            degMinSecEN,degMinSecEN2,
            gbrnr, gbrnr2, gbrnr3, gbrnr4, gbrnr5;

        // matches two numbers using either . or , as decimal mark. Numbers using . as decimal mark are separated by , or , plus blankspace. Numbers using , as decimal mark are separated by blankspace
        what3words = /^[a-zA-Z]+\.[a-zA-Z]+\.[a-zA-Z]+$/;
        decimalPairComma = /^[ \t]*([0-9-]+,[0-9-]+|[0-9-]+)[ \t]+([0-9-]+,[0-9-]+|[0-9-]+)(?:@([0-9-]+))?[ \t]*$/;
        decimalPairDot   = /^[ \t]*([0-9-]+\.[0-9-]+|[0-9-]+)(?:[ \t]+,|,)[ \t]*([0-9-]+\.[0-9-]+|[0-9-]+)(?:@([0-9-]+))?[ \t]*$/;
        decimalCoordinatesNE = /^[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*[°]?[ \t]*[nN]?[ \t]*,?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*[°]?[ \t]*[eEøØoO]?[ \t]*$/;
        degMinNE = /^[ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*[nN]?[ \t]*,?[ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*[eEoOøØ]?[ \t]*?/;
        degMinEN = /^[ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*[eEoOøØ][ \t]*,?[ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*[nN][ \t]*?/;
        degMinSecNE = /^[ \t]*[nN]?[ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*(?:"||''||′′)[ \t]*[nN]?[ \t]*,?[ \t]*[eEøØoO]?[ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*(?:"||''||′′)[ \t]*[eEoOøØ]?[ \t]*?/;
        degMinSecEN = /^[ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*(?:"||''||′′)[ \t]*[eEøØoO][ \t]*,?[ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*(?:"||''||′′)[ \t]*[nN][ \t]*?/;
        degMinSecEN2 = /^[ \t]*[eEøØoO][ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*(?:"||''||′′)[ \t]*,?[ \t]*[nN][ \t]*([0-9-]+)[ \t]*[°]?[ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*['′][ \t]*([0-9-]+[,\.][0-9-]+|[0-9-]+)[ \t]*(?:"||''||′′)[ \t]*?/;
        gbrnr = /^[ \t]*([A-Za-zæøåÆØÅ ]+[A-Za-zæøåÆØÅ]|[\d]+)[ \t]*[-/][ \t]*([\d]+)[ \t]*[/][ \t]*([\d]+)[ \t]*$/;
        gbrnr2 = /^[ \t]*([A-Za-zæøåÆØÅ ]+[A-Za-zæøåÆØÅ]|[\d]+)[ \t]*[-/][ \t]*([\d]+)[ \t]*[/][ \t]*([\d]+)[ \t]*[/][ \t]*([\d]+)[ \t]*$/;
        gbrnr3 = /^[ \t]*([A-Za-zæøåÆØÅ ]+[A-Za-zæøåÆØÅ]|[\d]+)[ \t]*[-/][ \t]*([\d]+)[ \t]*[/][ \t]*([\d]+)[ \t]*[/][ \t]*([\d]+)[ \t]*[/][ \t]*([\d]+)[ \t]*$/;
        gbrnr4 = /^[ \t]*([\d]+)[ \t]*[/][ \t]*([\d]+)[ \t]*[ \t]*[,]([A-Za-zæøåÆØÅ ]*)$/;
        gbrnr5 = /^[ \t]*([\d]+)[ \t]*[/][ \t]*([\d]+)[ \t]*[ \t]*$/;

        var interpretAsNorthEastOrXY = function (obj) {
            if (obj && typeof obj.first === 'number' && typeof obj.second === 'number') {
                if (obj.first <= 180 && obj.first >= -180 && obj.second <= 180 && obj.second >= -180) {
                    obj.north = obj.first;
                    delete obj.first;

                    obj.east = obj.second;
                    delete obj.second;
                } else {
                    obj.x = obj.first;
                    delete obj.first;

                    obj.y = obj.second;
                    delete obj.second;
                }
            }
            return obj;
        };

        if (typeof input === 'string') {
            if (what3words.test(input)) {
                parsedInput.phrase = input;
                parsedInput.w3w    = true;
            } if (decimalPairComma.test(input)) {
                reResult = decimalPairComma.exec(input);
                parsedInput.first = parseFloat(reResult[1]);
                parsedInput.second = parseFloat(reResult[2]);
                if (!!reResult[3]) {
                  parsedInput.projectionHint = parseInt(reResult[3]);
                }
                interpretAsNorthEastOrXY(parsedInput);

            } else if (decimalPairDot.test(input)) {
                reResult = decimalPairDot.exec(input);
                parsedInput.first = parseFloat(reResult[1]);
                parsedInput.second = parseFloat(reResult[2]);
                if (!!reResult[3]) {
                  parsedInput.projectionHint = parseInt(reResult[3]);
                }
                interpretAsNorthEastOrXY(parsedInput);

            } else if (decimalCoordinatesNE.test(input)) {
                reResult = decimalCoordinatesNE.exec(input);
                parsedInput.north = {};
                parsedInput.east = {};
                parsedInput.north.deg = parseFloat(reResult[1]);
                parsedInput.east.deg = parseFloat(reResult[2]);
            } else if (degMinNE.test(input)) {
                reResult = degMinNE.exec(input);
                parsedInput.north = {};
                parsedInput.east = {};
                parsedInput.north.deg = parseFloat(reResult[1]);
                parsedInput.north.min = parseFloat(reResult[2]);
                parsedInput.east.deg = parseFloat(reResult[3]);
                parsedInput.east.min = parseFloat(reResult[4]);
            } else if (degMinEN.test(input)) {
                reResult = degMinEN.exec(input);
                parsedInput.north = {};
                parsedInput.east = {};
                parsedInput.east.deg = parseFloat(reResult[1]);
                parsedInput.east.min = parseFloat(reResult[2]);
                parsedInput.north.deg = parseFloat(reResult[3]);
                parsedInput.north.min = parseFloat(reResult[4]);
            } else if (degMinSecNE.test(input)) {
                reResult = degMinSecNE.exec(input);
                parsedInput.north = {};
                parsedInput.east = {};
                parsedInput.north.deg = parseFloat(reResult[1]);
                parsedInput.north.min = parseFloat(reResult[2]);
                parsedInput.north.sec = parseFloat(reResult[3]);
                parsedInput.east.deg = parseFloat(reResult[4]);
                parsedInput.east.min = parseFloat(reResult[5]);
                parsedInput.east.sec = parseFloat(reResult[6]);
            } else if (degMinSecEN.test(input)) {
                reResult = degMinSecEN.exec(input);
                parsedInput.north = {};
                parsedInput.east = {};
                parsedInput.east.deg = parseFloat(reResult[1]);
                parsedInput.east.min = parseFloat(reResult[2]);
                parsedInput.east.sec = parseFloat(reResult[3]);
                parsedInput.north.deg = parseFloat(reResult[4]);
                parsedInput.north.min = parseFloat(reResult[5]);
                parsedInput.north.sec = parseFloat(reResult[6]);
            } else if (degMinSecEN2.test(input)) {
                reResult = degMinSecEN2.exec(input);
                parsedInput.north = {};
                parsedInput.east = {};
                parsedInput.east.deg = parseFloat(reResult[1]);
                parsedInput.east.min = parseFloat(reResult[2]);
                parsedInput.east.sec = parseFloat(reResult[3]);
                parsedInput.north.deg = parseFloat(reResult[4]);
                parsedInput.north.min = parseFloat(reResult[5]);
                parsedInput.north.sec = parseFloat(reResult[6]);
            } else  if (gbrnr.test(input)) {
                reResult = gbrnr.exec(input);
                parsedInput.municipality = reResult[1].trim();
                parsedInput.gnr = reResult[2];
                parsedInput.bnr = reResult[3];
                parsedInput.numbers = [parsedInput.gnr, parsedInput.bnr];
            } else  if (gbrnr2.test(input)) {
                reResult = gbrnr2.exec(input);
                parsedInput.municipality = reResult[1].trim();
                parsedInput.gnr = reResult[2];
                parsedInput.bnr = reResult[3];
                parsedInput.fnr = reResult[4];
                parsedInput.numbers = [parsedInput.gnr, parsedInput.bnr, parsedInput.fnr];
            } else  if (gbrnr3.test(input)) {
                reResult = gbrnr3.exec(input);
                parsedInput.municipality = reResult[1].trim();
                parsedInput.gnr = reResult[2];
                parsedInput.bnr = reResult[3];
                parsedInput.fnr = reResult[4];
                parsedInput.snr = reResult[5];
                parsedInput.numbers = [parsedInput.gnr, parsedInput.bnr, parsedInput.fnr]; // snr confuses search engine not to output coordinates
            } else  if (gbrnr4.test(input)) {
              reResult = gbrnr4.exec(input);
              parsedInput.gnr = reResult[1];
              parsedInput.bnr = reResult[2];
              parsedInput.municipality = reResult[3].trim();
              parsedInput.numbers = [parsedInput.gnr, parsedInput.bnr];
            } else  if (gbrnr5.test(input)) {
              reResult = gbrnr5.exec(input);
              parsedInput.gnr = reResult[1];
              parsedInput.bnr = reResult[2];
              parsedInput.municipality = '';
              parsedInput.numbers = [parsedInput.gnr, parsedInput.bnr];
            } else {
                parsedInput.phrase = input;
            }
            var degMinSec2Deg = function (dms) {
                if (typeof dms.sec === 'number') {
                    dms.min += dms.sec / 60;
                    delete dms.sec;
                }
                if (typeof dms.min === 'number') {
                    dms.deg += dms.min / 60;
                    delete dms.min;
                }
            };
            if (parsedInput.north) {
                degMinSec2Deg(parsedInput.north);
                if (typeof parsedInput.north.deg === 'number') {
                    parsedInput.north = parsedInput.north.deg;
                }
            }
            if (parsedInput.east) {
                degMinSec2Deg(parsedInput.east);
                if (typeof parsedInput.east.deg === 'number') {
                    parsedInput.east = parsedInput.east.deg;
                }
            }
            return parsedInput;
        }
        return null;
    },

    trf: function() {
       if (!this.transformations) {
         this.transformations = this.map.getControlsByClass("OpenLayers.Control.Transformations")[0];
       }
       return this.transformations;
    },

    displaySearchNotice: function(html) {
      var resultsList = $('#searchResults');
      if ( resultsList.length === 0 ) {
        resultsList = $( '<div/>', { 'id': 'searchResults', html : ""});
        $('.searchDiv').after(resultsList);
      }

      resultsList.html( $('<div/>', {'id':'searchNotice', html: html}));
      var noticeElement = document.getElementById("searchNotice");
      if (!!noticeElement) {
        noticeElement.setAttribute("class","result-category");
        noticeElement.setAttribute("style","text-transform:none; font-size:small;");
      }
      resultsList.show();
      return noticeElement;
    },

    doSearch: function (phraseParameter, page, pageLength) {

        // returning test data
        var phrase = phraseParameter || $('#searchInput').val(),
            resultsPageNumber = page || $('#searchResultsPageNumberInput').val(),
            resultsPerPage = pageLength ||$('#searchResultsPerPageInput').val(),
            params,
            self = this;

        phrase = phrase.trim(phrase);
        self.lastPhrase = phrase;

        var w3wSearch = {
          url: '/ws/w3w.py',
          run: function(params, search) {
            var request = $.ajax({
              url: this.url,
              data: params.phrase,
              dataType: 'JSON'
            });
            request.done(function(r) {
              if (!r.position) {return;}
              var point = new OpenLayers.LonLat(parseFloat(r.position[1]), parseFloat(r.position[0]));
              var place = {
                name: 'what3words address',
                north: point.lat,
                east: point.lon
              };
              point.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(that.map.getProjection()));
              that.map.setCenter(point, 12);
              that.addMarkers([place]);
            });
          }
        };

        /*
            Parallel register search for addresses
        */
        var registerSearch = {
            url: this.streetAddressesSearchUrl,
            run: function(params, search){

                search.searchData.register = null;

                var request,
                    requestParams = encodeURIComponent(params.phrase);

                $.support.cors = true;

                request = $.ajax({
                    url: this.url,
                    data: requestParams,
                    dataType: 'JSON',
                    crossDomain: true
                });

                request.done(function(data){
                    search.searchData.register = data;
                    if (search.searchData.ssr !== null) {
                        search.drawResponse();
                    }
                });

                request.fail(function(xhr, status, exc){
                    search.searchData.register = null;
                    //console.log('Request failed: ' + status + ', ' + exc);
                });

                if (self.searchRequests.register !== null) {
                    self.searchRequests.register.abort();
                }
                self.searchRequests.register = request;
            }
        };
        var searchAddress = {
            url: this.addressSearchUrl,
            run: function(params, search){
                search.searchData.address = null;

                var request,
                    requestParams = encodeURIComponent(params.phrase);

                $.support.cors = true;

                request = $.ajax({
                    url: that.addressSearchUrl,
                    data: requestParams,
                    dataType: 'JSON',
                    crossDomain: true
                });

                request.done(function(data){
                    search.searchData.address = data;
                    if (search.searchData.ssr !== null) {
                        search.drawResponse();
                    }
                });

                request.fail(function(xhr, status, exc){
                    search.searchData.address = null;
                    //console.log('Request failed: ' + status + ', ' + exc);
                });

                if (self.searchRequests.address !== null) {
                    self.searchRequests.address.abort();
                }
                self.searchRequests.address = request;

            }// run
        };
        var searchEngine = {
            url: this.searchUrl,
            paramNames: {
                name: 'navn',
                fylkeKommuneNavnListe: 'fylkeKommuneNavnListe',
                maxResult: 'antPerSide',
                northLL: 'nordLL',
                eastLL: 'ostLL',
                northUR: 'nordUR',
                eastUR: 'ostUR',
                exactMatchesFirst: 'eksakteForst',
                page: 'side'
            },

            run: function (params, search) {
                search.searchData.ssr = null;
                var request,
                    requestParams = {};

                params.phrase = params.phrase.split(',');
                if (params.phrase.length >= 2 ){
                  requestParams[this.paramNames.name] = params.phrase[0] + "*";
                  requestParams[this.paramNames.fylkeKommuneNavnListe] = params.phrase[1].substring(0, params.phrase[1].length - 1);
                } else {
                  requestParams[this.paramNames.name] = params.phrase[0];
                }
                requestParams[this.paramNames.exactMatchesFirst] = true;
                requestParams[this.paramNames.maxResult] = params.resultsPerPage;
                requestParams['epsgKode'] = '4326';
                requestParams[this.paramNames.page] = params.resultsPageNumber;

                $.support.cors = true;
                request = $.ajax({
                    url: this.url,
                    data: requestParams,
                    dataType: 'xml',
                    crossDomain: true
                }); // request

                request.done(function(data){
                    search.searchData.ssr = data;
                    if (search.searchData.register !== null) {
                        search.drawResponse();
                    }
                });// done

                request.fail(function(xhr, status, exc) {
                    search.searchData.ssr = null;
                    // console.log( "Request failed: " + status + ', ' + exc);
                });// fail

                if (self.searchRequests.ssr !== null) {
                    self.searchRequests.ssr.abort();
                }
                self.searchRequests.ssr = request;

            } // run
        }; // searchEngine
        var that = this;
        var gbrnrSearchEngine = {
            url: this.propertySearchUrl,

            run: function (params, search) {
              search.searchData.gbrnr = null;
                var request,
                    query = '';

                query += params.municipality + '-' + params.numbers.join('/');
                $.support.cors = true;

                that.lastParams = params;

                request = $.ajax({
                    url: this.url + '?' + encodeURIComponent(query),
                    crossDomain: true
                }); // request

                request.done(function(data){
                    var parsedResponse = $.parseJSON(data);
                    search.searchData.gbrnr = parsedResponse;
                    var place, i;
                    if (parsedResponse && parsedResponse.length > 0) {
                      var places = [];
                      for (i = 0; i < parsedResponse.length; i++) {
                        var r = parsedResponse[i];
                        if (!r['LONGITUDE']) {
                          that.displaySearchNotice('S&oslash;keresultatet inneholder eiendommer uten kjente teiggrenser. Disse kan ikke vises p&aring; kartet, men du kan s&oslash;ke p&aring; <a href="http://www.seeiendom.no" target="_blank" style="color:#fff">seeiendom.no</a> for &aring; hente informasjon.');
                          continue; // TODO: Error message - property has no known geometries
                        }
                        var point = new OpenLayers.LonLat(parseFloat(r['LONGITUDE']), parseFloat(r['LATITUDE']));
                        point.transform(new OpenLayers.Projection("EPSG:32632"), new OpenLayers.Projection("EPSG:4326"));
                        place = {
                            name: r['NAVN'],
                            address: r['VEGADRESSE'],
                            type: r['OBJEKTTYPE'],
                            municipality: r['KOMMUNENAVN'],
                            county: r['FYLKESNAVN'],
                            north: point.lat,
                            east: point.lon
                        };
                        places.push(place);
                        if (parsedResponse && (parsedResponse.length == 1)) {
                          point.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(that.map.getProjection()));
                          that.map.setCenter(point);
                        }
                      }
                      that.addMarkers(places);
                    }
                    search.drawResponse();
                });// done

                request.fail(function(xhr, status, exc) {
                    // console.log( "Request failed: " + status + ', ' + exc);
                });// fail

                if (self.searchRequests.gbrnr !== null) {
                    self.searchRequests.gbrnr.abort();
                }
                self.searchRequests.gbrnr = request;

            } // run
        }; // searchEngine

        params = this.parseInput(phrase);

        if (params) {
            this.searchData.gbrnr = null;
            if (!!params.w3w) {

                w3wSearch.run(params, this);

            } else if (typeof params.phrase === 'string') {

                registerSearch.run(params, this);

                searchAddress.run(params, this);

                params.phrase = params.phrase + '*';
                params.resultsPageNumber = resultsPageNumber;
                params.resultsPerPage = resultsPerPage;

                searchEngine.run(params, this);

            } else if (params.north || params.x) {

                var inputEPSG = params.projectionHint || "4326",
                    inputName, fromProj, inputProj, center;

                if (params.north) {
                    center = new OpenLayers.LonLat(params.east, params.north);
                    fromProj = proj[inputEPSG];
                    //var fromProj = new OpenLayers.Projection("EPSG:4326");
                } else {
                    center = new OpenLayers.LonLat(params.x, params.y);
                    inputProj = $.localStorage.get("inputCRS") || "23";
                    inputEPSG = params.projectionHint || this.trf().getEPSGfromSOSI(inputProj);
                    if (!this.trf().isViewable(inputEPSG)) {
                      inputProj = "23";
                      inputEPSG = this.trf().getEPSGfromSOSI(inputProj);
                    }
                    if (!params.projectionHint) {
                      var searchInput = $('#searchInput');
                      var caretPos    = searchInput.caret();
                      searchInput.val(searchInput.val().split("@")[0] + "@" + inputEPSG);
                      searchInput.caret(caretPos);
                    }
                    fromProj = proj[inputEPSG];
                    var pointToNorthEast = new OpenLayers.LonLat(params.x, params.y);
                    pointToNorthEast.transform(fromProj, proj["4326"]);
                    params.north = pointToNorthEast.lat;
                    params.east = pointToNorthEast.lon;
                }
                inputName = this.trf().getCRSName(inputEPSG);
                var toProj   = new OpenLayers.Projection(this.map.getProjection());
                center.transform(fromProj, toProj);
                this.map.setCenter(center);
                this.addMarkers([params]);

                if (inputEPSG != "4326") {
                  var coordinateSystemSelector = this.trf().generateCoordinateSystemsList('coordinate-system-selector', OpenLayers.Lang.translate('Coordinate system:'), inputProj, true);
                  coordinateSystemSelector.select.setAttribute('onchange', "map.getControlsByClass('OpenLayers.Control.Search')[0].changeProjection(this)");

                  var noticeElement = this.displaySearchNotice('Koordinatene tolkes som <a href="http://epsg.io/' + inputEPSG + '" target="_blank" style="color:#fff">' + inputName + '</a>.<br />Bytt projeksjon til ');

                  noticeElement.appendChild(coordinateSystemSelector.select); // huh, shouldn't there be a direct way to do this?
                }

                this.map.events.triggerEvent('searchPerformed', {});
            } else if (params.gnr) {
                this.displaySearchNotice('S&oslash;k etter eiendommer som f&oslash;lgt:<br/>Kommune-G&aring;rdsnr/Bruksnr/Feste/Seksjon<br/>f.eks.: <b>Ringerike-38/98</b></br/>eller ved &aring; taste inn gateadressen.');
                gbrnrSearchEngine.run(params, this);
            }
        }
    }, // run

    changeProjection: function (proj) {
      this.trf().setCoordinateCookie(proj, false);
      var searchInput = $('#searchInput');
      searchInput.val(searchInput.val().split("@")[0] + "@" + this.trf().getEPSGfromSOSI(proj.value));
      this.doSearch();
    },
    drawResponse: function() {

        var addresses = [],
            areasCount = 0,
            areasElement,
            areasListElement,
            addressesCount = 0, xtraCounter = 0,
            addressesElement,
            addressesListElement,
            objectsCount = 0,
            objectsElement,
            objectsListElement,
            results,
            resultsList = $('#searchResults'),
            noResultsNotice,
            totalResultsCount,
            totalResultsReported = false,
            resultsPerPage,
            page,
            markers = [],
            that = this,
            xmlPlaces,
            xml  = this.searchData.ssr,
            json = this.searchData.register;
            trf  = this.trf();

        if ((json === null) || (json.length === 0)) {
            json = this.searchData.address;
        }
        if (!!this.searchData.gbrnr){
          json = this.searchData.gbrnr;
        }

        xmlPlaces  = $(xml).find("sokRes > stedsnavn");

        // Remove loading notice
        var loadingNotice = $('#searchLoadingNotice');
        if (loadingNotice.length !== 0) loadingNotice.remove();

        // Init resultsList if it doesn't exist
        if ( resultsList.length === 0 ) {
            resultsList = $( '<div/>', { 'id': 'searchResults'});
            $('.searchDiv').after(resultsList);
        }
        resultsList.html(this.closeButtonHtml);

        // Re-attach close-button event handler
        resultsList.find('a.close').off( "click");
        resultsList.find('a.close').on( "click", function(e){
           resultsList.remove();
           return false;
        });

        if (xmlPlaces.length === 0 && json === null) {
            noResultsNotice = $('#noResultsNotice');
            if (noResultsNotice.length === 0) {
                noResultsNotice = $('<div/>', {'id':'noResultsNotice', html:OpenLayers.Lang.translate('No records found')});
            }
            resultsList.append(noResultsNotice);

        } else {
            areasElement = $('<div class="result-category" />').addClass("areas");
            areasElement.append($(OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" width="118.523px" height="99.009px" viewBox="0 0 118.523 99.009" class="icon area-search"><path d="M86.001,91.452h-9.809c-1.933,0-3.5-1.566-3.5-3.5c0-1.933,1.567-3.5,3.5-3.5h9.809c1.933,0,3.5,1.567,3.5,3.5C89.501,89.885,87.934,91.452,86.001,91.452 M56.578,91.452H46.77c-1.933,0-3.5-1.566-3.5-3.5c0-1.933,1.567-3.5,3.5-3.5h9.808c1.933,0,3.5,1.567,3.5,3.5C60.078,89.885,58.511,91.452,56.578,91.452 M27.155,91.452h-9.788c-1.933,0-3.51-1.566-3.51-3.5c0-1.933,1.557-3.5,3.49-3.5h9.808c1.933,0,3.5,1.567,3.5,3.5C30.655,89.885,29.088,91.452,27.155,91.452 M3.661,79.732c-1.695,0-3.185-1.235-3.454-2.962C0.069,75.885,0,74.98,0,74.083v-7.649c0-1.934,1.567-3.5,3.5-3.5c1.933,0,3.5,1.566,3.5,3.5v7.652c0,0.539,0.041,1.079,0.124,1.607c0.297,1.91-1.011,3.7-2.921,3.997C4.021,79.718,3.84,79.732,3.661,79.732 M107.5,57.914c-1.934,0-3.5-1.566-3.5-3.5v-9.808c0-1.933,1.566-3.5,3.5-3.5c1.933,0,3.5,1.567,3.5,3.5v9.808C111,56.347,109.433,57.914,107.5,57.914 M3.5,50.318c-1.933,0-3.5-1.567-3.5-3.5V37.01c0-1.933,1.567-3.5,3.5-3.5c1.933,0,3.5,1.567,3.5,3.5v9.808C7,48.751,5.433,50.318,3.5,50.318 M107.5,28.491c-1.934,0-3.5-1.567-3.5-3.5v-7.624c0-0.546-0.043-1.095-0.127-1.631c-0.3-1.91,1.005-3.701,2.914-4.001c1.908-0.298,3.701,1.004,4.001,2.914c0.141,0.895,0.212,1.809,0.212,2.718v7.624C111,26.924,109.433,28.491,107.5,28.491 M3.5,20.881c-1.933,0-3.5-1.553-3.5-3.486v-0.028c0-4.123,1.471-8.12,4.141-11.255C5.395,4.64,7.603,4.464,9.075,5.717c1.472,1.253,1.648,3.462,0.395,4.934C7.877,12.521,7,14.906,7,17.367C7,19.3,5.433,20.881,3.5,20.881 M93.625,7h-9.809c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h9.809c1.933,0,3.5,1.567,3.5,3.5S95.558,7,93.625,7 M64.202,7h-9.809c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h9.809c1.933,0,3.5,1.567,3.5,3.5S66.135,7,64.202,7 M34.779,7h-9.808c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h9.808c1.933,0,3.5,1.567,3.5,3.5S36.712,7,34.779,7"/><path d="M117.406,86.157l-0.494-0.493h0.001L97.191,65.94c2.74-4.721,4.332-10.193,4.37-16.043c0.114-17.907-14.308-32.514-32.213-32.626c-0.072-0.001-0.143-0.001-0.215-0.001C51.33,17.271,36.835,31.651,36.72,49.483C36.607,67.388,51.029,81.995,68.934,82.11c0.072,0,0.14,0,0.212,0c5.951,0,11.528-1.612,16.326-4.416l19.705,19.708l0.002-0.002l0.493,0.492c1.489,1.49,3.904,1.489,5.396,0l6.339-6.338C118.896,90.065,118.896,87.648,117.406,86.157 M68.985,73.841c-13.316-0.086-24.081-10.989-23.997-24.307c0.086-13.231,10.918-23.997,24.146-23.997h0.162c6.45,0.041,12.5,2.591,17.031,7.182c4.532,4.591,7.006,10.672,6.964,17.125c-0.04,6.423-2.572,12.454-7.13,16.98c-4.555,4.526-10.599,7.017-17.017,7.017H68.985z"/></svg>')));
            areasElement.append($('<h2 class="h">områder</h2>'));
            areasListElement = $('<ul/>');
            areasElement.append(areasListElement);

            addressesElement = $('<div class="result-category" />').addClass("addresses");
            addressesElement.append($(OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="105" height="95" preserveAspectRatio="xMinYMid meet" viewBox="0 0 105 95" class="icon address"><path d="M60.145,61.984l-26.67-49.292L13.059,38.258v43.59l45.615,13.243L97.85,70.077V47.27L60.145,61.984z M34.395,23.911c2.97,0,5.378,3.541,5.378,7.909c0,4.368-2.408,7.909-5.378,7.909 c-2.971,0-5.378-3.541-5.378-7.909C29.017,27.452,31.424,23.911,34.395,23.911 M44.695,85.742l-20.6-5.886V47.454l20.6,3.495V85.742z" /><polygon points="0,41.936 32.555,0 78.538,0 104.372,38.89 62.492,54.64 34.823,4.844 2.143,44.661" /></svg>')));
            addressesElement.append($('<h2 class="h">adresser</h2><ul>'));
            addressesListElement = $('<ul/>');
            addressesElement.append(addressesListElement);

            objectsElement = $('<div class="result-category" />').addClass("objects");
            objectsElement.append($(OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" width="98.55px" height="98.501px" viewBox="0 0 98.55 98.501" class="icon object"><path d="M21.851,65.556L0,98.502l32.863-22.014c-2.028-1.658-4.025-3.46-5.961-5.395C25.108,69.299,23.419,67.444,21.851,65.556 M87.38,11.169c-9.514-9.514-20.678-13.776-24.935-9.52c-1.302,1.303-1.804,3.253-1.604,5.603c-0.088,1.924-0.327,3.692-0.699,5.314L43.728,28.981c-5.035,1.432-9.881,1.523-12.484,1.432c-5.5-1.72-10.145-1.45-12.834,1.239c-5.964,5.963-0.066,21.527,13.17,34.763c13.236,13.236,28.799,19.133,34.762,13.17c2.271-2.271,2.817-5.936,1.898-10.332l0.053,0.052c0,0-0.941-7.566,1.394-15.295l15.463-15.463c1.872-0.469,3.944-0.76,6.243-0.831c2.308,0.177,4.224-0.328,5.506-1.612C101.156,31.848,96.896,20.685,87.38,11.169"/></svg>')));
            objectsElement.append($('<h2 class="h">objekter</h2><ul>'));
            objectsListElement = $('<ul/>');
            objectsElement.append(objectsListElement);

            if (!!json){
              $.each(json, function(){
                // Skip JSON objects without latlon properties
                if (!this.hasOwnProperty('LATITUDE') || !this.hasOwnProperty('LONGITUDE')) {

                    /* Rare case hotfix */
                    if (xmlPlaces.length === 0 && json.length === 1) {
                        noResultsNotice = $('#noResultsNotice');
                        if (noResultsNotice.length === 0) {
                            noResultsNotice = $('<div/>', {'id':'noResultsNotice', html:OpenLayers.Lang.translate('No records found')});
                        }
                        resultsList.append(noResultsNotice);
                    }
                } else {

                var place, placeElement;
                var coords = new OpenLayers.LonLat(parseFloat(this['LONGITUDE']), parseFloat(this['LATITUDE']));
                    coords.transform(new OpenLayers.Projection("EPSG:32632"), new OpenLayers.Projection("EPSG:4326"));

                  place = {
                    name: this['NAVN'].charAt(0) + this['NAVN'].slice(1).toLowerCase(),
                    ssrid: this['ID'],
                    type: this['OBJEKTTYPE'],
                    municipality: this['KOMMUNENAVN'].charAt(0) + this['KOMMUNENAVN'].slice(1).toLowerCase(),
                    county: this['FYLKESNAVN'].charAt(0) + this['FYLKESNAVN'].slice(1).toLowerCase(),
                    north: coords.lat,
                    east: coords.lon
                  };

                  markers.push(place);

                  placeElement = $('<li class="search-place">');
                  placeElement.attr("data-east",  place.east);
                  placeElement.attr("data-north", place.north);
                  placeElement.attr("data-zoom",  12);

                if (typeof this['HUSNUMMER'] !== 'undefined' && this['HUSNUMMER'].length){
                    var select = document.createElement('select');
                    var option = document.createElement('option');
                        option.value = '';

                    if (document.all) {
                        option.innerText = OpenLayers.Lang.translate('house number');
                    } else {
                        option.textContent = OpenLayers.Lang.translate('house number');
                    }
                    select.appendChild(option);

                    for (var i = 0; i < this['HUSNUMMER'].length; i++) {
                        option = document.createElement('option');
                        if (document.all) {
                            option.innerText = this['HUSNUMMER'][i];
                        } else {
                            option.textContent = this['HUSNUMMER'][i];
                        }
                        select.appendChild(option);
                    }
                    placeElement.append(select);
                  }

                  placeElement.append($('<span class="street-address"><span class="street-name">' + place.name + '</span></span>, <span class="municipality-name">' + place.municipality + '</span>'));
                  addressesListElement.append(placeElement);

                  addresses.push({'name': place.name, 'municipality': place.municipality, 'element': placeElement});
                  addressesCount += 1;
              }
            });
            }

            xmlPlaces.each(function(){
                var place,
                    placeElement;

                place = {
                    name: $(this).find("stedsnavn").text(),
                    ssrid: $(this).find("ssrId").text(),
                    type: $(this).find("navnetype").text(),
                    municipality: $(this).find("kommunenavn").text(),
                    county: $(this).find("fylkesnavn").text(),
                    north: parseFloat($(this).find("nord").text()),
                    east: parseFloat($(this).find("aust").text())
                };

                // Skip places handled by registerSearch
                if (place.type !== 'Adressenavn (veg/gate)'){
                    markers.push(place);
                }

                var getPlaceElement = function (placeData, zoomLevel, contextFunction) {
                    var element = $('<li class="search-place">');
                    element.attr("data-east",  placeData.east);
                    element.attr("data-north", placeData.north);
                    element.attr("data-zoom",  zoomLevel);
                    element.text(placeData.name + ', ' + placeData.type + ' ');
                    if (!!contextFunction) {
                        element.append(contextFunction(placeData));
                    }
                    return element;
                };

                var countyFn = function (d) {
                    var element = $('<span class="county-name" />');
                    element.text(d.county);
                    return element;
                };
                var municipalityFn = function (d) {
                    var element = $('<span class="municipality-name" />');
                    element.text(d.municipality);
                    return element;
                };

                switch(place.type) {
                    case 'Nasjon':
                        placeElement = getPlaceElement(place, 1);
                        areasListElement.append(placeElement);
                        areasCount += 1;
                        break;
                    case 'Fylke':
                        placeElement = getPlaceElement(place, 8);
                        areasListElement.append(placeElement);
                        areasCount += 1;
                        break;
                    case 'Kommune':
                        placeElement = getPlaceElement(place, 8, countyFn);
                        areasListElement.append(placeElement);
                        areasCount += 1;
                        break;
                    case 'By':
                    case 'Adm. bydel':
                    case 'Bydel':
                    case 'Tettsted':
                    case 'Tettbebyggelse':
                    case 'Grend':
                    case 'Fjellområde':
                    case 'Bygdelag (bygd)':
                    case 'Tettsteddel':
                        placeElement = getPlaceElement(place, 8, municipalityFn);
                        areasListElement.append(placeElement);
                        areasCount += 1;
                        break;
                    case 'Adressenavn (veg/gate)':
                        /*
                        placeElement = $('<li class="search-place">');
                        placeElement.attr("data-east",  place.east);
                        placeElement.attr("data-north", place.north);
                        placeElement.attr("data-zoom",  12);
                        placeElement.append($('<span class="street-address"><span class="street-name">' + place.name + '</span></span>, <span class="municipality-name">' + place.municipality + '</span>'));
                        addressesListElement.append(placeElement);

                        addresses.push({'name': place.name, 'municipality': place.municipality, 'element': placeElement});
                        addressesCount += 1;
                        */
                        xtraCounter += 1;
                        break;
                    case 'Flyplass':
                    case 'Fengsel':
                    case 'Annen kulturdetalj':
                    case 'Stasjon':
                    case 'Kirke':
                    case 'Bru':
                    case 'Skole':
                    case 'Bruk (gardsbruk)':
                        placeElement = getPlaceElement(place, 16, municipalityFn);
                        objectsListElement.append(placeElement);
                        objectsCount += 1;
                        break;
                    default:
                        placeElement = getPlaceElement(place, 8, municipalityFn);
                        objectsListElement.append(placeElement);
                        objectsCount += 1;
                } // switch
            });

            totalResultsCount = $(xml).find('sokRes > totaltAntallTreff');
            totalResultsReported = totalResultsCount.length > 0;

            if (totalResultsReported) {
                if (typeof totalResultsCount[0].textContent === 'string') {
                    totalResultsCount = parseInt(totalResultsCount[0].textContent);
                } else if (typeof totalResultsCount[0].text === 'string') {
                    totalResultsCount = parseInt(totalResultsCount[0].text);
                }
            }

            totalResultsCount -= xtraCounter;
            totalResultsCount += addressesCount;
            if(totalResultsCount > 0) totalResultsReported = true;

            results = '';

            if (totalResultsReported) {
                resultsPerPage = parseInt($('#searchResultsPerPageInput').val());
                page = parseInt($('#searchResultsPageNumberInput').val());

                results += '<div class="result-paging">';
                results += OpenLayers.Lang.translate('Total search results: ${count}', {'count': totalResultsCount});
                if ((page * resultsPerPage + resultsPerPage) < totalResultsCount) {
                    results += '<button id="next-results-page-button">' + OpenLayers.Lang.translate('More results') + '</button>';
                }
                results += '</div>';
            }

            /*
            $.support.cors = true;
            if (addresses.length > 0) {
                for (i = 0, j = addresses.length; i < j; i += 1) {
                    var a = addresses[i];
                    $.ajax({
                        'url': that.streetAddressesSearchUrl,
                        success: that.getAddressResultHandler(a.element),
                        data: encodeURIComponent(a.name + ',' + a.municipality)
                    });
                }
            }
            */

            this.addMarkers(markers);
        } // if

        resultsList.append($(results));

        if (areasCount > 0) {
            resultsList.append(areasElement);
        }
        if (addressesCount > 0) {
            resultsList.append(addressesElement);
        }
        if (objectsCount > 0) {
            resultsList.append(objectsElement);
        }

        resultsList.slideDown({'duration': 250}, function(){});

        /*
            This has been fixed in onClick();

        $('#searchResults select').on('click', function(evt) {
            evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
        });
        */

        $('#next-results-page-button').on('click', function (evt) {
            evt.stopPropagation ? evt.stopPropagation() : evt.cancelBubble = true;
            var currentPageNumber = $('#searchResultsPageNumberInput').val();
            $('#searchResultsPageNumberInput').val(parseInt(currentPageNumber) + 1);
            that.doSearch();
        });

        /*
            Handler for housenumber select menu
        */
        resultsList.on(
            'change',
            '.result-category.addresses select',
            function (evt) {

                var $this, place, streetElement, municipalityElement, queryString;
                $this = $(this);
                place = $this.closest('.search-place');
                streetElement = place.find('.street-address')[0];
                municipalityElement = place.find('.municipality-name')[0];
                queryString = '';
                function getText (element) {
                    if (element) {
                        if (typeof element.textContent == 'string') {
                            return element.textContent;
                        } else if (typeof element.innerText === 'string') {
                            return element.innerText;
                        } else {
                            return '';
                        }
                    } else {
                        return '';
                    }
                }
                var housenr = $this.val().toString();
                if (streetElement) {
                    queryString += getText(streetElement)  + ' ' + housenr;
                    if (municipalityElement) {
                        queryString += ', ' + getText(municipalityElement);
                    }
                }
                $.support.cors = true;

                $.ajax({
                    'url': that.addressSearchUrl,
                    'success': function (response) {
                        var parsedResponse = $.parseJSON(response);
                        var place;

                        if (parsedResponse && parsedResponse.length > 0) {
                          for (var rs in parsedResponse) {
                            var r = parsedResponse[rs];
                            if (r['HUSNR'] && (r['HUSNR'] != housenr)) continue;
                            var point = new OpenLayers.LonLat(parseFloat(r['LONGITUDE']), parseFloat(r['LATITUDE']));
                            point.transform(new OpenLayers.Projection("EPSG:32632"), new OpenLayers.Projection("EPSG:4326"));
                            place = {
                                name: r['NAVN'],
                                type: r['OBJEKTTYPE'],
                                municipality: r['KOMMUNENAVN'],
                                county: r['FYLKESNAVN'],
                                north: point.lat,
                                east: point.lon
                            };
                            that.addMarkers([place]);
                            point.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(that.map.getProjection()));
                            var zoom = 15;
                            that.map.setCenter(point, zoom);
                          }
                        }
                        $('#searchResults').remove();
                    },
                    'data': encodeURIComponent(queryString)
                });

            }
        );

        this.map.events.triggerEvent('searchPerformed', {});

    }, // drawResponse

    defaultEvent: function(event) {
        OpenLayers.Event.stop(event, true);
    },
    openKeyboard: function() {
      var kb  = $(".ui-keyboard");
      var ref = $(this.inputElem);
      kb.css("left", (ref.offset().left + ref.width() + 15) + "px");
      kb.css("top", (ref.offset().top + ref.height() + 5) + "px");
      kb.zIndex(9999);
      kb.show();
    },
    closeKeyboard: function() {
      var kb  = $(".ui-keyboard");
      kb.hide();
    },

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
            this.doSearch();
            if (!!this.keyboardHelper) {
              this.closeKeyboard();
            }
            return false;
        } else if (!!this.keyboardHelper) {
            this.openKeyboard();
        }
    }, // onClick

    getMarkerLayer: function () {
        var layers;
        layers = this.map.getLayersByName("searchResultMarkers");
        if (layers.length > 0) {
            return layers[0];
        } else {
            return null;
        }
    },
    addMarkers: function (places) {
        var marker,
            coor_from,
            coor_to,
            i,
            j,
            point,
            feature,
            features = [],
            styles,
            that = this;

        coor_from = new OpenLayers.Projection("EPSG:4326");
        coor_to   = new OpenLayers.Projection(this.map.getProjection());

        that.markerLayer = this.getMarkerLayer();

        if (!that.markerLayer) {
            styles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    pointRadius: 11.5, // sized according to type attribute
                    fillColor: "#ffcc66",
                    strokeColor: "#ff9933",
                    strokeWidth: 2,
                    graphicZIndex: 1,
                    externalGraphic: '/theme/norgeskart/img/point-marker.png',
                    graphicWidth: 22,
                    graphicHeight: 22,
                    graphicXOffset: -11,
                    graphicYOffset: -11,
                    cursor: "pointer"
                }),
                "select": new OpenLayers.Style({
                    fillColor: "#66ccff",
                    strokeColor: "#3399ff",
                    graphicZIndex: 2
                }),
                "temporary": new OpenLayers.Style({
                    externalGraphic: '/theme/norgeskart/img/point-marker-highlighted.png',
                    graphicZIndex: 2
                })
            });
            that.markerLayer = new OpenLayers.Layer.Vector("searchResultMarkers", {
                shortid: "hits",
                styleMap: styles
            });
            this.map.addLayer(that.markerLayer);
            that.markerLayer.map.events.register('vectorLayerActivated', that.markerLayer, function (evt) {this.setVisibility(false);});
        }

        that.markerLayer.removeAllFeatures();
        if (!that.markerLayer.visibility) {
            that.markerLayer.setVisibility(true);
        }

        for(i = 0, j = places.length; i < j; i += 1) {
            point = new OpenLayers.Geometry.Point(places[i].east, places[i].north);
            point.transform(coor_from, coor_to);
            feature = new OpenLayers.Feature.Vector(point, places[i], null);
            features.push(feature);
        }
        that.markerLayer.addFeatures(features);

        var selectControl;
        var onPopupClose = null;

        function onPopupClose(evt) {
            selectControl.unselect(NK.selectedFeature);
            delete NK.selectedFeature;
        }
        function generatePopupMarkup (feature) {
            var markup = '<article>';
            var COORDINATE_DECIMAL_COUNT = 4;

            function preciseRound(num, decimals){
                return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals);
            }
            if (feature.attributes.type) {
                markup += '<h1 class="h">' + feature.attributes.name + '</h1>';

                switch (feature.attributes.type) {
                    case 'Nasjon':
                    case 'Fylke':
                        markup += "<div>" + feature.attributes.type + "</div>" +
                            "Posisjon: " + preciseRound(feature.attributes.north, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + "°N " + preciseRound(feature.attributes.east, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + "°Ø";
                        break;
                    case 'Kommune':
                        markup += "<div>" + feature.attributes.type + " i " + feature.attributes.county + "</div>" +
                            "Posisjon: " + preciseRound(feature.attributes.north, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + "°N " + preciseRound(feature.attributes.east, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + "°Ø";
                        break;
                    case 'Adressenavn (veg/gate)':
                        break;
                    case 'By':
                    case 'Adm. bydel':
                    case 'Bydel':
                    case 'Tettsted':
                    case 'Grend':
                    case 'Flyplass':
                    case 'Fengsel':
                    case 'Annen kulturdetalj':
                    case 'Stasjon':
                    case 'Kirke':
                    case 'Bru':
                    case 'Skole':
                    case 'Bruk (gardsbruk)':
                    default:
                        if (feature.attributes.address) {
                            if (typeof feature.attributes.address === 'string') {
                                markup += "<div>" + feature.attributes.address + "</div>";
                            } else if (feature.attributes.address.length) {
                                markup += "<div>" + feature.attributes.address.join(', ') + "</div>";
                            }
                        }
                        markup += "<div>" + feature.attributes.type + " i " + feature.attributes.municipality + ", " + feature.attributes.county + "</div>" +
                            "Posisjon: " + preciseRound(feature.attributes.north, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + "°N " + preciseRound(feature.attributes.east, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + "°Ø";
                        break;
                }
                if (feature.attributes.ssrid) {
                    markup += '<div><a href="http://faktaark.statkart.no/SSRFakta/faktaarkfraobjektid?enhet=' + feature.attributes.ssrid + '">Faktaark</a></div>';
                }
            } else {
                // feature is a coordinate or gbrnr search result
                markup += '<h1 class="h">' + preciseRound(feature.attributes.north, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + '°N ' + preciseRound(feature.attributes.east, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + '°Ø</h1>';
            }
            markup += "</article>";
            return markup;
        }

        function onFeatureSelect (feature) {
	    that.displayPointMenu( feature.geometry.getBounds().getCenterLonLat() );
	    /*
            NK = NK || {};
            if (NK.selectedFeature ) {
                selectControl.unselect(NK.selectedFeature);
            }
            NK.selectedFeature = feature;
            var popup = new OpenLayers.Popup.FramedSideAnchored("nk-selected-feature",
                               feature.geometry.getBounds().getCenterLonLat(),
                               null,
                               generatePopupMarkup(feature),
                               null,
                               true,
                               onPopupClose,
                               {x: -7, y: -30});

            popup.autoSize = true;
//            popup.keepInMap = true;
            feature.popup = popup;
            this.map.addPopup(popup);
	    */
        }
        function onFeatureUnselect (feature) {
            this.map.removePopup(feature.popup);
            if (feature.popup === NK.selectedFeature) {
                NK.selectedFeature = null;
            }
            feature.popup.destroy();
            feature.popup = null;

        }

        selectControl = new OpenLayers.Control.SelectFeature(that.markerLayer, {
            select: onFeatureSelect,
            unselect: onFeatureUnselect,
            //hover: true,
            autoActivate: true
        });
        var hoverControl = new OpenLayers.Control.SelectFeature(that.markerLayer, {
            hover: true,
            highlightOnly: true,
            renderIntent: "temporary",
            autoActivate: true
        });
        this.map.addControl(hoverControl);
        this.map.addControl(selectControl);
    },// addMarkers

    displayPointMenu : function( center ) {
	if ( ! center ) return;

	var self = this, menu = null;
	self.menu = menu = new OpenLayers.Control.PointMenu({
	    'parent'   : 'Search', 'url' : self.coordinates, 'map': self.map,
	    'tracking' : function(data) {
		if ( ! data ) return;
		var pm   = data['module'], where = data['where'];
		var attr = pm.attr, main = attr['main'], widget = attr['widget'];

		if ( where=='pointMenuEndHandler' ) {
		    if ( OpenLayers.Element.hasClass(main, 'onClose') ) {
			pm.hideControls();
			self.menu = null;
			return true;
		    }
		}
		return false;
	    }
	});

	OpenLayers.Util.renderToggleToolClick({'self': self});
	clearTimeout( self.timer || 0 );
	self.timer = setTimeout( function() {
	    menu.showControls(), menu.showPointMenu( {}, true, center, true );
	    OpenLayers.Element.removeClass( menu['attr']['button'],'active' );
	    OpenLayers.Element.addClass( menu['attr']['button'],'simulation' );
	}, 50 );
    },

    CLASS_NAME: "OpenLayers.Control.Search"
}); // OpenLayers.Control.Search



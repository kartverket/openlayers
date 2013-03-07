/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */

OpenLayers.Control.Search = OpenLayers.Class(OpenLayers.Control, {
    EVENT_TYPES: ["doSearch"],
    size: null,
    element: null,
    submitBtnId: "searchSubmit",
    searchUrl: 'http://beta.norgeskart.no/ssrws/ssr/sok',
    
    initialize: function(options) {
        this.EVENT_TYPES = OpenLayers.Control.Search.prototype.EVENT_TYPES.concat(        
            OpenLayers.Control.prototype.EVENT_TYPES);
            
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
        
        this.allowSelection = true;
        
    }, // initialize
    
    draw: function(){
        var position, size, image, inputElem, submitBtn, formElem;
        
//        position = new OpenLayers.Pixel(275, 1);
//        size = new OpenLayers.Size( 230, 58);
        OpenLayers.Control.prototype.draw.apply(this, []);
        
        this.element = OpenLayers.Util.createDiv(
            'OpenLayers_Control_Search' + this.map.id,
            null, //  position,
            null, //size,
            null,
            'static'
        );
        OpenLayers.Element.addClass(this.element, 'searchDiv');
        formElem = document.createElement('form');
        formElem.setAttribute('action', this.searchUrl);
        formElem.onsubmit = function () {return false}; 

        inputElem = document.createElement('input');
        inputElem.setAttribute( 'name', 'searchInput' );
        inputElem.setAttribute( 'id', 'searchInput' );
        inputElem.setAttribute( 'type', 'search' );
        inputElem.setAttribute('placeholder', 'Finn område, adresse, koordinat');
        
        
        submitBtn = document.createElement( 'button' );
        submitBtn.setAttribute( 'type', 'submit' );
        submitBtn.setAttribute( 'id', this.submitBtnId );
        submitBtn.setAttribute('class', 'submit-button');
        submitBtn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="439px" height="438px" viewBox="0 0 439 438" class="icon search" preserveAspectRatio="xMidYMid meet"><path d="M432.155,368.606l-2.64-2.639l0.005-0.004l-105.53-105.539c14.662-25.259,23.18-54.54,23.379-85.837C347.985,78.772,270.817,0.612,175.01,0.01c-0.387-0.001-0.761-0.002-1.145-0.002C78.595,0.012,1.045,76.951,0.431,172.366c-0.605,95.81,76.561,173.967,172.359,174.579c0.379,0.002,0.751,0.004,1.133,0.004c31.845,0,61.686-8.627,87.357-23.63l105.439,105.45l0.009-0.01l2.638,2.636c7.973,7.975,20.897,7.967,28.871,0l33.918-33.917C440.124,389.511,440.128,376.578,432.155,368.606z M173.07,302.708c-71.252-0.456-128.852-58.802-128.401-130.059c0.456-70.798,58.414-128.399,129.198-128.403l0.864,0.002c34.518,0.216,66.884,13.863,91.137,38.426c24.251,24.564,37.485,57.105,37.262,91.63c-0.216,34.371-13.767,66.64-38.149,90.859c-24.376,24.212-56.715,37.545-91.058,37.545L173.07,302.708z"/></svg>') + '<span>søk</span>';
          
        formElem.appendChild(inputElem);
        formElem.appendChild(submitBtn);
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
            //"keydown": this.onKeyDown,
            //"keyup": this.onKeyDown, // this didnt work
            scope: this
        });  
          
        // kind of live search
        var that = this;          
        $('#searchInput').live("keyup", function(e) {
                if ( e.keyCode == 13 ) {                   
                   return false;
                } // endif
                var lastTyped = $('#searchInput').val();
                if ( lastTyped.length < 2 ) {                   
                   return false;
                } // endif
                setTimeout(function() {
                    // launch with delay
                    if ( lastTyped == $('#searchInput').val() ) {
                        if (NK.functions && NK.functions.updateHistory) {
                            NK.functions.updateHistory();
                        }
                        that.doSearch();
                    }
                }, 1000);
        });
          
        // navigating to coordinates from search result
        cmap = this.map;
        $('.search-place').live("click", function(){            
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
            
            cmap.setCenter(center, zoom );
        });  

        this.map.events.register('searchForPhrase', this, this.searchForPhraseEventHandler);

        return this.div;
    }, // draw
    searchForPhraseEventHandler: function (evt) {
        console.log('searchForPhrase event detected');
        this.doSearch(evt.phrase);
    },
    showPlace: function () {
       console.log(this);  
    },
   
    doSearch: function (phraseParameter) {                
        // returning test data
        var phrase = phraseParameter || $('#searchInput').val(),
            params;
      
        var parseInput = function (input) {
            var parsedInput = {},
                reResult,
                decimalPairComma,
                decimalPairDot,
                decimalCoordinatesNE,
                degMinNE,
                degMinEN,
                degMinSecNE,
                degMinSecEN;

            // matches two numbers using either . or , as decimal mark. Numbers using . as decimal mark are separated by , or , plus blankspace. Numbers using , as decimal mark are separated by blankspace
            decimalPairComma = /^[ \t]*([0-9]+,[0-9]+|[0-9]+)[ \t]+([0-9]+,[0-9]+|[0-9]+)[ \t]*$/;
            decimalPairDot   = /^[ \t]*([0-9]+\.[0-9]+|[0-9]+)(?:[ \t]+,|,)?[ \t]*([0-9]+\.[0-9]+|[0-9]+)[ \t]*$/; 
            decimalCoordinatesNE = /^[ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*[°]?[ \t]*[nN][ \t]*,?[ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*[°]?[ \t]*[eEøØoO][ \t]*$/;
            degMinNE = /^[ \t]*([0-9]+)[ \t]*[°][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*['′][ \t]*[nN][ \t]*,?[ \t]*([0-9]+)[ \t]*[°][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*['′][ \t]*[eEoOøØ][ \t]*?/;
            degMinEN = /^[ \t]*([0-9]+)[ \t]*[°][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*['′][ \t]*[eEoOøØ][ \t]*,?[ \t]*([0-9]+)[ \t]*[°][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*['′][ \t]*[nN][ \t]*?/;
            degMinSecNE = /^[ \t]*([0-9]+)[ \t]*[°][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*['′][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*"[ \t]*[nN]?[ \t]*,?[ \t]*([0-9]+)[ \t]*[°][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*['′][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*"[ \t]*[eEoOøØ]?[ \t]*?/;
            degMinSecEN = /^[ \t]*([0-9]+)[ \t]*[°][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*['′][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*"[ \t]*[eEøØoO][ \t]*,?[ \t]*([0-9]+)[ \t]*[°][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*['′][ \t]*([0-9]+[,\.][0-9]+|[0-9]+)[ \t]*"[ \t]*[nN][ \t]*?/;

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
                if (decimalPairComma.test(input)) {
                    reResult = decimalPairComma.exec(input);
                    parsedInput.first = parseFloat(reResult[1]);
                    parsedInput.second = parseFloat(reResult[2]);
                    interpretAsNorthEastOrXY(parsedInput);

                } else if (decimalPairDot.test(input)) {
                    reResult = decimalPairDot.exec(input);
                    parsedInput.first = parseFloat(reResult[1]);
                    parsedInput.second = parseFloat(reResult[2]);
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
                }
                if (parsedInput.east) {
                    degMinSec2Deg(parsedInput.east);
                }
                return parsedInput;
            }
            return null;
        };
       var searchEngine = {
            internalUrl: 'search.php?',
            //url: 'https://ws.geonorge.no/SKWSIndexSSR/ssr/sok?',
            url: ' http://beta.norgeskart.no/ssrws/ssr/sok',

            paramNames: {
                name: 'navn',
                maxResult: 'antPerSide',
                northLL: 'nordLL',
                eastLL: 'ostLL',
                northUR: 'nordUR',
                eastUR: 'ostUR',
                exactMatchesFirst: 'eksaktForst'
            },
        
            run: function (params, search) {
                var request,
                    requestParams = {};

                requestParams[this.paramNames.name] = params.phrase;
                requestParams[this.paramNames.exactMatchesFirst] = true;
                requestParams[this.paramNames.maxResult] = 30;
                requestParams['epsgKode'] = '4326';

                request = $.ajax({
                    url: this.url,
                    data: requestParams,
                    dataType: 'xml',
                    crossDomain: true
                }); // request

                request.done(function(data){
                    search.drawResponse(data);
                });// done

                request.fail(function(xhr, status, exc) {
                    console.log( "Request failed: " + status + ', ' + exc);
                });// fail
            } // run
        }; // searchEngine
        params = parseInput(phrase);

        if (params) {
            if (typeof params.phrase === 'string') {
                params.phrase = params.phrase + '*';
                searchEngine.run(params, this);
            } else if (params.north || params.x) {

                if (params.north) {
                    var center = new OpenLayers.LonLat(params.east, params.north);          
                    var fromProj = new OpenLayers.Projection("EPSG:4326");
                } else {
                    var center = new OpenLayers.LonLat(params.x, params.y);
                    var fromProj = proj["32633"];
                    var pointToNorthEast = new OpenLayers.LonLat(params.x, params.y);
                    pointToNorthEast.transform(fromProj, proj["4326"]);
                    params.north = pointToNorthEast.lat;
                    params.east = pointToNorthEast.lon;
                }
                var toProj   = new OpenLayers.Projection(this.map.getProjection());
                center.transform(fromProj, toProj);
                this.map.setCenter(center);
                this.addMarkers([params]);
                this.map.events.triggerEvent('searchPerformed', {});
            }
        }
    }, // run 
    
    onKeyDown: function (event) {
        OpenLayers.Event.stop(event, true);
        var lastTyped, 
            k = event.keyCode || event.which,
            that;
            
        if (k == 13) {
            this.doSearch();
            if (NK.functions && NK.functions.updateHistory) {
                NK.functions.updateHistory();
            }
            return true;
        }
         
        lastTyped = $('#searchInput').val();
        if (lastTyped.length < 2) {
           return false;
        } // endif
        
        that = this;
        
        setTimeout( 
            function () {
                // launch with delay
                if ( lastTyped != $('#searchInput').val() ) {
                    that.doSearch();
                    if (NK.functions && NK.functions.updateHistory) {
                        NK.functions.updateHistory();
                    }
                }   
            }, 
            1000 
        );
    }, //onKeyDown
    getAddressResultHandler: function (DOMElementId) {
        var handler = function (response, arst, neio) {
            var addressElement = OpenLayers.Util.getElement(DOMElementId);
            console.log(addressElement + ' ' + DOMElementId + ' found - hooray!');
            var select = document.createElement('select');
            select.innerHTML = '<option value="1">1</option>';
            addressElement.appendChild(select);
        };
        return handler;
    },
    drawResponse: function(xml) {
        var places, 
            listAreas = [],
            listAddress = [],
            addresses = [],
            listObjects = [],
            results, 
            resultDiv,
            markers = [],
            i, 
            j,
            that = this;
           
        places = $(xml).find("sokRes > stedsnavn");   
           
        if (places.length === 0) {
            results = OpenLayers.Lang.translate('No records found');
        } else {    
            results = '';
            places.each(function(){
                var place,
                    listItem, 
                    zoomLevel = 8;

                place = {
                    name: $(this).find("stedsnavn").text(),
                    type: $(this).find("navnetype").text(),
                    municipality: $(this).find("kommunenavn").text(),
                    county: $(this).find("fylkesnavn").text(),
                    north: parseFloat($(this).find("nord").text()),
                    east: parseFloat($(this).find("aust").text())
                };
                markers.push(place);
                
                switch(place.type) {
                    case 'Nasjon':
                        zoomLevel = 1;
                        listItem = '<li class="search-place" data-east="' + place.east + '" data-north="' + place.north + '" data-zoom="' + zoomLevel + '">' + place.name + ', ' + place.type + '</li>';
                        listAreas.push(listItem);
                        break;
                    case 'Fylke':
                        zoomLevel = 8;
                        listItem = '<li class="search-place" data-east="' + place.east + '" data-north="' + place.north + '" data-zoom="' + zoomLevel + '">' + place.name + ', ' + place.type + '</li>';
                        listAreas.push(listItem);
                        break;
                    case 'Kommune':
                        zoomLevel = 8;
                        listItem = '<li class="search-place" data-east="' + place.east + '" data-north="' + place.north + '" data-zoom="' + zoomLevel + '">' + place.name + ', ' + place.type + ' <span class="county-name">' + place.county + '</span></li>';
                        listAreas.push(listItem);
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
                        zoomLevel = 8;
                        listItem = '<li class="search-place" data-east="' + place.east + '" data-north="' + place.north + '" data-zoom="' + zoomLevel + '">' + place.name + ', ' + place.type + ' <span class="municipality-name">' + place.municipality + '</span></li>';
                        listAreas.push(listItem);
                        break;
                    case 'Adressenavn (veg/gate)':
                        zoomLevel = 12;
                        var addressId = OpenLayers.Util.createUniqueID('address_item_');
                        listItem = '<li class="search-place" id="' + addressId + '" data-east="' + place.east + '" data-north="' + place.north + '" data-zoom="' + zoomLevel + '">' + place.name + ', <span class="municipality-name">' + place.municipality + '</span></li>';
                        listAddress.push(listItem);
                        addresses.push({'name': place.name, 'municipality': place.municipality, 'DOMElementId': addressId});
                        break;
                    case 'Flyplass':
                    case 'Fengsel':
                    case 'Annen kulturdetalj':
                    case 'Stasjon':
                    case 'Kirke':
                    case 'Bru':
                    case 'Skole':
                    case 'Bruk (gardsbruk)':
                        zoomLevel = 16;
                        listItem = '<li class="search-place" data-east="' + place.east + '" data-north="' + place.north + '" data-zoom="' + zoomLevel + '">' + place.name + ', ' + place.type + ' <span class="municipality-name">' + place.municipality + '</span></li>';
                        listObjects.push(listItem);
                        break;
                    default:
                        listItem = '<li class="search-place" data-east="' + place.east + '" data-north="' + place.north + '" data-zoom="' + zoomLevel + '">' + place.name + ', ' + place.type + ' <span class="municipality-name">' + place.municipality + '</span></li>';
                        listObjects.push(listItem);
                } // switch
            });


            if (listAreas.length > 0) {
                results = results + '<div class="result-category areas">' + 
                OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" width="118.523px" height="99.009px" viewBox="0 0 118.523 99.009" class="icon area-search"><path d="M86.001,91.452h-9.809c-1.933,0-3.5-1.566-3.5-3.5c0-1.933,1.567-3.5,3.5-3.5h9.809c1.933,0,3.5,1.567,3.5,3.5C89.501,89.885,87.934,91.452,86.001,91.452 M56.578,91.452H46.77c-1.933,0-3.5-1.566-3.5-3.5c0-1.933,1.567-3.5,3.5-3.5h9.808c1.933,0,3.5,1.567,3.5,3.5C60.078,89.885,58.511,91.452,56.578,91.452 M27.155,91.452h-9.788c-1.933,0-3.51-1.566-3.51-3.5c0-1.933,1.557-3.5,3.49-3.5h9.808c1.933,0,3.5,1.567,3.5,3.5C30.655,89.885,29.088,91.452,27.155,91.452 M3.661,79.732c-1.695,0-3.185-1.235-3.454-2.962C0.069,75.885,0,74.98,0,74.083v-7.649c0-1.934,1.567-3.5,3.5-3.5c1.933,0,3.5,1.566,3.5,3.5v7.652c0,0.539,0.041,1.079,0.124,1.607c0.297,1.91-1.011,3.7-2.921,3.997C4.021,79.718,3.84,79.732,3.661,79.732 M107.5,57.914c-1.934,0-3.5-1.566-3.5-3.5v-9.808c0-1.933,1.566-3.5,3.5-3.5c1.933,0,3.5,1.567,3.5,3.5v9.808C111,56.347,109.433,57.914,107.5,57.914 M3.5,50.318c-1.933,0-3.5-1.567-3.5-3.5V37.01c0-1.933,1.567-3.5,3.5-3.5c1.933,0,3.5,1.567,3.5,3.5v9.808C7,48.751,5.433,50.318,3.5,50.318 M107.5,28.491c-1.934,0-3.5-1.567-3.5-3.5v-7.624c0-0.546-0.043-1.095-0.127-1.631c-0.3-1.91,1.005-3.701,2.914-4.001c1.908-0.298,3.701,1.004,4.001,2.914c0.141,0.895,0.212,1.809,0.212,2.718v7.624C111,26.924,109.433,28.491,107.5,28.491 M3.5,20.881c-1.933,0-3.5-1.553-3.5-3.486v-0.028c0-4.123,1.471-8.12,4.141-11.255C5.395,4.64,7.603,4.464,9.075,5.717c1.472,1.253,1.648,3.462,0.395,4.934C7.877,12.521,7,14.906,7,17.367C7,19.3,5.433,20.881,3.5,20.881 M93.625,7h-9.809c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h9.809c1.933,0,3.5,1.567,3.5,3.5S95.558,7,93.625,7 M64.202,7h-9.809c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h9.809c1.933,0,3.5,1.567,3.5,3.5S66.135,7,64.202,7 M34.779,7h-9.808c-1.933,0-3.5-1.567-3.5-3.5s1.567-3.5,3.5-3.5h9.808c1.933,0,3.5,1.567,3.5,3.5S36.712,7,34.779,7"/><path d="M117.406,86.157l-0.494-0.493h0.001L97.191,65.94c2.74-4.721,4.332-10.193,4.37-16.043c0.114-17.907-14.308-32.514-32.213-32.626c-0.072-0.001-0.143-0.001-0.215-0.001C51.33,17.271,36.835,31.651,36.72,49.483C36.607,67.388,51.029,81.995,68.934,82.11c0.072,0,0.14,0,0.212,0c5.951,0,11.528-1.612,16.326-4.416l19.705,19.708l0.002-0.002l0.493,0.492c1.489,1.49,3.904,1.489,5.396,0l6.339-6.338C118.896,90.065,118.896,87.648,117.406,86.157 M68.985,73.841c-13.316-0.086-24.081-10.989-23.997-24.307c0.086-13.231,10.918-23.997,24.146-23.997h0.162c6.45,0.041,12.5,2.591,17.031,7.182c4.532,4.591,7.006,10.672,6.964,17.125c-0.04,6.423-2.572,12.454-7.13,16.98c-4.555,4.526-10.599,7.017-17.017,7.017H68.985z"/></svg>') +
                '<h2 class="h">områder</h2><ul>' + listAreas.join('') + '</ul></div>';
            }
            if (listAddress.length > 0) {
                results = results + '<div class="result-category addresses">' +
                OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="105" height="95" preserveAspectRatio="xMinYMid meet" viewBox="0 0 105 95" class="icon address"><path d="M60.145,61.984l-26.67-49.292L13.059,38.258v43.59l45.615,13.243L97.85,70.077V47.27L60.145,61.984z M34.395,23.911c2.97,0,5.378,3.541,5.378,7.909c0,4.368-2.408,7.909-5.378,7.909 c-2.971,0-5.378-3.541-5.378-7.909C29.017,27.452,31.424,23.911,34.395,23.911 M44.695,85.742l-20.6-5.886V47.454l20.6,3.495V85.742z" /><polygon points="0,41.936 32.555,0 78.538,0 104.372,38.89 62.492,54.64 34.823,4.844 2.143,44.661" /></svg>') +
                '<h2 class="h">adresser</h2><ul>' + listAddress.join('') + '</ul></div>';
/*                for (i = 0, j = addresses.length; i < j; i += 1) {
                    var a = addresses[i];
                    $.ajax({
                        'url': 'http://localhost',
                        'data': {'sokeStreng': a.name, 'kommune': a.municipality},
                        success: that.getAddressResultHandler(a.DOMElementId)
                    });
                }
*/            }
            if (listObjects.length > 0) {
                results = results + '<div class="result-category objects">' +
                OpenLayers.Util.hideFromOldIE('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMid meet" width="98.55px" height="98.501px" viewBox="0 0 98.55 98.501" class="icon object"><path d="M21.851,65.556L0,98.502l32.863-22.014c-2.028-1.658-4.025-3.46-5.961-5.395C25.108,69.299,23.419,67.444,21.851,65.556 M87.38,11.169c-9.514-9.514-20.678-13.776-24.935-9.52c-1.302,1.303-1.804,3.253-1.604,5.603c-0.088,1.924-0.327,3.692-0.699,5.314L43.728,28.981c-5.035,1.432-9.881,1.523-12.484,1.432c-5.5-1.72-10.145-1.45-12.834,1.239c-5.964,5.963-0.066,21.527,13.17,34.763c13.236,13.236,28.799,19.133,34.762,13.17c2.271-2.271,2.817-5.936,1.898-10.332l0.053,0.052c0,0-0.941-7.566,1.394-15.295l15.463-15.463c1.872-0.469,3.944-0.76,6.243-0.831c2.308,0.177,4.224-0.328,5.506-1.612C101.156,31.848,96.896,20.685,87.38,11.169"/></svg>') +
                '<h2 class="h">objekter</h2><ul>' + listObjects.join('') + '</ul></div>';
            }
            
            this.addMarkers(markers);                      
        } // if
        
        if ( $('#searchResults').length === 0 ) {            
            resultDiv = $( '<div/>', { 'id': 'searchResults', html: '<a href="#" class="close">lukk</a>'});
            $('.searchDiv').after(resultDiv);
        } else {
            resultDiv = $('#searchResults');   
            resultDiv.find('.result-category').remove();
        } // endif
                        

        $('#searchResults').append($(results));
        resultDiv.slideDown({'duration': 250}, function(){});
        
        $('#searchResults a.close').on( "click", function(e){ $('#searchResults').remove() });
        
        this.map.events.triggerEvent('searchPerformed', {});
       
    }, // drawResponse 
    
    defaultEvent: function(event) {
        OpenLayers.Event.stop(event, true);
    },
    
    onClick: function (event) {
        if ( event.target.id === this.submitBtnId || $(event.target).parents('#' + this.submitBtnId).length > 0) {
            this.doSearch();
            return false;
        }
    }, // onClick

               
    addMarkers: function (places) {
        var layers, 
            markerLayer, 
            marker,
            size, 
            offset,
            icon,
            coor_from,
            coor_to,
            i, 
            j,
            point,
            mrk,
            feature,
            features = [],
            styles;

        size = new OpenLayers.Size(21,25);
        offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        coor_from = new OpenLayers.Projection("EPSG:4326");
        coor_to   = new OpenLayers.Projection(this.map.getProjection());
        
        layers = this.map.getLayersByName("searchResultMarkers");
        if (layers.length === 0) {
            styles = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    pointRadius: 11.5, // sized according to type attribute
                    fillColor: "#ffcc66",
                    strokeColor: "#ff9933",
                    strokeWidth: 2,
                    graphicZIndex: 1,
                    externalGraphic: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAWCAYAAAArdgcFAAAC7ElEQVR42p3VW0hTcRwHcHVkmkuXlVlSUYTFpKKbqEWU9VBZIijZtDINl5aaLE3dnDXFS5TovEWQl1nO6bxs3jZNexdLnc5Lj4I1EMR8iB6//c/Jc9jaztQOfGEPh8/+5/s/v/N3cbmc5yzuJHEkGpIvJD9JltZ+N5JEAnDhijNY4nZFhj0iJYRpapzO7kaI3Ihz0gEcl3TisFgFQfQbkPsmSMQbxYUkdX53KhEq68OlohFcLBzBBcUwwl58QkjBEILlgzgrM+KU1IDADC28IsuoP6km8XGGC13DpTiaqkJ48ed14ZO55Cly+iHM6sVOUQ2oRZHwufC6zcJB2X04RvBASQ92xFbTT+AIl/mLqjjhwq5pzH5fxeziKuRakx18JLMHhzJ08LhFV5RmjXtSm3e+wMC54prBb2CuSsO8PfxUj4PpOvgnqwkuBTF5DC7ed7fWaRVVVnjFwJxDeH9aNwIed2HrTXr11xjccCKz3WnHSuM8i5f3z3HC/qmd2B77lt5cBl8OkxttYLl2CsU6M4q6zXTfw2YLiw9NWZDfZoK0bRJ5rZNIbxpjYb9HHRAkNNPvP9O33YotK7+x0Wtx+RcL7xJrIUhqoXALPeKuBP+nis3iLOyb3A7vhI8UvsjUsnQmr9+m41zNJBSd03jZMYWCDhNVBYsZTT+Q0zqB5+pxZLWMI6V+lIUFD9vgFd9A4aMM3hf4RO10QF73zrJ4qX7GumMb2DtJg60xtTYbmrpbVM3ADgfklRVeojNzwvxEDXg3Sik8gsH5blfzEfRMT8EOB6SsZ4bFyVvECXvENdoMEROFb6ySc/IkH77CtLBCJ6NpzCG8LaEVvOslduPPpHlvYgPHgLAdc8Jboirprrm+iqHUJ9fvfv1/wEoaJglwdlgEkzTyoysQkKJdF/aMV4EXUcbABzZ6zCmo4fKMKodP/Hv4JrWwMP+eCh633/1Fw+nNk3Afc9zhkzwg0ZMskGAt8yRakhgSd64D+g88H1I9g6/oDQAAAABJRU5ErkJggg==',
                    graphicWidth: 23,
                    graphicHeight: 23
                }),
                "select": new OpenLayers.Style({
                    fillColor: "#66ccff",
                    strokeColor: "#3399ff",
                    graphicZIndex: 2
                })
            });
            markerLayer = new OpenLayers.Layer.Vector("searchResultMarkers", {
                shortid: "hits",
                styleMap: styles
            });
            this.map.addLayer(markerLayer);
        } else {
            markerLayer = layers[0];
        }
        
        markerLayer.removeAllFeatures();

        for(i = 0, j = places.length; i < j; i += 1) {
            point = new OpenLayers.Geometry.Point(places[i].east, places[i].north);
            point.transform(coor_from, coor_to);
            feature = new OpenLayers.Feature.Vector(point, places[i], null);
            features.push(feature);
        }
        markerLayer.addFeatures(features);

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
                        markup += "<div>" + feature.attributes.type + " i " + feature.attributes.municipality + ", " + feature.attributes.county + "</div>" + 
                            "Posisjon: " + preciseRound(feature.attributes.north, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + "°N " + preciseRound(feature.attributes.east, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + "°Ø";
                        break;
                }
            } else {
                // feature is a coordinate search result
                markup += '<h1 class="h">' + preciseRound(feature.attributes.north, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + '°N ' + preciseRound(feature.attributes.east, COORDINATE_DECIMAL_COUNT).toFixed(COORDINATE_DECIMAL_COUNT) + '°Ø</h1>';
            }
            markup += "</article>";
            return markup;
        };

        function onFeatureSelect (feature) {
            NK = NK || {};
            if (NK.selectedFeature ) {
                selectControl.unselect(NK.selectedFeature);
            }
            NK.selectedFeature = feature;

            var popup = new OpenLayers.Popup.Anchored("nk-selected-feature", 
                                     feature.geometry.getBounds().getCenterLonLat(),
                                     null,
                                     generatePopupMarkup(feature),
                                     null, true, onPopupClose);
            popup.autoSize = true;
//            popup.keepInMap = true;
            feature.popup = popup;
            this.map.addPopup(popup);
        }
        function onFeatureUnselect (feature) {
            this.map.removePopup(feature.popup);
            if (feature.popup === NK.selectedFeature) {
                NK.selectedFeature = null;
            }
            feature.popup.destroy();
            feature.popup = null;

        }

        selectControl = new OpenLayers.Control.SelectFeature(markerLayer, {
            select: onFeatureSelect, 
            unselect: onFeatureUnselect,
            //hover: true,
            autoActivate: true
        });

        this.map.addControl(selectControl);
    },// addMarkers
    
    CLASS_NAME: "OpenLayers.Control.Search"
}); // OpenLayers.Control.Search 

OpenLayers.Util.extend(OpenLayers.Lang.nb, {
    'No records found': 'Søket gav ingen treff'
});
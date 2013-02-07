OpenLayers.Control.Search = OpenLayers.Class(OpenLayers.Control, {
    EVENT_TYPES: ["doSearch"],
    size: null,
    element: null,
    submitBtnId: "searchSubmit",
    
    initialize: function(options) {
        this.EVENT_TYPES = OpenLayers.Control.Search.prototype.EVENT_TYPES.concat(        
            OpenLayers.Control.prototype.EVENT_TYPES);
            
        OpenLayers.Control.prototype.initialize.apply(this,[options]);
        
        this.allowSelection = true;
    }, // initialize
    
    draw: function(){
        var position, size, image, inputElem, submitBtn;
        
        position = new OpenLayers.Pixel(275, 1);
        size = new OpenLayers.Size( 230, 58);
        OpenLayers.Control.prototype.draw.apply(this, []);
        image = OpenLayers.Util.getImageLocation("search-bg.png");
        
        this.element = OpenLayers.Util.createDiv(
            'OpenLayers_Control_Search' + this.map.id,
            position,
            size,
            image
        );
        OpenLayers.Element.addClass(this.element, 'searchDiv');
        inputElem = document.createElement('input');
        inputElem.setAttribute( 'name', 'searchInput' );
        inputElem.setAttribute( 'id', 'searchInput' );
        inputElem.setAttribute( 'type', 'text' );
        inputElem.style.width = "150px";
        inputElem.style.border = "none";
        inputElem.style.margin = "0px";
        inputElem.style.top = "17px";
        inputElem.style.left = "20px";
        inputElem.style.position = "relative";
        
        
        submitBtn = document.createElement( 'input' );
        submitBtn.setAttribute( 'type', 'submit' );
        submitBtn.setAttribute( 'id', this.submitBtnId );
        submitBtn.setAttribute( 'value', 'sok' );
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.top = '17px';
        submitBtn.style.left = '20px';
        submitBtn.style.position = 'relative';
        submitBtn.style.width = '30px';
        submitBtn.style.height = '25px';
        submitBtn.style.margin = '0px';
        submitBtn.style.border = 'none';
        
        
        this.element.innerHTML = '';
        this.element.appendChild(inputElem);
        this.element.appendChild(submitBtn);
        
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
            var coor_to   = new OpenLayers.Projection("EPSG:32633");
            center.transform(coor_from, coor_to);
            cmap.setCenter(center,$(this).data("zoomLevel"));
        });  
        
                  
        return this.div;
    }, // draw
     
    showPlace: function () {
       console.log(this);  
    },
   
    doSearch: function () {                
       // returning test data
       var phrase = $('#searchInput').val(),
           params = {'phrase': phrase };
      
       var searchEngine = {
            internalUrl: 'search.php?',
            url: 'https://ws.geonorge.no/SKWSIndexSSR/ssr/sok?',

            paramNames: {
                name: 'navn',
                maxResult: 'maxAnt',
                northLL: 'nordLL',
                eastLL: 'ostLL',
                northUR: 'nordUR',
                eastUR: 'ostUR'
            },
        
            run: function (params, callbackFunction) {
                var queryUrl,
                    phrase = params.phrase,
                    request;
                queryUrl = this.buildQueryUrlInternal(params);
                request = $.ajax({
                    url: queryUrl,
                    dataType: 'xml'
                }); // request

                request.done(function(data){
                    callbackFunction(data);
                    //console.log($(data).find("sokStatus").text());
                });// done

                request.fail(function(xhr, status, exc) {
                    console.log( "Request failed: "+status + ', ' + exc);
                });// fail

            }, // run
                  
            // when calling local php file
            buildQueryUrlInternal: function (params) {
                var qurl = '';

                 qurl = this.internalUrl + 
                           this.paramNames.name+'='+params.phrase;

                return qurl;
            } // buildQueryUrlInternal
        } // searchEngine

        searchEngine.run(params, this.drawResponse);
    }, // run 
    
    onKeyDown: function(event) {
        OpenLayers.Event.stop(event, true);
        var lastTyped, 
            k = event.keyCode || event.which,
            that;
            
        if (k == 13) {
            this.doSearch();            
            return true;
        }
         
        lastTyped = $('#searchInput').val();
        if ( lastTyped.length < 2 ) {

           return false;
        } // endif
        
        that = this;
        
        setTimeout( function() {
            // launch with delay
            if ( lastTyped != $('#searchInput').val() ) {
                that.doSearch();
            }   
            }, 1000 );
    }, //onKeyDown
    
    drawResponse: function(xml) {
        var places, 
            listAreas = [],
            listAddress = [],
            listObjects = [],
            results, resultDiv;
           
        places = $(xml).find("sokRes > stedsnavn");   
           
        if (places.length == 0) {
            results = "No records found";
        } else {    
            places.each(function(){
                var place, type, north, east, listItem, zoomLevel;
                place = $(this).find("stedsnavn").text();
                type = $(this).find("navnetype").text();
                north = $(this).find("nord").text();
                east = $(this).find("aust").text();
                
                //should be resolved based on object type
                zoomLevel = 8;
                
                listItem = '<li class="search-place" data-east="'+east+'" data-north="'+north+'" data-zoom="'+zoomLevel+'">'+
                        place+', '+type+'</li>';
                
                switch(type) {
                    case 'By':
                    case 'Kommune':
                    case 'Fylke':
                    case 'Adm. bydel':
                    case 'Tettsted':
                    case 'Bydel':
                    case 'Grend':
                        listAreas.push(listItem);
                        break;
                    case 'Adressenavn (veg/gate)':
                        listAddress.push(listItem);
                        break;
                    case 'Fengsel':
                    case 'Annen kulturdetalj':    
                    case 'Stasjon':    
                    case 'Kirke':    
                    case 'Bru':    
                    case 'Skole':   
                    case 'Bruk (gardsbruk)':
                        listObjects.push(listItem);
                        break;
                    default:
                        listObjects.push(listItem);
                } // switch
                                                   
                    
            });
            results = '<div class="area">områder</div><ul>'+listAreas.join('')+'</ul>' +
                      '<div class="address">adreser</div><ul>'+listAddress.join('')+'</ul>' +
                      '<div class="object">objekter</div><ul>'+listObjects.join('')+'</ul>';
        } // if
        
        if ( $('#searchResults').length == 0 ) {            
            resultDiv = $( '<div/>', { 'id': 'searchResults', html: '<a href="#" class="close">x</a><div class="list"></div>'});
            $('.searchDiv').after(resultDiv);
        } else {
            resultDiv = $('#searchResults');   
        } // endif
                        
        $('#searchResults div.list').html( results );
        resultDiv.slideDown({'duration':250}, function(){});
        
        $('#searchResults a.close').on( "click", function(e){ $('#searchResults').remove() });
    }, // drawResponse 
    
    defaultEvent: function(event) {
        OpenLayers.Event.stop(event, true);
    },
    
    onClick: function (event) {
        if ( event.target.id == this.submitBtnId ) {
            this.doSearch();
        }
    }, // onClick
    
    
    CLASS_NAME: "OpenLayers.Control.Search"
}); // OpenLayers.Control.Search 
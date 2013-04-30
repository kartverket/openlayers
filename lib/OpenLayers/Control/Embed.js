/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Util/hideFromOldIE.js
 */
OpenLayers.Control.Embed = 
    OpenLayers.Class(OpenLayers.Control, {
    
    // remember that suffixes are added to this class: ItemActive or ItemInactive
    btnClass: 'olControlButtonEmbed',
    title: null,
    widget: null,
    cnt: null,
    serviceURL: null,
    widgetStates: null,
    navButtons: null,
    activeStep: null,

    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);

        this.type = OpenLayers.Control.TYPE_BUTTON;
        OpenLayers.Util.extend(OpenLayers.Lang.nb, {
            'Embed': 'Bruk kartutsnitt',
            'Select type:': 'Velg type:',
            'Dynamic map based on open services': 'Dynamisk kart basert på åpne tjenester',
            'Static map': 'Statisk kart',
            'Terms': 'Vilkår for bruk',
            'You can use the maps freely for any internet based purposes. You are not allowed to combine multiple maps to form a bigger, continous map.': 'Du kan fritt bruke kartutsnittene til alle nettbaserte formål. Kartene må brukes enkeltvis og ikke settes sammen slik at de danner et større sammenhengende kart.',
            'Svalbard terms': 'Integrasjon av Svalbard-kart er ikke tillatt uten spesiell avtale med Norsk Polarinstitutt. Se bruksvilkårene i Norsk Polarinstitutts egen kartportal, TopoSvalbard (toposvalbard.npolar.no) for ytterligere informasjon.',
            'Providers: Statens kartverk, Geovekst, municipalities and Norge digitalt partners': 'Innholdsleverandører: Statens kartverk, Geovekst, kommuner og Norge digitalt-parter.',
            'Previous': 'Forrige',
            'Next': 'Neste',
            'Show selected map area': 'Vis kartutsnitt',
            'Choose area': 'Velg utsnitt',
            'Include map tools': 'Ta med kartverktøy',
            'Include a marker': 'Sett inn markør',
            'Comment': 'Skriv inn kommentar',
            'Add': 'Legg til',
            'Skip': 'Hopp over',
            'Click in the map to add markers with descriptions.': 'Klikk på steder i kartet for å sette inn markører med forklaring. Legg til flere punkter ved å klikke i kartet.',
            'Map description': 'Beskriv kartutsnitt',
            'Short description:': 'Kort beskrivelse:',
            'I.ex.': 'F.eks.',
            '"Stores in Hordaland"': '"Utsalgssteder i Hordaland"',
            'Why?': 'Hvorfor?',
            'Long description:': 'Lang beskrivelse:',
            'A long description is used when there is an error, or when the user is unable to see the map.': 'Lang beskrivelse brukes når det skjer en feil og kartet ikke kan vises eller når brukeren ikke kan se kartet.',
            'Generate map': 'Generere kart',
            'Generate code': 'Generere kode',
            'Points:': 'Punkter:'
        });
        
        this.navButtons = {};
        this.navButtons.next = null;
        this.navButtons.back = null;

        this.title = OpenLayers.Lang.translate('Embed');
        this.widgetStates = {};

    }, // initialize
    
    draw: function () {
        var self = this, 
            cName = 'Embed-button nkButton',
            mapped, 
            btn, 
            toolElement, 
            panel;

        mapped = 'OpenLayers_Control_Embed' + self.map.id;
        btn    = OpenLayers.Util.createButton( mapped, null, null, null, 'static');

        OpenLayers.Event.observe(btn, 'click', 
            OpenLayers.Function.bind(self.toggleWidget, self)
        );
        
        btn.title = self.title;
        btn.className = btn.className === "" ? cName : btn.className + " " + cName;
        btn.innerHTML = OpenLayers.Util.hideFromOldIE('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="72.151px" height="38.936px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 72.151 38.936" class="icon embed"><path d="m 51.541,0 -6.91,5.549 14.83,13.918 -14.635,13.919 6.91,5.55 20.415,-19.469 z M 20.415,0 0,19.469 20.61,38.936 27.52,33.387 12.69,19.469 27.325,5.55 z" /></svg>');

        if (self.div == null) {
            self.div = btn;
        } else {
            if (OpenLayers.Element.hasClass(self.div, 'panel')) {
                panel = self.div;
                toolElement = document.createElement('div');
                OpenLayers.Element.addClass(toolElement, 'tool');
                OpenLayers.Element.addClass(toolElement, 'embed');
                toolElement.appendChild(btn);
                panel.appendChild(toolElement);
                self.div = toolElement;
            } else {
                self.div.appendChild(btn);
            }
        }

        self.cnt = document.createElement("div");
        OpenLayers.Element.addClass(self.cnt, "cnt");

        self.widget = OpenLayers.Util.createWidget(self.cnt, 1);
        self.div.appendChild( self.widget );
  
        return self.div;
    }, // draw
    steps: {
        type: {
            draw: function () {

            },
            remove: function () {

            }
        },
        terms: {
            draw: function () {

            },
            remove: function () {

            }
        },
        area: {
            draw: function () {

            },
            remove: function () {

            }
        },
        markers: {
            draw: function () {

            },
            remove: function () {

            }
        },
        descriptions: {
            draw: function () {

            },
            remove: function () {

            }
        },
        preview: {
            draw: function () {

            },
            remove: function () {

            }
        }

    },
    hideControls: function () { 
//        OpenLayers.Event.stopObservingElement(this.transformButton);
        OpenLayers.Element.removeClass( this.div, 'active' );
        this.transformButton = null;
        this.inputForm = null;
    }, //hideControls

    showControls: function () {
        var html = '',
            inputForm,
            selected,
            button,
            coordinates,
            that = this,
            inSystem,
            outSystem,
            fieldset,
            eastLabel, eastInput,
            northLabel, northInput;

 
       this.cnt.innerHTML = '<h1 class="h">' + OpenLayers.Lang.translate('Embed') + '</h1>';

/*        OpenLayers.Event.observe(this.inputForm, 'submit', 
            OpenLayers.Function.bind(that.transform, that)
        );
*/
        OpenLayers.Element.addClass(this.div, 'active');

//        this.map.events.register('click', this, this.setCoordinatesFromClick);
    }, // showControls

    enable: function () {
    }, // enable

    disable: function () {
    }, // disable
   
    toggleWidget: function () {
        OpenLayers.Element.hasClass( this.div, 'active' ) ? this.hideControls() : this.showControls();
    }, // toggleGetURL
    
    toggleControls: function () {      
       var self = this;
    },//togglecontrols
    
    CLASS_NAME: "OpenLayers.Control.Embed"
}); // OpenLayers.Control.Transformations

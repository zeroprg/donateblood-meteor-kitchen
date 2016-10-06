
Template.map.rendered = function () { 
  // basic housekeeping
  $(window).resize(function () {
    var h = $(window).height(), offsetTop = 90; // Calculate the top offset
    $('#map_canvas').css('height', (h - offsetTop));
  }).resize();

   // map global variables 
   var map_zoom = 7;
  //if (!map) {

  // initialize map events
 //  var  jqxhr = getGeoLocationByIp();
   getGeoLocationByIp().done(function(my_loc) {   
    console.log(my_loc);
    //my_loc = Session.get("my_loc");
    initialize($("#map_canvas")[0], [my_loc.latitude, my_loc.longitude ], map_zoom);
    show_earthquakes_on_map();
    setInterval(show_earthquakes_on_map,600000);
  
  
    var self = this;
    Meteor.autorun(function() {
      var selectedDonor = Donors.findOne(Session.get("selected"));
      if (selectedDonor) { 
        animateMarker(selectedDonor);
      }  
      var selectedRecipient = Recipients.findOne(Session.get("selected"));
      if (selectedRecipient) {
        animateMarker(selectedRecipient);
      }  



    })


  //}


 Donors.find({}).observe({
    added: function(donor) {
      var marker = new L.Marker([donor.lat,donor.lng] , {
        _id: donor._id,
        icon: createIcon(donor)
      }).on('click', function(e) {
        Session.set("selected",   e.target.options._id );
        Router.go("home_private.donors.details",{donorId: e.target.options._id});
      });      
      addMarker(marker);
    },
    changed: function(donor) {
      var marker = markers[donor._id];
      marker.setLatLng([donor.lat,donor.lng]).update();
      if (marker) marker.setIcon(createIcon(donor));
    },
    removed: function(donor) {
      removeMarker(donor._id);
    },
    found:  function(recipient) {
      console.log(donor._id);
    }
  });


 Recipients.find({}).observe({

    added: function(recipient) {
      var marker = new L.Marker([recipient.lat,recipient.lng] , {
        _id: recipient._id,
        icon: createIcon(recipient)
      }).on('click', function(e) {
        Session.set("selected", e.target.options._id);
        Router.go("home_private.recipients.details", {recipientId: e.target.options._id});
      });      
      addMarker(marker);
    },
    changed: function(recipient) {
      var marker = markers[recipient._id];
      marker.setLatLng([recipient.lat,recipient.lng]).update();
      if (marker) marker.setIcon(createIcon(recipient));
    },

    removed: function(recipient) {
      removeMarker(recipient._id);
    },
    found:  function(recipient) {
      console.log(recipient._id);
    }
  });

});
  

}


var animateMarker = function (selectedRecipient) {
      if (!self.animatedMarker) {
            var line = L.polyline([[selectedRecipient.lat, selectedRecipient.lng]]);
            self.animatedMarker = L.animatedMarker(line.getLatLngs(), {
              autoStart: false,
              distance: 3000,  // meters
              interval: 20, // milliseconds
              icon: L.divIcon({
                iconSize: [50, 50],
                className: 'leaflet-animated-div-icon'
              })
            });
            map.addLayer(self.animatedMarker);
          } else {
            // animate to here
            var line = L.polyline([[self.animatedMarker.getLatLng().lat, self.animatedMarker.getLatLng().lng],
              [selectedRecipient.lat, selectedRecipient.lng]]);
            self.animatedMarker.setLine(line.getLatLngs());
            self.animatedMarker.start();
          } 
          map.setView(new L.LatLng(selectedRecipient.lat, selectedRecipient.lng));
}


var map, markers = [ ];



var initialize = function(element, centroid, zoom, features) { 
  map = L.map(element, {
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    touchZoom: false
  }).setView(new L.LatLng(centroid[0], centroid[1]), zoom);
  
  // different layer
  //L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png').addTo(map);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            {
              attribution : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

  map.attributionControl.setPrefix('');
  
  var attribution = new L.Control.Attribution();
  attribution.addAttribution("Geocoding data &copy; 2013 <a href='http://open.mapquestapi.com'>MapQuest, Inc.</a>");
  attribution.addAttribution("Map tiles by <a href='http://stamen.com'>Stamen Design</a> under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>.");
  attribution.addAttribution("Data by <a href='http://openstreetmap.org'>OpenStreetMap</a> under <a href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>.");
  
  map.addControl(attribution);

  map.on('dblclick', function(e) {        
        if (! Meteor.userId()) // must be logged in to create donors
        return;
        if( "home_private.donors.edit" != Router.current().route.getName())
           Router.go("home_private.donors.insert", {});

        var popLocation = e.latlng;
        my_loc = Session.get("my_loc");
        my_loc.latitude = popLocation.lat;
        my_loc.longitude = popLocation.lng;
        renderInputFields(my_loc);
        // set new selected on map location  
        Session.set("my_loc", my_loc);
        var popup = L.popup()
        .setLatLng(popLocation)
        .setContent('<p>To select this position <br/> lat: ' + popLocation.lat + '<br/>  long:  ' + popLocation.lng + '<br/> Open donor profile and click save</p>')
        .openOn(map);        
    });

  map.on('focus', function() { map.scrollWheelZoom.enable(); });
  map.on('blur', function() { map.scrollWheelZoom.disable(); });

}



var addMarker = function(marker) {
  map.addLayer(marker);
 // marker.bindPopup("I am an orange leaf.");
  markers[marker.options._id] = marker;
}

var removeMarker = function(_id) {
  var marker = markers[_id];
  if (map.hasLayer(marker)) map.removeLayer(marker);
}


var createIcon = function(player) {
  var className = 'leaflet-div-icon ';
  // if player is recipient'
  className += player.accept_good ? 'public' : 'private';
  return L.divIcon({
    iconSize: [30, 30],
    html: '<b>' + (player.accept_good == undefined ?  player.blood_group  : player.accept_good)   + '</b>',
    className: className  
  });
}

var createErthquakeIcon = function(earthquake) {
  var className = 'leaflet-div-icon-earthquake';
  return L.divIcon({
    iconSize: [30, 30],
    html: '<b>' + earthquake.mag + '</b>',
    className: className  
  });
}


var openCreateDialog = function (latlng) {
  Session.set("createCoords", latlng);
  Session.set("createError", null);
  Session.set("showCreateDialog", true);
};


var show_earthquakes_on_map = function() {
   $.getJSON('//earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
           function(data) {
                    console.log("JSONP called");
                    $.each(data.features, function( index, item ) {
                       var magnitude = item.properties.mag;
                /*
                      var ErthquakeIcon = L.Icon.Default.extend({
                        options: {
                          iconUrl:   'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + magTocolor(magnitude) +  '&chf=a,s,ee00FFFF',
                          iconSize:  [10*magnitude, 18*magnitude], // size of the icon
                          shadowSize:[10*magnitude, 18*magnitude], // size of the shadow
                        }
                      });                   
                      var erthquakeIcon = new ErthquakeIcon();
                */
                      var title = item.properties.title;    
                      var lat = item.geometry.coordinates[1];
                      var lon = item.geometry.coordinates[0];
                 
                      var marker = new L.Marker([lat, lon] , {
                        _id: item.id,
                        icon: createErthquakeIcon(item.properties)
                      }).on('click', function(e) {
                        //Session.set("selected",   e.target.options._id );
                       // Router.go("home_private.donors.details",{donorId: e.target.options._id});
                      }); 

//                      var marker = L.marker([lat, lon], {icon: erthquakeIcon}).addTo(map);
                      var date = new Date(item.properties.time);
                      var text =  '<b> Time: </b> :' + date.toLocaleString() + '</br> ' ; 
                      text +=  '<b> depth: </b> :' + item.geometry.coordinates[2] + '</br> ' ;
                      text +=  '<b> Magnitude: </b> :' + item.properties.mag + '</br> ' ;
                      marker.bindPopup("<b>" + title + "</b><br>" + text).openPopup();
                      addMarker(marker);

                    /*
                    if( $("#msgs b:contains(" + title + ")").length==0 ) { // populate if only it's new
                        $("#msgs").html('<li class="self">'+ populateMsg ("", "<b>" + title + "</b><br>" + text) + $("#msgs").html());
                    }
                    */
               });          
   });
}
var  magTocolor = function(magnitude)
 { 
    var color;
    if(magnitude < 1  )         color ='D7BDE2';
    else if( magnitude < 2.5  ) color ='6C3483';
    else if( magnitude < 3  )   color ='1F618D';
    else if( magnitude < 4  )   color ='196F3D';
    else if( magnitude < 5 )    color ='F4D03F';
    else if( magnitude < 5.5 )  color ='DC7633';
    else if( magnitude < 6 )    color ='FF5733';
    else if( magnitude < 7 )    color ='FF5000';
    else if( magnitude < 10 )   color ='FF0000';
    return color;
}

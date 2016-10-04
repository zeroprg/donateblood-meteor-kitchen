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
  

  L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png').addTo(map);

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

var createIcon = function(donor) {
  var className = 'leaflet-div-icon ';
  className += donor.public ? 'public' : 'private';
  return L.divIcon({
    iconSize: [30, 30],
    html: '<b>' + donor.blood_group + '</b>',
    className: className  
  });
}

var openCreateDialog = function (latlng) {
  Session.set("createCoords", latlng);
  Session.set("createError", null);
  Session.set("showCreateDialog", true);
};
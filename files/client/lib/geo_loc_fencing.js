// get geolocation by ip address
 getGeoLocationByIp = function() {
  var my_loc = Session.get("my_loc");
  var jqxhr;

    if ( my_loc === undefined )
    {
       jqxhr = $.getJSON('//freegeoip.net/json/?callback=?', 
        function(my_loc) {       
        Session.set("my_loc",my_loc);
        renderInputFields();

      });

    } else {
        renderInputFields(my_loc);
    }

   return  jqxhr;
  };

  renderInputFields = function(my_loc) {
     if(!my_loc) { 
      my_loc = Session.get("my_loc");
    }
    
        $("textarea[name='note']").
          val("Address: "+ my_loc.city+", "+ my_loc.region_code +",  Zip code:" +my_loc.zip_code+ ",  region: "+ my_loc.region_name+", " + my_loc.country_name);
        $("input[name='ip']").val(my_loc.ip);
        $("input[name='lat']").val(my_loc.latitude);
        $("input[name='lng']").val(my_loc.longitude);
      
  };

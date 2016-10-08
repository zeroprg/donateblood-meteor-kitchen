L.AnimatedMarker = L.Marker.extend({
  options: {
    // meters
    distance: 200,
    // ms
    interval: 1000,
    // animate on add?
    autoStart: true,
    // callback onend
    onEnd: function(){},
    clickable: false
  },

  initialize: function (latlngs, options) {
    this.setLine(latlngs);
    L.Marker.prototype.initialize.call(this, latlngs[0], options);
  },

  // Breaks the line up into tiny chunks (see options) ONLY if CSS3 animations
  // are not supported.
  _chunk: function(latlngs) {
    var i,
        len = latlngs.length,
        chunkedLatLngs = [];

    for (i=1;i<len;i++) {
      var cur = latlngs[i-1],
          next = latlngs[i],
          dist = cur.distanceTo(next),
          factor = this.options.distance / dist,
          dLat = factor * (next.lat - cur.lat),
          dLng = factor * (next.lng - cur.lng);

      if (dist > this.options.distance) {
        while (dist > this.options.distance) {
          cur = new L.LatLng(cur.lat + dLat, cur.lng + dLng);
          dist = cur.distanceTo(next);
          chunkedLatLngs.push(cur);
        }
      } else {
        chunkedLatLngs.push(cur);
      }
    }

    return chunkedLatLngs;
  },

  onAdd: function (map) {
    L.Marker.prototype.onAdd.call(this, map);

    // Start animating when added to the map
    if (this.options.autoStart) {
      this.start();
    }
  },

  animate: function() {
    var self = this,
        len = this._latlngs.length,
        speed = this.options.interval;

    // Normalize the transition speed from vertex to vertex
    if (this._i < len) {
      speed = this._latlngs[this._i-1].distanceTo(this._latlngs[this._i]) / this.options.distance * this.options.interval;
    }

    // Only if CSS3 transitions are supported
    if (L.DomUtil.TRANSITION) {
      if (this._icon) { this._icon.style[L.DomUtil.TRANSITION] = ('all ' + speed + 'ms linear'); }
      if (this._shadow) { this._shadow.style[L.DomUtil.TRANSITION] = 'all ' + speed + 'ms linear'; }
    }

    // Move to the next vertex
    this.setLatLng(this._latlngs[this._i]);
    this._i++;

    // Queue up the animation to the next next vertex
    this._tid = setTimeout(function(){
      if (self._i === len) {
        self.options.onEnd.apply(self, Array.prototype.slice.call(arguments));
      } else {
        self.animate();
      }
    }, speed);
  },

  // Start the animation
  start: function() {
    if (!this._i) {
      this._i = 1;
    }

    this.animate();
  },

  // Stop the animation in place
  stop: function() {
    if (this._tid) {
      clearTimeout(this._tid);
    }
  },

  setLine: function(latlngs){
    if (L.DomUtil.TRANSITION) {
      // No need to to check up the line if we can animate using CSS3
      this._latlngs = latlngs;
    } else {
      // Chunk up the lines into options.distance bits
      this._latlngs = this._chunk(latlngs);
      this.options.distance = 10;
      this.options.interval = 30;
    }
    this._i = 1;
  }

});
L.animatedMarker = function (latlngs, options) {
  return new L.AnimatedMarker(latlngs, options);
};


//Earthquake magnitude marker
L.ErthquakeMarker = {};
L.ErthquakeMarker.version = '1.0.1'
L.ErthquakeMarker.Icon =  L.Icon.extend({
  options: {   
    iconUrl:   'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|D7BDE2&chf=a,s,ee00FFFF',
    iconSize:  [10, 18], // size of the icon
    shadowSize:[10, 18], // size of the shadow
  },
  initialize: function (options) {
      options = L.Util.setOptions(this, options);
  },


});                   

magTocolor = function(magnitude)
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


L.ErthquakeMarker.icon = function (magnitude) {
     return new L.ErthquakeMarker.Icon({iconSize: [10*magnitude, 18*magnitude] , shadowSize:[10*magnitude, 18*magnitude], iconUrl:'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + magTocolor(magnitude) +'&chf=a,s,ee00FFFF'});
};


// More complex marker
L.AwesomeMarkers = {};

  L.AwesomeMarkers.version = '2.0.1';

  L.AwesomeMarkers.Icon = L.Icon.extend({
      options: {
          iconSize: [35, 45],
          iconAnchor:   [17, 42],
          popupAnchor: [1, -32],
          shadowAnchor: [10, 12],
          shadowSize: [36, 16],
          className: 'awesome-marker',
          prefix: 'glyphicon',
          spinClass: 'fa-spin',
          extraClasses: '',
          icon: 'home',
          markerColor: 'blue',
          iconColor: 'white'
      },

      initialize: function (options) {
          options = L.Util.setOptions(this, options);
      },

      createIcon: function () {
          var div = document.createElement('div'),
              options = this.options;

          if (options.icon) {
              div.innerHTML = this._createInner();
          }

          if (options.bgPos) {
              div.style.backgroundPosition =
                  (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
          }

          this._setIconStyles(div, 'icon-' + options.markerColor);
          return div;
      },

      _createInner: function() {
          var iconClass, iconSpinClass = "", iconColorClass = "", iconColorStyle = "", options = this.options;

          if(options.icon.slice(0,options.prefix.length+1) === options.prefix + "-") {
              iconClass = options.icon;
          } else {
              iconClass = options.prefix + "-" + options.icon;
          }

          if(options.spin && typeof options.spinClass === "string") {
              iconSpinClass = options.spinClass;
          }

          if(options.iconColor) {
              if(options.iconColor === 'white' || options.iconColor === 'black') {
                  iconColorClass = "icon-" + options.iconColor;
              } else {
                  iconColorStyle = "style='color: " + options.iconColor + "' ";
              }
          }

          return "<i " + iconColorStyle + "class='" + options.extraClasses + " " + options.prefix + " " + iconClass + " " + iconSpinClass + " " + iconColorClass + "'></i>";
      },

      _setIconStyles: function (img, name) {
          var options = this.options,
              size = L.point(options[name === 'shadow' ? 'shadowSize' : 'iconSize']),
              anchor;

          if (name === 'shadow') {
              anchor = L.point(options.shadowAnchor || options.iconAnchor);
          } else {
              anchor = L.point(options.iconAnchor);
          }

          if (!anchor && size) {
              anchor = size.divideBy(2, true);
          }

          img.className = 'awesome-marker-' + name + ' ' + options.className;

          if (anchor) {
              img.style.marginLeft = (-anchor.x) + 'px';
              img.style.marginTop  = (-anchor.y) + 'px';
          }

          if (size) {
              img.style.width  = size.x + 'px';
              img.style.height = size.y + 'px';
          }
      },

      createShadow: function () {
          var div = document.createElement('div');

          this._setIconStyles(div, 'shadow');
          return div;
    }
  });
      
  L.AwesomeMarkers.icon = function (options) {
      return new L.AwesomeMarkers.Icon(options);
  };
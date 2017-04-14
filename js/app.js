// Global variables
var map;
var markers = [];
var infoWindow;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 35.652832, lng: 139.839478},
        zoom: 12,
        mapTypeControl: false
    });

    infoWindow = new google.maps.InfoWindow();
    
};

function fourSquareApi(locations) {
    var client_id = "F1WMNRZ3ZJDLAFPQSQY1SC3SWFLXCLFTY3052XTAQWUIRXCL";
    var client_secret = "XKJBUESDDM3P3KIQSMFH5NZLZ53XK5A3CVGO4REWGN2PUB1P";
    var version = "20170413";
    var query = "sushi";
    var ll = "35.652832, 139.839478";
    var limit = 20;
    var fourSquareUrl = "https://api.foursquare.com/v2/venues/search?v=" + version + "&ll=" + ll + "&query=" + query + "&limit=" + limit + "&client_id=" + client_id + "&client_secret=" + client_secret;
    
    $.ajax({
        type: "GET",
        url: fourSquareUrl,
        dataType: "json",
        async: true,
        success: function(data) {
            var venues = data.response.venues;
            console.log(venues);
            venues.forEach(function (venue) {
                locations.push(new Location(venue));
            })
        },
    
        error: function() {
            alert('Foursquare API could not load');
        }
    });
}

var Location = function(data) {
    var self = this;
    self.id = data.categories.id;
    self.name = data.name;
    self.lat = data.location.lat;
    self.lng = data.location.lng;
    self.position = {lat: self.lat, lng: self.lng};
    self.address = data.location.address;
    self.show = ko.observable(true);
    if (data.contact.phone == null) {
        self.phone = "Phone number unavailable"
    } else  {
    self.phone = data.contact.phone;
    }

    self.newMarker = ko.computed(function () {
        self.marker = new google.maps.Marker({
            position: self.position,
            title: self.name,
            map: map,
            animation: google.maps.Animation.DROP
        });
    });

    self.marker.addListener('click', function() {
        self.populateInfoWindow();
        self.toggleBounce();
    });

    self.populateInfoWindow = function() {
        infoWindow.setContent('<div>' + self.name + '<br>' + "Contact: " + self.phone + '</div>');
        infoWindow.open(map, self.marker);
    };

     self.toggleBounce = function() {
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 1400);
    }

}


   

var viewModel = function() {

    var self = this;
    
    self.locations = ko.observableArray([]);
    fourSquareApi(self.locations);
    self.searchInput = ko.observable('');

    self.searchInput = ko.observable("");
    self.searchFilter = ko.computed(function () {
        var filter = self.searchInput().toLowerCase();
        for (var i = 0; i < self.locations().length; i++) {
            if (self.locations()[i].name.toLowerCase().indexOf(filter) > -1) {
                self.locations()[i].show(true);
                self.locations()[i].marker.setVisible(true);
            }
            else {
                self.locations()[i].show(false);
                self.locations()[i].marker.setVisible(false);
                infoWindow.close();
            }
        }
    });
    
    self.selectLocation = function(locations) {
        google.maps.event.trigger(locations.marker, "click");

    }
    
};
var vm = new viewModel();
ko.applyBindings(vm);
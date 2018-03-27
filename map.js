// ---    Was not sure if we will need the geolocation, but here it is if we ------------------------------
// ---    Getting brower's geolocation. It will ask for permission ------------------------------
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        var x = document.getElementById("location");  // --- this access browser's location
        x.innerHTML = "Geolocation is not supported by this browser.";
    console.log(x);
        
    };
};

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    };
};
// -----------------Passing Location to the Discovery API--------------------------
function showPosition(position) {
    var x = document.getElementById("location");    // --- Location is base on above code's results  -----
    x.innerHTML = "Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude;  
    var latlon = position.coords.latitude + "," + position.coords.longitude;

    var apiKey = "RoDgdYM6hvCYQYDMGjOgTU0jJBvdaXIg"  // ------- API Key ------------------
    var queryURL = "https://app.ticketmaster.com/discovery/v2/events.json?apikey="+apiKey+"&latlong="+latlon;
    
    console.log(queryURL)

    $.ajax({
        method: "GET",
        url: queryURL,
        async:true,
        dataType: "json",
        success: function(json) {
                    console.log(json);
                    var e = document.getElementById("list-results");
                    e.innerHTML = json.page.totalElements + " events found.";
                    showEvents(json);
                    initMap(position, json);
                },
        error: function(xhr, status, err) {
                    console.log(err);
                }
    });
};

// -----------------------------------------------------------------------------------
function showEvents(json) {
    for(var i=0; i<json.page.size; i++) {            //  ??????what is page.size ????????
      $("#list-results").append("<p>"+json._embedded.events[i].name+"</p>");
    }
};
  
  // --------------------------------- Initiate Google Map --------------------------
function initMap(position, json) {
    var mapDiv = document.getElementById("map-location");
    var map = new google.maps.Map(mapDiv, {center: {lat: position.coords.latitude, lng: position.coords.longitude}, zoom: 10});
    for(var i=0; i<json.page.size; i++) {
        addMarker(map, json._embedded.events[i]);
    };
};
  
function addMarker(map, event) {      // ------------- THis adds marker on Google Map  --------------------
    var marker = new google.maps.Marker({position: new google.maps.LatLng(event._embedded.venues[0].location.latitude, event._embedded.venues[0].location.longitude), map: map});
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    console.log(marker);
};

getLocation();

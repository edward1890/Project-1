//Code that runs the carosel
    $("#cardContainer").slick({
        dots: true,
        arrows: true,
        infinite: false,
        speed: 300,
        slidesToShow: 6,
        slidesToScroll: 6,
        responsive: [
            {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: true,
                dots: true
            }
            },
            {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
            },
            {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
            }
        ]
        });

//Declare firebase obj. 
var config = {
    apiKey: "AIzaSyB2w2Z0XxrOtqNiuXnheoco3l0Rq2_1Bhc",
    authDomain: "localshow-befb6.firebaseapp.com",
    databaseURL: "https://localshow-befb6.firebaseio.com",
    projectId: "localshow-befb6",
    storageBucket: "",
    messagingSenderId: "727534673587"
};

//Initialize firebase DB 
firebase.initializeApp(config);

//Call this magic database method
var database = firebase.database(); 

// searchResultID is used to child nodes in the DB
var searchResultID; 

// Declare empty latLongArr, this is what will be passed into the addMarker function
var latLongArr = []; 

// searchResultID is set to 0 in the DB initially. We retreive that value once on page load and again anytime the value is updated. 
database.ref("aSearchResultCounter").on("value", function(snapshot){
    // Empty any previous results
    
  
    // Clear map on new search
    clearMarkers();

    searchResultID = snapshot.val();  
    console.log("Current search result ID: " + searchResultID); 

    // Listening for children on the current ID. This will fire once for each child added, so it's kind of working like a loop. This is good.
    database.ref("searchResult-" + searchResultID).on("child_added", function(snapshot){

        // Capture unique name of the search item
        var key = snapshot.key; 

        //Declare object that will temp. store the search item from firebase
        var searchItem = {};

        //Hit the database for the event information and store that in the object declared above. 
        database.ref("searchResult-" + searchResultID + "/" + key).on("value", function(snapshot){
            
            searchItem.name = snapshot.val().name; 
            searchItem.venue = snapshot.val().venue; 
            searchItem.date = snapshot.val().date; 
            searchItem.ticketsStart = snapshot.val().ticketsStart; 
            searchItem.buyTickets = snapshot.val().buyTickets;
            searchItem.image = snapshot.val().image;
            // lat and long need to be converted to a decimal 
            searchItem.lat = parseFloat(snapshot.val().lat); 
            searchItem.long = parseFloat(snapshot.val().long); 

        })

        //Test to confirm object built correctly 
        console.log("The cur. search" +   searchItem); 

        //Update the array that will be passed into the function that renders the markers 
        latLongArr.push({lat: searchItem.lat, lng: searchItem.long})
        console.log(latLongArr); 

        // Call the addMarker function once with each search item's coordinates 
        for (var i = 0; i < latLongArr.length; i++) {
            addMarker(map, latLongArr[i])
            }

        //Now we render the event info on the page
        // Please try not to cringe at the sight to this code
        var flipContainer = $('<div class="flipContainer item"></br>');

        var flipperClass = $('<div class="flipper">');

        var front = $('<div class="front" style="background-image: url(' + searchItem.image + ')"></div>');

        var back = $('<div class="back">'); 

        var evtList = $('<ul class="list-style">');
        var evtName = $('<li> Event Name: ' + searchItem.name + '</li>');
        var evtVenue = $('<li> Venue: ' + searchItem.venue + '</li>')
        var evtDate = $('<li> Date: ' + searchItem.date  + '</li>'); 
        var evtTicketsAt = $('<li> Starting Tickets: ' + searchItem.ticketsStart + '</li>;');

        var evtBuyTics = $('<button><a href="'  + searchItem.buyTickets + '">Buy Tickets!</a></button');

        $(evtList).append(evtName, evtVenue, evtDate, evtTicketsAt, evtBuyTics);

        $(back).append(evtList);

        $(flipperClass).prepend(back); 

        $(flipperClass).prepend(front); 

        $(flipContainer).append(flipperClass); 

        $("#cardContainer").append(flipContainer); 

    })

    // This is defined here in an effort to have the slick method apply to dynamically created elements. This function isn't being called. 
    function slickInit(){
        $("#cardContainer").slick({
            dots: true,
            arrows: true,
            infinite: false,
            speed: 300,
            slidesToShow: 6,
            slidesToScroll: 6,
            slide: ".list-panel", 
            responsive: [
                {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                }
                },
                {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
                },
                {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
                }
            ]
            })
        
        console.log("I'm here.")

    }

    //Here is the attempt to initialize the slick method where it ought to be. Not sure why this isn't resulting in the desired output.
    // slickInit();    

})

// Mapping logic 
var map; 

// Initialize Google map 
initMap = function(position, json) {
    var denver = {lat: 39.739234, lng: -104.984796};
    map = new google.maps.Map(document.getElementById('map-location'), {
    zoom: 11,
    center: denver
    });
};

//Function to plot lat/long coordinates
function addMarker(map, latLongArr) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latLongArr),
        map: map
    });
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    };

//Clear function
function clearMarkers() {
    for(var i = 0; i < latLongArr.length; i++){
        latLongArr[i] = null;
    }
    latLongArr.length = 0; 
    addMarker(map, latLongArr); 
};


//Click event for the main button on the landing page 
$("#search-button").on("click", function(event){ 

    event.preventDefault(); 

    

    // $("#cardContainer").empty();
    
    //Capture input string 
    var keyword = $("#search-text").val().trim(); 
    // Empty the text box
    $("#search-text").text("");

    //Pass that string as the keyword into the query url. We're also using a proxy to side step CORS error. This will be removed when we go live. 
    var queryURL = "https://thingproxy.freeboard.io/fetch/" + "https://app.ticketmaster.com/discovery/v2/events.json?apikey=RoDgdYM6hvCYQYDMGjOgTU0jJBvdaXIg&city=denver&stateCode=CO&radius=50&keyword=" + keyword;
    
    //Retreive the updated searchResultID and increment to match the counter
    database.ref("aSearchResultCounter").on("value", function(snapshot){
        searchResultID = snapshot.val() + 1; 
    })

    console.log(searchResultID); 

    //Make the ajax call
    $.ajax({
        method: "GET", 
        url: queryURL
    }).then(function(response){
        // Capture the part of the API results that contain the values we're looking for 
        var events = response._embedded.events;
        console.log(events)

        //Loop through these results, capture the values of interest, declare an object w/ those values and pass that object into the Firebase push method (sending them up to the DB)
        for (var i = 0; i < events.length; i++) {

            // Capture standard values from the ajax call
            var name = events[i].name;
            var venue = events[i]._embedded.venues[0].name;
            var date = events[i].dates.start.localDate;
            var buyTickets = events[i].url; 
            var image = events[i].images[1].url; 
            var lat = events[i]._embedded.venues[0].location.latitude;
            var long = events[i]._embedded.venues[0].location.longitude; 

            // This info doesn't exit for all returns. Capture it, if the current return does. Error will throw otherwise. 
            if (events[i].priceRanges) {
                var ticketsStart = events[i].priceRanges[0].min;
            } else { var ticketsStart = "Ticket prices are not listed." }

            // Firebase won't work with undefined values
            if (events[i].info) {
                var generalInfo = events[i].info;
            } else { var generalInfo = "No general information has been specified for this event." }

            // Firebase won't work with undefined values
            if (events[i].pleaseNote) {
                var notes = events[i].pleaseNote;
            } else { var notes = "No notes specified for this event." }

            //Temp. store them in an object
            var results = {
                name: name, 
                venue: venue, 
                date: date,
                ticketsStart: ticketsStart, 
                buyTickets: buyTickets, 
                image: image, 
                generalInfo: generalInfo, 
                notes: notes,
                lat: lat, 
                long: long
            };

            // Pass that object to firebase w/ the concatenated ID 
            database.ref("searchResult-" + searchResultID).push(results);
            
        }     

    }).then(function(){
        
        //Set the incremented ID in the DB
        database.ref("aSearchResultCounter").set(searchResultID); 

        location.reload();

    })   
})




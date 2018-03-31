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
// searchResultID is set to 0 in the DB, initially. We retreive that value on page load.
$(document).ready(function(){
    database.ref("aSearchResultCounter").on("value", function(snapshot){
        searchResultID = snapshot.val(); 
        console.log("cur search reasult: " + searchResultID); 
    })
})

//Click event for the main button on the landing page 
$("#search-button").on("click", function(event){ 

    event.preventDefault();

    //Capture input string 
    var keyword = $("#search-text").val().trim(); 

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
            } else {
                var ticketsStart = "Ticket prices are not listed."; 
            }

            // Firebase won't work with undefined values
            if (events[i].info) {
                var generalInfo = events[i].info;
            } else {
                var generalInfo = "No general information has been specified for this event."
            }

            // Firebase won't work with undefined values
            if (events[i].pleaseNote) {
                var notes = events[i].pleaseNote;
            } else {
                var notes = "No notes specified for this event."
            }
        
            // Log em to test
            // console.log(name);
            // console.log(venue);
            // console.log(date); 
            // console.log(ticketsStart); 
            // console.log(buyTickets); 
            // console.log(image); 
            // console.log(generalInfo); 
            // console.log(notes); 
            // console.log("latitude: " + lat + ", Longitude: " + long);
           

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
        
        // Direct user to the results page 
        location.assign("index.html"); 

        console.log("I'm here.")
    })   

    

})



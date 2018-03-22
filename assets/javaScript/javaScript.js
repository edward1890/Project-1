// Renamed javaScript from java 

$(".btn-primary").on("click", function(event){
    event.preventDefault();  

    //Capture input string 
    var keyword = $("#search-text").val().trim(); 

    //Pass that string as the keyword into the query url
    var queryURL = "https://thingproxy.freeboard.io/fetch/" + "https://app.ticketmaster.com/discovery/v2/events.json?apikey=RoDgdYM6hvCYQYDMGjOgTU0jJBvdaXIg&city=denver&stateCode=CO&radius=50&keyword=" + keyword;

    $.ajax({
        method: "GET", 
        url: queryURL
    }).then(function(response){
        
       var events = response._embedded.events;
       console.log(events)

        for (var i = 0; i < events.length; i++) {

            var eventName = events[i].name;
            var venue = events[i]._embedded.venues[0].name
            var eventDate = events[i].dates.start.localDate;
            var ticketsStart = events[i].priceRanges[0].min;   
            var buyTickets = events[i].url; 
            var image = events[i].images[1].url; 

            console.log(eventName);
            console.log(venue);
            console.log(eventDate); 
            console.log(ticketsStart); 
            console.log(buyTickets); 
            console.log(image); 

        }
    
    })     

})



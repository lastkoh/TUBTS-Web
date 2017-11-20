/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function(){ 
   
    var myLatlng = new google.maps.LatLng(3.07044291496277, 101.612594604492);
    var myOptions = {
        zoom: 14,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById("map"), myOptions);
    var markers = [];
    var infoWindows = [];
    var polylines = [];
  
    //Simulation variables
    var vehicleWorker = null;
    var vehicleMarker = null;
    var vehicleOrigin = null;
    var interval = null;
  
    function clearMap(){
        for(var i = 0; i < markers.length; i++)
            markers[i].setMap(null);
        for(var i = 0; i < polylines.length; i++)
            polylines[i].setMap(null);
        if(vehicleMarker != null){
            vehicleMarker.setMap(null);
            vehicleMarker = null;
        }
    }
    
    function createInfoWindow(infoWindow, marker, infoWindowContent) {
        google.maps.event.addListener(marker, 'click', function () {
            for(var i = 0; i < infoWindows.length; i++)
                infoWindows[i].close();
            infoWindow.setContent(infoWindowContent);
            infoWindow.open(map, this);
        });
    }
   
    function startSimulation(routeId){
      vehicleWorker = new Worker('js/VehicleWorker.js');
      vehicleWorker.postMessage(JSON.stringify({'route_id':routeId}));
      interval = setInterval(function(){
        vehicleWorker.postMessage(JSON.stringify({'route_id':routeId}));
      },30000)
      vehicleWorker.onmessage = function(e){
        if(e.data != null){
          var json = JSON.parse(e.data);
          vehicleMarker.setPosition(new google.maps.LatLng(json.lat,json.lng));
          document.getElementById("nextStop").innerHTML = json.next_stop_name;
          document.getElementById("etaMins").innerHTML = json.eta_mins;
        }else{
          console.log("Set the bus to original stop");
          vehicleMarker.setPosition(vehicleOrigin);
          document.getElementById("nextStop").innerHTML = "";
          document.getElementById("etaMins").innerHTML = 0;
        }
      }
    }
  
    function stopSimulation(){
      if(vehicleWorker != null){
        vehicleWorker.terminate(); 
      }

      if(interval != null){
        clearInterval(interval);
      }


      vehicleOrigin = null;
      interval = null;
      vehicleWorker = null;
    }
  
    var plot_TU1A = function(){
        
        stopSimulation();
        clearMap();
        $.getJSON("https://fyp-postgrest.herokuapp.com/routes?route_id=eq.1",
            function(json){  
                var decodedPath = google.maps.geometry.encoding.decodePath(json[0].gmap_line);
                
                var line = new google.maps.Polyline({
                    path: decodedPath,
                    strokeColor: json[0].gmap_line_color,
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                line.setMap(map);
                polylines.push(line);
                
                map.setZoom(json[0].gmap_zoom_level);  
                map.setCenter(new google.maps.LatLng(json[0].gmap_center_lat, json[0].gmap_center_lon));
            });
            
        $.getJSON("https://fyp-postgrest.herokuapp.com/routes?route_id=eq.1&select=*,services{*},routes_stops{stops{*}}&routes_stops.order=sequence.asc",
            function(json){
                document.getElementById("stopsList").innerHTML = "";
                document.getElementById("serviceList").innerHTML = "";
                var stopsList = $("#stopsList");
                var serviceList = $("#serviceList");
                var routeStops = json[0].routes_stops;
                
                stopsList.append("<h2 style=\"color:#b71c1c\">Bus Stops for " + json[0].name + "</h2>");
          
                var serviceListString = "Service Days: <label style=\"color:#444; font-weight:bold; display:inline\">";
                if(json[0].services.monday)
                    serviceListString += "Monday, ";
                if(json[0].services.tuesday)
                    serviceListString += "Tuesday, ";
                if(json[0].services.wednesday)
                    serviceListString += "Wednesday, ";
                if(json[0].services.thursday)
                    serviceListString += "Thursday, ";
                if(json[0].services.friday)
                    serviceListString += "Friday, ";
                if(json[0].services.saturday)
                    serviceListString += "Saturday, ";
                if(json[0].services.sunday)
                    serviceListString += "Sunday, ";
                serviceListString +="</label>";
                serviceList.append(serviceListString);
            
                for(var i = 0; i < routeStops.length; i++){
                    var stopPos = new google.maps.LatLng(routeStops[i].stops.lat, routeStops[i].stops.lon);
                    var stopName = routeStops[i].stops.name;
                    var marker = new google.maps.Marker({
                       position: stopPos,
                       label: (i+1).toString(),
                       title: stopName,
                       map: map
                    });
                    
                    var infoWindowContent = "<div>" + marker.title + "</div>";
                    var infoWindow = new google.maps.InfoWindow();
                    createInfoWindow(infoWindow, marker, infoWindowContent);

                    markers.push(marker);
                    infoWindows.push(infoWindow);
                    
                    if(i === 0){
                        vehicleOrigin = new google.maps.LatLng(routeStops[i].stops.lat, routeStops[i].stops.lon);
                        vehicleMarker = new google.maps.Marker({
                            position: vehicleOrigin,
                            map: map,
                            icon: 'https://s17.postimg.org/ltgi31vgf/bus_pin_maker.png'
                        });
                    }
                    
                    startSimulation(1);
                  
                    var htmlString = "<div class=\"uk-margin\" stop_id=\"" + routeStops[i].stops.stop_id + "\" ><button class=\"btnRouteStop uk-button uk-width-medium-1-1\" " +
                        "style=\"border: 1px solid rgba(0,0,0,0.2); border-bottom-color: rgba(0,0,0,0.3); border-radius: 4px; font-weight: bold; position: relative\">" +
                        "<div class=\"uk-badge uk-badge-notification uk-badge-danger\" style=\"position:absolute; top:50%; transform: translateY(-50%); left:1%\">" + (i+1) + "</div>" + routeStops[i].stops.name + "</button></div>";
                    stopsList.append(htmlString);
                }
  
            });
        document.getElementById("btnRouteSelect").innerHTML = "<b>TU1A </b><i class=\"uk-icon-caret-down\">";
        return false;
    };
    
    var plot_TU1C = function(){
        
        stopSimulation();
        clearMap();
        $.getJSON("https://fyp-postgrest.herokuapp.com/routes?route_id=eq.2",
            function(json){  
                var decodedPath = google.maps.geometry.encoding.decodePath(json[0].gmap_line);
                
                var line = new google.maps.Polyline({
                    path: decodedPath,
                    strokeColor: json[0].gmap_line_color,
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                line.setMap(map);
                polylines.push(line);
                
                map.setZoom(json[0].gmap_zoom_level);  
                map.setCenter(new google.maps.LatLng(json[0].gmap_center_lat, json[0].gmap_center_lon));
            });
            
        $.getJSON("https://fyp-postgrest.herokuapp.com/routes?route_id=eq.2&select=*,services{*},routes_stops{stops{*}}&routes_stops.order=sequence.asc",
            function(json){
                document.getElementById("stopsList").innerHTML = "";
                document.getElementById("serviceList").innerHTML = "";
                var stopsList = $("#stopsList");
                var serviceList = $("#serviceList");
                var routeStops = json[0].routes_stops;
          
                stopsList.append("<h2 style=\"color:#b71c1c\">Bus Stops for " + json[0].name + "</h2>");
          
                var serviceListString = "Service Days: <label style=\"color:#444; font-weight:bold; display:inline\">";
                if(json[0].services.monday)
                    serviceListString += "Monday, ";
                if(json[0].services.tuesday)
                    serviceListString += "Tuesday, ";
                if(json[0].services.wednesday)
                    serviceListString += "Wednesday, ";
                if(json[0].services.thursday)
                    serviceListString += "Thursday, ";
                if(json[0].services.friday)
                    serviceListString += "Friday, ";
                if(json[0].services.saturday)
                    serviceListString += "Saturday, ";
                if(json[0].services.sunday)
                    serviceListString += "Sunday, ";
                serviceListString +="</label>";
                serviceList.append(serviceListString);
          
                for(var i = 0; i < routeStops.length; i++){
                    var stopPos = new google.maps.LatLng(routeStops[i].stops.lat, routeStops[i].stops.lon);
                    var stopName = routeStops[i].stops.name;
                    var marker = new google.maps.Marker({
                       position: stopPos,
                       label: (i+1).toString(),
                       title: stopName,
                       map: map
                    });
                  
                    var infoWindowContent = "<div>" + marker.title + "</div>";
                    var infoWindow = new google.maps.InfoWindow();
                    createInfoWindow(infoWindow, marker, infoWindowContent);
                  
                    markers.push(marker);
                    infoWindows.push(infoWindow);
                  
                    if(i === 0){
                        vehicleOrigin = new google.maps.LatLng(routeStops[i].stops.lat, routeStops[i].stops.lon);
                        vehicleMarker = new google.maps.Marker({
                            position: vehicleOrigin,
                            map: map,
                            icon: 'https://s17.postimg.org/ltgi31vgf/bus_pin_maker.png'
                        });
                    }
                    
                    startSimulation(2);
                  
                    var htmlString = "<div class=\"uk-margin\" stop_id=\"" + routeStops[i].stops.stop_id + "\" ><button class=\"btnRouteStop uk-button uk-width-medium-1-1\" " +
                        "style=\"border: 1px solid rgba(0,0,0,0.2); border-bottom-color: rgba(0,0,0,0.3); border-radius: 4px; font-weight: bold; position: relative\">" +
                        "<div class=\"uk-badge uk-badge-notification uk-badge-danger\" style=\"position:absolute; top:50%; transform: translateY(-50%); left:1%\">" + (i+1) + "</div>" + routeStops[i].stops.name + "</button></div>";
                    stopsList.append(htmlString);
                }
          
            });
        document.getElementById("btnRouteSelect").innerHTML = "<b>TU1C </b><i class=\"uk-icon-caret-down\">";
        return false;
    };
    


    $('#TU1A').click(plot_TU1A);
    $('#TU1C').click(plot_TU1C);
});

$(document).on('click', '.btnRouteStop', function(){
    $.getJSON("https://fyp-postgrest.herokuapp.com/stops?stop_id=eq." + $(this).closest(".uk-margin").attr("stop_id"),
        function(json){
            document.getElementById("stopDetails").innerHTML = "";
            var stopDetails = $("#stopDetails");
            
            stopDetails.append("<div class=\"uk-panel uk-panel-box\">" +
                                  "<div class=\"uk-panel-teaser\">" +
                                      "<img src=\"" + json[0].imgurl + "\" alt=\"routeStopImg\">" +
                                  "</div>" +
                                  "<p>" + json[0].name + "</p>" +
                               "</div>");
        });
});



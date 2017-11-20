// var GDIRECTION_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';
// var GDIRECTION_API_KEY = 'AIzaSyDD94qqz0X7KJwghQKyhU8zt6eMryL9q7o';

var API_URL = "https://fyp-postgrest.herokuapp.com/simulation"

function parseTimeStr(timeStr){
  var d = new Date();
  var time = timeStr.split(':');
  d.setHours(parseInt(time[0]));
  d.setMinutes(parseInt(time[1]));
  d.setSeconds(parseInt(time[2]));
  
  return d;
}

function toStrParams(params){
  var str = '?';
  for(var key in params){
    var paramStr = key + '=' + params[key]+'&'
    str += paramStr;
  }
  
  return str.substring(0,str.length-1);
}

function toTimeStr(now){
  return now.getHours() +":" + now.getMinutes() + ":00";
}

// function getCurrentTrip(now,trips){
//   for(var i = 0;i<trips.length;i++){
//     var startTime = parseTimeStr(trips[i].start_time).getTime();
//     var endTime = parseTimeStr(trips[i].end_time).getTime();
//     var currTime = now.getTime();
    
//     if((currTime >=  startTime) && (currTime <= endTime)){
//       return trips[i];
//     }
//   }
  
//   return -1;
// }

// function interpolate(stops,trips,xhr,stopOverDuration){
//     console.log("interpolate");
//     var now = new Date();
//     var currTrip = getCurrentTrip(now,trips);
//     if(currTrip === -1){
//       return;
//     }
    
//     console.log("run leh");
  
//     var triggerTime = parseTimeStr(currTrip.start_time);
  
//     for(var i = 0; i < stops.length-1 ; i++){
//       var nextStop = stops[i+1].name;
//       var params = "?origin="+stops[i].lat+","+stops[i].lon +
//           "&destination="+stops[i+1].lat+","+stops[i+1].lon +
//           "&key="+GDIRECTION_API_KEY;
//       xhr.open("GET",GDIRECTION_API_URL + params,false);
//       xhr.send();
      
//       if(xhr.status === 200){
//         data = JSON.parse(xhr.responseText);
//         console.log(data);
//         routes = data.routes;
//         legs = routes[0].legs;
//         legDuration = legs[0].duration.value;
//         steps = legs[0].steps;
    
//         for(var j = 0; j <steps.length ; j++){
//           durationInSecs = steps[j].duration.value;
//           endLoc = steps[j].end_location;
//           etaInMin = (legDuration - durationInSecs)/60;
//           triggerTime.setSeconds(triggerTime.getSeconds() + durationInSecs);
//           if((now.getHours() === triggerTime.getHours()) && ((now.getMinutes() === triggerTime.getMinutes()))){
//             self.postMessage([endLoc.lat,endLoc.lng,etaInMin,nextStop]);
//             break;
//           }
//         }
        
//         for(var k = 0; k <stopOverDuration;i++){
//           triggerTime.setSeconds(triggerTime.getSeconds() + 60);
//           if((now.getHours() === triggerTime.getHours()) && ((now.getMinutes() === triggerTime.getMinutes()))){
//             self.postMessage([nextStop.lat,nextStop.lon,0,nextStop]);
//             break;
//           }
//         }
//       }
//     }
// }

onmessage = function(e){
//   json = JSON.parse(e.data);
//   var stops = json[0].stops;
//   var trips = json[0].trips;
//   var xhr = new XMLHttpRequest();
//   console.log(json);
//   for(var i = 0; i<trip.length ;i++){
//       console.log(trip[i].start_time); 
//   }
//   setInterval(interpolate(stops,trips,xhr,5),30000);
  var json = JSON.parse(e.data);
  var xhr = new XMLHttpRequest();
  var payload = {'route_id': 'eq.' + json.route_id,
                'order': 'trigger_time.asc',
                'trigger_time': 'eq.'+toTimeStr(new Date())};
  xhr.open("GET", API_URL+toStrParams(payload), true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var result = JSON.parse(xhr.responseText);
        console.log(result);
        if(result.length !== 0){
          postMessage(JSON.stringify(result[result.length-1]));
        }else{
          postMessage(null);
        }
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}
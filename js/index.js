var app = angular.module("weather", []);

app.controller("MainController", MainController);
app.service("WeatherService", WeatherService);
app.service("LocationService", LocationService);
app.constant("appid", "xxxxxx");
app.constant("WeatherURI", "//api.openweathermap.org");
app.constant("IpURI", "//ipinfo.io/json");
app.filter("UnitFilter", UnitFilter);
app.filter("TitleCase", TitleCase);

MainController.$inject=["WeatherService","LocationService"];

function MainController(WeatherService, LocationService) {
  var ctrl = this;

  ctrl.celsius = true;

  ctrl.mainClass = "";
  ctrl.wind = "";

  LocationService.getLocation().then(function(data){
    //console.log(data);
    ctrl.position = data;

    getWeather();

  }, function(error){
    console.log("Unable to determine location, using Silicon Valley, US");
    console.log(error);
    ctrl.position = {
      latitude: 37.3875,
      longitude: -122.0575
    };
  });

  ctrl.toggleUnits = function() {
    ctrl.celsius = ctrl.celsius ? false : true;
  }

  function getWeather() {

    WeatherService.getWeather(ctrl.position).then(function(weather){

        console.log(weather.data);
        ctrl.weather = weather.data;

        setWeather();

      }).catch(function(error){
        console.log(error);
      });
    }

  function setWeather() {

    switch(ctrl.weather.weather[0].icon) {
      case "01d":
      case "02d":
        ctrl.mainClass = 'wi-day-sunny';
        break;
      case "03d":
      case "04d":
        ctrl.mainClass = 'wi-day-cloudy';
        break;
      case "09d":
        ctrl.mainClass = 'wi-day-showers';
        break;
      case "10d":
        ctrl.mainClass = 'wi-day-rain';
        break;
      case "11d":
        ctrl.mainClass = 'wi-day-thunderstorm';
        break;
      case "13d":
        ctrl.mainClass = 'wi-day-snow';
        break;
      case "01n":
      case "02n":
        ctrl.mainClass = 'wi-night-clear';
        break;
      case "03n":
      case "04n":
        ctrl.mainClass = 'wi-night-cloudy';
        break;
      case "09n":
        ctrl.mainClass = 'wi-night-alt-showers';
        break;
      case "10n":
        ctrl.mainClass = 'wi-night-alt-rain';
        break;
      case "11n":
        ctrl.mainClass = 'wi-night-alt-thunderstorm';
        break;
      case "13n":
        ctrl.mainClass = 'wi-night-alt-snow';
        break;
      case "50d":
        ctrl.mainClass = 'wi-day-haze';
        break;
      case "50n":
        ctrl.mainClass = 'wi-night-fog';
        break;
    }

    setWind();
  }
  function setWind() {
    ctrl.wind = "from-"+ctrl.weather.wind.deg+"-deg";

  }
}

WeatherService.$inject = ["$http", "WeatherURI","appid"];

function WeatherService($http, WeatherURI, appid) {
  var service = this;

  service.getWeather = function(loc) {

    var query = {
      method: "GET",
      url: WeatherURI + "/data/2.5/weather",
      params: {
        lat: loc.latitude,
        lon: loc.longitude,
        appid: appid
      }
    };

    return $http(query);
  };

}

LocationService.$inject = ["$http", "IpURI", "$q"];

function LocationService($http, IpURI, $q) {
  var service = this;

  service.getLocation = function() {
    return $q(function(resolve,reject){
      $http.get(IpURI).then(function(data){
        var location = processData(data.data);
        resolve(location);
      }, function(error){
        reject(error);
      });

    });
  };

  function processData(data) {
    var loc = data.loc.split(",");
    return {
      latitude: parseFloat(loc[0]),
      longitude: parseFloat(loc[1])
    };
  }

}

function UnitFilter() {
  return function(text,celsius) {
    if(celsius) {
      return Math.round(parseFloat(text) - 273.15,2);
    } else {
      return Math.round(parseFloat(text) * 9 / 5 - 459.67,2);
    }
  }
}

function TitleCase() {
  return function(text) {

    if (text == null) return text;
    if (text == undefined) return text;
    if (text == "") return text;

    var arr = text.split(" ");

    for(var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1,arr[i].length);
    }
    return arr.join(" ");
  }
}

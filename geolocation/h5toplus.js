/**
 * 5+定位替换浏览器定位，务必保证此JS在调用定位之前执行 
 */
(function() {
	if(!navigator.userAgent.match(/Html5Plus/i)) {
		//非5+引擎环境，直接return;
		return;
	}
	window.__geo__ = {};
	var g = __geo__;
	g.callbacks = {};
	g.callbackId = function(success, error) {
		var id = "dlgeolocation" + new Date().valueOf();
		g.callbacks[id] = {
			s: success,
			e: error
		};
		return id;
	};

	g.callbackFromNative = function(callbackId, playload) {
		var fun = g.callbacks[callbackId];
		if(fun) {
			if(playload.status == 1) {
				if(fun.s) {
					var p = playload.message;
					var longitude = p.longitude;
					var latitude = p.latitude;
					if(p.coordsType === "gcj02") {
						var wgs = gcj02towgs84(p.longitude, p.latitude);
						longitude = wgs[0];
						latitude = wgs[1];
					}
					var pos = new Position({
							latitude: latitude,
							longitude: longitude,
							altitude: p.altitude,
							accuracy: p.accuracy,
							heading: p.heading,
							velocity: p.velocity,
							coordsType: 'WGS84',
							address: p.address,
							addresses: p.addresses,
							altitudeAccuracy: p.altitudeAccuracy
						},
						(p.timestamp === undefined ? new Date().getTime() : ((p.timestamp instanceof Date) ? p.timestamp.getTime() : p.timestamp))
					);
					fun.s(pos)
				}
			} else {
				if(fun.e) fun.e(playload.message)
			}
			if(!playload.keepCallback) {
				delete g.callbacks[callbackId]
			}
		}
	};

	navigator.geolocation.getCurrentPosition = function(success, error, options) {
		var curSuccess = success;
		var curError = error || function() {};
		var curOptions = options || {};
		var opt = JSON.stringify(curOptions);
		_dlGeolocation.exec("getCurrentPosition", g.callbackId(function(args) {
			console.log('success:', args)
			curSuccess(args);
		}, function(args) {
			console.log('error:', args)
			curError(args);
		}), opt);
	};

	navigator.geolocation.watchPosition = function(success, error, options) {
		var curSuccess = success;
		var curError = error || function() {};
		var curOptions = options || {};
		var opt = JSON.stringify(curOptions);
		opt.id = "dlwatchPosition" + new Date().valueOf();
		_dlGeolocation.exec("watchPosition", g.callbackId(curSuccess, curError), opt);
	};

	navigator.geolocation.clearwatch = function(watchId) {
		_dlGeolocation.exec("clearwatch", null, {
			id: watchId
		});
	};

	function Position(coords, timestamp) {
		if(coords) {
			this.coordsType = coords.coordsType;
			this.address = coords.address;
			this.addresses = coords.addresses;
			this.coords = new Coordinates(coords.latitude, coords.longitude, coords.altitude, coords.accuracy, coords.heading, coords.velocity, coords.altitudeAccuracy);
		} else {
			this.coords = new Coordinates();
		}
		this.timestamp = (timestamp !== undefined) ? timestamp : new Date().getTime()
	};

	function Coordinates(lat, lng, alt, acc, head, vel, altacc) {
		this.latitude = lat;
		this.longitude = lng;
		this.accuracy = (acc !== undefined ? acc : null);
		this.altitude = (alt !== undefined ? alt : null);
		this.heading = (head !== undefined ? head : null);
		this.speed = (vel !== undefined ? vel : null);
		if(this.speed === 0 || this.speed === null) {
			this.heading = NaN;
		}
		this.altitudeAccuracy = (altacc !== undefined) ? altacc : null;
	};

	var PI = 3.1415926535897932384626;
	var a = 6378245.0;
	var ee = 0.00669342162296594323;

	function gcj02towgs84(lng, lat) {
		if(out_of_china(lng, lat)) {
			return [lng, lat]
		} else {
			var dlat = transformlat(lng - 105.0, lat - 35.0);
			var dlng = transformlng(lng - 105.0, lat - 35.0);
			var radlat = lat / 180.0 * PI;
			var magic = Math.sin(radlat);
			magic = 1 - ee * magic * magic;
			var sqrtmagic = Math.sqrt(magic);
			dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
			dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
			mglat = lat + dlat;
			mglng = lng + dlng;
			return [lng * 2 - mglng, lat * 2 - mglat]
		}
	}

	function transformlat(lng, lat) {
		var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
		ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
		ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
		return ret
	}

	function transformlng(lng, lat) {
		var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
		ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
		ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
		return ret
	}

	function out_of_china(lng, lat) {
		return(lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
	}

})();

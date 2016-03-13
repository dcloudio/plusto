/**
 * 5+定位替换浏览器定位，务必保证此JS在调用定位之前执行 
 */
(function(){
	var plusReady = function(callback){
		if (window.plus) {
			setTimeout(function() {
				callback();
			}, 0);
		} else {
			document.addEventListener("plusready", function() {
				callback();
			}, false);
		}
	}

	if (navigator.userAgent.match(/Html5Plus/i)) {
		navigator.geolocation.clearWatch = function(watchId) {
			plusReady(function() {
				plus.geolocation.clearWatch(watchId);
			});
		};
		navigator.geolocation.getCurrentPosition = function(successCB, errorCB, option) {
			plusReady(function() {
				plus.geolocation.getCurrentPosition(successCB, function(error) {
					(errorCallback && errorCallback(error, errorCB)) || (errorCB && errorCB(error));
				}, option);
			});
		};
		navigator.geolocation.watchPosition = function(successCB, errorCB, option) {
			plusReady(function() {
				plus.geolocation.watchPosition(successCB, errorCB, option);
			});
		};
	}
})();

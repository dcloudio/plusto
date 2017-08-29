/**
 * 浏览器定位替换5+原生定位，用于将5+代码直接在浏览器中运行时
 */
(function(){

	if (!navigator.userAgent.match(/Html5Plus/i)) {
		plus.geolocation.clearWatch = function(watchId) {
				navigator.geolocation.clearWatch(watchId);
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

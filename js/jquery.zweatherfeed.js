/**
 * Plugin: jquery.zWeatherFeed
 * 
 * Version: 1.3.1
 * (c) Copyright 2011-2015, Zazar Ltd
 * 
 * Description: jQuery plugin for display of Yahoo! Weather feeds
 * 
 * History:
 * 1.3.1 - Forecast day option and background image code fix (credit to Romiko)
 * 1.3.0 - Added refresh timer
 * 1.2.1 - Handle invalid locations
 * 1.2.0 - Added forecast data option
 * 1.1.0 - Added user callback function
 *         New option to use WOEID identifiers
 *         New day/night CSS class for feed items
 *         Updated full forecast link to feed link location
 * 1.0.3 - Changed full forecast link to Weather Channel due to invalid Yahoo! link
	   Add 'linktarget' option for forecast link
 * 1.0.2 - Correction to options / link
 * 1.0.1 - Added hourly caching to YQL to avoid rate limits
 *         Uses Weather Channel location ID and not Yahoo WOEID
 *         Displays day or night background images
 **/

(function($){

	$.fn.weatherfeed = function(locations, options, fn) {	
	
		// Set plugin defaults
		var defaults = {
			unit: 'c',
			image: true,
			country: false,
			highlow: true,
			wind: true,
			humidity: false,
			visibility: false,
			sunrise: false,
			sunset: false,
			forecast: true,
			forecastdays: 5,
			link: true,
			showerror: true,
			linktarget: '_self',
			woeid: false,
			refresh: 0
		};  
		var options = $.extend(defaults, options); 
		var row = 'odd';

		// Functions
		return this.each(function(i, e) {
			var $e = $(e);
			
			// Add feed class to user div
			if (!$e.hasClass('weatherFeed')) $e.addClass('weatherFeed');

			// Check and append locations
			if (!$.isArray(locations)) return false;

			var count = locations.length;
			if (count > 10) count = 10;

			var locationid = '';

			for (var i=0; i<count; i++) {
				if (locationid != '') locationid += ',';
				locationid += "'"+ locations[i] + "'";
			}

			// Cache results for an hour to prevent overuse
			now = new Date();

			// Select location ID type
			var queryType = options.woeid ? 'woeid' : 'location';
					
			// Create Yahoo Weather feed API address
			var query = "select * from weather.forecast where "+ queryType +" in ("+ locationid +") and u='"+ options.unit +"'";
			var api = 'http://query.yahooapis.com/v1/public/yql?q='+ encodeURIComponent(query) +'&rnd='+ now.getFullYear() + now.getMonth() + now.getDay() + now.getHours() +'&format=json&callback=?';

			// Request feed data
			sendRequest(query, api, options);

			if (options.refresh > 0) {

				// Set timer interval for scrolling		
				var interval = setInterval(function(){ sendRequest(query, api, options); }, options.refresh * 60000);
			}

			// Function to gather new weather data
			function sendRequest(query, api, options) {

				// Reset odd and even classes
				row = 'odd';

				// Clear user div
				$e.html('');

				$.ajax({
					type: 'GET',
					url: api,
					dataType: 'json',
					success: function(data) {

						if (data.query) {
			
							if (data.query.results.channel.length > 0 ) {
							
								// Multiple locations
								var result = data.query.results.channel.length;
								for (var i=0; i<result; i++) {
							
									// Create weather feed item
									_process(e, data.query.results.channel[i], options);
								}
							} else {
	
								// Single location only
								_process(e, data.query.results.channel, options);
							}

							// Optional user callback function
							if ($.isFunction(fn)) fn.call(this,$e);

						} else {
							if (options.showerror) $e.html('<p>Weather information unavailable</p>');
						}
					},
					error: function(data) {
						if (options.showerror) $e.html('<p>Weather request failed</p>');
					}
				});				
			};
		
			// Function to each feed item
			var _process = function(e, feed, options) {
				var $e = $(e);

				// Check for invalid location
				if (feed.description != 'Yahoo! Weather Error') {

					// Format feed items
					var wd = feed.wind.direction;
					if (wd>=348.75&&wd<=360){wd="N"};if(wd>=0&&wd<11.25){wd="N"};if(wd>=11.25&&wd<33.75){wd="NNE"};if(wd>=33.75&&wd<56.25){wd="NE"};if(wd>=56.25&&wd<78.75){wd="ENE"};if(wd>=78.75&&wd<101.25){wd="E"};if(wd>=101.25&&wd<123.75){wd="ESE"};if(wd>=123.75&&wd<146.25){wd="SE"};if(wd>=146.25&&wd<168.75){wd="SSE"};if(wd>=168.75&&wd<191.25){wd="S"};if(wd>=191.25 && wd<213.75){wd="SSW"};if(wd>=213.75&&wd<236.25){wd="SW"};if(wd>=236.25&&wd<258.75){wd="WSW"};if(wd>=258.75 && wd<281.25){wd="W"};if(wd>=281.25&&wd<303.75){wd="WNW"};if(wd>=303.75&&wd<326.25){wd="NW"};if(wd>=326.25&&wd<348.75){wd="NNW"};
					var wf = feed.item.forecast[0];
		
					// Determine day or night image
					wpd = feed.item.pubDate;
					n = wpd.indexOf(":");
					tpb = _getTimeAsDate(wpd.substr(n-2,8));
					tsr = _getTimeAsDate(feed.astronomy.sunrise);
					tss = _getTimeAsDate(feed.astronomy.sunset);

					// Get night or day
					if (tpb>tsr && tpb<tss) { daynight = 'day'; } else { daynight = 'night'; }

					// Add item container
					var html = '<div class="col-xs-8 col-xs-offset-2 col-sm-4 col-sm-offset-0 well">';
					//if (options.image) html += ' style="background-image: url(http://l.yimg.com/a/i/us/nws/weather/gr/'+ feed.item.condition.code.substring(0,2) + daynight.substring(0,1) +'.png); background-repeat: no-repeat;"';
					
					html += '<div class="col-xs-6 text-right"><div class="wi wi-yahoo-' + feed.item.condition.code.substring(0,2) +' current-weather"></div></div>';
					
					// Add item data
					//html += '<div class="weatherCity">'+ feed.location.city +'</div>';
					if (options.country) html += '<div class="weatherCountry">'+ feed.location.country +'</div>';
					html += '<div class="col-xs-6"><div class="weatherTemp" style="color:#999;">現在溫度</div><div style="font-size:4em; color:#0080c9;">'+ feed.item.condition.temp +'&deg;</div>';
					//html += '<div class="weatherDesc">'+ feed.item.condition.text +'</div>';
				
					// Add optional data
					//if (options.highlow) html += '<div class="weatherRange">High: '+ wf.high +'&deg; Low: '+ wf.low +'&deg;</div>';
					if (options.highlow) html += '<div class="weatherRange" style="color:#999;">'+ wf.low +'&deg;~' + wf.high +'&deg;'+'</div>';
					
					if (options.wind) html += '<div class="weatherWind" style="color:#999;">風向: '+ wd +' '+ feed.wind.speed + feed.units.speed +'</div>';
					if (options.humidity) html += '<div class="weatherHumidity">Humidity: '+ feed.atmosphere.humidity +'</div>';
					if (options.visibility) html += '<div class="weatherVisibility">Visibility: '+ feed.atmosphere.visibility +'</div>';
					if (options.sunrise) html += '<div class="weatherSunrise">Sunrise: '+ feed.astronomy.sunrise +'</div>';
					if (options.sunset) html += '<div class="weatherSunset">Sunset: '+ feed.astronomy.sunset +'</div>';
					
					if (options.link) html += '<div class="weatherLink"><a href="https://weather.yahoo.com/taiwan/taipei-city/taipei-city-2306211/" target="_blank" title="Read full forecast - Yahoo Weather">詳細天氣預報</a></div>';
										
					html += '</div></div><div class="text-center col-xs-8 col-xs-offset-2 col-sm-8 col-sm-offset-0" style="padding-top:30px;">';
						
					// Add item forecast data
					if (options.forecast) {

						//html += '<div class="weatherForecast">';

						var wfi = feed.item.forecast;
						var wfid = options.forecastdays;
						if (wfid > wfi.length) wfid = wfi.length;

						for (var i=0; i < wfid; i++) {
							
							html += '<div class="col-xs-4 col-md-2" style="line-height:2.5;">';
							html += '<div class="weatherForecastDay">'+ wfi[i].day +'</div>';
							html += '<div class="wi wi-yahoo-' + wfi[i].code +'" style="font-size:3em; margin:5px 0;"></div>';
							html += '<div class="weatherForecastRange">'+ wfi[i].low +'&deg;-'+ wfi[i].high +'&deg;</div>';
							//html += '<div class="weatherForecastDate">'+ wfi[i].date +'</div>';
							//html += '<div class="weatherForecastText">'+ wfi[i].text +'</div>';
							html += '</div>'
						}

						html += '</div>'
					}



				} else {
					var html = '<div class="weatherItem '+ row +'">';
					html += '<div class="weatherError">City not found</div>';
				}

				// Alternate row classes
				if (row == 'odd') { row = 'even'; } else { row = 'odd';	}

				// Apply new weather content
				$e.append(html);
			};

			// Get time string as date
			var _getTimeAsDate = function(t) {
		
				d = new Date();
				r = new Date(d.toDateString() +' '+ t);

				return r;
			};

		});
	};

})(jQuery);

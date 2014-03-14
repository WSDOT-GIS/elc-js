/*jslint devel: true, browser: true, white: true */
/*globals jQuery, test, equal, module, start, ok, asyncTest, window, elc */

/**
* Make a copy of this file called unittest.js and modify the URLs to match those of the web service you will be testing with.
*/

(function ($) {
	"use strict";
	
	var routeLocator;
	routeLocator = new elc.RouteLocator("http://www.wsdot.wa.gov/geoservices/ArcGIS/rest/services/Shared/ElcRestSOE/MapServer/exts/ElcRestSoe");
	
	function onDocumentReady() {
		var clientSupportsCors = $.support.cors, messageList, testCount = 0;

		function writeMessage(message, level) {
			var li = $("<li>").html(message).appendTo(messageList);
			if (level) {
				if (/warn/i.test(level)) {
					li.addClass("warning");
				} else if (/error/i.test(level)) {
					li.addClass("error");
				}
			}
		}

		////function isNullOrEmpty(input, message) {
		////	var t = typeof(input);
		////	ok(t === "undefined" || input === null || t === "string" && input.length === 0, message);
		////}

		////function testResponseForError(data, message) {
		////	if (typeof(message) === "undefined" || message === null) {
		////		message = "Response should not have an \"error\" property.";
		////	}
		////	ok(data !== null && typeof(data.error) === "undefined", message);
		////}

		/**
		 * Starts the QUnit tests for the ELC REST SOE.
		 * @param {Boolean} useCors Specifies whether queries to the server will be "json" (true) or "jsonp" (false).
		 */
		function performTests(useCors) {
			module("Find Route Locations operation");
			
			(function (testCount) {
				asyncTest("Find Route Locaitons, minimum required parameters specified.", function () {
					var rl, dateString, params;
					dateString = "12/31/2011";
					
					rl = new elc.RouteLocation({
						Route: "005",
						Arm: 0,
						ReferenceDate: new Date(dateString)
					});
					
					params = {
						useCors: useCors,
						locations: [rl],
						successHandler: function (data) {
							console.log(testCount, {input: [rl], output: data});
							ok(true, "Success");
							start();
						},
						errorHandler: function (error) {
							console.log(testCount, {input: [rl], error: error});
							ok(false, error.error);
							start();
						}
					};
					
					routeLocator.findRouteLocations(params);
				});
			}(testCount));
			
			testCount += 1;

			(function (testCount) {
				asyncTest("Find Route Locaitons, global reference date specified.", function () {
					var rl, dateString, params;
					dateString = "12/31/2011";

					rl = new elc.RouteLocation({
						Route: "005",
						Arm: 0
					});

					params = {
						useCors: useCors,
						locations: [rl],
						referenceDate: dateString,
						successHandler: function (data) {
							console.log(testCount, { input: [rl], output: data });
							ok(true, "Success");
							start();
						},
						errorHandler: function (error) {
							console.log(testCount, { input: [rl], error: error });
							ok(false, error.error);
							start();
						}
					};

					routeLocator.findRouteLocations(params);
				});
			}(testCount));

			testCount += 1;
			
			module("Find Nearest Route Locations operation");
			
			(function (testId) {
				asyncTest("Find Nearest Route Locations test", function () {
					var params;
					
					params = {
						useCors: useCors,
						coordinates: [1083893.182, 111526.885],
						referenceDate: new Date("12/31/2011"),
						searchRadius: 1,
						inSR: 2927,
						successHandler: function (data) {
							console.log(testId, {input: params, output: data});
							ok(true, "Success");
							start();
						},
						errorHandler: function (error) {
							console.error(testId, error);
							ok(false, error);
							start();
						}
					};
					
					routeLocator.findNearestRouteLocations(params);
				});
			}(testCount));
			
			testCount += 1;
			
			module("Get \"routes\" resource");
			
			(function (testId) {
				asyncTest("Get \"routes\" test", function () {
					routeLocator.getRouteList(function (routeList) {
						console.log(testId, routeList);
						ok(true, "Route list retrieved");
						start();
					}, function (error) {
						console.error(testId, error);
						ok(false, error);
						start();
					}, useCors);
				});
			}(testCount));
		}

		/**
		 * Attempts to query mapServerUrl using CORS. 
		 * @param {Function} testCompleteHandler A function that takes a single boolean argument.  True will be passed to this method if the server supports CORS, false will be passed in otherwise.
		 */
		function testServerForCorsSupport(testCompleteHandler) {
			var progress;
			if (clientSupportsCors) {
				// If the client supports CORS, we'll send a query to the ArcGIS Server to see if it does as well.
				// We will not do anything with the returned data; we just want to know if the query was successful or not.
				
				progress = $("<div id='corsTestProgress'>").text("Testing map server for CORS support...").appendTo("body");
				$("<progress>").appendTo(progress);
				try {
					$.ajax({
						type: "HEAD", 
						url: /(.+)\/exts\/ElcRestSoe\/?/.exec(routeLocator.url)[1],
						data: {
							f: "json"
						},
						cache: true,
						dataType: "json",
						success: function (/*data, textStatus, jqXHR*/) {
							progress.remove();
							// The server supports CORS.
							writeMessage("<a href='" + routeLocator.url + "'>Map server</a>" + " supports CORS.");
							if (typeof(testCompleteHandler) === "function") {
								testCompleteHandler(true);
							}
						},
						error: function (/*jqXHR, textStatus, errorThrown*/) {
							progress.remove();
							// The server does not support CORS.
							writeMessage("<a href='" + routeLocator.url + "'>Map Server</a>" + " does not support CORS.");
							if (typeof(testCompleteHandler) === "function") {
								testCompleteHandler(false);
							}
						}
					});
				} catch (err) {
					progress.remove();
					// The server does not support CORS.
					console.error(err);
					writeMessage("<a href='" + routeLocator.url + "'>Map Server</a>" + " does not support CORS.");
					if (typeof(testCompleteHandler) === "function") {
						testCompleteHandler(false);
					}
				}
			} else {
				// If the browser does not support CORS, then we don't care if the server supports it, since we can't use it anyway.
				if (typeof(testCompleteHandler) === "function") {
					testCompleteHandler(false);
				}
			}
		}

		$("<p>Note: Query inputs and outputs appear in the browser's console window (usually accessed by pressing F12).</p>").appendTo("body");
		messageList = $("<ul id='messageList'>").appendTo("body");

		// Create a dummy console variable if the browser does not support it. (I.e., IE versions < 9).
		// JSLint will complain about the "redefinition of console", but we are only giving it a value if it is not already defined.
		if (typeof(window.console) === "undefined") {
			window.console = {
				log: function () {},
				warn: function () {},
				error: function () {}
			};
		}

		if (!clientSupportsCors) {
			writeMessage("This browser does not support <a href='http://enable-cors.org/'><abbr title='Cross-Origin Resource Sharing'>CORS</abbr></a>.  All requests will be sent via JSONP method.", "warning");
		} else {
			writeMessage("Good, this browser supports <a href='http://enable-cors.org/'><abbr title='Cross-Origin Resource Sharing'>CORS</abbr></a>!  If the server also supports CORS, requests will be sent as JSON instead of JSONP.");
		}
		
		// Perform client-only tests.
		testCount = 1;
		module("flatten array");
		
		test("flattenArray test", function () {
			var flattened, array = [
				[1, 2],
				[3, 4]
			];
			flattened = elc.flattenArray(array);
			
			equal(flattened.length, 4, "flattened array should have four elements.");
		});
		
		testCount += 1;
		
		test("flattenArray on array that doesn't need it", function () {
			var input = [1, 2, 3, 4], output = elc.flattenArray(input);
			
			equal(input.length, output.length, "input and output arrays should have the same number of elements.");
			ok(input[0] === output[0] && input[1] === output[1] && input[2] === output[2] && input[3] === output[3], "Each element in input array should match element at corresponding index in output array.");
			
		});
		
		testCount += 1;
		
		module("RouteLocation class");
		
		test("RouteLocation.toJSON test", function () {
			var rl, json, dateString;
			dateString = "12/31/2011";
			
			rl = new elc.RouteLocation({
				Route: "005",
				Arm: 0,
				ReferenceDate: new Date(dateString)
			});
			
			json = rl.toJSON();
			equal(json.ReferenceDate, dateString, "The reference date in the output object should be \"" + dateString + "\".");
			equal(json.Route, rl.Route, "The \"Route\" properties should be equal.");
			equal(json.Arm, rl.Arm, "The \"Arm\" properties should be equal.");
		});
		
		testCount += 1;

		// Start the test to see if the server supports CORS.  When this test is completed, the QUnit tests will start.
		testServerForCorsSupport(performTests);
	}

	$(document).ready(onDocumentReady);

}(jQuery));	
/*global define*/
define(["dojo/text!./Templates/elc-ui.min.html"], function (templateHtml) {
	function ElcUI(rootNode) {
		var parser = new DOMParser();
		var doc = parser.parseFromString(templateHtml, "text/html");
		var uiDom = doc.body.querySelector(".elc-ui-root").cloneNode(true);
		this.root = rootNode;
		this.root.appendChild(uiDom);
		var findRouteLocationForm = this.root.querySelector(".find-route-location-form");


		// Setup radio button events.
		var changeMPMode = function () {
			var val = this.value;
			var classToRemove, classToAdd;
			if (val === "SRMP") {
				classToRemove = "mp-mode-arm";
				classToAdd = "mp-mode-srmp";
			} else if (val === "ARM") {
				classToRemove = "mp-mode-srmp";
				classToAdd = "mp-mode-arm";
			} else if (val === "point") {
				findRouteLocationForm.endMilepost.removeAttribute("required");
				classToRemove = "geo-mode-line";
				classToAdd = "geo-mode-point";
			} else if (val === "line") {
				findRouteLocationForm.endMilepost.setAttribute("required", "required");
				classToRemove = "geo-mode-point";
				classToAdd = "geo-mode-line";
			}
			findRouteLocationForm.classList.add(classToAdd);
			findRouteLocationForm.classList.remove(classToRemove);
		};

		findRouteLocationForm.onsubmit = function () {

			return false;
		};

		var radioButtons = findRouteLocationForm.querySelectorAll("input[type=radio]");

		var rb;
		for (var i = 0; i < radioButtons.length; i++) {
			rb = radioButtons[i];
			rb.addEventListener("click", changeMPMode);
		}
	}

	return ElcUI;
});
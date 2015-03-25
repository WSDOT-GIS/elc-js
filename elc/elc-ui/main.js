/*global define*/
define(["dojo/text!./Templates/elc-ui.min.html"], function (templateHtml) {
	function ElcUI(rootNode) {
		var self = this;
		var parser = new DOMParser();
		var doc = parser.parseFromString(templateHtml, "text/html");
		var uiDom = doc.body.querySelector(".elc-ui-root").cloneNode(true);
		this.root = rootNode;
		this.root.appendChild(uiDom);

		// Setup nearest route location form
		(function () {
			var form = self.root.querySelector(".find-nearest-route-location-form");
			form.onsubmit = function () {
				var radius = parseFloat(form.radius.value);
				var evt = new CustomEvent('find-nearest-route-location-submit', {
					detail: {
						radius: radius
					}
				});
				self.root.dispatchEvent(evt);

				return false;
			};
		}());

		// Setup route location form.
		(function () {
			var findRouteLocationForm = self.root.querySelector(".find-route-location-form");
			// Default the reference date to today.
			var today = new Date();
			today = today.toISOString().replace(/T.+$/i, '');
			// Use set attribute so that resetting the form returns to this value.
			findRouteLocationForm.referenceDate.setAttribute("value", today);


			// Setup radio button events.
			var changeMPMode = function () {
				//var val = this.value;
				var isSrmp = Boolean(findRouteLocationForm.querySelector("input[value=SRMP]:checked"));
				var isLine = Boolean(findRouteLocationForm.querySelector("input[value=line]:checked"));
				var classList = findRouteLocationForm.classList;

				if (isSrmp) {
					classList.add("mp-mode-srmp");
					classList.remove("mp-mode-arm");
				} else {
					classList.add("mp-mode-arm");
					classList.remove("mp-mode-srmp");
				}

				if (isLine) {
					findRouteLocationForm.endMilepost.setAttribute("required", "required");
					classList.add("geo-mode-line");
					classList.remove("geo-mode-point");
				} else {
					findRouteLocationForm.endMilepost.removeAttribute("required");
					classList.add("geo-mode-point");
					classList.remove("geo-mode-line");
				}
			};

			findRouteLocationForm.route.onblur = function () {
				if (this.value && /^\d{1,2}$/.test(this.value)) {
					if (this.value.length === 1) {
						this.value = "00" + this.value;
					} else if (this.value.length === 2) {
						this.value = "0" + this.value;
					}
				}
			};

			findRouteLocationForm.onsubmit = function () {
				var detail = {
					Route: this.route.value,
					Decrease: this.decrease.checked,
					ReferenceDate: new Date(this.referenceDate.value),
				};

				var isSrmp = Boolean(this.milepostType.value === "SRMP");

				if (!isSrmp) {
					detail.Arm = parseFloat(this.milepost.value);
				} else {
					detail.Srmp = parseFloat(this.milepost.value);
					detail.Back = this.back.checked;
				}

				if (this.geometryType.value === "line") {
					if (!isSrmp) {
						detail.EndArm = parseFloat(this.endMilepost.value);
					} else {
						detail.EndSrmp = parseFloat(this.endMilepost.value);
						detail.EndBack = this.endBack.checked;
					}
				}

				var evt = new CustomEvent('find-route-location-submit', {
					detail: detail
				});
				self.root.dispatchEvent(evt);
				return false;
			};

			var radioButtons = findRouteLocationForm.querySelectorAll("input[type=radio]");

			var rb;
			for (var i = 0; i < radioButtons.length; i++) {
				rb = radioButtons[i];
				rb.addEventListener("click", changeMPMode);
			}
		}());
	}

	return ElcUI;
});
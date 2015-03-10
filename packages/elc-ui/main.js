/*global define*/
define(["dojo/text!./Templates/elc-ui.min.html"], function (templateHtml) {
	function ElcUI(rootNode) {
		var parser = new DOMParser();
		var doc = parser.parseFromString(templateHtml, "text/html");
		var uiDom = doc.body.querySelector(".elc-ui-root").cloneNode(true);
		this.root = rootNode;
		this.root.appendChild(uiDom);
	}

	return ElcUI;
});
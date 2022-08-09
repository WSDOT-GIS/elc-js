import { Route, RouteId } from "wsdot-elc";

export default class RouteSelector {
  // tslint:disable-next-line:variable-name
  private _root: HTMLElement;
  // tslint:disable-next-line:variable-name
  private _routes: Route[] = new Array<Route>();
  private mainlineSelect: HTMLSelectElement;
  private routeSelect: HTMLSelectElement;
  private checkbox: HTMLInputElement;
  public get root(): HTMLElement {
    return this._root;
  }

  public get routes() {
    return this._routes;
  }
  public set routes(routesArray: Route[]) {
    console.debug("set routes", routesArray);
    this._routes = routesArray;
    // Sort the routes by route IDs' SR then RRQ (non numeric comes before numeric).
    this._routes.sort((a, b) => RouteId.sort(a.routeId, b.routeId));

    const srDocFrag = document.createDocumentFragment();

    const isGroup = document.createElement("optgroup");
    isGroup.label = "Interstate Routes";

    const usGroup = document.createElement("optgroup");
    usGroup.label = "US Routes";

    const waGroup = document.createElement("optgroup");
    waGroup.label = "WA State Routes";

    // Populate the SR Select.
    for (const route of routesArray) {
      if (route.name && route.isMainline) {
        const option = document.createElement("option");
        option.label = route.label;
        option.textContent = route.label;
        option.value = route.name;
        option.dataset.isBoth = `${route.isBoth}`;
        const rt = route.routeTypeAbbreviation;
        if (rt) {
          switch (rt) {
            case "IS":
              isGroup.appendChild(option);
              break;
            case "US":
              usGroup.appendChild(option);
              break;
            case "SR":
              waGroup.appendChild(option);
              break;
          }
        } else {
          srDocFrag.appendChild(option);
        }
      }
    }

    if (isGroup.hasChildNodes()) {
      srDocFrag.appendChild(isGroup);
    }
    if (usGroup.hasChildNodes()) {
      srDocFrag.appendChild(usGroup);
    }
    if (waGroup.hasChildNodes()) {
      srDocFrag.appendChild(waGroup);
    }

    this.mainlineSelect.appendChild(srDocFrag);
    this.addOptionsForCurrentlySelectedMainline();
    this.setRouteDirectionControls();

    this.root.classList.add("routes-loaded");
  }

  /**
   * Creates a Route Selector UI control.
   * @param root
   */
  constructor(root: HTMLElement) {
    if (!(root && root instanceof HTMLElement)) {
      throw new TypeError("No root element provided or not an HTML element");
    }
    this._root = root;

    root.classList.add("route-selector");

    const progressBar = document.createElement("progress");
    progressBar.classList.add("route-list-progress");
    progressBar.textContent = "Loading route list...";
    root.appendChild(progressBar);

    this.mainlineSelect = document.createElement("select");
    this.routeSelect = document.createElement("select");
    this.routeSelect.name = "route";
    this.routeSelect.required = true;
    // for bootstrap
    this.mainlineSelect.classList.add("form-control");
    this.routeSelect.classList.add("form-control");

    const cbLabel = document.createElement("label");
    this.checkbox = document.createElement("input");
    this.checkbox.type = "checkbox";
    this.checkbox.name = "decrease";
    cbLabel.appendChild(this.checkbox);
    cbLabel.appendChild(document.createTextNode(" Decrease"));
    cbLabel.classList.add("input-group-addon");

    root.appendChild(this.mainlineSelect);
    root.appendChild(this.routeSelect);
    root.appendChild(cbLabel);

    this.mainlineSelect.addEventListener(
      "change",
      e => this.addOptionsForCurrentlySelectedMainline(),
      true
    );

    this.routeSelect.addEventListener("change", this.setRouteDirectionControls);
  }

  /**
   * Populates the route box with options associated with the currently selected mainline.
   */
  public addOptionsForCurrentlySelectedMainline() {
    const mainline = this.mainlineSelect.value;
    // Remove options.
    this.routeSelect.innerHTML = "";

    const docFrag = document.createDocumentFragment();
    const srRe = /^\d{3}\s/;
    for (const route of this._routes) {
      if (route.routeId.sr === mainline) {
        const option = document.createElement("option");
        option.value = route.name;

        const label = route.isMainline
          ? "Mainline"
          : route.routeId.rrq
            ? [route.routeId.rrt, route.routeId.rrq].join(" ")
            : route.routeId.rrt;
        if (label) {
          option.label = label;
        }
        option.textContent = label;

        let title = route.routeId.description;
        title = title.replace(srRe, "");
        option.title = title;

        option.dataset.isBoth = `${route.isBoth}`;
        docFrag.appendChild(option);
      }
    }

    this.routeSelect.appendChild(docFrag);

    this.routeSelect.disabled = this.routeSelect.options.length === 1;

    this.setRouteDirectionControls();
  }

  public setRouteDirectionControls() {
    const option = this.routeSelect.options[this.routeSelect.selectedIndex];
    if (option.dataset.isBoth === "true") {
      this.checkbox.removeAttribute("disabled");
      this.root.classList.add("direction-both");
    } else {
      this.root.classList.remove("direction-both");
      this.checkbox.setAttribute("disabled", "disabled");
    }
  }
}

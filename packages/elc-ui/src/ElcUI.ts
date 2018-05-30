import { IRouteLocation, Route } from "wsdot-elc";
import RouteSelector from "./RouteSelector";
import templates from "./Templates";

/**
 * Options for the ElcUI constructor.
 */
export interface IElcUIOptions {
  /**
   * Use the Bootstrap template instead of default.
   */
  bootstrap?: boolean;
}

export default class ElcUI {
  public root: HTMLElement;
  public routeSelector: RouteSelector;

  /**
   *
   * @param {HTMLElement} rootNode
   * @param {Object} [options]
   * @param {Boolean} [options.bootstrap=false] - Use the Bootstrap template instead of default.
   */
  constructor(rootNode: HTMLElement, options?: IElcUIOptions) {
    const self = this;
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      options && options.bootstrap ? templates.bootstrap : templates.default,
      "text/html"
    );
    const uiDom = (doc.body.querySelector(".elc-ui-root") as Element).cloneNode(
      true
    ) as HTMLElement;
    this.root = rootNode;
    this.root.innerHTML = uiDom.outerHTML;

    // Setup route selector

    this.routeSelector = new RouteSelector(this.root.querySelector(
      ".route-selector"
    ) as HTMLElement);

    // Setup nearest route location form
    const form = self.root.querySelector(
      ".find-nearest-route-location-form"
    ) as HTMLFormElement;
    form.onsubmit = () => {
      const radius = parseFloat(form.radius.value);
      const evt = new CustomEvent("find-nearest-route-location-submit", {
        detail: {
          radius
        }
      });
      self.root.dispatchEvent(evt);

      return false;
    };

    // Setup route location form.
    const findRouteLocationForm = self.root.querySelector(
      ".find-route-location-form"
    ) as HTMLFormElement;
    // Default the reference date to today.
    const today = new Date().toISOString().replace(/T.+$/i, "");
    // Use set attribute so that resetting the form returns to this value.
    findRouteLocationForm.referenceDate.setAttribute("value", today);

    // Setup radio button events.
    function changeMPMode() {
      const isSrmp = Boolean(
        findRouteLocationForm.querySelector("input[value=SRMP]:checked")
      );
      const isLine = Boolean(
        findRouteLocationForm.querySelector("input[value=line]:checked")
      );
      const classList = findRouteLocationForm.classList;

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
    }

    findRouteLocationForm.onsubmit = submitEvent => {
      let evt;
      const inputForm = submitEvent.target as HTMLFormElement;
      const detail: IRouteLocation = {
        Route: inputForm.route.value,
        Decrease: inputForm.decrease.checked,
        ReferenceDate: new Date(inputForm.referenceDate.value)
      };

      const isSrmp = Boolean(
        inputForm.querySelector("input[value=SRMP]:checked")
      );

      if (!isSrmp) {
        detail.Arm = parseFloat(inputForm.milepost.value);
      } else {
        detail.Srmp = parseFloat(inputForm.milepost.value);
        detail.Back = inputForm.back.checked;
      }

      // If "line" is checked, add end MP properties.
      if (inputForm.querySelector("input[value=line]:checked")) {
        if (!isSrmp) {
          detail.EndArm = parseFloat(inputForm.endMilepost.value);
        } else {
          detail.EndSrmp = parseFloat(inputForm.endMilepost.value);
          detail.EndBack = inputForm.endBack.checked;
        }
      }

      evt = new CustomEvent("find-route-location-submit", {
        detail
      });
      self.root.dispatchEvent(evt);
      return false;
    };

    // Programmatically click input elements that are checked by default so that
    // appropriate controls are shown / hidden when form is reset.
    findRouteLocationForm.addEventListener("reset", () => {
      const checkedRB = findRouteLocationForm.querySelectorAll(
        "input[checked]"
      );
      for (const radioButton of Array.from(checkedRB)) {
        (radioButton as HTMLInputElement).click();
      }
    });

    // Attach the "changeMPMode" function to radio buttons.
    const radioButtons = findRouteLocationForm.querySelectorAll(
      "input[type=radio]"
    );

    for (const rb of Array.from(radioButtons)) {
      rb.addEventListener("click", changeMPMode);
    }
  }

  public get routes(): Route[] {
    return this.routeSelector.routes;
  }
  public set routes(routesArray: Route[]) {
    this.routeSelector.routes = routesArray;
  }
}

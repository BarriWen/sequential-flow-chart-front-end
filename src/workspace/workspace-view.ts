import { Dom } from "../core/dom";
import { readMousePosition, readTouchPosition } from "../core/event-readers";
import { Vector } from "../core/vector";
import { ComponentType, Sequence } from "../definition";
import { StepsConfiguration } from "../designer-configuration";
import { StartComponent } from "./start-stop/start-component";

const GRID_SIZE = 48;

let lastGridPatternId = 0;

export class WorkspaceView {
  public static create(
    parent: HTMLElement,
    configuration: StepsConfiguration
  ): WorkspaceView {
    const defs = Dom.svg("defs");
    const gridPatternId = "sqd-grid-pattern-" + lastGridPatternId++;
    const gridPattern = Dom.svg("pattern", {
      id: gridPatternId,
      patternUnits: "userSpaceOnUse",
    });
    const gridPatternPath = Dom.svg("path", {
      class: "sqd-grid-path",
      fill: "none",
    });

    defs.appendChild(gridPattern);
    gridPattern.appendChild(gridPatternPath);

    const foreground = Dom.svg("g");

    var url = window.location.pathname;
    var userID;
    if (url.includes("new")) {
      userID = url.slice(5);
    }
    else {
      userID = url.substring(1, url.lastIndexOf('/') + 1);
    }

    const workspace = Dom.element("div", {
      class: "sqd-workspace",
    });
    const canvas = Dom.svg("svg", {
      class: "sqd-workspace-canvas",
    });
    canvas.appendChild(defs);
    canvas.appendChild(
      Dom.svg("rect", {
        width: "100%",
        height: "100%",
        fill: `url(#${gridPatternId})`,
      })
    );
    canvas.addEventListener("click", function(){
      const test = document.getElementsByClassName("sqd-task-rect-Subscribe");
      // Dom.attrs(test[0], {y: 50})
    });
    canvas.appendChild(foreground);
    workspace.appendChild(canvas);
    parent.appendChild(workspace);

    const view = new WorkspaceView(
      workspace,
      canvas,
      gridPattern,
      gridPatternPath,
      foreground,
      configuration
    );
    window.addEventListener("resize", view.onResizeHandler, false);
    return view;
  }

  private onResizeHandler = () => this.onResize();
  public rootComponent?: StartComponent;

  private constructor(
    private readonly workspace: HTMLElement,
    private readonly canvas: SVGElement,
    private readonly gridPattern: SVGPatternElement,
    private readonly gridPatternPath: SVGPathElement,
    private readonly foreground: SVGGElement,
    private readonly configuration: StepsConfiguration
  ) {}

  

  public editStartComp(sequence: Sequence, journeyID: string) {
    
    const start = document.getElementById("start");
    const tempThis = this;
    if (start != null) {
      start.addEventListener("click", (e) => {
        e.preventDefault();
        const dialogBox = Dom.element("dialog", {
          class: "triggers-list",
          autofocus: "false"
        });
        const triggers = [
          "Subscribe",
          "Unsubscribe",
          "Place a Purchase",
          "Abandon Checkout",
          "Time Trigger"
        ];

        const triggers_content =[
          "The automation begins when a contact subscribes to a list.",
          "The automation begins when a contact unsubscribes from a list.",
          "The automation begins when a contact makes a purchase.",
          "The automaiton begins when a contact abandons a cart.",
          "The automation begins when a contact schedules a specific date."
        ];

        const triggers_img = [
          "../assets/subscribe.png",
          "../assets/unsubscribe.png",
          "../assets/purchase.png",
          "../assets/abandon.png",
          "../assets/time-trigger.png"
        ];

        const types = [
          "Subscribe",
          "Unsubscribe",
          "Purchase",
          "Abandon",
          "Time Trigger",
        ];

        const dialogForm = Dom.element("form", {
          // class: 'triggers-list',
          method: "dialog",
          autofocus: "false"
        });

        const prompt = Dom.element("p");
        Dom.attrs(prompt, {
          class: "prompt",
        });
        prompt.innerHTML = "Please Select the Trigger";
        dialogForm.appendChild(prompt);

        for (let i = 0; i < triggers.length; i++) {
          const btn1 = Dom.element("button");
          Dom.attrs(btn1, {
            class: "triggers",
            type: "submit",
            name: "userChoice",
            value: i,
          });
      
          btn1.innerHTML = `<span style="font-size:16px">${triggers[i]}</span><br/>${triggers_content[i]}`;
          btn1.style.backgroundImage = `url("${triggers_img[i]}")`;
          btn1.addEventListener("click", function (e: MouseEvent) {
            e.preventDefault();
            const target = e.target as HTMLInputElement;
            sequence.unshift({
              id: `start-component-${journeyID}`,
              componentType: ComponentType.task,
              type: "save",
              name: triggers[i],
              createdAt: new Date(),
              createdBy: userID,
              updatedAt: new Date(),
              updatedBy: userID,
              properties: {},
              branches: undefined,
            });

            // console.log(3722, sequence);
            tempThis.render(sequence, journeyID);
            dialogBox.close();
          });
          dialogForm.appendChild(btn1);
          btn1.insertAdjacentHTML("afterend", "</br>");
        }
        dialogBox.appendChild(dialogForm);
        // const root = document.getElementById("first-step");
        start.appendChild(dialogBox);

        try {
          dialogBox.showModal();
        } catch (error) {
          console.log(error);
        }

        dialogBox.addEventListener("click", onClick);

        function onClick(event:MouseEvent) {
          dialogBox.close();
        }
      });
    }
    // console.log(document.getElementsByClassName('start-component')[0])
  }

  public render(sequence: Sequence, journeyID: string) {
    if (this.rootComponent) {
      this.rootComponent.view.destroy();
    }
    this.rootComponent = StartComponent.create(
      this.foreground,
      sequence,
      this.configuration
    );
    this.editStartComp(sequence, journeyID);
    this.refreshSize();
  }

  public setPositionAndScale(position: Vector, scale: number) {
    const gridSize = GRID_SIZE * scale;
    Dom.attrs(this.gridPattern, {
      x: position.x,
      y: position.y,
      width: gridSize,
      height: gridSize,
    });
    Dom.attrs(this.gridPatternPath, {
      d: `M ${gridSize} 0 L 0 0 0 ${gridSize}`,
    });
    Dom.attrs(this.foreground, {
      transform: `translate(${position.x}, ${position.y}) scale(${scale})`,
    });
  }

  public getClientPosition(): Vector {
    const rect = this.canvas.getBoundingClientRect();
    return new Vector(rect.x, rect.y);
  }

  public getClientSize(): Vector {
    return new Vector(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  public bindMouseOver(
    handler: (position: Vector, target: Element, button: number) => void
  ) {
    this.canvas.addEventListener(
      "mouseover",
      (e) => handler(readMousePosition(e), e.target as Element, e.button),
      false
    );
  }

  public bindMouseDown(
    handler: (position: Vector, target: Element, button: number) => void
  ) {
    this.canvas.addEventListener(
      "mousedown",
      (e) => handler(readMousePosition(e), e.target as Element, e.button),
      false
    );
  }

  public bindTouchStart(handler: (position: Vector) => void) {
    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        handler(readTouchPosition(e));
      },
      false
    );
  }

  public bindContextMenu(handler: (e: MouseEvent) => void) {
    this.canvas.addEventListener("contextmenu", handler, false);
  }

  public bindWheel(handler: (e: WheelEvent) => void) {
    this.canvas.addEventListener("wheel", handler, false);
  }

  public destroy() {
    window.removeEventListener("resize", this.onResizeHandler, false);
  }

  public refreshSize() {
    Dom.attrs(this.canvas, {
      width: this.workspace.offsetWidth,
      height: this.workspace.offsetHeight,
    });
  }

  private onResize() {
    this.refreshSize();
  }
}

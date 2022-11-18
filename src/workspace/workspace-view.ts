import { Dom } from "../core/dom";
import { readMousePosition, readTouchPosition } from "../core/event-readers";
import { Vector } from "../core/vector";
import { Sequence, ComponentType} from "../definition";
import { StepsConfiguration } from "../designer-configuration";
import { StartStopComponent } from "./start-stop/start-stop-component";
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
  public rootComponent?: StartStopComponent;

  private constructor(
    private readonly workspace: HTMLElement,
    private readonly canvas: SVGElement,
    private readonly gridPattern: SVGPatternElement,
    private readonly gridPatternPath: SVGPathElement,
    private readonly foreground: SVGGElement,
    private readonly configuration: StepsConfiguration
  ) {}
  editStartComp(sequence: Sequence , journeyID: string) {
    const start = document.getElementById("start");
	if(start){
    start.addEventListener("click", (e) => {
      e.preventDefault();
      const dialogBox = Dom.element("dialog", {
        class: "triggers-list",
      });
      const triggers = [
        "Subscribe",
        "Unsubscribe",
        "Place a Purchase",
        "Abandon Checkout",
        "Time Trigger",
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
      });

      for (let i = 0; i < triggers.length; i++) {
        const btn1 = Dom.element("button");
        Dom.attrs(btn1, {
          class: "triggers",
          type: "submit",
          name: "userChoice",
          value: i,
        });

        btn1.innerText = triggers[i];
        btn1.addEventListener("click", (e) => {
          e.preventDefault();
          sequence.unshift({
			  id: `start-component-${journeyID}`,
			  componentType: ComponentType.task,
			  type: "save",
			  name: triggers[Number((e.target as HTMLButtonElement).value)],
			  createdAt: new Date(),
			  createdBy: "userID",
			  updatedAt: new Date(),
			  updatedBy: "userID",
			  properties: {},
			  branches: undefined
		  });
          console.log(3722, sequence);
          this.render(sequence);
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
    });
}
  }
  public render(sequence: Sequence, journeyId?: string) {
    if (this.rootComponent) {
      this.rootComponent.view.destroy();
    }
    this.rootComponent = StartStopComponent.create(
      this.foreground,
      sequence,
      this.configuration
    );
    this.editStartComp(sequence, journeyId as string);
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

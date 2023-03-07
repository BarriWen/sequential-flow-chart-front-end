import { Dom } from "../core/dom";
import { MoveViewPortBehavior } from "../behaviors/move-view-port-behavior";
import { SelectStepBehavior } from "../behaviors/select-step-behavior";
import { race } from "../core/simple-event-race";
import { Vector } from "../core/vector";
import { ComponentType, Step } from "../definition";
import {
  DesignerComponentProvider,
  DesignerContext,
  ViewPort,
} from "../designer-context";
import { Placeholder, StepComponent, StepComponentState } from "./component";
import { StartComponent } from "./start-stop/start-component";
import { WorkspaceView } from "./workspace-view";
import { readMousePosition } from "../core/event-readers";
import { StepDefinition } from "../designer-configuration";
import { ObjectCloner } from "../core/object-cloner";
import { Uid } from "../core/uid";
import { DragStepBehavior } from "../behaviors/drag-step-behavior";

const WHEEL_DELTA = 0.1;
const ZOOM_DELTA = 0.2;

export class Workspace implements DesignerComponentProvider {
  public static create(
    parent: HTMLElement,
    context: DesignerContext
  ): Workspace {
    const view = WorkspaceView.create(parent, context.configuration.steps);

    const workspace = new Workspace(view, context);
    setTimeout(() => {
      workspace.render();
      workspace.resetViewPort();
    });

    context.setProvider(workspace);
    context.onViewPortChanged.subscribe((vp) =>
      workspace.onViewPortChanged(vp)
    );
    context.onIsDraggingChanged.subscribe((i) =>
      workspace.onIsDraggingChanged(i)
    );
    context.onIsSmartEditorCollapsedChanged.subscribe(() =>
      workspace.onIsSmartEditorCollapsedChanged()
    );

    race(
      0,
      context.onDefinitionChanged,
      context.onSelectedStepChanged
    ).subscribe((r) => {
      const [defChangedDetails, selectedStep] = r;
      if (defChangedDetails) {
        if (defChangedDetails.rerender) {
          workspace.render();
        } else {
          workspace.revalidate();
        }
      } else if (selectedStep !== undefined) {
        workspace.onSelectedStepChanged(selectedStep);
      }
    });

    view.bindMouseDown((p, t, b) => workspace.onMouseDown(p, t, b));
    view.bindTouchStart((e) => workspace.onTouchStart(e));
    view.bindContextMenu((e) => workspace.onContextMenu(e));
    view.bindWheel((e) => workspace.onWheel(e));
    return workspace;
  }

  public isValid = false;

  private selectedStepComponent: StepComponent | null = null;

  private constructor(
    private readonly view: WorkspaceView,
    private readonly context: DesignerContext
  ) {}

  public render() {
    this.view.render(
      this.context.definition.sequence,
      String(this.context.definition.properties.journeyId)
    );
    this.trySelectStep(this.context.selectedStep);
    this.revalidate();
  }

  public getPlaceholders(): Placeholder[] {
    const result: Placeholder[] = [];
    this.getRootComponent().getPlaceholders(result);
    return result;
  }

  public getSelectedStepComponent(): StepComponent {
    if (this.selectedStepComponent) {
      return this.selectedStepComponent;
    }
    throw new Error("Nothing selected");
  }

  public getComponentByStepId(stepId: string): StepComponent {
    const component = this.getRootComponent().findById(stepId);
    if (!component) {
      throw new Error(`Cannot find component for step id: ${stepId}`);
    }
    return component;
  }

  public resetViewPort() {
    const rcv = this.getRootComponent().view;
    const clientSize = this.view.getClientSize();
    const x = Math.max(0, (clientSize.x - rcv.width) / 2);
    const y = Math.max(0, (clientSize.y - rcv.height) / 2);

    this.context.setViewPort(new Vector(x, y), 1);
  }

  public zoom(direction: boolean): void {
    const delta = direction ? ZOOM_DELTA : -ZOOM_DELTA;
    const scale = this.context.limitScale(this.context.viewPort.scale + delta);
    this.context.setViewPort(this.context.viewPort.position, scale);
  }

  public moveViewPortToStep(stepComponent: StepComponent) {
    const vp = this.context.viewPort;
    const componentPosition = stepComponent.view.getClientPosition();
    const clientSize = this.view.getClientSize();

    const realPos = vp.position
      .divideByScalar(vp.scale)
      .subtract(componentPosition.divideByScalar(vp.scale));
    const componentOffset = new Vector(
      stepComponent.view.width,
      stepComponent.view.height
    ).divideByScalar(2);

    this.context.animateViewPort(
      realPos.add(clientSize.divideByScalar(2)).subtract(componentOffset),
      1
    );
  }

  public destroy() {
    this.view.destroy();
  }

  private revalidate() {
    this.isValid = this.getRootComponent().validate();
  }

  private onMouseDown(position: Vector, target: Element, button: number) {
    const isPrimaryButton = button === 0;
    const isMiddleButton = button === 1;
    if (isPrimaryButton || isMiddleButton) {
      this.startBehavior(target, position, isMiddleButton);
    }
  }

  private onTouchStart(position: Vector) {
    const element = document.elementFromPoint(position.x, position.y);
    if (element) {
      this.startBehavior(element, position, false);
    }
  }

  private onContextMenu(e: MouseEvent) {
    e.preventDefault();
  }

  private startBehavior(
    target: Element,
    position: Vector,
    forceMoveMode: boolean
  ) {
    const title = document.getElementsByClassName("info-box-title")[0];
    this.context.definition.properties.journeyName = String(title.textContent);
    const clickedStep =
      !forceMoveMode && !this.context.isMoveModeEnabled
        ? this.getRootComponent().findByElement(target as Element)
        : null;

    if (clickedStep) {
      this.context.behaviorController.start(
        position,
        SelectStepBehavior.create(clickedStep, this.context)
      );
      const fakeThis = this.context;
      
      if (clickedStep.step.componentType === ComponentType.switch) {
        const copyButton = document.getElementById(`RightCopyIcon-${clickedStep.step.id}`);
        copyButton?.addEventListener("click", function(e) {
          console.log("copy switch")
          promptChoices(fakeThis);
        });
        const deleteButton = document.getElementById(`RightDeleteIcon-${clickedStep.step.id}`);
        if (deleteButton) {
          deleteButton.addEventListener("click", function(e) {
            console.log("trying to delete switch");
            fakeThis.tryDeleteStep(clickedStep.step);
          });
        }
        
      } 
      else if (clickedStep.step.componentType === ComponentType.task){
        // Copy buttons
        const rightCopy = document.getElementById(`RightCopyIcon-${clickedStep.step.id}`);
        if (rightCopy) {
          rightCopy.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            const duplicateStep = createStep(clickedStep.step);
            
            const pos = readMousePosition(e);
            console.log("button clicked", pos);
            console.log(duplicateStep);
            duplicateStep.id =
              "copy-" + clickedStep.step.id + "-at-" + Date.now();
            fakeThis.behaviorController.start(
              pos,
              DragStepBehavior.create(fakeThis, duplicateStep)
            );
          };
        }

        const upCopy = document.getElementById(`UpCopyIcon-${clickedStep.step.id}`);
        if (upCopy) {
          upCopy.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            const duplicateStep = createStep(clickedStep.step);
            
            const pos = readMousePosition(e);
            duplicateStep.id =
              "copy-" + clickedStep.step.id + "-at-" + Date.now();
            fakeThis.behaviorController.start(
              pos,
              DragStepBehavior.create(fakeThis, duplicateStep)
            );
          };
        }
        // Delete Buttons
        const rightDelete = document.getElementById(`RightDeleteIcon-${clickedStep.step.id}`);
        if (rightDelete) {
          rightDelete.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            fakeThis.tryDeleteStep(clickedStep.step);
          };
        }
        const upDelete = document.getElementById(`UpDeleteIcon-${clickedStep.step.id}`);
        if (upDelete) {
          upDelete.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            fakeThis.tryDeleteStep(clickedStep.step);
          };
        }
      }
      
    } 
    else {
      var but = document.querySelectorAll(".Collapsed");
      if (but) {
        but.forEach((e) => e.classList.add("sqd-hidden"));
      }
      this.context.behaviorController.start(
        position,
        MoveViewPortBehavior.create(this.context)
      );
    }
  }
  private onWheel(e: WheelEvent) {
    const viewPort = this.context.viewPort;
    const mousePoint = new Vector(e.pageX, e.pageY).subtract(
      this.view.getClientPosition()
    );
    // The real point is point on canvas with no scale.
    const mouseRealPoint = mousePoint
      .divideByScalar(viewPort.scale)
      .subtract(viewPort.position.divideByScalar(viewPort.scale));

    const wheelDelta = e.deltaY > 0 ? -WHEEL_DELTA : WHEEL_DELTA;
    const newScale = this.context.limitScale(viewPort.scale + wheelDelta);

    const position = mouseRealPoint.multiplyByScalar(-newScale).add(mousePoint);
    const scale = newScale;

    this.context.setViewPort(position, scale);
  }

  private onIsDraggingChanged(isDragging: boolean) {
    this.getRootComponent().setIsDragging(isDragging);
  }

  private onIsSmartEditorCollapsedChanged() {
    setTimeout(() => this.view.refreshSize());
  }

  private onViewPortChanged(viewPort: ViewPort) {
    this.view.setPositionAndScale(viewPort.position, viewPort.scale);
  }

  private onSelectedStepChanged(step: Step | null) {
    this.trySelectStep(step);
  }

  private trySelectStep(step: Step | null) {
    if (this.selectedStepComponent) {
      this.selectedStepComponent.setState(StepComponentState.default);
      this.selectedStepComponent = null;
    }
    if (step) {
      this.selectedStepComponent = this.getRootComponent().findById(step.id);
      if (!this.selectedStepComponent) {
        throw new Error(`Cannot find a step component by id ${step.id}`);
      }
      this.selectedStepComponent.setState(StepComponentState.selected);
    }
  }

  private getRootComponent(): StartComponent {
    if (this.view.rootComponent) {
      return this.view.rootComponent;
    }
    throw new Error("Root component not found");
  }
}
function promptChoices(
  tempContext: DesignerContext
) {
    // Copy
    // Create a dialog window
    const dialogBox = Dom.element("dialog", {
      class: "confirm-dialog",
      id: "dialog-box",
    });
  
    const title = Dom.element("h3", {
      class: "confirm-dialog-content",
    });
  
    let toDo = [
      "Copy true path",
      "Copy false path",
      "Copy both",
      "Copy condition only",
    ];
    title.innerText = "Which branch do you want to duplicate?";
      
    const form = Dom.element("form", {
      method: "dialog",
      id: "dialog-form",
    });

    let output: string | null | number;
    // Add options to dialog window
    for (let i = 0; i < toDo.length; i++) {
      const radio = Dom.element("input", {
        type: "radio",
        name: "choice",
        value: i,
      });
      const choice = Dom.element("label");
      choice.innerText = toDo[i];
      form.appendChild(radio);
      form.appendChild(choice);
      choice.insertAdjacentHTML("afterend", "</br>");
    }

    // Buttons on window
    dialogBox.appendChild(title);
    const btn1 = Dom.element("button", {
      type: "submit",
      class: "popup-button"
    });
    btn1.innerText = "Confirm";
    form.appendChild(btn1);
    const btn2 = Dom.element("button", {
      type: "submit",
    });
    btn2.innerText = "Cancel";
    btn2.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const designer = document.getElementById("designer");
      console.log("remove dialog")
      while (designer?.childNodes[1]) {
        designer?.removeChild(designer.childNodes[1]);
      }
    });
    form.appendChild(btn2);
    dialogBox.appendChild(form);

    tempContext.layoutController.parent.appendChild(dialogBox);
    if (typeof dialogBox.showModal === "function") {
      dialogBox.showModal();
    } else {
      prompt("Wow from prompt window", "ok");
    }

    // Event Listener
    btn1.addEventListener("click", function (e) {
      // e.preventDefault();
      e.stopPropagation();
     
      var elem = document.getElementsByTagName("input");
      for (let i = 0; i < elem.length; i++) {
        if (elem[i].type == "radio" && elem[i].checked) {
          output = elem[i].value;
        }
      }
      
      if (tempContext.selectedStep) {
        const duplicateStep = createStep(tempContext.selectedStep);
        duplicateStep.branches.True = [];
        duplicateStep.branches.False = [];
        // Copy true branch
        if (tempContext.selectedStep?.branches.True.length > 0 &&(output == 0 || output == 2)) {
          for (let i = 0;i < tempContext.selectedStep?.branches.True.length;i++) {
            const step = createStep(tempContext.selectedStep?.branches.True[i]);
            step.id =
              "copy-" +
              tempContext.selectedStep?.branches.True[i].id +
              "-at-" +
              Date.now();
            duplicateStep.branches.True[i] = step;
          }
        }
        // Copy false branch
        if (tempContext.selectedStep?.branches.False.length > 0 &&(output == 1 || output == 2)) {
          for (let i = 0;i < tempContext.selectedStep?.branches.False.length;i++) {
            const step = createStep(tempContext.selectedStep?.branches.False[i]);
            step.id =
              "copy-" +
              tempContext.selectedStep?.branches.False[i].id +
              "-at-" +
              Date.now();
            duplicateStep.branches.False[i] = step;
          }
        }
        const pos = readMousePosition(e);
        duplicateStep.id = "copy-" + tempContext.selectedStep?.id + "-at-" + Date.now();
        tempContext.behaviorController.start(
          pos,
          DragStepBehavior.create(tempContext, duplicateStep)
        );
        const designer = document.getElementById("designer");
        while (designer?.childNodes[1]) {
          designer?.removeChild(designer.childNodes[1]);
        }
      }
    });
}
function createStep(step: StepDefinition): Step {
  const newStep = ObjectCloner.deepClone(step) as Step;
  newStep.id = Uid.next();
  return newStep;
}

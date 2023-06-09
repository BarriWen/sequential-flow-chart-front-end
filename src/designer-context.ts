import { BehaviorController } from "./behaviors/behavior-controller";
import { animate, Animation } from "./core/animation";
import { SequenceModifier } from "./core/sequence-modifier";
import { SimpleEvent } from "./core/simple-event";
import { Vector } from "./core/vector";
import {
  ComponentType,
  Definition,
  Sequence,
  Step,
  SwitchStep,
} from "./definition";
import { DesignerConfiguration } from "./designer-configuration";
import { LayoutController } from "./layout-controller";
import { Placeholder, StepComponent } from "./workspace/component";
import { Dom } from "./core/dom";
const MIN_SCALE = 0.1;
const MAX_SCALE = 3;

export interface DefinitionChangedEvent {
  rerender: boolean;
}

export class DesignerContext {
  public readonly onViewPortChanged = new SimpleEvent<ViewPort>();
  public readonly onSelectedStepChanged = new SimpleEvent<Step | null>();
  public readonly onIsReadonlyChanged = new SimpleEvent<boolean>();
  public readonly onIsDraggingChanged = new SimpleEvent<boolean>();
  public readonly onIsMoveModeEnabledChanged = new SimpleEvent<boolean>();
  public readonly onIsToolboxCollapsedChanged = new SimpleEvent<boolean>();
  public readonly onIsSmartEditorCollapsedChanged = new SimpleEvent<boolean>();
  public readonly onDefinitionChanged =
    new SimpleEvent<DefinitionChangedEvent>();
  public readonly onZoomChanged = new SimpleEvent<number>();

  public viewPort: ViewPort = {
    position: new Vector(0, 0),
    scale: 1,
  };
  public selectedStep: Step | null = null;
  public isReadonly: boolean;
  public isDragging = false;
  public isMoveModeEnabled = false;

  private viewPortAnimation?: Animation;
  public provider?: DesignerComponentProvider;

  public constructor(
    public readonly definition: Definition,
    public readonly behaviorController: BehaviorController,
    public readonly layoutController: LayoutController,
    public readonly configuration: DesignerConfiguration,
    public isToolboxCollapsed: boolean,
    public isSmartEditorCollapsed: boolean
  ) {
    this.isReadonly = !!configuration.isReadonly;
  }

  public setViewPort(position: Vector, scale: number) {
    this.viewPort = { position, scale };
    this.onViewPortChanged.forward(this.viewPort);
  }

  public resetViewPort() {
    this.getProvider().resetViewPort();
  }

  public animateViewPort(position: Vector, scale: number) {
    if (this.viewPortAnimation && this.viewPortAnimation.isAlive) {
      this.viewPortAnimation.stop();
    }

    const startPosition = this.viewPort.position;
    const startScale = this.viewPort.scale;
    const deltaPosition = startPosition.subtract(position);
    const deltaScale = startScale - scale;

    this.viewPortAnimation = animate(150, (progress) => {
      const newScale = startScale - deltaScale * progress;
      this.setViewPort(
        startPosition.subtract(deltaPosition.multiplyByScalar(progress)),
        newScale
      );
    });
  }

  public moveViewPortToStep(stepId: string) {
    const component = this.getProvider().getComponentByStepId(stepId);
    this.getProvider().moveViewPortToStep(component);
  }

  public limitScale(scale: number): number {
    return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
  }

  public zoom(direction: boolean) {
    this.getProvider().zoom(direction);
  }

  public setSelectedStep(step: Step | null) {
    if (this.selectedStep !== step) {
      this.selectedStep = step;
      this.onSelectedStepChanged.forward(step);
    }
  }

  public selectStepById(stepId: string) {
    const component = this.getProvider().getComponentByStepId(stepId);
    this.setSelectedStep(component.step);
  }

  public tryInsertStep(
    step: Step,
    targetSequence: Sequence,
    targetIndex: number
  ): boolean {
    const canInsertStep = this.configuration.steps.canInsertStep
      ? this.configuration.steps.canInsertStep(
          step,
          targetSequence,
          targetIndex
        )
      : true;
    if (!canInsertStep) {
      return false;
    }

    SequenceModifier.insertStep(step, targetSequence, targetIndex);
    this.notifiyDefinitionChanged(true);
    this.setSelectedStep(step);
    return true;
  }

  public tryMoveStep(
    sourceSequence: Sequence,
    step: Step,
    targetSequence: Sequence,
    targetIndex: number
  ): boolean {
    const canMoveStep = this.configuration.steps.canMoveStep
      ? this.configuration.steps.canMoveStep(
          sourceSequence,
          step,
          targetSequence,
          targetIndex
        )
      : true;
    if (!canMoveStep) {
      return false;
    }

    SequenceModifier.moveStep(
      sourceSequence,
      step,
      targetSequence,
      targetIndex
    );
    this.notifiyDefinitionChanged(true);
    this.setSelectedStep(step);
    return true;
  }

  public tryDeleteStep(step: Step): boolean {
    const component = this.getProvider().getComponentByStepId(step.id);
    const canDeleteStep = this.configuration.steps.canDeleteStep
      ? this.configuration.steps.canDeleteStep(
          component.step,
          component.parentSequence
        )
      : true;
    if (!canDeleteStep) {
      return false;
    }
    promptChoices(this, component);

    this.notifiyDefinitionChanged(true);

    if (this.selectedStep?.id === step.id) {
      this.setSelectedStep(null);
    }
    return true;
  }

  public setIsReadonly(isReadonly: boolean) {
    this.isReadonly = isReadonly;
    this.onIsReadonlyChanged.forward(isReadonly);
  }

  public setIsDragging(isDragging: boolean) {
    this.isDragging = isDragging;
    this.onIsDraggingChanged.forward(isDragging);
  }

  public toggleIsMoveModeEnabled() {
    this.isMoveModeEnabled = !this.isMoveModeEnabled;
    this.onIsMoveModeEnabledChanged.forward(this.isMoveModeEnabled);
  }

  public toggleIsToolboxCollapsed() {
    this.isToolboxCollapsed = !this.isToolboxCollapsed;
    this.onIsToolboxCollapsedChanged.forward(this.isToolboxCollapsed);
  }

  public toggleIsSmartEditorCollapsed() {
    this.isSmartEditorCollapsed = !this.isSmartEditorCollapsed;
    this.onIsSmartEditorCollapsedChanged.forward(this.isSmartEditorCollapsed);
  }

  public notifiyDefinitionChanged(rerender: boolean) {
    this.onDefinitionChanged.forward({ rerender });
  }

  public getPlaceholders(): Placeholder[] {
    return this.getProvider().getPlaceholders();
  }

  public setProvider(provider: DesignerComponentProvider) {
    this.provider = provider;
  }

  private getProvider(): DesignerComponentProvider {
    if (!this.provider) {
      throw new Error("Provider is not set");
    }
    return this.provider;
  }
}

export interface ViewPort {
  position: Vector;
  scale: number;
}

export interface DesignerComponentProvider {
  getPlaceholders(): Placeholder[];
  getComponentByStepId(stepId: string): StepComponent;
  resetViewPort(): void;
  zoom(direction: boolean): void;
  moveViewPortToStep(stepComponent: StepComponent): void;
  render(): void;
}

export function promptChoices(context: DesignerContext, component: StepComponent) {
  //console.log(controller);
  let output = "";
  // Create a propmt window
  const dialogBox = Dom.element("dialog", {
    class: "confirm-dialog",
    id: "dialog-box",
    x: 20, 
    y: 50, 
  });

  const title = Dom.element("h3", {
    class: "confirm-dialog-content",
  });

  let toDo;
  // A form to include all choices
  const form = Dom.element("form", {
    method: "dialog",
    id: "dialog-form",
  });

  if (component.step.componentType == ComponentType.switch) {
    toDo = ["Delete true path", "Delete false path", "Delete both"];
    title.innerText = "Which branch do you want to delete?";
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
  } else {
    title.innerHTML = "Are you sure you want to<br>&nbsp&nbsp&nbsp&nbsp&nbspdelete the trigger?";
  }
  dialogBox.appendChild(title);

  const btn1 = Dom.element("button", {
    type: "submit",
    class: "popup-button", 
    height: 25, 
    width: 50
  });
  btn1.innerText = "Confirm";
  form.appendChild(btn1);
  const btn2 = Dom.element("button", {
    type: "submit",
    class: "popup-button2", 
    height: 25, 
    width: 50
  });
  btn2.innerText = "Cancel";
  
  btn2.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    // console.log(context.layoutController.getParent().childNodes);
    const designer = document.getElementById("designer");
    while (designer?.childNodes[1]) {
      designer?.removeChild(designer.childNodes[1]);
    }
  });
  form.appendChild(btn2);

  dialogBox.appendChild(form);
 context.layoutController.parent.appendChild(dialogBox);

  if (typeof dialogBox.showModal === "function") {
    dialogBox.showModal();
  } else {
    prompt("Wrong window", "ok");
  }

  btn1.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    // console.log(component);
    if (component.step.componentType == "switch") {
      var elem = document.getElementsByTagName("input");
      for (let i = 0; i < elem.length; i++) {
        // console.log(570, elem);
        if (elem[i].type == "radio" && elem[i].checked) {
          output = elem[i].value;
        }
      }
    } else {
      output = "2";
    }
    console.log("designer context", output);
    SequenceModifier.deleteStep(
      component.step,
      component.parentSequence,
      output
    );
    if (context.provider != undefined) {
      context.provider.render();
    }

    const designer = document.getElementById("designer");
    while (designer?.childNodes[1]) {
      designer?.removeChild(designer.childNodes[1]);
    }
  });
}
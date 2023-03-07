import { Sequence, Step, TaskStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { StepComponent, StepComponentState } from "../component";
import { TriggerComponentView } from "./trigger-component-view";
import { TimeDelayTaskStepComponentView } from "./time-delay-component-view";
import { TagComponentView } from "./tag-component-view";
import { TimeTriggerTaskStepComponentView } from "./time-trigger-component-view";
import { EmailComponentView } from "./email-component-view";
import { SwitchStepComponentView } from "../switch-step/switch-step-component-view";

export class TaskStepComponent implements StepComponent {
  public static create(
    parent: SVGElement,
    step: TaskStep,
    parentSequence: Sequence,
    configuration: StepsConfiguration
  ): TaskStepComponent {
    let view;
    if (step.name === "Time Delay") {
      view = TimeDelayTaskStepComponentView.create(parent, step, configuration);
    } 
    else if (step.name === "Add Tag" || step.name === "Remove Tag") {
			view = TagComponentView.create(parent, step, configuration);
		}
    else if (step.name === "Time Trigger") {
			view = TimeTriggerTaskStepComponentView.create(parent, step, configuration);
		}
    else if (step.name === "Send Email"){
      view = EmailComponentView.create(parent, step, configuration);
    }
    else {
      view = TriggerComponentView.create(parent, step, configuration);
    }
    return new TaskStepComponent(view, step, parentSequence, configuration);
  }

  private constructor(
    public readonly view: EmailComponentView | TriggerComponentView | TimeDelayTaskStepComponentView | TagComponentView | TimeTriggerTaskStepComponentView,
    public readonly step: Step,
    public readonly parentSequence: Sequence,
    private readonly configuration: StepsConfiguration
  ) {}

  public findByElement(element: Element): StepComponent | null {
    return this.view.containsElement(element) ? this : null;
  }

  public findById(stepId: string): StepComponent | null {
    return this.step.id === stepId ? this : null;
  }

  public getPlaceholders() {
    // Nothing to do here.
  }

  public setIsDragging(isDragging: boolean) {
    this.view.setIsDragging(isDragging);
  }

  public setState(state: StepComponentState) {
    switch (state) {
      case StepComponentState.default:
        this.view.setIsSelected(false);
        this.view.setIsDisabled(false);
        break;
      case StepComponentState.selected:
        this.view.setIsDisabled(false);
        this.view.setIsSelected(true);
        break;
      case StepComponentState.dragging:
        this.view.setIsDisabled(true);
        this.view.setIsSelected(false);
        break;
    }
  }

  public validate(): boolean {
    const isValid = this.configuration.validator
      ? this.configuration.validator(this.step)
      : true;
    this.view.setIsValid(isValid);
    return isValid;
  }
}

import { Dom } from "../core/dom";
import { MoveViewPortBehavior } from "../behaviors/move-view-port-behavior";
import { SelectStepBehavior } from "../behaviors/select-step-behavior";
import { race } from "../core/simple-event-race";
import { Vector } from "../core/vector";
import { Step } from "../definition";
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
      if (clickedStep.step.componentType === "switch") {
        //click right popout
        const switchMoreButtonId =
          clickedStep.view.g.children[13].children[3].id;
        const switchMoreButton = document.getElementById(switchMoreButtonId);
        if (switchMoreButton) {
          switchMoreButton.onclick = function () {
            console.log(3467, clickedStep.view.g.children);
            clickedStep.view.g.children[14].classList.toggle("sqd-hidden");
          };
        }
        //right popout delete
        if (clickedStep.view.g.children[14].children[1].id) {
          const deleteButtonId = clickedStep.view.g.children[14].children[1].id;
          const deleteButton = document.getElementById(deleteButtonId);
          if (deleteButton) {
            deleteButton.onclick = function () {
              promptChoices(fakeThis, "delete");
            };
          }
        }
        //dropdown
        if (clickedStep.view.g.children[14].children[2].id) {
          const dropdownButId = clickedStep.view.g.children[14].children[2].id;
          const dropdownBut = document.getElementById(dropdownButId);
          if (dropdownBut) {
            dropdownBut.onclick = function (e) {
              e.stopPropagation();
              clickedStep.view.g.children[15].classList.toggle("sqd-hidden");
              clickedStep.view.g.children[16].classList.toggle("sqd-hidden");
              clickedStep.view.g.children[17].classList.toggle("sqd-hidden");
            };
          }
        }
        //subdropdown
        if (clickedStep.view.g.children[17].children[0].children[3].id) {
          const dropdownButId =
            clickedStep.view.g.children[17].children[0].children[3].id.toString();
          const dropdownBut = document.getElementById(dropdownButId);
          if (dropdownBut) {
            dropdownBut.onclick = function (e) {
              console.log(3498, clickedStep.view.g.children[17].children);
              e.stopPropagation();
              clickedStep.view.g.children[17].children[1].classList.toggle(
                "sqd-hidden"
              );
            };
          }
        }
        //subdropdown1
        if (clickedStep.view.g.children[16].children[0].children[3].id) {
          const dropdownButId =
            clickedStep.view.g.children[16].children[0].children[3].id.toString();
          const dropdownBut = document.getElementById(dropdownButId);
          if (dropdownBut) {
            dropdownBut.onclick = function (e) {
              console.log(3498, clickedStep.view.g.children[16].children);
              e.stopPropagation();
              clickedStep.view.g.children[16].children[1].classList.toggle(
                "sqd-hidden"
              );
            };
          }
        }
        //upper subdropdown
        console.log(3741, clickedStep.view.g.children);
        const selectRunUpperId =
          clickedStep.view.g.children[17].children[1].children[2].id.toString();
        const selectRunUpper = document.getElementById(selectRunUpperId);
        if (selectRunUpper) {
          selectRunUpper.onclick = function () {
            //console.log(3589, clickedStep)
            const showVal =
              clickedStep.view.g.children[17].children[1].children[1].innerHTML;
            clickedStep.view.g.children[17].children[0].children[2].textContent =
              showVal;
            clickedStep.view.g.children[17].children[1].classList.toggle(
              "sqd-hidden"
            );
            clickedStep.step.properties["Select List"] = showVal;
          };
        }
        const selectRunUpperId1 =
          clickedStep.view.g.children[17].children[1].children[5].id.toString();
        const selectRunUpper1 = document.getElementById(selectRunUpperId1);
        if (selectRunUpper1) {
          selectRunUpper1.onclick = function () {
            const showVal =
              clickedStep.view.g.children[17].children[1].children[4].innerHTML;
            clickedStep.view.g.children[17].children[0].children[2].textContent =
              showVal;
            clickedStep.view.g.children[17].children[1].classList.toggle(
              "sqd-hidden"
            );
            clickedStep.step.properties["Select List"] = showVal;
          };
        }
        //lower subdropdown
        const selectRunLowerId =
          clickedStep.view.g.children[16].children[1].children[2].id.toString();
        const selectRunLower = document.getElementById(selectRunLowerId);
        if (selectRunLower) {
          selectRunLower.onclick = function () {
            //console.log(3589, clickedStep.view.g.children)
            const showVal =
              clickedStep.view.g.children[16].children[1].children[1].innerHTML;
            clickedStep.view.g.children[16].children[0].children[2].textContent =
              showVal;
            clickedStep.view.g.children[16].children[1].classList.toggle(
              "sqd-hidden"
            );
            clickedStep.step.properties["Run"] = showVal;
          };
        }
        const selectRunLowerId1 =
          clickedStep.view.g.children[16].children[1].children[5].id.toString();
        const selectRunLower1 = document.getElementById(selectRunLowerId1);
        if (selectRunLower1) {
          selectRunLower1.onclick = function () {
            //console.log(3589, )
            const showVal =
              clickedStep.view.g.children[16].children[1].children[4].innerHTML;
            console.log(
              3596,
              clickedStep.view.g.children[16].children[0].children[2]
            );
            clickedStep.view.g.children[16].children[0].children[2].textContent =
              showVal;
            clickedStep.view.g.children[16].children[1].classList.toggle(
              "sqd-hidden"
            );
            clickedStep.step.properties["Run"] = showVal;
          };
        }
        if (clickedStep.view.g.children[14].children[0]) {
          console.log(
            "duplicate if",
            clickedStep.view.g.children[14].children[0].id
          );
          const duplicateId =
            clickedStep.view.g.children[14].children[0].id.toString();
          const duplicateBut = document.getElementById(duplicateId);

          const tempContext = this.context;
          if (duplicateBut) {
            duplicateBut.onclick = function (e) {
              e.stopPropagation();
              promptChoices(tempContext, "copy", e);
            };
          }
        }
      }
      function handleMouseover(
        button: HTMLElement,
        action: string,
        classes: HTMLElement
      ) {
        if (action === "mouseover") {
          button.addEventListener(action, function () {
            classes.classList.remove("sqd-hidden");
          });
        } else {
          button.addEventListener(action, function () {
            classes.classList.add("sqd-hidden");
          });
        }
      }
      // let noTag = (clickedStep.step.name != "Add Tag" && clickedStep.step.name != "Remove Tag");
      if (clickedStep.step.componentType === "task") {
        //check if the clicked step is time delay

        if (clickedStep.step.name == "Time Delay") {
          const sendOntimeSelected = document.querySelector(
            ".timedelaydivTagInput"
          ) as HTMLInputElement;
          const timeSelected = document.querySelector(
            ".timedelaydivTagInputTimes"
          ) as HTMLInputElement;
          const timeSelectedUnit = document.querySelector(
            ".timedelayselect"
          ) as HTMLInputElement;
          const upCheckBut = document.getElementById("timeDelayUpCheckIcon");
          const upduplicateBut = document.getElementById("timeDelayUpCopyIcon");
          const rightduplicateBut = document.getElementById(
            "timeDelayRightCopyIcon"
          );
          const deleteButton = document.getElementById(
            "timeDelayRightDeleteIcon"
          );
          const rightEditBut = document.getElementById(
            "timeDelayRightEditIcon"
          );
          const tempContext = this.context;
          if (upduplicateBut) {
            upduplicateBut.onclick = function (e) {
              console.log(4313, "clicked");
              e.preventDefault();
              e.stopPropagation();
              const duplicateStep = createStep(clickedStep.step);
              const pos = readMousePosition(e);
              duplicateStep.id =
                "copy-" + clickedStep.step.id + "-at-" + Date.now();
              tempContext.behaviorController.start(
                pos,
                DragStepBehavior.create(tempContext, duplicateStep)
              );
            };
          }
          if (rightduplicateBut) {
            rightduplicateBut.onclick = function (e) {
              e.preventDefault();
              e.stopPropagation();
              const duplicateStep = createStep(clickedStep.step);
              const pos = readMousePosition(e);
              duplicateStep.id =
                "copy-" + clickedStep.step.id + "-at-" + Date.now();
              // console.log("copy", duplicateStep.id);
              tempContext.behaviorController.start(
                pos,
                DragStepBehavior.create(tempContext, duplicateStep)
              );
            };
          }

          //delete
          const uppopupdeleteButton = document.getElementById(
            "timeDelayUpDeleteIcon"
          );
          handleMouseover(
            deleteButton as HTMLElement,
            "mouseover",
            clickedStep.view.g.children[7].children[2] as HTMLElement
          );
          handleMouseover(
            deleteButton as HTMLElement,
            "mouseout",
            clickedStep.view.g.children[7].children[2] as HTMLElement
          );
          handleMouseover(
            rightduplicateBut as HTMLElement,
            "mouseover",
            clickedStep.view.g.children[7].children[1] as HTMLElement
          );
          handleMouseover(
            rightduplicateBut as HTMLElement,
            "mouseout",
            clickedStep.view.g.children[7].children[1] as HTMLElement
          );
          handleMouseover(
            rightEditBut as HTMLElement,
            "mouseover",
            clickedStep.view.g.children[7].children[0] as HTMLElement
          );
          handleMouseover(
            rightEditBut as HTMLElement,
            "mouseout",
            clickedStep.view.g.children[7].children[0] as HTMLElement
          );
          //console.log(4993, clickedStep.view.g.children);
          if (deleteButton) {
            deleteButton.onclick = function () {
              promptChoices(fakeThis, "delete");
            };
          }
          if (uppopupdeleteButton) {
            uppopupdeleteButton.onclick = function () {
              promptChoices(fakeThis, "delete");
            };
          }
        } 
        else if (clickedStep.step.name == "Add Tag" || clickedStep.step.name == "Remove Tag") {
  
          const upduplicateBut = document.getElementById("tagUpCopyIcon");
          const rightduplicateBut = document.getElementById(
            "tagRightCopyIcon"
          );
          const deleteButton = document.getElementById(
            "tagRightDeleteIcon"
          );
          const rightEditBut = document.getElementById(
            "tagRightEditIcon"
          );
          const tempContext = this.context;
          if (upduplicateBut) {
            upduplicateBut.onclick = function (e) {
              console.log(4313, "clicked");
              e.preventDefault();
              e.stopPropagation();
              const duplicateStep = createStep(clickedStep.step);
              const pos = readMousePosition(e);
              duplicateStep.id =
                "copy-" + clickedStep.step.id + "-at-" + Date.now();
              tempContext.behaviorController.start(
                pos,
                DragStepBehavior.create(tempContext, duplicateStep)
              );
            };
          }
          if (rightduplicateBut) {
            rightduplicateBut.onclick = function (e) {
              e.preventDefault();
              e.stopPropagation();
              const duplicateStep = createStep(clickedStep.step);
              const pos = readMousePosition(e);
              duplicateStep.id =
                "copy-" + clickedStep.step.id + "-at-" + Date.now();
              // console.log("copy", duplicateStep.id);
              tempContext.behaviorController.start(
                pos,
                DragStepBehavior.create(tempContext, duplicateStep)
              );
            };
          }

          //delete
          const uppopupdeleteButton = document.getElementById(
            "timeDelayUpDeleteIcon"
          );
          handleMouseover(
            deleteButton as HTMLElement,
            "mouseover",
            clickedStep.view.g.children[7].children[2] as HTMLElement
          );
          handleMouseover(
            deleteButton as HTMLElement,
            "mouseout",
            clickedStep.view.g.children[7].children[2] as HTMLElement
          );
          handleMouseover(
            rightduplicateBut as HTMLElement,
            "mouseover",
            clickedStep.view.g.children[7].children[1] as HTMLElement
          );
          handleMouseover(
            rightduplicateBut as HTMLElement,
            "mouseout",
            clickedStep.view.g.children[7].children[1] as HTMLElement
          );
          handleMouseover(
            rightEditBut as HTMLElement,
            "mouseover",
            clickedStep.view.g.children[7].children[0] as HTMLElement
          );
          handleMouseover(
            rightEditBut as HTMLElement,
            "mouseout",
            clickedStep.view.g.children[7].children[0] as HTMLElement
          );
          //console.log(4993, clickedStep.view.g.children);
          if (deleteButton) {
            deleteButton.onclick = function () {
              promptChoices(fakeThis, "delete");
            };
          }
          if (uppopupdeleteButton) {
            uppopupdeleteButton.onclick = function () {
              promptChoices(fakeThis, "delete");
            };
          }
        }
        else {
          if (clickedStep.view.g.children[5].children[1]) {
            const deleteButtonId =
              clickedStep.view.g.children[5].children[1].id.toString();
            const deleteButton = document.getElementById(deleteButtonId);
            //add mouseover event
            if (deleteButton) {
              deleteButton.addEventListener("mouseover", function () {
                //console.log(3752, clickedStep.view.g.children)
                clickedStep.view.g.children[7].children[2].classList.remove(
                  "sqd-hidden"
                );
              });
              deleteButton.addEventListener("mouseout", function () {
                //console.log(3650, 'mouseout')
                clickedStep.view.g.children[7].children[2].classList.add(
                  "sqd-hidden"
                );
              });
              deleteButton.onclick = function () {
                promptChoices(fakeThis, "delete");
              };
            }
          }

          //click right popout
          console.log("workspace",clickedStep.view.g.children)
          if (clickedStep.view.g.children[4]) {
            const moreid = clickedStep.view.g.children[4].id.toString();
            const but = document.getElementById(moreid);
            if (but) {
              but.onclick = function () {
                console.log(3542, clickedStep.view.g.children[5]);
                clickedStep.view.g.children[5].classList.toggle("sqd-hidden");
              };
            }
          }
          //show dropdown
          if (clickedStep.view.g.children[5].children[2].id) {
            const dropdownButId =
              clickedStep.view.g.children[5].children[2].id.toString();
            //add mouseover event
            const dropdownBut = document.getElementById(dropdownButId);
            if (dropdownBut) {
              dropdownBut.addEventListener("mouseover", function () {
                clickedStep.view.g.children[7].children[0].classList.remove(
                  "sqd-hidden"
                );
              });
              dropdownBut.addEventListener("mouseout", function () {
                clickedStep.view.g.children[7].children[0].classList.add(
                  "sqd-hidden"
                );
              });
              dropdownBut.onclick = function (e) {
                e.stopPropagation();
                clickedStep.view.g.children[5].classList.toggle("sqd-hidden");
                clickedStep.view.g.children[6].classList.toggle("sqd-hidden");
                clickedStep.view.g.children[8].classList.toggle("sqd-hidden");
                clickedStep.view.g.children[10].classList.toggle("sqd-hidden");
                clickedStep.view.g.children[11].classList.toggle("sqd-hidden");
              };
            }
          }
          //show subdropdown
          if (clickedStep.view.g.children[10].children[1]) {
            const subDropdownButtonId =
              clickedStep.view.g.children[10].children[0].children[3].id.toString();
            const subDropdownButton =
              document.getElementById(subDropdownButtonId);
            if (subDropdownButton) {
              subDropdownButton.onclick = function () {
                console.log(3562, clickedStep.view.g.children[8]);
                clickedStep.view.g.children[10].children[1].classList.toggle(
                  "sqd-hidden"
                );
              };
            }
          }
          //show subdropdown1
          if (clickedStep.view.g.children[11].children[1]) {
            const subDropdownButtonId1 =
              clickedStep.view.g.children[11].children[0].children[3].id.toString();
            const subDropdownButton1 =
              document.getElementById(subDropdownButtonId1);
            if (subDropdownButton1) {
              subDropdownButton1.onclick = function () {
                clickedStep.view.g.children[11].children[1].classList.toggle(
                  "sqd-hidden"
                );
              };
            }
          }
          //upper subdropdown
          const selectRunUpperId =
            clickedStep.view.g.children[11].children[1].children[2].id.toString();
          const selectRunUpper = document.getElementById(selectRunUpperId);
          //console.log(4125, clickedStep.view.g.children[8].children[1].children[2])
          if (selectRunUpper)
            selectRunUpper.onclick = function () {
              {
                const showVal =
                  clickedStep.view.g.children[11].children[1].children[1]
                    .innerHTML;
                clickedStep.view.g.children[11].children[0].children[2].textContent =
                  showVal;
                clickedStep.view.g.children[3].textContent = showVal;
                clickedStep.view.g.children[8].children[1].classList.toggle(
                  "sqd-hidden"
                );
                clickedStep.step.properties["Select List"] = showVal;
                clickedStep.step.updatedAt = new Date();
              }
            };
          const selectRunUpperId1 =
            clickedStep.view.g.children[11].children[1].children[5].id.toString();
          const selectRunUpper1 = document.getElementById(selectRunUpperId1);
          if (selectRunUpper1) {
            selectRunUpper1.onclick = function () {
              const showVal =
                clickedStep.view.g.children[11].children[1].children[4]
                  .innerHTML;

              console.log(3589, showVal);
              clickedStep.view.g.children[11].children[0].children[2].textContent =
                showVal;
              clickedStep.view.g.children[3].textContent = showVal;
              clickedStep.view.g.children[11].children[1].classList.toggle(
                "sqd-hidden"
              );
              clickedStep.step.properties["Select List"] = showVal;
              clickedStep.step.updatedAt = new Date();
            };
          }
          //lower subdropdown
          const selectRunLowerId =
            clickedStep.view.g.children[10].children[1].children[2].id.toString();
          const selectRunLower = document.getElementById(selectRunLowerId);
          if (selectRunLower) {
            selectRunLower.onclick = function () {
              //console.log(4117, clickedStep.view.g.children)
              const showVal =
                clickedStep.view.g.children[10].children[1].children[1]
                  .innerHTML;
              clickedStep.view.g.children[10].children[0].children[2].textContent =
                showVal;
              clickedStep.view.g.children[10].children[1].classList.toggle(
                "sqd-hidden"
              );
              clickedStep.step.properties["Run"] = showVal;
            };
          }
          const selectRunLowerId1 =
            clickedStep.view.g.children[10].children[1].children[5].id.toString();
          const selectRunLower1 = document.getElementById(selectRunLowerId1);
          if (selectRunLower1) {
            selectRunLower1.onclick = function () {
              //console.log(3589, )
              const showVal =
                clickedStep.view.g.children[10].children[1].children[4]
                  .innerHTML;
              console.log(
                3596,
                clickedStep.view.g.children[10].children[0].children[2]
              );
              clickedStep.view.g.children[10].children[0].children[2].textContent =
                showVal;
              clickedStep.view.g.children[10].children[1].classList.toggle(
                "sqd-hidden"
              );
              clickedStep.step.properties["Run"] = showVal;
            };
          }
          if (clickedStep.view.g.children[5].children[0]) {
            const duplicateId =
              clickedStep.view.g.children[5].children[0].id.toString();
            const duplicateBut = document.getElementById(duplicateId);
            if (duplicateBut) {
              duplicateBut.addEventListener("mouseover", function () {
                console.log(3752, clickedStep.view.g.children);
                clickedStep.view.g.children[7].children[1].classList.remove(
                  "sqd-hidden"
                );
              });
              duplicateBut.addEventListener("mouseout", function () {
                clickedStep.view.g.children[7].children[1].classList.add(
                  "sqd-hidden"
                );
              });
              const tempContext = this.context;
              duplicateBut.onclick = function (e) {
                e.stopPropagation();
                const duplicateStep = createStep(clickedStep.step);
                const pos = readMousePosition(e);
                duplicateStep.id =
                  "copy-" + clickedStep.step.id + "-at-" + Date.now();
                tempContext.behaviorController.start(
                  pos,
                  DragStepBehavior.create(tempContext, duplicateStep)
                );
              };
            }
          }
          if (clickedStep.view.g.children[8].children[2]) {
            const duplicateId =
              clickedStep.view.g.children[8].children[2].id.toString();
            const duplicateBut = document.getElementById(duplicateId);
            const tempContext = this.context;
            if (duplicateBut) {
              duplicateBut.onclick = function (e) {
                e.stopPropagation();
                const duplicateStep = createStep(clickedStep.step);
                const pos = readMousePosition(e);
                duplicateStep.id =
                  "copy-" + clickedStep.step.id + "-at-" + Date.now();
                tempContext.behaviorController.start(
                  pos,
                  DragStepBehavior.create(tempContext, duplicateStep)
                );
              };
            }
          }
        }
      }
    } else {
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
export function promptChoices(
  tempContext: DesignerContext,
  action: string,
  e?: MouseEvent
) {
  let output: string | number | null = null;
  // Create a propmt window
  const dialogBox = Dom.element("dialog", {
    class: "confirm-dialog",
    id: "dialog-box",
  });

  const title = Dom.element("h3", {
    class: "confirm-dialog-content",
  });

  let toDo;
  const form = Dom.element("form", {
    method: "dialog",
    id: "dialog-form",
  });
  if (tempContext.selectedStep?.componentType == "switch") {
    if (action == "delete") {
      toDo = ["Delete true path", "Delete false path", "Delete both"];
      title.innerText = "Which branch do you want to delete?";
    } else {
      toDo = [
        "Copy true path",
        "Copy false path",
        "Copy both",
        "Copy condition only",
      ];
      title.innerText = "Which branch do you want to duplicate?";
    }
    if (tempContext.selectedStep?.componentType == "switch") {
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
    }
  } else {
    title.innerText = "Are you sure to delete this block?";
  }
  dialogBox.appendChild(title);
  const btn1 = Dom.element("button", {
    type: "submit",
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
    designer?.removeChild(designer.childNodes[1]);
  });
  form.appendChild(btn2);
  dialogBox.appendChild(form);

  tempContext.layoutController.parent.appendChild(dialogBox);
  if (typeof dialogBox.showModal === "function") {
    dialogBox.showModal();
  } else {
    prompt("Wow from prompt window", "ok");
  }
  btn1.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (tempContext.selectedStep?.componentType == "switch") {
      var elem = document.getElementsByTagName("input");
      for (let i = 0; i < elem.length; i++) {
        if (elem[i].type == "radio" && elem[i].checked) {
          output = elem[i].value;
        }
      }
    } else {
      output = 2;
    }
    if (tempContext.selectedStep) {
      if (action == "delete") {
        tempContext.tryDeleteStep(tempContext.selectedStep, output);
      } else {
        const duplicateStep = createStep(tempContext.selectedStep);
        duplicateStep.branches.True = [];
        duplicateStep.branches.False = [];
        if (
          tempContext.selectedStep?.branches.True.length > 0 &&
          (output == 0 || output == 2)
        ) {
          for (
            let i = 0;
            i < tempContext.selectedStep?.branches.True.length;
            i++
          ) {
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
        if (
          tempContext.selectedStep?.branches.False.length > 0 &&
          (output == 1 || output == 2)
        ) {
          for (
            let i = 0;
            i < tempContext.selectedStep?.branches.False.length;
            i++
          ) {
            const step = createStep(
              tempContext.selectedStep?.branches.False[i]
            );
            step.id =
              "copy-" +
              tempContext.selectedStep?.branches.False[i].id +
              "-at-" +
              Date.now();
            duplicateStep.branches.False[i] = step;
          }
        }
        const pos = readMousePosition(e);
        duplicateStep.id =
          "copy-" + tempContext.selectedStep?.id + "-at-" + Date.now();
        tempContext.behaviorController.start(
          pos,
          DragStepBehavior.create(tempContext, duplicateStep)
        );
      }
      const designer = document.getElementById("designer");
      designer?.removeChild(designer.childNodes[1]);
    }
  });
}
function createStep(step: StepDefinition): Step {
  const newStep = ObjectCloner.deepClone(step) as Step;
  newStep.id = Uid.next();
  return newStep;
}

import { Dom } from "../../core/dom";
import { Vector } from "../../core/vector";
import { SwitchStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { JoinView } from "../common-views//join-view";
import { LabelView } from "../common-views//label-view";
import { RegionView } from "../common-views//region-view";
import { ValidationErrorView } from "../common-views//validation-error-view";
import { InputView } from "../common-views/input-view";
import { ComponentView } from "../component";
import { SequenceComponent } from "../sequence/sequence-component";

const MIN_CHILDREN_WIDTH = 150;
const PADDING_X = 12;
const PADDING_TOP = 20;
const LABEL_HEIGHT = 22;
const CONNECTION_HEIGHT = 16;
const RECT_RADIUS = 15;
const MIN_TEXT_WIDTH = 70;
const PADDING_Y = 10;
const ICON_SIZE = 22;
export class SwitchStepComponentView implements ComponentView {
  public static create(
    parent: SVGElement,
    step: SwitchStep,
    configuration: StepsConfiguration
  ): SwitchStepComponentView {
    const g = Dom.svg("g", {
      class: `sqd-switch-group sqd-type-${step.type}`,
    });
    parent.appendChild(g);

    const branchNames = Object.keys(step.branches);
    const sequenceComponents = branchNames.map((bn) =>
      SequenceComponent.create(g, step.branches[bn], configuration)
    );

    const maxChildHeight = Math.max(
      ...sequenceComponents.map((s) => s.view.height)
    );
    const containerWidths = sequenceComponents.map(
      (s) => Math.max(s.view.width, MIN_CHILDREN_WIDTH) + PADDING_X * 2
    );
    const containersWidth = containerWidths.reduce((p, c) => p + c, 0);
    // const containerHeight = maxChildHeight + PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT * 2;
    const containerOffsets: number[] = [];

    const joinXs = sequenceComponents.map((s) =>
      Math.max(s.view.joinX, MIN_CHILDREN_WIDTH / 2)
    );
    const boxHeight = ICON_SIZE + PADDING_Y ;
    const containerHeight =
      maxChildHeight +
      PADDING_TOP +
      LABEL_HEIGHT * 2 +
      CONNECTION_HEIGHT * 2 +
      boxHeight / 2;

    let totalX = 0;
    for (let i = 0; i < branchNames.length; i++) {
      containerOffsets.push(totalX);
      totalX += containerWidths[i];
    }
    // Create branch
    branchNames.forEach((branchName, i) => {
      const sequence = sequenceComponents[i];
      const offsetX = containerOffsets[i];

      LabelView.create(
        g,
        offsetX + joinXs[i] + PADDING_X,
        PADDING_TOP + LABEL_HEIGHT + CONNECTION_HEIGHT + boxHeight / 2,
        branchName,
        "secondary"
      );

      // const childEndY = PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + sequence.view.height;

      // const fillingHeight = containerHeight - childEndY - CONNECTION_HEIGHT;
      // if (fillingHeight > 0) {
      // 	JoinView.createStraightJoin(g, new Vector(containerOffsets[i] + joinXs[i] + PADDING_X, childEndY), fillingHeight);
      // }

      const sequenceX =
        offsetX +
        PADDING_X +
        Math.max((MIN_CHILDREN_WIDTH - sequence.view.width) / 2, 0);
      const sequenceY =
        PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + boxHeight / 2;
      JoinView.createStraightJoin(
        g,
        new Vector(
          containerOffsets[i] + joinXs[i] + PADDING_X,
          PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + boxHeight / 2
        ),
        120
      );

      Dom.translate(sequence.view.g, sequenceX, sequenceY);
    });
    // LabelView.create(g, containerWidths[0], PADDING_TOP, step.name);

    const g1 = Dom.svg("g");

    const text = Dom.svg("text", {
      x: ICON_SIZE + containerWidths[0] - PADDING_X/2-130,
      y: boxHeight / 1.7 + PADDING_TOP,
      class: "sqd-task-text",
    });
    text.textContent = "If/Else";
    g1.appendChild(text);
    const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH);
    const boxWidth = ICON_SIZE + 8 * PADDING_X + 2 * textWidth;

    const rect = Dom.svg("rect", {
      x: containerWidths[0] - textWidth-55,
      y: PADDING_TOP,
      class: "sqd-task-rect",
      width: boxWidth,
      height: boxHeight,
      rx: 15,
      ry: 15,
    });
    g1.insertBefore(rect, text);
    const rectLeft = Dom.svg("rect", {
      x: containerWidths[0] - textWidth-55,
      y: PADDING_TOP,
      class: "sqd-task-rect",
      width: textWidth + 5,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,

    });
    const textRight = Dom.svg("text", {
      x: ICON_SIZE + containerWidths[0] - PADDING_X*2,
      y: boxHeight / 1.7+PADDING_TOP,
      class: "sqd-task-text",

    });
    if (step.properties["subject"]) {
      textRight.textContent = step.properties["subject"].toString();
    }else{
      textRight.textContent = "Choose Condition";
    }
    g1.appendChild(textRight);
    g1.insertBefore(rectLeft, text);
    g1.appendChild(textRight);




    const moreUrl = "./assets/switch_more.svg";
    const moreIcon = moreUrl
      ? Dom.svg("image", {
          href: moreUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(moreIcon, {
      class: "more",
      id: Date.now(),
      x:  ICON_SIZE +containerWidths[0] + PADDING_X +  textWidth ,
      y: PADDING_TOP * 1.2,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    //add 3 icons
    const iconUrl1 = "./assets/copy.svg";
    // // add click event for icon
    const icon1 = iconUrl1
      ? Dom.svg("image", { href: iconUrl1 })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(icon1, {
      class: "moreicon",
      id: `RightCopyIcon-${step.id}`,
      x: containerWidths[0] + 5 * PADDING_X + 3*ICON_SIZE + 30,
      y: PADDING_TOP * 1.5,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    const iconUrl2 = "./assets/delete.svg";
    // add click event for icon
    const icon2 = iconUrl2
      ? Dom.svg("image", {
          href: iconUrl2,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(icon2, {
      class: "moreicon",
      id: `RightDeleteIcon-${step.id}`,
      x: containerWidths[0] + 5 * PADDING_X + 3*ICON_SIZE + 10,
      y: PADDING_TOP * 1.5 + 22,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    const iconUrl3 = "./assets/edit.svg";
    // add click event for icon
    const icon3 = iconUrl3
      ? Dom.svg("image", {
          href: iconUrl3,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(icon3, {
      class: "moreicon",
      id: `p${Date.now()}`,
      x: containerWidths[0] + 5 * PADDING_X + 3*ICON_SIZE + 10,
      y: PADDING_TOP * 1.5 - 22,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    const gRightPop3 = Dom.svg("g", {
      class: `sqd-switch-group right-popup sqd-hidden Collapsed`,
    });
    const gDropdown = Dom.svg("g", {
      class: `sqd-task-group dropdown sqd-hidden Collapsed`,
    });
    const rect1 = Dom.svg("rect", {
      x: containerWidths[0] - textWidth,
      y: PADDING_TOP + boxHeight,
      class: "sqd-task-rect",
      width: boxWidth,
      height: 2 * boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(rect1, {
      //class: 'sqd-hidden',
      id: `dropdown${Date.now()}`,
    });
    const nameText = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] - textWidth,
      y: 2 * boxHeight,
    });
    Dom.attrs(nameText, {
      //class: 'sqd-hidden',
      id: `dropdownword1${Date.now()}`,
    });
    const nameText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] - textWidth,
      y: 2.5 * boxHeight,
    });
    Dom.attrs(nameText1, {
      //class: 'sqd-hidden',
      id: `dropdownword2${Date.now()}`,
    });
    nameText.textContent = "Select List:";
    nameText1.textContent = "Run:";
    gDropdown.appendChild(nameText);
    gDropdown.appendChild(nameText1);
    gDropdown.insertBefore(rect1, nameText);
    const gSubDropdown = Dom.svg("g", {
      class: `sqd-switch-group sub-dropdown sqd-hidden Collapsed`,
    });
    const gSubDropdown1 = Dom.svg("g", {
      class: `sqd-switch-group sub-dropdown sqd-hidden Collapsed`,
    });
    const gSubDropdownbox = Dom.svg("g", {
      class: `sqd-switch-group sub-dropdownbox`,
    });
    const gSubDropdownbox1 = Dom.svg("g", {
      class: `sqd-switch-group sub-dropdownbox`,
    });

    const dropdownBoxShape = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 1.7 * boxHeight,
      //id: `dropdownBoxShape${Date.now()}`
    });
    const dropdownBoxShape1 = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 2.2 * boxHeight,
      //id: `dropdownBoxShape1${Date.now()}`
    });
    const dropdownRightButton = Dom.svg("text", {
      class: "sqd-task-text select-field",
      x: containerWidths[0] + 43,
      y: 1.85 * boxHeight,
    });
    const dropdownRightButton1 = Dom.svg("text", {
      class: "sqd-task-text select-field",
      x: containerWidths[0] + 43,
      y: 2.35 * boxHeight,
    });
    dropdownRightButton.textContent = "▼";
    dropdownRightButton1.textContent = "▼";
    const dropdownBoxInnerText = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] - 5,
      y: 1.85 * boxHeight,
    });
    dropdownBoxInnerText.textContent = "Select";
    const dropdownBoxInnerText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] - 5,
      y: 2.35 * boxHeight,
    });
    dropdownBoxInnerText1.textContent = "Select";
    const dropdownBoxShapeAfter = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 1.7 * boxHeight,
      id: `dropdownBoxShape${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShapeAfter, {
      opacity: 0,
    });
    const dropdownBoxShape1After = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 2.2 * boxHeight,
      id: `dropdownBoxShape1${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShape1After, {
      opacity: 0,
    });

    const dropdownBoxBottomShape = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 1.7 * boxHeight + 15,
    });
    const dropdownBoxBottomShapeText = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] - 5,
      y: 1.85 * boxHeight + 15,
    });
    dropdownBoxBottomShapeText.textContent = "Any list";
    const dropdownBoxBottomShapecover = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field choice",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 1.7 * boxHeight + 15,
      id: `dropdownBoxBottomShapecover${Date.now()}`,
    });
    Dom.attrs(dropdownBoxBottomShapecover, {
      opacity: 0.3,
    });
    const dropdownBoxBottomShapeS = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 1.7 * boxHeight + 30,
    });
    const dropdownBoxBottomShapeSText = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] - 5,
      y: 2.2 * boxHeight + 15,
    });
    dropdownBoxBottomShapeSText.textContent = "List A";
    const dropdownBoxBottomShapeScover = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field choice",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 1.7 * boxHeight + 30,
      id: `dropdownBoxBottomShapeScover${Date.now()}`,
    });
    Dom.attrs(dropdownBoxBottomShapeScover, {
      opacity: 0.3,
    });

    const dropdownBoxBottomShape1 = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 2.2 * boxHeight + 15,
    });

    const dropdownBoxBottomShape1Text = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] - 5,
      y: 2.35 * boxHeight + 15,
    });
    dropdownBoxBottomShape1Text.textContent = "Once";
    const dropdownBoxBottomShape1cover = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field choice",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 2.2 * boxHeight + 15,
      id: `dropdownBoxBottomShape1cover${Date.now()}`,
    });
    Dom.attrs(dropdownBoxBottomShape1cover, {
      opacity: 0.3,
    });
    const dropdownBoxBottomShape1S = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 2.2 * boxHeight + 30,
    });

    const dropdownBoxBottomShape1SText = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] - 5,
      y: 2.35 * boxHeight + 30,
    });
    dropdownBoxBottomShape1SText.textContent = "Multiple ";
    const dropdownBoxBottomShape1Scover = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field choice",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 5,
      y: 2.2 * boxHeight + 30,
      id: `dropdownBoxBottomShape1Scover${Date.now()}`,
    });
    Dom.attrs(dropdownBoxBottomShape1Scover, {
      opacity: 0.3,
    });

    const gSubDropdownboxPop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    const gSubDropdownbox1Pop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText);
    gSubDropdownboxPop.insertBefore(
      dropdownBoxBottomShape,
      dropdownBoxBottomShapeText
    );
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover);
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeSText);
    gSubDropdownboxPop.insertBefore(
      dropdownBoxBottomShapeS,
      dropdownBoxBottomShapeSText
    );
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeScover);

    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
    gSubDropdownbox1Pop.insertBefore(
      dropdownBoxBottomShape1,
      dropdownBoxBottomShape1Text
    );
    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1SText);
    gSubDropdownbox1Pop.insertBefore(
      dropdownBoxBottomShape1S,
      dropdownBoxBottomShape1SText
    );
    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Scover);

    gSubDropdownbox.appendChild(dropdownRightButton);
    gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButton);
    gSubDropdownbox.appendChild(dropdownBoxInnerText);
    gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
    gSubDropdown.appendChild(gSubDropdownbox);
    gSubDropdown.appendChild(gSubDropdownboxPop);

    gSubDropdownbox1.appendChild(dropdownRightButton1);
    gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButton1);
    gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
    gSubDropdownbox1.appendChild(dropdownBoxShape1After);
    gSubDropdown1.appendChild(gSubDropdownbox1);
    gSubDropdown1.appendChild(gSubDropdownbox1Pop);

    gRightPop3.appendChild(icon1);
    gRightPop3.appendChild(icon2);
    gRightPop3.appendChild(icon3);
    g1.appendChild(moreIcon);
    g.appendChild(g1);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);
    g.appendChild(gSubDropdown1);
    g.appendChild(gSubDropdown);

    // Add EventListeners
    moreIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      gRightPop3.classList.toggle("sqd-hidden");
    });
    // Copy
    // icon1.addEventListener("click", function () {
    //   console.log("copy if/else");
    //   console.log(configuration);
    // });
    // // Delete
    // icon2.addEventListener("click", function () {
    //   console.log("delete if/else");
    // });
    // Edit
    icon3.addEventListener("click", function (e) {
      e.stopPropagation();
      gDropdown.classList.toggle("sqd-hidden");
      gSubDropdown.classList.toggle("sqd-hidden");
      gSubDropdown1.classList.toggle("sqd-hidden");
    });

    // Show options
    gSubDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownbox.classList.toggle("sqd-hidden");
    });
    gSubDropdown1.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownbox1.classList.toggle("sqd-hidden");
    });
    gSubDropdownbox.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownboxPop.classList.toggle("sqd-hidden");
    });
    gSubDropdownbox1.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
    });

    JoinView.createStraightJoin(
      g,
      new Vector(containerWidths[0], 0),
      PADDING_TOP + boxHeight
    );
    JoinView.createJoins(
      g,
      new Vector(
        containerWidths[0],
        PADDING_TOP + LABEL_HEIGHT + boxHeight / 2
      ),
      containerOffsets.map(
        (o, i) =>
          new Vector(
            o + joinXs[i] + PADDING_X,
            PADDING_TOP + LABEL_HEIGHT + CONNECTION_HEIGHT + boxHeight / 2
          )
      )
    );

    const inputView = InputView.createRoundInput(g, containerWidths[0], 0);
    const regionView = RegionView.create(g, containerWidths, containerHeight);

    const validationErrorView = ValidationErrorView.create(
      g,
      containersWidth,
      0
    );

    return new SwitchStepComponentView(
      g,
      containersWidth,
      containerHeight,
      containerWidths[0],
      sequenceComponents,
      regionView,
      inputView,
      validationErrorView
      // icon1,
      // icon2,
      // icon3
    );
  }

  private constructor(
    public readonly g: SVGGElement,
    public readonly width: number,
    public readonly height: number,
    public readonly joinX: number,
    public readonly sequenceComponents: SequenceComponent[],
    private readonly regionView: RegionView,
    private readonly inputView: InputView,
    private readonly validationErrorView: ValidationErrorView
  ) // public readonly icon1: SVGElement,
  // public readonly icon2: SVGElement,
  // public readonly icon3: SVGElement
  {}

  public getClientPosition(): Vector {
    return this.regionView.getClientPosition();
  }

  public containsElement(element: Element): boolean {
    return this.g.contains(element);
  }

  public setIsDragging(isDragging: boolean) {
    this.inputView.setIsHidden(isDragging);
  }

  public setIsSelected(isSelected: boolean) {
    this.regionView.setIsSelected(isSelected);
  }

  public setIsDisabled(isDisabled: boolean) {
    Dom.toggleClass(this.g, isDisabled, "sqd-disabled");
  }

  public setIsValid(isValid: boolean) {
    this.validationErrorView.setIsHidden(isValid);
  }
}

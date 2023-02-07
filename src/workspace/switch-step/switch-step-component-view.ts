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
const PADDING_X = 20;
const PADDING_TOP = 20;
const LABEL_HEIGHT = 22;
const CONNECTION_HEIGHT = 16;
const RECT_RADIUS = 15;
const MIN_TEXT_WIDTH = 98; // 70
const PADDING_Y = 10;
const ICON_SIZE = 22;
const DROPDOWN_Y = 90;
const DROPDOWN_X1 = 70;
const DROPDOWN_X2 = 160;
const DROPDOWN_X3 = 230;
var choice1: string | null = 'Condition 1';
export class SwitchStepComponentView implements ComponentView {
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
  { }

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
    const boxHeight = ICON_SIZE + PADDING_Y; // 32
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
      x: ICON_SIZE + containerWidths[0] - PADDING_X / 2 - 160,
      y: boxHeight / 1.7 + PADDING_TOP,
      class: "sqd-task-text",
    });
    text.textContent = "If/Else";
    g1.appendChild(text);
    const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH);
    const boxWidth = ICON_SIZE + 8 * PADDING_X + 2 * textWidth;

    const rect = Dom.svg("rect", {
      x: containerWidths[0] - textWidth - 85,
      y: PADDING_TOP,
      class: "sqd-task-rect",
      width: boxWidth,
      height: boxHeight,
      rx: 15,
      ry: 15,
    });
    g1.insertBefore(rect, text);
    const rectLeft = Dom.svg("rect", {
      x: containerWidths[0] - textWidth - 85,
      y: PADDING_TOP,
      class: "sqd-task-rect",
      width: textWidth + 5,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,

    });
    const textRight = Dom.svg("text", {
      x: ICON_SIZE + containerWidths[0] + 40,
      y: boxHeight / 1.7 + PADDING_TOP,
      class: "sqd-task-text",

    });
    if (step.properties["subject"]) {
      textRight.textContent = step.properties["subject"].toString();
    } else {
      textRight.textContent = "Choose Condition";
    }
    g1.appendChild(textRight);
    g1.insertBefore(rectLeft, text);
    g1.appendChild(textRight);


    const moreUrl = "./assets/more.svg";
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
      x: ICON_SIZE + containerWidths[0] + PADDING_X + textWidth + 28, //302
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
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 50,
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
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 30,
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
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 30,
      y: PADDING_TOP * 1.5 - 22,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    const gRightPop3 = Dom.svg("g", {
      class: `sqd-switch-group right-popup sqd-hidden Collapsed`,
    });

    // ===================== Dropdown start 
    const gDropdown = Dom.svg("g", {
      class: `sqd-task-group dropdown sqd-hidden Collapsed`,
    });
    const rect1 = Dom.svg("rect", {
      x: 5,
      y: 53,
      class: "sqd-task-rect",
      width: boxWidth,
      height: 2.5 * boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(rect1, {
      id: `dropdown${Date.now()}`,
    });

    const nameText = Dom.svg("text", {
      class: "sqd-task-text",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y,
    });
    Dom.attrs(nameText, {
      //class: 'sqd-hidden',
      id: `dropdownword${Date.now()}`,
    });
    const nameText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: 13.3 * PADDING_X,
      y: DROPDOWN_Y,
    });
    Dom.attrs(nameText1, {
      //class: 'sqd-hidden',
      id: `dropdownword1${Date.now()}`,
    });
    const nameText2 = Dom.svg("text", {
      class: "sqd-task-text",
      x: 20.8 * PADDING_X,
      y: DROPDOWN_Y,
    });
    Dom.attrs(nameText2, {
      //class: 'sqd-hidden',
      id: `dropdownword2${Date.now()}`,
    });

    nameText.textContent = "";
    nameText1.textContent = "";
    nameText2.textContent = ""
    gDropdown.appendChild(nameText);
    gDropdown.appendChild(nameText1);
    gDropdown.appendChild(nameText2);
    gDropdown.insertBefore(rect1, nameText);
    const gSubDropdown = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
    });
    const gSubDropdown1 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
    });
    const gSubDropdown2 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
    });

    const gSubDropdownbox = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox`,
    });
    const gSubDropdownbox1 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox`,
    });
    const gSubDropdownbox2 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox`,
    });

    const dropdownBoxShape = Dom.svg("rect", {
      width: 80,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y,
    });
    const dropdownBoxShape1 = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: DROPDOWN_X2,
      y: DROPDOWN_Y,
    });
    const dropdownBoxShape2 = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: DROPDOWN_X3,
      y: DROPDOWN_Y,
    });

    const dropdownRightButton = Dom.svg("text", {
      class: "sqd-task-text select-field",
      x: DROPDOWN_X1 + 65,
      y: DROPDOWN_Y + 8,
    });
    const dropdownRightButton1 = Dom.svg("text", {
      class: "sqd-task-text select-field",
      x: DROPDOWN_X2 + 45,
      y: DROPDOWN_Y + 8,
    });
    const dropdownRightButton2 = Dom.svg("text", {
      class: "sqd-task-text select-field",
      x: DROPDOWN_X3 + 45,
      y: DROPDOWN_Y + 8,
    });

    dropdownRightButton.textContent = "▼";
    dropdownRightButton1.textContent = "▼";
    dropdownRightButton2.textContent = "▼";

    const dropdownBoxInnerText = Dom.svg("text", {
      class: "sqd-task-text",
      x: DROPDOWN_X1 + 3,
      y: DROPDOWN_Y + 7,
    });
    dropdownBoxInnerText.textContent = "Condition";
    const dropdownBoxInnerText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: DROPDOWN_X2 + 3,
      y: DROPDOWN_Y + 7,
    });
    dropdownBoxInnerText1.textContent = "";
    const dropdownBoxInnerText2 = Dom.svg("text", {
      class: "sqd-task-text",
      x: DROPDOWN_X3 + 3,
      y: DROPDOWN_Y + 7,
    });
    dropdownBoxInnerText2.textContent = "";

    const dropdownBoxShapeAfter = Dom.svg("rect", {
      width: 75,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y,
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
      x: DROPDOWN_X2,
      y: DROPDOWN_Y,
      id: `dropdownBoxShape1${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShape1After, {
      opacity: 0,
    });
    const dropdownBoxShape2After = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: DROPDOWN_X3,
      y: DROPDOWN_Y,
      id: `dropdownBoxShape2${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShape2After, {
      opacity: 0,
    });


    // Iterate thourgh list items and create options
    // Sub dropdown menues
    const gSubDropdownboxPop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    const gSubDropdownbox1Pop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    const gSubDropdownbox2Pop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });

    // Options 1
    let list1 = ['Condition 1', 'Condition 2', 'Condition 3'];
    let list2 = [''];
    let list2_1 = ['item1_1', 'item1_2', 'item1_3'];
    let list2_2 = ['item2_1', 'item2_2', 'item2_3'];
    let list3 = ['Content 1', 'Content 2', 'Content 3'];
    for (let i = 1; i <= list1.length; i++) {
      const dropdownBoxBottomShape = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: DROPDOWN_X1,
        y: DROPDOWN_Y + 15 * i,
      });
      const dropdownBoxBottomShapeText = Dom.svg("text", {
        class: "sqd-task-text",
        x: DROPDOWN_X1 + 2,
        y: DROPDOWN_Y + 5 + 15 * i,
      });
      dropdownBoxBottomShapeText.textContent = list1[i - 1];
      const dropdownBoxBottomShapecover = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field choice",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: DROPDOWN_X1,
        y: DROPDOWN_Y + 15 * i,
        id: `dropdownBoxBottomShapecover${Date.now()}`,
      });
      Dom.attrs(dropdownBoxBottomShapecover, {
        opacity: 0.3,
      });

      // Add event listners
      dropdownBoxBottomShapecover.addEventListener("click", function (e) {
        dropdownBoxInnerText.textContent = dropdownBoxBottomShapeText.textContent;
        gSubDropdownboxPop.classList.toggle("sqd-hidden");
        choice1 = dropdownBoxInnerText.textContent;
        if (choice1 == 'Condition 1') {
          list2 = list2_1;
        } else if (choice1 == 'Condition 2') {
          list2 = list2_2; 
        }
        for (let i = 1; i <= list2.length; i++) {
          const dropdownBoxBottomShape1 = Dom.svg("rect", {
            width: 60,
            height: 15,
            class: "option select-field",
            fill: "#fff",
            stroke: "#a0a0a0",
            x: DROPDOWN_X2,
            y: DROPDOWN_Y + 15 * i,
          });

          const dropdownBoxBottomShape1Text = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X2 + 2,
            y: DROPDOWN_Y + 5 + 15 * i,
          });
          dropdownBoxBottomShape1Text.textContent = list2[i - 1];

          const dropdownBoxBottomShape1cover = Dom.svg("rect", {
            width: 60,
            height: 15,
            class: "option select-field choice",
            fill: "#fff",
            stroke: "#a0a0a0",
            x: DROPDOWN_X2,
            y: DROPDOWN_Y + 15 * i,
            id: `dropdownBoxBottomShape1cover${Date.now()}`,
          });
          Dom.attrs(dropdownBoxBottomShape1cover, {
            opacity: 0.3,
          });

          // Add event listners
          dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
            dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
            gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
            console.log(dropdownBoxInnerText.textContent);
          });
          // Append Child
          gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
          gSubDropdownbox1Pop.insertBefore(
            dropdownBoxBottomShape1,
            dropdownBoxBottomShape1Text
          );
          gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
        }

      });
      gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText);
      gSubDropdownboxPop.insertBefore(
        dropdownBoxBottomShape,
        dropdownBoxBottomShapeText
      );
      gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover);

    }


    // Action choices 

    // Options 2
    // console.log(dropdownBoxInnerText.textContent); 
    // dropdownBoxInnerText.textContent = 'Condition 1'; 
    // choice1 = 'Condition 1'; 

    // Action time choices

    // Options 3
    for (let i = 1; i <= list3.length; i++) {
      const dropdownBoxBottomShape2 = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: DROPDOWN_X3,
        y: DROPDOWN_Y + 15 * i,
      });

      const dropdownBoxBottomShape2Text = Dom.svg("text", {
        class: "sqd-task-text",
        x: DROPDOWN_X3 + 2,
        y: DROPDOWN_Y + 5 + 15 * i,
      });
      dropdownBoxBottomShape2Text.textContent = list3[i - 1];
      const dropdownBoxBottomShape2cover = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field choice",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: DROPDOWN_X3,
        y: DROPDOWN_Y + 15 * i,
        id: `dropdownBoxBottomShape2cover${Date.now()}`,
      });
      Dom.attrs(dropdownBoxBottomShape2cover, {
        opacity: 0.3,
      });

      // Add event listners
      dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
        dropdownBoxInnerText2.textContent = dropdownBoxBottomShape2Text.textContent;
        gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
      });
      // Append Child
      gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
      gSubDropdownbox2Pop.insertBefore(
        dropdownBoxBottomShape2,
        dropdownBoxBottomShape2Text
      );
      gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
    }

    // =================== Append
    gSubDropdownbox.appendChild(dropdownRightButton);
    gSubDropdownbox1.appendChild(dropdownRightButton1);
    gSubDropdownbox2.appendChild(dropdownRightButton2);
    gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButton);
    gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButton1);
    gSubDropdownbox2.insertBefore(dropdownBoxShape2, dropdownRightButton2);
    gSubDropdownbox.appendChild(dropdownBoxInnerText);
    gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
    gSubDropdownbox2.appendChild(dropdownBoxInnerText2);
    gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
    gSubDropdownbox1.appendChild(dropdownBoxShape1After);
    gSubDropdownbox2.appendChild(dropdownBoxShape2After);
    gSubDropdown.appendChild(gSubDropdownbox);
    gSubDropdown.appendChild(gSubDropdownboxPop);
    gSubDropdown1.appendChild(gSubDropdownbox1);
    gSubDropdown1.appendChild(gSubDropdownbox1Pop);
    gSubDropdown2.appendChild(gSubDropdownbox2);
    gSubDropdown2.appendChild(gSubDropdownbox2Pop);
    gRightPop3.appendChild(icon1);
    gRightPop3.appendChild(icon2);
    gRightPop3.appendChild(icon3);

    gDropdown.appendChild(gSubDropdown2);
    gDropdown.appendChild(gSubDropdown1);
    gDropdown.appendChild(gSubDropdown);
    g1.appendChild(moreIcon);
    g.appendChild(g1);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);

    // Add EventListeners
    moreIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      gRightPop3.classList.toggle("sqd-hidden");
    });

    // Edit
    icon3.addEventListener("click", function (e) {
      e.stopPropagation();
      gDropdown.classList.toggle("sqd-hidden");
      gSubDropdown.classList.toggle("sqd-hidden");
      gSubDropdown1.classList.toggle("sqd-hidden");
      gSubDropdown2.classList.toggle("sqd-hidden");
    });

    // Event listeners in Dropdown
    dropdownBoxShapeAfter.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownboxPop.classList.toggle("sqd-hidden");
      if (!gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
        gSubDropdownbox1Pop.classList.remove("sqd-hidden");
      }
    });
    dropdownBoxShape1After.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
      if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
        gSubDropdownboxPop.classList.remove("sqd-hidden");
      }
    });
    dropdownBoxShape2After.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
      if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
        gSubDropdownboxPop.classList.remove("sqd-hidden");
      }
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

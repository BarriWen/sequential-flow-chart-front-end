import { Dom } from "../../core/dom";
import { Vector } from "../../core/vector";
import { SwitchStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { JoinView } from "../common-views//join-view";
import { LabelView } from "../common-views//label-view";
import { RegionView } from "../common-views//region-view";
import { ValidationErrorView } from "../common-views//validation-error-view";
import { ComponentView } from "../component";
import { SequenceComponent } from "../sequence/sequence-component";
import { countryList, usStateList } from "./variousCountryListFormats";
import { ScrollBoxViewCountry } from "./scrollbox-view-country";
import { ScrollBoxViewLocation } from "./scrollbox-view-location";
import { ScrollBoxViewState } from "./scrollbox-view-state";

const MIN_CHILDREN_WIDTH = 200;
const PADDING_X = 12;
const PADDING_TOP = 20;
const LABEL_HEIGHT = 22;
const CONNECTION_HEIGHT = 16;
const RECT_RADIUS = 15;
const MIN_TEXT_WIDTH = 98;
const PADDING_Y = 10;
const ICON_SIZE = 22;
const DROPDOWN1_W = 120;
const DROPDOWN2_W = 125;
const DROPDOWN3_W = 120;
const DROPDOWN_H = 25;

export class SwitchStepComponentView implements ComponentView {
  private constructor(
    public readonly g: SVGGElement,
    public readonly width: number,
    public readonly height: number,
    public readonly joinX: number,
    public readonly sequenceComponents: SequenceComponent[],
    private readonly regionView: RegionView,
    private readonly scrollboxViewCountry: ScrollBoxViewCountry,
    private readonly scrollboxViewLocation: ScrollBoxViewLocation,
    private readonly scrollBoxViewState: ScrollBoxViewState,
    private readonly validationErrorView: ValidationErrorView // public readonly icon1: SVGElement, // public readonly icon2: SVGElement, // public readonly icon3: SVGElement
  ) {}

  public static create(
    parent: SVGElement,
    step: SwitchStep,
    configuration: StepsConfiguration
  ): SwitchStepComponentView {
    const g = Dom.svg("g", {
      class: `sqd-switch-group sqd-type-${step.type}`,
    });
    // parent.appendChild(g);
    parent.insertBefore(g, parent.firstChild);
    const branchNames = Object.keys(step.branches);
    const labelNames = ["YES", "NO"];
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

    // Data and UI recovery setup - click and input simulation
    let fakeClick = new Event("click", {
      bubbles: true,
      cancelable: true,
    });
    const fakeInput = new Event("input", {
      bubbles: true,
      cancelable: true,
    });

    // Popup text setup
    const gHint = Dom.svg("g", {
      class: "sqd-task-group-pop",
    });
    const hint_mark = Dom.svg("image", {
      x: ICON_SIZE + containerWidths[0] - 11,
      y: boxHeight / 2.0 - 12,
      width: 12,
      height: 12,
      href: "../assets/exclamation.svg",
    });
    const hint_text = Dom.svg("text", {
      // class: "sqd-task-text",
      x: ICON_SIZE + containerWidths[0] + 2,
      y: boxHeight / 2.0 - 2,
      fill: "#F00000",
      "font-size": "11px",
    });
    hint_text.textContent = "Finish the setting";
    gHint.appendChild(hint_mark);
    gHint.appendChild(hint_text);

    // Create branch
    branchNames.forEach((branchName, i) => {
      const sequence = sequenceComponents[i];
      const offsetX = containerOffsets[i];

      LabelView.create(
        g,
        offsetX + joinXs[i] + PADDING_X,
        PADDING_TOP + LABEL_HEIGHT + CONNECTION_HEIGHT + boxHeight / 2,
        labelNames[i],
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

    const DROPDOWN_Y = 80;
    const DROPDOWN_X1 = containerWidths[0] - 190; //
    const DROPDOWN_X2 = containerWidths[0] - 62; //
    const DROPDOWN_X3 = containerWidths[0] + 70; //
    const g1 = Dom.svg("g");

    const text = Dom.svg("text", {
      x: ICON_SIZE + containerWidths[0] - PADDING_X * 17 + 69, // * 17 - 10
      y: boxHeight / 2.0 + PADDING_TOP + 1,
      class: "sqd-task-text sqd-switch-text encapsulated",
    });
    text.textContent = "If/Else";
    const textMid = Dom.svg("text", {
      x: ICON_SIZE + containerWidths[0] - PADDING_X * 3 - 5,
      y: boxHeight / 2.0 + PADDING_TOP + 1,
      class: "sqd-task-text capsule sqd-hidden",
    });
    textMid.textContent = "If/Else";
    g1.appendChild(text);
    g1.appendChild(textMid);
    const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH);
    const boxWidth = ICON_SIZE + 16 * PADDING_X + 2 * textWidth;

    const rectMid = Dom.svg("rect", {
      x: containerWidths[0] - textWidth + 56,
      y: PADDING_TOP,
      class: "sqd-switch-rect capsule sqd-hidden",
      width: 90,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    g1.appendChild(rectMid);

    const rect = Dom.svg("rect", {
      x: containerWidths[0] - textWidth - 28, // 19 (-107)
      y: PADDING_TOP,
      class: "sqd-switch-rect encapsulated",
      width: 258, // boxWidth,
      height: boxHeight,
      rx: 15,
      ry: 15,
    });
    g1.insertBefore(rect, text);
    const rectLeft = Dom.svg("rect", {
      x: containerWidths[0] - textWidth - 28, // 19 (-107)
      y: PADDING_TOP,
      class: "sqd-switch-rect-left encapsulated",
      width: textWidth - 35,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    const textRight = Dom.svg("text", {
      x: ICON_SIZE + containerWidths[0] - PADDING_X * 5,
      y: boxHeight / 2.0 + PADDING_TOP,
      class: "task-title switch-title encapsulated",
      width: 300,
    });

    if (step.properties["property"] &&  step.properties["property"] != "") {
        textRight.textContent = step.properties["property"].toString();
    } else {
      textRight.textContent = "Condition Settings";
    }
    
    g1.appendChild(textRight);
    g1.insertBefore(rectLeft, text);
    g1.insertBefore(rectMid, textMid);
    g1.appendChild(textRight);

    const textRightReminder = Dom.svg("text", {
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 132,
      y: boxHeight / 2,
      class: "sqd-task-text",
    });
    textRightReminder.textContent = "Please set up your filter";
    const rectRight = Dom.svg("rect", {
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 80,
      y: 0.5,
      class: "sqd-task-rect",
      width: boxWidth,
      height: 2 * boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    const rectRightLine = Dom.svg("line", {
      class: "sqd-join",
      x1: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
      x2: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 81,
      y1: 15,
      y2: 15,
    });
    const clickOkBut = Dom.svg("rect", {
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 182,
      y: 1.25 * boxHeight,
      class: "sqd-task-rect",
      width: 40,
      height: 20,
      rx: 5,
      ry: 5,
    });
    const clickOkButCover = Dom.svg("rect", {
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 182,
      y: 1.25 * boxHeight,
      class: "option select-field choice",
      width: 40,
      height: 20,
      rx: 5,
      ry: 5,
      id: `clickOkButCover${Date.now()}`,
    });
    Dom.attrs(clickOkButCover, {
      opacity: 0.1,
    });
    const clickOkText = Dom.svg("text", {
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 192,
      y: 1.55 * boxHeight,
      class: "sqd-task-text",
    });
    clickOkText.textContent = "OK";
    const setUpReminder = Dom.svg("g", {
      class: `sqd-task-group setup-reminder sqd-hidden`,
    });
    setUpReminder.appendChild(rectRightLine);
    setUpReminder.appendChild(textRightReminder);
    setUpReminder.insertBefore(rectRight, textRightReminder);
    setUpReminder.appendChild(clickOkText);
    setUpReminder.insertBefore(clickOkBut, clickOkText);
    setUpReminder.appendChild(clickOkButCover);

    const moreUrl = "../assets/triDotIcon.svg";
    const moreIcon = moreUrl
      ? Dom.svg("image", {
          href: moreUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon sqd-task-more-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(moreIcon, {
      class: "moreIcon encapsulated",
      x: ICON_SIZE + containerWidths[0] + PADDING_X + textWidth - 27, //
      y: PADDING_TOP * 1.2, // = 24
      width: ICON_SIZE,
      height: ICON_SIZE,
    });

    // =========== More icons
    // =========== COPY icon
    const rightCopyImgContainer = Dom.svg("g", {
      class: "sqd-task-copyImgContainer",
    });
    const rightCopyImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 90 - 77,
      y: PADDING_Y + 10, //
    });
    Dom.attrs(rightCopyImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const changeUrl = "../assets/copy.svg";
    const changeUrlWhite = "../assets/copy2.svg";
    const changeIcon = changeUrl
      ? Dom.svg("image", {
          href: changeUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(changeIcon, {
      class: "moreicon",
      id: `RightCopyIcon-${step.id}`,
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 93 - 77,
      y: PADDING_Y + 14,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
    rightCopyImgContainer.appendChild(changeIcon);

    // ============= DELETE icon
    const rightDeleteImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const rightDeleteImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 70 - 74,
      y: PADDING_Y + 43,
    });
    Dom.attrs(rightDeleteImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const deleteUrl = "../assets/delete.svg";
    const deleteUrlWhite = "../assets/delete2.svg";
    const deleteIcon = deleteUrl
      ? Dom.svg("image", {
          href: deleteUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(deleteIcon, {
      class: "moreicon",
      id: `RightDeleteIcon-${step.id}`,
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 73 - 74,
      y: PADDING_Y + 46,
      width: 22,
      height: 22,
    });
    rightDeleteImgContainer.appendChild(rightDeleteImgContainerCircle);
    rightDeleteImgContainer.appendChild(deleteIcon);

    // ============ EDIT icon
    const rightEditImgContainer = Dom.svg("g", {
      class: "sqd-task-editImgContainer",
    });
    const rightEditImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 70 - 74, // 366
      y: PADDING_Y - 23, // -30
    });
    Dom.attrs(rightEditImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const editUrl = "../assets/edit.svg";
    const editUrlWhite = "../assets/edit2.svg";
    const editIcon = editUrl
      ? Dom.svg("image", {
          href: editUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(editIcon, {
      class: "moreicon",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 73 - 74,
      y: PADDING_Y - 19,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    rightEditImgContainer.appendChild(rightEditImgContainerCircle);
    rightEditImgContainer.appendChild(editIcon);

    // =============== Up more icons
    const checkImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const checkImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-checkContainerCircle",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE - 26,
      y: PADDING_Y - 30,
    });
    Dom.attrs(checkImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const upCheckIconUrl = "../assets/check-inside.svg";
    const upCheckIcon = upCheckIconUrl
      ? Dom.svg("image", {
          href: upCheckIconUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(upCheckIcon, {
      class: "moreicon",
      // id: `tagUpCheckIcon`,
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE - 22,
      y: PADDING_Y - 26,
      width: 22,
      height: 22,
    });
    checkImgContainer.appendChild(checkImgContainerCircle);
    checkImgContainer.appendChild(upCheckIcon);
    const deleteImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const deleteImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 44,
      y: PADDING_Y - 30,
    });
    Dom.attrs(deleteImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const upDeleteIconUrl = "../assets/delete.svg";
    const upDeleteIcon = upDeleteIconUrl
      ? Dom.svg("image", {
          href: upDeleteIconUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(upDeleteIcon, {
      class: "moreicon",
      id: `UpDeleteIcon-${step.id}`,
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 48,
      y: PADDING_Y - 26,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    deleteImgContainer.appendChild(deleteImgContainerCircle);
    deleteImgContainer.appendChild(upDeleteIcon);

    const copyImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const copyImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 11,
      y: PADDING_Y - 30,
    });
    Dom.attrs(copyImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const upchangeUrl = "../assets/change.svg";
    const upchangeIcon = upchangeUrl
      ? Dom.svg("image", {
          href: upchangeUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(upchangeIcon, {
      class: "moreicon",
      id: `UpChangeIcon-${step.id}`,
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 16,
      y: PADDING_Y - 26,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    copyImgContainer.appendChild(copyImgContainerCircle);
    copyImgContainer.appendChild(upchangeIcon);
    const gRightPop3 = Dom.svg("g", {
      class: `sqd-task-group right-popup sqd-hidden Collapsed`,
    });
    const gUpPop3 = Dom.svg("g", {
      class: `sqd-task-group up-popup sqd-hidden`,
    });
    //add reminder prompt
    const gRightPop3Reminder = Dom.svg("g", {
      class: `sqd-task-group right-popup-reminder`,
    });
    const gRightPop3Reminder1 = Dom.svg("g", {
      class: `sqd-task-group right-popup-reminder sqd-hidden`,
    });
    const gRightPop3Reminder2 = Dom.svg("g", {
      class: `sqd-task-group right-popup-reminder sqd-hidden`,
    });
    const gRightPop3Reminder3 = Dom.svg("g", {
      class: `sqd-task-group right-popup-reminder sqd-hidden`,
    });

    const reminder1 = Dom.svg("rect", {
      x: 0.5,
      y: 0.5,
      class: "sqd-task-rect-pop",
      width: 50,
      height: 25,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(reminder1, {
      id: `reminder1${Date.now()}`,
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 107 - 74, //
      y: PADDING_Y - 18, // -25 -> -8
    });

    const reminderText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 107 + 13 - 74,
      y: PADDING_Y - 6,
    });
    Dom.attrs(reminderText1, {
      //class: 'sqd-hidden',
      id: `reminderText${Date.now()}`,
    });
    reminderText1.textContent = "Edit";

    const reminder2 = Dom.svg("rect", {
      x: 0.5,
      y: 0.5,
      class: "sqd-task-rect-pop",
      width: 50,
      height: 25,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(reminder2, {
      id: `reminder2${Date.now()}`,
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 127 - 77,
      y: PADDING_Y + 13,
    });

    const reminderText2 = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 127 + 10 - 77,
      y: PADDING_Y + 13 + 12,
    });
    Dom.attrs(reminderText2, {
      //class: 'sqd-hidden',
      id: `reminderText2${Date.now()}`,
    });
    reminderText2.textContent = "Copy";

    const reminder3 = Dom.svg("rect", {
      x: 0.5,
      y: 0.5,
      class: "sqd-task-rect-pop",
      width: 50,
      height: 25,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(reminder3, {
      id: `reminder3${Date.now()}`,
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 107 - 74,
      y: PADDING_Y + 43,
    });

    const reminderText3 = Dom.svg("text", {
      class: "sqd-task-text",
      x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 107 + 6 - 74,
      y: PADDING_Y + 43 + 12,
    });
    Dom.attrs(reminderText3, {
      //class: 'sqd-hidden',
      id: `reminderText3${Date.now()}`,
    });
    reminderText3.textContent = "Delete";
    gRightPop3Reminder1.appendChild(reminderText1);
    gRightPop3Reminder1.insertBefore(reminder1, reminderText1);
    gRightPop3Reminder2.appendChild(reminderText2);
    gRightPop3Reminder2.insertBefore(reminder2, reminderText2);
    gRightPop3Reminder3.appendChild(reminderText3);
    gRightPop3Reminder3.insertBefore(reminder3, reminderText3);
    gRightPop3Reminder.appendChild(gRightPop3Reminder1);
    gRightPop3Reminder.appendChild(gRightPop3Reminder2);
    gRightPop3Reminder.appendChild(gRightPop3Reminder3);
    gRightPop3.appendChild(rightCopyImgContainer);
    gRightPop3.appendChild(rightDeleteImgContainer);
    gRightPop3.appendChild(rightEditImgContainer);
    gUpPop3.appendChild(checkImgContainer);
    gUpPop3.appendChild(deleteImgContainer);
    gUpPop3.appendChild(copyImgContainer);

    // ============ Add dropdowns =============
    // ======= Start with general node ========
    const gDropdown = Dom.svg("g", {
      class: `sqd-task-group dropdown sqd-hidden`, // Collapsed
    });

    const gDropdownbox = Dom.svg("g", {
      class: `sqd-task-group dropdownbox`,
    });

    // gDropdown.appendChild(gDropdownbox);

    const rect1 = Dom.svg("rect", {
      x: containerWidths[0] - textWidth - 107,
      y: PADDING_TOP + 8,
      class: "sqd-switch-rect sqd-shrinkable",
      width: boxWidth,
      height: 3 * boxHeight + 10,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(rect1, {
      id: `dropdown${Date.now()}`,
    });

    gDropdown.appendChild(rect1);

    const rectInnerBorder = Dom.svg("rect", {
      x: containerWidths[0] - textWidth - 100,
      y: PADDING_TOP + 47,
      class: "sqd-switch-inner-rect",
      width: boxWidth - 15,
      height: boxHeight + 20, // 72 boxHeight = 32
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });

    const actConditonText = Dom.svg("text", {
      x: DROPDOWN_X3 - 31,
      y: DROPDOWN_Y + 12,
      class: "sqd-task-text",
    });
    actConditonText.textContent = "In";

    const addConditionText = Dom.svg("text", {
      x: DROPDOWN_X1 + 3,
      y: PADDING_TOP + 108,
      class: "add-cond-text",
    });

    addConditionText.textContent = "+ Add another condition";

    const addSegmentBtnClickArea = Dom.svg("rect", {
      class: "sqd-add-seg-area",
      x: containerWidths[0] - textWidth - 94,
      y: PADDING_TOP + 145,
      width: boxWidth - 25,
      height: 33,
      fill: "rgba(255, 255, 255, 0)",
    });

    const addSegBtnTitle = Dom.svg("text", {
      class: "add-seg-btn-title",
      x: containerWidths[0] - textWidth + 96, // 56
      y: PADDING_TOP + 167, // 270
    });

    addSegBtnTitle.textContent = "Add a new segment group";
    // addSegmentBtnArea.appendChild(addSegBtnTitle);

    const addSegmentBtn = Dom.svg("rect", {
      class: "sqd-add-seg-btn",
      x: containerWidths[0] - textWidth - 94,
      y: PADDING_TOP + 145,
      width: boxWidth - 25,
      height: 33,
      rx: 17,
      ry: 17,
    });

    // gDropdownbox.appendChild(rectInnerBorder);
    gDropdown.appendChild(actConditonText);
    // gDropdownbox.appendChild(addSegmentBtn);
    // gDropdownbox.appendChild(addSegBtnTitle);
    // gDropdownbox.appendChild(addSegmentBtnClickArea);
    // gDropdownbox.appendChild(addConditionText);

    // =============== gSubDropdown
    const gSubDropdown = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown sqd-hidden`,
    });
    const gSubDropdown1 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown sqd-hidden`,
    });
    const gSubDropdown2 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown sqd-hidden`,
    });
    const gSubDropdownAct1 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown sqd-hidden`,
    });
    const gSubDropdownAct2 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown sqd-hidden`,
    });
    const gSubDropdownMain1 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown`,
    });
    const gSubDropdownMain2 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown`,
    });

    // ================== dropdownBoxShape
    const dropdownBoxShape = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y,
      rx: 5,
      ry: 5,
    });
    const dropdownBoxShape1 = Dom.svg("rect", {
      width: DROPDOWN2_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X2,
      y: DROPDOWN_Y,
      rx: 5,
      ry: 5,
    });
    const dropdownBoxShape2 = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X3,
      y: DROPDOWN_Y,
      rx: 5,
      ry: 5,
    });
    const dropdownBoxShapeAct1 = Dom.svg("rect", {
      width: DROPDOWN2_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X2 - 30,
      y: DROPDOWN_Y,
      rx: 5,
      ry: 5,
    });
    const dropdownBoxShapeAct2 = Dom.svg("rect", {
      width: 70,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X3 + 50,
      y: DROPDOWN_Y,
      rx: 5,
      ry: 5,
    });
    const dropdownBoxShapeMain1 = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "rgba(255, 255, 255, 0)",
      // stroke: "#a0a0a0",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y + DROPDOWN_H + 8,
      rx: 5,
      ry: 5,
    });
    const dropdownBoxShapeMain2 = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "rgba(255, 255, 255, 0)",
      // stroke: "#a0a0a0",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y + 2 * DROPDOWN_H + 1,
      rx: 5,
      ry: 5,
    });
    // ================= dropdownRightButton
    const downArrowLink = "../assets/downArrow.svg";
    const upArrowLink = "../assets/upArrow.svg";
    const downArrowSubLink = "../assets/downArrowSub.svg";
    const upArrowSubLink = "../assets/upArrowSub.svg";

    const dropdownRightButtonDown = Dom.svg("image", {
      class: "sqd-task-text select-field",
      href: downArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X1 + DROPDOWN1_W - 20,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonUp = Dom.svg("image", {
      class: "sqd-task-text select-field sqd-hidden",
      href: upArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X1 + DROPDOWN1_W - 20,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonDown1 = Dom.svg("image", {
      class: "sqd-task-text select-field",
      href: downArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X2 + DROPDOWN2_W - 20,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonUp1 = Dom.svg("image", {
      class: "sqd-task-text select-field sqd-hidden",
      href: upArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X2 + DROPDOWN2_W - 20,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonDown2 = Dom.svg("image", {
      class: "sqd-task-text select-field",
      href: downArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X3 + 100,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonUp2 = Dom.svg("image", {
      class: "sqd-task-text select-field sqd-hidden",
      href: upArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X3 + 100,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonDownAct1 = Dom.svg("image", {
      class: "sqd-task-text select-field",
      href: downArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X2 - 30 + DROPDOWN2_W - 20,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonUpAct1 = Dom.svg("image", {
      class: "sqd-task-text select-field sqd-hidden",
      href: upArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X2 - 30 + DROPDOWN2_W - 20,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonDownAct2 = Dom.svg("image", {
      class: "sqd-task-text select-field",
      href: downArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X3 + 103,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonUpAct2 = Dom.svg("image", {
      class: "sqd-task-text select-field sqd-hidden",
      href: upArrowLink,
      width: 12,
      height: 12,
      x: DROPDOWN_X3 + 103,
      y: DROPDOWN_Y + 7,
    });
    const dropdownRightButtonDownMain1 = Dom.svg("image", {
      class: "sqd-task-text select-field",
      href: downArrowSubLink,
      width: 9,
      height: 9,
      x: DROPDOWN_X1 + 100,
      y: DROPDOWN_Y + DROPDOWN_H + 16,
    });
    const dropdownRightButtonUpMain1 = Dom.svg("image", {
      class: "sqd-task-text select-field sqd-hidden",
      href: upArrowSubLink,
      width: 9,
      height: 9,
      x: DROPDOWN_X1 + 100,
      y: DROPDOWN_Y + DROPDOWN_H + 16,
    });
    const dropdownRightButtonDownMain2 = Dom.svg("image", {
      class: "sqd-task-text select-field",
      href: downArrowSubLink,
      width: 9,
      height: 9,
      x: DROPDOWN_X1 + 100,
      y: DROPDOWN_Y + 2 * DROPDOWN_H + 9,
    });
    const dropdownRightButtonUpMain2 = Dom.svg("image", {
      class: "sqd-task-text select-field sqd-hidden",
      href: upArrowSubLink,
      width: 9,
      height: 9,
      x: DROPDOWN_X1 + 100,
      y: DROPDOWN_Y + 2 * DROPDOWN_H + 9,
    });

    // ================= dropdownBoxInnerText
    const dropdownBoxInnerText = Dom.svg("text", {
      class: "sqd-task-text dropdown-inner-text",
      x: DROPDOWN_X1 + 5,
      y: DROPDOWN_Y + 12,
    });
    if (step.properties["property"]) {
      let property: any = step.properties["property"];
      dropdownBoxInnerText.textContent = property;
    } else {
      dropdownBoxInnerText.textContent = "Select a condition";
      dropdownBoxInnerText.setAttribute(
        "style",
        "font-size: 8pt; fill: #bfbfbf"
      );
    }

    const dropdownBoxInnerText1 = Dom.svg("text", {
      class: "sqd-task-text dropdown-inner-text",
      x: DROPDOWN_X2 + 3,
      y: DROPDOWN_Y + 12,
    });
    if (step.properties["condition"]) {
      let property: any = step.properties["condition"];
      dropdownBoxInnerText1.textContent = property;
    } else {
      dropdownBoxInnerText1.textContent = "";
      dropdownBoxInnerText1.setAttribute("style", "fill: #bfbfbf");
    }
    const dropdownBoxInnerText2 = Dom.svg("text", {
      class: "sqd-task-text dropdown-inner-text",
      x: DROPDOWN_X3 + 3,
      y: DROPDOWN_Y + 12,
    });
    dropdownBoxInnerText2.textContent = "";
    const dropdownBoxInnerTextAct1 = Dom.svg("text", {
      class: "sqd-task-text dropdown-inner-text",
      x: DROPDOWN_X2 - 30 + 3,
      y: DROPDOWN_Y + 12,
    });
    dropdownBoxInnerText2.textContent = "";
    const dropdownBoxInnerTextAct2 = Dom.svg("text", {
      class: "sqd-task-text dropdown-inner-text",
      x: DROPDOWN_X3 + 50 + 3,
      y: DROPDOWN_Y + 12,
    });
    dropdownBoxInnerText2.textContent = "";
    const dropdownBoxInnerTextMain1 = Dom.svg("text", {
      class: "sqd-task-text main-text",
      x: DROPDOWN_X1 + 6,
      y: DROPDOWN_Y + DROPDOWN_H + 13 + 8,
    });
    dropdownBoxInnerTextMain1.textContent = "CONTACT INFO";
    const dropdownBoxInnerTextMain2 = Dom.svg("text", {
      class: "sqd-task-text main-text",
      x: DROPDOWN_X1 + 6,
      y: DROPDOWN_Y + 2 * DROPDOWN_H + 13 + 1,
    });
    dropdownBoxInnerTextMain2.textContent = "ACTIONS";

    // ================== dropdownBoxShapeAfter
    const dropdownBoxShapeAfter = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y,
      id: `dropdownBoxShape${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShapeAfter, {
      opacity: 0,
    });
    const dropdownBoxShapeAfter1 = Dom.svg("rect", {
      width: DROPDOWN2_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X2,
      y: DROPDOWN_Y,
      id: `dropdownBoxShapeAfter1${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShapeAfter1, {
      opacity: 0,
    });
    const dropdownBoxShapeAfter2 = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X3,
      y: DROPDOWN_Y,
      id: `dropdownBoxShapeAfter2${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShapeAfter2, {
      opacity: 0,
    });
    const dropdownBoxShapeAfterAct1 = Dom.svg("rect", {
      width: DROPDOWN2_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X2 - 30,
      y: DROPDOWN_Y,
      id: `dropdownBoxShapeAfter2${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShapeAfterAct1, {
      opacity: 0,
    });
    const dropdownBoxShapeAfterAct2 = Dom.svg("rect", {
      width: 70,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X3 + 50,
      y: DROPDOWN_Y,
      id: `dropdownBoxShapeAfter2${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShapeAfterAct2, {
      opacity: 0,
    });
    const dropdownBoxShapeAfterMain1 = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: DROPDOWN_H,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y + DROPDOWN_H + 5,
      id: `dropdownBoxShapeAfterMain1${step.id}`,
    });
    Dom.attrs(dropdownBoxShapeAfterMain1, {
      opacity: 0,
    });
    const dropdownBoxShapeAfterMain2 = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: DROPDOWN_H - 3,
      class: "option select-field",
      fill: "#fff",
      stroke: "#bfbfbf",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y + 2 * DROPDOWN_H + 10,
      id: `dropdownBoxShapeAfterMain2${step.id}`,
    });
    Dom.attrs(dropdownBoxShapeAfterMain2, {
      opacity: 0,
    });

    // =============== gSubDropdownboxPop
    const gSubDropdownboxPop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    const gSubDropdownbox1Pop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    // Define clipPath and shape of clipping
    const clipPath = Dom.svg("clipPath", { id: "clip" });
    const rect2 = Dom.svg("rect", {
      x: DROPDOWN_X3,
      y: DROPDOWN_Y + 30,
      width: 1000,
      height: 130,
    });
    clipPath.appendChild(rect2);

    // Append the clipPath to SVG defs
    const defs = Dom.svg("defs");
    defs.appendChild(clipPath);

    const gSubDropdownbox2Pop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
      "clip-path": "url(#clip)",
    });
    const gSubDropdownboxAct1Pop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    const gSubDropdownboxAct2Pop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    const gSubDropdownboxPopMain1 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    const gSubDropdownboxPopMain2 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    const gSubDropdownboxPopMain2_1 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
    });
    const locInputPop = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox-pop`,
    });

    // ================ Text input
    const inputArea = Dom.svg("foreignObject", {
      class: "sqd-input-area sqd-hidden",
      x: DROPDOWN_X3,
      y: DROPDOWN_Y,
      width: 130,
      height: 30,
    });

    const textInput = Dom.element("input", {
      class: `sqd-text-input`,
      type: "text",
      maxlength: 255, // general length limit
      value: "",
    });
    inputArea.appendChild(textInput);

    const actInputArea = Dom.svg("foreignObject", {
      class: "sqd-act-input-area sqd-hidden",
      x: DROPDOWN_X3 - 14,
      y: DROPDOWN_Y,
      width: 65,
      height: 30,
    });

    const actTextInput = Dom.element("input", {
      class: `sqd-act-text-input`,
      type: "text",
      value: "",
    });
    actInputArea.appendChild(actTextInput);

    const vPrompt = Dom.svg("text", {
      class: "sqd-date-prompt sqd-hidden",
      fill: "#F00000",
      x: DROPDOWN_X3 + 2,
      y: DROPDOWN_Y + 36,
      "font-size": "9px",
    });
    vPrompt.textContent = "";

    const locInputArea = Dom.svg("foreignObject", {
      class: "location-input sqd-hidden",
      id: "searchbox",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y + DROPDOWN_H + 17,
      width: 400,
      height: 30,
    });

    const locTextInput = Dom.element("input", {
      class: `sqd-loc-input`,
      type: "text",
      // placeholder: 'Email...',
      value: "",
    });
    locInputArea.appendChild(locTextInput);

    const searchPopSvg = Dom.svg("svg", {
      class: "location-dropdown",
    });
    const searchPopBody = Dom.svg("svg", {
      class: "location-dropdown-body",
    });
    const searchPopItemDiv = Dom.svg("svg", {
      class: "location-scrollbox",
    });

    async function performSearch(url: any) {
      const response = await fetch(url, {
        method: "GET",
      });
      if (response.status == 200) {
        console.log("Success getting cities");
        // console.log(response.json());
      }
      return response.json();
    }

    let delay: number;
    locTextInput.addEventListener("input", function (e) {
      clearTimeout(delay);
      let url: any;
      let city = locTextInput.value;
      url = `http://localhost:8080/worldcity/${city}/0.85`;

      // @ts-ignore
      delay = setTimeout(function (e) {
        if (city.length < 3) {
          populateResults([]);
          return;
        }
        performSearch(url).then((data) => {
          // only shows top 5 results
          let cityResp = data.slice(0, 5);
          console.log(cityResp);
          // let locList = [];
          // for (let i = 0; i < cityResp.length; i++) {
          //     locList.push(cityResp);
          // }
          populateResults(cityResp);
        });
      }, 500);
    });

    function populateResults(results: any) {
      while (searchPopItemDiv.firstChild) {
        searchPopItemDiv.removeChild(searchPopItemDiv.firstChild);
      }

      const locInputBottomShape = Dom.svg("rect", {
        width: 374,
        height: 5 * DROPDOWN_H + 10,
        class: "option select-field",
        fill: "#fff",
        stroke: "#247d99",
        x: DROPDOWN_X1,
        y: DROPDOWN_Y + DROPDOWN_H + 40,
        rx: 4,
        ry: 4,
      });
      locInputPop.appendChild(locInputBottomShape);
      if (locTextInput.value && results.length != 0) {
        locInputPop.classList.remove("sqd-hidden");
      } else {
        locInputPop.classList.add("sqd-hidden");
      }
      if (results.lengh == 0) {
        locInputBottomShape.setAttribute("height", `${DROPDOWN_H}`);
      } else if (results.length >= 5) {
        locInputBottomShape.setAttribute("height", `${5 * DROPDOWN_H + 10}`);
      } else if (results.length < 5) {
        locInputBottomShape.setAttribute(
          "height",
          `${results.length * DROPDOWN_H + 10}`
        );
      }

      for (let i = 1; i <= results.length; i++) {
        const locInputBottomShapeText = Dom.svg("text", {
          class: "sqd-task-text",
          x: DROPDOWN_X1 + 12,
          y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 43,
        });
        locInputBottomShapeText.textContent = results[i - 1];
        const locInputBottomShapeCover = Dom.svg("rect", {
          width: 364,
          height: DROPDOWN_H - 2,
          class: "option select-field choice",
          fill: "#fff",
          x: DROPDOWN_X1 + 7,
          y: DROPDOWN_Y + DROPDOWN_H * i + 43,
          rx: 4,
          ry: 4,
          id: `locInputBottomShapeCover${Date.now()}`,
        });
        Dom.attrs(locInputBottomShapeCover, {
          opacity: 0.3,
        });

        // Add event listners for ACTIONS 3rd dropdown
        locInputBottomShapeCover.addEventListener("click", function (e) {
          locInputPop.classList.toggle("sqd-hidden");
          let locInputValue: any = locInputBottomShapeText.textContent;
          locTextInput.value = locInputValue;
        });

        // Append Child ACTIONS 3rd
        searchPopItemDiv.appendChild(locInputBottomShapeText);
        searchPopItemDiv.appendChild(locInputBottomShapeCover);
      }
      searchPopSvg.appendChild(searchPopBody);
      locInputPop.appendChild(searchPopSvg);
    }

    const gValBtn = Dom.svg("g", {
      class: `sqd-task-group sqd-hidden`,
    });

    const valBtnRect = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: DROPDOWN_H,
      class: "option select-field choice",
      fill: "#fff",
      stroke: "#247d99",
      x: DROPDOWN_X3,
      y: DROPDOWN_Y + DROPDOWN_H + 10,
      rx: 4,
      ry: 4,
    });
    Dom.attrs(valBtnRect, {
      opacity: 0.3,
    });

    const valBtnText = Dom.svg("text", {
      x: DROPDOWN_X3 + 7,
      y: DROPDOWN_Y + DROPDOWN_H + 22,
      class: "switch-val-btn",
      fill: "#146d89",
    });
    valBtnText.textContent = "Validate Location";

    // gValBtn.appendChild(valBtnText);
    // gValBtn.appendChild(valBtnRect);

    const CHOICE_H = 20;

    // For country dropdown scroll function
    const dropdownPopSvg2 = Dom.svg("svg", {
      class: "country-dropdown",
    });
    const dropdownPopBody2 = Dom.svg("svg", {
      class: "country-dropdown-body",
    });
    const dropdownPopItemDiv2 = Dom.svg("svg", {
      class: "country-scrollbox",
    });
    // For state dropdown scroll function
    const dropdownPopSvg3 = Dom.svg("svg", {
      class: "state-dropdown",
    });
    const dropdownPopBody3 = Dom.svg("svg", {
      class: "state-dropdown-body",
    });
    const dropdownPopItemDiv3 = Dom.svg("svg", {
      class: "state-scrollbox",
    });
    // For distance dropdown scroll function
    const dropdownPopSvg4 = Dom.svg("svg", {
      class: "distance-dropdown",
    });
    const dropdownPopBody4 = Dom.svg("svg", {
      class: "distance-dropdown-body",
    });
    const dropdownPopItemDiv4 = Dom.svg("svg", {
      class: "distance-scrollbox",
    });
    // =================== Dropdown item lists
    let list1 = [""];
    let contInfo = [
      "Tag",
      "Email Address",
      "Gender",
      "First Name",
      "Last Name",
      "Full Name",
      "Phone Number",
      "Birthday",
      "Location",
    ];
    let actions = ["Opened", "Not Opened", "Clicked", "Not Clicked"];
    let list2 = [""];
    let list2Tag = ["Exists", "Does Not Exist"];
    let list2Gender = ["Is"];
    let list2Bd = [
      "Month Is",
      "Date Is",
      "Is Before Date",
      "Is After Date",
      "Is Blank",
    ];
    let list2Email = ["Contains", "Does Not Contain", "Is Blank"];
    let list2Name = ["Is", "Is Not", "Contains", "Does Not Contain", "Blank"];
    let list2Phone = ["Contains", "Does Not Contain", "Blank"];
    let list2Loc = [
      "Is Within",
      "Is Not Within",
      "Is In Country",
      "Is Not In Country",
      "Is In US State",
      "Is Not In US State",
    ];
    let list3: any = [""];
    let list3Tag = ["Tag A", "Tag B"];
    let list3Gender = ["Male", "Female", "Non-binary", "Blank"];
    let list3Bdm = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let list3LocWithin = [25, 50, 75, 100, 150, 200];
    let list3Ctry = countryList;
    let list3State = usStateList;
    let choice1: string | null = "";
    let choice2: string | null = "";
    let dateformat = /^(0?[1-9]|1[0-2])[\/](0?[1-9]|[1-2][0-9]|3[01])$/;
    let allValidated = false;
    let dp1Validated = false;
    let dp2Validated = false;
    let tb1Validated = false;
    let locValidated = false;
    let actDp1Validated = false;
    let actTb1Validated = false;
    let actDp2Validated = false;

    // Append validation popup
    g.appendChild(gHint);

    // ============ 1st dropdown
    let shapeHeightContact = contInfo.length * CHOICE_H;
    let shapeHeightActions = actions.length * CHOICE_H;
    let shapeHeightCollapsed = 2 * DROPDOWN_H - 2;

    const dropdownBoxBottomShape = Dom.svg("rect", {
      width: DROPDOWN1_W,
      height: shapeHeightCollapsed,
      fill: "#fff",
      stroke: "#247d99",
      x: DROPDOWN_X1,
      y: DROPDOWN_Y + DROPDOWN_H + 5,
      rx: 4,
      ry: 4,
    });
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShape);
    gSubDropdownboxPop.appendChild(gSubDropdownMain2);
    gSubDropdownboxPop.appendChild(gSubDropdownMain1);

    // ================ CONTACT INFO dropdown
    for (let i = 1; i <= contInfo.length; i++) {
      const dropdownBoxBottomShapeTextMain1 = Dom.svg("text", {
        class: "sqd-task-text",
        x: DROPDOWN_X1 + 17,
        y: DROPDOWN_Y + CHOICE_H + 11 + CHOICE_H * i + 13,
      });
      dropdownBoxBottomShapeTextMain1.textContent = contInfo[i - 1];
      const dropdownBoxBottomShapecoverMain1 = Dom.svg("rect", {
        width: DROPDOWN1_W - 20,
        height: CHOICE_H - 3,
        class: "option select-field choice",
        fill: "#fff",
        x: DROPDOWN_X1 + 10,
        y: DROPDOWN_Y + CHOICE_H + CHOICE_H * i + 15,
        rx: 4,
        ry: 4,
        id: `dropdownBoxBottomShapecoverMain1${contInfo[i - 1]}${step.id}`,
      });
      Dom.attrs(dropdownBoxBottomShapecoverMain1, {
        opacity: 0.3,
      });
      dropdownBoxBottomShapecoverMain1.addEventListener("click", function (e) {
        choice1 = dropdownBoxBottomShapeTextMain1.textContent;
        gSubDropdownAct1.classList.add("sqd-hidden");
        gSubDropdownAct2.classList.add("sqd-hidden");
        actInputArea.classList.add("sqd-hidden");
        dropdownBoxShape.setAttribute("width", `${DROPDOWN1_W}`);
        dropdownBoxShape.setAttribute("stroke", "#bfbfbf");
        dropdownBoxShape1.setAttribute("stroke", "#bfbfbf");
        dropdownBoxShapeAfter.setAttribute("width", `${DROPDOWN1_W}`);
        dropdownBoxInnerText.setAttribute("style", "fill: #000000");
        dropdownBoxInnerText1.setAttribute("style", "fill: #bfbfbf");
        dropdownBoxInnerText1.textContent = "Is";
        dropdownBoxInnerText2.textContent = "";
        dp1Validated = true;
        dp2Validated = true;
        // dropdownBoxInnerText2.textContent = "Nothing Selected";
        dropdownBoxInnerText2.setAttribute("style", "fill: #bfbfbf");
        dropdownRightButtonDown.setAttribute(
          "x",
          `${DROPDOWN_X1 + DROPDOWN1_W - 20}`
        );
        dropdownRightButtonUp.setAttribute(
          "x",
          `${DROPDOWN_X1 + DROPDOWN1_W - 20}`
        );
        dropdownRightButtonUp.classList.add("sqd-hidden");
        dropdownRightButtonDown.classList.remove("sqd-hidden");
        dropdownRightButtonUpMain1.classList.add("sqd-hidden");
        dropdownRightButtonDownMain1.classList.remove("sqd-hidden");

        gSubDropdownboxPopMain1.classList.toggle("sqd-hidden");
        gSubDropdownboxPop.classList.add("sqd-hidden");
        gSubDropdown1.classList.remove("sqd-hidden");
        gSubDropdown2.classList.remove("sqd-hidden");

        dropdownBoxBottomShape.setAttribute(
          "height",
          `${shapeHeightCollapsed}`
        );
        dropdownBoxShapeMain2.setAttribute("y", `${shapeMain2DefaultY}`);
        dropdownRightButtonDownMain2.setAttribute("y", `${btnMain2DefaultY}`);
        dropdownRightButtonUpMain2.setAttribute("y", `${btnMain2DefaultY}`);
        dropdownBoxInnerTextMain2.setAttribute(
          "y",
          `${innerTextMain2DefaultY}`
        );
        dropdownBoxShapeAfterMain2.setAttribute(
          "y",
          `${shapeAfterMain2DefaultY}`
        );
        dropdownBoxInnerText.textContent =
          dropdownBoxBottomShapeTextMain1.textContent;
        while (gSubDropdownbox1Pop.firstChild) {
          gSubDropdownbox1Pop.removeChild(gSubDropdownbox1Pop.firstChild);
        }

        // Reset UI
        vPrompt.classList.add("sqd-hidden");
        inputArea.classList.remove("sqd-hidden");
        actConditonText.classList.remove("sqd-hidden");
        dropdownBoxShape1.setAttribute("x", DROPDOWN_X2.toString());
        dropdownRightButtonDown1.setAttribute(
          "x",
          (DROPDOWN_X2 + DROPDOWN2_W - 20).toString()
        );
        dropdownRightButtonUp1.setAttribute(
          "x",
          (DROPDOWN_X2 + DROPDOWN2_W - 20).toString()
        );
        dropdownBoxInnerText1.setAttribute("x", (DROPDOWN_X2 + 3).toString());
        dropdownBoxShapeAfter1.setAttribute("x", DROPDOWN_X2.toString());
        // dropdownBoxBottomShape1.setAttribute("x", (DROPDOWN_X2).toString());

        if (choice1 == "Tag") {
          list2 = list2Tag;
        }
        if (choice1 == "Gender") {
          list2 = list2Gender;
          list3 = list3Gender;
          dropdownBoxInnerText1.textContent = "Is";
          dropdownRightButtonDown1.classList.add("sqd-hidden");
          dropdownBoxShapeAfter1.classList.add("sqd-hidden");
          while (gSubDropdownbox2Pop.firstChild) {
            gSubDropdownbox2Pop.removeChild(gSubDropdownbox2Pop.firstChild);
          }
          // 3rd dropdown in 1st dropdown event listener
          const dropdownBoxBottomShape2 = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: list3.length * 25 + 10,
            fill: "#fff",
            stroke: "#247d99",
            x: DROPDOWN_X3,
            y: DROPDOWN_Y + DROPDOWN_H + 10,
            rx: 4,
            ry: 4,
          });
          gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2);

          for (let i = 1; i <= list3.length; i++) {
            const dropdownBoxBottomShape2Text = Dom.svg("text", {
              class: "sqd-task-text",
              x: DROPDOWN_X3 + 17,
              y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 13,
            });
            dropdownBoxBottomShape2Text.textContent = list3[i - 1];
            const dropdownBoxBottomShape2cover = Dom.svg("rect", {
              width: DROPDOWN1_W - 20,
              height: DROPDOWN_H - 5,
              class: "option select-field choice",
              fill: "#fff",
              x: DROPDOWN_X3 + 10,
              y: DROPDOWN_Y + DROPDOWN_H * i + 15,
              rx: 4,
              ry: 4,
              id: `dropdownBoxBottomShape2cover${list3[i - 1]}${step.id}`,
            });
            Dom.attrs(dropdownBoxBottomShape2cover, {
              opacity: 0.3,
            });

            // Add event listners for 3rd dropdown
            dropdownBoxBottomShape2cover.addEventListener(
              "click",
              function (e) {
                dp2Validated = true;
                dropdownBoxShape2.setAttribute("stroke", "#bfbfbf");
                dropdownRightButtonUp2.classList.add("sqd-hidden");
                dropdownRightButtonDown2.classList.remove("sqd-hidden");
                dropdownBoxInnerText2.textContent =
                  dropdownBoxBottomShape2Text.textContent;
                dropdownBoxInnerText2.setAttribute("style", "fill: #253947");
                gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
                vPrompt.classList.add("sqd-hidden");
              }
            );

            // Append Child 3rd
            gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
            gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
          }
          // End 3rd dropdown in 1st dropdown event listener
        } else {
          dropdownRightButtonDown1.classList.remove("sqd-hidden");
          dropdownBoxShapeAfter1.classList.remove("sqd-hidden");
        }
        if (choice1 == "Birthday") {
          list2 = list2Bd;
        }
        if (choice1 == "Email Address") {
          list2 = list2Email;
          gSubDropdown2.classList.add("sqd-hidden");
          inputArea.classList.remove("sqd-hidden");
        }
        if (
          choice1 == "First Name" ||
          choice1 == "Last Name" ||
          choice1 == "Full Name"
        ) {
          list2 = list2Name;
          gSubDropdown2.classList.add("sqd-hidden");
          inputArea.classList.remove("sqd-hidden");
        }
        if (choice1 == "Phone Number") {
          list2 = list2Phone;
          gSubDropdown2.classList.add("sqd-hidden");
          inputArea.classList.remove("sqd-hidden");
        }
        if (choice1 == "Location") {
          list2 = list2Loc;
        } else {
          locInputArea.classList.add("sqd-hidden");
          valBtnRect.classList.add("sqd-hidden");
          rect1.setAttribute("height", `${3 * boxHeight + 10}`);
          rectInnerBorder.setAttribute("height", `${boxHeight + 20}`);
          locInputArea.classList.add("sqd-hidden");
        }
        if (
          choice1 != "Email Address" &&
          choice1 != "Birthday" &&
          choice1 != "First Name" &&
          choice1 != "Last Name" &&
          choice1 != "Full Name" &&
          choice1 != "Phone Number"
        ) {
          inputArea.classList.add("sqd-hidden");
          gSubDropdown2.classList.remove("sqd-hidden");
        }

        // Validation notification 1
        if (
          choice1 == "Tag" ||
          choice1 == "Birthday" ||
          choice1 == "Location"
        ) {
          if (dropdownBoxInnerText1.textContent == "Is") {
            vPrompt.setAttribute("x", (DROPDOWN_X2 + 2).toString());
            vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
            vPrompt.textContent = "Please select condition";
            vPrompt.classList.remove("sqd-hidden");
            dropdownBoxShape1.setAttribute("stroke", "#FF0000");
            dp1Validated = false;
          } else {
            vPrompt.classList.add("sqd-hidden");
            dp1Validated = true;
          }
        }

        if (choice1 == "Birthday") {
          // const dateformat = /^(0?[1-9]|1[0-2])[\/](0?[1-9]|[1-2][0-9]|3[01])$/;
          textInput.addEventListener("input", function (e) {
            if (!textInput.value.match(dateformat)) {
              vPrompt.setAttribute("x", (DROPDOWN_X3 + 2).toString());
              vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
              vPrompt.textContent = "Incorrect Date Format";
              vPrompt.classList.remove("sqd-hidden");
              textInput.setAttribute("style", "border-color: #FF0000");
              tb1Validated = false;
            } else {
              vPrompt.classList.add("sqd-hidden");
              textInput.setAttribute("style", "border-color: #BFBFBF");
              tb1Validated = true;
            }
          });
        } else if (
          choice1 == "Email Address" ||
          choice1 == "Full Name" ||
          choice1 == "First Name" ||
          choice1 == "Last Name" ||
          choice1 == "Phone Number"
        ) {
          if (
            dropdownBoxInnerText1.textContent == "Is" &&
            textInput.value == ""
          ) {
            vPrompt.setAttribute("x", (DROPDOWN_X3 + 2).toString());
            vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
            vPrompt.textContent = "Please enter value";
            vPrompt.classList.remove("sqd-hidden");
            textInput.setAttribute("style", "border-color: #FF0000");
            tb1Validated = false;
          }
          let errFormat = /[^a-zA-Z\s]/g; // Full Name
          if (choice1 == "First Name" || choice1 == "Last Name") {
            errFormat = /[^a-zA-Z]/g;
          } else if (choice1 == "Phone Number") {
            errFormat = /[^0-9()-]/g;
          } else if (choice1 == "Email Address") {
            errFormat = /[^\w@.]/g;
          }
          textInput.addEventListener("input", function (e) {
            if (textInput.value.trim() == "") {
              vPrompt.setAttribute("x", (DROPDOWN_X3 + 2).toString());
              vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
              vPrompt.textContent = "Empty Input";
              tb1Validated = false;
              vPrompt.classList.remove("sqd-hidden");
              textInput.setAttribute("style", "border-color: #FF0000");
            } else if (
              textInput.value.match(errFormat) ||
              textInput.value.charAt(0) == " " ||
              textInput.value.charAt(textInput.value.length - 1) == " "
            ) {
              vPrompt.setAttribute("x", (DROPDOWN_X3 + 2).toString());
              vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
              vPrompt.textContent = "Invalid Input";
              vPrompt.classList.remove("sqd-hidden");
              textInput.setAttribute("style", "border-color: #FF0000");
              tb1Validated = false;
            } else {
              vPrompt.classList.add("sqd-hidden");
              textInput.setAttribute("style", "border-color: #BFBFBF");
              tb1Validated = true;
            }
          });
        } else if (choice1 == "Gender") {
          if (
            !dropdownBoxInnerText2.textContent ||
            dropdownBoxInnerText2.textContent == ""
          ) {
            vPrompt.setAttribute("x", (DROPDOWN_X3 + 2).toString());
            vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
            vPrompt.textContent = "Please select value";
            vPrompt.classList.remove("sqd-hidden");
            dropdownBoxShape2.setAttribute("stroke", "#FF0000");
            dp2Validated = false;
          } else {
            vPrompt.classList.add("sqd-hidden");
            dp2Validated = true;
          }
        }
        // ===================== 2nd dropdown
        const dropdownBoxBottomShape1 = Dom.svg("rect", {
          width: DROPDOWN2_W,
          height: list2.length * 25 + 10,
          fill: "#fff",
          stroke: "#247d99",
          x: DROPDOWN_X2,
          y: DROPDOWN_Y + DROPDOWN_H + 5,
          rx: 4,
          ry: 4,
        });
        gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1);

        for (let i = 1; i <= list2.length; i++) {
          const dropdownBoxBottomShape1Text = Dom.svg("text", {
            class: "sqd-task-text temp1",
            x: DROPDOWN_X2 + 12,
            y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 8,
          });
          dropdownBoxBottomShape1Text.textContent = list2[i - 1];

          const dropdownBoxBottomShape1cover = Dom.svg("rect", {
            width: DROPDOWN2_W - 15,
            height: DROPDOWN_H - 5,
            class: "option select-field choice temp2",
            fill: "#fff",
            x: DROPDOWN_X2 + 7,
            y: DROPDOWN_Y + DROPDOWN_H * i + 10,
            rx: 4,
            ry: 4,
            id: `dropdownBoxBottomShape1cover${list2[i - 1]}${step.id}`,
          });
          Dom.attrs(dropdownBoxBottomShape1cover, {
            opacity: 0.3,
          });
          // Add event listners for 2nd dropdowns
          dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
            dp1Validated = true;
            dropdownBoxInnerTextAct1.textContent = ""; // Empty condition value of ACTIONS
            dropdownRightButtonUp1.classList.add("sqd-hidden");
            dropdownRightButtonDown1.classList.remove("sqd-hidden");
            dropdownBoxInnerText1.textContent =
              dropdownBoxBottomShape1Text.textContent;
            dropdownBoxInnerText1.setAttribute("style", "fill: #253947");
            dropdownBoxShape1.setAttribute("stroke", "#bfbfbf");
            gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
            choice2 = dropdownBoxInnerText1.textContent;
            const droptext1 = document.querySelectorAll(".temp1");
            const dropbut1 = document.querySelectorAll(".temp2");
            while (gSubDropdownbox2Pop.firstChild) {
              gSubDropdownbox2Pop.removeChild(gSubDropdownbox2Pop.firstChild);
            }
            // Change UI layout if Blank
            if (choice2 == "Is Blank" || choice2 == "Blank") {
              dropdownBoxInnerText2.textContent = "Nothing Selected";
              dropdownBoxInnerText2.setAttribute(
                "style",
                "fill: #BFBFBF; font-size: 8pt"
              );
              inputArea.setAttribute("value", "Blank");
              inputArea.classList.add("sqd-hidden");
              gSubDropdown2.classList.add("sqd-hidden");
              dropdownBoxShape1.setAttribute(
                "x",
                (DROPDOWN_X2 + 125).toString()
              );
              dropdownRightButtonDown1.setAttribute(
                "x",
                (DROPDOWN_X2 + DROPDOWN2_W + 105).toString()
              );
              dropdownRightButtonUp1.setAttribute(
                "x",
                (DROPDOWN_X2 + DROPDOWN2_W + 105).toString()
              );
              dropdownBoxInnerText1.setAttribute(
                "x",
                (DROPDOWN_X2 + 128).toString()
              );
              dropdownBoxShapeAfter1.setAttribute(
                "x",
                (DROPDOWN_X2 + 125).toString()
              );
              actConditonText.classList.add("sqd-hidden");
              dropdownBoxBottomShape1.setAttribute(
                "x",
                (DROPDOWN_X2 + 125).toString()
              );
              droptext1.forEach((text1) => {
                const newXValue = (DROPDOWN_X2 + 137).toString();
                text1.setAttribute("x", newXValue);
              });
              dropbut1.forEach((but1) => {
                const newXValue = (DROPDOWN_X2 + 132).toString();
                but1.setAttribute("x", newXValue);
              });
            } else {
              // prevent UI display overlay
              if (
                choice1 == "Email Address" ||
                choice1 == "First Name" ||
                choice1 == "Last Name" ||
                choice1 == "Full Name" ||
                choice1 == "Phone Number" ||
                (choice1 == "Birthday" && choice2 != "Month Is")
              ) {
                inputArea.classList.remove("sqd-hidden");
              }
              actConditonText.classList.remove("sqd-hidden");
              dropdownBoxShape1.setAttribute("x", DROPDOWN_X2.toString());
              dropdownRightButtonDown1.setAttribute(
                "x",
                (DROPDOWN_X2 + DROPDOWN2_W - 20).toString()
              );
              dropdownRightButtonUp1.setAttribute(
                "x",
                (DROPDOWN_X2 + DROPDOWN2_W - 20).toString()
              );
              dropdownBoxInnerText1.setAttribute(
                "x",
                (DROPDOWN_X2 + 3).toString()
              );
              dropdownBoxShapeAfter1.setAttribute("x", DROPDOWN_X2.toString());
              dropdownBoxBottomShape1.setAttribute("x", DROPDOWN_X2.toString());
              droptext1.forEach((text1) => {
                const newXValue = (DROPDOWN_X2 + 12).toString();
                text1.setAttribute("x", newXValue);
              });
              dropbut1.forEach((but1) => {
                const newXValue = (DROPDOWN_X2 + 7).toString();
                but1.setAttribute("x", newXValue);
              });
            }
            // Hide validation prompt
            if (
              choice2 != "Date Is" &&
              choice2 != "Is Before Date" &&
              choice2 != "Is After Date"
            ) {
              vPrompt.classList.add("sqd-hidden");
            }

            if (choice2 == "Exists" || choice2 == "Does Not Exist") {
              list3 = list3Tag;
            } else if (choice2 == "Month Is") {
              list3 = list3Bdm;
              inputArea.classList.add("sqd-hidden");
              gSubDropdown2.classList.remove("sqd-hidden");
            } else if (
              choice2 == "Date Is" ||
              choice2 == "Is Before Date" ||
              choice2 == "Is After Date"
            ) {
              gSubDropdown2.classList.add("sqd-hidden");
              inputArea.classList.remove("sqd-hidden");
              // textInput.setAttribute("placeholder", "Enter Month/Day");
            }
            if (choice2 == "Is Within" || choice2 == "Is Not Within") {
              list3 = list3LocWithin;
              rect1.setAttribute("height", "140");
              rectInnerBorder.setAttribute("height", "90");
              locInputArea.classList.remove("sqd-hidden");
            } else {
              locInputArea.classList.add("sqd-hidden");
              valBtnRect.classList.add("sqd-hidden");
              rect1.setAttribute("height", `${3 * boxHeight + 10}`);
              rectInnerBorder.setAttribute("height", `${boxHeight + 20}`);
            }
            if (choice2 == "Is In Country" || choice2 == "Is Not In Country") {
              list3 = list3Ctry;
              dropdownBoxInnerText2.textContent = "";
            } else if (
              choice2 == "Is In US State" ||
              choice2 == "Is Not In US State"
            ) {
              list3 = list3State;
              dropdownBoxInnerText2.textContent = "";
            }
            if (
              choice1 == "Tag" ||
              (choice1 == "Birthday" && choice2 == "Month Is") ||
              choice1 == "Location"
            ) {
              if (
                !dropdownBoxInnerText2.textContent ||
                dropdownBoxInnerText2.textContent == ""
              ) {
                vPrompt.setAttribute("x", (DROPDOWN_X3 + 2).toString());
                vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
                vPrompt.textContent = "Please select value";
                vPrompt.classList.remove("sqd-hidden");
                dropdownBoxShape2.setAttribute("stroke", "#FF0000");
                dp2Validated = false;
              } else {
                vPrompt.classList.add("sqd-hidden");
                dp2Validated = true;
              }
            }
            if (
              (choice1 == "Email Address" && choice2 != "Is Blank") ||
              choice1 == "First Name" ||
              choice1 == "Last Name" ||
              choice1 == "Full Name" ||
              (choice1 == "Phone Number" && choice2 != "Blank") ||
              (choice1 == "Birthday" && choice2 != "Month Is")
            ) {
              if (!textInput.value || textInput.value == "") {
                vPrompt.setAttribute("x", (DROPDOWN_X3 + 2).toString());
                vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
                vPrompt.textContent = "Please enter value";
                vPrompt.classList.remove("sqd-hidden");
                textInput.setAttribute("style", "border-color: #FF0000");
                tb1Validated = false;
              } else {
                vPrompt.classList.add("sqd-hidden");
              }
            }

            // ======================== 3rd dropdowns
            const dropdownBoxBottomShape2 = Dom.svg("rect", {
              width: DROPDOWN1_W,
              height: 120, // list3.length * 25 + 10,
              fill: "#fff",
              stroke: "#247d99",
              x: DROPDOWN_X3,
              y: DROPDOWN_Y + DROPDOWN_H + 5,
              rx: 4,
              ry: 4,
            });
            gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2);

            for (let i = 1; i <= list3.length; i++) {
              const dropdownBoxBottomShape2Text = Dom.svg("text", {
                class: "sqd-task-text",
                x: DROPDOWN_X3 + 17,
                y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 13,
              });
              dropdownBoxBottomShape2Text.textContent = list3[i - 1];
              const dropdownBoxBottomShape2cover = Dom.svg("rect", {
                width: DROPDOWN1_W - 20,
                height: DROPDOWN_H - 5,
                class: "option select-field choice",
                fill: "#fff",
                x: DROPDOWN_X3 + 10,
                y: DROPDOWN_Y + DROPDOWN_H * i + 15,
                rx: 4,
                ry: 4,
                id: `dropdownBoxBottomShape2cover${list3[i - 1]}${step.id}`,
              });
              Dom.attrs(dropdownBoxBottomShape2cover, {
                opacity: 0.3,
              });

              // Add event listners for 3rd dropdown
              dropdownBoxBottomShape2cover.addEventListener(
                "click",
                function (e) {
                  dp2Validated = true;
                  dropdownBoxShape2.setAttribute("stroke", "#bfbfbf");
                  dropdownRightButtonUp2.classList.add("sqd-hidden");
                  dropdownRightButtonDown2.classList.remove("sqd-hidden");
                  dropdownBoxInnerText2.textContent =
                    dropdownBoxBottomShape2Text.textContent;
                  dropdownBoxInnerText2.setAttribute("style", "fill: #253947");
                  gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
                  vPrompt.classList.add("sqd-hidden");
                  if (
                    (choice2 == "Is Within" || choice2 == "Is Not Within") &&
                    locTextInput.value == ""
                  ) {
                    vPrompt.setAttribute("x", (DROPDOWN_X1 + 2).toString());
                    vPrompt.setAttribute(
                      "y",
                      (DROPDOWN_Y + DROPDOWN_H + 53).toString()
                    );
                    vPrompt.textContent = "Please enter location";
                    vPrompt.classList.remove("sqd-hidden");
                    locTextInput.setAttribute("style", "border-color: #FF0000");
                    locValidated = false;
                  }
                }
              );

              // Location textbox listener and validation
              locTextInput.addEventListener("input", function (e) {
                if (
                  locTextInput.value == "" ||
                  locTextInput.value.charAt(0) == " " ||
                  locTextInput.value.charAt(locTextInput.value.length - 1) ==
                    " "
                ) {
                  vPrompt.setAttribute("x", (DROPDOWN_X1 + 2).toString());
                  vPrompt.setAttribute(
                    "y",
                    (DROPDOWN_Y + DROPDOWN_H + 53).toString()
                  );
                  vPrompt.textContent = "Invalid location";
                  vPrompt.classList.remove("sqd-hidden");
                  locTextInput.setAttribute("style", "border-color: #FF0000");
                  locValidated = false;
                } else {
                  vPrompt.classList.add("sqd-hidden");
                  locTextInput.setAttribute("style", "border-color: #BFBFBF");
                  locValidated = true;
                }
              });

              // Append Child 3rd
              if (
                choice2 == "Is In Country" ||
                choice2 == "Is Not In Country"
              ) {
                dropdownPopItemDiv2.appendChild(dropdownBoxBottomShape2Text);
                dropdownPopItemDiv2.appendChild(dropdownBoxBottomShape2cover);
              } else if (
                choice2 == "Is In US State" ||
                choice2 == "Is Not In US State"
              ) {
                dropdownPopItemDiv3.appendChild(dropdownBoxBottomShape2Text);
                dropdownPopItemDiv3.appendChild(dropdownBoxBottomShape2cover);
              } else {
                gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
                gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
              }
            }
            if (choice2 == "Is In Country" || choice2 == "Is Not In Country") {
              dropdownPopSvg2.appendChild(dropdownPopBody2);
              gSubDropdownbox2Pop.appendChild(dropdownPopSvg2);
              dropdownBoxBottomShape2.setAttribute("height", "130");
              gSubDropdown2.appendChild(defs);
            } else if (
              choice2 == "Is In US State" ||
              choice2 == "Is Not In US State"
            ) {
              dropdownPopSvg3.appendChild(dropdownPopBody3);
              gSubDropdownbox2Pop.appendChild(dropdownPopSvg3);
              dropdownBoxBottomShape2.setAttribute("height", "130");
              gSubDropdown2.appendChild(defs);
            } else {
              dropdownBoxBottomShape2.setAttribute(
                "height",
                `${list3.length * 25 + 10}`
              );
              gSubDropdown2.removeChild(defs);
            }
          });

          // Append Child 2nd
          gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
          gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
        }
      });

      // Append Child CONTACT INFO
      gSubDropdownboxPopMain1.appendChild(dropdownBoxBottomShapeTextMain1);
      gSubDropdownboxPopMain1.appendChild(dropdownBoxBottomShapecoverMain1);
    }

    let transId = "";
    // ================ ACTIONS dropdown
    for (let i = 1; i <= actions.length; i++) {
      const dropdownBoxBottomShapeTextMain2 = Dom.svg("text", {
        class: "sqd-task-text",
        x: DROPDOWN_X1 + 17,
        y: DROPDOWN_Y + 2 * CHOICE_H + 11 + CHOICE_H * i + 9,
      });
      dropdownBoxBottomShapeTextMain2.textContent = actions[i - 1];
      const dropdownBoxBottomShapecoverMain2 = Dom.svg("rect", {
        width: DROPDOWN1_W - 20,
        height: CHOICE_H - 5,
        class: "option select-field choice",
        fill: "#fff",
        // stroke: "#a0a0a0",
        x: DROPDOWN_X1 + 10,
        y: DROPDOWN_Y + 2 * CHOICE_H + CHOICE_H * i + 12,
        rx: 4,
        ry: 4,
        id: `dropdownBoxBottomShapecoverMain2${actions[i - 1]}${step.id}`,
      });
      Dom.attrs(dropdownBoxBottomShapecoverMain2, {
        opacity: 0.3,
      });

      const dropdownBoxBottomShapeTextMain2_1 = Dom.svg("text", {
        class: "sqd-task-text",
        x: DROPDOWN_X1 + 17,
        y: DROPDOWN_Y + 10 * CHOICE_H + 11 + CHOICE_H * i + 28,
      });
      dropdownBoxBottomShapeTextMain2_1.textContent = actions[i - 1];
      const dropdownBoxBottomShapecoverMain2_1 = Dom.svg("rect", {
        width: DROPDOWN1_W - 20,
        height: CHOICE_H - 5,
        class: "option select-field choice",
        fill: "#fff",
        // stroke: "#a0a0a0",
        x: DROPDOWN_X1 + 10,
        y: DROPDOWN_Y + 10 * CHOICE_H + CHOICE_H * i + 31,
        rx: 4,
        ry: 4,
        id: `dropdownBoxBottomShapecoverMain2_1${Date.now()}`,
      });
      Dom.attrs(dropdownBoxBottomShapecoverMain2_1, {
        opacity: 0.3,
      });

      // Click Action main options, e.g. Opened
      dropdownBoxBottomShapecoverMain2.addEventListener("click", function (e) {
        inputArea.classList.add("sqd-hidden");
        locInputArea.classList.add("sqd-hidden");
        rect1.setAttribute("height", `${3 * boxHeight + 10}`);
        rectInnerBorder.setAttribute("height", `${boxHeight + 20}`);
        choice1 = dropdownBoxBottomShapeTextMain2.textContent;
        dropdownRightButtonUp.classList.add("sqd-hidden");
        dropdownRightButtonDown.classList.remove("sqd-hidden");
        dropdownRightButtonUpMain2.classList.add("sqd-hidden");
        dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
        gSubDropdownboxPopMain2.classList.add("sqd-hidden"); // hide action options list
        gSubDropdownboxPop.classList.add("sqd-hidden"); // hide the whole main dropdown
        dropdownBoxInnerText.textContent =
          dropdownBoxBottomShapeTextMain2.textContent;
        dropdownBoxShape.setAttribute("stroke", "#bfbfbf");
        dropdownBoxInnerText.setAttribute(
          "style",
          "fill: #000000; font-size: 9pt"
        );
        gSubDropdown1.classList.add("sqd-hidden"); // hide CI dp1
        gSubDropdown2.classList.add("sqd-hidden"); // hide CI dp2
        dropdownBoxShape.setAttribute("width", `90`);
        dropdownBoxBottomShape.setAttribute(
          "height",
          `${shapeHeightCollapsed}`
        );
        dropdownRightButtonDown.setAttribute("x", `${DROPDOWN_X1 + 70}`);
        dropdownRightButtonUp.setAttribute("x", `${DROPDOWN_X1 + 70}`);
        gSubDropdownAct1.classList.remove("sqd-hidden");
        gSubDropdownAct2.classList.remove("sqd-hidden");
        dropdownBoxShapeAct1.classList.remove("sqd-hidden");
        dropdownBoxShapeAct2.classList.remove("sqd-hidden");
        actTextInput.classList.remove("sqd-hidden");
        dropdownRightButtonUp.classList.add("sqd-hidden");
        dropdownRightButtonDown.classList.remove("sqd-hidden");
        dropdownRightButtonUpMain2.classList.add("sqd-hidden");
        dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
        actInputArea.classList.remove("sqd-hidden");
        // Action 2nd dropbox check
        if (
          choice1 == "Opened" ||
          choice1 == "Not Opened" ||
          choice1 == "Clicked" ||
          choice1 == "Not Clicked"
        ) {
          if (
            !dropdownBoxInnerTextAct1.textContent ||
            dropdownBoxInnerTextAct1.textContent == ""
          ) {
            vPrompt.setAttribute("x", (DROPDOWN_X2 - 30).toString());
            vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
            vPrompt.textContent = "Please select condition";
            vPrompt.classList.remove("sqd-hidden");
            dropdownBoxShapeAct1.setAttribute("stroke", "#FF0000");
            actDp1Validated = false;
          } else {
            vPrompt.classList.add("sqd-hidden");
            actDp1Validated = true;
          }
        }
      });

      dropdownBoxBottomShapecoverMain2_1.addEventListener(
        "click",
        function (e) {
          choice1 = dropdownBoxBottomShapeTextMain2.textContent;
          dropdownRightButtonUp.classList.add("sqd-hidden");
          dropdownRightButtonDown.classList.remove("sqd-hidden");
          dropdownRightButtonUpMain2.classList.add("sqd-hidden");
          dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
          gSubDropdownboxPopMain2_1.classList.add("sqd-hidden");
          gSubDropdownboxPop.classList.add("sqd-hidden");
          dropdownBoxInnerText.textContent =
            dropdownBoxBottomShapeTextMain2_1.textContent;
          dropdownBoxShape.setAttribute("stroke", "#bfbfbf");
          dropdownBoxInnerText.setAttribute(
            "style",
            "fill: #000000; font-size: 9pt"
          );
          gSubDropdown1.classList.add("sqd-hidden");
          gSubDropdown2.classList.add("sqd-hidden");
          dropdownBoxShape.setAttribute("width", `90`);
          dropdownRightButtonDown.setAttribute("x", `${DROPDOWN_X1 + 70}`);
          dropdownRightButtonUp.setAttribute("x", `${DROPDOWN_X1 + 70}`);
          dropdownRightButtonUp.classList.add("sqd-hidden");
          dropdownRightButtonDown.classList.remove("sqd-hidden");
          dropdownRightButtonUpMain2.classList.add("sqd-hidden");
          dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
          gSubDropdownAct1.classList.remove("sqd-hidden");
          gSubDropdownAct2.classList.remove("sqd-hidden");
        }
      );

      // Append Child ACTIONS
      gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapeTextMain2);
      gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapecoverMain2);
      gSubDropdownboxPopMain2_1.appendChild(dropdownBoxBottomShapeTextMain2_1);
      gSubDropdownboxPopMain2_1.appendChild(dropdownBoxBottomShapecoverMain2_1);
    }

    // ================= ACTIONS 2nd dropdown
    let listAct2: string[] = [];
    var url = window.location.pathname;
    var userID;
    if (url.includes("new")) {
      userID = url.slice(5);
    }
    else {
      userID = url.substring(1, url.lastIndexOf('/') + 1);
    }
    const request = new Request(
      `http://localhost:8080/getTransmission/${userID}`,
      { method: "GET" }
    );
    let champaingns: string[] = ["default"];
    // Async way to fetch tags
    const getChampaingns = async () => {
      const response = await fetch(request);
      if (response.ok) {
        const val = await response.json();
        champaingns = val;
        // return ["1 test1", "2 test2"];
        return champaingns;
      } else {
        return Promise.reject(response.status);
      }
    };

    getChampaingns()
      .then((champaingns) => {
        console.log("Fetching", champaingns);
        listAct2 = champaingns;
        const dropdownBoxBottomShapeAct2 = Dom.svg("rect", {
          width: DROPDOWN2_W,
          height: champaingns.length * DROPDOWN_H + 10,
          fill: "#fff",
          stroke: "#247d99",
          x: DROPDOWN_X2 - 30,
          y: DROPDOWN_Y + DROPDOWN_H + 10,
          rx: 4,
          ry: 4,
        });
        gSubDropdownboxAct1Pop.appendChild(dropdownBoxBottomShapeAct2);

        for (let i = 1; i <= champaingns.length; i++) {
          const dropdownBoxBottomShapeAct2Text = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X2 - 30 + 17,
            y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 13,
          });
          dropdownBoxBottomShapeAct2Text.textContent =
            champaingns[i - 1].split(" ")[1];
          let transIdText = champaingns[i - 1].split(" ")[0];
          const dropdownBoxBottomShapeAct2cover = Dom.svg("rect", {
            width: DROPDOWN2_W - 20,
            height: DROPDOWN_H - 5,
            class: "option select-field choice",
            fill: "#fff",
            x: DROPDOWN_X2 - 30 + 10,
            y: DROPDOWN_Y + DROPDOWN_H * i + 15,
            rx: 4,
            ry: 4,
            id: `dropdownBoxBottomShapeAct2cover${dropdownBoxBottomShapeAct2Text.textContent}${step.id}`,
          });
          Dom.attrs(dropdownBoxBottomShapeAct2cover, {
            opacity: 0.3,
          });

          // Add event listners for Action 2nd dropdown
          dropdownBoxBottomShapeAct2cover.addEventListener(
            "click",
            function (e) {
              dropdownBoxInnerTextAct1.textContent =
                dropdownBoxBottomShapeAct2Text.textContent;
              dropdownBoxInnerText1.textContent = ""; // Empty condition value of CONTACT INFO
              gSubDropdownboxAct1Pop.classList.toggle("sqd-hidden");
              dropdownBoxInnerTextAct1.setAttribute(
                "style",
                "fill: #000000; font-size: 9pt"
              );
              transId = transIdText;
              vPrompt.classList.add("sqd-hidden");
              dropdownBoxShapeAct1.setAttribute("stroke", "#BFBFBF");
              actDp1Validated = true;
              actTb1Validated = false;
              // Action - check texbox input
              if (!actTextInput || actTextInput.value == "") {
                vPrompt.setAttribute("x", (DROPDOWN_X3 - 12).toString());
                vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
                vPrompt.textContent = "Please enter value";
                actTb1Validated = false;
                vPrompt.classList.remove("sqd-hidden");
                actTextInput.setAttribute("style", "border-color: #FF0000");
              }
              actTextInput.addEventListener("input", function (e) {
                if (actTextInput.value == "") {
                  vPrompt.setAttribute("x", (DROPDOWN_X3 - 12).toString());
                  vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
                  vPrompt.textContent = "Please enter value";
                  actTb1Validated = false;
                  vPrompt.classList.remove("sqd-hidden");
                  actTextInput.setAttribute("style", "border-color: #FF0000");
                } else if (
                  !/^\d+(\.\d+)?$/.test(actTextInput.value) ||
                  parseFloat(actTextInput.value) <= 0
                ) {
                  vPrompt.setAttribute("x", (DROPDOWN_X3 - 12).toString());
                  vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
                  vPrompt.textContent = "Invalid value";
                  actTb1Validated = false;
                  vPrompt.classList.remove("sqd-hidden");
                  actTextInput.setAttribute("style", "border-color: #FF0000");
                } else {
                  actTb1Validated = true;
                  vPrompt.classList.add("sqd-hidden");
                  actTextInput.setAttribute("style", "border-color: #BFBFBF");
                  if (dropdownBoxInnerTextAct2.textContent == "") {
                    actDp2Validated = false;
                    vPrompt.setAttribute("x", (DROPDOWN_X3 + 52).toString());
                    vPrompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
                    vPrompt.textContent = "Please select unit";
                    vPrompt.classList.remove("sqd-hidden");
                    dropdownBoxShapeAct2.setAttribute("stroke", "#FF0000");
                  }
                }
              });
            }
          );

          // Append Child Action 2nd
          gSubDropdownboxAct1Pop.appendChild(dropdownBoxBottomShapeAct2Text);
          gSubDropdownboxAct1Pop.appendChild(dropdownBoxBottomShapeAct2cover);
        }
      })
      .catch(console.log);

    // ======================== ACTIONS 3rd dropdowns
    let list3Actions = ["Hour (s)", "Day (s)", "Month (s)", "Year (s)"];
    const dropdownBoxBottomShape2 = Dom.svg("rect", {
      width: 70,
      height: list3Actions.length * DROPDOWN_H + 10,
      class: "option select-field",
      fill: "#fff",
      stroke: "#247d99",
      x: DROPDOWN_X3 + 50,
      y: DROPDOWN_Y + DROPDOWN_H + 10,
      rx: 4,
      ry: 4,
    });
    gSubDropdownboxAct2Pop.appendChild(dropdownBoxBottomShape2);

    for (let i = 1; i <= list3Actions.length; i++) {
      const dropdownBoxBottomShapeAct2Text = Dom.svg("text", {
        class: "sqd-task-text",
        x: DROPDOWN_X3 + 50 + 7,
        y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 13,
      });
      dropdownBoxBottomShapeAct2Text.textContent = list3Actions[i - 1];
      const dropdownBoxBottomShape2cover = Dom.svg("rect", {
        width: 60,
        height: DROPDOWN_H - 5,
        class: "option select-field choice",
        fill: "#fff",
        x: DROPDOWN_X3 + 50 + 5,
        y: DROPDOWN_Y + DROPDOWN_H * i + 15,
        rx: 4,
        ry: 4,
        id: `dropdownBoxBottomShape2cover${list3Actions[i - 1]}${step.id}`,
      });
      Dom.attrs(dropdownBoxBottomShape2cover, {
        opacity: 0.3,
      });

      // Add event listners for ACTIONS 3rd dropdown
      dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
        dropdownBoxInnerTextAct2.textContent =
          dropdownBoxBottomShapeAct2Text.textContent;
        gSubDropdownboxAct2Pop.classList.toggle("sqd-hidden");
        dropdownBoxInnerTextAct2.setAttribute(
          "style",
          "fill: #000000; font-size: 9pt"
        );
        actDp2Validated = true;
        vPrompt.classList.add("sqd-hidden");
        dropdownBoxShapeAct2.setAttribute("stroke", "#BFBFBF");
      });

      // Append Child ACTIONS 3rd
      gSubDropdownboxAct2Pop.appendChild(dropdownBoxBottomShapeAct2Text);
      gSubDropdownboxAct2Pop.appendChild(dropdownBoxBottomShape2cover);
    }

    // =================== Append dropdowns
    // Right buttons
    gSubDropdown.appendChild(dropdownRightButtonDown);
    gSubDropdown.appendChild(dropdownRightButtonUp);
    gSubDropdown1.appendChild(dropdownRightButtonDown1);
    gSubDropdown1.appendChild(dropdownRightButtonUp1);
    gSubDropdown2.appendChild(dropdownRightButtonDown2);
    gSubDropdown2.appendChild(dropdownRightButtonUp2);
    gSubDropdownAct1.appendChild(dropdownRightButtonDownAct1);
    gSubDropdownAct1.appendChild(dropdownRightButtonUpAct1);
    gSubDropdownAct2.appendChild(dropdownRightButtonDownAct2);
    gSubDropdownAct2.appendChild(dropdownRightButtonUpAct2);
    gSubDropdownMain1.appendChild(dropdownRightButtonDownMain1);
    gSubDropdownMain1.appendChild(dropdownRightButtonUpMain1);
    gSubDropdownMain2.appendChild(dropdownRightButtonDownMain2);
    gSubDropdownMain2.appendChild(dropdownRightButtonUpMain2);
    // Insert before
    gSubDropdown.insertBefore(dropdownBoxShape, dropdownRightButtonDown);
    gSubDropdown1.insertBefore(dropdownBoxShape1, dropdownRightButtonDown1);
    gSubDropdown2.insertBefore(dropdownBoxShape2, dropdownRightButtonDown2);
    gSubDropdownAct1.insertBefore(
      dropdownBoxShapeAct1,
      dropdownRightButtonDownAct1
    );
    gSubDropdownAct2.insertBefore(
      dropdownBoxShapeAct2,
      dropdownRightButtonDownAct2
    );
    gSubDropdownMain1.insertBefore(
      dropdownBoxShapeMain1,
      dropdownRightButtonDownMain1
    );
    gSubDropdownMain2.insertBefore(
      dropdownBoxShapeMain2,
      dropdownRightButtonDownMain2
    );
    // Inner text
    gSubDropdown.appendChild(dropdownBoxInnerText);
    gSubDropdown1.appendChild(dropdownBoxInnerText1);
    gSubDropdown2.appendChild(dropdownBoxInnerText2);
    gSubDropdownAct1.appendChild(dropdownBoxInnerTextAct1);
    gSubDropdownAct2.appendChild(dropdownBoxInnerTextAct2);
    gSubDropdownMain1.appendChild(dropdownBoxInnerTextMain1);
    gSubDropdownMain2.appendChild(dropdownBoxInnerTextMain2);
    // Shape after
    gSubDropdown.appendChild(dropdownBoxShapeAfter);
    gSubDropdown1.appendChild(dropdownBoxShapeAfter1);
    gSubDropdown2.appendChild(dropdownBoxShapeAfter2);
    gSubDropdownAct1.appendChild(dropdownBoxShapeAfterAct1);
    gSubDropdownAct2.appendChild(dropdownBoxShapeAfterAct2);
    gSubDropdownMain1.appendChild(dropdownBoxShapeAfterMain1);
    gSubDropdownMain2.appendChild(dropdownBoxShapeAfterMain2);
    // Dropdown pop
    gSubDropdown.appendChild(gSubDropdownboxPop);
    gSubDropdown1.appendChild(gSubDropdownbox1Pop);
    gSubDropdown2.appendChild(defs);
    gSubDropdown2.appendChild(gSubDropdownbox2Pop);
    gSubDropdownAct1.appendChild(gSubDropdownboxAct1Pop);
    gSubDropdownAct2.appendChild(gSubDropdownboxAct2Pop);
    gSubDropdownMain1.appendChild(gSubDropdownboxPopMain1);
    gSubDropdownMain2.appendChild(gSubDropdownboxPopMain2);
    gSubDropdownMain2.appendChild(gSubDropdownboxPopMain2_1);

    gDropdown.appendChild(inputArea);
    gDropdown.appendChild(actInputArea);
    gDropdown.appendChild(vPrompt);
    gDropdown.appendChild(locInputArea);
    gDropdown.appendChild(locInputPop);
    gDropdown.appendChild(gValBtn);
    gDropdown.appendChild(gSubDropdownAct2);
    gDropdown.appendChild(gSubDropdownAct1);
    gDropdown.appendChild(gSubDropdown2);
    gDropdown.appendChild(gSubDropdown1);
    gDropdown.appendChild(gSubDropdown);
    g1.appendChild(moreIcon);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);
    g.appendChild(g1);

    g.appendChild(gRightPop3Reminder);
    g.appendChild(gUpPop3);
    g.appendChild(setUpReminder);

    // ========== Add EventListeners for "More" icon
    moreIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!gDropdown.classList.contains("sqd-hidden")) {
        console.log("Not permitted");
      } else {
        gRightPop3.classList.toggle("sqd-hidden");
      }
    });

    // ========================= More icons event listener
    editIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      rect.setAttribute("width", `${boxWidth}`);
      rect.setAttribute("x", `${containerWidths[0] - textWidth - 107}`);
      rectLeft.setAttribute("x", `${containerWidths[0] - textWidth - 107}`);
      text.setAttribute(
        "x",
        `${ICON_SIZE + containerWidths[0] - PADDING_X * 17 - 10}`
      );
      moreIcon.setAttribute(
        "x",
        `${ICON_SIZE + containerWidths[0] + PADDING_X + textWidth + 45}`
      );
      gDropdown.classList.remove("sqd-hidden");
      gUpPop3.classList.remove("sqd-hidden");
      gRightPop3.classList.toggle("sqd-hidden");
      if (
        step.properties["type"] == "Contact Info" ||
        !step.properties["type"]
      ) {
        gSubDropdown.classList.remove("sqd-hidden");
        gSubDropdown1.classList.remove("sqd-hidden");
        if (inputArea.classList.contains("sqd-hidden")) {
          gSubDropdown2.classList.remove("sqd-hidden");
        }
      }

      if (step.properties["type"] == "Actions") {
        gSubDropdown.classList.remove("sqd-hidden");
        dropdownBoxShape.setAttribute("width", `90`);
        dropdownRightButtonDown.setAttribute("x", `${DROPDOWN_X1 + 70}`);
        dropdownRightButtonUp.setAttribute("x", `${DROPDOWN_X1 + 70}`);
        gSubDropdown1.classList.add("sqd-hidden");
        gSubDropdown2.classList.add("sqd-hidden");
        gSubDropdownAct1.classList.remove("sqd-hidden");
        gSubDropdownAct2.classList.remove("sqd-hidden");
        actInputArea.classList.remove("sqd-hidden");
      }
    });

    let shapeMain2DefaultY: number = DROPDOWN_Y + 2 * DROPDOWN_H + 1;
    let btnMain2DefaultY: number = DROPDOWN_Y + 2 * DROPDOWN_H + 9;
    let innerTextMain2DefaultY: number = DROPDOWN_Y + 2 * DROPDOWN_H + 13 + 1;
    let shapeAfterMain2DefaultY: number = DROPDOWN_Y + 2 * DROPDOWN_H - 2;

    upCheckIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      rect.setAttribute("width", `258`);
      rect.setAttribute("x", `${containerWidths[0] - textWidth - 28}`);
      rectLeft.setAttribute("x", `${containerWidths[0] - textWidth - 28}`);
      text.setAttribute(
        "x",
        `${ICON_SIZE + containerWidths[0] - PADDING_X * 17 + 69}`
      );
      moreIcon.setAttribute(
        "x",
        `${ICON_SIZE + containerWidths[0] + PADDING_X + textWidth - 27}`
      );
      gDropdown.classList.add("sqd-hidden"); // hide main frame
      gDropdownbox.classList.add("sqd-hidden");
      gSubDropdownboxPopMain1.classList.add("sqd-hidden");
      gSubDropdownboxPopMain2.classList.add("sqd-hidden");
      gSubDropdownboxPopMain2_1.classList.add("sqd-hidden");
      dropdownRightButtonDownMain1.classList.remove("sqd-hidden");
      dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
      dropdownRightButtonUpMain1.classList.add("sqd-hidden");
      dropdownRightButtonUpMain2.classList.add("sqd-hidden");
      dropdownBoxBottomShape.setAttribute("height", `${shapeHeightCollapsed}`);
      dropdownBoxShapeMain2.setAttribute("y", `${shapeMain2DefaultY}`);
      dropdownRightButtonDownMain2.setAttribute("y", `${btnMain2DefaultY}`);
      dropdownRightButtonUpMain2.setAttribute("y", `${btnMain2DefaultY}`);
      dropdownBoxInnerTextMain2.setAttribute("y", `${innerTextMain2DefaultY}`);
      dropdownBoxShapeAfterMain2.setAttribute(
        "y",
        `${shapeAfterMain2DefaultY}`
      );
      gUpPop3.classList.add("sqd-hidden");
      step.properties["property"] = "";
      step.properties["condition"] = "";
      step.properties["value"] = "";
      step.properties["type"] = "";

      // =============== Add properties
      if (
        dropdownBoxInnerText.textContent == "Tag" ||
        dropdownBoxInnerText.textContent == "Gender" ||
        dropdownBoxInnerText.textContent == "Email Address" ||
        dropdownBoxInnerText.textContent == "Full Name" ||
        dropdownBoxInnerText.textContent == "First Name" ||
        dropdownBoxInnerText.textContent == "Last Name" ||
        dropdownBoxInnerText.textContent == "Phone Number" ||
        dropdownBoxInnerText.textContent == "Birthday" ||
        dropdownBoxInnerText.textContent == "Location"
      ) {
        step.properties["type"] = "Contact Info";
      } else if (
        dropdownBoxInnerText.textContent == "Opened" ||
        dropdownBoxInnerText.textContent == "Not Opened" ||
        dropdownBoxInnerText.textContent == "Clicked" ||
        dropdownBoxInnerText.textContent == "Not Clicked"
      ) {
        step.properties["type"] = "Actions";
      }
      if (
        dropdownBoxInnerText.textContent &&
        dropdownBoxInnerText.textContent != "Select a condition"
      ) {
        // textRight.textContent = dropdownBoxInnerText.textContent;
        step.properties["property"] = dropdownBoxInnerText.textContent;
      }
      if (
        step.properties["type"] == "Contact Info" &&
        dropdownBoxInnerText1.textContent &&
        dropdownBoxInnerText1.textContent != ""
      ) {
        // textRight.textContent = dropdownBoxInnerText.textContent;
        // console.log(dropdownBoxInnerText1.textContent);
        step.properties["condition"] = dropdownBoxInnerText1.textContent;
      } else if (
        step.properties["type"] == "Actions" &&
        dropdownBoxInnerTextAct1.textContent &&
        dropdownBoxInnerTextAct1.textContent != ""
      ) {
        step.properties["condition"] = dropdownBoxInnerTextAct1.textContent; // Set condition for ACTIONS
      }

      // All Validation
      let c1 = step.properties["property"];
      let c2 = step.properties["condition"];
      allValidated = false;
      if (c1 == "Tag") {
        if (dp1Validated && dp2Validated) {
          allValidated = true;
        }
      } else if (
        c1 == "Email Address" ||
        c1 == "Full Name" ||
        c1 == "First Name" ||
        c1 == "Last Name" ||
        c1 == "Phone Number"
      ) {
        if (tb1Validated || c2 == "Blank" || c2 == "Is Blank") {
          allValidated = true;
        }
      } else if (c1 == "Gender") {
        if (dp2Validated) {
          allValidated = true;
        }
      } else if (c1 == "Birthday") {
        if (c2 == "Month Is") {
          if (dp2Validated) {
            allValidated = true;
          }
        } else {
          if (dp1Validated && tb1Validated) {
            allValidated = true;
          }
        }
      } else if (c1 == "Location") {
        if (dp1Validated) {
          if (c2 == "Is Within" || c2 == "Is Not Within") {
            if (dp2Validated && locValidated) {
              allValidated = true;
            }
          } else {
            if (dp2Validated) {
              allValidated = true;
            }
          }
        }
      } else if (
        c1 == "Opened" ||
        c1 == "Not Opened" ||
        c1 == "Clicked" ||
        c1 == "Not Clicked"
      ) {
        if (actDp1Validated && actTb1Validated && actDp2Validated) {
          allValidated = true;
        }
      }

      // New click save validation logic
      if (allValidated && c2 != "Is Blank" && c2 != "Blank") {
        if (
          c1 == "Email Address" ||
          c1 == "Full Name" ||
          c1 == "First Name" ||
          c1 == "Last Name" ||
          c1 == "Phone Number" ||
          (c1 == "Birthday" &&
            (c2 == "Date Is" ||
              c2 == "Is Before Date" ||
              c2 == "Is After Date"))
        ) {
          step.properties["value"] = textInput.value;
        } else if (c1 == "Tag" || c1 == "Gender" || c2 == "Month Is") {
          if (dropdownBoxInnerText2.textContent) {
            step.properties["value"] = dropdownBoxInnerText2.textContent;
          }
        } else if (
          c1 == "Opened" ||
          c1 == "Not Opened" ||
          c1 == "Clicked" ||
          c1 == "Not Clicked"
        ) {
          step.properties["value"] =
            actTextInput.value + " " + dropdownBoxInnerTextAct2.textContent;
        } else if (c1 == "Location") {
          if (c2 == "Is Within" || c2 == "Is Not Within") {
            step.properties["value"] =
              dropdownBoxInnerText2.textContent + ", " + locTextInput.value;
          } else {
            step.properties["value"] = dropdownBoxInnerText2.textContent + "";
          }
        }
      } else {
        textInput.value = ""; // Reset
        dropdownBoxInnerText2.textContent = "";
        actTextInput.value == "";
      }

      // Popup logic
      if (allValidated) {
        gHint.classList.add("sqd-hidden");
      } else {
        gHint.classList.remove("sqd-hidden");
      }
      if (textRight.textContent != "" && step.properties["property"] != "") {
        textRight.textContent = step.properties["property"];
      }
    });

    // Reset the whole filter
    upchangeIcon.addEventListener("click", function (e) {
      gHint.classList.remove("sqd-hidden");
      allValidated = false;
      step.properties = {};
      textRight.textContent = "Choose Condition";
      dropdownBoxInnerText.textContent = "Select a condition";
      dropdownBoxInnerText.setAttribute(
        "style",
        "font-size: 8pt; fill: #bfbfbf"
      );
      dropdownBoxInnerText1.textContent = "";
      dropdownBoxInnerText2.textContent = "";
      textInput.value = "";
      actTextInput.value == "";
      dropdownBoxInnerTextMain1.textContent = "CONTACT INFO";
      dropdownBoxInnerTextMain2.textContent = "ACTIONS";
      gSubDropdown.classList.remove("sqd-hidden");
      gSubDropdown1.classList.remove("sqd-hidden");
      gSubDropdown2.classList.remove("sqd-hidden");
      vPrompt.classList.add("sqd-hidden");
      dropdownBoxShape1.classList.remove("sqd-hidden");
      dropdownBoxShape2.classList.remove("sqd-hidden");
      dropdownBoxShapeAct1.classList.add("sqd-hidden");
      dropdownBoxShapeAct2.classList.add("sqd-hidden");
      inputArea.classList.add("sqd-hidden");
      locInputArea.classList.add("sqd-hidden");
      actInputArea.classList.add("sqd-hidden");
      dropdownBoxShape1.setAttribute("stroke", "#bfbfbf");
      dropdownBoxShape2.setAttribute("stroke", "#bfbfbf");
      textInput.setAttribute("style", "border-color: #BFBFBF");
      locTextInput.setAttribute("style", "border-color: #BFBFBF");
      dropdownBoxShapeAct1.setAttribute("stroke", "#BFBFBF");
      actTextInput.setAttribute("style", "border-color: #BFBFBF");
      dropdownBoxShapeAct2.setAttribute("stroke", "#BFBFBF");
      dropdownBoxShape.setAttribute("width", `${DROPDOWN1_W}`);
      // gSubDropdownMain1.classList.add("sqd-hidden");
      // gSubDropdownMain2.classList.add("sqd-hidden");
      dropdownRightButtonDown.setAttribute(
        "x",
        `${DROPDOWN_X1 + DROPDOWN1_W - 20}`
      );
      dropdownRightButtonUp.setAttribute(
        "x",
        `${DROPDOWN_X1 + DROPDOWN1_W - 20}`
      );
      // locInputArea.classList.add("sqd-hidden");
      // inputArea.classList.add("sqd-hidden");
      locInputPop.classList.add("sqd-hidden");
      rect1.setAttribute("height", `${3 * boxHeight + 10}`);
      rectInnerBorder.setAttribute("height", `${boxHeight + 20}`);
    });

    // Edit button interaction
    editIcon.addEventListener("mouseover", function (e) {
      gRightPop3Reminder1.classList.remove("sqd-hidden");
    });
    editIcon.addEventListener("mouseout", function (e) {
      gRightPop3Reminder1.classList.add("sqd-hidden");
    });
    editIcon.addEventListener("mousedown", function (e) {
      rightEditImgContainerCircle.setAttribute("style", "fill: #3498db");
      editIcon.setAttribute("href", `${editUrlWhite}`);
      reminder1.classList.add("sqd-hidden");
      reminderText1.classList.add("sqd-hidden");
    });
    editIcon.addEventListener("mouseup", function (e) {
      rightEditImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
      editIcon.setAttribute("href", `${editUrl}`);
      reminder1.classList.remove("sqd-hidden");
      reminderText1.classList.remove("sqd-hidden");
    });
    // Copy button interaction
    changeIcon.addEventListener("mouseover", function (e) {
      gRightPop3Reminder2.classList.remove("sqd-hidden");
    });
    changeIcon.addEventListener("mouseout", function (e) {
      gRightPop3Reminder2.classList.add("sqd-hidden");
    });
    changeIcon.addEventListener("mousedown", function (e) {
      rightCopyImgContainerCircle.setAttribute("style", "fill: #3498db");
      changeIcon.setAttribute("href", `${changeUrlWhite}`);
      reminder2.classList.add("sqd-hidden");
      reminderText2.classList.add("sqd-hidden");
    });
    changeIcon.addEventListener("mouseup", function (e) {
      rightCopyImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
      changeIcon.setAttribute("href", `${changeUrl}`);
      reminder2.classList.remove("sqd-hidden");
      reminderText2.classList.remove("sqd-hidden");
    });
    // Delete button interaction
    deleteIcon.addEventListener("mouseover", function (e) {
      gRightPop3Reminder3.classList.remove("sqd-hidden");
    });
    deleteIcon.addEventListener("mouseout", function (e) {
      gRightPop3Reminder3.classList.add("sqd-hidden");
    });
    deleteIcon.addEventListener("mousedown", function (e) {
      rightDeleteImgContainerCircle.setAttribute("style", "fill: #3498db");
      deleteIcon.setAttribute("href", `${deleteUrlWhite}`);
      reminder3.classList.add("sqd-hidden");
      reminderText3.classList.add("sqd-hidden");
    });
    deleteIcon.addEventListener("mouseup", function (e) {
      rightDeleteImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
      deleteIcon.setAttribute("href", `${deleteUrl}`);
      reminder3.classList.remove("sqd-hidden");
      reminderText3.classList.remove("sqd-hidden");
    });

    // Event listeners in Dropdown
    // Expand 1st dropdown
    dropdownBoxShapeAfter.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownboxPop.classList.toggle("sqd-hidden");
      if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
        dropdownRightButtonUp.classList.remove("sqd-hidden");
        dropdownRightButtonDown.classList.add("sqd-hidden");
        dropdownBoxShape.setAttribute("stroke", "#247d99");
      } else {
        dropdownRightButtonUp.classList.add("sqd-hidden");
        dropdownRightButtonDown.classList.remove("sqd-hidden");
        dropdownBoxShape.setAttribute("stroke", "#bfbfbf");
      }
    });

    // Expand 2nd dropdown
    dropdownBoxShapeAfter1.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
      if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
        gSubDropdownboxPop.classList.remove("sqd-hidden");
      }
      if (gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
        dropdownRightButtonUp1.classList.add("sqd-hidden");
        dropdownRightButtonDown1.classList.remove("sqd-hidden");
        if (dp1Validated) {
          dropdownBoxShape1.setAttribute("stroke", "#bfbfbf");
        } else {
          // display red border
          dropdownBoxShape1.setAttribute("stroke", "#FF0000");
        }
      } else {
        dropdownRightButtonUp1.classList.remove("sqd-hidden");
        dropdownRightButtonDown1.classList.add("sqd-hidden");
        dropdownBoxShape1.setAttribute("stroke", "#247d99");
      }
    });

    dropdownBoxShapeAfter2.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownRightButtonUp2.classList.toggle("sqd-hidden");
      dropdownRightButtonDown2.classList.toggle("sqd-hidden");
      gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
      if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
        gSubDropdownboxPop.classList.remove("sqd-hidden");
      }
      if (gSubDropdownbox2Pop.classList.contains("sqd-hidden")) {
        dropdownRightButtonUp2.classList.add("sqd-hidden");
        dropdownRightButtonDown2.classList.remove("sqd-hidden");
        if (dp2Validated) {
          dropdownBoxShape2.setAttribute("stroke", "#bfbfbf");
        } else {
          // display red border
          dropdownBoxShape2.setAttribute("stroke", "#FF0000");
        }
      } else {
        dropdownRightButtonUp2.classList.remove("sqd-hidden");
        dropdownRightButtonDown2.classList.add("sqd-hidden");
        dropdownBoxShape2.setAttribute("stroke", "#247d99");
      }
    });

    dropdownBoxShapeAfterAct1.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownRightButtonUpAct1.classList.toggle("sqd-hidden");
      dropdownRightButtonDownAct1.classList.toggle("sqd-hidden");
      gSubDropdownboxAct1Pop.classList.toggle("sqd-hidden");
      if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
        gSubDropdownboxPop.classList.remove("sqd-hidden");
      }
      if (gSubDropdownboxAct1Pop.classList.contains("sqd-hidden")) {
        dropdownRightButtonUpAct1.classList.add("sqd-hidden");
        dropdownRightButtonDownAct1.classList.remove("sqd-hidden");
      } else {
        dropdownRightButtonUpAct1.classList.remove("sqd-hidden");
        dropdownRightButtonDownAct1.classList.add("sqd-hidden");
      }
    });

    dropdownBoxShapeAfterAct2.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownRightButtonUpAct2.classList.toggle("sqd-hidden");
      dropdownRightButtonDownAct2.classList.toggle("sqd-hidden");
      gSubDropdownboxAct2Pop.classList.toggle("sqd-hidden");
      if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
        gSubDropdownboxPop.classList.remove("sqd-hidden");
      }
      if (gSubDropdownboxAct2Pop.classList.contains("sqd-hidden")) {
        dropdownRightButtonUpAct2.classList.add("sqd-hidden");
        dropdownRightButtonDownAct2.classList.remove("sqd-hidden");
      } else {
        dropdownRightButtonUpAct2.classList.remove("sqd-hidden");
        dropdownRightButtonDownAct2.classList.add("sqd-hidden");
      }
    });

    // Contact Info Menu Button
    dropdownBoxShapeAfterMain1.addEventListener("click", function (e) {
      e.stopPropagation();
      let shapeHeight: any;
      gSubDropdownboxPopMain1.classList.toggle("sqd-hidden");
      if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
        gSubDropdownboxPopMain1.classList.remove("sqd-hidden");
      }
      if (gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
        dropdownRightButtonUpMain1.classList.add("sqd-hidden");
        dropdownRightButtonDownMain1.classList.remove("sqd-hidden");
      } else {
        dropdownRightButtonUpMain1.classList.remove("sqd-hidden");
        dropdownRightButtonDownMain1.classList.add("sqd-hidden");
      }
      // CI expanded
      if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
        shapeHeight = shapeHeightContact + 2 * CHOICE_H + 5;
        // CI expanded and actions expanded
        if (gSubDropdownboxPopMain2_1.classList.contains("sqd-hidden")) {
          dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
          dropdownBoxShapeMain2.setAttribute(
            "y",
            `${DROPDOWN_Y + shapeHeight - 2}`
          );
          dropdownRightButtonDownMain2.setAttribute(
            "y",
            `${DROPDOWN_Y + shapeHeight + 10}`
          );
          dropdownRightButtonUpMain2.setAttribute(
            "y",
            `${DROPDOWN_Y + shapeHeight + 10}`
          );
          dropdownBoxInnerTextMain2.setAttribute(
            "y",
            `${DROPDOWN_Y + shapeHeight + 18}`
          );
          dropdownBoxShapeAfterMain2.setAttribute(
            "y",
            `${DROPDOWN_Y + shapeHeight + 5}`
          );
        } else {
          shapeHeight =
            shapeHeightContact + 2 * CHOICE_H + 3 + shapeHeightActions;
          dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
        }
      }

      // CI collapsed and actions collapsed
      if (
        gSubDropdownboxPopMain1.classList.contains("sqd-hidden") &&
        gSubDropdownboxPopMain2.classList.contains("sqd-hidden")
      ) {
        dropdownBoxBottomShape.setAttribute(
          "height",
          `${shapeHeightCollapsed}`
        );
        dropdownBoxShapeMain2.setAttribute("y", `${shapeMain2DefaultY}`);
        dropdownRightButtonDownMain2.setAttribute("y", `${btnMain2DefaultY}`);
        dropdownRightButtonUpMain2.setAttribute("y", `${btnMain2DefaultY}`);
        dropdownBoxInnerTextMain2.setAttribute(
          "y",
          `${innerTextMain2DefaultY}`
        );
        dropdownBoxShapeAfterMain2.setAttribute(
          "y",
          `${shapeAfterMain2DefaultY}`
        );
      }

      // CI expanded and actions expanded
      if (
        !gSubDropdownboxPopMain2.classList.contains("sqd-hidden") &&
        !gSubDropdownboxPopMain1.classList.contains("sqd-hidden")
      ) {
        shapeHeight =
          shapeHeightContact + 2 * CHOICE_H + 3 + shapeHeightActions;
        dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
        gSubDropdownboxPopMain2.classList.add("sqd-hidden");
        gSubDropdownboxPopMain2_1.classList.remove("sqd-hidden");
      }
      // CI collapsed and actions expanded
      else if (
        !gSubDropdownboxPopMain2_1.classList.contains("sqd-hidden") &&
        gSubDropdownboxPopMain1.classList.contains("sqd-hidden")
      ) {
        shapeHeight = 2 * CHOICE_H + 7 + shapeHeightActions;
        dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
        gSubDropdownboxPopMain2.classList.remove("sqd-hidden");
        gSubDropdownboxPopMain2_1.classList.add("sqd-hidden");
      }
    });

    dropdownBoxShapeAfterMain2.addEventListener("click", function (e) {
      e.stopPropagation();
      if (
        gSubDropdownboxPopMain2.classList.contains("sqd-hidden") &&
        gSubDropdownboxPopMain2_1.classList.contains("sqd-hidden")
      ) {
        dropdownRightButtonUpMain2.classList.remove("sqd-hidden");
        dropdownRightButtonDownMain2.classList.add("sqd-hidden");
      } else {
        dropdownRightButtonUpMain2.classList.add("sqd-hidden");
        dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
      }
      let shapeHeight: any;
      // CI collapsed
      if (gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
        gSubDropdownboxPopMain2_1.classList.add("sqd-hidden");
        gSubDropdownboxPopMain2.classList.toggle("sqd-hidden");
        // Actions collapsed
        if (gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
          dropdownBoxBottomShape.setAttribute(
            "height",
            `${shapeHeightCollapsed}`
          );
        } else {
          shapeHeight = 2 * CHOICE_H + 7 + shapeHeightActions;
          dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
        }
      }
      // CI expanded
      if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
        gSubDropdownboxPopMain2.classList.add("sqd-hidden");
        gSubDropdownboxPopMain2_1.classList.toggle("sqd-hidden");
        // Actions collapsed
        if (gSubDropdownboxPopMain2_1.classList.contains("sqd-hidden")) {
          shapeHeight = shapeHeightContact + 2 * CHOICE_H + 5;
          dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
        } else {
          shapeHeight =
            shapeHeightContact + 2 * CHOICE_H + 3 + shapeHeightActions;
          dropdownBoxBottomShape.setAttribute("height", `${shapeHeight}`);
        }
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

    const scrollboxViewCountry: ScrollBoxViewCountry =
      ScrollBoxViewCountry.create(dropdownPopBody2, gSubDropdownbox2Pop);
    scrollboxViewCountry.setContent(dropdownPopItemDiv2);

    const scrollBoxViewState: ScrollBoxViewState = ScrollBoxViewState.create(
      dropdownPopBody3,
      gSubDropdownbox2Pop
    );
    scrollBoxViewState.setContent(dropdownPopItemDiv3);

    const scrollboxViewLocation: ScrollBoxViewLocation =
      ScrollBoxViewLocation.create(searchPopBody, locInputPop);
    scrollboxViewLocation.setContent(searchPopItemDiv);

    const regionView = RegionView.create(g, containerWidths, containerHeight);

    const validationErrorView = ValidationErrorView.create(
      g,
      containersWidth,
      0
    );

    // Recovery
    if (
      (step.properties["value"] != "" ||
        step.properties["condition"] == "Is Blank" ||
        step.properties["condition"] == "Blank") &&
      step.properties["type"] == "Contact Info"
    ) {
      let Main1Button = document.getElementById(
        `dropdownBoxShapeAfterMain1${step.id}`
      );
      let prevMain1 = document.getElementById(
        `dropdownBoxBottomShapecoverMain1${step.properties["property"]}${step.id}`
      );
      if (Main1Button && prevMain1) {
        Main1Button.dispatchEvent(fakeClick);
        prevMain1.dispatchEvent(fakeClick);
      } else {
        console.warn("Element not found!");
      }
      // Gender has its own duplicate UI element, should be adjusted later
      if (choice1 == "Gender") {
        let prevDp2 = document.getElementById(
          `dropdownBoxBottomShape2cover${step.properties["value"]}${step.id}`
        );
        if (prevDp2) {
          // Click two times to hide the list
          prevDp2.dispatchEvent(fakeClick);
          prevDp2.dispatchEvent(fakeClick);
        }
      }
      if (step.properties["condition"] != "Is") {
        let prevDp1 = document.getElementById(
          `dropdownBoxBottomShape1cover${step.properties["condition"]}${step.id}`
        );
        if (prevDp1) {
          prevDp1.dispatchEvent(fakeClick);
          prevDp1.dispatchEvent(fakeClick);
        }
      }
      if (
        choice2 == "Exists" ||
        choice2 == "Does Not Exists" ||
        choice2 == "Month Is" ||
        choice2 == "Is In Country" ||
        choice2 == "Is Not In Country" ||
        choice2 == "Is In US State" ||
        choice2 == "Is Not In US State"
      ) {
        let prevDp2 = document.getElementById(
          `dropdownBoxBottomShape2cover${step.properties["value"]}${step.id}`
        );
        if (prevDp2) {
          prevDp2.dispatchEvent(fakeClick);
          prevDp2.dispatchEvent(fakeClick);
        }
      }
      if ((choice1 == "Birthday" && choice2 != "Month Is") ||
        ((choice1 == "Email Address" || choice1 == "Phone Number" ||
        choice1 == "First Name" || choice1 == "Last Name" ||
        choice1 == "Full Name") && choice2 != "Blank" && choice2 != "Is Blank"
      )) {
        textInput.value = step.properties["value"].toString();
        textInput.dispatchEvent(fakeInput);
      }
      if (
        choice1 == "Location" &&
        (choice2 == "Is Within" || choice2 == "Is Not Within")
      ) {
        let parts = step.properties["value"].toString().split(", ");
        let distance = parts[0];
        let loc = parts[1];
        let prevDp2 = document.getElementById(
          `dropdownBoxBottomShape2cover${distance}${step.id}`
        );
        if (prevDp2) {
          prevDp2.dispatchEvent(fakeClick);
          prevDp2.dispatchEvent(fakeClick);
          locTextInput.value = loc;
          locTextInput.dispatchEvent(fakeInput);
        }
      }
      gHint.classList.add("sqd-hidden");
    } else if (
      step.properties["value"] != "" &&
      step.properties["type"] == "Action"
    ) {
      let parts = step.properties["value"].toString().split(" ");
      let num = parts[0];
      let time = parts[1];
      actTextInput.value = num;
      let Main2Button = document.getElementById(
        `dropdownBoxShapeAfterMain2${step.id}`
      );
      let prevMain2 = document.getElementById(
        `dropdownBoxBottomShapecoverMain2${step.properties["property"]}${step.id}`
      );
      let prevActDp1 = document.getElementById(
        `dropdownBoxBottomShapeAct2cover${step.properties["condition"]}${step.id}`
      );
      let prevActDp2 = document.getElementById(
        `dropdownBoxBottomShape2cover${time}${step.id}`
      );
      if (Main2Button && prevMain2 && prevActDp1 && prevActDp2) {
        Main2Button.dispatchEvent(fakeClick);
        prevMain2.dispatchEvent(fakeClick);
        prevActDp1.dispatchEvent(fakeInput);
        prevActDp2.dispatchEvent(fakeClick);
        prevActDp2.dispatchEvent(fakeClick);
      }
      gHint.classList.add("sqd-hidden");
    }

    return new SwitchStepComponentView(
      g,
      containersWidth,
      containerHeight,
      containerWidths[0],
      sequenceComponents,
      regionView,
      scrollboxViewCountry,
      scrollboxViewLocation,
      scrollBoxViewState,
      validationErrorView
    );
  }

  public getClientPosition(): Vector {
    return this.regionView.getClientPosition();
  }

  public containsElement(element: Element): boolean {
    return this.g.contains(element);
  }

  public setIsDragging(isDragging: boolean) {
    // this.inputView.setIsHidden(isDragging);
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

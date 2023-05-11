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

const MIN_CHILDREN_WIDTH = 200;
const PADDING_X = 20;
const PADDING_TOP = 20;
const LABEL_HEIGHT = 22;
const CONNECTION_HEIGHT = 16;
const RECT_RADIUS = 15;
const MIN_TEXT_WIDTH = 98; // 70
const PADDING_Y = 10;
const ICON_SIZE = 22;
const DROPDOWN1_W = 120;
const DROPDOWN2_W = 110;
const DROPDOWN3_W = 80;
const DROPDOWN_H = 25;

export class SwitchStepComponentView implements ComponentView {
  public static create(
    parent: SVGElement,
    step: SwitchStep,
    configuration: StepsConfiguration
  ): SwitchStepComponentView {
    const g = Dom.svg("g", {
      class: `sqd-switch-group sqd-type-${step.type}`,
    });
    parent.insertBefore(g, parent.firstChild);

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

        const DROPDOWN_Y = 83;
        const DROPDOWN_X1 = containerWidths[0] - 195; // -5;
        const DROPDOWN_X2 = containerWidths[0] - 54; // 136;
        const DROPDOWN_X3 = containerWidths[0] + 78; // 268;
        const g1 = Dom.svg("g");

        const text = Dom.svg("text", {
            x: ICON_SIZE + containerWidths[0] - PADDING_X / 2 - 187, // = 42 -> 15
            y: boxHeight / 2.0 + PADDING_TOP,
            class: "sqd-task-text",
        });
        text.textContent = "If/Else";
        g1.appendChild(text);
        const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH);
        const boxWidth = ICON_SIZE + 10 * PADDING_X + 2 * textWidth;

        const rect = Dom.svg("rect", {
            x: containerWidths[0] - textWidth - 110, // = 7 -> -18
            y: PADDING_TOP,
            class: "sqd-switch-rect",
            width: boxWidth,
            height: boxHeight,
            rx: 15,
            ry: 15,
        });
        g1.insertBefore(rect, text);
        const rectLeft = Dom.svg("rect", {
            x: containerWidths[0] - textWidth - 110,
            y: PADDING_TOP,
            class: "sqd-switch-rect",
            width: textWidth + 5,
            height: boxHeight,
            rx: RECT_RADIUS,
            ry: RECT_RADIUS,

        });
        const textRight = Dom.svg("text", {
            x: ICON_SIZE + containerWidths[0] - 37, // = 252 -> 175
            y: boxHeight / 2.0 + PADDING_TOP,
            class: "sqd-task-text",

        });

        if (step.properties["value"]) {
            textRight.textContent = "If " + step.properties["value"].toString() + " exists in the " + step.properties["property"].toString();

        } else {
            textRight.textContent = "Choose Condition";
        }
        g1.appendChild(textRight);
        g1.insertBefore(rectLeft, text);
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
            class: "moreIcon",
            x: ICON_SIZE + containerWidths[0] + PADDING_X + textWidth + 43, // = 358 -> 373
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 60,
            y: PADDING_Y + 10, // 
        });
        Dom.attrs(rightCopyImgContainerCircle, {
            width: 30,
            height: 30,
            rx: 50,
            ry: 50,
        });
        const changeUrl = "./assets/copy.svg";
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 63,
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 40,
            y: PADDING_Y + 40,
        });
        Dom.attrs(rightDeleteImgContainerCircle, {
            width: 30,
            height: 30,
            rx: 50,
            ry: 50,
        });
        const deleteUrl = "./assets/delete.svg";
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 43,
            y: PADDING_Y + 43,
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 40, // 366
            y: PADDING_Y - 20, // -30
        });
        Dom.attrs(rightEditImgContainerCircle, {
            width: 30,
            height: 30,
            rx: 50,
            ry: 50,
        });
        const editUrl = "./assets/edit.svg";
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 43,
            y: PADDING_Y - 16,
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
            class: "sqd-task-ImgContainerCircle",
            x:containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE - 56,
            y: PADDING_Y - 30,
        });
        Dom.attrs(checkImgContainerCircle, {
            width: 30,
            height: 30,
            rx: 50,
            ry: 50,
        });
        const upCheckIconUrl = "./assets/check.svg";
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE - 52, // 200
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 14, 
            y: PADDING_Y - 30,
        });
        Dom.attrs(deleteImgContainerCircle, {
            width: 30,
            height: 30,
            rx: 50,
            ry: 50,
        });
        const upDeleteIconUrl = "./assets/delete.svg";
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 18,
            y: PADDING_Y - 26,
            width: ICON_SIZE,
            height: ICON_SIZE,
        });
        deleteImgContainer.appendChild(deleteImgContainerCircle);
        deleteImgContainer.appendChild(upDeleteIcon);

        upDeleteIcon.addEventListener("click", function(e) {
            console.log("Up delete clicked"); 
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
        const copyImgContainerCircle = Dom.svg("rect", {
            class: "sqd-task-ImgContainerCircle",
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE - 21,
            y: PADDING_Y - 30,
        });
        Dom.attrs(copyImgContainerCircle, {
            width: 30,
            height: 30,
            rx: 50,
            ry: 50,
        });
        const upchangeUrl = "./assets/change.svg";
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE - 17,
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
            class: `sqd-task-group up-popup sqd-hidden Collapsed`,
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
            class: "sqd-task-rect",
            width: 50,
            height: 25,
            rx: RECT_RADIUS,
            ry: RECT_RADIUS,
        });
        Dom.attrs(reminder1, {
            id: `reminder1${Date.now()}`,
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 77, // 380 -> 420 
            y: PADDING_Y - 18, // -25 -> -8
        });

        const reminderText1 = Dom.svg("text", {
            class: "sqd-task-text",
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 77 + 13,
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
            class: "sqd-task-rect",
            width: 50,
            height: 25,
            rx: RECT_RADIUS,
            ry: RECT_RADIUS,
        });
        Dom.attrs(reminder2, {
            id: `reminder2${Date.now()}`,
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 97,
            y: PADDING_Y + 13,
        });

        const reminderText2 = Dom.svg("text", {
            class: "sqd-task-text",
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 97 + 10,
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
            class: "sqd-task-rect",
            width: 50,
            height: 25,
            rx: RECT_RADIUS,
            ry: RECT_RADIUS,
        });
        Dom.attrs(reminder3, {
            id: `reminder3${Date.now()}`,
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 77,
            y: PADDING_Y + 43,
        });

        const reminderText3 = Dom.svg("text", {
            class: "sqd-task-text",
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 77 + 6,
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
            class: `sqd-task-group dropdown sqd-hidden Collapsed`,
        });

        const rect1 = Dom.svg("rect", {
            x: containerWidths[0] - textWidth - 110,
            y: PADDING_TOP + 33,  //53,
            class: "sqd-switch-rect",
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
        const nameTextMain1 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + 15,
        });
        Dom.attrs(nameTextMain1, {
            //class: 'sqd-hidden',
            id: `dropdownwordmain1${Date.now()}`,
        });
        const nameTextMain2 = Dom.svg("text", {
            class: "sqd-task-text",
            x: PADDING_X,
            y: DROPDOWN_Y + 30,
        });
        Dom.attrs(nameTextMain2, {
            //class: 'sqd-hidden',
            id: `dropdownwordmain2${Date.now()}`,
        });

        nameText.textContent = "";
        nameText1.textContent = "";
        nameText2.textContent = "";
        nameTextMain1.textContent = "";
        nameTextMain2.textContent = "";
        gDropdown.appendChild(nameText);
        gDropdown.appendChild(nameText1);
        gDropdown.appendChild(nameText2);
        gDropdown.appendChild(nameTextMain1);
        gDropdown.appendChild(nameTextMain2);
        gDropdown.insertBefore(rect1, nameText);

        // =============== gSubDropdown
        const gSubDropdown = Dom.svg("g", {
            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
        });
        const gSubDropdown1 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
        });
        const gSubDropdown2 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
        });
        const gSubDropdownMain1 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdown Collapsed`,
        });
        const gSubDropdownMain2 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdown Collapsed`,
        });

        // =============== gSubDropdownbox
        const gSubDropdownbox = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox`,
        });
        const gSubDropdownbox1 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox`,
        });
        const gSubDropdownbox2 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox`,
        });
        const gSubDropdownboxMain1 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox`,
        });
        const gSubDropdownboxMain2 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox`,
        });
        // ================== dropdownBoxShape
        const dropdownBoxShape = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#a0a0a0",
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
            stroke: "#a0a0a0",
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
            stroke: "#a0a0a0",
            x: DROPDOWN_X3,
            y: DROPDOWN_Y,
            rx: 5,
            ry: 5,
        });
        const dropdownBoxShapeMain1 = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#a0a0a0",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + DROPDOWN_H,
            rx: 5,
            ry: 5,
        });
        const dropdownBoxShapeMain2 = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#a0a0a0",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + 2 * DROPDOWN_H,
            rx: 5,
            ry: 5,
        });
        // ================= dropdownRightButton
        const dropdownRightButton = Dom.svg("text", {
            class: "sqd-task-text select-field",
            x: DROPDOWN_X1 + 105,
            y: DROPDOWN_Y + 12,
        });
        const dropdownRightButton1 = Dom.svg("text", {
            class: "sqd-task-text select-field",
            x: DROPDOWN_X2 + 95,
            y: DROPDOWN_Y + 12,
        });
        const dropdownRightButton2 = Dom.svg("text", {
            class: "sqd-task-text select-field",
            x: DROPDOWN_X3 + 105,
            y: DROPDOWN_Y + 12,
        });
        const dropdownRightButtonMain1 = Dom.svg("text", {
            class: "sqd-task-text select-field",
            x: DROPDOWN_X1 + 105,
            y: DROPDOWN_Y + DROPDOWN_H + 13,
        });
        const dropdownRightButtonMain2 = Dom.svg("text", {
            class: "sqd-task-text select-field",
            x: DROPDOWN_X1 + 105,
            y: DROPDOWN_Y + 2 * DROPDOWN_H + 13,
        });

        dropdownRightButton.textContent = "▼";
        dropdownRightButton1.textContent = "▼";
        dropdownRightButton2.textContent = "▼";
        dropdownRightButtonMain1.textContent = "▼";
        dropdownRightButtonMain2.textContent = "▼";

        // ================= dropdownBoxInnerText
        const dropdownBoxInnerText = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X1 + 5,
            y: DROPDOWN_Y + 12,
        });
        dropdownBoxInnerText.textContent = "Condition";
        const dropdownBoxInnerText1 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X2 + 3,
            y: DROPDOWN_Y + 12,
        });
        dropdownBoxInnerText1.textContent = "";
        const dropdownBoxInnerText2 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X3 + 3,
            y: DROPDOWN_Y + 12,
        });
        dropdownBoxInnerText2.textContent = "";
        const dropdownBoxInnerTextMain1 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X1 + 3,
            y: DROPDOWN_Y + DROPDOWN_H + 13,
        });
        dropdownBoxInnerTextMain1.textContent = "CONTACT INFO";
        const dropdownBoxInnerTextMain2 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X1 + 3,
            y: DROPDOWN_Y + 2 * DROPDOWN_H + 13,
        });
        dropdownBoxInnerTextMain2.textContent = "ACTIONS";

        // ================== dropdownBoxShapeAfter
        const dropdownBoxShapeAfter = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: DROPDOWN_H,
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
        const dropdownBoxShapeAfter1 = Dom.svg("rect", {
            width: DROPDOWN2_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#a0a0a0",
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
            stroke: "#a0a0a0",
            x: DROPDOWN_X3,
            y: DROPDOWN_Y,
            id: `dropdownBoxShapeAfter2${Date.now()}`,
        });
        Dom.attrs(dropdownBoxShapeAfter2, {
            opacity: 0,
        });
        const dropdownBoxShapeAfterMain1 = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#a0a0a0",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + DROPDOWN_H,
            id: `dropdownBoxShapeMain1${Date.now()}`,
        });
        Dom.attrs(dropdownBoxShapeAfterMain1, {
            opacity: 0,
        });
        const dropdownBoxShapeAfterMain2 = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#a0a0a0",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + 2 * DROPDOWN_H,
            id: `dropdownBoxShapeMain2${Date.now()}`,
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
        const gSubDropdownbox2Pop = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
        });
        const gSubDropdownboxPopMain1 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
        });
        const gSubDropdownboxPopMain2 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
        });

        // ================ Text input
        const inputArea = Dom.svg("foreignObject", {
            class: "email-input sqd-hidden",
            x: DROPDOWN_X3 - 8,
            y: 83,
            width: 180,
            height: 30,
        });

        const emailInput = Dom.element('input', {
            class: `sqd-email-input sqd-hidden`,
            type: 'text',
            placeholder: 'Email...',
            value: "",
        });

        inputArea.appendChild(emailInput);

        // =================== Dropdown item lists 
        let list1 = [''];
        let contInfo = ['Tag', 'Email Address', 'Gender', 'First Name', 'Last Name', 'Full Name', 'Phone Number', 'Birthday', 'Location'];
        let actions = ['Opened', 'Not Opened', 'Clicked', 'Not Clicked'];
        let list2 = [''];
        let list2Tag = ['Exists', 'Does not exist'];
        let list2Gender = ['is'];
        let list2Bd = ['Month is', 'Date is', 'is before date', 'is After date', 'is Blank'];
        let list2Email = ['Contains', 'Does Not Contain', 'Is Blank'];
        let list2Loc = ['Is Within', 'Is Not Within', 'Is in Country', 'Is not in Country', 'Is in US state', 'Is not in US state'];
        let list3: any = [''];
        let list3Tag = ['Tag A', 'Tag B'];
        let list3Gender = ['Male', 'Female', 'Non-binary', 'Blank'];
        let list3Bdm = ['Janurary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let list3LocWithin = [25, 50, 75, 100, 150, 200];
        let list3Ctry = ['United States', 'Canada', 'United Kingdom', 'France', 'German', 'Italy', '...'];
        let list3State = ['California', 'New York', 'New Jersey', 'Arizona', '...'];
        let list3Actions = ['Campaign A', 'Campaign B', 'Campaign C'];
        let choice1: string | null = "";
        let choice2: string | null = "";

        // ============ 1st dropdown
        for (let i = 1; i <= list1.length; i++) {
            const dropdownBoxBottomShape = Dom.svg("rect", {
                width: DROPDOWN1_W,
                height: DROPDOWN_H,
                class: "option select-field",
                fill: "#fff",
                stroke: "#a0a0a0",
                x: DROPDOWN_X1,
                y: DROPDOWN_Y + DROPDOWN_H * i,
            });
            const dropdownBoxBottomShapeText = Dom.svg("text", {
                class: "sqd-task-text",
                x: DROPDOWN_X1 + 2,
                y: DROPDOWN_Y + 11 + DROPDOWN_H * i,
            });
            dropdownBoxBottomShapeText.textContent = list1[i - 1];
            const dropdownBoxBottomShapecover = Dom.svg("rect", {
                width: DROPDOWN1_W,
                height: DROPDOWN_H,
                class: "option select-field choice",
                fill: "#fff",
                stroke: "#a0a0a0",
                x: DROPDOWN_X1,
                y: DROPDOWN_Y + DROPDOWN_H * i,
                id: `dropdownBoxBottomShapecover${Date.now()}`,
            });
            Dom.attrs(dropdownBoxBottomShapecover, {
                opacity: 0.3,
            });
        }

        // ================ CONTACT INFO dropdown
        for (let i = 1; i <= contInfo.length; i++) {
            const dropdownBoxBottomShapeMain1 = Dom.svg("rect", {
                width: DROPDOWN1_W,
                height: DROPDOWN_H,
                class: "option select-field",
                fill: "#fff",
                stroke: "#a0a0a0",
                x: DROPDOWN_X1,
                y: DROPDOWN_Y + DROPDOWN_H + DROPDOWN_H * i,
            });
            const dropdownBoxBottomShapeTextMain1 = Dom.svg("text", {
                class: "sqd-task-text",
                x: DROPDOWN_X1 + 2,
                y: DROPDOWN_Y + DROPDOWN_H + 11 + DROPDOWN_H * i,
            });
            dropdownBoxBottomShapeTextMain1.textContent = contInfo[i - 1];
            const dropdownBoxBottomShapecoverMain1 = Dom.svg("rect", {
                width: DROPDOWN1_W,
                height: DROPDOWN_H,
                class: "option select-field choice",
                fill: "#fff",
                stroke: "#a0a0a0",
                x: DROPDOWN_X1,
                y: DROPDOWN_Y + DROPDOWN_H + DROPDOWN_H * i,
                id: `dropdownBoxBottomShapecoverMain1${Date.now()}`,
            });
            Dom.attrs(dropdownBoxBottomShapecoverMain1, {
                opacity: 0.3,
            });

            dropdownBoxBottomShapecoverMain1.addEventListener("click", function (e) {
                choice1 = dropdownBoxBottomShapeTextMain1.textContent;
                gSubDropdownboxPopMain1.classList.toggle("sqd-hidden");
                gSubDropdownMain1.classList.toggle("sqd-hidden");
                gSubDropdownMain2.classList.toggle("sqd-hidden");
                gSubDropdown1.classList.remove('sqd-hidden');
                gSubDropdown2.classList.remove('sqd-hidden');
                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeTextMain1.textContent;
                if (choice1 == 'Tag') {
                    list2 = list2Tag;
                } else if (choice1 == 'Gender') {
                    list2 = list2Gender;
                } else if (choice1 == 'Birthday') {
                    list2 = list2Bd;
                } else if (choice1 == 'Email Address') {
                    list2 = list2Email;
                    gSubDropdown2.classList.add("sqd-hidden");
                    inputArea.classList.remove("sqd-hidden");
                } else if (choice1 == 'Location') {
                    list2 = list2Loc;
                } if (choice1 != 'Email Address') {
                    inputArea.classList.add("sqd-hidden");
                }
                // ===================== 2nd dropdown
                for (let i = 1; i <= list2.length; i++) {
                    const dropdownBoxBottomShape1 = Dom.svg("rect", {
                        width: DROPDOWN2_W,
                        height: DROPDOWN_H,
                        class: "option select-field",
                        fill: "#fff",
                        stroke: "#a0a0a0",
                        x: DROPDOWN_X2,
                        y: DROPDOWN_Y + DROPDOWN_H * i,
                    });

                    const dropdownBoxBottomShape1Text = Dom.svg("text", {
                        class: "sqd-task-text",
                        x: DROPDOWN_X2 + 2,
                        y: DROPDOWN_Y + 11 + DROPDOWN_H * i,
                    });
                    dropdownBoxBottomShape1Text.textContent = list2[i - 1];

                    const dropdownBoxBottomShape1cover = Dom.svg("rect", {
                        width: DROPDOWN2_W,
                        height: DROPDOWN_H,
                        class: "option select-field choice",
                        fill: "#fff",
                        stroke: "#a0a0a0",
                        x: DROPDOWN_X2,
                        y: DROPDOWN_Y + DROPDOWN_H * i,
                        id: `dropdownBoxBottomShape1cover${Date.now()}`,
                    });
                    Dom.attrs(dropdownBoxBottomShape1cover, {
                        opacity: 0.3,
                    });
                    // Add event listners for 2nd dropdowns 
                    dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
                        dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
                        gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
                        choice2 = dropdownBoxInnerText1.textContent;
                        if (choice2 == 'Exists' || choice2 == 'Does not exist') {
                            list3 = list3Tag;
                        } else if (choice2 == 'is') {
                            list3 = list3Gender;
                        } else if (choice2 == 'Month is') {
                            list3 = list3Bdm;
                        } else if (choice2 == 'Date is') {
                            list3 = [1, 2, 3];
                        } else if (choice2 == 'Is Within' || choice2 == 'Is Not Within') {
                            list3 = list3LocWithin;
                        } else if (choice2 == 'Is in Country' || choice2 == 'Is not in Country') {
                            list3 = list3Ctry;
                        }

                        // ======================== 3rd dropdowns 
                        for (let i = 1; i <= list3.length; i++) {
                            const dropdownBoxBottomShape2 = Dom.svg("rect", {
                                width: DROPDOWN1_W,
                                height: DROPDOWN_H,
                                class: "option select-field",
                                fill: "#fff",
                                stroke: "#a0a0a0",
                                x: DROPDOWN_X3,
                                y: DROPDOWN_Y + DROPDOWN_H * i,
                            });
                            const dropdownBoxBottomShape2Text = Dom.svg("text", {
                                class: "sqd-task-text",
                                x: DROPDOWN_X3 + 2,
                                y: DROPDOWN_Y + 11 + DROPDOWN_H * i,
                            });
                            dropdownBoxBottomShape2Text.textContent = list3[i - 1];
                            const dropdownBoxBottomShape2cover = Dom.svg("rect", {
                                width: DROPDOWN1_W,
                                height: DROPDOWN_H,
                                class: "option select-field choice",
                                fill: "#fff",
                                stroke: "#a0a0a0",
                                x: DROPDOWN_X3,
                                y: DROPDOWN_Y + DROPDOWN_H * i,
                                id: `dropdownBoxBottomShape2cover${Date.now()}`,
                            });
                            Dom.attrs(dropdownBoxBottomShape2cover, {
                                opacity: 0.3,
                            });

                            // Add event listners for 3rd dropdown 
                            dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
                                dropdownBoxInnerText2.textContent = dropdownBoxBottomShape2Text.textContent;
                                gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
                            });

                            // Append Child 3rd 
                            gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
                            gSubDropdownbox2Pop.insertBefore(
                                dropdownBoxBottomShape2,
                                dropdownBoxBottomShape2Text
                            );
                            gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
                        }

                    });

                    // Append Child 2nd 
                    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
                    gSubDropdownbox1Pop.insertBefore(
                        dropdownBoxBottomShape1,
                        dropdownBoxBottomShape1Text
                    );
                    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
                }

            });

            // Append Child CONTACT INFO  
            gSubDropdownboxPopMain1.appendChild(dropdownBoxBottomShapeTextMain1);
            gSubDropdownboxPopMain1.insertBefore(
                dropdownBoxBottomShapeMain1,
                dropdownBoxBottomShapeTextMain1
            );
            gSubDropdownboxPopMain1.appendChild(dropdownBoxBottomShapecoverMain1);
        }

        // ================ ACTIONS dropdown
        for (let i = 1; i <= actions.length; i++) {
            const dropdownBoxBottomShapeMain2 = Dom.svg("rect", {
                width: DROPDOWN1_W,
                height: DROPDOWN_H,
                class: "option select-field",
                fill: "#fff",
                stroke: "#a0a0a0",
                x: DROPDOWN_X1,
                y: DROPDOWN_Y + 2 * DROPDOWN_H + DROPDOWN_H * i,
            });
            const dropdownBoxBottomShapeTextMain2 = Dom.svg("text", {
                class: "sqd-task-text",
                x: DROPDOWN_X1 + 2,
                y: DROPDOWN_Y + 2 * DROPDOWN_H + 11 + DROPDOWN_H * i,
            });
            dropdownBoxBottomShapeTextMain2.textContent = actions[i - 1];
            const dropdownBoxBottomShapecoverMain2 = Dom.svg("rect", {
                width: DROPDOWN1_W,
                height: DROPDOWN_H,
                class: "option select-field choice",
                fill: "#fff",
                stroke: "#a0a0a0",
                x: DROPDOWN_X1,
                y: DROPDOWN_Y + 2 * DROPDOWN_H + DROPDOWN_H * i,
                id: `dropdownBoxBottomShapecoverMain2${Date.now()}`,
            });
            Dom.attrs(dropdownBoxBottomShapecoverMain2, {
                opacity: 0.3,
            });

            dropdownBoxBottomShapecoverMain2.addEventListener("click", function (e) {
                choice1 = dropdownBoxBottomShapeTextMain2.textContent;
                gSubDropdownboxPopMain2.classList.toggle("sqd-hidden");
                gSubDropdownMain1.classList.toggle("sqd-hidden");
                gSubDropdownMain2.classList.toggle("sqd-hidden");
                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeTextMain2.textContent;
                gSubDropdown1.classList.add('sqd-hidden');
                gSubDropdown2.classList.remove('sqd-hidden');
                if (choice1 == 'Opened' || choice2 == 'Not Opened' || choice2 == 'Clicked' || choice2 == 'Not Clicked') {
                    list3 = list3Actions;
                }

                // ======================== 3rd dropdowns 
                for (let i = 1; i <= list3.length; i++) {
                    const dropdownBoxBottomShape2 = Dom.svg("rect", {
                        width: DROPDOWN1_W,
                        height: DROPDOWN_H,
                        class: "option select-field",
                        fill: "#fff",
                        stroke: "#a0a0a0",
                        x: DROPDOWN_X3,
                        y: DROPDOWN_Y + DROPDOWN_H * i,
                    });
                    const dropdownBoxBottomShape2Text = Dom.svg("text", {
                        class: "sqd-task-text",
                        x: DROPDOWN_X3 + 2,
                        y: DROPDOWN_Y + 11 + DROPDOWN_H * i,
                    });
                    dropdownBoxBottomShape2Text.textContent = list3[i - 1];
                    const dropdownBoxBottomShape2cover = Dom.svg("rect", {
                        width: DROPDOWN1_W,
                        height: DROPDOWN_H,
                        class: "option select-field choice",
                        fill: "#fff",
                        stroke: "#a0a0a0",
                        x: DROPDOWN_X3,
                        y: DROPDOWN_Y + DROPDOWN_H * i,
                        id: `dropdownBoxBottomShape2cover${Date.now()}`,
                    });
                    Dom.attrs(dropdownBoxBottomShape2cover, {
                        opacity: 0.3,
                    });

                    // Add event listners for 3rd dropdown 
                    dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
                        dropdownBoxInnerText2.textContent = dropdownBoxBottomShape2Text.textContent;
                        gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
                    });

                    // Append Child 3rd 
                    gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
                    gSubDropdownbox2Pop.insertBefore(
                        dropdownBoxBottomShape2,
                        dropdownBoxBottomShape2Text
                    );
                    gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
                }
            });

            // Append Child ACTIONS
            gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapeTextMain2);
            gSubDropdownboxPopMain2.insertBefore(
                dropdownBoxBottomShapeMain2,
                dropdownBoxBottomShapeTextMain2
            );
            gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapecoverMain2);
        }


        // =================== Append dropdowns
        gSubDropdownbox.appendChild(dropdownRightButton);
        gSubDropdownbox1.appendChild(dropdownRightButton1);
        gSubDropdownbox2.appendChild(dropdownRightButton2);
        gSubDropdownboxMain1.appendChild(dropdownRightButtonMain1);
        gSubDropdownboxMain2.appendChild(dropdownRightButtonMain2);
        gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButton);
        gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButton1);
        gSubDropdownbox2.insertBefore(dropdownBoxShape2, dropdownRightButton2);
        gSubDropdownboxMain1.insertBefore(dropdownBoxShapeMain1, dropdownRightButtonMain1);
        gSubDropdownboxMain2.insertBefore(dropdownBoxShapeMain2, dropdownRightButtonMain2);
        gSubDropdownbox.appendChild(dropdownBoxInnerText);
        gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
        gSubDropdownbox2.appendChild(dropdownBoxInnerText2);
        gSubDropdownboxMain1.appendChild(dropdownBoxInnerTextMain1);
        gSubDropdownboxMain2.appendChild(dropdownBoxInnerTextMain2);
        gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
        gSubDropdownbox1.appendChild(dropdownBoxShapeAfter1);
        gSubDropdownbox2.appendChild(dropdownBoxShapeAfter2);
        gSubDropdownboxMain1.appendChild(dropdownBoxShapeAfterMain1);
        gSubDropdownboxMain2.appendChild(dropdownBoxShapeAfterMain2);
        gSubDropdown.appendChild(gSubDropdownbox);
        gSubDropdown.appendChild(gSubDropdownboxPop);
        gSubDropdown1.appendChild(gSubDropdownbox1);
        gSubDropdown1.appendChild(gSubDropdownbox1Pop);
        gSubDropdown2.appendChild(gSubDropdownbox2);
        gSubDropdown2.appendChild(gSubDropdownbox2Pop);
        gSubDropdownMain1.appendChild(gSubDropdownboxMain1);
        gSubDropdownMain1.appendChild(gSubDropdownboxPopMain1);
        gSubDropdownMain2.appendChild(gSubDropdownboxMain2);
        gSubDropdownMain2.appendChild(gSubDropdownboxPopMain2);

        gDropdown.appendChild(inputArea);
        gDropdown.appendChild(gSubDropdownMain2);
        gDropdown.appendChild(gSubDropdownMain1);
        gDropdown.appendChild(gSubDropdown2);
        gDropdown.appendChild(gSubDropdown1);
        gDropdown.appendChild(gSubDropdown);
        g1.appendChild(moreIcon);
        g.appendChild(g1);
        g.appendChild(gRightPop3);
        g.appendChild(gDropdown);

        g.appendChild(gRightPop3Reminder);
        g.appendChild(gUpPop3);
        g.appendChild(setUpReminder);

        // ========== Add EventListeners for "More" icon 
        moreIcon.addEventListener("click", function (e) {
            e.stopPropagation();
            gRightPop3.classList.toggle("sqd-hidden");
        });

        // ========================= More icons event listener 
        editIcon.addEventListener("click", function (e) {
            e.stopPropagation();
            gDropdown.classList.toggle("sqd-hidden");
            gUpPop3.classList.toggle("sqd-hidden");
            gRightPop3.classList.toggle("sqd-hidden");
            gSubDropdown.classList.toggle("sqd-hidden");
            gSubDropdown1.classList.toggle("sqd-hidden");
            gSubDropdown2.classList.toggle("sqd-hidden");
            gSubDropdownMain1.classList.toggle("sqd-hidden");
            gSubDropdownMain2.classList.toggle("sqd-hidden");
            emailInput.classList.toggle("sqd-hidden");
        });

        upCheckIcon.addEventListener("click", function (e) {
            e.stopPropagation();
            gDropdown.classList.toggle("sqd-hidden");
            gSubDropdown.classList.toggle("sqd-hidden");
            gSubDropdown1.classList.toggle("sqd-hidden");
            gSubDropdown2.classList.toggle("sqd-hidden");
            gSubDropdownMain1.classList.toggle("sqd-hidden");
            gSubDropdownMain2.classList.toggle("sqd-hidden");
            emailInput.classList.add("sqd-hidden");
            gUpPop3.classList.toggle("sqd-hidden");

            // =============== Add properties
            if (dropdownBoxInnerText.textContent && dropdownBoxInnerText.textContent != "Condition") {
                // textRight.textContent = dropdownBoxInnerText.textContent;
                step.properties["property"] = dropdownBoxInnerText.textContent;
            }
            if (dropdownBoxInnerText1.textContent && dropdownBoxInnerText1.textContent != "") {
                // textRight.textContent = dropdownBoxInnerText.textContent;
                step.properties["condition"] = dropdownBoxInnerText1.textContent;
            }
            if (dropdownBoxInnerText2.textContent && dropdownBoxInnerText2.textContent != "") {
                // textRight.textContent = dropdownBoxInnerText2.textContent;
                step.properties["value"] = dropdownBoxInnerText2.textContent;
            }
            if (emailInput.value != "") {
                // textRight.textContent = emailInput.value;
                step.properties["value"] = emailInput.value;
            }
            textRight.textContent = "If " + step.properties["value"].toString() + " exists in the " + step.properties["property"].toString();; 
        });

        upchangeIcon.addEventListener("click", function(e) {
            step.properties = {}; 
            textRight.textContent = "Choose Condition "; 
            dropdownBoxInnerText.textContent = ""; 
            dropdownBoxInnerText1.textContent = ""; 
            dropdownBoxInnerText2.textContent = ""; 
            dropdownBoxInnerTextMain1.textContent = "CONTACT INFO"; 
            dropdownBoxInnerTextMain2.textContent = "ACTIONS"; 
            gSubDropdown.classList.remove("sqd-hidden"); 
            gSubDropdown1.classList.remove("sqd-hidden"); 
            gSubDropdown2.classList.remove("sqd-hidden"); 
            gSubDropdownMain1.classList.add("sqd-hidden"); 
            gSubDropdownMain2.classList.add("sqd-hidden"); 

        }); 

        // Show hints
        editIcon.addEventListener("mouseover", function () {
            gRightPop3Reminder1.classList.toggle("sqd-hidden");
        });
        editIcon.addEventListener("mouseout", function () {
            gRightPop3Reminder1.classList.toggle("sqd-hidden");
        });
        changeIcon.addEventListener("mouseover", () => {
            gRightPop3Reminder2.classList.toggle("sqd-hidden");
        });
        changeIcon.addEventListener("mouseout", () => {
            gRightPop3Reminder2.classList.toggle("sqd-hidden");
        });
        deleteIcon.addEventListener("mouseover", () => {
            gRightPop3Reminder3.classList.toggle("sqd-hidden");
        });
        deleteIcon.addEventListener("mouseout", () => {
            gRightPop3Reminder3.classList.toggle("sqd-hidden");
        });

        // Event listeners in Dropdown
        dropdownBoxShapeAfter.addEventListener("click", function (e) {
            e.stopPropagation();
            gSubDropdownMain1.classList.toggle("sqd-hidden");
            gSubDropdownMain2.classList.toggle("sqd-hidden");
            if (!gSubDropdownMain1.classList.contains("sqd-hidden") &&
                !gSubDropdownMain2.classList.contains("sqd-hidden")) {
                gSubDropdownMain1.classList.remove("sqd-hidden");
                gSubDropdownMain2.classList.remove("sqd-hidden");
            }
        });
        dropdownBoxShapeAfter1.addEventListener("click", function (e) {
            e.stopPropagation();
            gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
                gSubDropdownboxPop.classList.remove("sqd-hidden");
            }
        });
        dropdownBoxShapeAfter2.addEventListener("click", function (e) {
            e.stopPropagation();
            gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
                gSubDropdownboxPop.classList.remove("sqd-hidden");
            }
        });
        dropdownBoxShapeAfterMain1.addEventListener("click", function (e) {
            e.stopPropagation();
            gSubDropdownboxPopMain1.classList.toggle("sqd-hidden");
            if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden")) {
                gSubDropdownboxPopMain1.classList.remove("sqd-hidden");
            }
        });
        dropdownBoxShapeAfterMain2.addEventListener("click", function (e) {
            e.stopPropagation();
            gSubDropdownboxPopMain2.classList.toggle("sqd-hidden");
            if (!gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
                gSubDropdownboxPopMain2.classList.remove("sqd-hidden");
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


// export {condition_type as ct, condition as cd, requirement as rq, value as vl}; 

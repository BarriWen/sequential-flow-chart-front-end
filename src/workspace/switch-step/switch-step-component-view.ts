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
const PADDING_X = 12;
const PADDING_TOP = 20;
const LABEL_HEIGHT = 22;
const CONNECTION_HEIGHT = 16;
const RECT_RADIUS = 15;
const MIN_TEXT_WIDTH = 98; // 70
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

        const DROPDOWN_Y = 80;
        const DROPDOWN_X1 = containerWidths[0] - 190; // 
        const DROPDOWN_X2 = containerWidths[0] - 62; // 
        const DROPDOWN_X3 = containerWidths[0] + 70; // 
        const g1 = Dom.svg("g");

        const text = Dom.svg("text", {
            x: ICON_SIZE + containerWidths[0] - PADDING_X * 17 - 10, // = 42 -> 15
            y: boxHeight / 2.0 + PADDING_TOP + 1,
            class: "sqd-task-text",
        });
        text.textContent = "If/Else";
        g1.appendChild(text);
        const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH);
        const boxWidth = ICON_SIZE + 16 * PADDING_X + 2 * textWidth;

        const rect = Dom.svg("rect", {
            x: containerWidths[0] - textWidth - 107,
            y: PADDING_TOP,
            class: "sqd-switch-rect",
            width: boxWidth,
            height: boxHeight,
            rx: 15,
            ry: 15,
        });
        g1.insertBefore(rect, text);
        const rectLeft = Dom.svg("rect", {
            x: containerWidths[0] - textWidth - 107,
            y: PADDING_TOP,
            class: "sqd-switch-rect",
            width: textWidth - 35,
            height: boxHeight,
            rx: RECT_RADIUS,
            ry: RECT_RADIUS,

        });
        const textRight = Dom.svg("text", {
            x: ICON_SIZE + containerWidths[0] - PADDING_X * 6,
            y: boxHeight / 2.0 + PADDING_TOP,
            class: "sqd-task-text task-title switch-title",
            width: 300, 
        });

        if (step.properties["value"]) {
            textRight.textContent = "If " + step.properties["value"].toString() + " " + 
            step.properties["condition"] + " " + 
            step.properties["property"].toString();

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


        const moreUrl = "./assets/triDotIcon.svg";
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
            x: ICON_SIZE + containerWidths[0] + PADDING_X + textWidth + 45,
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 90,
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 93,
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 70,
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 73,
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 70, // 366
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 73,
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
        const upCheckIconUrl = "./assets/check-inside.svg";
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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 48,
            y: PADDING_Y - 26,
            width: ICON_SIZE,
            height: ICON_SIZE,
        });
        deleteImgContainer.appendChild(deleteImgContainerCircle);
        deleteImgContainer.appendChild(upDeleteIcon);

        upDeleteIcon.addEventListener("click", function (e) {
            console.log("Up delete clicked");
        })

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
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 107, // 
            y: PADDING_Y - 18, // -25 -> -8
        });

        const reminderText1 = Dom.svg("text", {
            class: "sqd-task-reminder",
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 107 + 13,
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
            class: "sqd-task-reminder",
            width: 50,
            height: 25,
            rx: RECT_RADIUS,
            ry: RECT_RADIUS,
        });
        Dom.attrs(reminder2, {
            id: `reminder2${Date.now()}`,
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 127,
            y: PADDING_Y + 13,
        });

        const reminderText2 = Dom.svg("text", {
            class: "sqd-task-text",
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 127 + 10,
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
            class: "sqd-task-reminder",
            width: 50,
            height: 25,
            rx: RECT_RADIUS,
            ry: RECT_RADIUS,
        });
        Dom.attrs(reminder3, {
            id: `reminder3${Date.now()}`,
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 107,
            y: PADDING_Y + 43,
        });

        const reminderText3 = Dom.svg("text", {
            class: "sqd-task-text",
            x: containerWidths[0] + 5 * PADDING_X + 3 * ICON_SIZE + 107 + 6,
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

        const gDropdownbox = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox`
        });

        gDropdown.appendChild(gDropdownbox);

        const rect1 = Dom.svg("rect", {
            x: containerWidths[0] - textWidth - 107,
            y: PADDING_TOP + 8,
            class: "sqd-switch-rect",
            width: boxWidth,
            height: 3 * boxHeight + 10,
            rx: RECT_RADIUS,
            ry: RECT_RADIUS,
        });
        Dom.attrs(rect1, {
            id: `dropdown${Date.now()}`,
        });

        gDropdownbox.appendChild(rect1);

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
            x: 263,
            y: DROPDOWN_Y + 12,
            class: "sqd-task-text",
        })
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
            fill: "rgba(255, 255, 255, 0)"
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

        gDropdownbox.appendChild(rectInnerBorder);
        gDropdownbox.appendChild(actConditonText);
        // gDropdownbox.appendChild(addSegmentBtn);
        // gDropdownbox.appendChild(addSegBtnTitle);
        // gDropdownbox.appendChild(addSegmentBtnClickArea);
        // gDropdownbox.appendChild(addConditionText);

        addSegmentBtnClickArea.addEventListener("click", function (e) {
            console.log("add seg clicked");
        });

        addConditionText.addEventListener("click", function (e) {
            console.log("add cond clicked");
        });

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
        const gSubDropdownAct1 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
        });
        const gSubDropdownAct2 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
        });
        const gSubDropdownMain1 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
        });
        const gSubDropdownMain2 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
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
        const gSubDropdownboxAct1 = Dom.svg("g", {
            class: `sqd-task-group sub-dropdownbox`,
        });
        const gSubDropdownboxAct2 = Dom.svg("g", {
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
        const dropdownBoxShapeAct1 = Dom.svg("rect", {
            width: DROPDOWN2_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#a0a0a0",
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
            stroke: "#a0a0a0",
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
            y: DROPDOWN_Y + 2 * DROPDOWN_H + 13,
            rx: 5,
            ry: 5,
        });
        // ================= dropdownRightButton
        const downArrowLink = "./assets/downArrow.svg";
        const upArrowLink = "./assets/upArrow.svg";
        const downArrowSubLink = "./assets/downArrowSub.svg";
        const upArrowSubLink = "./assets/upArrowSub.svg";

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
            width: 12,
            height: 12,
            x: DROPDOWN_X1 + 100,
            y: DROPDOWN_Y + DROPDOWN_H + 16,
        });
        const dropdownRightButtonUpMain1 = Dom.svg("image", {
            class: "sqd-task-text select-field sqd-hidden",
            href: upArrowSubLink,
            width: 12,
            height: 12,
            x: DROPDOWN_X1 + 100,
            y: DROPDOWN_Y + DROPDOWN_H + 16,
        });
        const dropdownRightButtonDownMain2 = Dom.svg("image", {
            class: "sqd-task-text select-field",
            href: downArrowSubLink,
            width: 12,
            height: 12,
            x: DROPDOWN_X1 + 100,
            y: DROPDOWN_Y + 2 * DROPDOWN_H + 21,
        });
        const dropdownRightButtonUpMain2 = Dom.svg("image", {
            class: "sqd-task-text select-field sqd-hidden",
            href: upArrowSubLink,
            width: 12,
            height: 12,
            x: DROPDOWN_X1 + 100,
            y: DROPDOWN_Y + 2 * DROPDOWN_H + 21,
        });

        // ================= dropdownBoxInnerText
        const dropdownBoxInnerText = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X1 + 5,
            y: DROPDOWN_Y + 12,
        });
        // dropdownBoxInnerText.textContent = "Select a condition";
        if (step.properties["property"]) {
            let property: any = step.properties["property"];
            dropdownBoxInnerText.textContent = property;
        } else {
            dropdownBoxInnerText.textContent = "Select a condition";
            dropdownBoxInnerText.setAttribute("style", "font-size: 8pt; fill: #606060");
        }

        const dropdownBoxInnerText1 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X2 + 3,
            y: DROPDOWN_Y + 12,
        });
        if (step.properties["condition"]) {
            let property: any = step.properties["condition"];
            dropdownBoxInnerText1.textContent = property;
        } else {
            dropdownBoxInnerText1.textContent = "Is";
            dropdownBoxInnerText1.setAttribute("style", "fill: #606060")
        }
        const dropdownBoxInnerText2 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X3 + 3,
            y: DROPDOWN_Y + 12,
        });
        dropdownBoxInnerText2.textContent = "";
        const dropdownBoxInnerTextAct1 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X2 - 30 + 3,
            y: DROPDOWN_Y + 12,
        });
        dropdownBoxInnerText2.textContent = "";
        const dropdownBoxInnerTextAct2 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X3 + 50 + 3,
            y: DROPDOWN_Y + 12,
        });
        dropdownBoxInnerText2.textContent = "";
        const dropdownBoxInnerTextMain1 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X1 + 3,
            y: DROPDOWN_Y + DROPDOWN_H + 13 + 8,
        });
        dropdownBoxInnerTextMain1.textContent = "CONTACT INFO";
        const dropdownBoxInnerTextMain2 = Dom.svg("text", {
            class: "sqd-task-text",
            x: DROPDOWN_X1 + 3,
            y: DROPDOWN_Y + 2 * DROPDOWN_H + 13 + 13,
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
        const dropdownBoxShapeAfterAct1 = Dom.svg("rect", {
            width: DROPDOWN2_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#a0a0a0",
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
            stroke: "#a0a0a0",
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
            stroke: "#a0a0a0",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + DROPDOWN_H + 5,
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
            y: DROPDOWN_Y + 2 * DROPDOWN_H + 10,
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

        // ================ Text input
        const inputArea = Dom.svg("foreignObject", {
            class: "sqd-input-area sqd-hidden",
            x: DROPDOWN_X3,
            y: DROPDOWN_Y,
            width: 130,
            height: 30,
        });

        const textInput = Dom.element('input', {
            class: `sqd-text-input`,
            type: 'text',
            // placeholder: 'Email...',
            value: "",
        });
        inputArea.appendChild(textInput);

        const locInputArea = Dom.svg("foreignObject", {
            class: "location-input sqd-hidden",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + DROPDOWN_H + 10,
            width: 250,
            height: 30,
        });

        const locTextInput = Dom.element('input', {
            class: `sqd-loc-input`,
            type: 'text',
            // placeholder: 'Email...',
            value: "",
        });
        locInputArea.appendChild(locTextInput);

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

        gValBtn.appendChild(valBtnText);
        gValBtn.appendChild(valBtnRect);

        // =================== Dropdown item lists 
        let list1 = [''];
        let contInfo = ['Tag', 'Email Address', 'Gender', 'First Name', 'Last Name', 'Full Name', 'Phone Number', 'Birthday', 'Location'];
        let actions = ['Opened', 'Not Opened', 'Clicked', 'Not Clicked'];
        let list2 = [''];
        let list2Tag = ['Exists', 'Does not exist'];
        let list2Gender = ['Is'];
        let list2Bd = ['Month is', 'Date is', 'Is before date', 'Is After date', 'Is Blank'];
        let list2Email = ['Contains', 'Does Not Contain', 'Is Blank'];
        let list2Name = ["Is", "Is Not", "Contains", "Does Not Contain", "Blank"];
        let list2Phone = ["Contains", "Does Not Contain", "Blank"];
        let list2Loc = ['Is Within', 'Is Not Within', 'Is in Country', 'Is Not in Country', 'Is in US State', 'Is Not in US State'];
        let list3: any = [''];
        let list3Tag = ['Tag A', 'Tag B'];
        let list3Gender = ['Male', 'Female', 'Non-binary', 'Blank'];
        let list3Bdm = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let list3LocWithin = [25, 50, 75, 100, 150, 200];
        let list3Ctry = ['United States', 'Canada', 'United Kingdom', 'France', 'German', 'Italy', '...'];
        let list3State = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California',
            'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia',
            'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
            'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
            'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
            'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands',
            'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
            'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island',
            'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
        let choice1: string | null = "";
        let choice2: string | null = "";

        // ============ 1st dropdown
        let shapeHeightContact = contInfo.length * 25;
        let shapeHeightActions = actions.length * 25;
        let shapeHeightCollapsed = 2 * 25 + 10;
        let shapeHeight = shapeHeightCollapsed;

        if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden") &&
            !gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
            shapeHeight = shapeHeightContact + shapeHeightActions;
        }
        else if (!gSubDropdownboxPopMain1.classList.contains("sqd-hidden") &&
            gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
            shapeHeight = shapeHeightContact;
        }
        else if (gSubDropdownboxPopMain1.classList.contains("sqd-hidden") &&
            !gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
            shapeHeight = shapeHeightActions;
        }

        const dropdownBoxBottomShape = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: shapeHeight,
            fill: "#fff",
            stroke: "#247d99",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + DROPDOWN_H + 5,
            rx: 4,
            ry: 4
        });
        gSubDropdownboxPop.appendChild(dropdownBoxBottomShape);
        gSubDropdownboxPop.appendChild(gSubDropdownMain2);
        gSubDropdownboxPop.appendChild(gSubDropdownMain1);

        // ================ CONTACT INFO dropdown
        const dropdownBoxBottomShapeMain1 = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: contInfo.length * 25 + 10,
            fill: "#fff",
            stroke: "#247d99",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + 2 * DROPDOWN_H + 10,
            rx: 4,
            ry: 4
        });
        gSubDropdownboxPopMain1.appendChild(dropdownBoxBottomShapeMain1);

        for (let i = 1; i <= contInfo.length; i++) {
            const dropdownBoxBottomShapeTextMain1 = Dom.svg("text", {
                class: "sqd-task-text",
                x: DROPDOWN_X1 + 17,
                y: DROPDOWN_Y + DROPDOWN_H + 11 + DROPDOWN_H * i + 13,
            });
            dropdownBoxBottomShapeTextMain1.textContent = contInfo[i - 1];
            const dropdownBoxBottomShapecoverMain1 = Dom.svg("rect", {
                width: DROPDOWN1_W - 20,
                height: DROPDOWN_H - 5,
                class: "option select-field choice",
                fill: "#fff",
                // stroke: "#a0a0a0",
                x: DROPDOWN_X1 + 10,
                y: DROPDOWN_Y + DROPDOWN_H + DROPDOWN_H * i + 15,
                rx: 4,
                ry: 4,
                id: `dropdownBoxBottomShapecoverMain1${Date.now()}`,
            });
            Dom.attrs(dropdownBoxBottomShapecoverMain1, {
                opacity: 0.3,
            });

            dropdownBoxBottomShapecoverMain1.addEventListener("click", function (e) {
                choice1 = dropdownBoxBottomShapeTextMain1.textContent;
                gSubDropdownAct1.classList.add("sqd-hidden");
                gSubDropdownAct2.classList.add("sqd-hidden");
                dropdownBoxShape.setAttribute("width", `${DROPDOWN1_W}`);
                dropdownBoxShapeAfter.setAttribute("width", `${DROPDOWN1_W}`);
                dropdownRightButtonDown.setAttribute("x", `${DROPDOWN_X1 + DROPDOWN1_W - 20}`);
                dropdownRightButtonUp.setAttribute("x", `${DROPDOWN_X1 + DROPDOWN1_W - 20}`);
                dropdownRightButtonUp.classList.add("sqd-hidden");
                dropdownRightButtonDown.classList.remove("sqd-hidden");
                dropdownRightButtonUpMain1.classList.add("sqd-hidden");
                dropdownRightButtonDownMain1.classList.remove("sqd-hidden");
                gSubDropdownboxPopMain1.classList.toggle("sqd-hidden");
                gSubDropdownboxPop.classList.toggle("sqd-hidden");
                gSubDropdown1.classList.remove('sqd-hidden');
                gSubDropdown2.classList.remove('sqd-hidden');
                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeTextMain1.textContent;
                while (gSubDropdownbox1Pop.firstChild) {
                    gSubDropdownbox1Pop.removeChild(gSubDropdownbox1Pop.firstChild);
                }
                if (choice1 == 'Tag') {
                    list2 = list2Tag;
                } if (choice1 == 'Gender') {
                    list2 = list2Gender;
                } if (choice1 == 'Birthday') {
                    list2 = list2Bd;
                } if (choice1 == 'Email Address') {
                    list2 = list2Email;
                    gSubDropdown2.classList.add("sqd-hidden");
                    inputArea.classList.remove("sqd-hidden");
                    textInput.setAttribute("placeholder", "Email...");
                } if (choice1 == "First Name" || choice1 == "Last Name" || choice1 == "Full Name") {
                    list2 = list2Name;
                    gSubDropdown2.classList.add("sqd-hidden");
                    inputArea.classList.remove("sqd-hidden");
                    textInput.setAttribute("placeholder", "Enter Name");
                } if (choice1 == "Phone Number") {
                    list2 = list2Phone;
                    gSubDropdown2.classList.add("sqd-hidden");
                    inputArea.classList.remove("sqd-hidden");
                    textInput.setAttribute("placeholder", "Enter Phone #");
                } if (choice1 == 'Location') {
                    list2 = list2Loc;
                } else {
                    locInputArea.classList.add("sqd-hidden");
                    valBtnRect.classList.add("sqd-hidden");
                    rect1.setAttribute("height", `${3 * boxHeight + 10}`);
                    rectInnerBorder.setAttribute("height", `${boxHeight + 20}`);
                    locInputArea.classList.add("sqd-hidden");
                } if (
                    choice1 != 'Email Address' &&
                    choice1 != "Birthday" &&
                    choice1 != "First Name" &&
                    choice1 != "Last Name" &&
                    choice1 != "Full Name" &&
                    choice1 != "Phone Number"
                ) {
                    inputArea.classList.add("sqd-hidden");
                    gSubDropdown2.classList.remove("sqd-hidden");
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
                    ry: 4
                });
                gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1);

                for (let i = 1; i <= list2.length; i++) {
                    const dropdownBoxBottomShape1Text = Dom.svg("text", {
                        class: "sqd-task-text",
                        x: DROPDOWN_X2 + 12,
                        y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 8,
                    });
                    dropdownBoxBottomShape1Text.textContent = list2[i - 1];

                    const dropdownBoxBottomShape1cover = Dom.svg("rect", {
                        width: DROPDOWN2_W - 15,
                        height: DROPDOWN_H - 5,
                        class: "option select-field choice",
                        fill: "#fff",
                        x: DROPDOWN_X2 + 7,
                        y: DROPDOWN_Y + DROPDOWN_H * i + 10,
                        rx: 4,
                        ry: 4,
                        id: `dropdownBoxBottomShape1cover${Date.now()}`,
                    });
                    Dom.attrs(dropdownBoxBottomShape1cover, {
                        opacity: 0.3,
                    });
                    // Add event listners for 2nd dropdowns 
                    dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
                        dropdownRightButtonUp1.classList.add("sqd-hidden");
                        dropdownRightButtonDown1.classList.remove("sqd-hidden");
                        dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
                        dropdownBoxInnerText.setAttribute("style", "fill: #000000; font-size: 9pt");
                        gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
                        choice2 = dropdownBoxInnerText1.textContent;
                        while (gSubDropdownbox2Pop.firstChild) {
                            gSubDropdownbox2Pop.removeChild(gSubDropdownbox2Pop.firstChild);
                        }
                        if (choice2 == 'Exists' || choice2 == 'Does not exist') {
                            list3 = list3Tag;
                        } else if (choice1 == "Gender") {
                            list3 = list3Gender;
                            dropdownBoxInnerText2.textContent = "Nothing Selected";
                            dropdownBoxInnerText2.setAttribute("style", "fill: #606060; font-size: 8pt");
                        } else if (choice2 == 'Month is') {
                            list3 = list3Bdm;
                            dropdownBoxInnerText2.textContent = "Nothing Selected";
                            dropdownBoxInnerText2.setAttribute("style", "fill: #606060; font-size: 8pt");
                            inputArea.classList.add("sqd-hidden");
                        } else if (choice2 == 'Date is') {
                            gSubDropdown2.classList.add("sqd-hidden");
                            inputArea.classList.remove("sqd-hidden");
                            textInput.setAttribute("placeholder", "Enter Month/Day");
                        } if (choice2 == 'Is Within' || choice2 == 'Is Not Within') {
                            list3 = list3LocWithin;
                            rect1.setAttribute("height", "120");
                            rectInnerBorder.setAttribute("height", "90");
                            locInputArea.classList.remove("sqd-hidden");
                            gValBtn.classList.remove("sqd-hidden");
                            if (locTextInput.value) {
                                valBtnRect.setAttribute("stroke", "#247d99");
                                valBtnText.setAttribute("fill", "#247d99");
                            } else {
                                valBtnRect.setAttribute("stroke", "#a0a0a0");
                                valBtnText.setAttribute("fill", "#a0a0a0");
                            }
                        } if (choice2 == 'Is in Country' || choice2 == 'Is Not in Country') {
                            list3 = list3Ctry;
                        } else if (choice2 == "Is in US State" || choice2 == "Is Not in US State") {
                            list3 = list3State;
                        }
                        if (choice2 == "Is Blank" || choice2 == "Blank") {
                            dropdownBoxInnerText2.textContent = "Nothing Selected";
                            dropdownBoxInnerText2.setAttribute("style", "fill: #606060; font-size: 8pt");
                            inputArea.setAttribute("value", "Blank");
                        }

                        // ======================== 3rd dropdowns 
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
                                id: `dropdownBoxBottomShape2cover${Date.now()}`,
                            });
                            Dom.attrs(dropdownBoxBottomShape2cover, {
                                opacity: 0.3,
                            });

                            // Add event listners for 3rd dropdown 
                            dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
                                dropdownRightButtonUp2.classList.add("sqd-hidden");
                                dropdownRightButtonDown2.classList.remove("sqd-hidden");
                                dropdownBoxInnerText2.textContent = dropdownBoxBottomShape2Text.textContent;
                                gSubDropdownbox2Pop.classList.toggle("sqd-hidden");
                            });

                            // Append Child 3rd 
                            gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2Text);
                            gSubDropdownbox2Pop.appendChild(dropdownBoxBottomShape2cover);
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

        // ================ ACTIONS dropdown
        const dropdownBoxBottomShapeMain2 = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: actions.length * 25 + 10,
            fill: "#fff",
            stroke: "#247d99",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + DROPDOWN_H * 3 + 15,
            rx: 4,
            ry: 4
        });
        gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapeMain2);

        for (let i = 1; i <= actions.length; i++) {
            const dropdownBoxBottomShapeTextMain2 = Dom.svg("text", {
                class: "sqd-task-text",
                x: DROPDOWN_X1 + 17,
                y: DROPDOWN_Y + 2 * DROPDOWN_H + 11 + DROPDOWN_H * i + 18,
            });
            dropdownBoxBottomShapeTextMain2.textContent = actions[i - 1];
            const dropdownBoxBottomShapecoverMain2 = Dom.svg("rect", {
                width: DROPDOWN1_W - 20,
                height: DROPDOWN_H - 5,
                class: "option select-field choice",
                fill: "#fff",
                // stroke: "#a0a0a0",
                x: DROPDOWN_X1 + 10,
                y: DROPDOWN_Y + 2 * DROPDOWN_H + DROPDOWN_H * i + 20,
                rx: 4,
                ry: 4,
                id: `dropdownBoxBottomShapecoverMain2${Date.now()}`,
            });
            Dom.attrs(dropdownBoxBottomShapecoverMain2, {
                opacity: 0.3,
            });

            dropdownBoxBottomShapecoverMain2.addEventListener("click", function (e) {
                choice1 = dropdownBoxBottomShapeTextMain2.textContent;
                dropdownRightButtonUp.classList.add("sqd-hidden");
                dropdownRightButtonDown.classList.remove("sqd-hidden");
                dropdownRightButtonUpMain2.classList.add("sqd-hidden");
                dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
                gSubDropdownboxPopMain2.classList.toggle("sqd-hidden");
                gSubDropdownboxPop.classList.toggle("sqd-hidden");
                dropdownBoxInnerText.textContent = dropdownBoxBottomShapeTextMain2.textContent;
                dropdownBoxInnerText.setAttribute("style", "fill: #000000; font-size: 9pt");
                gSubDropdown1.classList.add('sqd-hidden');
                gSubDropdown2.classList.add('sqd-hidden');
                dropdownBoxShape.setAttribute("width", `90`);
                dropdownRightButtonDown.setAttribute("x", `${DROPDOWN_X1 + 70}`);
                dropdownRightButtonUp.setAttribute("x", `${DROPDOWN_X1 + 70}`);
                gSubDropdownAct1.classList.remove("sqd-hidden");
                gSubDropdownAct2.classList.remove("sqd-hidden");
                inputArea.classList.remove("sqd-hidden");
                inputArea.setAttribute("x", `${280}`);
                inputArea.setAttribute("width", `${65}`);
                textInput.setAttribute("style", "width: 50px");
            });

            // Append Child ACTIONS
            gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapeTextMain2);
            gSubDropdownboxPopMain2.appendChild(dropdownBoxBottomShapecoverMain2);
        }

        // ================= ACTIONS 2nd dropdown 
        let listAct2 = ["Campaign 1", "Campaign 2", "Campaign 3"];
        const dropdownBoxBottomShapeAct2 = Dom.svg("rect", {
            width: DROPDOWN2_W,
            height: listAct2.length * DROPDOWN_H + 10,
            fill: "#fff",
            stroke: "#247d99",
            x: DROPDOWN_X2 - 30,
            y: DROPDOWN_Y + DROPDOWN_H + 10,
            rx: 4,
            ry: 4,
        });
        gSubDropdownboxAct1Pop.appendChild(dropdownBoxBottomShapeAct2);

        for (let i = 1; i <= listAct2.length; i++) {
            const dropdownBoxBottomShapeAct2Text = Dom.svg("text", {
                class: "sqd-task-text",
                x: DROPDOWN_X2 - 30 + 17,
                y: DROPDOWN_Y + 11 + DROPDOWN_H * i + 13,
            });
            dropdownBoxBottomShapeAct2Text.textContent = listAct2[i - 1];
            const dropdownBoxBottomShapeAct2cover = Dom.svg("rect", {
                width: DROPDOWN2_W - 20,
                height: DROPDOWN_H - 5,
                class: "option select-field choice",
                fill: "#fff",
                x: DROPDOWN_X2 - 30 + 10,
                y: DROPDOWN_Y + DROPDOWN_H * i + 15,
                rx: 4,
                ry: 4,
                id: `dropdownBoxBottomShapeAct2cover${Date.now()}`,
            });
            Dom.attrs(dropdownBoxBottomShapeAct2cover, {
                opacity: 0.3,
            });

            // Add event listners for Action 2nd dropdown 
            dropdownBoxBottomShapeAct2cover.addEventListener("click", function (e) {
                dropdownBoxInnerTextAct1.textContent = dropdownBoxBottomShapeAct2Text.textContent;
                gSubDropdownboxAct1Pop.classList.toggle("sqd-hidden");
                dropdownBoxInnerTextAct1.setAttribute("style", "fill: #000000; font-size: 9pt");
            });

            // Append Child Action 2nd 
            gSubDropdownboxAct1Pop.appendChild(dropdownBoxBottomShapeAct2Text);
            gSubDropdownboxAct1Pop.appendChild(dropdownBoxBottomShapeAct2cover);
        }

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
                id: `dropdownBoxBottomShape2cover${Date.now()}`,
            });
            Dom.attrs(dropdownBoxBottomShape2cover, {
                opacity: 0.3,
            });

            // Add event listners for ACTIONS 3rd dropdown 
            dropdownBoxBottomShape2cover.addEventListener("click", function (e) {
                dropdownBoxInnerTextAct2.textContent = dropdownBoxBottomShapeAct2Text.textContent;
                gSubDropdownboxAct2Pop.classList.toggle("sqd-hidden");
                dropdownBoxInnerTextAct2.setAttribute("style", "fill: #000000; font-size: 9pt");
            });

            // Append Child ACTIONS 3rd 
            gSubDropdownboxAct2Pop.appendChild(dropdownBoxBottomShapeAct2Text);
            gSubDropdownboxAct2Pop.appendChild(dropdownBoxBottomShape2cover);
        }


        // =================== Append dropdowns
        // Right buttons
        gSubDropdownbox.appendChild(dropdownRightButtonDown);
        gSubDropdownbox.appendChild(dropdownRightButtonUp);
        gSubDropdownbox1.appendChild(dropdownRightButtonDown1);
        gSubDropdownbox1.appendChild(dropdownRightButtonUp1);
        gSubDropdownbox2.appendChild(dropdownRightButtonDown2);
        gSubDropdownbox2.appendChild(dropdownRightButtonUp2);
        gSubDropdownboxAct1.appendChild(dropdownRightButtonDownAct1);
        gSubDropdownboxAct1.appendChild(dropdownRightButtonUpAct1);
        gSubDropdownboxAct2.appendChild(dropdownRightButtonDownAct2);
        gSubDropdownboxAct2.appendChild(dropdownRightButtonUpAct2);
        gSubDropdownboxMain1.appendChild(dropdownRightButtonDownMain1);
        gSubDropdownboxMain1.appendChild(dropdownRightButtonUpMain1);
        gSubDropdownboxMain2.appendChild(dropdownRightButtonDownMain2);
        gSubDropdownboxMain2.appendChild(dropdownRightButtonUpMain2);
        // Insert before 
        gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButtonDown);
        gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButtonDown1);
        gSubDropdownbox2.insertBefore(dropdownBoxShape2, dropdownRightButtonDown2);
        gSubDropdownboxAct1.insertBefore(dropdownBoxShapeAct1, dropdownRightButtonDownAct1);
        gSubDropdownboxAct2.insertBefore(dropdownBoxShapeAct2, dropdownRightButtonDownAct2);
        gSubDropdownboxMain1.insertBefore(dropdownBoxShapeMain1, dropdownRightButtonDownMain1);
        gSubDropdownboxMain2.insertBefore(dropdownBoxShapeMain2, dropdownRightButtonDownMain2);
        // Inner text
        gSubDropdownbox.appendChild(dropdownBoxInnerText);
        gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
        gSubDropdownbox2.appendChild(dropdownBoxInnerText2);
        gSubDropdownboxAct1.appendChild(dropdownBoxInnerTextAct1);
        gSubDropdownboxAct2.appendChild(dropdownBoxInnerTextAct2);
        gSubDropdownboxMain1.appendChild(dropdownBoxInnerTextMain1);
        gSubDropdownboxMain2.appendChild(dropdownBoxInnerTextMain2);
        // Shape after
        gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
        gSubDropdownbox1.appendChild(dropdownBoxShapeAfter1);
        gSubDropdownbox2.appendChild(dropdownBoxShapeAfter2);
        gSubDropdownboxAct1.appendChild(dropdownBoxShapeAfterAct1);
        gSubDropdownboxAct2.appendChild(dropdownBoxShapeAfterAct2);
        gSubDropdownboxMain1.appendChild(dropdownBoxShapeAfterMain1);
        gSubDropdownboxMain2.appendChild(dropdownBoxShapeAfterMain2);
        // Dropdown box & pop
        gSubDropdown.appendChild(gSubDropdownbox);
        gSubDropdown.appendChild(gSubDropdownboxPop);
        gSubDropdown1.appendChild(gSubDropdownbox1);
        gSubDropdown1.appendChild(gSubDropdownbox1Pop);
        gSubDropdown2.appendChild(gSubDropdownbox2);
        gSubDropdown2.appendChild(gSubDropdownbox2Pop);
        gSubDropdownAct1.appendChild(gSubDropdownboxAct1);
        gSubDropdownAct1.appendChild(gSubDropdownboxAct1Pop);
        gSubDropdownAct2.appendChild(gSubDropdownboxAct2);
        gSubDropdownAct2.appendChild(gSubDropdownboxAct2Pop);
        gSubDropdownMain1.appendChild(gSubDropdownboxMain1);
        gSubDropdownMain1.appendChild(gSubDropdownboxPopMain1);
        gSubDropdownMain2.appendChild(gSubDropdownboxMain2);
        gSubDropdownMain2.appendChild(gSubDropdownboxPopMain2);

        gDropdown.appendChild(inputArea);
        gDropdown.appendChild(locInputArea);
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
            if (
                choice1 != 'Email Address' &&
                choice1 != "Birthday" &&
                choice1 != "First Name" &&
                choice1 != "Last Name" &&
                choice1 != "Full Name" &&
                choice1 != "Phone Number"
            ) {
                inputArea.classList.add("sqd-hidden");
                gSubDropdown2.classList.remove("sqd-hidden");
            }
        });

        upCheckIcon.addEventListener("click", function (e) {
            e.stopPropagation();
            gDropdown.classList.toggle("sqd-hidden");
            gSubDropdown.classList.toggle("sqd-hidden");
            gSubDropdown1.classList.toggle("sqd-hidden");
            gSubDropdown2.classList.toggle("sqd-hidden");
            gSubDropdownMain1.classList.toggle("sqd-hidden");
            gSubDropdownMain2.classList.toggle("sqd-hidden");
            gUpPop3.classList.toggle("sqd-hidden");

            // =============== Add properties
            if (dropdownBoxInnerText.textContent && dropdownBoxInnerText.textContent != "Select a condition") {
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
            if (textInput.value != "") {
                // textRight.textContent = emailInput.value;
                step.properties["value"] = textInput.value;
            }
            textRight.textContent = "If " + step.properties["value"].toString() + " " + step.properties["condition"].toString() + " in " + " the " + step.properties["property"].toString() + "s";
        });

        upchangeIcon.addEventListener("click", function (e) {
            step.properties = {};
            textRight.textContent = "Choose Condition";
            dropdownBoxInnerText.textContent = "Select a condition";
            dropdownBoxInnerText1.textContent = "Is";
            dropdownBoxInnerText2.textContent = "";
            dropdownBoxInnerTextMain1.textContent = "CONTACT INFO";
            dropdownBoxInnerTextMain2.textContent = "ACTIONS";
            gSubDropdown.classList.remove("sqd-hidden");
            gSubDropdown1.classList.remove("sqd-hidden");
            gSubDropdown2.classList.remove("sqd-hidden");
            gSubDropdownMain1.classList.add("sqd-hidden");
            gSubDropdownMain2.classList.add("sqd-hidden");

        });

        // edit button hover
        editIcon.addEventListener("mouseover", function (e) {
            rightEditImgContainerCircle.setAttribute("style", "fill: #2488cb");
        });
        editIcon.addEventListener("mouseout", function (e) {
            rightEditImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
        });
        // copy hover
        changeIcon.addEventListener("mouseover", function (e) {
            rightCopyImgContainerCircle.setAttribute("style", "fill: #3498db");
            // upCopyIcon.setAttribute("style", "color: #FFFFFF"); 
        });
        changeIcon.addEventListener("mouseout", function (e) {
            rightCopyImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
            // upCopyIcon.setAttribute("style", "color: #FFFFFF"); 
        });
        // delete hover
        deleteIcon.addEventListener("mouseover", function (e) {
            rightDeleteImgContainerCircle.setAttribute("style", "fill: #3498db");
        });
        deleteIcon.addEventListener("mouseout", function (e) {
            rightDeleteImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
        });
        // check button hover
        upCheckIcon.addEventListener("mouseover", function (e) {
            checkImgContainerCircle.setAttribute("style", "fill: #2488cb");
        });
        upCheckIcon.addEventListener("mouseout", function (e) {
            checkImgContainerCircle.setAttribute("style", "fill: #3498db");
        });
        // copy button hover
        upchangeIcon.addEventListener("mouseover", function (e) {
            copyImgContainerCircle.setAttribute("style", "fill: #3498db");
            // upchangeIcon.setAttribute("style", "color: #FFFFFF"); 
        });
        upchangeIcon.addEventListener("mouseout", function (e) {
            copyImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
            // upCopyIcon.setAttribute("style", "color: #FFFFFF"); 
        });
        // delete button hover
        upDeleteIcon.addEventListener("mouseover", function (e) {
            deleteImgContainerCircle.setAttribute("style", "fill: #3498db");
        });
        upDeleteIcon.addEventListener("mouseout", function (e) {
            deleteImgContainerCircle.setAttribute("style", "fill: #FFFFFF");
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
            gSubDropdownboxPop.classList.toggle("sqd-hidden");
            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
                dropdownRightButtonUp.classList.remove("sqd-hidden");
                dropdownRightButtonDown.classList.add("sqd-hidden");
            } else {
                dropdownRightButtonUp.classList.add("sqd-hidden");
                dropdownRightButtonDown.classList.remove("sqd-hidden");
            }
        });
        dropdownBoxShapeAfter1.addEventListener("click", function (e) {
            e.stopPropagation();

            gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
            if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
                gSubDropdownboxPop.classList.remove("sqd-hidden");
            }
            if (gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
                dropdownRightButtonUp1.classList.add("sqd-hidden");
                dropdownRightButtonDown1.classList.remove("sqd-hidden");
            } else {
                dropdownRightButtonUp1.classList.remove("sqd-hidden");
                dropdownRightButtonDown1.classList.add("sqd-hidden");
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
            } else {
                dropdownRightButtonUp2.classList.remove("sqd-hidden");
                dropdownRightButtonDown2.classList.add("sqd-hidden");
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
        dropdownBoxShapeAfterMain1.addEventListener("click", function (e) {
            e.stopPropagation();
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
            // shapeHeight += shapeHeightContact; 
        });
        dropdownBoxShapeAfterMain2.addEventListener("click", function (e) {
            e.stopPropagation();
            gSubDropdownboxPopMain2.classList.toggle("sqd-hidden");
            if (!gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
                gSubDropdownboxPopMain2.classList.remove("sqd-hidden");
            }
            if (gSubDropdownboxPopMain2.classList.contains("sqd-hidden")) {
                dropdownRightButtonUpMain2.classList.add("sqd-hidden");
                dropdownRightButtonDownMain2.classList.remove("sqd-hidden");
            } else {
                dropdownRightButtonUpMain2.classList.remove("sqd-hidden");
                dropdownRightButtonDownMain2.classList.add("sqd-hidden");
            }
            shapeHeight += shapeHeightActions;
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

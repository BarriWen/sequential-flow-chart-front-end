import { Dom } from "../../core/dom";
import { Vector } from "../../core/vector";
import { TaskStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { InputView } from "../common-views/input-view";
import { OutputView } from "../common-views/output-view";
import { ValidationErrorView } from "../common-views/validation-error-view";
import { ComponentView } from "../component";
const PADDING_X = 12;
const PADDING_Y = 10;
const MIN_TEXT_WIDTH = 70;
const ICON_SIZE = 22;
const RECT_RADIUS = 15;

export class TriggerComponentView implements ComponentView {
  private constructor(
    public g: SVGGElement,
    public width: number,
    public height: number,
    public joinX: number,
    public rect: SVGRectElement,
    public readonly inputView: InputView,
    public readonly outputView: OutputView,
    public readonly validationErrorView: ValidationErrorView
  ) {}
  public static create(
    parent: SVGElement,
    step: TaskStep,
    configuration: StepsConfiguration
  ): TriggerComponentView {
    const g = Dom.svg("g", {
      class: `sqd-task-group sqd-type-${step.type}`,
    });
    parent.appendChild(g);
    const boxHeight = ICON_SIZE + PADDING_Y;
    const text = Dom.svg("text", {
      x: PADDING_X/1.5,
      y: boxHeight / 1.7,
      class: "sqd-task-text",
    });
    text.textContent = step.name;
    g.appendChild(text);
    const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH);
    const boxWidth = ICON_SIZE + 8 * PADDING_X + 2 * textWidth;
    const rect = Dom.svg("rect", {
      x: 0.5,
      y: 0.5,
      class: "sqd-task-rect",
      width: boxWidth,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    g.insertBefore(rect, text);
    const rectLeft = Dom.svg("rect", {
      x: 0.5,
      y: 0.5,
      class: "sqd-task-rect",
      width: textWidth + 5,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    const textRight = Dom.svg("text", {
      x: ICON_SIZE + 3 * PADDING_X + textWidth - 10,
      y: boxHeight / 1.7,
      class: "sqd-task-text",
    });
    if (step.properties["Select List"]) {
      textRight.textContent = step.properties["Select List"].toString();
    }
    else {
      textRight.textContent = "Default list";
    }
    g.appendChild(textRight);

    g.insertBefore(rectLeft, text);
    g.appendChild(textRight);
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
    const moreUrl = "../assets/more.svg";
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
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22,
      y: 5,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    const rightCopyImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const rightCopyImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 60,
      y: PADDING_Y - 6,
    });
    Dom.attrs(rightCopyImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const changeUrl = "../assets/change.svg";
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
      id: `RightChangeIcon-${step.id}`,
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 64,
      y: PADDING_Y - 2,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
    rightCopyImgContainer.appendChild(changeIcon);
    const rightDeleteImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const rightDeleteImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 46,
      y: PADDING_Y + 27,
    });
    Dom.attrs(rightDeleteImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const deleteUrl = "../assets/delete.svg";
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
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
      y: PADDING_Y + 30,
      width: 22,
      height: 22,
    });
    rightDeleteImgContainer.appendChild(rightDeleteImgContainerCircle);
    rightDeleteImgContainer.appendChild(deleteIcon);
    const rightEditImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const rightEditImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
      y: PADDING_Y - 40,
    });
    Dom.attrs(rightEditImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const editUrl = "../assets/edit.svg";
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
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 53,
      y: PADDING_Y - 36,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    rightEditImgContainer.appendChild(rightEditImgContainerCircle);
    rightEditImgContainer.appendChild(editIcon);

    const checkImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const checkImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 89,
      y: PADDING_Y - 40,
    });
    Dom.attrs(checkImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
    });
    const upCheckIconUrl = "../assets/check.svg";
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
      x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 93,
      y: PADDING_Y - 37,
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
      x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 41 + 110,
      y: PADDING_Y - 40,
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
      x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 44 + 110,
      y: PADDING_Y - 37,
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
      x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 98,
      y: PADDING_Y - 40,
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
      x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 102,
      y: PADDING_Y - 37,
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
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 82,
      y: PADDING_Y - 35,
    });
    const reminderText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22 + 72.5,
      y: PADDING_Y - 23,
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
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22 + 75,
      y: PADDING_Y,
    });

    const reminderText2 = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22 + 80,
      y: PADDING_Y + 12,
    });
    Dom.attrs(reminderText2, {
      //class: 'sqd-hidden',
      id: `reminderText2${Date.now()}`,
    });
    reminderText2.textContent = "Reset";
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
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 82,
      y: PADDING_Y + 35,
    });

    const reminderText3 = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22 + 67,
      y: PADDING_Y + 47,
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
    //add dropdown
    //**************************************************//
    //***********start with general node****************//
    const gDropdown = Dom.svg("g", {
      class: `sqd-task-group dropdown sqd-hidden Collapsed`,
    });
    const rect1 = Dom.svg("rect", {
      x: 0.5,
      y: boxHeight,
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
      x: PADDING_X,
      y: 1.5 * boxHeight,
    });
    Dom.attrs(nameText, {
      //class: 'sqd-hidden',
      id: `dropdownword1${Date.now()}`,
    });
    const nameText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: PADDING_X,
      y: 2 * boxHeight,
    });
    Dom.attrs(nameText1, {
      //class: 'sqd-hidden',
      id: `dropdownword2${Date.now()}`,
    });
    nameText.textContent = "List:";
    nameText1.textContent = "Run:";
    gDropdown.appendChild(nameText);
    gDropdown.appendChild(nameText1);
    gDropdown.insertBefore(rect1, nameText);
    const gSubDropdown = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
    });
    const gSubDropdown1 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown Collapsed sqd-hidden`,
    });
    const gSubDropdownbox = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox`,
    });
    const gSubDropdownbox1 = Dom.svg("g", {
      class: `sqd-task-group sub-dropdownbox`,
    });
    const dropdownBoxShape = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: ICON_SIZE + 5 * PADDING_X,
      y: 1.2 * boxHeight,
    });
    const dropdownBoxShape1 = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: ICON_SIZE + 5 * PADDING_X,
      y: 1.75 * boxHeight,
    });
    const dropdownRightButton = Dom.svg("text", {
      class: "sqd-task-text select-field",
      x: ICON_SIZE + 9 * PADDING_X,
      y: 1.35 * boxHeight,
    });
    const dropdownRightButton1 = Dom.svg("text", {
      class: "sqd-task-text select-field",
      x: ICON_SIZE + 9 * PADDING_X,
      y: 1.9 * boxHeight,
    });
    dropdownRightButton.textContent = "▼";
    dropdownRightButton1.textContent = "▼";
    const dropdownBoxInnerText = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 5 * PADDING_X,
      y: 1.4 * boxHeight,
    });
    dropdownBoxInnerText.textContent = "Select";
    const dropdownBoxInnerText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 5 * PADDING_X,
      y: 1.95 * boxHeight,
    });
    dropdownBoxInnerText1.textContent = "Select";
    const dropdownBoxShapeAfter = Dom.svg("rect", {
      width: 60,
      height: 15,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: ICON_SIZE + 5 * PADDING_X,
      y: 1.2 * boxHeight,
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
      x: ICON_SIZE + 5 * PADDING_X,
      y: 1.75 * boxHeight,
      id: `dropdownBoxShape1${Date.now()}`,
    });
    Dom.attrs(dropdownBoxShape1After, {
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
    // Options
    let list = ['Any List','List A'];
    for (let i = 1; i <= list.length; i++) {
      const dropdownBoxBottomShape = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.2 * boxHeight + 15 *i,
      });
      const dropdownBoxBottomShapeText = Dom.svg("text", {
        class: "sqd-task-text",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.4 * boxHeight + 15*i,
      });
      dropdownBoxBottomShapeText.textContent = list[i-1];
      const dropdownBoxBottomShapecover = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field choice",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.2 * boxHeight + 15*i,
        id: `dropdownBoxBottomShapecover${Date.now()}`,
      });
      Dom.attrs(dropdownBoxBottomShapecover, {
        opacity: 0.3,
      });
      // Add event listners
      dropdownBoxBottomShapecover.addEventListener("click", function (e) {
        dropdownBoxInnerText.textContent = dropdownBoxBottomShapeText.textContent;
        gSubDropdownboxPop.classList.toggle("sqd-hidden");
      });
      gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText);
    gSubDropdownboxPop.insertBefore(
      dropdownBoxBottomShape,
      dropdownBoxBottomShapeText
    );
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover);
    }
   
    // Run time choices
    list = ['Once','Multiple'];
    // Options
    for (let i = 1; i <= list.length; i++) {
      const dropdownBoxBottomShape1 = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.75 * boxHeight + 15 * i,
      });
  
      const dropdownBoxBottomShape1Text = Dom.svg("text", {
        class: "sqd-task-text",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.95 * boxHeight + 15 * i,
      });
      dropdownBoxBottomShape1Text.textContent = list[i-1];
      const dropdownBoxBottomShape1cover = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field choice",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.75 * boxHeight + 15 * i,
        id: `dropdownBoxBottomShape1cover${Date.now()}`,
      });
      Dom.attrs(dropdownBoxBottomShape1cover, {
        opacity: 0.3,
      });
      // Add event listners
      dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
        dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
        gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
      });
      // Append Child
      gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
      gSubDropdownbox1Pop.insertBefore(
        dropdownBoxBottomShape1,
        dropdownBoxBottomShape1Text
      );
      gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
    }
    
    gSubDropdownbox.appendChild(dropdownRightButton);
    gSubDropdownbox1.appendChild(dropdownRightButton1);
    gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButton);
    gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButton1);
    gSubDropdownbox.appendChild(dropdownBoxInnerText);
    gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
    gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
    gSubDropdownbox1.appendChild(dropdownBoxShape1After);
    gSubDropdown.appendChild(gSubDropdownbox);
    gSubDropdown.appendChild(gSubDropdownboxPop);
    gSubDropdown1.appendChild(gSubDropdownbox1);
    gSubDropdown1.appendChild(gSubDropdownbox1Pop);
    gDropdown.appendChild(gSubDropdown1);
    gDropdown.appendChild(gSubDropdown);
    g.appendChild(moreIcon);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);
    g.appendChild(gRightPop3Reminder);
    g.appendChild(gUpPop3);
    g.appendChild(setUpReminder);

    // Add EventListeners
    moreIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      gRightPop3.classList.toggle("sqd-hidden");
    });
    
    // Edit
    editIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      gRightPop3.classList.toggle("sqd-hidden");
      gSubDropdown.classList.toggle("sqd-hidden");
      gSubDropdown1.classList.toggle("sqd-hidden");
    });
    upCheckIcon.addEventListener("click", function(e){
      e.stopPropagation();
      gDropdown.classList.toggle("sqd-hidden");
      gSubDropdown.classList.toggle("sqd-hidden");
      gSubDropdown1.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      if (dropdownBoxInnerText.textContent && dropdownBoxInnerText.textContent != "Select") {
        textRight.textContent = dropdownBoxInnerText.textContent;
        step.properties["List"] = dropdownBoxInnerText.textContent;
      }
      if (dropdownBoxInnerText1.textContent && dropdownBoxInnerText1.textContent != "Select") {
        step.properties["Run"] = dropdownBoxInnerText1.textContent;
      }
      step.updatedAt = new Date();
    });

     // Show hints
     editIcon.addEventListener("mouseover", function(){
      gRightPop3Reminder1.classList.toggle("sqd-hidden");
    });
    editIcon.addEventListener("mouseout", function(){
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

    const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
    const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
    const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
    return new TriggerComponentView(
      g,
      boxWidth,
      boxHeight,
      boxWidth / 2,
      rect,
      inputView,
      outputView,
      validationErrorView
    );
  }

  public getClientPosition(): Vector {
    const rect = this.rect.getBoundingClientRect();
    return new Vector(rect.x, rect.y);
  }

  public containsElement(element: Element): boolean {
    return this.g.contains(element);
  }

  public setIsDragging(isDragging: boolean) {
    this.inputView.setIsHidden(isDragging);
    this.outputView.setIsHidden(isDragging);
  }

  public setIsDisabled(isDisabled: boolean) {
    Dom.toggleClass(this.g, isDisabled, "sqd-disabled");
  }

  public setIsSelected(isSelected: boolean) {
    Dom.toggleClass(this.rect, isSelected, "sqd-selected");
    Dom.toggleClass(this.g.children[1], isSelected, "sqd-selected");
    Dom.toggleClass(this.g.children[6].children[0], isSelected, "sqd-selected");
  }

  public setIsValid(isValid: boolean) {
    this.validationErrorView.setIsHidden(isValid);
  }
}
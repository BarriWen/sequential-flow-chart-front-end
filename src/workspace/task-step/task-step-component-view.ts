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

export class TaskStepComponentView implements ComponentView {
  public static create(
    parent: SVGElement,
    step: TaskStep,
    configuration: StepsConfiguration
  ): TaskStepComponentView {
    const g = Dom.svg("g", {
      class: `sqd-task-group sqd-type-${step.type}`,
    });
    parent.appendChild(g);
    //Add Time Delay Dropdown
    if (step.name === "Time Delay") {
      const boxHeight = ICON_SIZE + PADDING_Y;
      const text = Dom.svg("text", {
        x: 0.5,
        y: boxHeight / 2,
        class: "sqd-task-text",
      });
      text.textContent = step.name;
      g.appendChild(text);
      const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH);
      const boxWidth = ICON_SIZE + 8 * PADDING_X + 2 * textWidth;
      console.log(2213, "go there", boxHeight, boxWidth);
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
        y: boxHeight / 2,
        class: "sqd-task-text",
      });
      textRight.textContent = "Default list";
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
        //y1: ICON_SIZE + 4 * PADDING_X + 2  * textWidth + 10,
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
      const magnidyIconUrl = "./assets/magnify.svg";
      const magnidyIcon = magnidyIconUrl
        ? Dom.svg("image", {
            href: magnidyIconUrl,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(magnidyIcon, {
        class: "magnidyIcon",
        id: `magnidyIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 90,
        y: PADDING_Y,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
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
        id: `moreIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22,
        y: 5,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
      const changeUrl = "./assets/change.svg";
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
        class: "changeIcon",
        id: `changeIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 60,
        y: PADDING_Y,
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
      const copyUrl = "./assets/copy.svg";
      // add 3 icons
      const copyIcon = copyUrl
        ? Dom.svg("image", {
            href: copyUrl,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(copyIcon, {
        class: "copyIcon moreicon",
        id: `copyIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 64,
        y: PADDING_Y - 2,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
      rightCopyImgContainer.appendChild(rightCopyImgContainerCircle);
      rightCopyImgContainer.appendChild(copyIcon);
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
      const deleteUrl = "./assets/delete.svg";
      // add click event for icon
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
        class: "deleteIcon moreicon",
        id: `deleteIcon${Date.now()}`,
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
      const editUrl = "./assets/edit.svg";
      // add click event for icon
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
        class: "editIcon moreicon",
        id: `editIcon${Date.now()}`,
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
      const iconUrl4 = "./assets/check.svg";
      // add click event for icon
      const icon4 = iconUrl4
        ? Dom.svg("image", {
            href: iconUrl4,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(icon4, {
        class: "moreicon",
        id: `icon4${Date.now()}`,
        x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 93,
        y: PADDING_Y - 37,
        width: 22,
        height: 22,
      });
      checkImgContainer.appendChild(checkImgContainerCircle);
      checkImgContainer.appendChild(icon4);
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
      const iconUrl5 = "./assets/delete.svg";
      // add click event for icon
      const icon5 = iconUrl5
        ? Dom.svg("image", {
            href: iconUrl5,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(icon5, {
        class: "moreicon",
        id: `icon5${Date.now()}`,
        x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 44 + 110,
        y: PADDING_Y - 37,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
      deleteImgContainer.appendChild(deleteImgContainerCircle);
      deleteImgContainer.appendChild(icon5);

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
      const iconUrl6 = "./assets/copy.svg";
      // add 3 icons

      const icon6 = iconUrl6
        ? Dom.svg("image", {
            href: iconUrl6,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(icon6, {
        class: "moreicon",
        id: `icon6${Date.now()}`,
        x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 102,
        y: PADDING_Y - 37,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
      copyImgContainer.appendChild(copyImgContainerCircle);
      copyImgContainer.appendChild(icon6);
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
        //class: 'sqd-hidden',
        id: `dropdown${Date.now()}`,
      });

      const dropdownNameText = Dom.svg("text", {
        class: "sqd-task-text",
        x: PADDING_X - 5,
        y: 1.5 * boxHeight,
      });
      Dom.attrs(dropdownNameText, {
        id: `dropdownNameText${Date.now()}`,
      });
      dropdownNameText.textContent =
        "Choose how long a contact will be delayed.";
      const dropdownNameText1 = Dom.svg("text", {
        class: "sqd-task-text",
        x: PADDING_X - 5,
        y: 2.3 * boxHeight,
      });
      Dom.attrs(dropdownNameText1, {
        id: `dropdownNameText1${Date.now()}`,
      });
      dropdownNameText1.textContent = "Delay for";

      //add input for time delay tag
      var foreignObjectTag = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "foreignObject"
      ); //Create a rect in SVG's namespace
      foreignObjectTag.setAttribute("x", (PADDING_X + 55).toString()); //Set rect data
      foreignObjectTag.setAttribute("y", (2 * boxHeight).toString()); //Set rect data
      foreignObjectTag.setAttribute("width", "68"); //Set rect data
      foreignObjectTag.setAttribute("height", "21.5"); //Set rect data
      var divTag = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "div"
      );
      divTag.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      var divTagInput = document.createElement("INPUT");
      divTagInput.setAttribute("id", "timedelayinput");
      divTagInput.setAttribute("value", "1");
      divTagInput.style.width = "60px";
      divTag.appendChild(divTagInput);
      foreignObjectTag.appendChild(divTag);
      gDropdown.appendChild(dropdownNameText);
      gDropdown.appendChild(dropdownNameText1);
      gDropdown.insertBefore(rect1, dropdownNameText);
      gDropdown.appendChild(foreignObjectTag);
      //create the dropdown label select
      const dropdownNameLabelText = Dom.svg("text", {
        class: "sqd-task-text",
        x: PADDING_X + 135,
        y: 2.3 * boxHeight,
      });
      Dom.attrs(dropdownNameLabelText, {
        id: `dropdownNameLabelText${Date.now()}`,
      });
      dropdownNameLabelText.textContent = "Select";
      const dropdownNameLabelRightTriangle = Dom.svg("text", {
        class: "sqd-task-text",
        x: PADDING_X + 180,
        y: 2.3 * boxHeight,
      });
      Dom.attrs(dropdownNameLabelRightTriangle, {
        id: `dropdownNameLabelRightTriangle${Date.now()}`,
      });
      dropdownNameLabelRightTriangle.textContent = "▼";
      const selectTimeDropdownLabel = Dom.svg("rect", {
        x: PADDING_X + 135,
        y: 1.98 * boxHeight,
        class: "sqd-task-rect",
        width: 60,
        height: 21.5,
        rx: 3,
        ry: 3,
      });
      const selectTimeDropdownLabelCover = Dom.svg("rect", {
        x: PADDING_X + 135,
        y: 1.98 * boxHeight,
        class: "sqd-task-rect",
        width: 60,
        height: 21.5,
        rx: 3,
        ry: 3,
      });
      Dom.attrs(selectTimeDropdownLabelCover, {
        opacity: 0.1,
        id: `selectTimeDropdownLabelCover${Date.now()}`,
      });
      gDropdown.appendChild(dropdownNameLabelText);
      gDropdown.appendChild(dropdownNameLabelRightTriangle);
      gDropdown.insertBefore(selectTimeDropdownLabel, dropdownNameLabelText);
      gDropdown.appendChild(selectTimeDropdownLabelCover);
      //create dropdown day/ hour/min
      //this is dropdown day
      const dropdownNameLabelText1 = Dom.svg("text", {
        class: "sqd-task-text",
        x: PADDING_X + 135,
        y: 2.3 * boxHeight + 21.5,
      });
      Dom.attrs(dropdownNameLabelText1, {
        id: `dropdownNameLabelText1${Date.now()}`,
      });
      dropdownNameLabelText1.textContent = "Day";
      const selectTimeDropdownLabel1 = Dom.svg("rect", {
        x: PADDING_X + 135,
        y: 1.98 * boxHeight + 21.5,
        class: "sqd-task-rect",
        width: 60,
        height: 21.5,
        rx: 3,
        ry: 3,
      });
      const selectTimeDropdownLabelCover1 = Dom.svg("rect", {
        x: PADDING_X + 135,
        y: 1.98 * boxHeight + 21.5,
        class: "sqd-task-rect",
        width: 60,
        height: 21.5,
        rx: 3,
        ry: 3,
      });
      Dom.attrs(selectTimeDropdownLabelCover1, {
        opacity: 0.1,
        id: `selectTimeDropdownLabelCover1${Date.now()}`,
      });

      //this is hour
      const dropdownNameLabelText2 = Dom.svg("text", {
        class: "sqd-task-text",
        x: PADDING_X + 135,
        y: 2.3 * boxHeight + 2 * 21.5,
      });
      Dom.attrs(dropdownNameLabelText2, {
        id: `dropdownNameLabelText2${Date.now()}`,
      });
      dropdownNameLabelText2.textContent = "Hour";
      const selectTimeDropdownLabel2 = Dom.svg("rect", {
        x: PADDING_X + 135,
        y: 1.98 * boxHeight + 2 * 21.5,
        class: "sqd-task-rect",
        width: 60,
        height: 21.5,
        rx: 3,
        ry: 3,
      });
      const selectTimeDropdownLabelCover2 = Dom.svg("rect", {
        x: PADDING_X + 135,
        y: 1.98 * boxHeight + 2 * 21.5,
        class: "sqd-task-rect",
        width: 60,
        height: 21.5,
        rx: 3,
        ry: 3,
      });
      Dom.attrs(selectTimeDropdownLabelCover2, {
        opacity: 0.1,
        id: `selectTimeDropdownLabelCover2${Date.now()}`,
      });

      //this is minutes
      const dropdownNameLabelText3 = Dom.svg("text", {
        class: "sqd-task-text",
        x: PADDING_X + 135,
        y: 2.3 * boxHeight + 3 * 21.5,
      });
      Dom.attrs(dropdownNameLabelText3, {
        id: `dropdownNameLabelText3${Date.now()}`,
      });
      dropdownNameLabelText3.textContent = "Minutes";
      const selectTimeDropdownLabel3 = Dom.svg("rect", {
        x: PADDING_X + 135,
        y: 1.98 * boxHeight + 3 * 21.5,
        class: "sqd-task-rect",
        width: 60,
        height: 21.5,
        rx: 3,
        ry: 3,
      });
      const selectTimeDropdownLabelCover3 = Dom.svg("rect", {
        x: PADDING_X + 135,
        y: 1.98 * boxHeight + 3 * 21.5,
        class: "sqd-task-rect",
        width: 60,
        height: 21.5,
        rx: 3,
        ry: 3,
      });
      Dom.attrs(selectTimeDropdownLabelCover3, {
        opacity: 0.1,
        id: `selectTimeDropdownLabelCover3${Date.now()}`,
      });
      const timedelaySubDropdown = Dom.svg("g", {
        class: `sqd-task-group timedelay dropdown sqd-hidden Collapsed`,
      });
      timedelaySubDropdown.appendChild(dropdownNameLabelText1);
      timedelaySubDropdown.insertBefore(
        selectTimeDropdownLabel1,
        dropdownNameLabelText1
      );
      timedelaySubDropdown.appendChild(selectTimeDropdownLabelCover1);
      timedelaySubDropdown.appendChild(dropdownNameLabelText2);
      timedelaySubDropdown.insertBefore(
        selectTimeDropdownLabel2,
        dropdownNameLabelText2
      );
      timedelaySubDropdown.appendChild(selectTimeDropdownLabelCover2);
      timedelaySubDropdown.appendChild(dropdownNameLabelText3);
      timedelaySubDropdown.insertBefore(
        selectTimeDropdownLabel3,
        dropdownNameLabelText3
      );
      timedelaySubDropdown.appendChild(selectTimeDropdownLabelCover3);
      gDropdown.appendChild(timedelaySubDropdown);
      g.appendChild(moreIcon);
      g.appendChild(gRightPop3);
      console.log(2839, gRightPop3);
      g.appendChild(gDropdown);
      g.appendChild(gRightPop3Reminder);
      g.appendChild(gUpPop3);
      g.appendChild(setUpReminder);
      const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
      const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
      const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
      return new TaskStepComponentView(
        g,
        boxWidth,
        boxHeight,
        boxWidth / 2,
        rect,
        inputView,
        outputView,
        validationErrorView
      );
    } else {
      const boxHeight = ICON_SIZE + PADDING_Y;
      const text = Dom.svg("text", {
        x: 0.5,
        y: boxHeight / 2,
        class: "sqd-task-text",
      });
      text.textContent = step.name;
      g.appendChild(text);
      const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH);
      const boxWidth = ICON_SIZE + 8 * PADDING_X + 2 * textWidth;
      console.log(2213, "go there", boxHeight, boxWidth);
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
        y: boxHeight / 2,
        class: "sqd-task-text",
      });
      textRight.textContent = "Default list";
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
        //y1: ICON_SIZE + 4 * PADDING_X + 2  * textWidth + 10,
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
      const magnidyIconUrl = "./assets/magnify.svg";
      const magnidyIcon = magnidyIconUrl
        ? Dom.svg("image", {
            href: magnidyIconUrl,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(magnidyIcon, {
        class: "magnidyIcon",
        id: `magnidyIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 90,
        y: PADDING_Y,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
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
        id: `moreIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22,
        y: 5,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
      const changeUrl = "./assets/change.svg";
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
        class: "changeIcon",
        id: `changeIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 60,
        y: PADDING_Y,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });

      const copyUrl = "./assets/copy.svg";
      // add 3 icons
      const copyIcon = copyUrl
        ? Dom.svg("image", {
            href: copyUrl,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(copyIcon, {
        class: "copyIcon moreicon",
        id: `copyIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 60,
        y: PADDING_Y,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });

      const deleteUrl = "./assets/delete.svg";
      // add click event for icon
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
        class: "deleteIcon moreicon",
        id: `deleteIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
        y: PADDING_Y + 25,
        width: 22,
        height: 22,
      });

      const editUrl = "./assets/edit.svg";
      // add click event for icon
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
        class: "editIcon moreicon",
        id: `editIcon${Date.now()}`,
        x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
        y: PADDING_Y - 30,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
      const iconUrl4 = "./assets/check.svg";
      // add click event for icon
      const icon4 = iconUrl4
        ? Dom.svg("image", {
            href: iconUrl4,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(icon4, {
        class: "moreicon",
        id: `icon4${Date.now()}`,
        x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X,
        y: PADDING_Y - 32,
        width: 22,
        height: 22,
      });
      const deleteImgContainer = Dom.svg("g", {
        class: "sqd-task-deleteImgContainer",
      });
      const deleteImgContainerCircle = Dom.svg("rect", {
        class: "sqd-task-ImgContainerCircle",
        x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 41,
        y: PADDING_Y - 35,
      });
      Dom.attrs(deleteImgContainerCircle, {
        width: 30,
        height: 30,
        rx: 50,
        ry: 50,
      });
      const iconUrl5 = "./assets/delete.svg";
      // add click event for icon
      const icon5 = iconUrl5
        ? Dom.svg("image", {
            href: iconUrl5,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(icon5, {
        class: "moreicon",
        id: `icon5${Date.now()}`,
        x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 44,
        y: PADDING_Y - 32,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });
      deleteImgContainer.appendChild(deleteImgContainerCircle);
      deleteImgContainer.appendChild(icon5);
      const iconUrl6 = "./assets/copy.svg";
      // add 3 icons
      const icon6 = iconUrl6
        ? Dom.svg("image", {
            href: iconUrl6,
          })
        : Dom.svg("rect", {
            class: "sqd-task-empty-icon",
            rx: 4,
            ry: 4,
          });
      Dom.attrs(icon6, {
        class: "moreicon",
        id: `icon6${Date.now()}`,
        x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22,
        y: PADDING_Y - 32,
        width: ICON_SIZE,
        height: ICON_SIZE,
      });

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

      gRightPop3.appendChild(copyIcon);
      gRightPop3.appendChild(deleteIcon);
      gRightPop3.appendChild(editIcon);

      gUpPop3.appendChild(icon4);
      gUpPop3.appendChild(deleteImgContainer);
      gUpPop3.appendChild(icon6);
      //console.log(2598, 'go 2596', gUpPop3)
      //g right pop with change
      const gRightPop3withchange = Dom.svg("g", {
        class: `sqd-task-group right-popup sqd-hidden Collapsed`,
      });
      gRightPop3withchange.appendChild(changeIcon);
      gRightPop3withchange.appendChild(deleteIcon);
      gRightPop3withchange.appendChild(editIcon);
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
      if (step.name === "Send Email") {
        gRightPop3.appendChild(copyIcon);
        gRightPop3.appendChild(deleteIcon);
        gRightPop3.appendChild(editIcon);
        gRightPop3.appendChild(magnidyIcon);
        console.log(2615, gRightPop3);
      } else {
        gRightPop3.appendChild(copyIcon);
        gRightPop3.appendChild(deleteIcon);
        gRightPop3.appendChild(editIcon);
      }
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
      nameText.textContent = "Select List:";
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
      const dropdownBoxBottomShape = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.2 * boxHeight + 15,
      });
      const dropdownBoxBottomShapeText = Dom.svg("text", {
        class: "sqd-task-text",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.4 * boxHeight + 15,
      });
      dropdownBoxBottomShapeText.textContent = "Any list";
      const dropdownBoxBottomShapecover = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field choice",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.2 * boxHeight + 15,
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
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.2 * boxHeight + 30,
      });
      const dropdownBoxBottomShapeSText = Dom.svg("text", {
        class: "sqd-task-text",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.4 * boxHeight + 30,
      });
      dropdownBoxBottomShapeSText.textContent = "List A";
      const dropdownBoxBottomShapeScover = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field choice",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.2 * boxHeight + 30,
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
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.75 * boxHeight + 15,
      });

      const dropdownBoxBottomShape1Text = Dom.svg("text", {
        class: "sqd-task-text",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.95 * boxHeight + 15,
      });
      dropdownBoxBottomShape1Text.textContent = "Once";
      const dropdownBoxBottomShape1cover = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field choice",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.75 * boxHeight + 15,
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
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.75 * boxHeight + 30,
      });

      const dropdownBoxBottomShape1SText = Dom.svg("text", {
        class: "sqd-task-text",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.95 * boxHeight + 30,
      });
      dropdownBoxBottomShape1SText.textContent = "Multiple ";
      const dropdownBoxBottomShape1Scover = Dom.svg("rect", {
        width: 60,
        height: 15,
        class: "option select-field choice",
        fill: "#fff",
        stroke: "#a0a0a0",
        x: ICON_SIZE + 5 * PADDING_X,
        y: 1.75 * boxHeight + 30,
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
      g.appendChild(moreIcon);
      g.appendChild(gRightPop3);
      g.appendChild(gDropdown);
      g.appendChild(gRightPop3Reminder);
      g.appendChild(gUpPop3);
      g.appendChild(setUpReminder);
      g.appendChild(gSubDropdown1);
      g.appendChild(gSubDropdown);
      const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
      const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
      const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
      return new TaskStepComponentView(
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
  }

  private constructor(
    public readonly g: SVGGElement,
    public readonly width: number,
    public readonly height: number,
    public readonly joinX: number,
    private readonly rect: SVGRectElement,
    private readonly inputView: InputView,
    private readonly outputView: OutputView,
    private readonly validationErrorView: ValidationErrorView
  ) {}

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
  }

  public setIsValid(isValid: boolean) {
    this.validationErrorView.setIsHidden(isValid);
  }
}

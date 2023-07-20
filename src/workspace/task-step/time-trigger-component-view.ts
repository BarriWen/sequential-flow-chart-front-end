import { Dom } from "../../core/dom";
import { SequenceModifier } from "../../core/sequence-modifier";
import { Vector } from "../../core/vector";
import { ComponentType, TaskStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { InputView } from "../common-views/input-view";
import { OutputView } from "../common-views/output-view";
import { ValidationErrorView } from "../common-views/validation-error-view";
import { ComponentView } from "../component";
import { SequenceComponent } from "../sequence/sequence-component";

// import VanillaCalendar from "@uvarov.frontend/vanilla-calendar/src/index";
// import '@uvarov.frontend/vanilla-calendar/build/vanilla-calendar.min.css';
// import '@uvarov.frontend/vanilla-calendar/build/themes/light.min.css';
// import '@uvarov.frontend/vanilla-calendar/build/themes/dark.min.css';

const PADDING_X = 12;
const PADDING_Y = 10;
const MIN_TEXT_WIDTH = 70;
const ICON_SIZE = 22;
const RECT_RADIUS = 15;

export class TimeTriggerTaskStepComponentView implements ComponentView {
  private constructor(
    public g: SVGGElement,
    public width: number,
    public height: number,
    public joinX: number,
    public rect: SVGRectElement,
    public readonly inputView: InputView,
    public readonly outputView: OutputView,
    public readonly validationErrorView: ValidationErrorView,
  ) {}

  
  public static create(
    parent: SVGElement,
    step: TaskStep,
    configuration: StepsConfiguration
  ): TimeTriggerTaskStepComponentView {
    var addon = 18;

    const g = Dom.svg("g", {
      class: `sqd-task-group sqd-type-${step.type}`,
      id: "sqd-task-timetrigger"
    });
    parent.insertBefore(g, parent.firstChild);
    const boxHeight = ICON_SIZE + PADDING_Y;
    const text = Dom.svg("text", {
      x: PADDING_X/1.5 + addon +4,
      y: boxHeight / 1.7-3,
      class: "sqd-task-text",
    });
    text.textContent = step.name;
    g.appendChild(text);
    const textWidth = Math.max(text.getBBox().width+16, MIN_TEXT_WIDTH);
    const boxWidth = ICON_SIZE + 8 * PADDING_X + 2 * textWidth;

    // Popup text setup
    const gHint = Dom.svg("g", {
      class: "sqd-task-group-pop",
    });

    const hint_mark = Dom.svg("image", {
      x: ICON_SIZE + boxWidth / 2.0 - 11,
      y: boxHeight / 2.0 - 32,
      width: 12,
      height: 12,
      href: "./assets/exclamation.svg",
    });
    const hint_text = Dom.svg("text", {
      // class: "sqd-task-text",
      x: ICON_SIZE + boxWidth / 2.0 + 2,
      y: boxHeight / 2.0 - 22,
      fill: "#F00000",
      "font-size": "11px",
    });
    hint_text.textContent = "Finish the setting";
    gHint.appendChild(hint_mark);
    gHint.appendChild(hint_text);
    // const join = Dom.svg('line', {
		// 	class: 'sqd-join-pop',
		// 	x1: 241.953 + addon,
		// 	y1: 16,
		// 	x2: 274.953 + addon,
		// 	y2: 16
		// });

    // const triggerHint = Dom.svg("rect", {
    //   class: "sqd-task-rect-triggerhint",
    //   x:266.953 + addon,
    //   y:0.5-3,
    //   height:boxHeight+6,
    //   width: 175,
    //   rx:9,
    //   ry:9
    // });

    // const hint_text = Dom.svg("text", {
    //   x: 276.953 + addon,
    //   y: 17,
    //   class: "sqd-task-text",
    // });
    // hint_text.textContent = "Please set up your trigger"

    // gHint.appendChild(join);
    // gHint.appendChild(triggerHint);
    // gHint.appendChild(hint_text);
    

    const rect = Dom.svg("rect", {
      x: 0.5 + addon,
      y: 0.5,
      class: `sqd-task-rect-${step.name}`,
      width: 258,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    g.insertBefore(rect, text);
    const rectLeft = Dom.svg("rect", {
      x: 0.5 + addon,
      y: 0.5,
      class: `sqd-task-rect-${step.name}`,
      width: textWidth + 5,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    const textRight = Dom.svg("text", {
      // x: ICON_SIZE + 3 * PADDING_X + textWidth - 10,
      x: (textWidth/MIN_TEXT_WIDTH)*48.5 + MIN_TEXT_WIDTH + addon,
      y: boxHeight / 1.7+1,
      class: "sqd-task-text_2",
    });
    if (step.properties["list"]) {
      textRight.textContent = step.properties["list"].toString();
    }
    else {
      textRight.textContent = "To Any List";
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
    var moreUrl;
    const moreDotUrl = "./assets/more-dot.svg"
    if(step.name == "Subscribe" || step.name == "Unsubscribe"){
      moreUrl = "./assets/more2.svg";
    }else{
      moreUrl = "./assets/more4.svg"
    }

    const gmoreIcon = Dom.svg("g", {
      class: "moreIcon-group"
    });
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
      x: 232 + addon,
      y: 5,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    const moreIconDot = moreDotUrl
      ? Dom.svg("image", {
          href: moreDotUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(moreIconDot, {
      class: "moreIconDot",
      x: 236 + addon,
      y: 8,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    gmoreIcon.appendChild(moreIcon);
    gmoreIcon.appendChild(moreIconDot);

    const rightCopyImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const rightCopyImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 60,
      x: 270 + addon,
      y: PADDING_Y - 6,
    });
    Dom.attrs(rightCopyImgContainerCircle, {
      width: 30,
      height: 30,
      rx: 50,
      ry: 50,
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
      class: "moreicon",
      id: `RightChangeIcon-${step.id}`,
      // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 64,
      x: 274 + addon,
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
      // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 46,
      x: 256 + addon,
      y: PADDING_Y + 27,
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
      // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
      x: 260 + addon,
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
      // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 50,
      x: 260 + addon,
      y: PADDING_Y - 40,
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
      // x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 53,
      x: 263 + addon,
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
      // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 89,
      x: 170 + addon,
      y: PADDING_Y - 40,
      style: "fill:#3498DB"
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
      class: "checkIcon-inside",
      // id: `tagUpCheckIcon`,
      // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 93,
      x: 177.4 + addon,
      y: PADDING_Y - 33,
      width: 18,
      height: 18,
    });
    checkImgContainer.appendChild(checkImgContainerCircle);
    checkImgContainer.appendChild(upCheckIcon);
    const deleteImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const deleteImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 41 + 110,
      x: 232 + addon,
      y: PADDING_Y - 40,
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
      // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 44 + 110,
      x: 235 + addon,
      y: PADDING_Y - 37,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    deleteImgContainer.appendChild(deleteImgContainerCircle);
    deleteImgContainer.appendChild(upDeleteIcon);
    upDeleteIcon.addEventListener("mousedown", function(){
      deleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
      upDeleteIcon.setAttribute("href", "./assets/delete2.svg")
    });
    upDeleteIcon.addEventListener("mouseup", function(){
      deleteImgContainerCircle.setAttribute("style", "fill:white");
      upDeleteIcon.setAttribute("href", "./assets/delete.svg")
    });

    const copyImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const copyImgContainerCircle = Dom.svg("rect", {
      class: "sqd-task-ImgContainerCircle",
      // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 98,
      x: 201 + addon,
      y: PADDING_Y - 40,
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
      // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 102,
      x: 205 + addon,
      y: PADDING_Y - 37,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    copyImgContainer.appendChild(copyImgContainerCircle);
    copyImgContainer.appendChild(upchangeIcon);
    
    //Zi:dropdown_img
    const downImgContainer = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const downUrl = "./assets/list_down.png";
    const downIcon = downUrl
      ? Dom.svg("image", {
          href: downUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(downIcon, {
      x: 181 + addon,
      y: PADDING_Y+50,
    });
    downImgContainer.appendChild(downIcon);

    const downImgContainer1 = Dom.svg("g", {
      class: "sqd-task-deleteImgContainer",
    });
    const downIcon1 = downUrl
      ? Dom.svg("image", {
          href: downUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(downIcon1, {
      // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 78,
      x: 181 + addon,
      y: PADDING_Y+85,
    });
    downImgContainer1.appendChild(downIcon1);

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
      x: 0.5 + addon,
      y: 0.5,
      class: "sqd-task-rect-pop",
      width: 50,
      height: 25,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(reminder1, {
      id: `reminder1${Date.now()}`,
      x: 300.95 + addon,
      y: PADDING_Y - 35,
    });
    const reminderText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: 313.45 + addon,
      y: PADDING_Y - 23,
    });
    Dom.attrs(reminderText1, {
      //class: 'sqd-hidden',
      id: `reminderText${Date.now()}`,
    });
    reminderText1.textContent = "Edit";
    const reminder2 = Dom.svg("rect", {
      x: 0.5 + addon,
      y: 0.5,
      class: "sqd-task-rect-pop",
      width: 50,
      height: 25,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(reminder2, {
      id: `reminder2${Date.now()}`,
      x: 310.95 + addon,
      y: PADDING_Y,
    });

    const reminderText2 = Dom.svg("text", {
      class: "sqd-task-text",
      x: 320.95 + addon,
      y: PADDING_Y + 12,
    });
    Dom.attrs(reminderText2, {
      //class: 'sqd-hidden',
      id: `reminderText2${Date.now()}`,
    });
    reminderText2.textContent = "Reset";
    const reminder3 = Dom.svg("rect", {
      x: 0.5 + addon,
      y: 0.5,
      class: "sqd-task-rect-pop",
      width: 50,
      height: 25,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(reminder3, {
      id: `reminder3${Date.now()}`,
      x: 300.95 + addon,
      y: PADDING_Y + 35,
    });

    const reminderText3 = Dom.svg("text", {
      class: "sqd-task-text",
      x: 307.45 + addon,
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
      x: 0.5 + addon,
      y: 0.5,
      class: `sqd-task-rect-${step.name}`,
      width: 258,
      height: 460,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(rect1, {
      id: `dropdown${Date.now()}`,
    });
    
    const nameText = Dom.svg("text", {
      class: "sqd-task-text",
      x: PADDING_X+10 + addon,
      y: 1.5 * boxHeight+15,
    });
    Dom.attrs(nameText, {
      //class: 'sqd-hidden',
      id: `dropdownword1${Date.now()}`,
    });
    const nameText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: PADDING_X+10 + addon,
      y: 2 * boxHeight+35,
    });
    Dom.attrs(nameText1, {
      //class: 'sqd-hidden',
      id: `dropdownword2${Date.now()}`,
    });
    nameText.textContent = "Select List";
    nameText1.textContent = "Runs";
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
      width: 100,
      height: 20,
      class: "option select-field",
      fill: "#fff",
      stroke: "#BFBFBF",
      rx:"4", 
      ry:"4",
      x: ICON_SIZE + 5 * PADDING_X+17 + addon,
      y: 1.2 * boxHeight+15,
    });
    const dropdownBoxShape1 = Dom.svg("rect", {
      width: 100,
      height: 20,
      class: "option select-field",
      fill: "#fff",
      stroke: "#BFBFBF",
      rx:"4", 
      ry:"4",
      x: ICON_SIZE + 5 * PADDING_X+17 + addon,
      y: 1.75 * boxHeight+32,
    });

    const dropdownRightButton = Dom.svg("text", {
      class: "sqd-task-text select-field",
      x: ICON_SIZE + 9 * PADDING_X + addon,
      y: 1.35 * boxHeight,
    });
    const dropdownRightButton1 = Dom.svg("text", {
      class: "sqd-task-text select-field",
      x: ICON_SIZE + 9 * PADDING_X + addon,
      y: 1.9 * boxHeight,
    });
    const dropdownBoxInnerText = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 5 * PADDING_X+25 + addon,
      y: 1.4 * boxHeight+18,
    });
    if(step.properties["list"]){
      dropdownBoxInnerText.textContent = step.properties["list"].toString();
    }else{
      dropdownBoxInnerText.textContent = "Any list";
    }

    dropdownBoxInnerText.style.fill = "#BFBFBF";

    const dropdownBoxInnerText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 5 * PADDING_X+25 + addon,
      y: 1.95 * boxHeight+34.5,
    });
    if(step.properties["frequency"]){
      dropdownBoxInnerText1.textContent = step.properties["frequency"].toString();
    }else{
      dropdownBoxInnerText1.textContent = "Once";
    }
    
    dropdownBoxInnerText1.style.fill = "#BFBFBF";

    const dropdownBoxShapeAfter = Dom.svg("rect", {
      width: 100,
      height: 20,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: ICON_SIZE + 5 * PADDING_X+17 + addon,
      y: 1.2 * boxHeight+15,
      id: `dropdownBoxShape${Date.now()}`,
    });
    
    Dom.attrs(dropdownBoxShapeAfter, {
      opacity: 0,
    });
    const dropdownBoxShape1After = Dom.svg("rect", {
      width: 100,
      height: 20,
      class: "option select-field",
      fill: "#fff",
      stroke: "#a0a0a0",
      x: ICON_SIZE + 5 * PADDING_X+17 + addon,
      y: 1.75 * boxHeight+32,
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

    // Fetch audience list from backend
    const userID = 123; //Need to be changed to current user
    const request = new Request(`http://localhost:8080/dashboard/getAudiencelist/${userID}`, {method: 'GET'});
    let list: string[] = [];
    // Async way to fetch audience list
    const getlist = async ()=> {
      const response = await fetch(request);
      if (response.ok) {
        const val = await response.json();
        modifyDropdown(val);
      }
    };
    
    getlist();
    
    // Options
    const modifyDropdown = function (list: string[]){
      const dropdownBoxBottomShaperec = Dom.svg("rect", {
        width:100,
        height:list.length*25,
        fill:"#fff",
        stroke: "#4FCCFC",
        x: ICON_SIZE + 5 * PADDING_X+17 + addon,
        y: 1.75 * boxHeight + 22,
        rx: 4,
        ry: 4
      });
      gSubDropdownboxPop.appendChild(dropdownBoxBottomShaperec);
      
      for (let i = 1; i <= list.length; i++) {
        const dropdownBoxBottomShapeText = Dom.svg("text", {
          class: "sqd-task-text",
          x: ICON_SIZE + 5 * PADDING_X+25 + addon,
          y: 1.4 * boxHeight + 22*i + 27,
        });
        

        dropdownBoxBottomShapeText.textContent = list[i-1];
        const dropdownBoxBottomShapecover = Dom.svg("rect", {
          width: 90,
          height: 20,
          class: "option select-field choice",
          fill: "#fff",
          stroke: "none",
          x: ICON_SIZE + 5 * PADDING_X+22 + addon,
          y: 1.2 * boxHeight + 22*i + 25,
          id: `dropdownBoxBottomShapecover${Date.now()}`,
          rx: 4,
          ry: 4,
        });

        Dom.attrs(dropdownBoxBottomShapecover, {
          opacity: 0.07,
        });
        // Add event listners
        dropdownBoxBottomShapecover.addEventListener("click", function (e) {
          dropdownBoxInnerText.textContent = dropdownBoxBottomShapeText.textContent;
          gSubDropdownboxPop.classList.toggle("sqd-hidden");
          dropdownBoxShape.style.stroke="#BFBFBF";
          dropdownBoxInnerText.style.fill = "#BFBFBF";
          downIcon.setAttribute("href", "./assets/list_down.png");
        });
        gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText);
      // gSubDropdownboxPop.insertBefore(
      //    dropdownBoxBottomShape,
      //   dropdownBoxBottomShapeText
      // );
      gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover);
      }
    }

    // Run time choices
    list = ['Once','Recurring'];
    const dropdownBoxBottomShape1rec = Dom.svg("rect", {
      width:100,
      height:list.length*25,
      fill:"#fff",
      stroke: "#4FCCFC",
      x: ICON_SIZE + 5 * PADDING_X+17 + addon,
      y: 1.75 * boxHeight + 57,
      rx: 4,
      ry: 4
    });
    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1rec);

    // Options
    for (let i = 1; i <= list.length; i++) {
      // const dropdownBoxBottomShape1 = Dom.svg("rect", {
      //   width: 100,
      //   height: 20,
      //   class: "option select-field",
      //   fill: "#fff",
      //   stroke: "#a0a0a0",
      //   x: ICON_SIZE + 5 * PADDING_X+17,
      //   y: 1.75 * boxHeight + 15 * i+32,
      // });
  
      const dropdownBoxBottomShape1Text = Dom.svg("text", {
        class: "sqd-task-text",
        x: ICON_SIZE + 5 * PADDING_X+25 + addon,
        y: 1.95 * boxHeight + 20 * i+45,
      });
      dropdownBoxBottomShape1Text.textContent = list[i-1];
      const dropdownBoxBottomShape1cover = Dom.svg("rect", {
        width: 90,
        height: 20,
        class: "option select-field choice",
        fill: "#fff",
        stroke: "none",
        x: ICON_SIZE + 5 * PADDING_X+22 + addon,
        y: 1.75 * boxHeight + 20 * i+42,
        id: `dropdownBoxBottomShape1cover${Date.now()}`,
        rx: 4,
        ry: 4,
      });
      Dom.attrs(dropdownBoxBottomShape1cover, {
        opacity: 0.07,
      });
      
      // Add event listners
      dropdownBoxBottomShape1cover.addEventListener("click", function (e) {
        dropdownBoxInnerText1.textContent = dropdownBoxBottomShape1Text.textContent;
        gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
        dropdownBoxShape1.style.stroke="#BFBFBF";
        dropdownBoxInnerText1.style.fill = "#BFBFBF";
        downIcon1.setAttribute("href", "./assets/list_down.png");

        if(dropdownBoxInnerText1.textContent == "Once"){
          gWeeks.classList.add("sqd-hidden");
          gOnce.classList.remove("sqd-hidden");
          rect1.setAttribute("height", "460");
        }else{
          gOnce.classList.add("sqd-hidden");
          gWeeks.classList.remove("sqd-hidden");
          rect1.setAttribute("height", "440");
        }
        
      });

      // Append Child
      gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
      // gSubDropdownbox1Pop.insertBefore(
      //   dropdownBoxBottomShape1,
      //   dropdownBoxBottomShape1Text
      // );
      gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover);
    }
    

    //implement the once choice of time-trigger
  //   let today = new Date();
  //   let yyyy = today.getFullYear();
  //   let dd = today.getDate();
  //   let ddd ='';
  //   let mm = today.getMonth()+1;
  //   let mmm = '';
  //   let hh = today.getHours();
  //   let hhh = '';
  //   let nn = today.getMinutes();
  //   let nnn = '';
  //   if (dd < 10) {
  //     ddd = '0' + dd;
  //   }else{
  //     ddd = dd.toString();
  //   }
   
  //   if (mm < 10) {
  //     mmm = '0' + mm;
  //   }else{
  //     mmm = mm.toString();
  //   }
  //   if (hh < 10) {
  //    hhh = '0' + hh;
  //   } else{
  //    hhh = hh.toString();
  //   }
  //   if (nn < 10) {
  //     nnn = '0' + nn;
  //    } else{
  //     nnn = nn.toString();
  //    }
   
  //  let todayStr = yyyy + '-' + mmm + '-' + ddd + 'T' + hhh + ':' + nnn;
  //   console.log(todayStr);
    

    const gOnce = Dom.svg("g",{
      class: "sqd-task-group-once",
    });
    const calendarWrapper = Dom.svg("foreignObject",{
      x:3+addon,
      y:2 * boxHeight+40,
      height: 320,
      width: 250,
    })
    const calendarDiv= Dom.element("div", {
      id: 'calendar',
    })
    calendarWrapper.appendChild(calendarDiv);

    let databefore!:string[];
    if(step.properties["send"]){
      databefore = step.properties["send"].toString().split('T');
    }
    
    let OnceDates!:string[];
    //@ts-ignore
    let calendar = new VanillaCalendar(calendarDiv,{
      settings: {
        selection: {
          day: 'multiple',
        },
        range: {
          disablePast: true,
        },
        visibility: {
          weekend: false,
        },
        iso8601: false,
      },
      actions: {
        //@ts-ignore
        clickDay(event, dates) {
          OnceDates = dates;
        },
      },
    });
    if(databefore && databefore.length != 0 && dropdownBoxInnerText1.textContent == "Once"){
      let temp = [...databefore];
      temp.pop();
      OnceDates = temp;
      //@ts-ignore
      calendar = new VanillaCalendar(calendarDiv,{
        settings: {
          selection: {
            day: 'multiple',
          },
          range: {
            disablePast: true,
          },
          selected: {
            dates: temp,
          },
          visibility: {
            weekend: false,
          },
          iso8601: false,
        },
        actions: {
          //@ts-ignore
          clickDay(event, dates) {
            OnceDates = dates;
          },
        },
      });
    }
    calendar.init();

    const calendarBr = Dom.svg("line", {
      x1:addon,
			y1: 2 * boxHeight+327,
			x2: 258+addon,
			y2: 2 * boxHeight+327,
      stroke: "#3FC8FA",
      class: "sqd-calendar-line"
    });
    
    //implement the set time feature
    const gSetTime = Dom.svg("g", {
      class: "sqd-task-group",
    });
    
    const setTimeText = Dom.svg("text", {
      class: "sqd-task-text-settime",
      x: PADDING_X+10 + addon,
      y: 2 * boxHeight+350,
    });
    setTimeText.textContent = "Set time(hour)";

    const setTimeWrapper = Dom.svg("foreignObject",{
      x:PADDING_X+114 + addon,
      y:2 * boxHeight+340,
      height: 30,
      width: 40,
    });
    const setTimeInput = Dom.element("input", {
      class: "settime-input",
      type: "text",
      placeholder: "00",
      maxlength: 2,
    });
    if(databefore &&  databefore.length != 0 && dropdownBoxInnerText1.textContent == "Once"){
      setTimeInput.value = databefore[databefore.length-1].slice(0,2);
    }
    setTimeWrapper.appendChild(setTimeInput);
    
    const setTimeBr = Dom.svg("line", {
      x1: PADDING_X+121 + addon,
			y1: 2 * boxHeight+354,
			x2: PADDING_X+141 + addon,
			y2: 2 * boxHeight+354,
      stroke: "#3FC8FA",
      class: "sqd-calendar-line"
    });

    const setTimeRangeRect = Dom.svg("rect", {
      class: "set-time-rect",
      x:PADDING_X+147 + addon,
      y:2 * boxHeight+338,
      rx: 10,
      ry: 10,
      width: 74,
      height: 20
    });

    const setTimeAmText = Dom.svg("text", {
      class: "sqd-task-text-settime-am",
      x: PADDING_X+159 + addon,
      y: 2 * boxHeight+351,
    });
    setTimeAmText.textContent = "AM";
    const setTimeAmRect = Dom.svg("rect", {
      class: "set-time-rect-m selected",
      x: PADDING_X+150 + addon,
      y: 2 * boxHeight+340,
      rx: 9,
      ry: 9,
      width: 37,
      height: 15.5,
      fill: "#5495d4"
    });

    const setTimePmText = Dom.svg("text", {
      class: "sqd-task-text-settime-pm",
      x: PADDING_X+191 + addon,
      y: 2 * boxHeight+351,
    });
    setTimePmText.textContent = "PM";
    const setTimePmRect = Dom.svg("rect", {
      class: "set-time-rect-m",
      x: PADDING_X+181 + addon,
      y: 2 * boxHeight+340,
      rx: 9,
      ry: 9,
      width: 37,
      height: 15.5,
      fill: "white"
    });

    const setTimeAmRectShape = Dom.svg("rect", {
      class: "set-time-shape",
      x: PADDING_X+150 + addon,
      y: 2 * boxHeight+340,
      rx: 9,
      ry: 9,
      width: 37,
      height: 15.5,
      opacity: 0
    });

    const setTimePmRectShape = Dom.svg("rect", {
      class: "set-time-shape",
      x: PADDING_X+181 + addon,
      y: 2 * boxHeight+340,
      rx: 9,
      ry: 9,
      width: 37,
      height: 15.5,
      opacity: 0
    });

    const setTimeTimeZone = Dom.svg("text", {
      class: "sqd-task-text_3",
      x: PADDING_X+10 + addon,
      y: 2 * boxHeight+377,
    });
    setTimeTimeZone.textContent = "Your Timezone: " + Intl.DateTimeFormat().resolvedOptions().timeZone;

    setTimeInput.addEventListener("change", function(){
      if (parseInt(setTimeInput.value) < 10) {
        if (setTimeInput.value.length === 1) {
          setTimeInput.value = '0' + setTimeInput.value;
        }
      }
    });
    setTimePmRectShape.addEventListener("click", function(){
      if(!setTimePmRect.classList.contains("selected")){
        setTimePmRect.classList.toggle("selected");
        setTimeAmRect.classList.toggle("selected");
        setTimePmText.setAttribute("style", "fill:white");
        setTimePmRect.setAttribute("fill", "#5495d4");
        setTimeAmText.setAttribute("style", "fill:rgb(191, 191, 191)");
        setTimeAmRect.setAttribute("fill", "white");
        gSetTime.insertBefore(setTimeAmRect, setTimePmRect);
      }
    });
    setTimeAmRectShape.addEventListener("click", function(){
      if(!setTimeAmRect.classList.contains("selected")){
        setTimePmRect.classList.toggle("selected");
        setTimeAmRect.classList.toggle("selected");
        setTimeAmText.setAttribute("style", "fill:white");
        setTimeAmRect.setAttribute("fill", "#5495d4");
        setTimePmText.setAttribute("style", "fill:rgb(191, 191, 191)");
        setTimePmRect.setAttribute("fill", "white");
        gSetTime.insertBefore(setTimePmRect, setTimeAmRect);
      }
    });

    gSetTime.appendChild(setTimeText);
    gSetTime.appendChild(setTimeWrapper);
    gSetTime.appendChild(setTimeBr);
    gSetTime.appendChild(setTimeRangeRect);
    gSetTime.appendChild(setTimePmRect);
    gSetTime.appendChild(setTimeAmRect);
    gSetTime.appendChild(setTimePmText);
    gSetTime.appendChild(setTimeAmText);
    gSetTime.appendChild(setTimeAmRectShape);
    gSetTime.appendChild(setTimePmRectShape);
    gSetTime.appendChild(setTimeTimeZone);

    if(databefore && databefore[databefore.length-1].toString().slice(2) == "PM" && dropdownBoxInnerText1.textContent == "Once"){
      setTimePmRect.classList.toggle("selected");
      setTimeAmRect.classList.toggle("selected");
      setTimePmText.setAttribute("style", "fill:white");
      setTimePmRect.setAttribute("fill", "#5495d4");
      setTimeAmText.setAttribute("style", "fill:rgb(191, 191, 191)");
      setTimeAmRect.setAttribute("fill", "white");
      gSetTime.insertBefore(setTimeAmRect, setTimePmRect);
    }

    gOnce.appendChild(calendarWrapper);
    gOnce.appendChild(calendarBr);
    gOnce.appendChild(gSetTime);


    //implement the recurring choice of time-trigger
    const gWeeks = Dom.svg("g", {
      class: "sqd-task-group-week sqd-hidden"
    });
    
    const week_text = Dom.svg("text", {
      x: PADDING_X+10 + addon,
      y: 2 * boxHeight+85,
      class: "sqd-task-text_3",
    });

    week_text.textContent = "Set your delieverable dates:"
    gWeeks.appendChild(week_text);

    for(let i=1;i<8;i++){
      var week = "";

      switch(i){
        case 1:
          week = "Monday";
          break;
        case 2:
          week = "Tuesday";
          break;
        case 3:
          week = "Wednesday";
          break;
        case 4:
          week = "Thursday";
          break;
        case 5:
          week = "Friday";
          break;
        case 6:
          week = "Saturday";
          break;
        case 7:
          week = "Sunday";
          break;
      }

      const gEachWeek = Dom.svg("g", {
        class: `sqd-week-${i}`
      });
      const checkbox = Dom.svg("rect", {
        class: "sqd-week-checkbox",
        x:PADDING_X+10 + addon,
        y:2 * boxHeight+75 +i*28,
        height: 13,
        width: 13,
        rx:5,
        ry:5
      });
      const weekName = Dom.svg("text", {
        x: PADDING_X+35 + addon,
        y: 2 * boxHeight+85 +i*28,
        class: "sqd-task-text-week",
      });
      weekName.textContent = week;
      
      
      const checkbox_img_url = "./assets/check-inside.svg";
      const checkbox_img = Dom.svg("image", {
        href: checkbox_img_url,
      });
      Dom.attrs(checkbox_img, {
        height: 8,
        width:8,
        x: PADDING_X+10 + addon+2.4,
        y: 2 * boxHeight+78 +i*28,
        class: "week-checkbox-img"
      });
      
      const checkboxShape = Dom.svg("rect", {
        x:PADDING_X+10 + addon,
        y:2 * boxHeight+75 +i*28,
        height: 13,
        width: 13,
        rx:5,
        ry:5,
        opacity: 0,
        class: "checkbox-shape"
      });
      
      checkboxShape.addEventListener("click", function(e){
        if(!gEachWeek.classList.contains("selected")){
          gEachWeek.classList.add("selected");
          Dom.attrs(checkbox, {
            style: "stroke:#5495d4;fill:#5495d4",
          });
          Dom.attrs(weekName, {
            style: "fill:#5495d4"
          });
        }else{
          gEachWeek.classList.remove("selected");
          Dom.attrs(checkbox, {
            style: "stroke:#949CA0;fill:white",
          });

          Dom.attrs(weekName, {
            style: "fill:#949CA0"
          });
        }
      });
       
      const gTime = Dom.svg("g", {
        class: "sqd-task-group"
      });
      const timeBox = Dom.svg("rect", {
        x: PADDING_X+120 + addon,
        y: 2 * boxHeight+75 +i*28,
        height: 14,
        width: 40,
        class: "time-box",
        rx:3,
        ry:3
      });
      const timeBoxShape = Dom.svg("rect", {
        x: PADDING_X+120 + addon,
        y: 2 * boxHeight+75 +i*28,
        height: 14,
        width: 40,
        rx:3,
        ry:3,
        opacity: 0,
        class: "checkbox-shape"
      });
      const timeText = Dom.svg("text", {
        x: PADDING_X+132 + addon,
        y: 2 * boxHeight+85.5 +i*28,
        class: "sqd-task-text-week2"
      });
      timeText.textContent = "12";

      const time_box_url = "./assets/down.svg";
      const timeicon = Dom.svg("image", {
        x:PADDING_X+150 + addon,
        y:2 * boxHeight+79 +i*28,
        class: "week-drop-icon",
        href: time_box_url,
        height: 7,
        width: 7
      });

      gTime.appendChild(timeBox);
      gTime.appendChild(timeText);
      gTime.appendChild(timeicon);
      gTime.appendChild(timeBoxShape);

      const gTimeRange = Dom.svg("g", {
        class: "sqd-task-group"
      })
      const RangeBox = Dom.svg("rect", {
        x: PADDING_X+170 + addon,
        y: 2 * boxHeight+75 +i*28,
        height: 14,
        width: 40,
        class: "time-box",
        rx:3,
        ry:3
      });
      const RangeBoxShape = Dom.svg("rect", {
        x: PADDING_X+170 + addon,
        y: 2 * boxHeight+75 +i*28,
        height: 14,
        width: 40,
        rx:3,
        ry:3,
        opacity: 0,
        class: "checkbox-shape"
      });
      const rangeText = Dom.svg("text", {
        x: PADDING_X+177 + addon,
        y: 2 * boxHeight+85.5 +i*28,
        class: "sqd-task-text-week3"
      });
      rangeText.textContent = "AM";

      const range_box_url = "./assets/down.svg";
      const rangeicon = Dom.svg("image", {
        x:PADDING_X+200 + addon,
        y:2 * boxHeight+79 +i*28,
        class: "week-drop-icon",
        href: range_box_url,
        height: 7,
        width: 7
      });
      let weekTemp = '';
      if(databefore){
        for(let h=0;h<databefore.length;h++){
          if(databefore[h].includes(week)){
            weekTemp = databefore[h];
            gEachWeek.classList.add("selected");
            Dom.attrs(checkbox, {
              style: "stroke:#5495d4;fill:#5495d4",
            });
            Dom.attrs(weekName, {
              style: "fill:#5495d4"
            });
            timeText.textContent = weekTemp.slice(-4,-2);
            rangeText.textContent = weekTemp.slice(-2);
          }
        }
      }

      gTimeRange.appendChild(RangeBox);
      gTimeRange.appendChild(rangeText);
      gTimeRange.appendChild(rangeicon);
      gTimeRange.appendChild(RangeBoxShape);
      
      //implement the dropdown menu for time
      const gTimeDropdow = Dom.svg("g", {
        class: "sqd-task-group sqd-hidden"
      });
      const timeDropRect = Dom.svg("rect", {
        x: PADDING_X+120 + addon,
        y: 2 * boxHeight+93 +i*28,
        height: 173,
        width: 40,
        rx:3,
        ry:3,
        class: "time-drop-rect"
      });
      
      gTimeDropdow.appendChild(timeDropRect);

      for(let k=1;k<13;k++){
        const timeSelectBox = Dom.svg("rect", {
          x: PADDING_X+122 + addon,
          y: 2 * boxHeight+81 +i*28 +k*14,
          height: 14,
          width: 36,
          class: "week-time-drop-rect",
          rx:2,
          ry:2
        });
        const timeSelectBoxShape = Dom.svg("rect", {
          x: PADDING_X+122 + addon,
          y: 2 * boxHeight+82 +i*28 +k*14,
          height: 12,
          width: 36,
          class: "week-time-drop-rect",
          rx:3,
          ry:3,
          opacity: 0
        });

        const timeSelectText = Dom.svg("text", {
          x: PADDING_X+135 + addon,
          y: 2 * boxHeight+92.5 +i*28 +k*14,
          class: "sqd-task-text-week4",
        });
        timeSelectText.textContent =`${k}`;

        if(k>9){
          Dom.attrs(timeSelectText, {
            x:PADDING_X+133 + addon
          });
        }

        timeSelectBoxShape.addEventListener("mouseover", function(){
          timeSelectBox.setAttribute("style", "fill:#EDF5FF")
        });
        timeSelectBoxShape.addEventListener("mouseout", function(){
          timeSelectBox.setAttribute("style", "fill:white")
        })
        timeSelectBoxShape.addEventListener("click", function(){
          gTimeDropdow.classList.add("sqd-hidden");
          Dom.attrs(timeBox, {
            style: "stroke:#949CA0"
          });
          Dom.attrs(timeText, {
            style: "fill:#949CA0"
          });
          timeicon.setAttribute("href", "./assets/down.svg");
          if(k<10){
            timeText.textContent = `0${k}`;
          }else{
            timeText.textContent = `${k}`;
          }
        });
        
        gTimeDropdow.appendChild(timeSelectBox);
        gTimeDropdow.appendChild(timeSelectText);
        gTimeDropdow.appendChild(timeSelectBoxShape);
      }

      //implement the dropdown for time range
      const gRangeDropdow = Dom.svg("g", {
        class: "sqd-task-group sqd-hidden"
      });
      const RangeDropRect = Dom.svg("rect", {
        x: PADDING_X+170 + addon,
        y: 2 * boxHeight+93 +i*28,
        height: 33,
        width: 40,
        rx:3,
        ry:3,
        class: "time-drop-rect"
      });
      
      gRangeDropdow.appendChild(RangeDropRect);

      for(let m=1;m<3;m++){
        const rangeSelectBox = Dom.svg("rect", {
          x: PADDING_X+172 + addon,
          y: 2 * boxHeight+81 +i*28 +m*14,
          height: 14,
          width: 36,
          class: "week-time-drop-rect",
          rx:2,
          ry:2
        });
        const rangeSelectBoxShape = Dom.svg("rect", {
          x: PADDING_X+172 + addon,
          y: 2 * boxHeight+82 +i*28 +m*14,
          height: 12,
          width: 36,
          class: "week-time-drop-rect",
          rx:3,
          ry:3,
          opacity: 0
        });

        const rangeSelectText = Dom.svg("text", {
          x: PADDING_X+177 + addon,
          y: 2 * boxHeight+92.5 +i*28 +m*14,
          class: "sqd-task-text-week5",
        });
        if(m==1){
          rangeSelectText.textContent = "AM";
        }else{
          rangeSelectText.textContent = "PM";
        }

        rangeSelectBoxShape.addEventListener("mouseover", function(){
          rangeSelectBox.setAttribute("style", "fill:#EDF5FF")
        });
        rangeSelectBoxShape.addEventListener("mouseout", function(){
          rangeSelectBox.setAttribute("style", "fill:white")
        })
        rangeSelectBoxShape.addEventListener("click", function(){
          gRangeDropdow.classList.add("sqd-hidden");
          Dom.attrs(RangeBox, {
            style: "stroke:#949CA0"
          });
          Dom.attrs(rangeText, {
            style: "fill:#949CA0"
          });
          rangeicon.setAttribute("href", "./assets/down.svg");
          if(m==1){
            rangeText.textContent = "AM";
          }else{
            rangeText.textContent = "PM";
          };
        });

        gRangeDropdow.appendChild(rangeSelectBox);
        gRangeDropdow.appendChild(rangeSelectText);
        gRangeDropdow.appendChild(rangeSelectBoxShape);
      }

      timeBoxShape.addEventListener("click", function(){
        gTimeDropdow.classList.toggle("sqd-hidden");

        if(!gTimeDropdow.classList.contains("sqd-hidden")){
          Dom.attrs(timeBox, {
            style: "stroke:#5495d4"
          });
          Dom.attrs(timeText, {
            style: "fill:#000"
          });
          timeicon.setAttribute("href", "./assets/upArrow.svg")
        }else{
          Dom.attrs(timeBox, {
            style: "stroke:#949CA0"
          });
          Dom.attrs(timeText, {
            style: "fill:#949CA0"
          });
          timeicon.setAttribute("href", "./assets/down.svg")
        }
      });

      RangeBoxShape.addEventListener("click", function(){
        gRangeDropdow.classList.toggle("sqd-hidden");

        if(!gRangeDropdow.classList.contains("sqd-hidden")){
          Dom.attrs(RangeBox, {
            style: "stroke:#5495d4"
          });
          Dom.attrs(rangeText, {
            style: "fill:#000"
          });
          rangeicon.setAttribute("href", "./assets/upArrow.svg")
        }else{
          Dom.attrs(RangeBox, {
            style: "stroke:#949CA0"
          });
          Dom.attrs(rangeText, {
            style: "fill:#949CA0"
          });
          rangeicon.setAttribute("href", "./assets/down.svg")
        }
      });

      gEachWeek.appendChild(gTime);
      gEachWeek.appendChild(gTimeRange);
      gEachWeek.appendChild(checkbox);
      gEachWeek.appendChild(checkbox_img);
      gEachWeek.appendChild(checkboxShape);
      gEachWeek.appendChild(weekName);
      gEachWeek.appendChild(gTimeDropdow);
      gEachWeek.appendChild(gRangeDropdow);
      gWeeks.appendChild(gEachWeek);
      gWeeks.insertBefore(gEachWeek, gWeeks.firstChild);
    }
    
    //implement of end date section
    const gEndDate = Dom.svg("g", {
      class: "sqd-task-group"
    });

    const endDateText = Dom.svg("text", {
      x:PADDING_X+10 + addon,
      y:2 * boxHeight+316,
    });
    endDateText.textContent = "End Date";

    const monthWrapper = Dom.svg("foreignObject", {
      x:PADDING_X+80 + addon,
      y:2 * boxHeight+300,
      height: 27,
      width: 35,
    });
    const monthInput = Dom.element("input", {
      class: "date-input",
      type: "text",
      placeholder: "MM",
      x:0.5,
      y:0.5,
      maxlength: 2,
    });
    monthWrapper.appendChild(monthInput);

    const dateWrapper = Dom.svg("foreignObject", {
      x:PADDING_X+120 + addon,
      y:2 * boxHeight+300,
      height: 27,
      width: 35,
    });
    const dateInput = Dom.element("input", {
      class: "date-input",
      type: "text",
      placeholder: "DD",
      x:0.5,
      y:0.5,
      maxlength: 2,
    });
    dateWrapper.appendChild(dateInput);

    const yearWrapper = Dom.svg("foreignObject", {
      x:PADDING_X+160 + addon,
      y:2 * boxHeight+300,
      height: 27,
      width: 55,
    });
    const yearInput = Dom.element("input", {
      class: "date-input-year",
      type: "text",
      placeholder: "YYYY",
      x:0.5,
      y:0.5,
      maxlength: 4,
    });
    yearWrapper.appendChild(yearInput);
    
    if(databefore && dropdownBoxInnerText1.textContent == "Recurring"){
      if(databefore.length != 0){
        const databeforeEndDate = databefore[databefore.length-1].split(':')[1].split('/');
        monthInput.value = databeforeEndDate[0];
        dateInput.value = databeforeEndDate[1];
        yearInput.value = databeforeEndDate[2];
      }
    }

    // Convert monthInput to two digits
    monthInput.addEventListener("change", function(){
      if (parseInt(monthInput.value) < 10) {
        if (monthInput.value.length === 1) {
          monthInput.value = '0' + monthInput.value;
        }
      }
    });

    // Convert dateInput to two digits
    dateInput.addEventListener("change", function(){
      if (parseInt(dateInput.value) < 10) {
        if (dateInput.value.length === 1) {
          dateInput.value = '0' + dateInput.value;
        }
      }
    });

    gEndDate.appendChild(endDateText);
    gEndDate.appendChild(monthWrapper);
    gEndDate.appendChild(dateWrapper);
    gEndDate.appendChild(yearWrapper);

    const timezone = Dom.svg("text", {
      x:PADDING_X+10 + addon,
      y:2 * boxHeight+345,
      class: "sqd-task-text_3"
    })
    timezone.textContent = "Your Timezone: " + Intl.DateTimeFormat().resolvedOptions().timeZone;

    gWeeks.insertBefore(gEndDate, gWeeks.firstChild);
    gWeeks.insertBefore(timezone,gWeeks.firstChild);

    if(step.properties["frequency"] == "Once"){
      gOnce.classList.remove("sqd-hidden");
      if(!gWeeks.classList.contains("sqd-hidden")){
        gWeeks.classList.add("sqd-hidden");
        rect1.setAttribute("height", "460");
      }
    }else if (step.properties["frequency"] == "Recurring"){
      gWeeks.classList.remove("sqd-hidden");
      if(!gOnce.classList.contains("sqd-hidden")){
        gOnce.classList.add("sqd-hidden");
      }
      rect1.setAttribute("height", "440");
    }
    
    gDropdown.appendChild(gOnce);
    gDropdown.appendChild(gWeeks);
    gSubDropdownbox.appendChild(dropdownRightButton);
    gSubDropdownbox1.appendChild(dropdownRightButton1);
    gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButton);
    gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButton1);
    gSubDropdownbox.appendChild(dropdownBoxInnerText);
    gSubDropdownbox1.appendChild(dropdownBoxInnerText1);
    gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
    gSubDropdownbox1.appendChild(dropdownBoxShape1After);
    gSubDropdown.appendChild(gSubDropdownbox);
    gSubDropdown.appendChild(downImgContainer);
    gSubDropdown.appendChild(gSubDropdownboxPop);
    gSubDropdown1.appendChild(gSubDropdownbox1);
    gSubDropdown1.appendChild(gSubDropdownbox1Pop);
    gSubDropdown1.appendChild(downImgContainer1);
    gDropdown.appendChild(gSubDropdown1);
    gDropdown.appendChild(gSubDropdown);
    g.appendChild(gHint);
    g.appendChild(gmoreIcon);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);
    g.insertBefore(gDropdown, rect)
    g.appendChild(gRightPop3Reminder);
    g.appendChild(gUpPop3);
    g.appendChild(setUpReminder);

    let if_hintpop = true;
    if(Object.keys(step.properties).length == 0){
      if_hintpop = true;
    }else{
      if_hintpop = false;
      gHint.classList.toggle("sqd-hidden");
    }
    // Add EventListeners
    gmoreIcon.addEventListener("click", function (e) {
      e.stopPropagation();

      if(gDropdown.classList.contains("sqd-hidden")){
        gRightPop3.classList.toggle("sqd-hidden");
      }else{
        gDropdown.classList.toggle("sqd-hidden");
        gUpPop3.classList.toggle("sqd-hidden");
        gRightPop3.classList.toggle("sqd-hidden");
      }
      gHint.classList.add("sqd-hidden");
      if_hintpop = false;
    });

    gmoreIcon.addEventListener("mouseover", function(){
      if(if_hintpop){
        gHint.classList.remove("sqd-hidden");
      }
    });

    gmoreIcon.addEventListener("mouseout", function(){
      if(if_hintpop){
        gHint.classList.add("sqd-hidden");
      }
    });
    
    // Edit
    editIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      gRightPop3.classList.toggle("sqd-hidden");
      gSubDropdown.classList.remove("sqd-hidden");
      gSubDropdown1.classList.remove("sqd-hidden");
    });

    upCheckIcon.addEventListener("click", function(e){
      e.stopPropagation();
      let ifselected = false;
      let weekAndTime:string = '';
      step.properties["send"] = ""; 
      step.properties["timezone"] = ""; 
      step.properties["list"] = ""; 
      step.properties["frequency"] = ""; 

      if(dropdownBoxInnerText1.textContent == "Recurring"){
        for(let i=2;i<9;i++){
          if(gWeeks.children[i].classList.contains("selected")){
            weekAndTime += `${gWeeks.children[i].children[5].textContent}`+`${gWeeks.children[i].children[0].children[1].textContent}`+`${gWeeks.children[i].children[1].children[1].textContent},`;
            ifselected = true;
          }
        }
        if(ifselected == false){
          alert("please select at least one weekday");
          return;
        }
        const d = new Date();
        let todayMonth = d.getMonth()+1;
        let todayYear = d.getFullYear();
        let todayDate = d.getDate();
        //@ts-ignore
        let inputMonth = parseInt(document.getElementsByClassName("date-input")[0].value);
        //@ts-ignore
        let inputDate = parseInt(document.getElementsByClassName("date-input")[1].value);
        //@ts-ignore
        let inputYear = parseInt(document.getElementsByClassName("date-input-year")[0].value);

        if(inputYear < todayYear || isNaN(inputYear)){
          alert("please input right year of end date");
          return;
        }
        if((inputMonth < todayMonth && inputYear == todayYear) || inputMonth > 12 || inputMonth < 1 || isNaN(inputMonth)){
          alert("please input right month of end date");
          return;
        }
        //@ts-ignore
        if(isNaN(inputDate) || (inputDate < todayDate && inputMonth == todayMonth && inputYear == todayYear)){
          alert("please input right date of end date");
          return;
        }
        let lastDayOfMonth = new Date(inputYear, inputMonth, 0);
        if(inputDate > lastDayOfMonth.getDate()){
          alert("please input right date of end date");
          return;
        }
        //@ts-ignore
        step.properties["send"] = weekAndTime + 'End date:' + `${document.getElementsByClassName("date-input")[0].value}` + '/' + `${document.getElementsByClassName("date-input")[1].value}` + '/' + `${document.getElementsByClassName("date-input-year")[0].value}`;
        // Set timezone info
        step.properties["timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }else{
        if((OnceDates && OnceDates.length == 0) || !OnceDates){
          alert("please select a day");
          return;
        } else {
          step.properties["send"] = '';
          for(let k=0;k<OnceDates.length;k++){
            step.properties["send"] += OnceDates[k] + "T";
          }
          
          if (parseInt(setTimeInput.value) > 0 && parseInt(setTimeInput.value) < 13 && Number.isInteger(parseInt(setTimeInput.value))) {
            // Validate hours
            let currentDate = new Date();
            let currentHours = currentDate.getHours();
            for (let dateString of OnceDates) {
              let parts = dateString.split('-'); // Split the string into parts.
              let year = parseInt(parts[0]);
              let month = parseInt(parts[1]);
              let day = parseInt(parts[2]);
              if (year === currentDate.getFullYear()
                && month === currentDate.getMonth() + 1
                && day === currentDate.getDate()
              )
              {
                let h = parseInt(setTimeInput.value);
                if (setTimeAmRect.classList.contains("selected")) {
                  if (currentHours >= 12 || h <= currentHours || (h === 12 && currentHours === 0)) {
                    alert("please enter correct hour");
                    return;
                  }
                } else {
                  if (h != 12) {
                    h += 12;
                  }
                  if (h <= currentHours) {
                    alert("please enter correct hour");
                    return;
                  }
                }
              }
            }

            step.properties["send"] += setTimeInput.value + ':00';

            if(setTimeAmRect.classList.contains("selected")){
              step.properties["send"] += "AM";
            }else{
              step.properties["send"] += "PM";
            }
            // Set timezone info
            step.properties["timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
          }else{
            alert("please enter correct hour");
            return;
          }
        }
      }

      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      //@ts-ignore
      step.properties["list"] = dropdownBoxInnerText.textContent;
      textRight.textContent = dropdownBoxInnerText.textContent;
      //@ts-ignore
      step.properties["frequency"] = dropdownBoxInnerText1.textContent;

      step.updatedAt = new Date();
    });
    upCheckIcon.addEventListener("mousedown", function(e){
      e.stopPropagation();
      checkImgContainerCircle.setAttribute("style", "fill:#0C67A5");
    });
    upCheckIcon.addEventListener("mouseup", function(e){
      e.stopPropagation();
      checkImgContainerCircle.setAttribute("style", "fill:#3498DB");
    });
    
    upchangeIcon.addEventListener("mousedown", function(){
      copyImgContainerCircle.setAttribute("style", "fill:#5495d4");
      upchangeIcon.setAttribute("href", "./assets/change2.svg")
    });
    upchangeIcon.addEventListener("mouseup", function(){
      copyImgContainerCircle.setAttribute("style", "fill:white");
      upchangeIcon.setAttribute("href", "./assets/change.svg")
    });
    upchangeIcon.addEventListener("click", function(e){
      e.stopPropagation();
      // if_hintpop = true;
      // gHint.setAttribute("visibility", "visible");

      const dialogBox = Dom.element("dialog", {
        class: "confirm-dialog",
        id: "dialog-box",
      });
    
      const title = Dom.element("h3", {
        class: "confirm-dialog-content",
      });
      const title2 = Dom.element("h3", {
        class: "confirm-dialog-content-warning",
      });
      const form = Dom.element("form", {
        method: "dialog",
        id: "dialog-form",
      });

      title.innerHTML = "Are you sure you want to<br>&nbsp&nbsp&nbsp&nbsp&nbspchange the trigger?";
      title2.innerHTML = "This will clear all your settings";

      dialogBox.appendChild(title);
      dialogBox.appendChild(title2);

      const btn1 = Dom.element("button", {
        type: "submit",
        class: "popup-button"
      });
      btn1.innerText = "Confirm";
      form.appendChild(btn1);
      const btn2 = Dom.element("button", {
        type: "submit",
        class: "popup-button2"
      });
      btn2.innerText = "Cancel";
      form.appendChild(btn2);

      const designer = document.getElementById("designer");
      designer?.appendChild(dialogBox);
      dialogBox.appendChild(form);

      if (typeof dialogBox.showModal === "function") {
        dialogBox.showModal();
      } else {
        prompt("Wrong window", "ok");
      }

      btn2.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const designer = document.getElementById("designer");
        while (designer?.childNodes[1]) {
          designer?.removeChild(designer.childNodes[1]);
        }
      });

      btn1.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        

        textRight.textContent = "To Any List"
        dropdownBoxInnerText.textContent = "Any list";
        
        calendar.settings.selected.dates = '';
        calendar.update();
        setTimeInput.value = '';
        dateInput.value = '';
        monthInput.value = '';
        yearInput.value = '';

        for(let i=1;i<8;i++){
          let checkWeek = document.getElementsByClassName(`sqd-week-${i}`);

          if(checkWeek[0].classList.contains('selected')){
            checkWeek[0].children[0].children[1].textContent = '12';
            checkWeek[0].children[1].children[1].textContent = 'AM'
            checkWeek[0].children[5].setAttribute("style", "color:#949CA0");
            checkWeek[0].children[2].setAttribute("style", "fill:white;stroke:#949CA0");
          }
        }
        
        step.properties["send"] = ''; 
        
        const designer = document.getElementById("designer");
        while (designer?.childNodes[1]) {
          designer?.removeChild(designer.childNodes[1]);
        }
      });
    });

    changeIcon.addEventListener("click", function(e){
      e.stopPropagation();

      const dialogBox = Dom.element("dialog", {
        class: "confirm-dialog",
        id: "dialog-box",
      });
    
      const title = Dom.element("h3", {
        class: "confirm-dialog-content",
      });
      const title2 = Dom.element("h3", {
        class: "confirm-dialog-content-warning",
      });
      const form = Dom.element("form", {
        method: "dialog",
        id: "dialog-form",
      });

      title.innerHTML = "Are you sure you want to<br>&nbsp&nbsp&nbsp&nbsp&nbspchange the trigger?";
      title2.innerHTML = "This will clear all your settings";

      dialogBox.appendChild(title);
      dialogBox.appendChild(title2);

      const btn1 = Dom.element("button", {
        type: "submit",
        class: "popup-button"
      });
      btn1.innerText = "Confirm";
      form.appendChild(btn1);
      const btn2 = Dom.element("button", {
        type: "submit",
        class: "popup-button2"
      });
      btn2.innerText = "Cancel";
      form.appendChild(btn2);

      const designer = document.getElementById("designer");
      designer?.appendChild(dialogBox);
      dialogBox.appendChild(form);

      if (typeof dialogBox.showModal === "function") {
        dialogBox.showModal();
      } else {
        prompt("Wrong window", "ok");
      }

      btn2.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const designer = document.getElementById("designer");
        while (designer?.childNodes[1]) {
          designer?.removeChild(designer.childNodes[1]);
        }
      });

      btn1.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        textRight.textContent = "To Any List"
        dropdownBoxInnerText.textContent = "Any list";

        calendar.settings.selected.dates = '';
        calendar.update();
        setTimeInput.value = '';
        dateInput.value = '';
        monthInput.value = '';
        yearInput.value = '';

        for(let i=1;i<8;i++){
          let checkWeek = document.getElementsByClassName(`sqd-week-${i}`);

          if(checkWeek[0].classList.contains('selected')){
            checkWeek[0].children[0].children[1].textContent = '12';
            checkWeek[0].children[1].children[1].textContent = 'AM'
            checkWeek[0].children[5].setAttribute("style", "color:#949CA0");
            checkWeek[0].children[2].setAttribute("style", "fill:white;stroke:#949CA0");
          }
        }
        
        step.properties["send"] = ''; 

        
        const designer = document.getElementById("designer");
        while (designer?.childNodes[1]) {
          designer?.removeChild(designer.childNodes[1]);
        }
      });
    });

     // Show hints
     editIcon.addEventListener("mouseover", function(){
      gRightPop3Reminder1.classList.toggle("sqd-hidden");
    });
    editIcon.addEventListener("mouseout", function(){
      gRightPop3Reminder1.classList.toggle("sqd-hidden");
    });
    editIcon.addEventListener("mousedown", function(){
      rightEditImgContainerCircle.setAttribute("style", "fill:#5495d4");
      editIcon.setAttribute("href", "./assets/edit2.svg")
    });
    editIcon.addEventListener("mouseup", function(){
      rightEditImgContainerCircle.setAttribute("style", "fill:white");
      editIcon.setAttribute("href", "./assets/edit.svg")
    });
    changeIcon.addEventListener("mouseover", () => {
      gRightPop3Reminder2.classList.toggle("sqd-hidden");
    });
    changeIcon.addEventListener("mousedown", function(){
      rightCopyImgContainerCircle.setAttribute("style", "fill:#5495d4");
      changeIcon.setAttribute("href", "./assets/change2.svg")
    });
    changeIcon.addEventListener("mouseup", function(){
      rightCopyImgContainerCircle.setAttribute("style", "fill:white");
      changeIcon.setAttribute("href", "./assets/change.svg")
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
    deleteIcon.addEventListener("mousedown", function(){
      rightDeleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
      deleteIcon.setAttribute("href", "./assets/delete2.svg")
    });
    deleteIcon.addEventListener("mouseup", function(){
      rightDeleteImgContainerCircle.setAttribute("style", "fill:white");
      deleteIcon.setAttribute("href", "./assets/delete.svg")
    });

    // Event listeners in Dropdown
    dropdownBoxShapeAfter.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownboxPop.classList.toggle("sqd-hidden");
      if (!gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
        gSubDropdownbox1Pop.classList.remove("sqd-hidden");
      }

      if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
        dropdownBoxShape.style.stroke="#4FCCFC";
        downIcon.setAttribute("href", "./assets/list_up.png");
        dropdownBoxInnerText.style.fill = "#43A2E3";
      }else{
        dropdownBoxShape.style.stroke="#BFBFBF";
        downIcon.setAttribute("href", "./assets/list_down.png");
        dropdownBoxInnerText.style.fill = "#BFBFBF";
      }
    });

    dropdownBoxShape1After.addEventListener("click", function (e) {
      e.stopPropagation();
      gSubDropdownbox1Pop.classList.toggle("sqd-hidden");
      if (!gSubDropdownboxPop.classList.contains("sqd-hidden")) {
        gSubDropdownboxPop.classList.remove("sqd-hidden");
      }

      if (!gSubDropdownbox1Pop.classList.contains("sqd-hidden")) {
        dropdownBoxShape1.style.stroke="#4FCCFC";
        downIcon1.setAttribute("href", "./assets/list_up.png");
        dropdownBoxInnerText1.style.fill = "#43A2E3";
      }else{
        dropdownBoxShape1.style.stroke="#BFBFBF";
        downIcon1.setAttribute("href", "./assets/list_down.png");
        dropdownBoxInnerText1.style.fill = "#BFBFBF";
      }
    });

    const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
    inputView.setIsHidden(true);
    const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
    outputView.setIsHidden(true)
    const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
    return new TimeTriggerTaskStepComponentView(
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



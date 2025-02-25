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
    var addon = 0;

    switch(step.name){
      case "Subscribe":
        addon = 0;
        break;
      case "Unsubscribe":
        addon = 14.383;
        break;
      case "Place a Purchase":
        addon = 44.2115;
        break;
      case "Abandon Checkout":
        addon = 54.8755;
        break;
    }

    const g = Dom.svg("g", {
      class: `sqd-task-group sqd-type-${step.type}`,
    });
    parent.insertBefore(g, parent.firstChild);

    const boxHeight = ICON_SIZE + PADDING_Y;

    const text = Dom.svg("text", {
      x: PADDING_X/1.5 + 4 + addon,
      y: boxHeight / 1.7-3,
      class: "sqd-task-text",
    });

    text.textContent = step.name;
    g.appendChild(text);
    const textWidth = Math.max(text.getBBox().width+16, MIN_TEXT_WIDTH);
    const boxWidth = ICON_SIZE + 8 * PADDING_X + 2 * textWidth;

    const gTriggerHint = Dom.svg("g", {
      class: "sqd-task-group-pop",
    });

    const join = Dom.svg('line', {
			class: 'sqd-join-pop',
			x1: 241.953 + addon,
			y1: 16,
			x2: 274.953 + addon,
			y2: 16
		});

    const triggerHint = Dom.svg("rect", {
      class: "sqd-task-rect-triggerhint",
      x:266.953 + addon,
      y:0.5-3,
      height:boxHeight+6,
      width: 175,
      rx:9,
      ry:9
    });

    const hint_text = Dom.svg("text", {
      x: 276.953 + addon,
      y: 17,
      class: "sqd-task-text",
    });
    hint_text.textContent = "Please set up your trigger"

    gTriggerHint.appendChild(join);
    gTriggerHint.appendChild(triggerHint);
    gTriggerHint.appendChild(hint_text);
    

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
    const moreDotUrl = "../assets/more-dot.svg"
    if(step.name == "Subscribe" || step.name == "Unsubscribe"){
      moreUrl = "../assets/more2.svg";
    }else{
      moreUrl = "../assets/more3.svg"
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
      upDeleteIcon.setAttribute("href", "../assets/delete2.svg")
    });
    upDeleteIcon.addEventListener("mouseup", function(){
      deleteImgContainerCircle.setAttribute("style", "fill:white");
      upDeleteIcon.setAttribute("href", "../assets/delete.svg")
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
    const downUrl = "../assets/list_down.svg";
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
      height: 3.5 * boxHeight+23,
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

    var url = window.location.pathname;
    var userID;
    if (url.includes("new")) {
      userID = url.slice(5); //Need to be changed to an existing user
    }
    else {
      userID = url.substring(1, url.lastIndexOf('/') + 1);
    }

    // Fetch audience list from backend
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
          downIcon.setAttribute("href", "../assets/list_down.svg");
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
    list = ['Once','Multiple'];
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
        downIcon1.setAttribute("href", "../assets/list_down.svg");
      });

      // Append Child
      gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text);
      // gSubDropdownbox1Pop.insertBefore(
      //   dropdownBoxBottomShape1,
      //   dropdownBoxBottomShape1Text
      // );
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
    gSubDropdown.appendChild(downImgContainer);
    gSubDropdown.appendChild(gSubDropdownboxPop);
    gSubDropdown1.appendChild(gSubDropdownbox1);
    gSubDropdown1.appendChild(gSubDropdownbox1Pop);
    gSubDropdown1.appendChild(downImgContainer1);
    gDropdown.appendChild(gSubDropdown1);
    gDropdown.appendChild(gSubDropdown);
    g.appendChild(gTriggerHint);
    g.appendChild(gmoreIcon);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);
    g.insertBefore(gDropdown, rect)
    g.appendChild(gRightPop3Reminder);
    g.appendChild(gUpPop3);
    g.appendChild(setUpReminder);

    var if_hintpop = true;
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
      gTriggerHint.setAttribute("visibility", "hidden");
      if_hintpop = false;
    });

    gmoreIcon.addEventListener("mouseover", function(){
      if(if_hintpop){
        gTriggerHint.setAttribute("visibility", "hidden");
      }
    });

    gmoreIcon.addEventListener("mouseout", function(){
      if(if_hintpop){
        gTriggerHint.setAttribute("visibility", "visible");
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
      gDropdown.classList.toggle("sqd-hidden");
      gSubDropdown.classList.toggle("sqd-hidden");
      gSubDropdown1.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      if (dropdownBoxInnerText.textContent && dropdownBoxInnerText.textContent != "Select") {
        textRight.textContent = dropdownBoxInnerText.textContent;
        step.properties["list"] = dropdownBoxInnerText.textContent;
      }
      if (dropdownBoxInnerText1.textContent && dropdownBoxInnerText1.textContent != "Select") {
        step.properties["frequency"] = dropdownBoxInnerText1.textContent;
      }
      step.updatedAt = new Date();
    });
    upCheckIcon.addEventListener("mousedown", function(){
      checkImgContainerCircle.setAttribute("style", "fill:#0C67A5");
    });
    upCheckIcon.addEventListener("mouseup", function(){
      checkImgContainerCircle.setAttribute("style", "fill:#3498DB");
    });
    
    upchangeIcon.addEventListener("mousedown", function(){
      copyImgContainerCircle.setAttribute("style", "fill:#5495d4");
      upchangeIcon.setAttribute("href", "../assets/change2.svg")
    });
    upchangeIcon.addEventListener("mouseup", function(){
      copyImgContainerCircle.setAttribute("style", "fill:white");
      upchangeIcon.setAttribute("href", "../assets/change.svg")
    });
    upchangeIcon.addEventListener("click", function(e){
      e.stopPropagation();
      // if_hintpop = true;
      // gTriggerHint.setAttribute("visibility", "visible");

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
      btn1.innerText = "Cancel";
      form.appendChild(btn1);
      const btn2 = Dom.element("button", {
        type: "submit",
        class: "popup-button2"
      });
      btn2.innerText = "Confirm";
      form.appendChild(btn2);

      const designer = document.getElementById("designer");
      designer?.appendChild(dialogBox);
      dialogBox.appendChild(form);

      if (typeof dialogBox.showModal === "function") {
        dialogBox.showModal();
      } else {
        prompt("Wrong window", "ok");
      }

      btn1.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const designer = document.getElementById("designer");
        while (designer?.childNodes[1]) {
          designer?.removeChild(designer.childNodes[1]);
        }
      });

      btn2.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        textRight.textContent = "To Any List"
        dropdownBoxInnerText.textContent = "Any list";
        dropdownBoxInnerText1.textContent = "Once";

        
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
        dropdownBoxInnerText1.textContent = "Once";

        
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
      editIcon.setAttribute("href", "../assets/edit2.svg")
    });
    editIcon.addEventListener("mouseup", function(){
      rightEditImgContainerCircle.setAttribute("style", "fill:white");
      editIcon.setAttribute("href", "../assets/edit.svg")
    });
    changeIcon.addEventListener("mouseover", () => {
      gRightPop3Reminder2.classList.toggle("sqd-hidden");
    });
    changeIcon.addEventListener("mousedown", function(){
      rightCopyImgContainerCircle.setAttribute("style", "fill:#5495d4");
      changeIcon.setAttribute("href", "../assets/change2.svg")
    });
    changeIcon.addEventListener("mouseup", function(){
      rightCopyImgContainerCircle.setAttribute("style", "fill:white");
      changeIcon.setAttribute("href", "../assets/change.svg")
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
      deleteIcon.setAttribute("href", "../assets/delete2.svg")
    });
    deleteIcon.addEventListener("mouseup", function(){
      rightDeleteImgContainerCircle.setAttribute("style", "fill:white");
      deleteIcon.setAttribute("href", "../assets/delete.svg")
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
        downIcon.setAttribute("href", "../assets/list_up.svg");
        dropdownBoxInnerText.style.fill = "#43A2E3";
      }else{
        dropdownBoxShape.style.stroke="#BFBFBF";
        downIcon.setAttribute("href", "../assets/list_down.svg");
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
        downIcon1.setAttribute("href", "../assets/list_up.svg");
        dropdownBoxInnerText1.style.fill = "#43A2E3";
      }else{
        dropdownBoxShape1.style.stroke="#BFBFBF";
        downIcon1.setAttribute("href", "../assets/list_down.svg");
        dropdownBoxInnerText1.style.fill = "#BFBFBF";
      }
    });

    const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
    inputView.setIsHidden(true);
    const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
    outputView.setIsHidden(true)
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
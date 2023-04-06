import { data } from "jQuery";
import { Dom } from "../../core/dom";
import { Vector } from "../../core/vector";
import { TaskStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { InputView } from "../common-views/input-view";
import { OutputView } from "../common-views/output-view";
import { ValidationErrorView } from "../common-views/validation-error-view";
import { ComponentView } from "../component";
//import { TaskStepComponentView } from "./task-step-component-view";
const PADDING_X = 12;
const PADDING_Y = 10;
const MIN_TEXT_WIDTH = 70;
const ICON_SIZE = 22;
const RECT_RADIUS = 15;

export class TimeDelayTaskStepComponentView implements ComponentView {
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
  ): TimeDelayTaskStepComponentView {
    const g = Dom.svg("g", {
      class: `sqd-task-group sqd-type-${step.type}`,
      id: 'sqd-task-timedelay'
    });
    parent.insertBefore(g, parent.firstChild);
    const boxHeight = ICON_SIZE + PADDING_Y;
    const text = Dom.svg("text", {
      x: PADDING_X/2-0.5,
      y: boxHeight / 1.7-2,
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
      y: boxHeight / 1.7+1,
      class: "sqd-task-text_2",
    });
    if (step.properties["date"]) {
      textRight.textContent = step.properties["date"].toString();
    }
    else if(step.properties.waitFor){
      textRight.textContent = step.properties.waitFor.toString();
    } else {
      textRight.textContent = "Select time";
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
    const moreUrl = "./assets/moreDelay.svg";
    const moreIcon = moreUrl
      ? Dom.svg("image", {
          href: moreUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    const moreDotUrl = "./assets/more-dot.svg"
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
        x: 236,
        y: 8,
        width: ICON_SIZE,
        height: ICON_SIZE,
    });
    Dom.attrs(moreIcon, {
      class: "moreIcon",
      // id: `tagMoreIcon`,
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
    const copyUrl = "./assets/copy.svg";
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
      class: "moreicon",
      id: `RightCopyIcon-${step.id}`,
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
      // id: `timeDelayRightEditIcon`,
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
      // x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 89,
      x: 170,
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
      x: 177.4,
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
      x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 41 + 110,
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
    const upCopyIconUrl = "./assets/copy.svg";
    const upCopyIcon = upCopyIconUrl
      ? Dom.svg("image", {
          href: upCopyIconUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(upCopyIcon, {
      class: "moreicon",
      id: `UpCopyIcon-${step.id}`,
      x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 22 + 102,
      y: PADDING_Y - 37,
      width: ICON_SIZE,
      height: ICON_SIZE,
    });
    copyImgContainer.appendChild(copyImgContainerCircle);
    copyImgContainer.appendChild(upCopyIcon);
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
      x: 0.5 ,
      y: 0.5,
      class: "sqd-task-rect-pop",
      width: 50,
      height: 25,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(reminder1, {
      id: `reminder1${Date.now()}`,
      x: 300.95,
      y: PADDING_Y - 35,
    });
    const reminderText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: 313.45,
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
      class: "sqd-task-rect-pop",
      width: 50,
      height: 25,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(reminder2, {
      id: `reminder2${Date.now()}`,
      x: 310.95,
      y: PADDING_Y,
    });

    const reminderText2 = Dom.svg("text", {
      class: "sqd-task-text",
      x: 320.95,
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
      class: "sqd-task-rect-pop",
      width: 50,
      height: 25,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(reminder3, {
      id: `reminder3${Date.now()}`,
      x: 300.95,
      y: PADDING_Y + 35,
    });

    const reminderText3 = Dom.svg("text", {
      class: "sqd-task-text",
      x: 307.45,
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
      y: 0.5,
      class: `sqd-task-rect`,
      width: 258,
      height: 150,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(rect1, {
      id: `dropdown${Date.now()}`,
    });
    const choice1 = Dom.element("input", {
      type: "radio",
      name: "choice",
      value: 1,
    });
    choice1.style.marginLeft = "32px";
    choice1.style.marginTop = "25px";
    const choice1Text = Dom.element("label", {
      class: "sqd-delay-label"
    });
    choice1Text.innerText = "Wait until a specific date";
    const choice1TextNextLine = Dom.element("br");
    const choice2 = Dom.element("input", {
      type: "radio",
      name: "choice",
      value: 2,
    });
    choice2.style.marginLeft = "32px";
    choice2.style.marginTop = "25px";
    const choice2Text = Dom.element("label", {
      class: "sqd-delay-label"
    });
    choice2Text.innerText = "Wait for a duration of time";
    //add input for time delay tag
    var foreignObjectTag = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "foreignObject"
    ); //Create a rect in SVG's namespace
    foreignObjectTag.setAttribute("x", "3"); //Set rect data
    foreignObjectTag.setAttribute("y", "32"); //Set rect data
    foreignObjectTag.setAttribute("width", "250"); //Set rect data
    foreignObjectTag.setAttribute("height", "400"); //Set rect data
  
    //foreignObjectTag.setAttribute("class", "sqd-hidden");
    let databefore!:string[];

    const divTagPickTime = Dom.element("div", {
      id: "calendar",
      class: "sqd-hidden"
    })



  
    let OnceDates!:string[];
    //@ts-ignore
    let calendar = new VanillaCalendar(divTagPickTime,{
      settings: {
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
    if(step.properties["date"] && !step.properties["date"].toString().includes(" ")){
      databefore = step.properties["date"].toString().split(" ");
    }
    if(step.properties["date"] &&  !step.properties["date"].toString().includes(" ")){
      //@ts-ignore
      calendar = new VanillaCalendar(divTagPickTime,{
        settings: {
          range: {
            disablePast: true,
          },
          selected: {
            dates: databefore,
            month: parseInt(databefore[0].split('')[6])-1
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


    const divTagWaitTime = Dom.element("div", {
      class: "sqd-delay-time sqd-hidden"
    })
    
    const waitTimeInput = Dom.element("input", {
      class: "delay-input",
      type: "text",
      placeholder: "Enter",
      x:0.5,
      y:0.5,
      maxlength: 3,
    });
    divTagWaitTime.appendChild(waitTimeInput);

    const gSubDropdown = Dom.svg("g", {
      class: `sqd-task-group sub-dropdown sqd-hidden`,
    });
    if(step.properties["date"]){
      if(!step.properties["date"].toString().includes(" ")){
        databefore = step.properties["date"].toString().split(" ");
        choice1.click();
        rect1.setAttribute("height", "410");
        divTagPickTime.classList.remove("sqd-hidden");
        divTagWaitTime.classList.add("sqd-hidden");
        gSubDropdown.classList.add("sqd-hidden");
      }else{
        databefore = step.properties["date"].toString().split(" ");
        choice2.click();
        rect1.setAttribute("height", "200");
        divTagPickTime.classList.add("sqd-hidden");
        divTagWaitTime.classList.remove("sqd-hidden");
        gSubDropdown.classList.remove("sqd-hidden");
      }
    }
    if(databefore && databefore.length != 1){
      waitTimeInput.value = databefore[0];
    }
    const dropdownBoxShape = Dom.svg("rect", {
      width: 100,
      height: 24,
      class: "delay-box option select-field",
      fill: "#fff",
      stroke: "#BFBFBF",
      rx:"3", 
      ry:"3",
      x: ICON_SIZE + 5 * PADDING_X+42,
      y: 1.2 * boxHeight+102,
    });
    const dropdownBoxInnerText = Dom.svg("text", {
      class: "sqd-task-text_2",
      x: ICON_SIZE + 5 * PADDING_X+52,
      y: 1.2 * boxHeight+117,
    });
    if(databefore && databefore.length != 1){
      dropdownBoxInnerText.textContent = databefore[1].slice(0,-1);
    }else{
      dropdownBoxInnerText.textContent = "Hour";
    }

    const downUrl = "./assets/list_down.svg";
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
      x: ICON_SIZE + 5 * PADDING_X+126,
      y: 1.2 * boxHeight+111,
    });
    const dropdownBoxShapeAfter = Dom.svg("rect", {
      width: 100,
      height: 24,
      class: "delay-box-shape option select-field",
      fill: "#fff",
      stroke: "#BFBFBF",
      rx:"3", 
      ry:"3",
      x: ICON_SIZE + 5 * PADDING_X+42,
      y: 1.2 * boxHeight+102,
      opacity: 0
    });

    const gSubDropdownList = Dom.svg("g", {
      class: "sqd-hidden"
    });

    const gSubDropdownListRect = Dom.svg("rect", {
      width: 100,
      height: 27*4,
      class: "delay-box",
      fill: "#fff",
      stroke: "#4FCCFC",
      rx:"3", 
      ry:"3",
      x: ICON_SIZE + 5 * PADDING_X+42,
      y: 1.2 * boxHeight+131,
    })
    gSubDropdownList.appendChild(gSubDropdownListRect);

    for(let i=0;i<4;i++){
      const gSubDropdownEachRect = Dom.svg("rect", {
        width: 96,
        height: 26,
        class: "delay-list-option",
        fill: "white",
        rx:"3", 
        ry:"3",
        x: ICON_SIZE + 5 * PADDING_X+44,
        y: 1.2 * boxHeight+133+i*26,
      })
      const gSubDropdownEachText = Dom.svg("text", {
        x: ICON_SIZE + 5 * PADDING_X+52,
        y: 1.2 * boxHeight+150+i*26,
      })
      if(i == 0){
        gSubDropdownEachText.textContent = "Hour";
      }else if(i == 1){
        gSubDropdownEachText.textContent = "Day";
      }else if(i == 2){
        gSubDropdownEachText.textContent = "Week";
      }else if(i == 3){
        gSubDropdownEachText.textContent = "Month";
      }
      const gSubDropdownEachRectShape = Dom.svg("rect", {
        width: 96,
        height: 26,
        rx:"3", 
        ry:"3",
        x: ICON_SIZE + 5 * PADDING_X+44,
        y: 1.2 * boxHeight+133+i*26,
        opacity: 0,
        class: "delay-box-shape"
      });

      gSubDropdownEachRectShape.addEventListener("mouseover", function(){
        gSubDropdownEachRect.setAttribute("fill", "#EDF5FF")
      });
      gSubDropdownEachRectShape.addEventListener("mouseout", function(){
        gSubDropdownEachRect.setAttribute("fill", "white")
      });
      gSubDropdownEachRectShape.addEventListener("click", function(){
        gSubDropdownList.classList.toggle("sqd-hidden");
        dropdownBoxShape.setAttribute("stroke", "#BFBFBF");
        dropdownBoxInnerText.textContent = gSubDropdownEachText.textContent;
        downIcon.setAttribute("href", "./assets/list_down.svg");
        dropdownBoxInnerText.setAttribute("style", "fill:#949CA0");
      });

      gSubDropdownList.appendChild(gSubDropdownEachRect);
      gSubDropdownList.appendChild(gSubDropdownEachText);
      gSubDropdownList.appendChild(gSubDropdownEachRectShape);
    }

    dropdownBoxShapeAfter.addEventListener("click", function(){
      gSubDropdownList.classList.toggle("sqd-hidden");
      if(!gSubDropdownList.classList.contains("sqd-hidden")){
        downIcon.setAttribute("href", "./assets/list_up.svg");
        dropdownBoxInnerText.setAttribute("style", "fill:#000");
        dropdownBoxShape.setAttribute("stroke", "#4FCCFC");
      }else{
        downIcon.setAttribute("href", "./assets/list_down.svg");
        dropdownBoxInnerText.setAttribute("style", "fill:#949CA0");
        dropdownBoxShape.setAttribute("stroke", "#BFBFBF");
      }
    });
  

    gSubDropdown.appendChild(dropdownBoxShape);
    gSubDropdown.appendChild(dropdownBoxInnerText);
    gSubDropdown.appendChild(downIcon);
    gSubDropdown.appendChild(dropdownBoxShapeAfter);
    gSubDropdown.appendChild(gSubDropdownList);

    foreignObjectTag.appendChild(choice1);
    foreignObjectTag.appendChild(choice1Text);
    foreignObjectTag.appendChild(choice1TextNextLine);
    foreignObjectTag.appendChild(choice2);
    foreignObjectTag.appendChild(choice2Text);
    foreignObjectTag.appendChild(divTagPickTime);
    foreignObjectTag.appendChild(divTagWaitTime);
    gDropdown.appendChild(rect1);
    gDropdown.appendChild(foreignObjectTag);
    gDropdown.appendChild(gSubDropdown);

    choice1.addEventListener("click", function () {
      rect1.setAttribute("height", "410");
      divTagPickTime.classList.remove("sqd-hidden");
      gSubDropdown.classList.add("sqd-hidden");
      divTagWaitTime.classList.add("sqd-hidden");
    });
    choice2.addEventListener("click", function () {
      rect1.setAttribute("height", "200");
      divTagPickTime.classList.add("sqd-hidden");
      divTagWaitTime.classList.remove("sqd-hidden");
      gSubDropdown.classList.remove("sqd-hidden");
    });
    moreIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      gRightPop3.classList.toggle("sqd-hidden");
      if (!gUpPop3.classList.contains("sqd-hidden")) {
        gUpPop3.classList.toggle("sqd-hidden");
      }
      if (!gDropdown.classList.contains("sqd-hidden")) {
        gDropdown.classList.toggle("sqd-hidden");
      }
    });
    moreIconDot.addEventListener("click", function (e) {
      e.stopPropagation();
      gRightPop3.classList.toggle("sqd-hidden");
      if (!gUpPop3.classList.contains("sqd-hidden")) {
        gUpPop3.classList.toggle("sqd-hidden");
      }
      if (!gDropdown.classList.contains("sqd-hidden")) {
        gDropdown.classList.toggle("sqd-hidden");
      }
    });
    editIcon.addEventListener("click", function () {
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      gRightPop3.classList.toggle("sqd-hidden");
    });
    upCheckIcon.addEventListener("click", function () {
      gDropdown.classList.toggle("sqd-hidden");

      gUpPop3.classList.toggle("sqd-hidden");

      if(choice1.checked){
        step.properties["date"] = OnceDates[0];
        textRight.textContent = OnceDates[0];
      }else if(choice2.checked){
        step.properties["date"] = waitTimeInput.value + ' ' + dropdownBoxInnerText.textContent + 's';
        textRight.textContent = waitTimeInput.value + ' ' + dropdownBoxInnerText.textContent + 's';
      }
      
    });
    upCheckIcon.addEventListener("mousedown", function(){
      checkImgContainerCircle.setAttribute("style", "fill:#0C67A5");
    });
    upCheckIcon.addEventListener("mouseup", function(){
      checkImgContainerCircle.setAttribute("style", "fill:#3498DB");
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
    copyIcon.addEventListener("mouseover", () => {
      gRightPop3Reminder2.classList.toggle("sqd-hidden");
    });
    copyIcon.addEventListener("mouseout", () => {
      gRightPop3Reminder2.classList.toggle("sqd-hidden");
    });
    copyIcon.addEventListener("mousedown", function(){
      rightCopyImgContainerCircle.setAttribute("style", "fill:#5495d4");
      copyIcon.setAttribute("href", "./assets/copy2.svg");
    });
    copyIcon.addEventListener("mouseup", function(){
      rightCopyImgContainerCircle.setAttribute("style", "fill:white");
      copyIcon.setAttribute("href", "./assets/copy.svg")
    });
    upCopyIcon.addEventListener("mousedown", function(){
      copyImgContainerCircle.setAttribute("style", "fill:#5495d4");
      upCopyIcon.setAttribute("href", "./assets/copy2.svg");
    });
    upCopyIcon.addEventListener("mouseup", function(){
      copyImgContainerCircle.setAttribute("style", "fill:white");
      upCopyIcon.setAttribute("href", "./assets/copy.svg")
    });
    deleteIcon.addEventListener("mouseover", () => {
      gRightPop3Reminder3.classList.toggle("sqd-hidden");
    });
    deleteIcon.addEventListener("mouseout", () => {
      gRightPop3Reminder3.classList.toggle("sqd-hidden");
    });
    deleteIcon.addEventListener("mousedown", function(){
      rightDeleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
      deleteIcon.setAttribute("href", "./assets/delete-inside.svg")
    });
    deleteIcon.addEventListener("mouseup", function(){
      rightDeleteImgContainerCircle.setAttribute("style", "fill:white");
      deleteIcon.setAttribute("href", "./assets/delete.svg")
    });
    upDeleteIcon.addEventListener("mousedown", function(){
      deleteImgContainerCircle.setAttribute("style", "fill:#5495d4");
      upDeleteIcon.setAttribute("href", "./assets/delete-inside.svg")
    });
    upDeleteIcon.addEventListener("mouseup", function(){
      deleteImgContainerCircle.setAttribute("style", "fill:white");
      upDeleteIcon.setAttribute("href", "./assets/delete.svg")
    });

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
    g.appendChild(moreIconDot);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);
    g.insertBefore(gDropdown, rect)
    g.appendChild(gRightPop3Reminder);
    g.appendChild(gUpPop3);
    g.appendChild(setUpReminder);
    const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
    inputView.setIsHidden(true);
    const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
    outputView.setIsHidden(true)
    const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
    return new TimeDelayTaskStepComponentView(
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
    // Dom.toggleClass(this.g.children[6].children[0], isSelected, "sqd-selected");
  }

  public setIsValid(isValid: boolean) {
    this.validationErrorView.setIsHidden(isValid);
  }
}

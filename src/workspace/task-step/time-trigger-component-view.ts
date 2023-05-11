import { Dom } from "../../core/dom";
import { Vector } from "../../core/vector";
import { TaskStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { InputView } from "../common-views/input-view";
import { OutputView } from "../common-views/output-view";
import { ValidationErrorView } from "../common-views/validation-error-view";
import { ComponentView } from "../component";
// import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
// import { TaskStepComponentView } from "./task-step-component-view";
// import { ListItem } from "ng-multiselect-dropdown/multiselect.model";
//import { TaskStepComponentView } from "./task-step-component-view";
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
    public readonly validationErrorView: ValidationErrorView
  ) {}
  public static create(
    parent: SVGElement,
    step: TaskStep,
    configuration: StepsConfiguration
  ): TimeTriggerTaskStepComponentView {
    const g = Dom.svg("g", {
      class: `sqd-task-group sqd-type-${step.type}`,
      id: "sqd-task-timetrigger"
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
      y:0.5,
      height:boxHeight,
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
      width: textWidth + 12,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    const textRight = Dom.svg("text", {
      x: ICON_SIZE + 3 * PADDING_X + textWidth - 10,
      y: boxHeight / 1.7,
      class: "sqd-task-text",
    });
    if (step.properties.send) {
      if(step.properties.frequency == "Once") {
        textRight.textContent = step.properties.send.toString();
      } 
      else {
        textRight.textContent = "Every " + step.properties.send.toString();
      }
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
    var moreUrl;
    const moreDotUrl = "./assets/more-dot.svg"
    if(step.name == "Subscribe" || step.name == "Unsubscribe"){
      moreUrl = "./assets/more2.svg";
    }else{
      moreUrl = "./assets/more3.svg"
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
      // id: `timeDelayMoreIcon`,
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
      x: ICON_SIZE + textWidth / 2 + 2 * PADDING_X + 89,
      y: PADDING_Y - 40,
      style: "fill:#5495d4"
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
      // id: `timeDelayUpCheckIcon`,
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
      // id: `reminder1${Date.now()}`,
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 82,
      y: PADDING_Y - 35,
    });
    const reminderText1 = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22 + 72.5,
      y: PADDING_Y - 23,
    });
    // Dom.attrs(reminderText1, {
    //   //class: 'sqd-hidden',
    //   id: `reminderText${Date.now()}`,
    // });
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
      // id: `reminder2${Date.now()}`,
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22 + 75,
      y: PADDING_Y,
    });

    const reminderText2 = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22 + 80,
      y: PADDING_Y + 12,
    });
    // Dom.attrs(reminderText2, {
    //   //class: 'sqd-hidden',
    //   id: `reminderText2${Date.now()}`,
    // });
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
      // id: `reminder3${Date.now()}`,
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 82,
      y: PADDING_Y + 35,
    });

    const reminderText3 = Dom.svg("text", {
      class: "sqd-task-text",
      x: ICON_SIZE + 4 * PADDING_X + 2 * textWidth + 22 + 67,
      y: PADDING_Y + 47,
    });
    // Dom.attrs(reminderText3, {
    //   //class: 'sqd-hidden',
    //   id: `reminderText3${Date.now()}`,
    // });
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
      id:"timetrigger-dropdown"
    });
    const rect1 = Dom.svg("rect", {
      x: 0.5,
      y: boxHeight,
      class: "sqd-task-rect",
      width: boxWidth,
      height: 6 * boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    Dom.attrs(rect1, {
      id: `dropdown${Date.now()}`,
    });

    const choice1Text = Dom.element("label");

    choice1Text.innerText = "Select List";
    choice1Text.setAttribute("class", "timeTriggerChoice1");

    //const choice1TextNextLine = Dom.element("br");

    const choice2Text = Dom.element("label");
    choice2Text.innerText = "Send Times";
    choice2Text.setAttribute("class", "timeTriggerChoice2");
    //add input for time delay tag
    var foreignObjectTag = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "foreignObject"
    ); //Create a rect in SVG's namespace
    foreignObjectTag.setAttribute("x", "0.5"); //Set rect data
    foreignObjectTag.setAttribute("y", "32"); //Set rect data
    foreignObjectTag.setAttribute("width", "258"); //Set rect data
    foreignObjectTag.setAttribute("height", "128"); //Set rect data
    //foreignObjectTag.setAttribute("class", "sqd-hidden");
    var divTimeTriggerSendTimeTag = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "div"
    );
    var divTimeTriggerSelectListTag = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "div"
    );
    divTimeTriggerSelectListTag.setAttribute(
      "class",
      "divTimeTriggerSelectListTag"
    );
    divTimeTriggerSendTimeTag.setAttribute(
      "class",
      "divTimeTriggerSendTimeTag"
    );
    //divTagWaitTime.setAttribute("class", "sqd-hidden");
    var collection = document.createElement("Form");
    collection.setAttribute("class", "timeTriggercollection");

    var selectListSelect = document.createElement("select");
    selectListSelect.setAttribute("class", "timeTriggerSelectTimeselect");

    let selectList = ["List A", "List B", "List C"];
    for (var i = 0; i < 3; i++) {
      var optional = Dom.element("option", {
        value: i,
      });
      optional.innerText = selectList[i];
      selectListSelect.appendChild(optional);
    }
    collection.appendChild(choice1Text);
    collection.appendChild(selectListSelect);

    var sendTimecollection = document.createElement("Form");
    sendTimecollection.setAttribute("class", "timeTriggersendTimecollection");
    let sendTimes = ["Once", "Recurring"];
    var sendTimeSelect = document.createElement("select");
    sendTimeSelect.setAttribute("class", "timeTriggerSendTimeselect");
    for (var i = 0; i < 2; i++) {
      var optional = Dom.element("option", {
        value: sendTimes[i],
      });
      optional.innerText = sendTimes[i];
      sendTimeSelect.appendChild(optional);
    }
    var divTagInput = document.createElement("INPUT") as HTMLInputElement;
    divTagInput.setAttribute("class", "timeTriggerdivTagInput");
    divTagInput.setAttribute("type", "datetime-local");
    let week = [
      "Monday",
      "Tuesday",
      "Wednesday",
      " Thursday",
      "friday",
      "Saturday",
      "Sunday",
    ];
    var weekSelect = document.createElement("select");
    weekSelect.setAttribute("class", "weekSelect  sqd-hidden");
    for (var i = 0; i < 7; i++) {
      var optional = Dom.element("option", {
        value: week[i],
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
          dropdownBoxInnerText.style.fill = "#a0a0a0";
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
        dropdownBoxInnerText1.style.fill = "#a0a0a0";
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
    if(step.properties["time"]){
      databefore = step.properties["time"].toString().split(',');
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
      console.log(databefore);
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
    setTimeTimeZone.textContent = "Based on your timezone(PST)";

    setTimeInput.addEventListener("change", function(){
      if(parseInt(setTimeInput.value) < 10){
        setTimeInput.value = '0' + setTimeInput.value;
      }
    });
    sendTimecollection.appendChild(choice2Text);
    sendTimecollection.appendChild(sendTimeSelect);
    sendTimecollection.appendChild(weekSelect);
    sendTimecollection.appendChild(divTagInput);

    divTimeTriggerSelectListTag.appendChild(collection);
    divTimeTriggerSendTimeTag.appendChild(sendTimecollection);
    foreignObjectTag.appendChild(divTimeTriggerSelectListTag);
    foreignObjectTag.appendChild(divTimeTriggerSendTimeTag);
    gDropdown.appendChild(rect1);
    gDropdown.appendChild(foreignObjectTag);

    moreIcon.addEventListener("click", function () {
      gRightPop3.classList.toggle("sqd-hidden");
    });
    editIcon.addEventListener("click", function () {
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      gRightPop3.classList.toggle("sqd-hidden");

      if (step.properties.list){
        const index = selectList.findIndex(a => a === step.properties.list.toString());
        selectListSelect.selectedIndex = index;
      }
      if (step.properties.frequency) {
        const index = sendTimes.findIndex(a => a === step.properties.frequency.toString());
        sendTimeSelect.selectedIndex = index;
      }

      if (step.properties.frequency == "Once" && divTagInput.value) {
        divTagInput.value = step.properties.send.toString();
        divTagInput.classList.remove("sqd-hidden");
        weekSelect.classList.add("sqd-hidden");
      }
      else if (step.properties.frequency == "Recurring" && weekSelect.value) {
        const index = week.findIndex(a => a === step.properties.send.toString());
        weekSelect.selectedIndex = index;
        divTagInput.classList.add("sqd-hidden");
        weekSelect.classList.remove("sqd-hidden");
      }
    });
    upCheckIcon.addEventListener("click", function () {
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      //@ts-ignore
      step.properties["Select List"] = dropdownBoxInnerText.textContent;
      textRight.textContent = dropdownBoxInnerText.textContent;
      //@ts-ignore
      step.properties["Runs"] = dropdownBoxInnerText1.textContent;

      step.updatedAt = new Date();
    });
    upCheckIcon.addEventListener("mousedown", function(e){
      e.stopPropagation();
      checkImgContainerCircle.setAttribute("style", "fill:#0C67A5");
    });
    upCheckIcon.addEventListener("mouseup", function(e){
      e.stopPropagation();
      checkImgContainerCircle.setAttribute("style", "fill:#5495d4");
    });
    
    upchangeIcon.addEventListener("mousedown", function(){
      copyImgContainerCircle.setAttribute("style", "fill:#5495d4");
      upchangeIcon.setAttribute("href", "./assets/chang-inside.svg")
    });
    upchangeIcon.addEventListener("mouseup", function(){
      copyImgContainerCircle.setAttribute("style", "fill:white");
      upchangeIcon.setAttribute("href", "./assets/change.svg")
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
      else if (sendTimeSelect.value == "Recurring" && weekSelect.value){
        step.properties.send = weekSelect.value;
        textRight.textContent = "Every " + weekSelect.value;
        divTagInput.value = "";
      }
      step.properties.frequency = sendTimeSelect.value;
      step.properties.list = selectList[parseInt(selectListSelect.value)];
      step["updatedAt"] = new Date();
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
    g.appendChild(moreIcon);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);
    g.appendChild(gRightPop3Reminder);
    g.appendChild(gUpPop3);
    g.appendChild(setUpReminder);
    const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
    const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
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

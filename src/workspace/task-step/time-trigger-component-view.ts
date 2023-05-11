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
      y: boxHeight / 1.7-3,
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
      width: textWidth + 12,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    const textRight = Dom.svg("text", {
      x: ICON_SIZE + 3 * PADDING_X + textWidth - 6,
      y: boxHeight / 1.7-2,
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
      height: 370,
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
    foreignObjectTag.setAttribute("height", "370"); //Set rect data
    //foreignObjectTag.setAttribute("class", "sqd-hidden");
    var divTimeTriggerSendTimeTag = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "div"
    );
    var divTimeTriggerSelectListTag = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "div"
    );
    var divTimeTriggerRecurring = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "div"
    );
    var divTimeTriggerCalender = document.createElementNS(
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
    divTimeTriggerRecurring.setAttribute(
      "class",
      "divTimeTriggerRecurring"
    )
    divTimeTriggerCalender.setAttribute(
      "class",
      "divTimeTriggerCalender"
    )

    divTimeTriggerCalender.setAttribute(
      "id",
      "calender"
    )
    //divTagWaitTime.setAttribute("class", "sqd-hidden");
    var collection = document.createElement("Form");
    collection.setAttribute("class", "timeTriggercollection");

    var selectListSelect = document.createElement("select");
    selectListSelect.setAttribute("class", "timeTriggerSelectTimeselect");

    const userID = 123; //Need to be changed to current user
    const request = new Request(`http://localhost:8080/dashboard/getAudiencelist/${userID}`, {method: 'GET'});
    let list: string[] = [];
    // Async way to fetch audience list
    const getlist = async ()=> {
      const response = await fetch(request);
      if (response.ok) {
        const val = await response.json();
        pulltheList(val);
      } 
    };

    getlist();

    const pulltheList= function (list: string[]){
      
      for (var i = -1; i < list.length; i++) {
        var optional = Dom.element("option", {
          value: i,
        });

        if(i == -1){
          optional.innerText = "Any List";
        }else{
          optional.innerText = list[i];
        }
        selectListSelect.appendChild(optional);
      }
    }

    collection.appendChild(choice1Text);
    collection.appendChild(selectListSelect);


    let selectList = ["List A", "List B", "List C"];
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
    
    //Create the rect for calender and recurring weeks checkboxes
    const rect2 = Dom.svg("rect", {
      x: 19,
      y: 120,
      class: "sqd-task-rect-inner",
      width: 220,
      height: 270,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });

    //Implement the calender
    // var today = new Date();

    // var leftArrowBtn = document.createElement("button");
    // leftArrowBtn.setAttribute("class", "arrowBtn");
    // leftArrowBtn.innerText = "<";

    // var rightArrowBtn = document.createElement("button");
    // rightArrowBtn.setAttribute("class", "arrowBtn");
    // rightArrowBtn.innerText = ">";

    // const calenderText = Dom.element("label");
    // calenderText.innerText = `${today.getMonth()+1}`+' '+`${today.getFullYear()}`;
    // calenderText.setAttribute("class", "calenderText");

    // divTimeTriggerCalender.appendChild(leftArrowBtn);

    //@ts-ignore
    const { DatePicker, Calendar } = ReactMultiDatePicker;

    //@ts-ignore
    ReactDOM.render(
      //@ts-ignore
      React.createElement(Calendar, {
        multiple: true,
        // //@ts-ignore
        // onChange: (newDate)=>{console.log(this.state)}
      }),
      divTimeTriggerCalender
    );

    console.log(Calendar);
    
    
    // var divTagInput = document.createElement("INPUT") as HTMLInputElement;
    // divTagInput.setAttribute("class", "timeTriggerdivTagInput");
    // divTagInput.setAttribute("type", "datetime-local");

    // let week = [
    //   "Monday",
    //   "Tuesday",
    //   "Wednesday",
    //   " Thursday",
    //   "friday",
    //   "Saturday",
    //   "Sunday",
    // ];


    // var weekSelect = document.createElement("select");
    // weekSelect.setAttribute("class", "weekSelect  sqd-hidden");
    // for (var i = 0; i < 7; i++) {
    //   var optional = Dom.element("option", {
    //     value: week[i],
    //   });
    //   optional.innerText = week[i];
    //   weekSelect.appendChild(optional);
    // }
    // sendTimeSelect.addEventListener("change", function () {
    //   if (sendTimeSelect.value == "Once") {
    //     // divTagInput.classList.remove("sqd-hidden");
    //     weekSelect.classList.add("sqd-hidden");
    //     rect1.setAttribute("height", "128");
    //   } else {
    //     // divTagInput.classList.add("sqd-hidden");
    //     weekSelect.classList.remove("sqd-hidden");
    //     rect1.setAttribute("height", "370");
    //   }
    // });
    sendTimecollection.appendChild(choice2Text);
    sendTimecollection.appendChild(sendTimeSelect);
    // sendTimecollection.appendChild(weekSelect);
    // sendTimecollection.appendChild(divTagInput);

    divTimeTriggerSelectListTag.appendChild(collection);
    divTimeTriggerSendTimeTag.appendChild(sendTimecollection);
    foreignObjectTag.appendChild(divTimeTriggerSelectListTag);
    foreignObjectTag.appendChild(divTimeTriggerSendTimeTag);
    foreignObjectTag.appendChild(divTimeTriggerCalender);
    gDropdown.appendChild(rect1);
    gDropdown.appendChild(rect2);
    gDropdown.appendChild(foreignObjectTag);

    moreIcon.addEventListener("click", function () {
      gRightPop3.classList.toggle("sqd-hidden");
    });
    editIcon.addEventListener("click", function () {
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      gRightPop3.classList.toggle("sqd-hidden");
      // document.getElementById("stop")?.classList.toggle("sqd-hidden");

      if (step.properties.list){
        const index = selectList.findIndex(a => a === step.properties.list.toString());
        selectListSelect.selectedIndex = index;
      }
      if (step.properties.frequency) {
        const index = sendTimes.findIndex(a => a === step.properties.frequency.toString());
        sendTimeSelect.selectedIndex = index;
      }

      // if (step.properties.frequency == "Once" && divTagInput.value) {
      //   divTagInput.value = step.properties.send.toString();
      //   divTagInput.classList.remove("sqd-hidden");
      //   weekSelect.classList.add("sqd-hidden");
      // }
      // else if (step.properties.frequency == "Recurring" && weekSelect.value) {
      //   const index = week.findIndex(a => a === step.properties.send.toString());
      //   weekSelect.selectedIndex = index;
      //   divTagInput.classList.add("sqd-hidden");
      //   weekSelect.classList.remove("sqd-hidden");
      // }
    });
    // upCheckIcon.addEventListener("click", function () {
    //   gDropdown.classList.toggle("sqd-hidden");
    //   gUpPop3.classList.toggle("sqd-hidden");
    //   if (sendTimeSelect.value == "Once" && divTagInput.value) {
    //     step.properties.send = divTagInput.value;
    //     textRight.textContent = divTagInput.value;
    //     weekSelect.value = "";
    //   }
    //   else if (sendTimeSelect.value == "Recurring" && weekSelect.value){
    //     step.properties.send = weekSelect.value;
    //     textRight.textContent = "Every " + weekSelect.value;
    //     divTagInput.value = "";
    //   }
    //   step.properties.frequency = sendTimeSelect.value;
    //   step.properties.list = selectList[parseInt(selectListSelect.value)];
    //   step["updatedAt"] = new Date();
    // });
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

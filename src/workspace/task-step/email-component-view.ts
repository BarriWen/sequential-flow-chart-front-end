import { Dom } from "../../core/dom";
import { StepsTranverser } from "../../core/steps-traverser";
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

export class EmailComponentView implements ComponentView {
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
  ): EmailComponentView {
    const g = Dom.svg("g", {
      class: `sqd-task-group sqd-type-${step.type}`,
      id: "sqd-task-email"
    });
    parent.insertBefore(g, parent.firstChild);
    const boxHeight = ICON_SIZE + PADDING_Y;
    const text = Dom.svg("text", {
      x: PADDING_X/2,
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
      width: textWidth + 5,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
    });
    const textRight = Dom.svg("text", {
      x: ICON_SIZE + 3 * PADDING_X + textWidth - 14,
      y: boxHeight / 1.7+1,
      class: "sqd-task-text_2",
    });
    if (step.properties["subject"]) {
      textRight.textContent = step.properties["subject"].toString();
    }
    else {
      textRight.textContent = "Empty Subject";
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
    // Right side buttons
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
      id: `magnidyIcon-${step.id}`,
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
    gRightPop3.appendChild(magnidyIcon);
    gUpPop3.appendChild(checkImgContainer);
    gUpPop3.appendChild(deleteImgContainer);
    gUpPop3.appendChild(copyImgContainer);
    //add dropdown
    //**************************************************//
    //***********start with general node****************//
    const gDropdown = Dom.svg("g", {
      class: `sqd-task-group dropdown sqd-hidden Collapsed`
    });

    
    g.appendChild(moreIcon);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);
    g.insertBefore(gDropdown, rect);
    // Send Email Drop Down Menu set up
    const newSend = Dom.svg("text", {class: "sqd-task-text",});
    const newSub = Dom.svg("text", {class: "sqd-task-text",});
    const newAddress = Dom.svg("text", {class: "sqd-task-text",});
    const newCont = Dom.svg("text", {class: "sqd-task-text",});
    //@ts-ignore
    addDropDown(gDropdown, boxHeight, boxWidth, upCheckIcon, newSend, newSub, newAddress, newCont);

    g.appendChild(gRightPop3Reminder);
    g.appendChild(gUpPop3);
    g.appendChild(setUpReminder);

    // Add EventListeners
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
    
    // Edit
    editIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      gRightPop3.classList.toggle("sqd-hidden");
      const elemt = document.getElementsByClassName("email-field");
      if (step.properties.sender) {
        Dom.attrs(elemt[0], {value: step.properties.sender.toString()});
      }
      if (step.properties.sender) {
        Dom.attrs(elemt[1], {value: step.properties.subject.toString()});
      }
    });
    // check button clicked
    upCheckIcon.addEventListener("click", function(e){
      e.stopPropagation();
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      step.properties["subject"] = ""; 
      step.properties["sender"] = ""; 
      step.properties["address"] = ""; 
      step.properties["template"] = ""; 
      if (newSend.textContent) {
        step.properties.sender = newSend.textContent;
      }
      if (newSub.textContent) {
        textRight.textContent = newSub.textContent; 
        step.properties.subject = textRight.textContent;
      }
      if (newCont.textContent){
        step.properties.content = newCont.textContent;
      }
      step["updatedAt"] = new Date();
    });

     // Show hints
     editIcon.addEventListener("mouseover", function(){
      gRightPop3Reminder1.classList.toggle("sqd-hidden");
    });
    editIcon.addEventListener("mouseout", function(){
      gRightPop3Reminder1.classList.toggle("sqd-hidden");
    });
    copyIcon.addEventListener("mouseover", () => {
      gRightPop3Reminder2.classList.toggle("sqd-hidden");
    });
    copyIcon.addEventListener("mouseout", () => {
      gRightPop3Reminder2.classList.toggle("sqd-hidden");
    });
    deleteIcon.addEventListener("mouseover", () => {
      gRightPop3Reminder3.classList.toggle("sqd-hidden");
    });
    deleteIcon.addEventListener("mouseout", () => {
      gRightPop3Reminder3.classList.toggle("sqd-hidden");
    });

    const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
    inputView.setIsHidden(true);
    const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
    const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
    return new EmailComponentView(
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
function addTxt(txt: string, xVal: number, yVal: number, idVal?: string) {
  const nameText = Dom.svg("text", {
    class: "sqd-task-text",
    x: xVal,
    y: yVal,
  });
  nameText.textContent = txt;
  if (idVal) {
    Dom.attrs(nameText, {
      id: idVal
    });
  }
  return nameText;
}
function createRect(className: string, xVal: number, yVal: number, w: number, h: number, id?: string, radius?: number){
  const rect =  Dom.svg("rect", {
    x: xVal,
    y: yVal,
    class: className,
    width: w,
    height: h,
  });
  if (id) {
    Dom.attrs(rect, {
      id: id
    });
  }
  if (radius) {
    Dom.attrs(rect, {
      rx: radius,
      ry: radius
    });
  }
  return rect;
}
function addDropDown(dropdown: SVGElement, h: number, w: number, button: SVGElement, send: SVGElement, sub: SVGElement, addr:SVGAElement, cont: SVGElement) {
  const gSubDropdownbox = Dom.svg("g", {
    class: `sqd-task-group`
  });
  dropdown.appendChild(gSubDropdownbox);
  
  const rect1 = createRect("sqd-task-rect", 0.5, 0.5, w, 9 * h + PADDING_Y, `dropdown${Date.now()}`, RECT_RADIUS);
  gSubDropdownbox.appendChild(rect1);
  let startX = rect1.getBBox().x+ 5;
  let startY = rect1.getBBox().y;
  let wid = rect1.getBBox().width;
  // Field names
  const subject = addTxt("Subject title", startX+PADDING_X, startY+PADDING_Y+45);  
  gSubDropdownbox.appendChild(subject);
  startX = subject.getBBox().x;
  startY = subject.getBBox().y;
  wid = subject.getBBox().width;
  
  const sender = addTxt("Sender name", startX, startY + 1.7*h);  
  gSubDropdownbox.appendChild(sender);
  startY = sender.getBBox().y;

  const address = addTxt("Sender email address", startX, startY + 1.7*h);  
  gSubDropdownbox.appendChild(address);
  startY = address.getBBox().y;


  const content = addTxt("Choose your template", startX, startY + 1.8*h);  
  gSubDropdownbox.appendChild(content);

   // add input fields
   startY = subject.getBBox().y;
   let height = subject.getBBox().height + PADDING_Y;
   const sendWrapper = Dom.svg("foreignObject", {
    x: startX,
    y: startY + 60,
    width: 220,
    height: height
  });
  const sendInput = Dom.element("input", {
    class: "new-tag-input email-field",
    name: "sender",
    type: "text",
    placeholder: "Enter name",
  });
  if (send.textContent) {
    Dom.attrs(sendInput, {
      value: send.textContent
    });
  }
  gSubDropdownbox.appendChild(sendWrapper);
  sendWrapper.appendChild(sendInput);

  startX = subject.getBBox().x;
  startY = subject.getBBox().y;
  
  const subjectWrapper = Dom.svg("foreignObject", {
    x: startX,
    y: startY+15,
    width: 220,
    height: height
  });
  const subjectInput = Dom.element("input", {
    class: "new-tag-input email-field",
    name: "subject",
    type: "text",
    placeholder: "Enter #1 Subject"
  });
  if (sub.textContent) {
    Dom.attrs(subjectInput, {
      value: sub.textContent
    });
  }
  gSubDropdownbox.appendChild(subjectWrapper);
  subjectWrapper.appendChild(subjectInput);
  
  const addressWrapper = Dom.svg("foreignObject", {
    x: startX,
    y: startY+110,
    width: 220,
    height: height
  });
  const addressInput = Dom.element("input", {
    class: "new-tag-input email-field",
    name: "address",
    type: "text",
    placeholder: "Enter email address"
  });
  // if (addr.textContent) {
  //   Dom.attrs(addressInput, {
  //     value: addr.textContent
  //   });
  // }
  gSubDropdownbox.appendChild(addressWrapper);
  addressWrapper.appendChild(addressInput);
  

  // Add content option 1
  startY = content.getBBox().y;
  height = content.getBBox().height;
  const tem = addTxt('Template', startX+5, startY + PADDING_Y * 5);
  gSubDropdownbox.appendChild(tem);
  Dom.attrs(tem, {class: "content-text"});
  const template = createRect("content-option", startX, startY + height + PADDING_Y / 2, 65 , 60, "", RECT_RADIUS);
  gSubDropdownbox.insertBefore(template, tem);

  // Add content option 2
  startX = template.getBBox().x + template.getBBox().width + PADDING_X;
  const txt = addTxt('Text Only', startX + 3-5, startY + PADDING_Y * 5);
  gSubDropdownbox.appendChild(txt);
  Dom.attrs(txt, {class: "content-text"});
  const txtWrapper = createRect("content-option", startX - PADDING_X / 2, startY + height + PADDING_Y / 2, 65 , 60, "", RECT_RADIUS);
  gSubDropdownbox.insertBefore(txtWrapper, txt);

  const dropdownBoxShapeAfter = Dom.svg("rect", {
    width: 65,
    height: 60,
    class: "option select-field",
    fill: "#fff",
    stroke: "#a0a0a0",
    x: startX - PADDING_X / 2,
    y: startY + height + PADDING_Y / 2,
  });
  Dom.attrs(dropdownBoxShapeAfter, {
    opacity: 0,
  });
  dropdownBoxShapeAfter.setAttribute("cursor", "pointer");
  gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
  
  // Add content option 3
  startX = txtWrapper.getBBox().x + txtWrapper.getBBox().width + PADDING_X * 2;
  const html = addTxt('HTML', startX-5, startY + PADDING_Y * 5);
  gSubDropdownbox.appendChild(html);
  Dom.attrs(html, {class: "content-text"});
  const htmlWrapper = createRect("content-option", startX - 3 * PADDING_X / 2 , startY + height + PADDING_Y /2 , 65 , 60, "", RECT_RADIUS);
  gSubDropdownbox.insertBefore(htmlWrapper, html);

  //text-test field
  const textWrapper = Dom.svg("foreignObject", {
    x: 17.5,
    y: startY+70,
    width: 220,
    height: height+20
  });
  const textInput = Dom.element("input", {
    class: "new-tag-input email-field sqd-hidden",
    name: "subject",
    type: "text",
    placeholder: "text"
  });
  if (cont.textContent) {
    Dom.attrs(textInput, {
      value: cont.textContent
    });
  }
  gSubDropdownbox.appendChild(textWrapper);
  textWrapper.appendChild(textInput);

  dropdownBoxShapeAfter.addEventListener("click", function(e){
    e.stopPropagation();
    textInput.classList.toggle("sqd-hidden");
  });

  // Add Event Listeners
  button.addEventListener("click", function(e) {
    e.stopPropagation();
    if (subjectInput.value) {
      sub.textContent = subjectInput.value;
    }
    if (sendInput.value) {
      send.textContent = sendInput.value;
    }
    if(textInput.value){
      cont.textContent = textInput.value;
    }
  });
  
  console.log(cont.textContent);
}
import { Dom } from "../../core/dom";
import { Vector } from "../../core/vector";
import { TaskStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { InputView } from "../common-views/input-view";
import { OutputView } from "../common-views/output-view";
import { ValidationErrorView } from "../common-views/validation-error-view";
import { ComponentView, StepComponent } from "../component";
const PADDING_X = 12;
const PADDING_Y = 10;
const MIN_TEXT_WIDTH = 70;
const ICON_SIZE = 22;
const RECT_RADIUS = 15;

export class TagComponentView implements ComponentView {
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
  ): TagComponentView {
    const g = Dom.svg("g", {
      class: `sqd-task-group sqd-type-${step.type}`,
      id: 'sqd-task-tag'
    });
    parent.insertBefore(g, parent.firstChild);
    const boxHeight = ICON_SIZE + PADDING_Y;
    const text = Dom.svg("text", {
      x: PADDING_X/2 + 7,
      y: boxHeight / 1.7 -2,
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
    if(step.name == "Remove Tag"){
      rectLeft.setAttribute("width", "95")
    }
    const textRight = Dom.svg("text", {
      x: ICON_SIZE + 3 * PADDING_X + textWidth - 5,
      y: boxHeight / 1.7+1,
      class: "sqd-task-text_2",
    });
    if (step.properties["tag"]) {
      textRight.textContent = step.properties["tag"].toString();
    }
    else {
      textRight.textContent ="Select Tag";
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
    const moreUrl = "./assets/moreTag.svg";
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
    if(step.name == "Remove Tag"){
      moreIconDot.setAttribute("x", "242");
    }
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
    // const rect1 = Dom.svg("rect", {
    //   x: 0.5,
    //   y: boxHeight,
    //   class: "sqd-task-rect",
    //   width: boxWidth,
    //   height: 4 * boxHeight,
    //   rx: RECT_RADIUS,
    //   ry: RECT_RADIUS,
    // });
    // Dom.attrs(rect1, {
    //   id: `dropdown${Date.now()}`,
    // });
    
    g.appendChild(moreIcon);
    g.appendChild(moreIconDot);
    g.appendChild(gRightPop3);
    g.insertBefore(gDropdown, rect);
    const newTag = Dom.svg("text", {
      class: "sqd-task-text",
    });
    let temp = '';
    if(step.properties["tag"]){
      temp = step.properties["tag"].toString();
    }
    tagDropDown(gDropdown, boxHeight, boxWidth, newTag, temp, step.name);
    if (step.name === "Add Tag") {
      addNewTag(gDropdown, boxHeight, boxWidth, upCheckIcon, newTag);
    }
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
    
    // Edit
    editIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      gRightPop3.classList.toggle("sqd-hidden");
    });
    upCheckIcon.addEventListener("click", function(e){
      e.stopPropagation();
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");

      if(g.children[0].children[3]){
        if (g.children[0].children[3].classList.contains("sqd-hidden")) {
          textRight.textContent = tempText;
          step.properties["tag"] = textRight.textContent;
          step["updatedAt"] = new Date();
        }
      }else{
        textRight.textContent = tempText;
        step.properties["tag"] = textRight.textContent;
        step["updatedAt"] = new Date();
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
    const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
    inputView.setIsHidden(true);
    const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
    outputView.setIsHidden(true)
    const validationErrorView = ValidationErrorView.create(g, boxWidth, 0);
    return new TagComponentView(
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
function addTxt(txt: string, xVal: number, yVal: number, idVal?: string) {
  const nameText = Dom.svg("text", {
    x: xVal+15,
    y: yVal+15,
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
function tagDropDown(dropdown: SVGElement, h: number, w: number, textToChange: SVGElement, temp: string, step:string) {
  const gSubDropdownbox = Dom.svg("g", {
    class: `sqd-task-group `,
  });
  dropdown.appendChild(gSubDropdownbox);
  // Field names
  let hei = 50;
  if(step == "Remove Tag"){
    hei = 20;
  }
  const rect1 = createRect("sqd-task-rect", 0.5, 0.5, w, 2.5 * h+hei, `dropdown${Date.now()}`, RECT_RADIUS);
  const nameText = addTxt("Select tag: ", PADDING_X+6, 1.5 * h);  
  
  gSubDropdownbox.appendChild(nameText);
  gSubDropdownbox.insertBefore(rect1, nameText);

  let startX = nameText.getBBox().x;
  let startY = nameText.getBBox().y;
  let wid = nameText.getBBox().width;

  const dropdownBoxShape = createRect("option select-field", startX + wid + PADDING_X+15, startY-4, 100, 21);
  Dom.attrs(dropdownBoxShape, {
    fill: "#fff",
    stroke: "#a0a0a0",
    class: "delay-box",
    rx: 3,
    ry: 3
  });
  const dropdownBoxShapeAfter = createRect("option select-field", startX + wid + PADDING_X+15, startY-4, 100, 21, `dropdownBoxShape${Date.now()}`);
  Dom.attrs(dropdownBoxShapeAfter, {
    fill: "#fff",
    stroke: "#a0a0a0",
    opacity: 0,
    rx: 3,
    ry: 3,
    class: 'set-time-shape'
  });
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
      x: 207,
      y: 56,
    });
  // Default value
  let teeext = 'Any Tag';
  if(temp != ''){
    teeext = temp;
  }
  const dropdownBoxInnerText = addTxt(teeext, startX + wid + PADDING_X + PADDING_X / 2+1, startY-5);
  Dom.attrs(dropdownBoxInnerText, {
    fill: "#a0a0a0",
  })
  gSubDropdownbox.appendChild(dropdownBoxInnerText);
  wid = wid + dropdownBoxInnerText.getBBox().width;
  // const dropdownRightButton = addTxt("▼ ", startX + wid + PADDING_X * 9, startY + 6.5);
  startX = dropdownBoxInnerText.getBBox().x;

  // gSubDropdownbox.appendChild(dropdownRightButton);
  gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownBoxInnerText);
  gSubDropdownbox.appendChild(downIcon);
  gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
  
  // Selection list field
  const gSubDropdownboxPop = Dom.svg("g", {
    class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
  });
  dropdown.appendChild(gSubDropdownboxPop);

    

  dropdownBoxShapeAfter.addEventListener("click", function (e) {
    gDropdownList.classList.toggle("sqd-hidden");

    if(!gDropdownList.classList.contains("sqd-hidden")){
      downIcon.setAttribute("href", "./assets/list_up.svg");
      dropdownBoxShape.setAttribute("stroke", "#4FCCFC");
      dropdownBoxInnerText.setAttribute("fill", "#4FCCFC");
    }else{
      downIcon.setAttribute("href", "./assets/list_down.svg");
      dropdownBoxShape.setAttribute("stroke", "#a0a0a0");
      dropdownBoxInnerText.setAttribute("fill", "#a0a0a0");
    }
  });

  const gDropdownList = Dom.svg("g", {
    class: "sqd-task-group sqd-hidden"
  });

  // Fetch tags from backend
  const userID = 1; //Need to be changed to current user
  const request = new Request(`http://localhost:8080/tag/${userID}`, {method: 'GET'});
  let tags: string[] = [];
  // Async way to fetch tags
  const getTags = async () => {
    const response = await fetch(request);
    if (response.ok) {
      const val = await response.json();
      tags = val;
      return tags;
    } else {
      return Promise.reject(response.status);
    }
  };
  gSubDropdownboxPop.classList.toggle("sqd-hidden");
    getTags().then(tags => {
      console.log("Fetching", tags);
      if (typeof(tags) !== 'number') {
        editTags(tags);
      }
    }).catch(console.log);
  
  // const tags = ["Food", "Electronics", "Clothes"];
  const editTags = function (tags: string[]) {

    const dropDownRect = Dom.svg("rect", {
      x:122.6875,
      y:74,
      class: "sqd-task-rect-inner_2",
      width: 100,
      height: 24*tags.length,
      rx: 3,
      ry: 3
    });
    gDropdownList.appendChild(dropDownRect);
    for(let i=0;i<tags.length;i++){
      const DropDownEachRect = Dom.svg("rect", {
        x:124.6875,
        y:77 + i*23,
        width: 96,
        height: 21,
        rx: 3,
        ry: 3,
        fill: "white",
        stroke: "none"
      });
      const DropdownEachText = Dom.svg("text", {
        x:129.6875,
        y:91 + i*23,
      });
      DropdownEachText.textContent = tags[i];

      const DropDownEachRectShape = Dom.svg("rect", {
        x:124.6875,
        y:77 + i*23,
        width: 96,
        height: 21,
        rx: 3,
        ry: 3,
        opacity: 0,
        class: "delay-box-shape"
      });
      
      DropDownEachRectShape.addEventListener("mouseover", function(){
        DropDownEachRect.setAttribute("fill", "#EDF5FF");
      });
      DropDownEachRectShape.addEventListener("mouseout", function(){
        DropDownEachRect.setAttribute("fill", "white");
      });
      DropDownEachRectShape.addEventListener("click", function(){
        gDropdownList.classList.add("sqd-hidden");
        dropdownBoxInnerText.textContent = tags[i];
        tempText = dropdownBoxInnerText.textContent;
        downIcon.setAttribute("href", "./assets/list_down.svg");
        dropdownBoxShape.setAttribute("stroke", "#a0a0a0");
        dropdownBoxInnerText.setAttribute("fill", "#a0a0a0");
      })

      gDropdownList.appendChild(DropDownEachRect);
      gDropdownList.appendChild(DropdownEachText);
      gDropdownList.appendChild(DropDownEachRectShape);
    }

    //@ts-ignore
    gSubDropdownbox.parentElement.appendChild(gDropdownList);
  };
}
let tempText!:string;
function addNewTag(parent: SVGElement, h: number, w: number, upCheckBut: SVGElement, textToChange: SVGElement) {
  const g = Dom.svg("g", {
    class: `create-tag`,
  });
  parent.insertBefore(g, parent.lastChild);
  const nameText = Dom.svg("text", {
    class: "new-tag-text",
    x: w / 4 + PADDING_X-6,
    y: h + 5 * PADDING_Y+20,
  });
  nameText.textContent = "+Create a New Tag"
  nameText.addEventListener("mouseover", function(){
    nameText.setAttribute("style", "fill:#5495d4;stroke:#5495d4");
  });
  nameText.addEventListener("mouseout", function(){
    nameText.setAttribute("style", "fill:#67b1e3;stroke:#67b1e3");
  });
  g.insertBefore(nameText, g.firstChild);

  // Text wrapper
  const rect = createRect("create-tag", nameText.getBBox().x, nameText.getBBox().y, nameText.getBBox().width, nameText.getBBox().height, `newTag${Date.now()}`);
  g.insertBefore(rect, nameText);

  // Page to input new tag
  const container = Dom.svg("g", {
    class: `sqd-task-group sub-dropdownbox sqd-hidden`,
  });
  parent.appendChild(container);
  const rect1 = createRect("sqd-task-rect", 0.5, 0.5, w, 2.5 * h+50, `dropdown${Date.now()}`, RECT_RADIUS);
  container.appendChild(rect1);
  
  const inputArea = Dom.svg("foreignObject", {
    x: 1 + 2 * PADDING_X+8,
    y: h + 2 * PADDING_Y,
    width: 220,
    height: 30
  });
  const input = Dom.element("input", {
    class: "new-tag-input",
    name: "newTag",
    type: "text",
    placeholder: "Name your new tag",
    value: ""
  });
  inputArea.appendChild(input);
  container.appendChild(inputArea);
  

  const backText = Dom.svg("text", {
    class: "new-tag-text",
    x: w / 4 + PADDING_X-6,
    y: h + 6 * PADDING_Y+10,
  });
  backText.textContent = "< Back to Selection"
  backText.addEventListener("mouseover", function(){
    backText.setAttribute("style", "fill:#5495d4;stroke:#5495d4");
  });
  backText.addEventListener("mouseout", function(){
    backText.setAttribute("style", "fill:#67b1e3;stroke:#67b1e3");
  });
  
  container.appendChild(backText);
  // Add event listener
  g.addEventListener("click", function(e) {
    e.stopPropagation();
    container.classList.toggle('sqd-hidden');
  });
  backText.addEventListener("click", function(e) {
    container.classList.toggle('sqd-hidden');
    input.value = "";
  });
  
  upCheckBut.addEventListener("click", function(e){
    if (input.value) {
      e.stopPropagation();
      console.log('Will be sending to back end',input.value);
      // Post tag to backend
      const userID = 1;  //Need to be changed to an existing user
      const journeyID = 4;  //Need to be changed to an existing journey
      const data = { "tag_name": `${input.value}` };
      const request = new Request(`/AddTag`,{
        method: 'POST', 
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
      });
      // Send tag to backend 
      textToChange.textContent = input.value;
      container.classList.toggle('sqd-hidden');
      input.value = "";
      fetch(request).then((response) => {
        if (!response.ok) {
          console.log("Connection error", response.status);
        }
      });
    }
  });
}
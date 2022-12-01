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
    });
    parent.appendChild(g);
    const boxHeight = ICON_SIZE + PADDING_Y;
    const text = Dom.svg("text", {
      x: 0.5,
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
    if (step.properties["tag"]) {
      textRight.textContent = step.properties["tag"].toString();
    }
    else {
      textRight.textContent = "Any tag";
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
      id: `tagMoreIcon`,
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
      id: `tagRightCopyIcon`,
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
      id: `tagRightDeleteIcon`,
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
      id: `tagRightEditIcon`,
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
      id: `tagUpCheckIcon`,
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
      id: `tagUpDeleteIcon`,
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
      id: `tagUpCopyIcon`,
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
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown);
    const newTag = Dom.svg("text", {
      class: "sqd-task-text",
    });
    tagDropDown(gDropdown, boxHeight, boxWidth, newTag);
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
      if (newTag.textContent) {
        textRight.textContent = newTag.textContent;
        step.properties["tag"] = textRight.textContent;
        step["updatedAt"] = new Date();
      }
    });
    const inputView = InputView.createRoundInput(g, boxWidth / 2, 0);
    const outputView = OutputView.create(g, boxWidth / 2, boxHeight);
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
function tagDropDown(dropdown: SVGElement, h: number, w: number, textToChange: SVGElement) {
  const gSubDropdownbox = Dom.svg("g", {
    class: `sqd-task-group sub-dropdownbox`,
  });
  dropdown.appendChild(gSubDropdownbox);
  // Field names
  const rect1 = createRect("sqd-task-rect", 0.5, h, w, 2.5 * h, `dropdown${Date.now()}`, RECT_RADIUS);
  const nameText = addTxt("Select tag: ", PADDING_X, 1.5 * h);  
  
  gSubDropdownbox.appendChild(nameText);
  gSubDropdownbox.insertBefore(rect1, nameText);

  let startX = nameText.getBBox().x;
  let startY = nameText.getBBox().y;
  let wid = nameText.getBBox().width;

  const dropdownBoxShape = createRect("option select-field", startX + wid + PADDING_X, startY, 160, 15);
  Dom.attrs(dropdownBoxShape, {
    fill: "#fff",
    stroke: "#a0a0a0",
  });
  const dropdownBoxShapeAfter = createRect("option select-field", startX + wid + PADDING_X, startY, 160, 15, `dropdownBoxShape${Date.now()}`);
  Dom.attrs(dropdownBoxShapeAfter, {
    fill: "#fff",
    stroke: "#a0a0a0",
    opacity: 0,
  });
  // Default value
  const dropdownBoxInnerText = addTxt("Any Tag", startX + wid + PADDING_X + PADDING_X / 2, startY + 6.5);
  gSubDropdownbox.appendChild(dropdownBoxInnerText);
  wid = wid + dropdownBoxInnerText.getBBox().width;
  const dropdownRightButton = addTxt("▼ ", startX + wid + PADDING_X * 9, startY + 6.5);
  startX = dropdownBoxInnerText.getBBox().x;

  gSubDropdownbox.appendChild(dropdownRightButton);
  gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownBoxInnerText);
  gSubDropdownbox.appendChild(dropdownBoxShapeAfter);
  
  // Selection list field
  const gSubDropdownboxPop = Dom.svg("g", {
    class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`,
  });
  dropdown.appendChild(gSubDropdownboxPop);

  dropdownBoxShapeAfter.addEventListener("click", function (e) {
    e.stopPropagation();
    gSubDropdownboxPop.classList.toggle("sqd-hidden");
    getTags().then(tags => {
      console.log("Fetching", tags);
      if (typeof(tags) !== 'number') {
        editTags(tags);
      }
    }).catch(console.log);
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
  
  // const tags = ["Food", "Electronics", "Clothes"];
  const editTags = function (tags: string[]) {
    for(let i = 0; i < tags.length; i++){
      const dropdownBoxBottomShape = createRect("option select-field", startX - PADDING_X / 2, startY + 15 * (i + 1), 160, 15);
      Dom.attrs(dropdownBoxBottomShape, {
        fill: "#fff",
        stroke: "#a0a0a0",
      });
      const dropdownBoxBottomShapeText = addTxt(tags[i], startX, startY + 15 * (i + 1) + 8);
      
      const dropdownBoxBottomShapecover = createRect("option select-field choice", startX - PADDING_X / 2, startY + 15 * (i + 1), 160, 15, `dropdownBoxBottomShapecover${Date.now()}`);
      Dom.attrs(dropdownBoxBottomShapecover, {
        fill: "#fff",
        stroke: "#a0a0a0",
        opacity: 0.3,
      });
  
      gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText);
      gSubDropdownboxPop.insertBefore(
        dropdownBoxBottomShape,
        dropdownBoxBottomShapeText
      );
      gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover);
  
      // Add Event Listeners
      dropdownBoxBottomShapecover.addEventListener("click", function(e) {
        e.stopPropagation();
        dropdownBoxInnerText.textContent = tags[i];
        gSubDropdownboxPop.classList.toggle("sqd-hidden");
        textToChange.textContent = tags[i];
      });
    };
  };
}
function addNewTag(parent: SVGElement, h: number, w: number, upCheckBut: SVGElement, textToChange: SVGElement) {
  const g = Dom.svg("g", {
    class: `create-tag`,
  });
  parent.insertBefore(g, parent.lastChild);
  const nameText = Dom.svg("text", {
    class: "new-tag-text",
    x: w / 4 + PADDING_X,
    y: h + 5 * PADDING_Y,
  });
  nameText.textContent = "+Create a New Tag"
  g.appendChild(nameText);

  // Text wrapper
  const rect = createRect("create-tag", nameText.getBBox().x, nameText.getBBox().y, nameText.getBBox().width, nameText.getBBox().height, `newTag${Date.now()}`);
  g.insertBefore(rect, nameText);

  // Page to input new tag
  const container = Dom.svg("g", {
    class: `sqd-task-group sub-dropdownbox sqd-hidden`,
  });
  parent.appendChild(container);
  const rect1 = createRect("sqd-task-rect", 0.5, h, w, 2.5 * h, `dropdown${Date.now()}`, RECT_RADIUS);
  container.appendChild(rect1);
  
  const inputArea = Dom.svg("foreignObject", {
    class: "new-tag-input",
    x: 1 + 2 * PADDING_X,
    y: h + 2 * PADDING_Y,
    width: 180,
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
    x: w / 4 + PADDING_X,
    y: h + 6 * PADDING_Y,
  });
  backText.textContent = "< Back to Selection"
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
      const userID = 1;      //Need to be changed to an existing user
      const journeyID = 4;  //Need to be changed to an existing journey
      const data = {"tag_name": `${input.value}`};
      const request = new Request(`http://localhost:8080/tags/${userID}/${journeyID}`, {
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
function checkText(tags: string[], text: string) {
  return tags.includes(text);
}
import { DragStepBehavior } from "../../behaviors/drag-step-behavior";
import { SelectStepBehavior } from "../../behaviors/select-step-behavior";
import { Dom } from "../../core/dom";
import { readMousePosition } from "../../core/event-readers";
import { Vector } from "../../core/vector";
import { SwitchStep } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { JoinView } from "../common-views//join-view";
import { LabelView } from "../common-views//label-view";
import { RegionView } from "../common-views//region-view";
import { ValidationErrorView } from "../common-views//validation-error-view";
import { InputView } from "../common-views/input-view";
import { ComponentView } from "../component";
import { SequenceComponent } from "../sequence/sequence-component";

// const MIN_CHILDREN_WIDTH = 50;
// const PADDING_X = 20;
// const PADDING_TOP = 20;
// const LABEL_HEIGHT = 22;
// const CONNECTION_HEIGHT = 16;
// const RECT_RADIUS = 15;
// const MIN_TEXT_WIDTH = 70;
// const PADDING_Y = 10;
// const ICON_SIZE = 22;
const PADDING_X$1 = 12;
const ICON_SIZE$3 = 22;
const MIN_TEXT_WIDTH$2 = 70
const PADDING_X$2 = 12;
const RECT_RADIUS$2 = 15
const PADDING_Y$2 = 10
const MIN_CHILDREN_WIDTH = 50;
const PADDING_TOP = 20;
const LABEL_HEIGHT = 22;
const CONNECTION_HEIGHT = 16;
const RECT_RADIUS = 15;
const ICON_SIZE = 22;
const PADDING_X = 12;
const PADDING_Y = 10;
const PH_HEIGHT = 120;
export class SwitchStepComponentView implements ComponentView {
  context: any;
  getRootComponent() {
    throw new Error("Method not implemented.");
  }
  static create(parent: SVGElement, step: SwitchStep, configuration: StepsConfiguration):
  SwitchStepComponentView{
    //const view =  SwitchStepComponentView.create(parent, context.configuration.steps);
    const g = Dom.svg('g', 
      {class: `sqd-switch-group sqd-type-${step.type}`,
      id: 'if'
    });
    parent.appendChild(g);

    const branchNames = Object.keys(step.branches);
    const sequenceComponents = branchNames.map(bn => SequenceComponent.create(g, step.branches[bn], configuration));
    const maxChildHeight = Math.max(...sequenceComponents.map(s => s.view.height));
    const containerWidths = sequenceComponents.map(s => Math.max(s.view.width, MIN_CHILDREN_WIDTH) + PADDING_X$1 * 2);
    const containersWidth = containerWidths.reduce((p, c) => p + c, 0);
    //const containerHeight = maxChildHeight + PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT * 2;
    const containerOffsets: number[] = [];
    const joinXs = sequenceComponents.map(s => Math.max(s.view.joinX, MIN_CHILDREN_WIDTH / 2));
    
    // Create branches
    const boxHeight = ICON_SIZE + PADDING_Y * 2;
    // Modified, added boxHeight to containerHeight
    const containerHeight = maxChildHeight + PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT * 2 + boxHeight / 2;
    let totalX = 0;
    for (let i = 0; i < branchNames.length; i++) {
      containerOffsets.push(totalX);
      totalX += containerWidths[i];
    }
    
    branchNames.forEach((branchName, i) => {
      const sequence = sequenceComponents[i];
      let offsetX = containerOffsets[i];
      console.log('offsetX', offsetX)
      console.log('joinXs[i]', joinXs[i])
      if(branchName == 'True'){
        offsetX = offsetX - 80
        branchName = 'Yes'
        JoinView.createStraightJoin(
          g,
          new Vector(containerOffsets[i] + joinXs[i] + PADDING_X$1 - 80, PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + boxHeight / 2),
          PH_HEIGHT
        );
      }
      else if(branchName == 'False'){
        offsetX = offsetX + 80
        branchName = 'No'
        JoinView.createStraightJoin(
          g,
          new Vector(containerOffsets[i] + joinXs[i] + PADDING_X$1 + 80, PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + boxHeight / 2),
          PH_HEIGHT
        );
      }
      
      LabelView.create(
        g,
        offsetX + joinXs[i] + PADDING_X$1,
        PADDING_TOP + LABEL_HEIGHT + CONNECTION_HEIGHT + boxHeight / 2,
        branchName,
        'secondary'
      );
      // JoinView.createStraightJoin(
      //   g,
      //   new Vector(containerOffsets[i] + joinXs[i] + PADDING_X$1, PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + boxHeight / 2),
      //   PH_HEIGHT
      // );
      
      
        
      
      

      //const childEndY = PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + sequence.view.height;
      //const fillingHeight = containerHeight - childEndY - CONNECTION_HEIGHT;
      // if (fillingHeight > 0) {
      //     JoinView.createStraightJoin(g, new Vector(containerOffsets[i] + joinXs[i] + PADDING_X$1, childEndY), fillingHeight);
      // }
      const sequenceX = offsetX + PADDING_X$1 + Math.max((MIN_CHILDREN_WIDTH - sequence.view.width) / 2, 0);
      
      // Modified: added boxHeight to sequenceY
      //const sequenceY = PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT;
      const sequenceY = PADDING_TOP + LABEL_HEIGHT * 2 + CONNECTION_HEIGHT + boxHeight / 2;
      
      
      Dom.translate(sequence.view.g, sequenceX, sequenceY);
    });
    //LabelView.create(g, containerWidths[0], PADDING_TOP, step.name);
    
    // New look of if/else block
    const g1 = Dom.svg("g");
    
    const text = Dom.svg('text', {
      x: 5,
      y: boxHeight / 2 - 5,
      class: 'sqd-task-text'
    });
    text.textContent = step.name;
    console.log(text)
    g1.appendChild(text);
    const textWidth = Math.max(text.getBBox().width, MIN_TEXT_WIDTH$2);
  const boxWidth = ICON_SIZE$3 + 8 * PADDING_X$2 + 2 * textWidth;
    const text1 = Dom.svg('text', {
      x: ICON_SIZE$3 + 3 * PADDING_X$2 + textWidth - 20,
      y: boxHeight / 2 - 5,
      class: 'sqd-task-text'
    });
    text1.textContent = "No Condition Setted";
    
    // const textWidth = Math.max(text.getBBox().width + PADDING_X * 2 + ICON_SIZE, MIN_TEXT_WIDTH);
    // const boxWidth = ICON_SIZE + PADDING_X * 3 + textWidth;
    
    // const rect = Dom.svg('rect', {
    // 	x: containerWidths[0] - textWidth * 2,
    // 	y: PADDING_TOP,
    // 	class: 'sqd-task-rect',
    // 	width: boxWidth * 2,
    // 	height: boxHeight,
    // 	rx: RECT_RADIUS,
    // 	ry: RECT_RADIUS
    // });
    const rect = Dom.svg("rect", {
      x: 0.5,
      y: 0.5,
      class: "sqd-task-rect sqd-switch",
      width: boxWidth,
      height: boxHeight-10,
      rx: RECT_RADIUS$2,
      ry: RECT_RADIUS$2,
    });
    g1.insertBefore(rect, text);
    const iconUrl = configuration.iconUrlProvider ? configuration.iconUrlProvider(step.componentType, step.type) : null;
    const rectLeft = Dom.svg("rect", {
      x: 0.5,
      y: 0.5,
      class: "sqd-task-rect sqd-switch",
      width: textWidth + 5,
      height: boxHeight-10,
      rx: RECT_RADIUS$2,
      ry: RECT_RADIUS$2,
    });
    const moreUrl = './assets/more.svg';
    const moreIcon = moreUrl
       ? Dom.svg('image', {
         href: moreUrl,
       })
       : Dom.svg('rect', {
           class: 'sqd-task-empty-icon',
           rx: 4,
           ry: 4
       });
       Dom.attrs(moreIcon, {
        class: 'more',
        id: Date.now(),
        x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 22,
        y: 5,
        width: ICON_SIZE,
        height: ICON_SIZE
       });
       //add 3 icons
       const iconUrl1 = configuration.iconUrlProvider ? configuration.iconUrlProvider(step.componentType, step.type) : null;
       // // add click event for icon
        const icon1 = iconUrl1
        ? Dom.svg('image', {
            href: iconUrl1
          })
        : Dom.svg('rect', {
            class: 'sqd-task-empty-icon',
            rx: 4,
          ry: 4
          });
      Dom.attrs(icon1, {
        class: "moreicon",
        id: `icon1${Date.now()}`,
        x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 60,
        y: PADDING_Y$2,
        width: ICON_SIZE,
        height: ICON_SIZE
      });
       const iconUrl2 ='./assets/delete.svg';
       // add click event for icon
       const icon2 = iconUrl2
         ? Dom.svg('image', {
             href: iconUrl2
         })
         : Dom.svg('rect', {
             class: 'sqd-task-empty-icon',
             rx: 4,
             ry: 4
         });
      Dom.attrs(icon2, {
          class: "moreicon",
          id: `icon2${Date.now()}`,
          x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 50,
          y: PADDING_Y$2 + 25,
          width: ICON_SIZE,
          height: ICON_SIZE
        });
       const iconUrl3 = './assets/edit.svg';
       // add click event for icon
       const icon3 = iconUrl3
         ? Dom.svg('image', {
             href: iconUrl3
         })
         : Dom.svg('rect', {
             class: 'sqd-task-empty-icon',
             rx: 4,
             ry: 4
         });
       Dom.attrs(icon3, {
         class: "moreicon",
         id: `p${Date.now()}`,
         x: ICON_SIZE$3 + 4 * PADDING_X$2 + 2 * textWidth + 50,
         y: PADDING_Y$2 - 30,
         width: ICON_SIZE,
         height: ICON_SIZE
       });
       const iconUrl4 = './assets/check.svg';
       // add click event for icon
       const icon4 = iconUrl4
         ? Dom.svg('image', {
             href: iconUrl4
         })
         : Dom.svg('rect', {
             class: 'sqd-task-empty-icon',
             rx: 4,
             ry: 4
         });
 
         Dom.attrs(icon4, {
           class: "moreicon",
           id: `icon4${Date.now()}`,
           x: ICON_SIZE + textWidth/2 + 2 * PADDING_X + 120 ,
           y: PADDING_Y - 12 - 22,
           width: 22,
           height: 22
         });
         const iconUrl5 = './assets/delete.svg';
         // add click event for icon
         const icon5 = iconUrl5
           ? Dom.svg('image', {
               href: iconUrl5
           })
           : Dom.svg('rect', {
               class: 'sqd-task-empty-icon',
               rx: 4,
               ry: 4
           });
         Dom.attrs(icon5, {
           class: "moreicon",
           id: `icon5${Date.now()}`,
           x: ICON_SIZE + textWidth/2 + 2 * PADDING_X + 164,  //120
           y: PADDING_Y - 12 - 22,  // -20
           width: ICON_SIZE,
           height: ICON_SIZE
         });
         const iconUrl6 = configuration.iconUrlProvider ? configuration.iconUrlProvider(step.componentType, step.type) : null;
       // add 3 icons
        const icon6 = iconUrl6
        ? Dom.svg('image', {
            href: iconUrl6
          })
        : Dom.svg('rect', {
            class: 'sqd-task-empty-icon',
            rx: 4,
          ry: 4
          });
      Dom.attrs(icon6, {
        class: "moreicon",
        id: `icon6${Date.now()}`,
        x: ICON_SIZE + textWidth/2 + 2 * PADDING_X + 142,
        y: PADDING_Y - 12 - 22,
        width: ICON_SIZE,
        height: ICON_SIZE
      });
    const gRightPop3 = Dom.svg('g', {
      class: `sqd-switch-group right-popup sqd-hidden Collapsed`
    });
    const gUpPop3 = Dom.svg('g', {
      class: `sqd-task-group up-popup sqd-hidden Collapsed`
    });
    //edit start here


    const gDropdown = Dom.svg('g', {
      class: `sqd-task-group dropdown sqd-hidden Collapsed`
    });
    const gAddGroupButton = Dom.svg('g', {
      class: `sqd-task-group dropdown  Collapsed`
    });
    const gAddConditionButton = Dom.svg('g', {
      class: `sqd-task-group dropdown  Collapsed`
    });
    const rect1 = Dom.svg('rect', {
      x: 0.5,
      y: 0.5 + boxHeight - 10,
      class: 'sqd-task-rect sqd-switch',
      width: boxWidth,
      height: 2 * boxHeight + 15,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS
    });
    Dom.attrs(rect1, {
        //class: 'sqd-hidden',
        id:`dropdown${Date.now()}`
      })
    const nameText = Dom.svg('text', {
    class: 'sqd-task-text',
        x: containerWidths[0] - textWidth,
        y: 2 * boxHeight,
      });
    Dom.attrs(nameText, {
        //class: 'sqd-hidden',
        id:`dropdownword1${Date.now()}`
      })
    const nameText1 = Dom.svg('text', {
        class: 'sqd-task-text',
        x: containerWidths[0] - textWidth,
        y: 2.5 * boxHeight,
      });
      Dom.attrs(nameText1, {
        //class: 'sqd-hidden',
        id:`dropdownword2${Date.now()}`
      })
      nameText.textContent = '';  // 'Select List:'
      nameText1.textContent = '';  // 'Run:'
    const rect2 = Dom.svg('rect', {
      width: 110,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.3 * boxHeight + 30 - 29.5 - 15
      
    })
    const nameText2 = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 135 + 20,
      y: 2.3 * boxHeight + 37.5 - 29.5 - 15,
      id: `dropdownword333${Date.now()}`
    });
    nameText2.textContent = 'Add new condition'
    const rect2cover = Dom.svg('rect', {
      width: 110,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.3 * boxHeight + 30 - 29.5 - 15,
      id: `rect2cover${Date.now()}`
      
    })
    Dom.attrs(rect2cover,{
      opacity: 0.3
      }
    )
    const rect3 = Dom.svg('rect', {
      width: 150,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20 + 55,
      y: 2.3 * boxHeight + 30 - 29.5 + 15
      
    })
    const nameText3 = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 135 + 20 + 55,
      y: 2.3 * boxHeight + 37.5 - 29.5 + 15,
      id: `dropdownword333${Date.now()}`
    });
    nameText3.textContent = 'Add a new segment group'
    const rect3cover = Dom.svg('rect', {
      width: 150,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20 + 55,
      y: 2.3 * boxHeight + 30 - 29.5 + 15,
      id: `rect3cover${Date.now()}`
      
    })
    Dom.attrs(rect3cover,{
      opacity: 0.3
      }
    )
    // gAddConditionButton.appendChild(rect2)
    // gAddConditionButton.appendChild(nameText2)
    // gAddConditionButton.appendChild(rect2cover)
    // gDropdown.appendChild(nameText)  // [15][1]
    // gDropdown.appendChild(nameText1)  // [15][2]
    // gDropdown.insertBefore(rect1, nameText);  // [15][0]
    // gDropdown.appendChild(rect2)  // [15][3]
    // gDropdown.appendChild(nameText2)  // [15][4]
    // gDropdown.appendChild(rect2cover)  // [15][5]
    // gDropdown.appendChild(rect3)
    // gDropdown.appendChild(nameText3)
    // gDropdown.appendChild(rect3cover)

    // subdropdown
    const gSubDropdownGroupInfo = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdown  Collapsed`
    });
    const gSubDropdownConditionInfo = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdown  Collapsed`
    });
    const gSubDropdown = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdown  Collapsed`
    });
    const gSubDropdown1 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdown  Collapsed`
    });
    const gSubDropdown2 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdown  Collapsed`
    });
    const gSubDropdownbox = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdownbox`
    });
    const gSubDropdownbox1 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdownbox`
    });
    
    const gSubDropdownbox2 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdownbox`
    });

    const dropdownBoxShape = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 1.7 * boxHeight - 29.5,
      //id: `dropdownBoxShape${Date.now()}`
    })
    const dropdownBoxShape1 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45 + 20,
      y: 1.7 * boxHeight - 29.5,
      //id: `dropdownBoxShape1${Date.now()}`
    })
    const dropdownBoxShape2 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight - 29.5,
      //id: `dropdownBoxShape1${Date.now()}`
    })
    const dropdownRightButton = Dom.svg('text', {
      class: 'sqd-task-text select-field',
          x: containerWidths[0] - 93 + 20,  // -130
          y: 1.85 * boxHeight - 29.5,
        });
    const dropdownRightButton1 = Dom.svg('text', {
      class: 'sqd-task-text select-field',
          x: containerWidths[0] + 93 + 20,  // +50
          y: 1.85 * boxHeight - 29.5,  // 1.85
        });	
    const dropdownRightButton2 = Dom.svg('text', {
      class: 'sqd-task-text select-field',
          x: containerWidths[0] + 3 + 20,  // -40
          y: 1.85 * boxHeight - 29.5,  // 1.85
        });		
    dropdownRightButton.textContent = "▼";
    dropdownRightButton1.textContent = "▼";
    dropdownRightButton2.textContent = "▼";
    // origin
    const dropdownBoxInnerText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 135 + 20, // +20
          y: 1.85 * boxHeight - 29.5,  // -29.5
        });
    dropdownBoxInnerText.textContent = 'Select';
    const dropdownBoxInnerText1 = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] + 45 + 20,
          y: 1.85 * boxHeight - 29.5,
        });
    dropdownBoxInnerText1.textContent = 'Select';
    const dropdownBoxInnerText2 = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45 + 20,
          y: 1.85 * boxHeight - 29.5,
        });
    dropdownBoxInnerText2.textContent = 'Select';

    const dropdownBoxShapeAfter = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x:containerWidths[0] - 135 + 20,
      y: 1.7 * boxHeight - 29.5,
      id: `dropdownBoxShape${Date.now()}`
    })
    Dom.attrs(dropdownBoxShapeAfter,{
      opacity: 0
    }
    )
    const dropdownBoxShape1After = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45 + 20,
      y: 1.7 * boxHeight - 29.5,
      id: `dropdownBoxShape1${Date.now()}`
    })
    Dom.attrs(dropdownBoxShape1After,{
      opacity: 0
    }
    )
    const dropdownBoxShape2After = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight - 29.5,
      id: `dropdownBoxShape2${Date.now()}`
    })
    Dom.attrs(dropdownBoxShape2After,{
      opacity: 0
    }
    )
    
    // subdropdown 左
    const dropdownBoxBottomShape = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 1.7 * boxHeight + 15 - 29.5
      
    })
    const dropdownBoxBottomShapeText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 135 + 20,
          y: 1.85 * boxHeight + 15 - 29.5
        });
    dropdownBoxBottomShapeText.textContent = 'CONTACT INFO'
    const dropdownBoxBottomShapecover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      id: `dropdownBoxBottomShapecover${Date.now()}`

      
    })
    Dom.attrs(dropdownBoxBottomShapecover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShapeS = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 1.7 * boxHeight + 30 - 29.5
      
    })
    const dropdownBoxBottomShapeSText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 135 + 20,
          y: 2.2 * boxHeight + 15 - 29.5
        });
    dropdownBoxBottomShapeSText.textContent = 'Actions'
    const dropdownBoxBottomShapeScover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 1.7 * boxHeight + 30 - 29.5,
      id: `dropdownBoxBottomShapeScover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShapeScover,{
      opacity: 0.3
      }
    )
    // edit subdropdown 左
    // If / Else - 
    // Contact - 
    // Email Address ~ / First/Last/Full Name~Phone Number Email(保留contains/does not contain/is blank), 
    // name(保留is，is not，contains，does not contain，is blank) 
    // phone number (保留contains/does not contain/is blank)
    const dropdownBoxButtonShapeRightBtn = Dom.svg('text', {
      class: 'sqd-task-text select-field',
        x: containerWidths[0] - 93 + 20,  // -130
        y: 1.85 * boxHeight + 15 - 29.5,
        id: `dropdownBoxButtonShapeRightBtn${Date.now()}`
        });		
    dropdownBoxButtonShapeRightBtn.textContent = "▼";
    // Email Address
    const dropdownBoxBottomShapeExtend1 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 1.7 * boxHeight + 30 - 29.5
      
    })
    const dropdownBoxBottomShapeExtend1Text = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 135 + 20,
      y: 1.7 * boxHeight + 37.5 - 29.5,
    });
    dropdownBoxBottomShapeExtend1Text.textContent = 'Email Address'
    const dropdownBoxBottomShapeExtend1cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 1.7 * boxHeight + 30 - 29.5,
      id: `dropdownBoxBottomShapeExtend1cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShapeExtend1cover,{
      opacity: 0.3
      }
    )
    // name
    const dropdownBoxBottomShapeExtend2 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.0 * boxHeight + 30 - 29.5
      
    })
    const dropdownBoxBottomShapeExtend2Text = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 135 + 20,
          y: 2.0 * boxHeight + 37.5 - 29.5,
        });
    dropdownBoxBottomShapeExtend2Text.textContent = 'Name'
    const dropdownBoxBottomShapeExtend2cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.0 * boxHeight + 30 - 29.5,
      id: `dropdownBoxBottomShapeExtend2cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShapeExtend2cover,{
      opacity: 0.3
      }
    )
    // Phone Number
    const dropdownBoxBottomShapeExtend3 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.3 * boxHeight + 30 - 29.5
      
    })
    const dropdownBoxBottomShapeExtend3Text = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 135 + 20,
      y: 2.3 * boxHeight + 37.5 - 29.5,
    });
    dropdownBoxBottomShapeExtend3Text.textContent = 'Phone Number'
    const dropdownBoxBottomShapeExtend3cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.3 * boxHeight + 30 - 29.5,
      id: `dropdownBoxBottomShapeExtend3cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShapeExtend3cover,{
      opacity: 0.3
      }
    )

    // Actions - 
    const dropdownBoxButtonShapeSRightBtn = Dom.svg('text', {
      class: 'sqd-task-text select-field',
        x: containerWidths[0] - 93 + 20,  // -130
        y: 2.2 * boxHeight + 15 - 29.5,
        id: `dropdownBoxButtonShapeSRightBtn${Date.now()}`
        });		
    dropdownBoxButtonShapeSRightBtn.textContent = "▼";
    // Opened
    const dropdownBoxBottomShapeSExtend1 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.0 * boxHeight + 30 - 29.5
      
    })
    const dropdownBoxBottomShapeSExtend1Text = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 135 + 20,
      y: 2.0 * boxHeight + 37.5 - 29.5,
    });
    dropdownBoxBottomShapeSExtend1Text.textContent = 'Opened'
    const dropdownBoxBottomShapeSExtend1cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.0 * boxHeight + 30 - 29.5,
      id: `dropdownBoxBottomShapeSExtend1cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShapeSExtend1cover,{
      opacity: 0.3
      }
    )
    // Clicked
    const dropdownBoxBottomShapeSExtend2 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.3 * boxHeight + 30 - 29.5
      
    })
    const dropdownBoxBottomShapeSExtend2Text = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 135 + 20,
      y: 2.3 * boxHeight + 37.5 - 29.5,
    });
    dropdownBoxBottomShapeSExtend2Text.textContent = 'Clicked'
    const dropdownBoxBottomShapeSExtend2cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135 + 20,
      y: 2.3 * boxHeight + 30 - 29.5,
      id: `dropdownBoxBottomShapeSExtend2cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShapeSExtend2cover,{
      opacity: 0.3
      }
    )
    
    // subdropdown 右
    const dropdownBoxBottomShape1 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45 + 20,
      y: 1.7 * boxHeight + 15 - 29.5
    })
    
    const dropdownBoxBottomShape1Text = Dom.svg('text', {
       class: 'sqd-task-text',
           x: containerWidths[0] + 45 + 20,
           y: 1.85 * boxHeight + 15 - 29.5,
         });	
    dropdownBoxBottomShape1Text.textContent = 'Once'
    const dropdownBoxBottomShape1cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      id:`dropdownBoxBottomShape1cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape1cover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape1S = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45 + 20,
      y: 1.7 * boxHeight + 30 - 29.5
    })

    const dropdownBoxBottomShape1SText = Dom.svg('text', {
       class: 'sqd-task-text',
           x: containerWidths[0] + 45 + 20,
           y: 1.85 * boxHeight + 30 - 29.5,
         });				
    dropdownBoxBottomShape1SText.textContent = 'Multiple '
    const dropdownBoxBottomShape1Scover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45 + 20,
      y: 1.7 * boxHeight + 30 - 29.5,
      id:`dropdownBoxBottomShape1Scover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape1Scover,{
      opacity: 0.3
      }
    )
    
    // subdropdown 中
    // Email Address & Phone Number(保留contains/does not contain/is blank)
    const dropdownBoxBottomShape2 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45+20,
      y: 1.7 * boxHeight + 15 - 29.5
      
    })
    const dropdownBoxBottomShape2Text = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45 + 20,
          y: 1.85 * boxHeight + 15 - 29.5
        });
    dropdownBoxBottomShape2Text.textContent = 'Contains'
    const dropdownBoxBottomShape2cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      id: `dropdownBoxBottomShape2cover${Date.now()}`

      
    })
    Dom.attrs(dropdownBoxBottomShape2cover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape2S = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 30 - 29.5
      
    })
    const dropdownBoxBottomShape2SText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45 + 20,
          y: 1.85 * boxHeight + 30 - 29.5,
        });
    dropdownBoxBottomShape2SText.textContent = 'Does not Contain'
    const dropdownBoxBottomShape2Scover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 30 - 29.5,
      id: `dropdownBoxBottomShape2Scover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape2Scover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape2SS = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 45 - 29.5
      
    })
    const dropdownBoxBottomShape2SSText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45 + 20,
          y: 1.85 * boxHeight + 45 - 29.5,
        });
    dropdownBoxBottomShape2SSText.textContent = 'Is Blank'
    const dropdownBoxBottomShape2SScover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 45 - 29.5,
      id: `dropdownBoxBottomShape2SScover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape2SScover,{
      opacity: 0.3
      }
    )

    // name(保留is，is not，contains，does not contain，is blank)
    const dropdownBoxBottomShape2E1 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 15 - 29.5
      
    })
    const dropdownBoxBottomShape2E1Text = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45 + 20,
          y: 1.85 * boxHeight + 15 - 29.5
        });
    dropdownBoxBottomShape2E1Text.textContent = 'is'
    const dropdownBoxBottomShape2E1cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      id: `dropdownBoxBottomShape2E1cover${Date.now()}`

      
    })
    Dom.attrs(dropdownBoxBottomShape2E1cover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape2E1S = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 30 - 29.5
      
    })
    const dropdownBoxBottomShape2E1SText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45 + 20,
          y: 1.85 * boxHeight + 30 - 29.5,
        });
    dropdownBoxBottomShape2E1SText.textContent = 'is not'
    const dropdownBoxBottomShape2E1Scover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 30 - 29.5,
      id: `dropdownBoxBottomShape2E1Scover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape2E1Scover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape2E1SS = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 45 - 29.5
      
    })
    const dropdownBoxBottomShape2E1SSText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45 + 20,
          y: 1.85 * boxHeight + 45 - 29.5,
        });
    dropdownBoxBottomShape2E1SSText.textContent = 'Contains'
    const dropdownBoxBottomShape2E1SScover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 45 - 29.5,
      id: `dropdownBoxBottomShape2E1SScover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape2E1SScover,{
      opacity: 0.3
      }
    )
    
    // add new condition
    // subdropdown
    const gSubDropdown3 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdown sqd-hidden Collapsed`
    });
    const gSubDropdown4 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdown sqd-hidden Collapsed`
    });
    const gSubDropdown5 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdown sqd-hidden Collapsed`
    });
    const gSubDropdownbox3 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdownbox`
    });
    const gSubDropdownbox4 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdownbox`
    });
    
    const gSubDropdownbox5 = Dom.svg('g', {
      class: `sqd-switch-group sub-dropdownbox`
    });

    const dropdownBoxShape3 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 1.7 * boxHeight + 30,
      //id: `dropdownBoxShape3${Date.now()}`
    })
    const dropdownBoxShape4 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45,
      y: 1.7 * boxHeight + 30,
      //id: `dropdownBoxShape4${Date.now()}`
    })
    const dropdownBoxShape5 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 30,
      //id: `dropdownBoxShape5${Date.now()}`
    })
    const dropdownRightButton3 = Dom.svg('text', {
      class: 'sqd-task-text select-field',
          x: containerWidths[0] - 93,  // -130
          y: 1.85 * boxHeight + 30,
        });
    const dropdownRightButton4 = Dom.svg('text', {
      class: 'sqd-task-text select-field',
          x: containerWidths[0] + 93,  // +50
          y: 1.85 * boxHeight + 30,  // 1.85
        });	
    const dropdownRightButton5 = Dom.svg('text', {
      class: 'sqd-task-text select-field',
          x: containerWidths[0] + 3,  // -40
          y: 1.85 * boxHeight + 30,  // 1.85
        });		
    dropdownRightButton3.textContent = "▼";
    dropdownRightButton4.textContent = "▼";
    dropdownRightButton5.textContent = "▼";
    const dropdownBoxInnerText3 = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 135,
          y: 1.85 * boxHeight + 30,
        });
    dropdownBoxInnerText3.textContent = 'Select';
    const dropdownBoxInnerText4 = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] + 45,
          y: 1.85 * boxHeight + 30,
        });
    dropdownBoxInnerText4.textContent = 'Select';
    const dropdownBoxInnerText5 = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45,
          y: 1.85 * boxHeight + 30,
        });
    dropdownBoxInnerText5.textContent = 'Select';
    const dropdownBoxShape3After = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x:containerWidths[0] - 135,
      y: 1.7 * boxHeight + 30,
      id: `dropdownBoxShape3${Date.now()}`
    })
    Dom.attrs(dropdownBoxShape3After,{
      opacity: 0
    }
    )
    const dropdownBoxShape4After = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45,
      y: 1.7 * boxHeight + 30,
      id: `dropdownBoxShape4${Date.now()}`
    })
    Dom.attrs(dropdownBoxShape4After,{
      opacity: 0
    }
    )
    const dropdownBoxShape5After = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 30,
      id: `dropdownBoxShape5${Date.now()}`
    })
    Dom.attrs(dropdownBoxShape5After,{
      opacity: 0
    }
    )
    
    // subdropdown 左
    const dropdownBoxBottomShape3 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 1.7 * boxHeight + 15 + 30
      
    })
    const dropdownBoxBottomShape3Text = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 135,
          y: 1.85 * boxHeight + 15 + 30
        });
    dropdownBoxBottomShape3Text.textContent = 'CONTACT INFO'
    const dropdownBoxBottomShape3cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 1.7 * boxHeight + 15 + 30,
      id: `dropdownBoxBottomShape3cover${Date.now()}`

      
    })
    Dom.attrs(dropdownBoxBottomShape3cover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape3S = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 1.7 * boxHeight + 30 + 30
      
    })
    const dropdownBoxBottomShape3SText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 135,
          y: 2.2 * boxHeight + 15 + 30,
        });
    dropdownBoxBottomShape3SText.textContent = 'Actions'
    const dropdownBoxBottomShape3Scover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 1.7 * boxHeight + 30 + 30,
      id: `dropdownBoxBottomShape3Scover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape3Scover,{
      opacity: 0.3
      }
    )
    // edit subdropdown 左
    // If / Else - 
    // Contact - 
    // Email Address ~ / First/Last/Full Name~Phone Number Email(保留contains/does not contain/is blank), 
    // name(保留is，is not，contains，does not contain，is blank) 
    // phone number (保留contains/does not contain/is blank)
    const dropdownBoxButtonShape3RightBtn = Dom.svg('text', {
      class: 'sqd-task-text select-field',
        x: containerWidths[0] - 93,  // -130
        y: 1.85 * boxHeight + 15 + 30,
        id: `dropdownBoxButtonShape3RightBtn${Date.now()}`
        });		
    dropdownBoxButtonShape3RightBtn.textContent = "▼";
    // Email Address
    const dropdownBoxBottomShape3Extend1 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 1.7 * boxHeight + 30 + 30
      
    })
    const dropdownBoxBottomShape3Extend1Text = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 135,
      y: 1.7 * boxHeight + 37.5 + 30,
    });
    dropdownBoxBottomShape3Extend1Text.textContent = 'Email Address'
    const dropdownBoxBottomShape3Extend1cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 1.7 * boxHeight + 30 + 30,
      id: `dropdownBoxBottomShape3Extend1cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape3Extend1cover,{
      opacity: 0.3
      }
    )
    // name
    const dropdownBoxBottomShape3Extend2 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 2.0 * boxHeight + 30 + 30
      
    })
    const dropdownBoxBottomShape3Extend2Text = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 135,
          y: 2.0 * boxHeight + 37.5 + 30,
        });
    dropdownBoxBottomShape3Extend2Text.textContent = 'Name'
    const dropdownBoxBottomShape3Extend2cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 2.0 * boxHeight + 30 + 30,
      id: `dropdownBoxBottomShape3Extend2cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape3Extend2cover,{
      opacity: 0.3
      }
    )
    // Phone Number
    const dropdownBoxBottomShape3Extend3 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 2.3 * boxHeight + 30 + 30
      
    })
    const dropdownBoxBottomShape3Extend3Text = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 135,
          y: 2.3 * boxHeight + 37.5 + 30,
        });
    dropdownBoxBottomShape3Extend3Text.textContent = 'Phone Number'
    const dropdownBoxBottomShape3Extend3cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 2.3 * boxHeight + 30 + 30,
      id: `dropdownBoxBottomShape3Extend3cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape3Extend3cover,{
      opacity: 0.3
      }
    )

    // Actions - 
    const dropdownBoxButtonShape3SRightBtn = Dom.svg('text', {
      class: 'sqd-task-text select-field',
        x: containerWidths[0] - 93,  // -130
        y: 2.2 * boxHeight + 15 + 30,
        id: `dropdownBoxButtonShape3SRightBtn${Date.now()}`
        });		
    dropdownBoxButtonShape3SRightBtn.textContent = "▼";
    // Opened
    const dropdownBoxBottomShape3SExtend1 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 2.0 * boxHeight + 30 + 30
      
    })
    const dropdownBoxBottomShape3SExtend1Text = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 135,
      y: 2.0 * boxHeight + 37.5 + 30,
    });
    dropdownBoxBottomShape3SExtend1Text.textContent = 'Opened'
    const dropdownBoxBottomShape3SExtend1cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 2.0 * boxHeight + 30 + 30,
      id: `dropdownBoxBottomShape3SExtend1cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape3SExtend1cover,{
      opacity: 0.3
      }
    )
    // Clicked
    const dropdownBoxBottomShape3SExtend2 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 2.3 * boxHeight + 30 + 30
      
    })
    const dropdownBoxBottomShape3SExtend2Text = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 135,
      y: 2.3 * boxHeight + 37.5 + 30,
    });
    dropdownBoxBottomShape3SExtend2Text.textContent = 'Clicked'
    const dropdownBoxBottomShape3SExtend2cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 135,
      y: 2.3 * boxHeight + 30 + 30,
      id: `dropdownBoxBottomShape3SExtend2cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape3SExtend2cover,{
      opacity: 0.3
      }
    )
    
    // subdropdown 右
    const dropdownBoxBottomShape4 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45,
      y: 1.7 * boxHeight + 15 + 30
    })
    
    const dropdownBoxBottomShape4Text = Dom.svg('text', {
       class: 'sqd-task-text',
           x: containerWidths[0] + 45,
           y: 1.85 * boxHeight + 15 + 30,
         });	
    dropdownBoxBottomShape4Text.textContent = 'Once'
    const dropdownBoxBottomShape4cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45,
      y: 1.7 * boxHeight + 15 + 30,
      id:`dropdownBoxBottomShape4cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape4cover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape4S = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45,
      y: 1.7 * boxHeight + 30 + 30
    })

    const dropdownBoxBottomShape4SText = Dom.svg('text', {
       class: 'sqd-task-text',
           x: containerWidths[0] + 45,
           y: 1.85 * boxHeight + 30 + 30,
         });				
    dropdownBoxBottomShape4SText.textContent = 'Multiple '
    const dropdownBoxBottomShape4Scover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] + 45,
      y: 1.7 * boxHeight + 30 + 30,
      id:`dropdownBoxBottomShape4Scover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape4Scover,{
      opacity: 0.3
      }
    )
    
    // subdropdown 中
    // Email Address & Phone Number(保留contains/does not contain/is blank)
    const dropdownBoxBottomShape5 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 15 + 30
      
    })
    const dropdownBoxBottomShape5Text = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45,
          y: 1.85 * boxHeight + 15 + 30
        });
    dropdownBoxBottomShape5Text.textContent = 'Contains'
    const dropdownBoxBottomShape5cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 15 + 30,
      id: `dropdownBoxBottomShape5cover${Date.now()}`

      
    })
    Dom.attrs(dropdownBoxBottomShape5cover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape5S = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 30 + 30
      
    })
    const dropdownBoxBottomShape5SText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45,
          y: 1.85 * boxHeight + 30 + 30,
        });
    dropdownBoxBottomShape5SText.textContent = 'Does not Contain'
    const dropdownBoxBottomShape5Scover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 30 + 30,
      id: `dropdownBoxBottomShape5Scover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape5Scover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape5SS = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 45 + 30
      
    })
    const dropdownBoxBottomShape5SSText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45,
          y: 1.85 * boxHeight + 45 + 30,
        });
    dropdownBoxBottomShape5SSText.textContent = 'Is Blank'
    const dropdownBoxBottomShape5SScover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 45 + 30,
      id: `dropdownBoxBottomShape5SScover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape5SScover,{
      opacity: 0.3
      }
    )

    // name(保留is，is not，contains，does not contain，is blank)
    const dropdownBoxBottomShape5E1 = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 15 + 30
      
    })
    const dropdownBoxBottomShape5E1Text = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45,
          y: 1.85 * boxHeight + 15 + 30
        });
    dropdownBoxBottomShape5E1Text.textContent = 'is'
    const dropdownBoxBottomShape5E1cover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 15 + 30,
      id: `dropdownBoxBottomShape5E1cover${Date.now()}`

      
    })
    Dom.attrs(dropdownBoxBottomShape5E1cover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape5E1S = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 30 + 30
      
    })
    const dropdownBoxBottomShape5E1SText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45,
          y: 1.85 * boxHeight + 30 + 30,
        });
    dropdownBoxBottomShape5E1SText.textContent = 'is not'
    const dropdownBoxBottomShape5E1Scover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 30 + 30,
      id: `dropdownBoxBottomShape5E1Scover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape5E1Scover,{
      opacity: 0.3
      }
    )
    const dropdownBoxBottomShape5E1SS = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 45 + 30
      
    })
    const dropdownBoxBottomShape5E1SSText = Dom.svg('text', {
      class: 'sqd-task-text',
          x: containerWidths[0] - 45,
          y: 1.85 * boxHeight + 45 + 30,
        });
    dropdownBoxBottomShape5E1SSText.textContent = 'Contains'
    const dropdownBoxBottomShape5E1SScover = Dom.svg('rect', {
      width: 60,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45,
      y: 1.7 * boxHeight + 45 + 30,
      id: `dropdownBoxBottomShape5E1SScover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxBottomShape5E1SScover,{
      opacity: 0.3
      }
    )


    const gSubDropdownboxPop = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    const gSubDropdownbox1Pop = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    
    const gSubDropdownbox2Pop = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop`
    });
    const gSubDropdownboxPopExtend = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    const gSubDropdownboxPopSExtend = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    
    const gSubDropdownbox2PopE0 = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    
    const gSubDropdownbox2PopE1 = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });

    // add new condition
    const gSubDropdownbox3Pop = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    const gSubDropdownbox4Pop = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    // [23][1]
    const gSubDropdownbox5Pop = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop`
    });
    const gSubDropdownbox3PopExtend = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    const gSubDropdownbox3PopSExtend = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    // [23][1][0]
    const gSubDropdownbox5PopE0 = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });
    // [23][1][1]
    const gSubDropdownbox5PopE1 = Dom.svg('g', {
      class: `sqd-task-group sub-dropdownbox-pop sqd-hidden`
    });


    const gPopHint = Dom.svg('g', {
      class: `sqd-task-group hint-popup Collapsed`
    });
    const gPopHintRect = Dom.svg('rect', {
      x: containerWidths[0] + textWidth * 2,
      y: 0.5,
      class: 'sqd-task-rect hint-popup sqd-switch',
      width: boxWidth * 2,
      height: boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS,
      id:`hint${Date.now()}`
    });
    const gPopHintText = Dom.svg('text', {
      x: 340,
      y: boxHeight / 2 + 0.5,
      class: 'sqd-task-text hint-popup'
    });
    gPopHintText.textContent = "Please set up your filter";
    // const dropdownBoxCondition = Dom.svg('rect', {
    // 	width: 250,
    // 	height: 20,
    // 	class: 'option select-field',
    // 	fill: "#fff",
    // 	stroke: "#a0a0a0",
    // 	x: containerWidths[0] - 135,
    // 	y: 1.7 * boxHeight - 5,
    // 	z: -1
    // })

  const gAfterDropdown = Dom.svg('g', {
    class: `sqd-task-group dropdown sqd-hidden Collapsed`
  });
  const gGroupInfoAfter = Dom.svg('g', {
  class: `sqd-task-group dropdown Collapsed`
  });
  const gGroupLogicAfter = Dom.svg('text', {
    class: 'sqd-task-text sqd-hidden',
    x: containerWidths[0] - textWidth - 50,
    y: 2.5 * boxHeight - 29.5,
  });
  Dom.attrs(gGroupLogicAfter, {
    //class: 'sqd-hidden',
    id:`dropdownword2after${Date.now()}`
  })
  gGroupLogicAfter.textContent = 'AND/OR'
  const rectGroupAfter = Dom.svg('rect', {
    x: containerWidths[0] - textWidth - 9,
    y: 2 * boxHeight - 29.5 - 10,
    class: 'sqd-task-rect sqd-switch',
    width: boxWidth - 60,
    height: 25,
    rx: RECT_RADIUS,
    ry: RECT_RADIUS,
  });
  Dom.attrs(rectGroupAfter, {
    //class: 'sqd-hidden',
    id:`dropdown${Date.now()}`
  })
  const nameTextGroupAfter = Dom.svg('text', {
  class: 'sqd-task-text',
      x: containerWidths[0] - textWidth - 50,
      y: 2 * boxHeight - 29.5,
    });
  Dom.attrs(nameTextGroupAfter, {
    //class: 'sqd-hidden',
    id:`afterdropdownword1after${Date.now()}`
  })
  nameTextGroupAfter.textContent = 'Group1';
    const rectAfter = Dom.svg('rect', {
      x: 0.5,
      y: PADDING_TOP + boxHeight - 29.5, // 应再减-32并置于底层
      z: 1,
      class: 'sqd-task-rect sqd-switch',
      width: boxWidth,
      height: 2 * boxHeight,
      rx: RECT_RADIUS,
      ry: RECT_RADIUS
    });
    Dom.attrs(rectAfter, {
      //class: 'sqd-hidden',
      id:`dropdown${Date.now()}`
    })
    const nameTextAfter = Dom.svg('text', {
    class: 'sqd-task-text',
        x: containerWidths[0] - textWidth,
        y: 2 * boxHeight - 29.5,
      });
    Dom.attrs(nameTextAfter, {
      //class: 'sqd-hidden',
      id:`afterdropdownword1after${Date.now()}`
    })
    nameTextAfter.textContent = '...';
    const nameTextLogicAfter = Dom.svg('text', {
        class: 'sqd-task-text sqd-hidden',
        x: containerWidths[0] - textWidth,
        y: 2.5 * boxHeight - 29.5,
      });
    Dom.attrs(nameTextLogicAfter, {
      //class: 'sqd-hidden',
      id:`dropdownword2after${Date.now()}`
    })
    nameTextLogicAfter.textContent = 'AND/OR';  // 'Run:'
    

    const gConditionLogicDropdown = Dom.svg('g', {
      class: `sqd-task-group dropdown sqd-hidden Collapsed`
    });
    const dropdownBoxLogicShape = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      
    })
    const dropdownBoxInnerLogicText = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 45 + 20,
      y: 1.85 * boxHeight + 15 - 29.5,
      id: `dropdownword333${Date.now()}`
    });
    dropdownBoxInnerLogicText.textContent = 'and'
    const dropdownBoxLogicShapeAfter = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      id: `logic1after${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxLogicShapeAfter,{
      opacity: 0.3
      }
    )
    const dropdownBoxLogicShapeCover = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field choice sqd-hidden',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      id: `logic1cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxLogicShapeCover,{
      opacity: 0.3
      }
    )
    const dropdownBoxLogicShape1 = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 15 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      
    })
    const dropdownBoxInnerLogicText1 = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 15 + 20,
      y: 1.85 * boxHeight + 15 - 29.5,
      id: `dropdownword333${Date.now()}`
    });
    dropdownBoxInnerLogicText1.textContent = 'or'
    const dropdownBoxLogicShapeAfter1 = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 15 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      id: `dropdownBoxLogicShapeAfter1${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxLogicShapeAfter1,{
      opacity: 0.3
      }
    )
    const dropdownBoxLogicShapeCover1 = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field choice sqd-hidden',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 15 + 20,
      y: 1.7 * boxHeight + 15 - 29.5,
      id: `dropdownBoxLogicShapeCover1${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxLogicShapeCover1,{
      opacity: 0.3
      }
    )
    // [15][2][2]
    gConditionLogicDropdown.appendChild(dropdownBoxLogicShape)
    gConditionLogicDropdown.appendChild(dropdownBoxInnerLogicText)
    gConditionLogicDropdown.appendChild(dropdownBoxLogicShapeAfter)
    gConditionLogicDropdown.appendChild(dropdownBoxLogicShapeCover)
    gConditionLogicDropdown.appendChild(dropdownBoxLogicShape1)
    gConditionLogicDropdown.appendChild(dropdownBoxInnerLogicText1)
    gConditionLogicDropdown.appendChild(dropdownBoxLogicShapeAfter1)
    gConditionLogicDropdown.appendChild(dropdownBoxLogicShapeCover1)

    const gGroupLogicDropdown = Dom.svg('g', {
      class: `sqd-task-group dropdown sqd-hidden Collapsed`
    });
    const dropdownBoxLogicShape2 = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 2.15 * boxHeight + 37.5 - 29.5,
      
    })
    const dropdownBoxInnerLogicText2 = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 45 + 20,
      y: 2.3 * boxHeight + 37.5 - 29.5,
      id: `dropdownword333${Date.now()}`
    });
    dropdownBoxInnerLogicText2.textContent = 'and'
    const dropdownBoxLogicShapeAfter2 = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 2.15 * boxHeight + 37.5 - 29.5,
      id: `logic2after${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxLogicShapeAfter2,{
      opacity: 0.3
      }
    )
    const dropdownBoxLogicShapeCover2 = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field choice sqd-hidden',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 45 + 20,
      y: 2.15 * boxHeight + 37.5 - 29.5,
      id: `logic2cover${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxLogicShapeCover2,{
      opacity: 0.3
      }
    )
    const dropdownBoxLogicShape3 = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 15 + 20,
      y: 2.15 * boxHeight + 37.5 - 29.5,
      
    })
    const dropdownBoxInnerLogicText3 = Dom.svg('text', {
      class: 'sqd-task-text',
      x: containerWidths[0] - 15 + 20,
      y: 2.3 * boxHeight + 37.5 - 29.5,
      id: `dropdownword333${Date.now()}`
    });
    dropdownBoxInnerLogicText3.textContent = 'or'
    const dropdownBoxLogicShapeAfter3 = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field choice',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 15 + 20,
      y: 2.15 * boxHeight + 37.5 - 29.5,
      id: `dropdownBoxLogicShapeAfter3${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxLogicShapeAfter3,{
      opacity: 0.3
      }
    )
    const dropdownBoxLogicShapeCover3 = Dom.svg('rect', {
      width: 30,
      height: 15,
      class: 'option select-field choice sqd-hidden',
      fill: "#fff",
      stroke: "#a0a0a0",
      x: containerWidths[0] - 15 + 20,
      y: 2.15 * boxHeight + 37.5 - 29.5,
      id: `dropdownBoxLogicShapeCover3${Date.now()}`
      
    })
    Dom.attrs(dropdownBoxLogicShapeCover3,{
      opacity: 0.3
      }
    )
    // [15][3]
    gGroupLogicDropdown.appendChild(dropdownBoxLogicShape2)
    gGroupLogicDropdown.appendChild(dropdownBoxInnerLogicText2)
    gGroupLogicDropdown.appendChild(dropdownBoxLogicShapeAfter2)
    gGroupLogicDropdown.appendChild(dropdownBoxLogicShapeCover2)
    gGroupLogicDropdown.appendChild(dropdownBoxLogicShape3)
    gGroupLogicDropdown.appendChild(dropdownBoxInnerLogicText3)
    gGroupLogicDropdown.appendChild(dropdownBoxLogicShapeAfter3)
    gGroupLogicDropdown.appendChild(dropdownBoxLogicShapeCover3)


  
    // [18][1]
    gGroupInfoAfter.appendChild(rectGroupAfter)
    gGroupInfoAfter.append(nameTextGroupAfter)
    gGroupInfoAfter.appendChild(nameTextAfter)
    gGroupInfoAfter.appendChild(nameTextLogicAfter)
    // [18]
    gAfterDropdown.appendChild(rectAfter)
    gAfterDropdown.appendChild(gGroupInfoAfter)
    gAfterDropdown.appendChild(gGroupLogicAfter)
  //   gAfterDropdown.appendChild(nameTextAfter)  // former[18][1]
  //   gAfterDropdown.appendChild(nameTextLogicAfter)  // logic  former[18][2]

    // gAfterDropdown.appendChild(nameText2After)

    gPopHint.appendChild(gPopHintRect);
    gPopHint.appendChild(gPopHintText);

    gUpPop3.appendChild(icon4)
    gUpPop3.appendChild(icon5)
    gUpPop3.appendChild(icon6)

    // subdropdown 左 [15][2][1][0][1]
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeText)
    gSubDropdownboxPop.insertBefore(dropdownBoxBottomShape,dropdownBoxBottomShapeText)
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShapecover)
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeSText)
    gSubDropdownboxPop.insertBefore(dropdownBoxBottomShapeS,dropdownBoxBottomShapeSText)
    gSubDropdownboxPop.appendChild(dropdownBoxBottomShapeScover)

    gSubDropdownboxPop.appendChild(dropdownBoxButtonShapeRightBtn)
    gSubDropdownboxPop.appendChild(dropdownBoxButtonShapeSRightBtn)

    // Contact Info [15][2][1][0][1][8]
    gSubDropdownboxPopExtend.appendChild(dropdownBoxBottomShapeExtend1)
    gSubDropdownboxPopExtend.appendChild(dropdownBoxBottomShapeExtend1Text)
    gSubDropdownboxPopExtend.appendChild(dropdownBoxBottomShapeExtend1cover)
    gSubDropdownboxPopExtend.appendChild(dropdownBoxBottomShapeExtend2)
    gSubDropdownboxPopExtend.appendChild(dropdownBoxBottomShapeExtend2Text)
    gSubDropdownboxPopExtend.appendChild(dropdownBoxBottomShapeExtend2cover)
    gSubDropdownboxPopExtend.appendChild(dropdownBoxBottomShapeExtend3)
    gSubDropdownboxPopExtend.appendChild(dropdownBoxBottomShapeExtend3Text)
    gSubDropdownboxPopExtend.appendChild(dropdownBoxBottomShapeExtend3cover)

    gSubDropdownboxPop.appendChild(gSubDropdownboxPopExtend)

    // Actions [15][2][1][0][1][9]
    gSubDropdownboxPopSExtend.appendChild(dropdownBoxBottomShapeSExtend1)
    gSubDropdownboxPopSExtend.appendChild(dropdownBoxBottomShapeSExtend1Text)
    gSubDropdownboxPopSExtend.appendChild(dropdownBoxBottomShapeSExtend1cover)
    gSubDropdownboxPopSExtend.appendChild(dropdownBoxBottomShapeSExtend2)
    gSubDropdownboxPopSExtend.appendChild(dropdownBoxBottomShapeSExtend2Text)
    gSubDropdownboxPopSExtend.appendChild(dropdownBoxBottomShapeSExtend2cover)

    gSubDropdownboxPop.appendChild(gSubDropdownboxPopSExtend)

    // subdropdown 右 // [15][2][1][1][1]
    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Text)
    gSubDropdownbox1Pop.insertBefore(dropdownBoxBottomShape1,dropdownBoxBottomShape1Text)
    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1cover)
    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1SText)
    gSubDropdownbox1Pop.insertBefore(dropdownBoxBottomShape1S,dropdownBoxBottomShape1SText)
    gSubDropdownbox1Pop.appendChild(dropdownBoxBottomShape1Scover)

    // subdropdown 中 
    // Email & Phone Number [15][2][1][2][1][0]
    gSubDropdownbox2PopE0.appendChild(dropdownBoxBottomShape2Text)
    gSubDropdownbox2PopE0.insertBefore(dropdownBoxBottomShape2,dropdownBoxBottomShape2Text)
    gSubDropdownbox2PopE0.appendChild(dropdownBoxBottomShape2cover)
    gSubDropdownbox2PopE0.appendChild(dropdownBoxBottomShape2SText)
    gSubDropdownbox2PopE0.insertBefore(dropdownBoxBottomShape2S,dropdownBoxBottomShape2SText)
    gSubDropdownbox2PopE0.appendChild(dropdownBoxBottomShape2Scover)
    gSubDropdownbox2PopE0.appendChild(dropdownBoxBottomShape2SSText)
    gSubDropdownbox2PopE0.insertBefore(dropdownBoxBottomShape2SS,dropdownBoxBottomShape2SSText)
    gSubDropdownbox2PopE0.appendChild(dropdownBoxBottomShape2SScover)
    
    // Name [15][2][1][2][1][1]
    gSubDropdownbox2PopE1.appendChild(dropdownBoxBottomShape2E1Text)
    gSubDropdownbox2PopE1.insertBefore(dropdownBoxBottomShape2E1,dropdownBoxBottomShape2E1Text)
    gSubDropdownbox2PopE1.appendChild(dropdownBoxBottomShape2E1cover)
    gSubDropdownbox2PopE1.appendChild(dropdownBoxBottomShape2E1SText)
    gSubDropdownbox2PopE1.insertBefore(dropdownBoxBottomShape2E1S,dropdownBoxBottomShape2E1SText)
    gSubDropdownbox2PopE1.appendChild(dropdownBoxBottomShape2E1Scover)
    gSubDropdownbox2PopE1.appendChild(dropdownBoxBottomShape2E1SSText)
    gSubDropdownbox2PopE1.insertBefore(dropdownBoxBottomShape2E1SS,dropdownBoxBottomShape2E1SSText)
    gSubDropdownbox2PopE1.appendChild(dropdownBoxBottomShape2E1SScover)

    // 中[15][2][1][2][1]
    gSubDropdownbox2Pop.appendChild(gSubDropdownbox2PopE0)
    gSubDropdownbox2Pop.appendChild(gSubDropdownbox2PopE1)

    // 左[15][2][1][0][0]
    gSubDropdownbox.appendChild(dropdownRightButton)
    gSubDropdownbox.insertBefore(dropdownBoxShape, dropdownRightButton)
    gSubDropdownbox.appendChild(dropdownBoxInnerText)
    gSubDropdownbox.appendChild(dropdownBoxShapeAfter)

    // 左[15][2][1][0]
    gSubDropdown.appendChild(gSubDropdownbox)
    gSubDropdown.appendChild(gSubDropdownboxPop)

    // 右[15][2][1][1][0]
    gSubDropdownbox1.appendChild(dropdownRightButton1)
    gSubDropdownbox1.insertBefore(dropdownBoxShape1, dropdownRightButton1)
    gSubDropdownbox1.appendChild(dropdownBoxInnerText1)
    gSubDropdownbox1.appendChild(dropdownBoxShape1After)

    // 右[15][2][1][1]
    gSubDropdown1.appendChild(gSubDropdownbox1)
    gSubDropdown1.appendChild(gSubDropdownbox1Pop)

    // 中[15][2][1][2][0]
    gSubDropdownbox2.appendChild(dropdownRightButton2)
    gSubDropdownbox2.insertBefore(dropdownBoxShape2, dropdownRightButton2)
    gSubDropdownbox2.appendChild(dropdownBoxInnerText2)
    gSubDropdownbox2.appendChild(dropdownBoxShape2After)

    // 中[15][2][1][2]
    gSubDropdown2.appendChild(gSubDropdownbox2)
    gSubDropdown2.appendChild(gSubDropdownbox2Pop)

    

    
    // [15][2][1]
    gSubDropdownConditionInfo.appendChild(gSubDropdown)
    gSubDropdownConditionInfo.appendChild(gSubDropdown1)
    gSubDropdownConditionInfo.appendChild(gSubDropdown2)

    // [15][2][0]
    gAddConditionButton.appendChild(rect2)
    gAddConditionButton.appendChild(nameText2)
    gAddConditionButton.appendChild(rect2cover)

    // [15][2]
    gSubDropdownGroupInfo.appendChild(gAddConditionButton)
    gSubDropdownGroupInfo.appendChild(gSubDropdownConditionInfo)  // [15][2][1]
    gSubDropdownGroupInfo.appendChild(gConditionLogicDropdown)

    // [15][1]
    gAddGroupButton.appendChild(rect3)
    gAddGroupButton.appendChild(nameText3)
    gAddGroupButton.appendChild(rect3cover)
    
    // [15]
    gDropdown.appendChild(rect1)
    gDropdown.appendChild(gAddGroupButton)
    gDropdown.appendChild(gSubDropdownGroupInfo)  // [15][2]
    gDropdown.appendChild(gGroupLogicDropdown)

    gRightPop3.appendChild(icon1);
    gRightPop3.appendChild(icon2);
    gRightPop3.appendChild(icon3);
    g1.insertBefore(rectLeft, text);
    g1.appendChild(moreIcon);
    g1.appendChild(text1);
    g.appendChild(g1);
    g.appendChild(gRightPop3);
    g.appendChild(gDropdown)  // 15
    // g.appendChild(gSubDropdown1)  // former[16] 右
    // g.appendChild(gSubDropdown) // former[17] 左
    g.appendChild(gUpPop3)  // 16 former[18]
    // g.appendChild(gSubDropdown2)  // former[19] 中
    g.appendChild(gPopHint) // 17 former[20]
    // add new condition
    // g.appendChild(gSubDropdown3)
    // g.appendChild(gSubDropdown4)
    // g.appendChild(gSubDropdown5)
    // add afterdropdown
    g.appendChild(gAfterDropdown)  // 18 former[24]

    // g.appendChild(gLogicDropdown)  // former[25]
    //g.appendChild(gSubDropdownGroupInfo)  // condition:[19][0] (左右中)
    // g.appendChild(dropdownBoxCondition)

    // Edit
    moreIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      gRightPop3.classList.toggle("sqd-hidden");
      gPopHint.classList.toggle("sqd-hidden");
      if (!gUpPop3.classList.contains("sqd-hidden")) {
        gUpPop3.classList.toggle("sqd-hidden");
      }
      if (!gDropdown.classList.contains("sqd-hidden")) {
        gDropdown.classList.toggle("sqd-hidden");
      }
    })
    //right popout delete
    // const fakeThis: any
    // gRightPop3.childNodes[1].addEventListener("click",function(){
    //   promptChoices(fakeThis);
    // })
    // show dropdown
    gRightPop3.childNodes[2].addEventListener("click", function(){
      gRightPop3.classList.toggle("sqd-hidden");
      gDropdown.classList.toggle("sqd-hidden");
      gUpPop3.classList.toggle("sqd-hidden");
      g1.childNodes[4].textContent = 'Condition Settings'
    })

    // add new condition

    const lastGroupInfoNum = gDropdown.childNodes.length-2
    const addConditionBut = gDropdown.childNodes[lastGroupInfoNum].childNodes[0].childNodes[2]
    addConditionBut.addEventListener('click', function(){
      const subDropDownLen = gDropdown.childNodes[lastGroupInfoNum].childNodes.length
      // 克隆最后一个condition及其下方logic
      // condition
      const duplicateNode1 = gDropdown.childNodes[lastGroupInfoNum].childNodes[subDropDownLen-2].cloneNode(true)
      gDropdown.childNodes[lastGroupInfoNum].appendChild(duplicateNode1)
      // logic
      const duplicateNode2 = gDropdown.childNodes[lastGroupInfoNum].childNodes[subDropDownLen-1].cloneNode(true)
      gDropdown.childNodes[lastGroupInfoNum].appendChild(duplicateNode2)
    })
    // 取最后一个condition（一般为倒数第二位node），改变其位置（原始位置与复制前重合）
    // const newCondition1 = gDropdown.childNodes[lastGroupInfoNum].childNodes[gDropdown.childNodes[lastGroupInfoNum].childNodes.length-2].childNodes
    // //console.log(7189, newCondition1)
    // for(let i = 0; i < newCondition1.length; i++){	//  [15][2][2]
    //   //console.log(7191,newCondition1[i].childNodes)
    //   const newConditionEach = newCondition1[i].childNodes
    //   for(let k = 0; k < newConditionEach.length; k++){  //  [15][2][2][0]
    //     //console.log(7194, newConditionEach[k].childNodes);
    //     const newConditionEach1 = newConditionEach[k].childNodes
    //     for (let j = 0; j < newConditionEach1.length; j++){  //  [15][2][2][0][0]
    //       let cordy: number = Number(newConditionEach1[j].getAttribute('y'))
    //       newConditionEach1[j].setAttribute('y', cordy+35)
    //       const formerID = newConditionEach1[j].getAttribute('id')
    //       if(formerID != null){
    //         newConditionEach1[j].setAttribute('id', i.toString()+j.toString()+k.toString()+`${Date.now()}`)
    //         // console.log(7200, i, k ,j)
    //       }
    //     } 
    //   }
    // }
    // const newCondition0 = gDropdown.childNodes[lastGroupInfoNum].childNodes[gDropdown.childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes
    // for(let i = 0; i < newCondition0.length; i++){
    //   const cordy = parseInt(newCondition0[i].getAttribute('y'))
    //   newCondition0[i].setAttribute('y', cordy+35)
    //   const formerID = newCondition0[i].getAttribute('id')
    //   if(formerID != null){
    //     newCondition0[i].setAttribute('id', Math.random().toString()+`${Date.now()}`)
    //   }
    // }
    // const newCondition00 = gDropdown.childNodes[lastGroupInfoNum].childNodes[gDropdown.childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].childNodes
    // for(let i = 0; i < newCondition00.length; i++){
    //   const cordy = parseInt(newCondition00[i].getAttribute('y'))
    //   newCondition00[i].setAttribute('y', cordy+35)
    //   const formerID = newCondition00[i].getAttribute('id')
    //   if(formerID != null){
    //     newCondition00[i].setAttribute('id', Math.random().toString()+`${Date.now()}`)
    //   }
    // }
    // const newCondition22 = gDropdown.childNodes[lastGroupInfoNum].childNodes[gDropdown.childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes
    // for(let i = 0; i < newCondition22.length; i++){
    //   const newConditionEach22 = newCondition22[i].childNodes
    //   for(let j = 0; j < newConditionEach22.length; j++){
    //     const cordy = parseInt(newConditionEach22[j].getAttribute('y'))
    //     newConditionEach22[j].setAttribute('y', cordy+35)
    //     const formerID = newConditionEach22[j].getAttribute('id')
    //     if(formerID != null){
    //       newConditionEach22[j].setAttribute('id', Math.random().toString()+`${Date.now()}`)
    //     }
    //   }
      
    // }


    JoinView.createStraightJoin(g, new Vector(containerWidths[0], 0), PADDING_TOP + boxHeight);
    //const iconUrl = configuration.iconUrlProvider ? configuration.iconUrlProvider(step.componentType, step.type) : null;
    const inputView = InputView.createRoundInput(g, containerWidths[0], 0);
    JoinView.createJoins(
      g,
      new Vector(containerWidths[0], PADDING_TOP + LABEL_HEIGHT + boxHeight / 2),
      containerOffsets.map((o, i) => new Vector(o + joinXs[i] + PADDING_X$1, PADDING_TOP + LABEL_HEIGHT + CONNECTION_HEIGHT + boxHeight / 2))
    );
    //JoinView.createJoins(g, new Vector(containerWidths[0], containerHeight), containerOffsets.map((o, i) => new Vector(o + joinXs[i] + PADDING_X$1, PADDING_TOP + CONNECTION_HEIGHT + LABEL_HEIGHT * 2 + maxChildHeight)));
    const regionView = RegionView.create(g, containerWidths, containerHeight);
    const validationErrorView = ValidationErrorView.create(g, containersWidth, 0);
    return new SwitchStepComponentView(
      g,
      containersWidth,
      containerHeight,
      containerWidths[0],
      sequenceComponents,
      regionView,
      inputView,
      validationErrorView,
      // icon1,
      // icon2,
      // icon3
    );

    
  }
  private constructor(
    public readonly g: SVGGElement,
    public readonly width: number,
    public readonly height: number,
    public readonly joinX: number,
    public readonly sequenceComponents: SequenceComponent[],
    private readonly regionView: RegionView,
    private readonly inputView: InputView,
    private readonly validationErrorView: ValidationErrorView
  ) // public readonly icon1: SVGElement,
  // public readonly icon2: SVGElement,
  // public readonly icon3: SVGElement
  {}

  public getClientPosition(): Vector {
    return this.regionView.getClientPosition();
  }

  public containsElement(element: Element): boolean {
    return this.g.contains(element);
  }

  public setIsDragging(isDragging: boolean) {
    this.inputView.setIsHidden(isDragging);
  }

  public setIsSelected(isSelected: boolean) {
    this.regionView.setIsSelected(isSelected);
  }

  public setIsDisabled(isDisabled: boolean) {
    Dom.toggleClass(this.g, isDisabled, "sqd-disabled");
  }

  public setIsValid(isValid: boolean) {
    this.validationErrorView.setIsHidden(isValid);
  }

  // Edit
  
  
    
  //console.log('aaa');
  // startBehavior(target, position, forceMoveMode) {
  //   const title = document.getElementsByClassName("info-box-title")[0];
  //   this.context.definition.properties.journeyName = title.textContent;
  // private onTouchStart(position: Vector) {
  //   const element = document.elementFromPoint(position.x, position.y);
  //   if (element) {
  //     this.startBehavior(element, position, false);
  //   }
  // }
  // private startBehavior(
  //   target: Element,
  //   position: Vector,
  //   forceMoveMode: boolean
  // ){
    
  //   const title = document.getElementsByClassName("info-box-title")[0];
  //   this.context.definition.properties.journeyName = String(title.textContent);
  //   const clickedStep =
  //     !forceMoveMode && !this.context.isMoveModeEnabled
  //       ? this.getRootComponent().findByElement(target as Element)
  //       : null;
        // this.context.behaviorController.start(
        //   position,
        //   SelectStepBehavior.create(clickedStep, this.context)
        // );
        // const fakeThis = this.context;
  // if (clickedStep) {
  //   this.context.behaviorController.start(
  //   position,
  //   SelectStepBehavior.create(clickedStep, this.context)
  //   );
  //   const fakeThis = this.context;
  // // if(clickedStep.step.componentType === 'switch'){
  //   //click right popout
  //   //console.log(3874, clickedStep.view.g.childNodes[13])
  //   //console.log(5278)
  // if(clickedStep.view.g.childNodes[13].childNodes[3].id){
  //   const switchMoreButtonId = clickedStep.view.g.childNodes[13].childNodes[3].id.toString();
  //   const switchMoreButton = document.getElementById(switchMoreButtonId)
  //   //add mouseover event
  //   // switchMoreButton.addEventListener('mouseover', function() {
  //   // 	//console.log(3752, clickedStep.view.g.childNodes)
  //   // 	clickedStep.view.g.childNodes[20].classList.toggle('sqd-hidden');
  //   // })
  //   // switchMoreButton.addEventListener('mouseout', function() {
  //   // 	//console.log(3650, 'mouseout')
  //   // 	clickedStep.view.g.childNodes[20].classList.toggle('sqd-hidden');
  //   // })
  //   switchMoreButton.onclick = function() {
  //     console.log(3467, clickedStep.view.g.childNodes)
  //     clickedStep.view.g.childNodes[14].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[17].classList.add('sqd-hidden');
  //   }
  // }
  // // pophint
  // if(clickedStep.view.g.childNodes[17].childNodes[0].id){
  //   const hintButtonId = clickedStep.view.g.childNodes[17].childNodes[0].id.toString();
  //   const hintButton = document.getElementById(hintButtonId)
  //   hintButton.onclick = function() {
  //     console.log(3467, clickedStep.view.g.childNodes)
  //     clickedStep.view.g.childNodes[17].classList.add('sqd-hidden');
  //   }
  // }
  // //right popout delete
  // if(clickedStep.view.g.childNodes[14].childNodes[1].id){
  //   const deleteButtonId = clickedStep.view.g.childNodes[14].childNodes[1].id.toString();
  //   const deleteButton = document.getElementById(deleteButtonId)
  //   deleteButton.onclick = function(){
  //     promptChoices(fakeThis);
  //   }
  // }
  // // // up-pop: finish
  // // if(clickedStep.view.g.childNodes[16].childNodes[0]){
  // // 	const checkButtonId = clickedStep.view.g.childNodes[16].childNodes[0].id.toString();
  // // 	const checkButton =  document.getElementById(checkButtonId);
  // // 	checkButton.onclick = function(e){
  // // 		console.log(4023, clickedStep.view.g.childNodes)
  // // 		// 区分单个condition还是多个
  // // 		if(
  // // 		clickedStep.view.g.childNodes[15].childNodes[2].childNodes.length > 3){
  // // 			clickedStep.view.g.childNodes[18].classList.toggle('sqd-hidden');
  // // 			console.log(7103)
  // // 		}
  // // 		clickedStep.view.g.childNodes[15].classList.toggle('sqd-hidden');
  // // 		clickedStep.view.g.childNodes[16].classList.toggle('sqd-hidden');
      
  // // 	}
  // // }
  // if(clickedStep.view.g.childNodes[16].childNodes[1]){
  //   const deleteUpperButtonId = clickedStep.view.g.childNodes[16].childNodes[1].id.toString();
  //   //console.log(4032,deleteUpperButtonId)
  //   const deleteUpperButton =  document.getElementById(deleteUpperButtonId);
  //   deleteUpperButton.onclick = function(e){
  //     fakeThis.tryDeleteStep(clickedStep.step, 2);
  //   }
  // }
  // //dropdown
  // if(clickedStep.view.g.childNodes[14].childNodes[2].id){
  //   const dropdownButId = clickedStep.view.g.childNodes[14].childNodes[2].id.toString();
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   // console.log(3181, clickedStep.view.g.childNodes)
  //   dropdownBut.onclick = function(e){
  //     e.stopPropagation();
  //     clickedStep.view.g.childNodes[14].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].classList.toggle('sqd-hidden');
  //     // clickedStep.view.g.childNodes[16].classList.toggle('sqd-hidden');
  //     // clickedStep.view.g.childNodes[17].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[16].classList.toggle('sqd-hidden');
  //     //clickedStep.view.g.childNodes[19].classList.toggle('sqd-hidden');
      
  //     clickedStep.view.g.childNodes[13].childNodes[4].textContent = 'Condition Settings'
  //   }
  // }

  // // add new condition [15][2][0]

  // const lastGroupInfoNum = clickedStep.view.g.childNodes[15].childNodes.length-2
  
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[2].id){
  //   //console.log('lastGroupInfoNum: ', lastGroupInfoNum)
  //   //console.log(4578, clickedStep.view.g.childNodes[15].childNodes[2].childNodes[0].childNodes[2].id)
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[2].id.toString();
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   // console.log(5372, addNew)
  //   // const tempContext = this.context;
  //   dropdownBut.onclick = function(e){
  //     e.stopPropagation();
  //     //console.log('aaa')
  //     const subDropDownLen = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length
  //     // console.log(9999, subDropDownLen)
      
  //     // 克隆最后一个condition及其下方logic
  //     // condition
  //     const duplicateNode1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[subDropDownLen-2].cloneNode(true)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].appendChild(duplicateNode1)
  //     // logic
  //     const duplicateNode2 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[subDropDownLen-1].cloneNode(true)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].appendChild(duplicateNode2)
      
  //     // 取最后一个condition（一般为倒数第二位node），改变其位置（原始位置与复制前重合）
  //     const newCondition1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes
  //     //console.log(7189, newCondition1)
  //     for(let i = 0; i < newCondition1.length; i++){	//  [15][2][2]
  //       //console.log(7191,newCondition1[i].childNodes)
  //       const newConditionEach = newCondition1[i].childNodes
  //       for(let k = 0; k < newConditionEach.length; k++){  //  [15][2][2][0]
  //         //console.log(7194, newConditionEach[k].childNodes);
  //         const newConditionEach1 = newConditionEach[k].childNodes
  //         for (let j = 0; j < newConditionEach1.length; j++){  //  [15][2][2][0][0]
  //           //console.log(7196, newConditionEach1[j])
  //           // const newConditionEach2 = newConditionEach1[j].childNodes
  //     // 			// for (let l = 0; l < newConditionEach2.length; l++){
  //             const cordy = parseInt(newConditionEach1[j].getAttribute('y'))
  //             newConditionEach1[j].setAttribute('y', cordy+35)
  //             const formerID = newConditionEach1[j].getAttribute('id')
  //             if(formerID != null){
  //               newConditionEach1[j].setAttribute('id', i.toString()+j.toString()+k.toString()+`${Date.now()}`)
  //               // console.log(7200, i, k ,j)
  //             }
  //           }
            
  //         }
  //     }
  //     const newCondition0 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes
      
  //     for(let i = 0; i < newCondition0.length; i++){
  //       //console.log(7214, newCondition0[i])
  //       const cordy = parseInt(newCondition0[i].getAttribute('y'))
  //       newCondition0[i].setAttribute('y', cordy+35)
  //       const formerID = newCondition0[i].getAttribute('id')
  //       if(formerID != null){
  //         newCondition0[i].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //         //console.log(7200, i)
  //       }
  //     }
  //     const newCondition00 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].childNodes
      
  //     for(let i = 0; i < newCondition00.length; i++){
  //       //console.log(7214, newCondition0[i])
  //       const cordy = parseInt(newCondition00[i].getAttribute('y'))
  //       newCondition00[i].setAttribute('y', cordy+35)
  //       const formerID = newCondition00[i].getAttribute('id')
  //       if(formerID != null){
  //         newCondition00[i].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //         //console.log(7200, i)
  //       }
  //     }
  //     const newCondition22 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes
  //     //console.log(7236, newCondition22)
  //     for(let i = 0; i < newCondition22.length; i++){
  //       const newConditionEach22 = newCondition22[i].childNodes
  //       for(let j = 0; j < newConditionEach22.length; j++){
  //         // console.log(7238, newConditionEach22[j])
  //         const cordy = parseInt(newConditionEach22[j].getAttribute('y'))
  //         // console.log(7238, cordy)
  //         newConditionEach22[j].setAttribute('y', cordy+35)
  //         const formerID = newConditionEach22[j].getAttribute('id')
  //         if(formerID != null){
  //           newConditionEach22[j].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //           // console.log(7200, i, k ,j)
  //         }
  //       }
        
  //     }

  //     // 取最后一个logic（一般为倒数第一位node），改变其位置（原始位置与复制前重合），不显示
  //     const newCondition2 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-1].childNodes
  //     //console.log(7199, newCondition2)
  //     // const newConditionEach2 = newCondition2.childNodes
  //     // console.log(7191, newConditionEach);
  //     for (let k = 0; k < newCondition2.length; k++){
  //       const cordy = parseInt(newCondition2[k].getAttribute('y'))
  //       newCondition2[k].setAttribute('y', cordy+35)
  //       const formerID2 = newCondition2[k].getAttribute('id')
  //       if(formerID2 != null){
  //         //console.log(7292, formerID2)
  //         newCondition2[k].setAttribute('id', Math.random().toString() + Math.random().toString()+`${Date.now()}`)
  //         //console.log(7292, newCondition2[k].getAttribute('id'))
  //       }
  //       // console.log(7214, cordy);
  //     }

  //     // // 显示倒数第二个logic（一般为倒数第三位node）
  //     //console.log('bbb')
  //     // console.log(9999, clickedStep.view.g.childNodes[15].childNodes[2].childNodes[clickedStep.view.g.childNodes[15].childNodes[2].childNodes.length-3].classList)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-3].classList.toggle('sqd-hidden')
  //     // console.log(9999, clickedStep.view.g.childNodes[15].childNodes[2].childNodes[clickedStep.view.g.childNodes[15].childNodes[2].childNodes.length-3].classList)

  //     // // 伸长dropdownbox,下移AddGroupButton和AddConditionButton和GroupLogicDropdown
  //     const dropdownAttribute = clickedStep.view.g.childNodes[15].childNodes
  //     for(let i = 0; i < dropdownAttribute.length; i++){
  //       // 伸长dropdownbox
  //       if(i == 0){
  //         const height = parseInt(dropdownAttribute[i].getAttribute('height'))
  //         dropdownAttribute[i].setAttribute('height', height+35)
  //       }
  //       // 下移AddGroupButton
  //       else if(i == 1){
  //         const groupButtonAttr = dropdownAttribute[i].childNodes
  //         for(let j = 0; j < groupButtonAttr.length; j++){
  //           const cordy = parseInt(groupButtonAttr[j].getAttribute('y'))
  //           groupButtonAttr[j].setAttribute('y', cordy+35)
  //         }
  //       }
  //       // 下移AddConditionButton, [15]倒数第二个node中的第0个node
  //       else if(i == lastGroupInfoNum){
  //         const conditionButtonAttr = dropdownAttribute[i].childNodes[0].childNodes
  //         for(let j = 0; j < conditionButtonAttr.length; j++){
  //           const cordy = parseInt(conditionButtonAttr[j].getAttribute('y'))
  //           conditionButtonAttr[j].setAttribute('y', cordy+35)
  //         }
  //       }
  //       // 下移GroupLogicDropdown，[15]倒数第一个node
  //       else if(i == clickedStep.view.g.childNodes[15].childNodes.length - 1){
  //         const groupLogicAttr = dropdownAttribute[i].childNodes
  //         for(let j = 0; j < groupLogicAttr.length; j++){
  //           const cordy = parseInt(groupLogicAttr[j].getAttribute('y'))
  //           groupLogicAttr[j].setAttribute('y', cordy+35)
  //         }
  //       }
  //     }

  //     // 克隆afterdropdown
  //     // 倒数第一个group
  //     const lastGroupAfter = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2]
  //     // 倒数第一个group中的倒数第一个condition
  //     const lastConditionAfter = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes.length-2]
  //     // 倒数第一个group中的倒数第一个logic
  //     const lastLogicAfter = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes.length-1]
  //     // condition
  //     //console.log(7018, lastConditionAfter)
  //     const duplicateNode3 = lastConditionAfter.cloneNode(true)
  //     //console.log(7019, duplicateNode3)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].appendChild(duplicateNode3)
  //     // logic
  //     const duplicateNode4 = lastLogicAfter.cloneNode(true)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].appendChild(duplicateNode4)

  //     // 改变其位置/id
  //     // 克隆过后与原始位置重合的最后一个condition
  //     const afterDropDownAttr1 = lastGroupAfter.childNodes[lastGroupAfter.childNodes.length-2]
  //     const cordy1 = parseInt(afterDropDownAttr1.getAttribute('y'))
  //     afterDropDownAttr1.setAttribute('y', cordy1+35)
  //     // const formerID1 = afterDropDownAttr1.getAttribute('id')
  //     // if(formerID1 != null){
        
  //     // 	afterDropDownAttr1.setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //     // }
  //     // logic
  //     const afterDropDownAttr2 = lastGroupAfter.childNodes[lastGroupAfter.childNodes.length-1]
  //     const cordy2 = parseInt(afterDropDownAttr2.getAttribute('y'))
  //     afterDropDownAttr2.setAttribute('y', cordy2+35)
      

  //     // 显示lastGroup倒数第二个logic
  //     //console.log(7295, clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-3].classList)
  //     lastGroupAfter.childNodes[lastGroupAfter.childNodes.length-3].classList.toggle('sqd-hidden')
  //     //console.log(7297, clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-3].classList)

  //     // 伸长afterdropdownbox和rectGroupAfter
  //     const afterDropDownAttr3 = clickedStep.view.g.childNodes[18].childNodes[0]
  //     const height3 = parseInt(afterDropDownAttr3.getAttribute('height'))
  //     afterDropDownAttr3.setAttribute('height', height3+35)
  //     const rectGroupAttr = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes[0]
  //     const height4 = parseInt(rectGroupAttr.getAttribute('height'))
  //     rectGroupAttr.setAttribute('height', height4+35)

  //     // 设定并移位group number
  //     const groupNum = parseInt(clickedStep.view.g.childNodes[18].childNodes.length / 2)
  //     //console.log(7056, groupNum)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[1].textContent = 'Group' + groupNum.toString()
  //     //const nameTextGroupAttr = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[1]
  //     const cordyRectGroupAfter = parseInt(clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[0].getAttribute('y'))
  //     const height5 = parseInt(clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[0].getAttribute('height'))
  //     //console.log('height', height5, cordyRectGroupAfter)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[1].setAttribute('y', cordyRectGroupAfter + height5*0.5)
  //   }
  // }

  // // add new condition
  // // logic 设定afterdropdown AND/OR
  // // AND
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length > 3){
  //   //console.log(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-3)
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-3].childNodes[2].id.toString();
  //   //
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   // console.log(9999, dropdownBut)
  //   dropdownBut.onclick = function(){
  //     // clickedStep.view.g.childNodes[25].childNodes[3].classList.remove('sqd-hidden');
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-3].childNodes[1].textContent
  //     //console.log(7304, showVal)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes[clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes.length-3].textContent = showVal
  //   }
  // }
  // // OR
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length > 3){
  //   //console.log(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-3)
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-3].childNodes[6].id.toString();
    
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   // console.log(9999, dropdownBut)
  //   dropdownBut.onclick = function(){
  //     // clickedStep.view.g.childNodes[25].childNodes[3].classList.remove('sqd-hidden');
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-3].childNodes[5].textContent
  //     //console.log(7304, showVal)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes[clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes.length-3].textContent = showVal
  //   }
  // }
  

  // // add new group [15][1]

  // if(clickedStep.view.g.childNodes[15].childNodes[1].childNodes[2].id){
    
  //   //console.log(4578, clickedStep.view.g.childNodes[15].childNodes[2].childNodes[0].childNodes[2].id)
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[1].childNodes[2].id.toString();
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   // console.log(5372, addNew)
  //   // const tempContext = this.context;
  //   dropdownBut.onclick = function(e){
  //     console.log('group')
      
  //     // // 克隆最后一次的SubDropdownGroupInfo, 移除多余node，再克隆gGroupLogicDropdown插入队尾
  //     const duplicateGroupNode = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length-2].cloneNode(true)
  //     // for(let i = 0; i < duplicateGroupNode.childNodes.length; i++){
  //     while(duplicateGroupNode.childNodes.length > 3){
  //       //console.log(7062)
  //       //duplicateGroupNode.childNodes[duplicateGroupNode.childNodes.length - 1].classList.toggle('sqd-hidden')
  //       const removeNode = duplicateGroupNode.childNodes[duplicateGroupNode.childNodes.length - 1]
  //       //console.log(removeNode)
  //       duplicateGroupNode.removeChild(removeNode)
  //     }
  //     //console.log('dup', duplicateGroupNode)
  //     const duplicateGroupNode1 = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length-1].cloneNode(true)
  //     //console.log(7061, duplicateGroupNode, duplicateGroupNode1)
  //     clickedStep.view.g.childNodes[15].appendChild(duplicateGroupNode)
  //     clickedStep.view.g.childNodes[15].appendChild(duplicateGroupNode1)

  //     // 取最后一个group（一般为倒数第二位node），改变其位置（原始位置与复制前重合）
  //     const newGroup = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length-2].childNodes
  //     //console.log(7440, clickedStep.view.g.childNodes[15].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[2].childNodes.length)
  //     for(let i = 0; i < newGroup.length; i++){
  //       // 改变SubDropdownGroupInfo位置
  //       if(i == 1){
  //         const newGroupConditionInfo = newGroup[i].childNodes
  //         for(let j = 0; j < newGroupConditionInfo.length; j++){
  //           const newGroupSubDropdown = newGroupConditionInfo[j].childNodes
  //           //console.log(7064, newGroupSubDropdown)
  //           for(let j = 0; j < newGroupSubDropdown.length; j++){
  //             const newGroupSubDropdownEach = newGroupSubDropdown[j].childNodes
  //             //console.log(7067, newGroupSubDropdownEach)
  //             for(let j = 0; j < newGroupSubDropdownEach.length; j++){
  //               if(newGroupSubDropdownEach[j].childNodes.length == 0){  // block
  //                 //console.log(newGroupSubDropdownEach[j])
  //                 //const cordy = parseInt(newGroupSubDropdownEach[j].getAttribute('y'))
  //                 const cordy = parseInt(newGroupSubDropdownEach[j].getAttribute('y'))
  //                 const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //                 newGroupSubDropdownEach[j].setAttribute('y', cordy + conditionLen + 15)
  //                 const formerID = newGroupSubDropdownEach[j].getAttribute('id')
  //                 if(formerID != null){
  //                   newGroupSubDropdownEach[j].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //                   //console.log(7200, i)
  //                 }
  //               }
  //               else if(newGroupSubDropdownEach[j].childNodes.length == 1){  // text
  //                 //console.log(newGroupSubDropdownEach[j])
  //                 //const cordy = parseInt(newGroupSubDropdownEach[j].getAttribute('y'))
  //                 const cordy = parseInt(newGroupSubDropdownEach[j].getAttribute('y'))
  //                 const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //                 newGroupSubDropdownEach[j].setAttribute('y', cordy + conditionLen + 15)
  //                 const formerID = newGroupSubDropdownEach[j].getAttribute('id')
  //                 if(formerID != null){
  //                   newGroupSubDropdownEach[j].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //                   //console.log(7200, i)
  //                 }
  //               }
                
  //             }
  //           }
            
  //         }
  //         const newCondition0 = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length-2].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes
  //         for(let i = 0; i < newCondition0.length; i++){
  //           //console.log(7214, newCondition0[i])
  //           const cordy = parseInt(newCondition0[i].getAttribute('y'))
  //           const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //           newCondition0[i].setAttribute('y', cordy + conditionLen + 15)
  //           const formerID = newCondition0[i].getAttribute('id')
  //           if(formerID != null){
  //             newCondition0[i].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //             //console.log(7200, i)
  //           }
  //         }
  //         const newCondition00 = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length-2].childNodes[1].childNodes[0].childNodes[1].childNodes[9].childNodes
  //         for(let i = 0; i < newCondition00.length; i++){
  //           //console.log(7214, newCondition0[i])
  //           const cordy = parseInt(newCondition00[i].getAttribute('y'))
  //           const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //           newCondition00[i].setAttribute('y', cordy + conditionLen + 15)
  //           const formerID = newCondition00[i].getAttribute('id')
  //           if(formerID != null){
  //             newCondition00[i].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //             //console.log(7200, i)
  //           }
  //         }
  //         const newCondition22 = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length-2].childNodes[1].childNodes[2].childNodes[1].childNodes
  //         //console.log(7236, newCondition22)
  //         for(let i = 0; i < newCondition22.length; i++){
  //           const newConditionEach22 = newCondition22[i].childNodes
  //           for(let j = 0; j < newConditionEach22.length; j++){
  //             // console.log(7238, newConditionEach22[j])
  //             const cordy = parseInt(newConditionEach22[j].getAttribute('y'))
  //             const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //             newConditionEach22[j].setAttribute('y', cordy + conditionLen + 15)
  //             const formerID = newConditionEach22[j].getAttribute('id')
  //             if(formerID != null){
  //               newConditionEach22[j].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //               // console.log(7200, i, k ,j)
  //             }
  //           }
            
  //         }
  //       }
  //       else if(i == 0){  // 改变AddConditionButton的位置 // 1
  //         const newGroupConditionOther = newGroup[i].childNodes
  //         for(let j = 0; j < newGroupConditionOther.length; j++){
  //           const cordy = parseInt(newGroupConditionOther[j].getAttribute('y')) // 原始位置（重合）
  //           // 原始位置y坐标到下方GroupLogic的距离
  //           //console.log(7187, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length - 2].childNodes[0].childNodes[0].childNodes[0])
  //           // const distance = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum-1].childNodes[0].getAttribute('y')) - cordy
  //           // newGroupConditionOther[j].setAttribute('y', distance + 30 + 41)
  //           //const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
    
  //           newGroupConditionOther[j].setAttribute('y', cordy+70.1)
  //           const formerID = newGroupConditionOther[j].getAttribute('id')
  //           if(formerID != null){
  //             newGroupConditionOther[j].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //             // console.log(7200, i, k ,j)
  //           }
  //         }
  //       }
  //       else if(i == 2){  // 改变ConditionLogicDropdown的位置
  //         const newGroupConditionOther = newGroup[i].childNodes
  //         for(let j = 0; j < newGroupConditionOther.length; j++){
  //           const cordy = parseInt(newGroupConditionOther[j].getAttribute('y')) // 原始位置（重合）
  //           // 最后一组groupInfo中的第一行conditionInfo的y坐标和height
  //           // const lastConditionY = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //           // const lastConditionHeight = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('height'))
  //           // newGroupConditionOther[j].setAttribute('y', lastConditionY + lastConditionHeight)
  //           const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
                  
  //           newGroupConditionOther[j].setAttribute('y', cordy+conditionLen+15)
  //           const formerID = newGroupConditionOther[j].getAttribute('id')
  //           if(formerID != null){
  //             newGroupConditionOther[j].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //             // console.log(7200, i, k ,j)
  //           }
  //         }
  //       }
  //     }

  //     // 伸长rect1,改变AddGroupButton位置
  //     // rect1  // 2
  //     const newGroupRect = clickedStep.view.g.childNodes[15].childNodes[0]
  //     const rectHeight = parseInt(newGroupRect.getAttribute('height'))
  //     // const upperY = parseInt(clickedStep.view.g.childNodes[15].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //     // const lowerY = parseInt(clickedStep.view.g.childNodes[15].childNodes[2].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[2].childNodes[0].childNodes[0].getAttribute('height'))
  //     // const conditionLen = lowerY - upperY
  //     //console.log(7446, upperY, lowerY)
  //     //const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
                  
  //     newGroupRect.setAttribute('height', rectHeight+70.1)
      
  //     // AddGroupButton  // 3
  //     const newGroupButton = clickedStep.view.g.childNodes[15].childNodes[1].childNodes
  //     //console.log(7189, newGroup1)
  //     for(let i = 0; i < newGroupButton.length; i++){	//  [15][2]
  //       const cordy = parseInt(newGroupButton[i].getAttribute('y'))
  //       //console.log(7443, clickedStep.view.g.childNodes[15].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //       // const upperY = parseInt(clickedStep.view.g.childNodes[15].childNodes[2].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //       // const lowerY = parseInt(clickedStep.view.g.childNodes[15].childNodes[2].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[2].childNodes[0].childNodes[0].getAttribute('height'))
  //       //console.log(7446, upperY, lowerY)
  //       // const conditionLen = lowerY - upperY
  //       //const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
                  
  //       newGroupButton[i].setAttribute('y', cordy+70.1)
  //     }

  //     // 4 取最后一个GroupLogicDropdown（一般为倒数第一位node），改变其位置（原始位置与复制前重合），不显示
  //     const newGroupLogic = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length-1].childNodes
  //     //console.log(7199, newCondition2)
  //     // const newConditionEach2 = newCondition2.childNodes
  //     // console.log(7191, newConditionEach);
  //     for (let k = 0; k < newGroupLogic.length; k++){
  //       const cordy = parseInt(newGroupLogic[k].getAttribute('y'))
  //       //const conditionLen = parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[0].childNodes[0].getAttribute('height')) - parseInt(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[0].getAttribute('y'))
  //       newGroupLogic[k].setAttribute('y', cordy + 70.1)
  //       const formerID2 = newGroupLogic[k].getAttribute('id')
  //       if(formerID2 != null){
  //         //console.log(7292, formerID2)
  //         newGroupLogic[k].setAttribute('id', Math.random().toString() + Math.random().toString()+`${Date.now()}`)
  //         //console.log(7292, newCondition2[k].getAttribute('id'))
  //       }
  //       // console.log(7214, cordy);
  //     }
      
  //     // 显示倒数第二个logic（一般为倒数第三位node）
  //     clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length-3].classList.toggle('sqd-hidden')
  //     // 隐藏克隆后新group的第一个conditionLogic
  //     clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length-2].childNodes[2].classList.add('sqd-hidden')
      
      


      
      

  //     // 克隆afterdropdown [18]
  //     // 倒数第一个group
  //     const lastGroupAfter = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2]
      
  //     // 倒数第一个logic
  //     const lastLogicAfter = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 1]
  //     // group
  //     const duplicateNode3 = lastGroupAfter.cloneNode(true)
  //     // 剪去多余部分,剪去rect多余长度
  //     while(duplicateNode3.childNodes.length > 4){
  //       //console.log(7062)
  //       //duplicateGroupNode.childNodes[duplicateGroupNode.childNodes.length - 1].classList.toggle('sqd-hidden')
  //       const removeNode = duplicateNode3.childNodes[duplicateNode3.childNodes.length - 2]
  //       console.log(removeNode)
  //       duplicateNode3.removeChild(removeNode)
  //     }
  //     console.log('dup', duplicateNode3)
  //     duplicateNode3.childNodes[0].setAttribute("height", 30)

  //     clickedStep.view.g.childNodes[18].appendChild(duplicateNode3)
  //     // logic
  //     console.log(7313, lastLogicAfter)
  //     const duplicateNode4 = lastLogicAfter.cloneNode(true)
  //     clickedStep.view.g.childNodes[18].appendChild(duplicateNode4)

  //     // 改变afterdropdown的位置/id
  //     // 取克隆过后与原始位置重合的最后一个groupInfo
  //     //const lastGroupInfo = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2]
  //     for (let k = 0; k < clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes.length; k++){
        
  //         const cordy = parseInt(clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes[k].getAttribute('y'))
  //         const height = parseInt(clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-4].childNodes[0].getAttribute('height'))
  //         clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes[k].setAttribute('y', cordy+height+30)
  //         const formerID1 = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes[k].getAttribute('id')
  //         if(formerID1 != null){
  //           clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes[k].setAttribute('id', Math.random().toString()+`${Date.now()}`)
  //         }
        
        
  //       // 改变group number
  //       if(k == 1){
  //         const groupNum = parseInt(clickedStep.view.g.childNodes[18].childNodes.length / 2)
  //         console.log(7335, clickedStep.view.g.childNodes[18].childNodes.length % 2, clickedStep.view.g.childNodes[18].childNodes)
  //         //clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[1].textContent = 'Group' + groupNum.toString()
  //         clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes[k].textContent = 'Group' + groupNum.toString()
  //       }
  //     }
  //     for (let k = 0; k < clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes.length; k++){
  //       if(true){
  //         console.log(7355, k, k/2, clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-2].childNodes[k])
  //       }
  //     }
      
  //     // group logic
  //     // 取倒数第二个logic node
  //     const secLastLogicNode = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-3]
  //     const cordy2 = parseInt(clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-4].childNodes[0].getAttribute('y'))
  //     const height2 = parseInt(clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-4].childNodes[0].getAttribute('height'))
  //     secLastLogicNode.setAttribute('y', cordy2+height2+15)
      

  //     // 显示afterdropdown倒数第二个group logic
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-3].classList.toggle('sqd-hidden')

  //     // 伸长afterdropdownbox
  //     const afterDropDownBox = clickedStep.view.g.childNodes[18].childNodes[0]
  //     const cordy3 = parseInt(clickedStep.view.g.childNodes[18].childNodes[0].getAttribute('y')) + parseInt(clickedStep.view.g.childNodes[18].childNodes[0].getAttribute('height'))
  //     //const height3 = parseInt(afterDropDownAttr3.getAttribute('height'))
  //     afterDropDownBox.setAttribute('height', cordy2+height2+30)

  //     // 设定并移位group number
  //     const groupNum = clickedStep.view.g.childNodes[18].childNodes.length / 2
  //     //console.log(7056, groupNum)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[1].textContent = 'Group' + groupNum.toString()
  //     //const nameTextGroupAttr = clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[1]
  //     const cordyRectGroupAfter = parseInt(clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[0].getAttribute('y'))
  //     const height5 = parseInt(clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[0].getAttribute('height'))
  //     //console.log('height', height5, cordyRectGroupAfter)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length - 2].childNodes[1].setAttribute('y', cordyRectGroupAfter + height5*0.5)
      
  //   }
  // }

  // // add new group
  // // logic 设定afterdropdown AND/OR
  // // AND
  // if(clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length - 1]){
  //   console.log(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-3)
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length - 1].childNodes[2].id.toString();
  //   //
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   // console.log(9999, dropdownBut)
  //   dropdownBut.onclick = function(){
  //     // clickedStep.view.g.childNodes[25].childNodes[3].classList.remove('sqd-hidden');
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length - 1].childNodes[1].textContent
  //     console.log(7304, showVal)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-3].textContent = showVal
  //   }
  // }
  // // OR
  // if(clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length - 1]){
  //   console.log(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-3)
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length - 1].childNodes[6].id.toString();
  //   //
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   // console.log(9999, dropdownBut)
  //   dropdownBut.onclick = function(){
  //     // clickedStep.view.g.childNodes[25].childNodes[3].classList.remove('sqd-hidden');
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[clickedStep.view.g.childNodes[15].childNodes.length - 1].childNodes[5].textContent
  //     console.log(7304, showVal)
  //     clickedStep.view.g.childNodes[18].childNodes[clickedStep.view.g.childNodes[18].childNodes.length-3].textContent = showVal
  //   }
  // }
  
  
  // //subdropdown 显示下左
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[3].id){
  //   //console.log(7240, clickedStep.view.g.childNodes[15].childNodes[2].childNodes[clickedStep.view.g.childNodes[15].childNodes[2].childNodes.length-2].childNodes[0].childNodes[0].childNodes[3].id.toString())
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[3].id.toString();
  //   //console.log(7249,dropdownButId)
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   dropdownBut.onclick = function(e){
  //     console.log(3498, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes)
  //     e.stopPropagation();
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //   }
  //   // Contact Info
  //   const dropdownSButId1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[6].id.toString();
  //   const dropdownSBut1 = document.getElementById(dropdownSButId1);
  //   dropdownSBut1.onclick = function(){
  //     console.log(4184, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes);
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].classList.toggle('sqd-hidden');
  //   }
  //   // Actions
  //   const dropdownSButId2 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[7].id.toString();
  //   const dropdownSBut2 = document.getElementById(dropdownSButId2);
  //   dropdownSBut2.onclick = function(){
  //     console.log(4207, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes);
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].classList.toggle('sqd-hidden');
  //   }
  // }
  // //subdropdown1 显示下右
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[0].childNodes[3].id){
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[0].childNodes[3].id.toString();
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   dropdownBut.onclick = function(e){
  //     console.log(3498, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes)
  //     e.stopPropagation();
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //   }
  // }
  // //subdropdown2 显示下中
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[0].childNodes[3].id){
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[0].childNodes[3].id.toString();
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   dropdownBut.onclick = function(){
  //     console.log(4146, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes)
  //     // e.stopPropagation();
  //     var rightContent = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[2].textContent
  //     console.log(4630, rightContent)
  //     if(rightContent == 'Clicked' || rightContent == 'Opened'){
  //       console.log(4591, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[2].textContent)
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     }
  //     else if(rightContent == 'Email Address' || rightContent == 'Name' || rightContent == 'Phone Number'){
  //       console.log(4591, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[2].textContent)
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].classList.toggle('sqd-hidden');
  //     }
      
  //     // console.log(4593, clickedStep.view.g.childNodes[19].childNodes[1].childNodes[0].classList)
  //   }
  // }


  // //subdropdown 左
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[3].id){
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[3].id.toString();
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   dropdownBut.onclick = function(e){
  //     console.log(3498, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes)
  //     e.stopPropagation();
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //   }
  //   // Contact Info
  //   const dropdownSButId1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[6].id.toString();
  //   const dropdownSBut1 = document.getElementById(dropdownSButId1);
  //   dropdownSBut1.onclick = function(){
  //     console.log(4184, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes);
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].classList.toggle('sqd-hidden');
  //   }
  //   // Actions
  //   const dropdownSButId2 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[7].id.toString();
  //   const dropdownSBut2 = document.getElementById(dropdownSButId2);
  //   dropdownSBut2.onclick = function(){
  //     console.log(4207, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes);
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[9].classList.toggle('sqd-hidden');
  //   }
  // }
  // //subdropdown1 右
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[0].childNodes[3].id){
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[0].childNodes[3].id.toString();
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   dropdownBut.onclick = function(e){
  //     console.log(3498, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes)
  //     e.stopPropagation();
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //   }
  // }
  // //subdropdown2 中
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[0].childNodes[3].id){
  //   const dropdownButId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[0].childNodes[3].id.toString();
  //   const dropdownBut = document.getElementById(dropdownButId);
  //   dropdownBut.onclick = function(){
  //     console.log(4146, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes)
  //     // e.stopPropagation();
  //     var rightContent = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent
  //     console.log(4630, rightContent)
  //     if(rightContent == 'Clicked' || rightContent == 'Opened'){
  //       console.log(4591, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent)
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     }
  //     else if(rightContent == 'Email Address' || rightContent == 'Name' || rightContent == 'Phone Number'){
  //       console.log(4591, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent)
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].classList.toggle('sqd-hidden');
  //     }
      
  //     // console.log(4593, clickedStep.view.g.childNodes[19].childNodes[1].childNodes[0].classList)
  //   }
  // }
  
  // // const selectRunUpperId = clickedStep.view.g.childNodes[17].childNodes[1].childNodes[2].id.toString()
  // // const selectRunUpper  = document.getElementById(selectRunUpperId);
  // // selectRunUpper.onclick = function() {
  // // 	console.log(3589, clickedStep)
  // // 	const showVal = clickedStep.view.g.childNodes[17].childNodes[1].childNodes[1].innerHTML
  // // 	clickedStep.view.g.childNodes[17].childNodes[0].childNodes[2].textContent = showVal
  // // 	clickedStep.view.g.childNodes[17].childNodes[1].classList.toggle('sqd-hidden');
  // // 	clickedStep.step.properties['Select List'] = showVal
  // // }
  // // const selectRunUpperId1 = clickedStep.view.g.childNodes[17].childNodes[1].childNodes[5].id.toString()
  // // const selectRunUpper1  = document.getElementById(selectRunUpperId1);
  // // selectRunUpper1.onclick = function() {
    
  // // 	const showVal = clickedStep.view.g.childNodes[17].childNodes[1].childNodes[4].innerHTML

  // // 	console.log(3589,showVal)
  // // 	clickedStep.view.g.childNodes[17].childNodes[0].childNodes[2].textContent = showVal
  // // 	clickedStep.view.g.childNodes[17].childNodes[1].classList.toggle('sqd-hidden');
  // // 	clickedStep.step.properties['Select List'] = showVal
  // // }

  // //left subdropdown
  // // Contact Info
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes[2].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes[2].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes[1].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes[5].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes[5].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes[4].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes[8].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes[8].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].childNodes[7].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[8].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  
  // // Actions
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[9].childNodes[2].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[9].childNodes[2].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[9].childNodes[1].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[9].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[9].childNodes[5].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[9].childNodes[5].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[9].childNodes[4].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].childNodes[9].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  

  // //right subdropdown
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[1].childNodes[2].id){
  //   const selectRunLowerId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[1].childNodes[2].id.toString()
  //   const selectRunLower  = document.getElementById(selectRunLowerId);
  //   selectRunLower.onclick = function() {
  //     //console.log(3589, clickedStep.view.g.childNodes)
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[1].childNodes[1].innerHTML
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Run'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[1].childNodes[5].id){
  //   const selectRunLowerId1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[1].childNodes[5].id.toString()
  //   const selectRunLower1  = document.getElementById(selectRunLowerId1);
  //   selectRunLower1.onclick = function() {
  //     //console.log(3589, )
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[1].childNodes[4].innerHTML
  //     console.log(3596, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[0].childNodes[2])
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[0].childNodes[2].textContent = showVal
  //     // clickedStep.view.g.childNodes[13].childNodes[4].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Run'] = showVal
  //   }
  // }
  

  // // middle subdropdown
  // // gSubDropdownbox2PopE0 [15][2][1][2][1][0]
  // console.log(3741, clickedStep.view.g.childNodes)
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].childNodes[2].id){
  //   const selectRunMidId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].childNodes[2].id.toString()
  //   const selectRunMid  = document.getElementById(selectRunMidId);
  //   selectRunMid.onclick = function() {
  //     console.log(4202, clickedStep)
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].childNodes[1].innerHTML
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].childNodes[5].id){
  //   const selectRunMidId1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].childNodes[5].id.toString()
  //   const selectRunMid1  = document.getElementById(selectRunMidId1);
  //   selectRunMid1.onclick = function() {
      
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].childNodes[4].innerHTML
  //     console.log(4213,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].childNodes[8].id){
  //   const selectRunMidId2 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].childNodes[8].id.toString()
  //   const selectRunMid2  = document.getElementById(selectRunMidId2);
  //   selectRunMid2.onclick = function() {
      
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].childNodes[7].innerHTML
  //     console.log(4213,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[0].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // // middle subdropdown
  // // gSubDropdownbox2PopE1 [19][1][1]
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].childNodes[2].id){
  //   const selectRunMidId4 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].childNodes[2].id.toString()
  //   const selectRunMid4  = document.getElementById(selectRunMidId4);
  //   selectRunMid4.onclick = function() {
  //     console.log(4202, clickedStep)
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].childNodes[1].innerHTML
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].childNodes[5].id){
  //   const selectRunMidId5 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].childNodes[5].id.toString()
  //   const selectRunMid5  = document.getElementById(selectRunMidId5);
  //   selectRunMid5.onclick = function() {
      
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].childNodes[4].innerHTML
  //     console.log(4213,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].childNodes[8].id){
  //   const selectRunMidId6 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].childNodes[8].id.toString()
  //   const selectRunMid6  = document.getElementById(selectRunMidId6);
  //   selectRunMid6.onclick = function() {
      
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].childNodes[7].innerHTML
  //     console.log(4213,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[1].childNodes[2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  

  // // add new conditions
  // // 下左
  // // Contact Info
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes[2].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes[2].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes[1].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes[5].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes[5].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes[4].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes[8].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes[8].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].childNodes[7].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[8].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // // Actions
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].childNodes[2].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].childNodes[2].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].childNodes[1].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].childNodes[5].id){
  //   const selectRunUpperId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].childNodes[5].id.toString()
  //   const selectRunUpper  = document.getElementById(selectRunUpperId);
  //   selectRunUpper.onclick = function() {
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].childNodes[4].innerHTML
  //     console.log(4450,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[9].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  

  // //right subdropdown 下右
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[1].childNodes[2].id){
  //   const selectRunLowerId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[1].childNodes[2].id.toString()
  //   const selectRunLower  = document.getElementById(selectRunLowerId);
  //   selectRunLower.onclick = function() {
  //     console.log(7622, selectRunLowerId)
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[1].childNodes[1].innerHTML
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Run'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[1].childNodes[5].id){
  //   const selectRunLowerId1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[1].childNodes[5].id.toString()
  //   const selectRunLower1  = document.getElementById(selectRunLowerId1);
  //   selectRunLower1.onclick = function() {
  //     console.log(7660, selectRunLowerId1)
  //     console.log(7661, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[0].childNodes[1].childNodes[6].id.toString())
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[1].childNodes[4].innerHTML
  //     console.log(3596, clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[0].childNodes[2])
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[0].childNodes[2].textContent = showVal
  //     // clickedStep.view.g.childNodes[13].childNodes[4].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Run'] = showVal
  //   }
  // }
  

  // // middle subdropdown 下中
  // // [19][2][2][1][0]
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].childNodes[2].id){
  //   const selectRunMidId = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].childNodes[2].id.toString()
  //   const selectRunMid  = document.getElementById(selectRunMidId);
  //   selectRunMid.onclick = function() {
  //     console.log(4202, clickedStep)
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].childNodes[1].innerHTML
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].childNodes[5].id){
  //   const selectRunMidId1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].childNodes[5].id.toString()
  //   const selectRunMid1  = document.getElementById(selectRunMidId1);
  //   selectRunMid1.onclick = function() {
      
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].childNodes[4].innerHTML
  //     console.log(4213,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].childNodes[8].id){
  //   const selectRunMidId2 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].childNodes[8].id.toString()
  //   const selectRunMid2  = document.getElementById(selectRunMidId2);
  //   selectRunMid2.onclick = function() {
      
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].childNodes[7].innerHTML
  //     console.log(4213,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[0].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // // 下中 [19][2][2][1][1]
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].childNodes[2].id){
  //   const selectRunMidId4 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].childNodes[2].id.toString()
  //   const selectRunMid4  = document.getElementById(selectRunMidId4);
  //   selectRunMid4.onclick = function() {
  //     console.log(4202, clickedStep)
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].childNodes[1].innerHTML
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].childNodes[5].id){
  //   const selectRunMidId5 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].childNodes[5].id.toString()
  //   const selectRunMid5  = document.getElementById(selectRunMidId5);
  //   selectRunMid5.onclick = function() {
      
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].childNodes[4].innerHTML
  //     console.log(4213,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  // if(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].childNodes[8].id){
  //   const selectRunMidId6 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].childNodes[8].id.toString()
  //   const selectRunMid6  = document.getElementById(selectRunMidId6);
  //   selectRunMid6.onclick = function() {
      
  //     const showVal = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].childNodes[7].innerHTML
  //     console.log(4213,showVal)
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[0].childNodes[2].textContent = showVal
  //     clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum].childNodes.length-2].childNodes[2].childNodes[1].childNodes[1].classList.toggle('sqd-hidden');
  //     clickedStep.step.properties['Select List'] = showVal
  //   }
  // }
  

  // if(clickedStep.view.g.childNodes[14].childNodes[0]){
  //   console.log("duplicate if", clickedStep.view.g.childNodes[14].childNodes[0].id);
  //   const duplicateId = clickedStep.view.g.childNodes[14].childNodes[0].id.toString();
  //   const duplicateBut = document.getElementById(duplicateId);
    
  //   const tempContext = this.context;
  //   duplicateBut.onclick = function(e){
  //     e.stopPropagation();
  //     const duplicateStep = createStep(clickedStep.step);	
  //     const pos = readMousePosition(e);
  //     duplicateStep.id = "copy-" + clickedStep.step.id+"-at-"+Date.now();
  //     // console.log("copy", duplicateStep.id);
  //     tempContext.behaviorController.start(pos, DragStepBehavior.create(tempContext, duplicateStep));
  //     // console.log(tempContext);							
  //   }					
  // }

  // // up-pop: finish
  // if(clickedStep.view.g.childNodes[16].childNodes[0]){
  //   const checkButtonId = clickedStep.view.g.childNodes[16].childNodes[0].id.toString();
  //   const checkButton =  document.getElementById(checkButtonId);
  //   checkButton.onclick = function(e){
  //     //console.log(4023, clickedStep.view.g.childNodes)
  //     // 区分单个condition还是多个
  //     if(
  //     clickedStep.view.g.childNodes[15].childNodes[2].childNodes.length > 3){
  //       clickedStep.view.g.childNodes[18].classList.toggle('sqd-hidden');
  //       //console.log(7103)
  //     }
  //     clickedStep.view.g.childNodes[15].classList.toggle('sqd-hidden');
  //     clickedStep.view.g.childNodes[16].classList.toggle('sqd-hidden');
      
  //   }
  //   const lastGroupInfoNum1 = clickedStep.view.g.childNodes[15].childNodes.length-2
  //   // set the result in a group
  //   // 单个condition
  //   if(clickedStep.view.g.childNodes[15].childNodes.length == 4){
  //     if((clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes.length == 3)&&(
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent != 'Select'&&
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].textContent != 'Select'&&
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent != 'Select'
  //     )){
  //       //clickedStep.view.g.childNodes[20].classList.add('sqd-hidden');
  //       console.log(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].textContent)
  //       console.log(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent)
  //       console.log(clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent)
  //       const showVal1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent
  //       const showVal2 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].textContent
  //       const showVal3 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent
  //       clickedStep.view.g.childNodes[13].childNodes[4].textContent = 'if ' + showVal1 + " " + showVal3 + " " + showVal2
  //       //clickedStep.view.g.childNodes[18].classList.toggle("sqd-hidden")
  //       console.log(5879);
  //     }
  //     // 多个condition
  //     else if((clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes.length > 3)&&(
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes.length-2].childNodes[0].childNodes[0].childNodes[2].textContent != 'Select'&&
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes.length-2].childNodes[1].childNodes[0].childNodes[2].textContent != 'Select'&&
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes.length-2].childNodes[2].childNodes[0].childNodes[2].textContent != 'Select'))
  //     {
  //       console.log(5888);
  //       clickedStep.view.g.childNodes[13].childNodes[4].textContent = 'Condition Settings'
  //       for(let i = 2; i < clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes.length; i++){
  //         if((i % 2) == 0){
  //           const childNodeList1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[i-1]
  //           console.log(7847, childNodeList1)
  //           // for(let j = 0; j < childNodeList1.childNodes.length; j++){
  //           const showVal1 = childNodeList1.childNodes[0].childNodes[0].childNodes[2].innerHTML
  //           const showVal2 = childNodeList1.childNodes[1].childNodes[0].childNodes[2].innerHTML
  //           const showVal3 = childNodeList1.childNodes[2].childNodes[0].childNodes[2].innerHTML
  //           console.log(7852, showVal1)
  //           console.log(7852, showVal2)
  //           console.log(7852, showVal3)
  //           clickedStep.view.g.childNodes[18].childNodes[1].childNodes[i].textContent = 'if ' + showVal1 + " " + showVal3 + " " + showVal2
  //         }
  //       }
  //     }
  //   }
  //   else if(clickedStep.view.g.childNodes[15].childNodes.length > 4){
  //     if((clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes.length == 3)&&(
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent != 'Select'&&
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].textContent != 'Select'&&
  //       clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent != 'Select'))
  //     {
  //       const showVal1 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[0].childNodes[0].childNodes[2].textContent
  //       const showVal2 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].textContent
  //       const showVal3 = clickedStep.view.g.childNodes[15].childNodes[lastGroupInfoNum1].childNodes[1].childNodes[2].childNodes[0].childNodes[2].textContent
  //       clickedStep.view.g.childNodes[13].childNodes[4].textContent = 'if ' + showVal1 + " " + showVal3 + " " + showVal2
  //     }
  //   }
  // }
  // }
}
function createStep(step: any) {
  throw new Error("Function not implemented.");
}


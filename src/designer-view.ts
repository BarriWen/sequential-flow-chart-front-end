import { ControlBar } from "./control-bar/control-bar";
import { Dom } from "./core/dom";
import { DesignerConfiguration } from "./designer-configuration";
import { DesignerContext } from "./designer-context";
import { LayoutController } from "./layout-controller";
import { SmartEditor } from "./smart-editor/smart-editor";
import { Toolbox } from "./toolbox/toolbox";
import { Workspace } from "./workspace/workspace";
import { rbButtonsBox} from "./rbButtons/rbButtons-box";

const ICON_SIZE = 22;
const LABEL_PADDING_X = 10;
export class DesignerView {
  public static create(
    parent: HTMLElement,
    context: DesignerContext,
    configuration: DesignerConfiguration
  ): DesignerView {
    const theme = configuration.theme || "light";

    const root = Dom.element("div", {
      class: `sqd-designer sqd-theme-${theme}`,
    });
    parent.appendChild(root);

    const workspace = Workspace.create(root, context);
    let toolbox: Toolbox | undefined = undefined;

    if (!configuration.toolbox.isHidden) {
      toolbox = Toolbox.create(root, context);
    }
    ControlBar.create(root, context);
    if (!configuration.editors.isHidden) {
      SmartEditor.create(root, context);
    }

    const mask = Dom.element("div", {
        class: "sqd-designer-mask sqd-hidden",
    });
    root.appendChild(mask);

    // Add title box
    const info = Dom.svg("svg", {
      class: "info-box",
      width: 370,
      height: 60,
    });
    const title = Dom.svg("text", {
      x: 185,
      y: 25,
      class: "info-box-title",
    });
    title.textContent = String(context.definition.properties.journeyName);
    info.appendChild(title);
    const nameWidth = Math.max(info.getBBox().width + LABEL_PADDING_X * 2, 350);
    // console.log(info.getBBox());
    const rect = Dom.svg("rect", {
      class: "info-box-rect",
      width: nameWidth,
      height: 40,
      rx: 20,
      ry: 20,
      x: 10,
    });
    info.insertBefore(rect, title);
    // Expanded titlebox
    const dialogBox = Dom.element("div", {
      class: "info-box-prompt",
    });
    const dialogForm = Dom.element("form");
    // console.log("In designer view, ", context.definition.properties.journeyName);
    const txt = Dom.element("input", {
      class: "info-box-prompt-input",
      type: "text",
      name: "title",
      placeholder: title.textContent,
      value: title.textContent,
    });
    dialogForm.appendChild(txt);
    txt.insertAdjacentHTML("afterend", "</br>");
    // More text contents
    const column1 = Dom.element("div", {
      class: "info-box-prompt-column info-box-prompt-column-left",
    });
    const txt1 = Dom.element("p", { class: "info-box-prompt-column-text" });
    txt1.textContent = "Owner";
    column1.appendChild(txt1);
    // txt1.insertAdjacentHTML("afterend", "</br>");
    const txt2 = Dom.element("p", { class: "info-box-prompt-column-text" });
    txt2.textContent = "Location";
    column1.appendChild(txt2);
    // txt2.insertAdjacentHTML("afterend", "</br>");
    const txt3 = Dom.element("p", { class: "info-box-prompt-column-text" });
    txt3.textContent = "Created";
    column1.appendChild(txt3);
    // txt3.insertAdjacentHTML("afterend", "</br>");
    const txt4 = Dom.element("p", { class: "info-box-prompt-column-text" });
    txt4.textContent = "Last Modified";
    column1.appendChild(txt4);
    // txt4.insertAdjacentHTML("afterend", "</br>");

    const column2 = Dom.element("div", {
      class: "info-box-prompt-column info-box-prompt-column-middle",
    });
    const txt5 = Dom.element("p", { class: "info-box-prompt-column-text" });
    txt5.textContent = String(context.definition.properties.createdBy);
    column2.appendChild(txt5);
    // txt5.insertAdjacentHTML("afterend", "</br>");
    const txt6 = Dom.element("p", { class: "info-box-prompt-column-text" });
    txt6.textContent = "Location";
    column2.appendChild(txt6);
    // txt6.insertAdjacentHTML("afterend", "</br>");
    const txt7 = Dom.element("p", { class: "info-box-prompt-column-text" });
    let date = new Date(context.definition.properties.createdAt);
    // txt7.textContent =
    //   date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    txt7.textContent = date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    column2.appendChild(txt7);
    // txt7.insertAdjacentHTML("afterend", "</br>");
    const txt8 = Dom.element("p", { class: "info-box-prompt-column-text" });
    date = new Date(context.definition.properties.createdAt);
    // txt8.textContent =
    //   date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    txt8.textContent = date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    column2.appendChild(txt8);
    // txt8.insertAdjacentHTML("afterend", "</br>");

    const column3 = Dom.element("div", {
      class: "info-box-prompt-column info-box-prompt-column-right",
    });
    const description = Dom.element("p", {
      class: "info-box-prompt-column-text",
      style: "margin-bottom: 0; left: -3px",
    });
    const descripArea = Dom.element("textarea", {
      class: "input-box-prompt-textarea",
      name: "description",
      value: context.definition.properties.description,
      placeholder: "The owner hasn't left any description for this journey",
    });
    description.textContent = "Description";
    column3.appendChild(description);
    column3.appendChild(descripArea);

    // Buttons
    const buttonDiv = Dom.element("div", {
      class: "info-box-prompt-btn-div",
    });
    const buttonDivLeft = Dom.element("div", {
        class: "info-box-prompt-btn-div-left",
    });
    const buttonDivRight = Dom.element("div", {
        class: "info-box-prompt-btn-div-right",
    });
    const btn1 = Dom.element("button", {
      class: "info-box-prompt-btn",
      style: "background-color: #fff; color: #bfbfbf; border: 1px solid #bfbfbf;",
    });
    btn1.textContent = "Cancel";

    btn1.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      txt.value = "";
      Dom.toggleClass(dialogBox, true, "sqd-hidden");
      Dom.toggleClass(exportPanel, true, "sqd-hidden");
      Dom.toggleClass(mask, true, "sqd-hidden");
    });
    buttonDivLeft.appendChild(btn1);
    const btn2 = Dom.element("input", {
      class: "info-box-prompt-btn",
      type: "submit",
      value: "Save",
    });
    btn2.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      title.textContent = txt.value;
      txt.placeholder = title.textContent;
      txt.value = txt.placeholder;
      context.definition.properties.journeyName = txt.value;
      context.definition.properties.description = descripArea.value;
      Dom.toggleClass(dialogBox, true, "sqd-hidden");
      Dom.toggleClass(exportPanel, true, "sqd-hidden");
      Dom.toggleClass(mask, true, "sqd-hidden");
    });
    buttonDivLeft.appendChild(btn2);
    buttonDiv.appendChild(buttonDivLeft);

    // Share button
    const btn3 = Dom.element("button", {
      class: "info-box-prompt-btn",
      style: "position: relative; right: 5px;",
    });
    btn3.textContent = "Share";
    btn3.addEventListener("click", function (e) {
      e.stopPropagation();
      Dom.toggleClass(dialogBox, false, "sqd-hidden");
    });
    buttonDivRight.appendChild(btn3);
    // Export button
    const btn4 = Dom.element("button", {
      class: "info-box-prompt-btn",
      type: "submit",
    });
    const btn4Text = Dom.element("span", {
      style: "position: relative; top: -1px; left: 2px;",
    });
    btn4Text.textContent = "Export ";
    const btn4Img = Dom.element("img", {
      src: "../assets/vector.svg",
      style: "position: relative; right: -9px;",
    });
    btn4.appendChild(btn4Text);
    btn4.appendChild(btn4Img);
    btn4.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      Dom.toggleClass(exportPanel, false, "sqd-hidden");
    });
    buttonDivRight.appendChild(btn4);
    buttonDiv.appendChild(buttonDivRight);

    // Export panel view
    const choices = [
      "Small",
      "Medium",
      "Large",
      "Small file size",
      "Best quality",
    ];
    const res = [
      "2449x1632 px",
      "4898x3265 px",
      "8573x5715 px",
    ];

    const exportPanel = Dom.element("div", {
      class: "export-panel sqd-hidden",
    });

    const exportForm = Dom.element("form", {
      style: "margin: 10px 5px 10px 15px;",
    });

    const imageDiv = Dom.element("div", {
      class: "export-panel-image-div",
    });
    const imageTitle = Dom.element("div", {
      class: "export-panel-title",
    });
    const imageImg = Dom.element("img", {
      src: "../assets/as-image.svg",
      alt: "as-image",
    });
    const imageText = Dom.element("p", {});
    imageText.textContent = "Save as image";
    imageTitle.appendChild(imageImg);
    imageTitle.appendChild(imageText);
    imageDiv.appendChild(imageTitle);

    for (let i = 0; i < 3; i++) {
      const div = Dom.element("div", {
        class: "export-panel-div-item",
      });
      const radio = Dom.element("input", {
        type: "radio",
        name: "Choice",
        value: i,
        style: "position: relative; top: -3px;",
      });
      div.appendChild(radio);

      const choice = Dom.element("label", {
        style: "width: 55px;"
      });
      choice.innerText = choices[i];
      div.appendChild(choice);

      const jpg = Dom.element("p", {
        style: "margin: 0; width: 30px;",
      });
      jpg.innerText = "JPG";
      div.appendChild(jpg);

      const resText = Dom.element("p");
      resText.innerText = res[i];
      div.appendChild(resText);

      imageDiv.appendChild(div);
    }

    const pdfDiv = Dom.element("div", {
      class: "export-panel-pdf-div",
    });
    const pdfTitle = Dom.element("div", {
      class: "export-panel-title",
    });
    const pdfImg = Dom.element("img", {
      src: "../assets/as-pdf.svg",
      alt: "as-pdf",
    });
    const pdfText = Dom.element("p", {});
    pdfText.textContent = "Save as PDF";
    pdfTitle.appendChild(pdfImg);
    pdfTitle.appendChild(pdfText);
    pdfDiv.appendChild(pdfTitle);

    for (let i = 3; i < choices.length; i++) {
      const div = Dom.element("div", {
        class: "export-panel-div-item",
      });
      const radio = Dom.element("input", {
        type: "radio",
        name: "Choice",
        value: i,
        style: "position: relative; top: -2px;",
      });
      div.appendChild(radio);

      const choice = Dom.element("label");
      choice.innerText = choices[i];
      div.appendChild(choice);
      // choice.insertAdjacentHTML("afterend", "</br>");
      pdfDiv.appendChild(div);
    }

    const exportBtnDiv = Dom.element("div", {
      class: "info-box-prompt-btn-div-export",
    });

    const exportBtn1 = Dom.element("button", {
      class: "info-box-prompt-btn",
      style: "background-color: #edeeef; color: #000;"
    });
    exportBtn1.innerText = "Cancel";
    exportBtn1.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      Dom.toggleClass(exportPanel, true, "sqd-hidden");
    });
    exportBtnDiv.appendChild(exportBtn1);
    const exportBtn2 = Dom.element("input", {
      class: "info-box-prompt-btn",
      type: "submit",
      value: "Confirm",
    });
    exportBtn2.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      var elem = document.getElementsByTagName("input");
      let output: number;
      for (let i = 0; i < elem.length; i++) {
        if (elem[i].type == "radio" && elem[i].checked) {
          output = parseInt(elem[i].value);
          console.log("Export pdf with: ", choices[output]);
        }
      }

      Dom.toggleClass(exportPanel, true, "sqd-hidden");
      Dom.toggleClass(dialogBox, true, "sqd-hidden");
    });
    exportBtnDiv.appendChild(exportBtn2);

    exportForm.appendChild(imageDiv);
    exportForm.appendChild(pdfDiv);
    exportForm.appendChild(exportBtnDiv);
    exportPanel.appendChild(exportForm);

    dialogForm.appendChild(buttonDiv);
    dialogBox.appendChild(dialogForm);
    Dom.toggleClass(dialogBox, true, "sqd-hidden");
    info.addEventListener("click", function () {
      Dom.toggleClass(mask, false, "sqd-hidden");
      Dom.toggleClass(dialogBox, false, "sqd-hidden");
    });

    // emaily logo, use svg
    const emailyLogo = Dom.svg("svg", {
      class: "emaily-logo",
      // width: 200,
      // height: 80,
    });
    const logo = Dom.svg("image", {
      href: "./assets/emaily-logo.svg",
      class: "logo",
      height: 84,
    });
    emailyLogo.appendChild(logo);
    root.appendChild(emailyLogo);

    const avatarSvg = Dom.svg("svg", {
      class: "avatar-box",
      width: 80,
      height: 80,
    });
    const avatarUrl = "./assets/avatar.svg";
    const avatar = avatarUrl
      ? Dom.svg("image", {
          href: avatarUrl,
        })
      : Dom.svg("rect", {
          class: "sqd-task-empty-icon",
          rx: 4,
          ry: 4,
        });
    Dom.attrs(avatar, {
      class: "avatar",
      id: `avatar${Date.now()}`,
      x: 20,
      y: 15,
      width: 3 * ICON_SIZE,
      height: 3 * ICON_SIZE,
    });

    avatarSvg.appendChild(avatar);
    root.appendChild(info);
    root.appendChild(dialogBox);
    root.appendChild(exportPanel);
    root.appendChild(avatarSvg);

    dialogForm.appendChild(column1);
    dialogForm.appendChild(column2);
    dialogForm.appendChild(column3);

    // right-bottom toolbox
    rbButtonsBox.create(root, context);

    // Left Toolbox
    const emailyToolbox = Dom.element("div", {
      class: "emaily-toolbox", 
    }); 

    const toolboxBody = Dom.element("div", {
      class: "toolbox-body", 
    }); 


    const dashboardIcon = Dom.element("img", {
      src: "./assets/dashboard.svg", 
      class: "dashboard-icon emaily-toolbox-icon", 
      height: 20, 
      width: 20, 
    }); 

    const flowIcon = Dom.element("img", {
      src: "./assets/flow.svg", 
      class: "flow-icon emaily-toolbox-icon", 
      height: 20, 
      width: 20, 
    });

    const usersIcon = Dom.element("img", {
      src: "./assets/users.svg", 
      class: "users-icon emaily-toolbox-icon", 
      height: 20, 
      width: 20, 
    });

    const fileIcon = Dom.element("img", {
      src: "./assets/file.svg", 
      class: "file-icon emaily-toolbox-icon", 
      height: 20, 
      width: 20, 
    });

    const lineDivider = Dom.element("img", {
      src: "./assets/lineDivider.svg", 
      class: "line-divider emaily-toolbox-icon", 
      height: 25, 
      width: 25, 
    });

    const settingsIcon = Dom.element("img", {
      src: "./assets/settings.svg", 
      class: "settings-icon emaily-toolbox-icon", 
      height: 20, 
      width: 20, 
    });

    toolboxBody.appendChild(dashboardIcon); 
    toolboxBody.appendChild(flowIcon); 
    toolboxBody.appendChild(usersIcon);
    toolboxBody.appendChild(fileIcon);
    toolboxBody.appendChild(lineDivider); 
    toolboxBody.appendChild(settingsIcon);
    emailyToolbox.appendChild(toolboxBody)
    root.appendChild(emailyToolbox); 




    const view = new DesignerView(
      root,
      context.layoutController,
      workspace,
      toolbox
    );
    view.reloadLayout();
    window.addEventListener("resize", view.onResizeHandler, false);
    return view;
  }

  private readonly onResizeHandler = () => this.onResize();
  private readonly onKeyUpHandlers: KeyUpHandler[] = [];

  public constructor(
    private readonly root: HTMLElement,
    private readonly layoutController: LayoutController,
    public readonly workspace: Workspace,
    private readonly toolbox?: Toolbox
  ) {}

  public bindKeyUp(handler: KeyUpHandler) {
    document.addEventListener("keyup", handler, false);
    this.onKeyUpHandlers.push(handler);
  }

  public destroy() {
    window.removeEventListener("resize", this.onResizeHandler, false);
    this.onKeyUpHandlers.forEach((h) =>
      document.removeEventListener("keyup", h, false)
    );

    this.workspace.destroy();
    this.toolbox?.destroy();

    this.root.parentElement?.removeChild(this.root);
  }

  private onResize() {
    this.reloadLayout();
  }

  private reloadLayout() {
    const isMobile = this.layoutController.isMobile();
    Dom.toggleClass(this.root, !isMobile, "sqd-layout-desktop");
    Dom.toggleClass(this.root, isMobile, "sqd-layout-mobile");
  }
}

export type KeyUpHandler = (e: KeyboardEvent) => void;

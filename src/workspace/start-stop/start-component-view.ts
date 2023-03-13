import { Dom } from "../../core/dom";
import { Vector } from "../../core/vector";
import { Sequence } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { ComponentView } from "../component";
import { SequenceComponent } from "../sequence/sequence-component";

const SIZE = 30;
const LABEL_HEIGHT$1 = 40;
const LABEL_PADDING_X = 10;
const MIN_LABEL_WIDTH = 50;
export class StartComponentView implements ComponentView {
  public static create(
    parent: SVGElement,
    sequence: Sequence,
    configuration: StepsConfiguration
  ): StartComponentView {
    const g = Dom.svg("g");
    parent.appendChild(g);

    const sequenceComponent = SequenceComponent.create(
      g,
      sequence,
      configuration
    );
    const view = sequenceComponent.view;

    let startCircle;
    if (sequence.length == 0) {
      startCircle = createCircle(
        g,
        view.joinX - SIZE / 3,
        0,
        "     Set up the trigger     "
      );
    } else if (!sequence[0].id.startsWith("start-component")) {
      startCircle = createCircle(
        g,
        view.joinX - SIZE / 3,
        0,
        "     Set up the trigger     "
      );
    } else {
      startCircle = createCircle(g, view.joinX - SIZE / 3, 0, " ");
    }
    // Dom.translate(startCircle, view.joinX - SIZE / 2, 0);
    g.appendChild(startCircle);

    Dom.translate(view.g, 100, SIZE);

    return new StartComponentView(
      g,
      view.width,
      view.height + SIZE * 2,
      view.joinX,
      sequenceComponent
    );
  }

  private constructor(
    public readonly g: SVGGElement,
    public readonly width: number,
    public readonly height: number,
    public readonly joinX: number,
    public readonly component: SequenceComponent
  ) {}

  public getClientPosition(): Vector {
    throw new Error("Not supported");
  }

  public destroy() {
    this.g.parentNode?.removeChild(this.g);
  }
}

function createCircle(
  parent: SVGElement,
  x: number,
  y: number,
  text: string
): SVGGElement {
  let g = Dom.svg("g", {
    class: "sqd-start",
    id: "start",
  });
  parent.appendChild(g);
  if (text == " ") {
    Dom.attrs(g, {
      visibility: "hidden",
    });
    // return g;
  }

  const nameText = Dom.svg("text", {
    class: "sqd-label-text",
    x: x+100,
    y: y + LABEL_HEIGHT$1 / 2,
  });
  nameText.textContent = text;
  g.appendChild(nameText);
  const nameWidth = Math.max(
    g.getBBox().width + LABEL_PADDING_X * 2,
    MIN_LABEL_WIDTH
  );
  const nameRect = Dom.svg("rect", {
    class: "sqd-label-rect",
    width: nameWidth*2,
    height: LABEL_HEIGHT$1,
    x:x - nameWidth / 2+42,
    y,
    rx: 20,
    ry: 20,
  });

  g.insertBefore(nameRect, nameText);
  return g;
}

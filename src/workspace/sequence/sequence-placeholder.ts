import { Dom } from "../../core/dom";
import { Sequence } from "../../definition";
import { Placeholder } from "../component";

export class SequencePlaceholder implements Placeholder {
  public constructor(
    public readonly element: Element,
    public readonly parentSequence: Sequence,
    public readonly index: number
  ) {}

  public setIsHover(isHover: boolean) {
    Dom.toggleClass(this.element, isHover, "sqd-hover");
    Dom.toggleClass(
      <Element>this.element.childNodes[0],
      !isHover,
      "sqd-hidden"
    );
  }
}

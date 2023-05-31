import { Dom } from "../../core/dom";
import { Vector } from "../../core/vector";
import { ComponentType, Sequence } from "../../definition";
import { StepsConfiguration } from "../../designer-configuration";
import { JoinView } from "../common-views/join-view";
import { Component, ComponentView } from "../component";
import { StepComponentFactory } from "../step-component-factory";

const PH_WIDTH = 100;
const PH_HEIGHT = 150;
const SIZE = 30;
let component_length = 0;

function addStop() {
    const s = SIZE * 0.5;
    const m = (SIZE - s) / 2;

    //   const circle = Dom.svg("circle", {
    //     class: "sqd-start-stop sqd-hidden",
    //     cx: SIZE / 2,
    //     cy: SIZE / 2,
    //     r: SIZE / 2,
    //   });
    const g = Dom.svg("g", { class: "stop", id: "stop" });
    //   g.appendChild(circle);

    //   const stop = Dom.svg("rect", {
    //     class: "sqd-start-stop-icon",
    //     x: m,
    //     y: m,
    //     width: s,
    //     height: s,
    //     rx: 4,
    //     ry: 4,
    //   });

    const endAuto = Dom.svg("image", {
        class: "sqd-end-icon",
        href: "./assets/end.svg",
        width: 20,
        height: 20,
        x: 5,
        y: 5,
    });

    const endText = Dom.svg("text", {
        class: "sqd-end-text",
        x: -43,
        y: 40,
    });
    endText.textContent = "End this automation";
    g.appendChild(endAuto);
    g.appendChild(endText);
    return g;
}

export class SequenceComponentView implements ComponentView {
    public static create(
        parent: SVGElement,
        sequence: Sequence,
        configuration: StepsConfiguration
    ): SequenceComponentView {
        const g = Dom.svg("g");
        parent.appendChild(g);

        // const gGroup = Dom.svg("g", {
        //   class: "sqd-task-GGGroup"
        // });

        // g.appendChild(gGroup);

        const components = sequence.map((s) =>
            StepComponentFactory.create(g, s, sequence, configuration)
        );
        component_length = components.length;
        // console.log(component_length);

        const maxJoinX =
            components.length > 0
                ? Math.max(...components.map((c) => c.view.joinX))
                : PH_WIDTH / 2;
        const maxWidth =
            components.length > 0
                ? Math.max(...components.map((c) => c.view.width))
                : PH_WIDTH;

        let offsetY = PH_HEIGHT;

        const placeholders: SVGElement[] = [];

        // Empty canvas
        if (components.length == 0) {
            placeholders.push(appendPlaceholder(g, maxJoinX - PH_WIDTH / 2, 0));
        }
        // Adding lines, placeholders, and stop points on TOP of components
        let i = 0;
        for (i; i < components.length; i++) {
            const component = components[i];
            const offsetX = maxJoinX - component.view.joinX;

            JoinView.createStraightJoin(
                g,
                new Vector(maxJoinX, offsetY - PH_HEIGHT),
                PH_HEIGHT
            );

            placeholders.push(
                appendPlaceholder(g, maxJoinX - PH_WIDTH / 2, offsetY - PH_HEIGHT)
            );

            Dom.translate(component.view.g, offsetX, offsetY);
            offsetY += component.view.height + PH_HEIGHT;
        }

        /* Add placeholder & stop sign to the BOTTOM of last component 
            if it's not a switch component */
        if (i > 0 && components[i - 1].step.componentType == ComponentType.task) {
            JoinView.createStraightJoin(
                g,
                new Vector(maxJoinX, offsetY - PH_HEIGHT),
                PH_HEIGHT
            );
            placeholders.push(
                appendPlaceholder(g, maxJoinX - PH_WIDTH / 2, offsetY - PH_HEIGHT)
            );
            // Add stop sign to task block
            const stop = addStop();
            Dom.translate(stop, maxJoinX - PH_WIDTH / 6.8, offsetY - PH_HEIGHT / 16);

            // Calculate location
            g.appendChild(stop);
            g.insertBefore(stop, g.firstChild);
        }



        let containsSwitch;
        for (i = 0; i < components.length; i++) {
            // Modify switch components
            if (components[i].step.componentType == ComponentType.switch) {
                JoinView.createStraightJoin(g, new Vector(maxJoinX, 0), PH_HEIGHT);
                containsSwitch = 1;
                // If there is one or more blocks below if/else,
                // move them to the end of true branch
                while (components[i + 1]) {
                    // Move every block to true branch
                    components[i].step.branches.True.push(
                        components[i].parentSequence[i + 1]
                    );

                    // Remove from parent sequence of if/else & components
                    components[i].parentSequence.splice(i + 1, 1);
                    components.splice(i + 1, 1);
                }
            }
        }
        // Hide start component, and placeholder & line below it
        //if (components.length > 0 && components[0].step.id == 'start-component') {
        if (
            components.length > 0 &&
            components[0].step.id.startsWith("start-component")
        ) {
            Dom.attrs(placeholders[0], {
                display: "none",
            });
            const lines = parent.childNodes[0].childNodes;
            // console.log(lines); 
            if (components.length == 1) {
                parent.childNodes[0].removeChild(lines[2]);
            }
            else {
                if (containsSwitch) {
                    parent.childNodes[0].removeChild(lines[components.length]);
                    parent.childNodes[0].removeChild(lines[0]);
                } else {
                      parent.childNodes[0].removeChild(lines[components.length + 1]);
                }
            }
            document
                .getElementsByClassName("sqd-input")[0]
                .setAttribute("display", "none");
        }

        let holderElement = document.getElementsByClassName('sqd-placeholder');
        console.log("Comp Len: " + components.length); 
        if (components.length == 0) {
            Dom.attrs(holderElement[0], {
                visibility: 'hidden'
            });
        } else {
            Dom.attrs(holderElement[0], {
                visibility: 'shown'
            });
        }


        let joinElement = document.getElementsByClassName('sqd-join');
        // if (joinElement.length >= 2) {
        //     Dom.attrs(joinElement[0], {
        //         visibility: 'hidden'
        //     });
        // }

        return new SequenceComponentView(
            g,
            maxWidth,
            offsetY,
            maxJoinX,
            placeholders,
            components
        );
    }

    private constructor(
        public readonly g: SVGGElement,
        public readonly width: number,
        public readonly height: number,
        public readonly joinX: number,
        public readonly placeholders: SVGElement[],
        public readonly components: Component[]
    ) { }

    public getClientPosition(): Vector {
        throw new Error("Not supported");
    }

    public setIsDragging(isDragging: boolean) {
        this.placeholders.forEach((p) => {
            Dom.attrs(p, {
                visibility: isDragging ? "visible" : "hidden",
            });
        });
    }
}

function appendPlaceholder(g: SVGGElement, x: number, y: number): SVGElement {
    const g1 = Dom.svg("g", {
        class: "sqd-placeholder",
    });

    const circle = Dom.svg("circle", {
        class: "sqd-placeholder-circle",
        cx: x + PH_WIDTH / 2,
        cy: y + PH_HEIGHT / 2,
        r: SIZE / 3 + 2,
    });
    const startX = x + PH_WIDTH / 2 - SIZE / 8;
    const startY = y + PH_HEIGHT / 2 - SIZE / 8;
    const endX = x + PH_WIDTH / 2 + SIZE / 8;
    const endY = y + PH_HEIGHT / 2 + SIZE / 8;

    const sign = Dom.svg("path", {
        class: "sqd-placeholder-icon",
        d: `M ${startX - 3.5} ${y + PH_HEIGHT / 2} H ${endX + 3.5} M ${x + PH_WIDTH / 2
            } ${startY - 3.5} V ${endY + 3.5}`,
    });

    // Outside circle
    const outside = Dom.svg("circle", {
        id: "outside-circle",
        cx: x + PH_WIDTH / 2,
        cy: y + PH_HEIGHT / 2,
        r: 27,
    });
    Dom.toggleClass(outside, true, "sqd-hidden");
    g1.appendChild(outside);

    g1.appendChild(circle);
    g1.appendChild(sign);

    g.insertBefore(g1, g.children[component_length + 1])


    return g1;
}

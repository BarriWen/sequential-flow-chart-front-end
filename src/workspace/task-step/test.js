const prompt = Dom.svg("text", {
            class: "sqd-date-prompt sqd-hidden",
            fill: "#F00000",
            x: DROPDOWN_X3,
            y: DROPDOWN_Y + 36,
            "font-size": "9px",
});
prompt.setAttribute("x", (DROPDOWN_X2 + 2).toString());
prompt.setAttribute("y", (DROPDOWN_Y + 36).toString());
const dropdownBoxShape1 = Dom.svg("rect", {
            width: DROPDOWN2_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#bfbfbf",
            x: DROPDOWN_X2,
            y: DROPDOWN_Y,
            rx: 5,
            ry: 5,
        });
        const dropdownBoxShape2 = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#bfbfbf",
            x: DROPDOWN_X3,
            y: DROPDOWN_Y,
            rx: 5,
            ry: 5,
        });
        const dropdownBoxShapeAct1 = Dom.svg("rect", {
            width: DROPDOWN2_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#bfbfbf",
            x: DROPDOWN_X2 - 30,
            y: DROPDOWN_Y,
            rx: 5,
            ry: 5,
        });
        const dropdownBoxShapeAct2 = Dom.svg("rect", {
            width: 70,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "#fff",
            stroke: "#bfbfbf",
            x: DROPDOWN_X3 + 50,
            y: DROPDOWN_Y,
            rx: 5,
            ry: 5,
        });
        const dropdownBoxShapeMain1 = Dom.svg("rect", {
            width: DROPDOWN1_W,
            height: DROPDOWN_H,
            class: "option select-field",
            fill: "rgba(255, 255, 255, 0)",
            // stroke: "#a0a0a0",
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + DROPDOWN_H + 8,
            rx: 5,
            ry: 5,
        });
        const inputArea = Dom.svg("foreignObject", {
            class: "sqd-input-area sqd-hidden",
            x: DROPDOWN_X3,
            y: DROPDOWN_Y,
            width: 130,
            height: 30,
        });
        const actInputArea = Dom.svg("foreignObject", {
            class: "sqd-act-input-area sqd-hidden",
            x: 280,
            y: DROPDOWN_Y,
            width: 65,
            height: 30,
        });
        const locInputArea = Dom.svg("foreignObject", {
            class: "location-input sqd-hidden",
            id: 'searchbox',
            x: DROPDOWN_X1,
            y: DROPDOWN_Y + DROPDOWN_H + 17,
            width: 400,
            height: 30,
        });

        dropdownBoxShape1.setAttribute("stroke", "#bfbfbf");
        dropdownBoxShape2.setAttribute("stroke", "#bfbfbf");
        textInput.setAttribute("style", "border-color: #BFBFBF");
        locTextInput.setAttribute("style", "border-color: #BFBFBF");
        dropdownBoxShapeAct1.setAttribute("stroke", "#BFBFBF");
        actTextInput.setAttribute("style", "border-color: #BFBFBF");
        dropdownBoxShapeAct2.setAttribute("stroke", "#BFBFBF");
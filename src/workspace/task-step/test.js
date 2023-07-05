const prompt = Dom.svg("text", {
            class: "sqd-date-prompt sqd-hidden",
            fill: "#F00000",
            x: DROPDOWN_X3 - 3,
            y: DROPDOWN_Y + 40,
        });
prompt.textContent = "Incorrect Date Format";
        // New click save validation logic
            if (validated && choice2 != "Is Blank" && choice2 != "Blank") {
                if (choice1 == "Email Address" ||
                    choice1 == "Full Name" ||
                    choice1 == "First Name" ||
                    choice1 == "Last Name" ||
                    choice1 == "Phone Number" || 
                    (choice1 == "Birthday" &&
                        (choice2 == "Date Is" || choice2 == "Is Before Date" || choice2 == "Is After Date")))
                {
                    step.properties["value"] = textInput.value;
                } else if (choice1 == "Tag" ||
                    choice1 == "Gender" ||
                    choice2 == "Month Is")
                {
                    if (dropdownBoxInnerText2.textContent) {
                        step.properties["value"] = dropdownBoxInnerText2.textContent;
                    }
                } else if (choice1 == "Opened" || choice1 == "Not Opened" || choice1 == "Clicked" || choice1 == "Not Clicked") {
                    if (valiText) {
                        step.properties["value"] = actTextInput.value + " " + dropdownBoxInnerTextAct2.textContent;
                    } else {
                        actTextInput.value == "";
                    }
                }

            } else {
                textInput.value = ""; // Reset
                dropdownBoxInnerText2.textContent = "";
                actTextInput.value == "";
            }
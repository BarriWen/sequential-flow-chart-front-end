if (choice1 == "Full Name" && /[^a-zA-Z0-9\s]/g.test(textInput.value)) {
                    textInput.value = ""; // Reset
                    return;
                }
                if ((choice1 == "First Name" || choice1 == "Last Name") && /[^a-zA-Z0-9]/g.test(textInput.value)) {
                    textInput.value = ""; // Reset
                    return;
                }
                if (choice1 == "Phone Number" && /[^0-9()-]/g.test(textInput.value)) {
                    textInput.value = ""; // Reset
                    return;
                }
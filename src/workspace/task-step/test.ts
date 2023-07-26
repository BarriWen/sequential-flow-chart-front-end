upCheckIcon.addEventListener("click", function(e){
      e.stopPropagation();
      let ifselected = false;
      let weekAndTime:string = '';
      step.properties["send"] = ""; 
      step.properties["timezone"] = ""; 
      step.properties["list"] = ""; 
      step.properties["frequency"] = ""; 

      if(dropdownBoxInnerText1.textContent == "Recurring"){
        for(let i=2;i<9;i++){
          if(gWeeks.children[i].classList.contains("selected")){
            weekAndTime += `${gWeeks.children[i].children[5].textContent}`+`${gWeeks.children[i].children[0].children[1].textContent}`+`${gWeeks.children[i].children[1].children[1].textContent},`;
            ifselected = true;
          }
        }
        if(ifselected == false){
          alert("please select at least one weekday");
          return;
        }
        const d = new Date();
        let todayMonth = d.getMonth()+1;
        let todayYear = d.getFullYear();
        let todayDate = d.getDate();
        //@ts-ignore
        let inputMonth = parseInt(document.getElementsByClassName("date-input")[0].value);
        //@ts-ignore
        let inputDate = parseInt(document.getElementsByClassName("date-input")[1].value);
        //@ts-ignore
        let inputYear = parseInt(document.getElementsByClassName("date-input-year")[0].value);

        if(inputYear < todayYear || isNaN(inputYear)){
          alert("please input right year of end date");
          return;
        }
        if((inputMonth < todayMonth && inputYear == todayYear) || inputMonth > 12 || inputMonth < 1 || isNaN(inputMonth)){
          alert("please input right month of end date");
          return;
        }
        //@ts-ignore
        if(isNaN(inputDate) || (inputDate < todayDate && inputMonth == todayMonth && inputYear == todayYear)){
          alert("please input right date of end date");
          return;
        }
        let lastDayOfMonth = new Date(inputYear, inputMonth, 0);
        if(inputDate > lastDayOfMonth.getDate()){
          alert("please input right date of end date");
          return;
        }
        //@ts-ignore
        step.properties["send"] = weekAndTime + 'End date:' + `${document.getElementsByClassName("date-input")[0].value}` + '/' + `${document.getElementsByClassName("date-input")[1].value}` + '/' + `${document.getElementsByClassName("date-input-year")[0].value}`;
        // Set timezone info
        step.properties["timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } else {
        //  Send Once logic
        if((OnceDates && OnceDates.length == 0) || !OnceDates){
          alert("please select a day");
          return;
        } else {
          step.properties["send"] = '';
          for(let k=0;k<OnceDates.length;k++){
            step.properties["send"] += OnceDates[k] + "T";
            if (parseInt(setTimeInput.value) > 0 && parseInt(setTimeInput.value) < 13 && Number.isInteger(parseInt(setTimeInput.value))) {
              // Validate hours
              let currentDate = new Date();
              let currentHours = currentDate.getHours();
              for (let dateString of OnceDates) {
                let parts = dateString.split('-'); // Split the string into parts.
                let year = parseInt(parts[0]);
                let month = parseInt(parts[1]);
                let day = parseInt(parts[2]);
                if (year === currentDate.getFullYear()
                  && month === currentDate.getMonth() + 1
                  && day === currentDate.getDate()
                )
                {
                  let h = parseInt(setTimeInput.value);
                  if (setTimeAmRect.classList.contains("selected")) {
                    if (currentHours >= 12 || h <= currentHours || (h === 12 && currentHours === 0)) {
                      alert("please enter correct hour");
                      return;
                    }
                  } else {
                    if (h != 12) {
                      h += 12;
                    }
                    if (h <= currentHours) {
                      alert("please enter correct hour");
                      return;
                    }
                  }
                }
              }

              step.properties["send"] += setTimeInput.value + ':00';

              if(setTimeAmRect.classList.contains("selected")){
                step.properties["send"] += "AM";
              }else{
                step.properties["send"] += "PM";
              }
              if (k < OnceDates.length - 1) {
                step.properties["send"] += ",";
              }
              // Set timezone info
              step.properties["timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
            }else{
              alert("please enter correct hour");
              return;
            }
          }
        }
      }

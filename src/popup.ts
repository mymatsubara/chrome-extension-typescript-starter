import * as $ from "jquery";
import { POPUP_OPEN } from "./constants";
import { AriaLabelInfo } from "./content_script";

function saveContentToFile(content: string, filename: string): boolean {
  const pom = document.createElement("a");
  pom.setAttribute("href", "data:text/csv;charset=utf-8," + content)
  pom.setAttribute("download", filename)

  if (document.createEvent) {
    var event = document.createEvent("MouseEvent")
    event.initEvent("click", true, true)
    pom.dispatchEvent(event)
  } else {
    pom.click();
  }

  return true;
}

function generateCsvFrom(elements: AriaLabelInfo[] | undefined): string {
  let result = "Date,Time,Event Name,Calendar,Status,Location\n";
  elements?.forEach(({ariaLabel}) => {
    const details = ariaLabel      
      .split(",")
      .map((d) => d.trim());
    result += `${details[5]} ${details[6] || ""},${details[0]},${details[1]},${details[2]},${details[3]},${details[4]}\n`;
  });
  return escape(result);
}

$(function () {
  const queryInfo = {
    active: true,
    currentWindow: true,
  };

  function getEventElements(callback: (eventElements: AriaLabelInfo[] | undefined) => void) {
    chrome.tabs.query(queryInfo, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { message: POPUP_OPEN },
        (res: AriaLabelInfo[]) => {
          if (chrome.runtime.lastError){
            console.log(chrome.runtime.lastError.message)            
          } else {
            callback(res);
          }
        }
      );
    });
  }

  // Fires when popup is open
  getEventElements((events) => {
    const text = events?.length.toString() || "0";
    chrome.browserAction.setBadgeText({ text });
    document.getElementById("event-counter").innerHTML = text;
  });

  // Fires when user clicks to export csv
  document.getElementById("export-csv").addEventListener("click", () => {
    // Events counter set to 0
    const eventCounter = document.getElementById("event-counter").innerHTML;
    if (eventCounter === "0") {
      const errorDisplay = document.getElementById("export-error");
      errorDisplay.style.display = "flex";
      setTimeout(() => {
        errorDisplay.style.display = "none";
      }, 7000);
    }
    // There are events to be imported
    else {
      getEventElements((events) => {
        saveContentToFile(generateCsvFrom(events), "Calendar.csv");
      });
    }
  });
});

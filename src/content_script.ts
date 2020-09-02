import { CALENDAR_UPDATE_MSG, POPUP_OPEN, DEFAULT_CSS_EVENT_CLASS } from "./constants";

export interface AriaLabelInfo {
  ariaLabel: string;
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  console.log(msg);
    if (msg.message === CALENDAR_UPDATE_MSG) {
      const text = document
        .querySelectorAll(DEFAULT_CSS_EVENT_CLASS)
        .length.toString();
      sendResponse({ text });
    } else if (msg.message === POPUP_OPEN) {
      const events: AriaLabelInfo[] = [];
      document
        .querySelectorAll(DEFAULT_CSS_EVENT_CLASS)
        .forEach((e) =>
          events.push({ ariaLabel: e.getAttribute("aria-label") })
        );
      sendResponse(events);
    } else {
      sendResponse("");
    }
});

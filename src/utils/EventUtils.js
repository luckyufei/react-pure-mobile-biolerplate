export function triggerClick(element, data = {}) {
  let clickEvent;
  if (typeof Event !== 'undefined') {
    clickEvent = new Event('click');
  } else {
    clickEvent = document.createEvent('MouseEvent');
    clickEvent.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }

  Object.assign(clickEvent, data);

  if (element && element.dispatchEvent) {
    element.dispatchEvent(clickEvent);
  } else {
    console.warn(`Trigger click on element: `, element, ' failed, check if you pass a right DOM element.');
  }
}

window.onerror = function(msg, url, line, col, error) {
  var newMsg = msg;
  if (error && error.stack) {
    newMsg = _processStackMsg(error);
  }
  if (_isOBJByType(newMsg, "Event")) {
    newMsg += newMsg.type ? ("--" + newMsg.type + "--" + (newMsg.target ? (newMsg.target.tagName + "::" + newMsg.target.src) : "")) : "";
  }
  console.warn(`window onerror:  target=${url} rowNum=${line} colNum=${col} \n ${newMsg}`);
};

function _isOBJByType(o, type) {
  return Object.prototype.toString.call(o) === "[object " + (type || "Object") + "]";
};

function _processStackMsg(error) {
  var stack = error.stack.replace(/\n/gi, "").split(/\bat\b/).slice(0, 9).join("@").replace(/\?[^:]+/gi, "");
  var msg = error.toString();
  if (stack.indexOf(msg) < 0) {
    stack = msg + "@" + stack;
  }
  return stack;
};
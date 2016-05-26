export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
//操作localstorage 
export function saveInLocal(key, value) {
  window.localStorage.setItem(key, value)
}

export function getFromLocal(key) {

  // if(!__SERVER__ && typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem){
  //   return window.localStorage.getItem(key);
  // }
  return false;
}
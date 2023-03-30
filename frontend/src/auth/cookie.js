
// Function for setting a cookie using localStorage
export function setCookie(cookieName, cookieValue) {
  window.localStorage.setItem(cookieName, JSON.stringify(cookieValue));
}
// Function for getting a cookie value using localStorage
export function getCookie(cookieName) {
// Retrieve the cookie value from localStorage
const result = window.localStorage.getItem(cookieName);
  return JSON.parse(result);
}
// Function for deleting a cookie using localStorage
export function deleteCookie(cookieName) {
  window.localStorage.removeItem(cookieName);
  return true;
}

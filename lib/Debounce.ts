/**
 * Util to debounce call to a function.
 * >>> debounce(function(){}, 1000, this)
 */
export const debounce = (function () {
  let timeoutId: any = null;
  return function (func: Function, timeout: number, context: any) {
    context = context || this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      func.apply(context, arguments);
    }, timeout);

    return timeoutId;
  };
})();

class T {
  constructor(type) {
    this.type = type;
  }

  show(message) {
    if (!message) {
      return;
    }
    let divElement = document.createElement("div");
    divElement.className = `toastify ${this.type}`;
    divElement.innerHTML = message;
    this.toastElement = divElement;

    var rootElement = document.body;
    rootElement.appendChild(this.toastElement);

    window.setTimeout(
      function () {
        // Remove the toast from DOM
        this.removeElement(this.toastElement);
      }.bind(this),
      3000
    ); // Binding `this` for function invocation
  }

  removeElement(toastElement) {
    window.setTimeout(
      function () {
        // Remove the element from the DOM, only when the parent node was not removed before.
        if (toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement);
        }
      }.bind(this),
      400
    );
  }
}

const toast = {};

toast.success = createToastByType('SUCCESS');
toast.info = createToastByType('INFO');
toast.error = createToastByType('ERROR');
toast.warning = createToastByType('WARNING');

function createToastByType(type) {
  const t = new T(type);
  return (content) => {
    t.show(content)
  };
}
document.addEventListener("HWDataEvent", function(event) {
  //console.log("toast HWDataEvent handled: ", event);
});

export {toast};

'use strict';

const injectFunction = (data) => {
  const div = document.createElement("div");
  div.className = "menu_button";
  div.innerHTML = `тест тостов`;
  div.dataset.id = i.id;
  div.addEventListener("click", onclick);
  document.querySelector(".main_menu").appendChild(div);
}

const rnd = () => crypto.getRandomValues(new Uint8Array(10)).reduce((acc, val) => acc + val.toString(16))

const onclick = async (e) => {
  toast.success(rnd())
}

export default injectFunction;
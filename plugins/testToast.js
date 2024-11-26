'use strict';

const injectFunction = (data) => {
  const div = document.createElement("div");
  div.className = "menu_button";
  div.innerHTML = `тест тостов`;
  div.dataset.id = i.id;
  div.addEventListener("click", onclick);
  document.querySelector(".main_menu").appendChild(div);
}

const onclick = async (e) => {
  toast.success('alarma')
}

export default injectFunction;
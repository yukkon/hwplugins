"use strict";

/*
onmessage = async (evt) => {
  try {
    const canvas = evt.data;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      postMessage("unsupported browser");
      return;
    }
    const img = await fetch("https://upload.wikimedia.org/wikipedia/commons/5/55/John_William_Waterhouse_A_Mermaid.jpg").then(r => r.blob()).then(b => createImageBitmap(b));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } catch (e) {
    postMessage("unsupported browser");
    throw e;
  }
};
*/

import d from "../DrawerNew.js";

let drawer = new d(XXX);

onmessage = async (e) => {
  console.log('Worker: draw');

  let url = await drawer.draw(e.data.canvas, e.data.data);
  postMessage({id: e.data.id, url})
};
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

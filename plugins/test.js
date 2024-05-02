'use strict';


const logRewards = (reward) => {
  //let g = document.getElementById("reward");
  let g = document.createElement("canvas");
  let ctx = g.getContext("2d")
  g.width = 56 * Object.keys(reward).length;
  g.height = 56;
  let i = 0;
  
  Object.keys(reward).forEach(gk => {
      const item = lib.data.inventoryItem['gear'][gk];

      let im = x.cachedImages.get(`gear_icons_05.xml/${item.assetTexture}`) ?? x.cachedImages.get(`gear_icons_2_05.xml/${item.assetTexture}`);

      ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 56*i+3, 3, 50, 50);

      const b = x.cachedImages.get(`dialog_basic.rsx/${lib.data.enum.itemColor[item.color].fragmentFrameAssetTexture}`);
      ctx.drawImage(b.image, b.x, b.y, b.width, b.height, 56*i, 0, 56, 56);

      ctx.font = "bold 14px Sans Serif";
      ctx.textAlign = 'center';
      const m = ctx.measureText(reward[gk]).width; 
      ctx.fillStyle = '#160A02';
      ctx.fillRect(56*(i+1)-m-14, 36, m+8, 13);

      ctx.font = "bold 14px Sans Serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F2E84A';
      let k = [14,16,21][Math.ceil(m / 7)-1];
      ctx.fillText(reward[gk], 56*(i+1)-k, 48);
    i++;
  })
  
  return g.toDataURL();
}

const injectFunction = () => {
  const div = document.createElement('div');
  div.className = 'scriptMenu_button'
  div.innerHTML = '<div class="scriptMenu_buttonText">Draw</div>';
  div.addEventListener("click", async () => {
    const b = document.querySelector('.PopUp_back');
    const container = b.querySelector('.PopUp_');

    b.classList.remove('PopUp_hideBlock');
    container.classList.remove('PopUp_hideBlock');

    let button = document.createElement('div')
		button.classList.add('PopUp_close');
		container.append(button);
	
		let crossClose = document.createElement('div')
		crossClose.classList.add('PopUp_crossClose');
		button.append(crossClose);

    button.addEventListener('click', () => {
      container.classList.add('PopUp_hideBlock');
      b.classList.add('PopUp_hideBlock');
      container.innerHTML = '';
    });

    let src = logRewards({'87': 8,'131':192,'234': 87})
    container.innerHTML = `<img src=${src} />`;
});

  document.querySelector('.scriptMenu_main').appendChild(div);
}

document.addEventListener("HWDataEvent", function(event) {
  //console.log("TOP HWDataEvent handled: ", event);
  if (event.detail.type == "DOMLoaded") {
    injectFunction();
  }
});

export default injectFunction;
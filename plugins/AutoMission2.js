'use strict';

let a;
let userInfo;
let vipLevel;

const injectFunction = async (data) => {
  userInfo = await Send('{"calls":[{"name":"userGetInfo","args":{},"ident":"body"}]}').then(r => r.results[0].result.response)
  vipLevel = Math.max(...lib.data.level.vip.filter(l => l.vipPoints <= +userInfo.vipPoints).map(l => l.level));
  const div = document.createElement("div");

  if (vipLevel) {
    div.className = "menu_button";
    div.innerHTML = `тест авторесурс`;
    div.dataset.id = i.id;
    div.addEventListener("click", onclick);
    document.querySelector(".main_menu").appendChild(div);
  }
}

const map = {
  hero: {
    icon: (id) => `hero_icons_only.xml/${XXX.lib.hero[id].iconAssetTexture}`,
    border: (color) => `dialog_basic.rsx/${XXX.lib.enum.heroColor[color].frameAssetTexture_small}`,
    background: (color) => `dialog_basic.rsx/${XXX.lib.enum.heroColor[color].backgroundAssetTexture}`,
  }
}

const onclick = async (e) => {
  a = new AutoMiss2();

  const b = document.querySelector(".PopUp_back");

  const r = b.querySelector(".PopUp_");
  r.classList.add("PopUp_hideBlock");

  const container = document.createElement("div");
  container.className = "PopUpn_";
  b.appendChild(container);

  let arr = Object.values(await a.Heroes).map(h => {
    const slots = lib.data.hero[h.id].color[h.color].items.map((val, ind) => h.slots[ind] ?? val);
    return {id: h.id, name: cheats.translate(`LIB_HERO_NAME_${h.id}`), color: h.color, slots: slots, power: h.power}
  }).filter(h => h.slots.reduce((a,s) => a+s, 0) > 0).sort((a, b) => b.power - a.power);

  console.log(arr);

  let res = document.createElement("div");
  res.id = '__grid';
  container.append(res);

  arr.forEach(async x => {
    let ev = document.createElement("div");
    ev.classList = 'her'
    res.append(ev);

/*
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('bitmaprenderer');
    ctx.transferFromImageBitmap(bmp);
  */
 /*  
    const blob2 = await new Promise((res) => canvas.toBlob(res));
    const img = document.body.appendChild(new Image());
    img.src = URL.createObjectURL(blob2);
*/

    const ocanvas = new OffscreenCanvas(64, 64);
    const ctx = ocanvas.getContext("2d");

    //bg
    let k = map.hero.background(x.color);
    let im = XXX.cachedImages.get(k);
    ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 0, 0, 64, 64);
    
    //icon
    k = map.hero.icon(x.id);
    im = XXX.cachedImages.get(k);
    ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 2, 2, 60, 60);

    //border
    k = map.hero.border(x.color);
    im = XXX.cachedImages.get(k);
    ctx.drawImage(im.image, im.x, im.y, im.width, im.height, 0, 0, 64, 64);

    const blob = await ocanvas.convertToBlob({ type: 'image/png' });

    let n = document.createElement("img");
    n.src = URL.createObjectURL(blob);
    n.addEventListener("click", () => {
      console.log('H:', x.id)
      a.start(x.id)
      b.classList.add("PopUp_hideBlock");
      b.removeChild(container);
    })
    ev.append(n);
  })

  b.classList.remove("PopUp_hideBlock");

  let button = document.createElement("div");
  button.classList.add("pp_close");
  container.append(button);
  button.addEventListener("click", () => {
    b.classList.add("PopUp_hideBlock");
    b.removeChild(container);
  });
}

class AutoMiss2 {
  constructor() {
    this.myHeroes = undefined;
    this.inventory = undefined;
    this.missions = undefined;
    this.availableMissionsToRaid = undefined;
	}

  get Heroes() {
    return (async () => await Send('{"calls":[{"name":"heroGetAll","args":{},"ident":"body"}]}').then(r => r.results[0].result.response))()
  }

	async start(heroId) {
    if (!this.myHeroes) {
      this.myHeroes = await Send('{"calls":[{"name":"heroGetAll","args":{},"ident":"body"}]}').then(r => r.results[0].result.response)
    }
    if (!this.inventory) {
      this.inventory = await Send('{"calls":[{"name":"inventoryGet","args":{},"ident":"body"}]}').then(r => r.results[0].result.response)
    }

    const hero = Object.values(this.myHeroes).find(h => h.id == heroId)
    const slots = getHeroItemsToNextColor(hero);
    
    function getHeroItemsToNextColor(hero) {
      return lib.data.hero[hero.id].color[hero.color].items.reduce((acc, val, ind) => {acc[val] = hero.slots[ind] ?? 1; return acc}, {});
    }
    const res = this.f0({gear: slots});

    console.log("требуемый ресурс", res); //  {"fragmentGear": "167", count: 32} => {key: "fragmentGear", value: "167", count: 32}

    window.setProgress(`Необходимо: ${res.count} ${res.key.indexOf('fragmant') ? "фрагмент": ""} ${cheats.translate(`LIB_${res.key.replace('fragment', '').toUpperCase()}_NAME_${res.value}`)} `)  
  }

  f0(obj, count = 1) {
    if (count == 0) { return undefined; };
    delete obj.gold;
    let res = undefined;
    for (let item of Object.keys(obj)) { //gear scroll
      if (res) break;
      for (let id of Object.keys(obj[item])) { // 102
        if (res) break;
        if (obj[item][id]*count != 0) {
          const countInv = this.inventory[item][id] ?? 0;
          if (obj[item][id]*count > countInv) {
            const rec = lib.data.inventoryItem[item][id].craftRecipe;
            if (rec) {
              res = this.f0(rec, obj[item][id]*count - countInv);
            } else {
              const capitalized = item.charAt(0).toUpperCase() + item.slice(1)
              if (lib.data.inventoryItem[item][id]?.fragmentMergeCost) {
                res = {key:`fragment${capitalized}`, value: id, count: obj[item][id] * count * lib.data.inventoryItem[item][id]?.fragmentMergeCost?.fragmentCount - (this.inventory[`fragment${capitalized}`][id] || 0)};
              } else {
                res = {key: [item], value: id, count: obj[item][id]*count - (this.inventory[`fragment${capitalized}`][id] || 0)};
              }
            }
          }
        }
      }
    }
    return res;
  }

  // {fragmentHero: 20}
  // {"fragmentGear": "167"}
  searchMissions(item) {
    let out = [];
    if (item) {
      Object.keys(item).forEach(k => {
        if (this.Reward2Mission[k]) {
          out = this.Reward2Mission[k][item[k]]??[]
        }
      })
    }
    return out;
  }
}

export default injectFunction;
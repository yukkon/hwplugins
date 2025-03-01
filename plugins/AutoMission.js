"use strict";

import AutoMiss2 from "./AutoMission2.js";

let userInfo;
let vipLevel;

const injectFunction = async (data) => {
  userInfo = await Send(
    '{"calls":[{"name":"userGetInfo","args":{},"ident":"body"}]}'
  ).then((r) => r.results[0].result.response);
  vipLevel = Math.max(
    ...lib.data.level.vip
      .filter((l) => l.vipPoints <= +userInfo.vipPoints)
      .map((l) => l.level)
  );
  const div = document.createElement("div");

  if (vipLevel >= 1) {
    div.className = "menu_button";
    div.innerHTML = `Автофарм`;
    div.dataset.id = i.id;
    div.addEventListener("click", onclick);
    document.querySelector(".main_menu").appendChild(div);
  }
};

const map = {
  hero: {
    icon: (id) => `hero_icons_only.xml/${lib.data.hero[id].iconAssetTexture}`,
    border: (color) =>
      `dialog_basic.rsx/${lib.data.enum.heroColor[color].frameAssetTexture_small}`,
    background: (color) =>
      `dialog_basic.rsx/${lib.data.enum.heroColor[color].backgroundAssetTexture}`,
  },
};

const onclick = async (e) => {
  const b = document.querySelector(".PopUp_back");

  const r = b.querySelector(".PopUp_");
  r.classList.add("PopUp_hideBlock");

  const container = document.createElement("div");
  container.className = "PopUpn_";
  b.appendChild(container);

  const Heroes = await Send(
    '{"calls":[{"name":"heroGetAll","args":{},"ident":"body"}]}'
  ).then((r) => r.results[0].result.response);

  let arr = Object.values(Heroes)
    .map((h) => {
      const slots = lib.data.hero[h.id].color[h.color].items.map(
        (val, ind) => h.slots[ind] ?? val
      );
      return {
        id: h.id,
        name: cheats.translate(`LIB_HERO_NAME_${h.id}`),
        color: h.color,
        slots: slots,
        power: h.power,
      };
    })
    .filter((h) => h.slots.reduce((a, s) => a + s, 0) > 0)
    .sort((a, b) => b.power - a.power);

  console.log(arr);

  let res = document.createElement("div");
  res.id = "__grid";
  container.append(res);

  arr.forEach(async (x) => {
    let ev = document.createElement("div");
    ev.classList = "her";
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
    if (XXX) {
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
    }
    const blob = await ocanvas.convertToBlob({ type: "image/png" });

    let n = document.createElement("img");
    n.src = URL.createObjectURL(blob);
    n.addEventListener("click", async () => {
      console.log("H:", x.id);
      let f = await AutoMiss2.getResource(x.id);
      start(x.id);
      b.classList.add("PopUp_hideBlock");
      b.removeChild(container);
    });
    ev.append(n);
  });

  b.classList.remove("PopUp_hideBlock");

  let button = document.createElement("div");
  button.classList.add("pp_close");
  container.append(button);
  button.addEventListener("click", () => {
    b.classList.add("PopUp_hideBlock");
    b.removeChild(container);
  });
};

async function start(heroId) {
  let res = await AutoMiss2.getResource(heroId);
  let stamina = AutoMiss2.userInfo.refillable.find((x) => x.id == 1).amount;
  const vipLevel = Math.max(
    ...lib.data.level.vip
      .filter((l) => l.vipPoints <= +AutoMiss2.userInfo.vipPoints)
      .map((l) => l.level)
  );
  const ress = [];

  while (res) {
    const mission = res.missions.find(
      (x) => x.id == Math.max(...res.missions.map((y) => y.id))
    );
    let times = 1;
    if (vipLevel >= 5) {
      times = 10;
    }
    let o = {
      name: res.key.indexOf("fragment")
        ? "фрагмент "
        : "" +
          cheats.translate(
            `LIB_${res.key.replace("fragment", "").toUpperCase()}_NAME_${
              res.value
            }`
          ),
      count: 0,
      used: 0,
    };

    while (stamina > times * mission.cost && o.count < res.count) {
      let response = await Send({
        calls: [
          {
            name: "missionRaid",
            args: { id: mission.id, times },
            ident: "body",
          },
        ],
      }).then((x) => {
        if (x.error) {
          console.error(x.error);
          return {};
        }
        return x.results[0].result.response;
      });

      let c = Object.values(response).reduce((acc, reward) => {
        acc += Object.keys(reward).reduce((acc2, object) => {
          if (res.key == object) {
            let o = Object.keys(reward[object]).find((x) => x == res.value);
            if (o) {
              acc2 += reward[object][o];
            }
          }
          return acc2;
        }, 0);
        return acc;
      }, 0);

      o.count += c;
      stamina -= mission.cost * times;
      o.used += mission.cost * times;

      window.setProgress(
        `Получено: ${o.count} / ${res.count} ${
          o.name
        } <br> израсходовано энки ${o.used} (${o.used / o.count})`
      );
    }
    ress.push(o);
    if (stamina < times * mission.cost) {
      window.setProgress(``);
      break;
    }
    res = await AutoMiss2.getResource(heroId);
    stamina = AutoMiss2.userInfo.refillable.find((x) => x.id == 1).amount;
  }
  let con = ress
    .map(
      (o) =>
        `${o.count} ${o.name} израсходовано энки ${o.used} (${
          o.used / o.count
        })`
    )
    .join("<br>");
  window.setProgress(`Получено:<br>${con}`);
}

export default injectFunction;

"use strict";

import d from "../DrawerNew.js";

let loader;
let drawer;

const injectFunction = async (data) => {
  const div = document.createElement("div");
  div.className = "menu_button";
  div.innerHTML = `Паки реплея`;
  div.addEventListener("click", onclick);
  document.querySelector(".main_menu").appendChild(div);
  loader = data;
  drawer = new d(loader);
};

const onclick = (e) => {
  const b = document.querySelector(".PopUp_back");

  const r = b.querySelector(".PopUp_");
  r.classList.add("PopUp_hideBlock");

  const container = document.createElement("div");
  container.className = "PopUpn_";
  b.appendChild(container);

  let res = document.createElement("div");
  res.id = "__grid";
  container.append(res);

  b.classList.remove("PopUp_hideBlock");

  let ib = document.createElement("div");
  res.appendChild(ib);

  let inp = document.createElement("input");
  inp.classList.add("scriptMenu_InputText");
  inp.id = "in_id";
  ib.appendChild(inp);

  let btn = document.createElement("div");
  btn.classList.add("menu_button");
  btn.textContent = "Генерировать";
  ib.append(btn);
  btn.addEventListener("click", () => {
    const ide = document.querySelector(`#in_id`);
    if (ide && ide.value) {
      result(ide.value);
    }
  });

  let im = document.createElement("img");
  im.id = `iatt`;
  im.style =
    "border:1px solid #4B380C;height:75px;background-color: #23140A; border-radius: 10px;padding: 5px;";
  res.append(im);

  im = document.createElement("img");
  im.id = `ideff`;
  im.style =
    "border:1px solid #4B380C;height:75px;background-color: #23140A; border-radius: 10px;padding: 5px;";
  res.append(im);

  let button = document.createElement("div");
  button.classList.add("pp_close");
  container.append(button);
  button.addEventListener("click", () => {
    b.classList.add("PopUp_hideBlock");
    b.removeChild(container);
  });
};

async function result(id) {
  const battle = await Send({
    calls: [{ name: "battleGetReplay", args: { id: id }, ident: "body" }],
  }).then((r) => r.results[0].result.response);

  if (!battle) {
    fetch(`http://localhost:999/api/Replay/${id}`, {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
      },
      referrer: "http://localhost:5181/swagger/index.html",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: JSON.stringify(battle),
      method: "GET",
      mode: "cors",
      credentials: "omit",
    }).then((r) => {
      if (r.ok) {
        setProgress("Пак получен из архива");
        battle = r.json();
      } else {
        setProgress("Чтото не так при получении пака");
      }
    });
  }

  if (battle) {
    const w = battle.replay.result.win;
    const a = Object.values(battle.replay.attackers).map(
      ({ id, level, color, star, power, petId }) => ({
        id,
        level,
        color,
        star,
        power,
        petId,
      })
    );
    const b = Object.values(battle.replay.defenders[0]).map(
      ({ id, level, color, star, power, petId }) => ({
        id,
        level,
        color,
        star,
        power,
        petId,
      })
    );

    const attaker = battle.users[battle.replay.userId];
    const defender = Object.values(battle.users).find(
      (u) => u.id != battle.replay.userId
    );

    if (a) {
      const attackers = a.filter((u) => u.id < 100);
      const pet = a.find((u) =>
        Object.values(loader.lib.pet)
          .map((p) => p.id)
          .includes(u.id)
      );
      const banner = battle.replay.effects.attackersBanner;
      //const defenseState = user.defenseState;

      drawer.draw({ attackers, pet, banner }).then((u) => {
        const im = document.querySelector(`#iatt`);
        if (!!im) {
          im.src = u;
        }
      });
    }
    if (b) {
      const attackers = b.filter((u) => u.id < 100);
      const pet = b.find((u) =>
        Object.values(loader.lib.pet)
          .map((p) => p.id)
          .includes(u.id)
      );
      const banner = battle.replay.effects.defendersBanner;
      //const defenseState = user.defenseState;

      drawer.draw({ attackers, pet, banner }).then((u) => {
        const im = document.querySelector(`#ideff`);
        if (!!im) {
          im.src = u;
        }
      });
    }
    fetch(`http://localhost:999/api/Replay/${id}`, {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
      },
      referrer: "http://localhost:5181/swagger/index.html",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: JSON.stringify(battle),
      method: "POST",
      mode: "cors",
      credentials: "omit",
    }).then((r) =>
      r.ok
        ? toast.success("Пак сохранен")
        : toast.error("Чтото не так при сохранении пака")
    );
    let i = 0;
  } else {
    toast.error("Реплея нигде нет");
  }
}

export default injectFunction;

"use strict";

Object.defineProperty(Array.prototype, "last", {
  get: function () {
    if (this.length === 0) {
      return undefined;
    }
    return this[this.length - 1];
  },
});

function setProgress(text) {
  const popup = document.querySelector("div.scriptMenu_status");
  if (!text) {
    popup.classList.add("scriptMenu_statusHide");
  } else {
    popup.classList.remove("scriptMenu_statusHide");
    popup.innerHTML = text;
  }
  setTimeout((_) => popup.classList.add("scriptMenu_statusHide"), 7000);
}

window.week = () => {
  let date = new Date();
  date.setHours(0, 0, 0, 0);

  let day1 = new Date(date.getFullYear(), 0, 1);
  let days = Math.floor((date - day1) / (24 * 60 * 60 * 1000));

  let week = Math.ceil((date.getDay() + 1 + days) / 7);

  return week;
};

window.applyFavor = (hero, petId) => {
  lib.data.pet[petId].favorStats.forEach(
    ({ stat, multiplier }) => (hero[stat] += 11064 * multiplier)
  );

  const t = lib.data.pet[petId].favorSkill.tier;

  hero.skills = { ...hero.skills, [lib.data.hero[petId].skill[t]]: 130 };
  hero.favorPetId = petId;
  hero.favorPower = 11064;
  hero.petId = petId;
};

window.applyHeroPower = (hero) => {
  const st = lib.data.rule.powerPerStat;
  const power = Object.keys(st).reduce((acc, key) => {
    acc += (hero[key] || 0) * st[key];
    return acc;
  }, 0);
  const power_skills = Object.keys(hero.skills).reduce((acc, key) => {
    acc += (hero.skills[key] || 0) * lib.data.skill[key].power;
    return acc;
  }, 0);

  const art = lib.data.hero[hero.id].artifacts
    .map((id) => lib.data.artifact.id[id])
    .find((a) => a.type === "weapon");
  const power_weapon_art = art.battleEffect.reduce((acc, effect_id) => {
    const m =
      ~~lib.data.artifact.type["weapon"].evolution[hero.artifacts[0].star]
        .battleEffectMultiplier;
    const art_stat =
      lib.data.artifact.battleEffect[effect_id].battleStatData.levels[
        hero.artifacts[0].level
      ];

    acc += Object.keys(art_stat).reduce((acc, key) => {
      acc +=
        art_stat[key] *
        m *
        st[key] *
        lib.data.rule.artifactWeaponPowerMultiplier;
      return acc;
    }, 0);
    return acc;
  }, 0);

  hero.power = Math.ceil(power + power_skills + power_weapon_art);
};

window.getHero = async (id, favor) => {
  const hs = await Send({
    calls: [
      {
        name: "teamGetMaxUpgrade",
        args: { units: { hero: [1], titan: [4000], pet: [6000] } },
        ident: "body",
      },
    ],
  }).then((r) => r.results[0].result.response);
  let h;
  if (id < 4000) {
    h = hs.hero[id];
    applyFavor(h, favor);
    applyHeroPower(h);
  } else if (id >= 4000 && id <= 4100) {
    h = hs.titan[id];
  } else {
    h = hs.pet[id];
  }
  return JSON.stringify(h);
};

//import {toast} from './plugins/toast.js';
//window.toast = toast;

//import {toast} from './toast.js';
//toast.error('ALARMA');

//import myScript from "./plugins/my-script.js";
//myScript();

//import "./plugins/hero_reits.js";
//topPlugin();

//import ifu from "./plugins/test.js";
//ifu();

import raid from "./plugins/asgard.js";
import "./plugins/raidMission.js";

// alternative to DOMContentLoaded
document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    console.info("load from main", document.readyState);

    const init = () => {
      const s = document.querySelector(".scriptMenu_main");
      if (!s) {
        setTimeout(init, 1000);
      } else {
        console.info("scriptMenu_main loaded");

        const div = document.createElement("div");
        div.className = "main_menu";
        document.body.appendChild(div);

        if (Object.values(lib?.data?.seasonAdventure?.list).length > 5) {
          alert("Новый остров");
        } else if (lib?.data?.seasonAdventure?.list[4].map.regions.length > 1) {
          alert("Новый регион");
        }
        runPlugins();
        const now = new Date();

        //if (now.getDay() == 0 && now.getHours() > 20) {
        asgard();
        //}
      }
    };
    init();
  }
};

async function asgard() {
  const bosses = await raid();

  if (bosses.length > 0) {
    fetch("http://localhost:888/api/Application", {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
      },
      referrer: "http://localhost:5181/swagger/index.html",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: JSON.stringify({
        week: window.week(),
        data: JSON.stringify(bosses),
      }),
      method: "POST",
      mode: "cors",
      credentials: "omit",
    }).then((r) =>
      r.ok
        ? setProgress("История Асгард сохранена")
        : setProgress("Чтото не так при сохранении истории Асгарда")
    );
  }
}

const isChecked = (key) => {
  return document.querySelector(
    `.scriptMenu_Details .scriptMenu_checkbox[data-name='${key}']`
  ).checked;
};

function runPlugins() {
  import("./ResourceLoader.js").then((m) => {
    let l = new m.default(NXFlashVars);
    l.load([
      { key: "assets/js/gui/dialog_basic.rsx" },
      { key: "assets/hero_icons_only/hero_icons_only.xml" },
      { key: "assets/js/titan_icons/titan_icons.rsx" },
      { key: "assets/js/pet_icons/pet_icons.rsx" },
      { key: "assets/js/gui/titan_artifact_icons.rsx" },
      { key: "assets/js/banner/banner_icons.rsx" },
      { key: "assets/inventory_icons/banner_stone_icons.xml" },
      { key: "assets/js/team_flags/team_flag_icons.rsx" },
      { key: "assets/inventory_icons/scroll_icons.xml" },
      { key: "assets/inventory_icons/gear_icons_05.xml" },
      { key: "assets/inventory_icons/gear_icons_2_05.xml" },
      { key: "assets/js/gui/dialog_season_adventure_tiles.rsx" },
      { key: "assets/inventory_icons/ascension_gear_icons.xml" },
      { key: "assets/js/gui/pet_gear.rsx" },
      { key: "assets/inventory_icons/consumable.xml" },
      { key: "assets/quest_icons/quest_icons.xml" },
    ])
      .then((p) => {
        window.XXX = p;
        return p;
      })
      .then((x) => {
        import("./plugins/stata.js").then((m) => m.default());
        import("./plugins/popup.js").then((m) => m.default(x));
      });
  });
}

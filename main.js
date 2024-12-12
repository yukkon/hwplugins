"use strict";

Object.defineProperty(Array.prototype, "last", {
  get: function () {
    if (this.length === 0) {
      return undefined;
    }
    return this[this.length - 1];
  },
});

Object.defineProperty(Date.prototype, 'week', {
  get() {
      let date = new Date(this.getTime());
      date.setHours(0, 0, 0, 0);

      let day1 = new Date(date.getFullYear(), 0, 1);
      let days = Math.floor((date - day1) / (24 * 60 * 60 * 1000));

      let d = day1.getDay();
      if (d == 0) { d = 7 }

      let week = Math.ceil((d + days) / 7);

      return week;
  }
})

window.setProgress = (text) => {
  const popup = document.querySelector("div.scriptMenu_status");
  if (!text) {
    popup.classList.add("scriptMenu_statusHide");
  } else {
    popup.classList.remove("scriptMenu_statusHide");
    popup.innerHTML = text;
  }
  if (popup.dataset.timeout) {
    clearTimeout(popup.dataset.timeout)
  }
  popup.dataset.timeout = setTimeout((_) => {
    popup.classList.add("scriptMenu_statusHide");
    popup.dataset.timeout = undefined;
  }, 7000);
}

window.week = () => {
  let date = new Date();
  date.setHours(0, 0, 0, 0);

  let day1 = new Date(date.getFullYear(), 0, 1);
  let days = Math.floor((date - day1) / (24 * 60 * 60 * 1000));

  let week = Math.ceil((days + 1) / 7);

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

  // additionalPower 
  // добавили статы
  // добавили скил
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

import {toast} from './plugins/toast.js';
window.toast = toast;

//import {toast} from './toast.js';
//toast.error('ALARMA');

//import myScript from "./plugins/my-script.js";
//myScript();

//import "./plugins/hero_reits.js";
//topPlugin();

//import ifu from "./plugins/test.js";
//ifu();

import raid from "./plugins/asgard.js";
import TaskManager from './TaskManager.js';


//import "./plugins/raidMission.js";
//import "./plugins/fixAsgardBattle.js";

/*document.addEventListener("HWDataEvent", function(event) {
  import(`./plugins/${event.detail.type}.js`).then(m => m.default(event.detail.data)).catch(e => {});
});*/


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

        const maps = JSON.parse(localStorage.getItem("seasonAdventure")) || {};
        //{1: 2, 2: 2, 4: 4, 4: 4}
        if (Object.values(lib?.data?.seasonAdventure?.list).length != Object.values(maps).length) {
          toast.info("Новый остров");
        } else {
          const regs = Object.keys(lib?.data?.seasonAdventure?.list).every(m => 
            lib?.data?.seasonAdventure?.list[m].map?.regions.length == maps[m]
          )
          if (!regs) {
            toast.info("Новый регион");
          }
        }
        const o = Object.values(lib?.data?.seasonAdventure?.list).reduce((acc, val) => {acc[val.id]=Object.values(val.map.regions).length;return acc;}, {})
        localStorage.setItem("seasonAdventure", JSON.stringify(o))

        runPlugins();

        const now = new Date();

        if (now.getDay() == 0 && now.getHours() > 19 && localStorage['userId'] === '13877391') {
          asgard();
        }

        window.taskMan = new TaskManager(60);
        toast.error('ALARMA');
      }
    };
    init();
  }
};

function blockCpu(ms) {
  var now = new Date().getTime();
  var result = 0
  while(true) {
      result += Math.random() * Math.random();
      if (new Date().getTime() > now +ms)
          return;
  }   
}


async function asgard() {
  const bosses = await raid();

  if (!!bosses) {
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
  
  import("./ResourceLoader.js")
  .then(m => {
    let l = new m.default(NXFlashVars);
    l.load([
      { key: "js/gui/dialog_basic.rsx" },
      { key: "hero_icons_only/hero_icons_only.xml" },
      { key: "js/titan_icons/titan_icons.rsx" },
      { key: "js/pet_icons/pet_icons.rsx" },
      { key: "js/gui/titan_artifact_icons.rsx" },
      { key: "js/team_flags/team_flag_icons.rsx" },
      { key: "inventory_icons/banner_stone_icons.xml" },
      { key: "js/team_flags/team_flag_icons.rsx" },
      { key: "inventory_icons/scroll_icons.xml" },
      { key: "inventory_icons/gear_icons_05.xml" },
      { key: "inventory_icons/gear_icons_2_05.xml" },
      { key: "js/gui/dialog_season_adventure_tiles.rsx" },
      { key: "inventory_icons/ascension_gear_icons.xml" },
      { key: "js/gui/pet_gear.rsx" },
      { key: "inventory_icons/consumable.xml" },
      { key: "quest_icons/quest_icons.xml" },
    ])
    .then(p => {
      window.XXX = p;
      import("./plugins/stata.js").then(m => m.default(p));
      import("./plugins/island.js").then(m => m.default(p));
      //import("./plugins/fixAsgardBattle.js").then(m => m.default(p));
      //import("./plugins/slaveFixBattle.js").then(m => m.default(p));
      //import("./plugins/InvasionAutoBoss.js").then(m => m.default(p));
      //import("./plugins/battlePassRewards.js").then(m => m.default(p));
      import("./plugins/SavePacks.js").then(m => m.default(p));
    });
  });
  
  import("./plugins/Events.js").then(m => m.default());
  import("./plugins/AutoMission.js").then(m => m.default());
  import("./plugins/testToast.js").then(m => m.default());
  import("./plugins/AutoMission2.js").then(m => m.default());
}

"use strict";

Object.defineProperty(Array.prototype, 'last', {
  get: function() {
    if (this.length === 0) {
      return undefined;
    }
    return this[this.length - 1];
  }
});

window.favorApply = (hero, petId) => {
  lib.data.pet[petId].favorStats.forEach(({stat, multiplier}) => hero[stat] += 11064 * multiplier)

  const t = lib.data.pet[petId].favorSkill.tier

  hero.skills = {...hero.skills, [lib.data.hero[petId].skill[t]]:130};
  hero.favorPetId = petId;
  hero.favorPower = 11064
  hero.petId = petId
  hero.power += 11064
}

window.getHero = async (id, favor) => {
  const hs = await Send({ calls:[{name:"teamGetMaxUpgrade",args:{"units":{"hero":[1],"titan":[4000],"pet":[6000]}},ident:"body"}]}).then(r => r.results[0].result.response);
  let h;
  if (id < 4000) {
    h = hs.hero[id]
    favorApply(h, favor)
  } else if (id >= 4000 && id <= 4100) {
    h = hs.titan[id]
  } else {
    h = hs.pet[id]
  }
  return JSON.stringify(h);
}



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

import "./plugins/raidMission.js";

// alternative to DOMContentLoaded
document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    console.info('load from main', document.readyState)

    const init = () => {
        const s = document.querySelector(".scriptMenu_main")
        if (!s) {
          setTimeout(init, 1000)
        } else {
          console.info('scriptMenu_main loaded')

          const div = document.createElement("div");
          div.className = "main_menu";
          document.body.appendChild(div);

          console.info('Островов', Object.values(lib?.data?.seasonAdventure?.list).length)
          if (Object.values(lib?.data?.seasonAdventure?.list).length > 5) {
            alert("Новый остров")
          } else if (lib?.data?.seasonAdventure?.list[4].map.regions.length > 1) {
            alert("Новый регион")
          }
          raidInfo()
        }
    }
    init();
  }
}

const isChecked = (key) => {
  return document.querySelector(`.scriptMenu_Details .scriptMenu_checkbox[data-name='${key}']`).checked
}

function raidInfo() {
  import ("./ResourceLoader.js").then(m => {
    let l = new m.default(NXFlashVars)
    l.load([
      { key: 'assets/js/gui/dialog_basic.rsx' },
      { key: "assets/hero_icons_only/hero_icons_only.xml" },
      { key: "assets/js/titan_icons/titan_icons.rsx" },
      { key: 'assets/js/pet_icons/pet_icons.rsx' },
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
      { key: "assets/quest_icons/quest_icons.xml" }
    ])
    .then(p => {
      window.XXX = p;
      return p;
    })
    .then(x => {
      import("./plugins/stata.js").then(m => m.default());
      import("./plugins/popup.js").then(m => m.default(x));
    })
  })
}
'use strict';

const injectFunction = (data) => {
  const div = document.createElement("div");
  div.className = "menu_button";
  div.innerHTML = `тест автокача`;
  div.dataset.id = i.id;
  div.addEventListener("click", onclick);
  document.querySelector(".main_menu").appendChild(div);
}

const onclick = async (e) => {
  const a = new AutoMiss();
  //a.start(21) // маркус 21
  //a.start(64) // Август 64
  //a.start(56) // Амира 56
  a.start(4) // астарот 4
  //a.start(40) // айзек 55 небула 40
}


class AutoMiss {
  constructor() {
    this.myHeroes = undefined;
    this.inventory = undefined;
    this.missions = undefined;
    this.availableMissionsToRaid = undefined;
    this.userInfo = undefined;
	}

	async start(heroId) {
    if (!this.myHeroes) {
      this.myHeroes = await Send('{"calls":[{"name":"heroGetAll","args":{},"ident":"body"}]}').then(r => r.results[0].result.response)
    }
    if (!this.inventory) {
      this.inventory = await Send('{"calls":[{"name":"inventoryGet","args":{},"ident":"body"}]}').then(r => r.results[0].result.response)
    }
    if (!this.missions) {
      this.missions = await Send('{"calls":[{"name":"missionGetAll","args":{},"ident":"body"}]}').then(r => r.results[0].result.response)
    }
    if (!this.availableMissionsToRaid) {
      this.availableMissionsToRaid = Object.values(this.missions).filter(mission => mission.stars === 3).map(mission => mission.id);
    }
    if (!this.userInfo) {
      this.userInfo = await Send('{"calls":[{"name":"userGetInfo","args":{},"ident":"body"}]}').then(r => r.results[0].result.response)
    }
  
    if (!this.Reward2Mission) {
      this.Reward2Mission = Object.values(lib.data.mission).reduce((acc, mission) => {
        if (!this.availableMissionsToRaid.includes(mission.id)) {
          return acc;
        }
      
        const enemies = mission.normalMode.waves.map(wave => wave.enemies).flat();
        const drop = enemies.filter(enemy => !!enemy.drop?.length).map(enemy => enemy.drop).flat();
        const reward = drop.filter(d => d.chance > 0).map(d => d.reward);
      
        reward.forEach(r => {
          Object.keys(r).forEach(inventoryKey => {
            if (!acc[inventoryKey]) {
              acc[inventoryKey] = {}
              Object.keys(r[inventoryKey]).forEach(inventoryItem => {
                acc[inventoryKey][inventoryItem] = [mission.id]
              })
            } else {
              Object.keys(r[inventoryKey]).forEach(inventoryItem => {
                if(!acc[inventoryKey][inventoryItem]) {
                  acc[inventoryKey][inventoryItem] = [mission.id]
                } else {
                  acc[inventoryKey][inventoryItem].push(mission.id)
                }
              })
            }
          })
        })
      
        return acc;
      },{})
    }

    const hero = Object.values(this.myHeroes).find(h => h.id == heroId)
    const slots = getHeroItemsToNextColor(hero);
    
    function getHeroItemsToNextColor(hero) {
      return lib.data.hero[hero.id].color[hero.color].items.reduce((acc, val, ind) => {acc[val] = hero.slots[ind] ?? 1; return acc}, {});
    }
    const res = this.f0({gear: slots});
    console.log("требуемый ресурс", res); //  {"fragmentGear": "167", count: 32}
    const missions = this.searchMissions(res).map(id => lib.data.mission[id]).filter(m => !m.isHeroic).map(x => ({id: x.id, cost: x.normalMode.teamExp}));
    console.log("Возможные миссии", missions)

    const mission = missions.find(x => x.id == Math.max(...missions.map(y => y.id)))
    let count = 0;
    let stamina = this.userInfo.refillable.find(x => x.id == 1).amount;
    let used = 0;
    const vipLevel = Math.max(...lib.data.level.vip.filter(l => l.vipPoints <= +this.userInfo.vipPoints).map(l => l.level));
    let times = 1;
    if (vipLevel >= 5) {
      times = 10;
    }
    while (stamina > times*mission.cost && count <= res.count) {
      let response = await Send({calls: [{name: "missionRaid", args: { id: mission.id, times }, ident: "body" } ] }).then(
        x => {
          if (x.error) {
            console.error(x.error);
            return {};
          }
          return x.results[0].result.response;
        });

      let c = Object.values(response).reduce((acc,reward) => {
        acc += Object.keys(reward).reduce((acc2, object) => {
          if (res[object]) {
            let o = Object.keys(reward[object]).find(x => x == res[object])
            if (o) {
              acc2 += reward[object][o]
            }
          }
          return acc2;
        }, 0)
        return acc;
      }, 0)
      console.log("Получено", c)
    
      count += c;
      stamina -= mission.cost * times;
      used += mission.cost * times;

      const n = Object.keys(res).map(x => {
        var name;
        switch (x) {
          case 'fragmentGear':
            name = `Фрагмент ${cheats.translate(`LIB_GEAR_NAME_${res[x]}`)}`
            break;
          case 'fragentScroll':
            name = `Фрагмент ${cheats.translate(`LIB_SCROLL_NAME_${res[x]}`)}`
            break;
          case 'gear':
            name = cheats.translate(`LIB_GEAR_NAME_${id}`)
            break;
          case 'scroll':
            name = cheats.translate(`LIB_SCROLL_NAME_${id}`)
            break;
          default:
            name = ''
            break;
        }
        return name;
      })
      window.setProgress(`Получено: ${count} ${n[0]}: израсходовано энки ${used}`)  
    }
    window.setProgress(`Получено: ${count} ${n[0]}: израсходовано энки ${used}`)  
  }

  f0(obj, count = 1) {
    if (count == 0) { return undefined; };
    delete obj.gold;
    let res = undefined;
    for (let item of Object.keys(obj)) { //gear scroll
      if (res) break;
      for (let id of Object.keys(obj[item])) { // 102
        if (res) break;
        if (obj[item][id] != 0) {
          const countInv = this.inventory[item][id] ?? 0;
          if (obj[item][id] > countInv) {
            const rec = lib.data.inventoryItem[item][id].craftRecipe;
            if (rec) {
              res = this.f0(rec, obj[item][id]*count - countInv);
            } else {
              const capitalized = item.charAt(0).toUpperCase() + item.slice(1)
              if (lib.data.inventoryItem[item][id]?.fragmentMergeCost) {
                res = {[`fragment${capitalized}`]: id, count: obj[item][id] * count * lib.data.inventoryItem[item][id]?.fragmentMergeCost?.fragmentCount - (this.inventory[`fragment${capitalized}`][id] || 0)};
              } else {
                res = {[item]: id, count: obj[item][id]*count - (this.inventory[`fragment${capitalized}`][id] || 0)};
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
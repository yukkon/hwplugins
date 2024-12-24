"use strict";

const AutoMiss2 = {
  myHeroes: undefined,
  inventory: undefined,
  missions: undefined,
  availableMissionsToRaid: undefined,
  userInfo: undefined,
  Reward2Mission: undefined,

  async getResource(heroId) {
    
    const getHeroItemsToNextColor = (hero) => {
      return lib.data.hero[hero.id].color[hero.color].items.reduce(
        (acc, val, ind) => {
          acc[val] = hero.slots[ind] ?? 1;
          return acc;
        },
        {}
      );
    };

    const f0 = (obj, count = 1) => {
      if (count == 0) {
        return undefined;
      }
      delete obj.gold;
      let res = undefined;
      for (let item of Object.keys(obj)) {
        //gear scroll
        if (res?.count > 0) break;
        for (let id of Object.keys(obj[item])) {
          // 102
          if (res?.count > 0) break;
          if (obj[item][id] * count != 0) {
            const countInv = this.inventory[item][id] ?? 0;
            if (obj[item][id] * count > countInv) {
              const rec = lib.data.inventoryItem[item][id].craftRecipe;
              if (rec) {
                res = f0(rec, obj[item][id] * count - countInv);
              } else {
                const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
                let h = (this.inventory[`fragment${capitalized}`][id] || 0)
                if (lib.data.inventoryItem[item][id]?.fragmentMergeCost) {
                  res = {
                    key: `fragment${capitalized}`,
                    value: id,
                    count: obj[item][id] * count * lib.data.inventoryItem[item][id]?.fragmentMergeCost?.fragmentCount - h,
                  };
                } else {
                  res = {
                    key: [item],
                    value: id,
                    count: obj[item][id] * count - h,
                  };
                }
                if (res.count == 0) res = undefined;
              }
            }
          }
        }
      }
      return res;
    };

    const searchMissions = (item) => {
      let out = [];
      if (item && this.Reward2Mission[item.key]) {
        out = this.Reward2Mission[item.key][item.value] ?? [];
      }
      return out;
    };

    let resp = await Send({
      calls: [
        { name: "heroGetAll", args: {}, ident: "group_0_body" },
        { name: "inventoryGet", args: {}, ident: "group_1_body" },
        { name: "userGetInfo", args: {}, ident: "group_2_body" },
        { name: "missionGetAll", args: {}, ident: "group_3_body" },
      ],
    });
    this.myHeroes = resp.results[0].result.response;
    this.inventory = resp.results[1].result.response;
    this.userInfo = resp.results[2].result.response;
    this.missions = resp.results[3].result.response;
    this.availableMissionsToRaid = Object.values(this.missions).filter(mission => mission.stars === 3).map(mission => mission.id);
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

    const hero = Object.values(this.myHeroes).find((h) => h.id == heroId);
    const slots = getHeroItemsToNextColor(hero);
    const res = f0({ gear: slots });

    console.log("требуемый ресурс", res); //  {"fragmentGear": "167", count: 32} => {key: "fragmentGear", value: "167", count: 32}
    if (res) {
      console.log(
        `Необходимо: ${res.count} ${
          res.key.indexOf("fragmant") ? "фрагмент" : ""
        } ${cheats.translate(
          `LIB_${res.key.replace("fragment", "").toUpperCase()}_NAME_${
            res.value
          }`
        )} `
      );
      const missions = searchMissions(res).map(id => lib.data.mission[id]).filter(m => !m.isHeroic).map(x => ({id: x.id, cost: x.normalMode.teamExp}));
      console.log("Возможные миссии", missions)
      const mission = missions.find(x => x.id == Math.max(...missions.map(y => y.id)))
      localStorage.setItem("autofarm", JSON.stringify({...res, missions}))

      return {...res, missions};
    } else {
      console.log(`Можно апнуть`);
      return undefined;
    }
  },
};

export default AutoMiss2;
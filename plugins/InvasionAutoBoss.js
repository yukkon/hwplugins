"use strict";

const injectFunction = async () => {
  const invasion_info = await Send({calls:[{name:"invasion_GetInfo",args:{},ident:"body"}]}).then(r => r.results[0].result.response);
  if (invasion_info && invasion_info.comics.length > 0) {
    const bossLevel = invasion_info.comics[0].level;

    const div = document.createElement("div");
    div.className = "menu_button";
    div.innerHTML = `Тест босса ${bossLevel}`;
    div.addEventListener("click", async () => {
        const b = document.querySelector(".PopUp_back");

        const r = b.querySelector(".PopUp_");
        r.classList.add("PopUp_hideBlock");

        const container = document.createElement("div");
        container.className = "PopUpn_";
        b.appendChild(container);

        container.innerHTML = ``;

        b.classList.remove("PopUp_hideBlock");

        let button = document.createElement("div");
        button.classList.add("pp_close");
        container.append(button);
        button.addEventListener("click", () => {
        b.classList.add("PopUp_hideBlock");
        b.removeChild(container);
        });

        const a = new executeEventAutoBoss({invasion_id: invasion_info.id});
        //a.start({tries: 1000, pet: 6005, attackers: {"43": 6002,"50": 6001,"55": 6005,"58": 6008,"63": 6000}, effects: []});
        a.auto()
    })
    document.querySelector(".main_menu").appendChild(div);
  }
}

class executeEventAutoBoss {

  //lib.data.forge.buff
  //lib.data.adventure.buff[105].effect.effect
  //{"attackers": {"percentInOutDamageMod_any_99_100_300_99_1000": 10}}

  constructor({invasion_id}) {
    this.id = invasion_id;
    this.pool = lib.data.invasion.list[this.id].attackUnitsPool;
    
    //??this.bossId = Object.values(lib.data.invasion.phase).filter(e => e.invasionId == this.id && e.type == 'boss').map(e => Object.values(e.phaseData.boss)).flat().find(e => e.resetBuff == '1').id;
    
    this.aHeroes = this.pool.availableUnits.filter(id => id < 100);
    this.aPets = this.pool.availableUnits.filter(id => id >= 6000);

    this.favors = this.aHeroes.reduce((acc, id) => {
        const pets = this.aPets.map(p => lib.data.pet[p].favorHeroes.includes(id) ? p : null).filter(Number);
        pets.push(null)
        acc[id] = pets;
        return acc;
    }, {})

    const packs = this.combinations(this.aHeroes, 5).filter(ids => ids.includes(this.pool.mandatoryUnitId));
    
    debugger
    //
    /*
    [
      {pet:6000, attackers:{1:6001,2:6003,3:6004,4:null,5:6605}},
      {pet:6001, attackers:{1:6001,2:6003,3:6004,4:null,5:6605}},
      {pet:6002, attackers:{1:6001,2:6003,3:6004,4:null,5:6605}}
    ]
    */
   /*
    this.combo = [];
    packs.forEach(pack => {
        const favors = this.generateCombinationsWithoutRepetitions(pack.map(h => this.favors[h]))
        favors.forEach(favor => {
          this.aPets.forEach(pet => {
            this.combo.push({pet: pet, attackers: pack.reduce((acc, val, i) => ({...acc, [val]:favor[i]}), {} )});
          })
        })
    })
        */
  }

  async auto({countTestBattle}={}) {
    this.countTestBattle = countTestBattle ?? 100;
    await this.loadInfo();
  }

  async start({attackers, pet, countTestBattle}) {
    await this.loadInfo();
    this.countTestBattle = countTestBattle;

    setTimeout(() => {
      this.startFindPack()
    }, 1000)
  }

  async loadInfo() {
    this.heroes = await Send({ calls:[{name:"teamGetMaxUpgrade",args:{"units":{"hero":[1],"titan":[4000],"pet":[6000]}},ident:"body"}]}).then(r => r.results[0].result.response);
    this.favorApply(this.heroes.hero[9], 6005)
    /*
    const battleReq = await Send({ calls:[
      {
          "name": "invasion_bossStart",
          "args": {
              "id": this.bossId,
              "heroes": [this.pool.mandatoryUnitId],
              "pet": this.aPets[0],
              "favor": {}
          },
          "ident": "body"
      }
    ]});
    this.battle = battleReq.results[0].result.response;
    */
  }

  favorApply = (hero, petId) => {
    let power = 0;
    lib.data.pet[petId].favorStats.forEach(
      ({ stat, multiplier }) => {
         hero[stat] += 11064 * multiplier
         power += 11064 * multiplier * lib.data.rule.powerPerStat[stat];
      }
    );
    
    const t = lib.data.pet[petId].favorSkill.tier;
    const pet_skill = lib.data.hero[petId].skill[t]
    hero.skills = { ...hero.skills, [pet_skill]: 130 };

    power += (hero.skills[pet_skill] || 0) * lib.data.skill[pet_skill].power
    
    hero.power += power;
  }

  combinations(arr, n) {
    if (n == 1) {
      return arr.map(x => [x]);
    }
    else if (n <= 0) {
      return [];
    }
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      var rest = arr.slice(i + 1);
      var c = this.combinations(rest, n - 1);
      for (var j = 0; j < c.length; j++) {
        c[j].unshift(arr[i]);
        result.push(c[j]);
      }
    }
    return result;
  }

  async startFindPack() {
    const promises = this.combo.map(comb => {
      const copyBattle = structuredClone(this.battle);
      
      const attackers = Object.keys(comb.attackers).map(h => {
        let her = this.heroes.hero[h]
        this.favorApply(her, comn[h]);
        return her;
      });
      if (!!comb.pet){
        attackers.push(this.heroes.pet[comb.pet]);
      }
      copyBattle.attackers = attackers;
      
      return this.CalcBattle(copyBattle);
    })

    let best10Battle = await Promise.all(promises).then(results => results.sort((a,b) => b.chance - a.chance).slice(0, 10));

    this.end(best10Battle);
  }
 
  async CalcBattle(battle) {
    const actions = Array.from({length: this.countTestBattle}).map(i => {
      battle.seed = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * (1e3 + 1));
      return Calc(battle)
    })

    return Promise.all(actions).then(results => {	
      const chance = 100 * results.reduce((a, v) => a + v.result.win, 0) / results.length;
      return {attackers: battle.attackers.map(e => ({id: e.id, petId: e.petId})), chance};
    });
  }

  end(reason) {
    setProgress('');
    console.log('endEventAutoBoss', reason)
  }
  
  generateCombinationsWithoutRepetitions(arrays) {
    function backtrack(combination, index) {
      if (index === arrays.length) {
        result.push([...combination]);
        return;
      }

      const currentArray = arrays[index];
      for (let element of currentArray) {
        if (!visited.has(element)) {
          combination.push(element);
          visited.add(element);
          backtrack(combination, index + 1);
          combination.pop();
          visited.delete(element);
        }
      }
    }

    const result = [];
    const visited = new Set();
    backtrack([], 0);
    return result;
  }
}

export default injectFunction;
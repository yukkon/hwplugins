"use strict";

Object.defineProperty(Array.prototype, 'last', {
  get: function() {
    if (this.length === 0) {
      return undefined;
    }
    return this[this.length - 1];
  }
});

const injectFunction = () => {
  const div = document.createElement("div");
  div.className = "scriptMenu_button";
  div.innerHTML = '<div class="scriptMenu_buttonText">Автобосс</div>';
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

    const a = new executeEventAutoBoss();
    a.start({tries: 1000, attackers: {pet: 6005, attackers:{"43": 6002,"50": 6001,"55": 6005,"58": 6008,"63": 6000}}, effect: 120});
  })
  document.querySelector(".scriptMenu_main").appendChild(div);
}


class executeEventAutoBoss {
  constructor() {
    this.id = Math.max(...Object.keys(lib.data.invasion.list).map(Number));
    this.pool = lib.data.invasion.list[this.id].attackUnitsPool;
    this.bossId = Object.values(lib.data.invasion.phase).filter(e => e.invasionId == this.id && e.type == 'boss').map(e => Object.values(e.phaseData.boss)).flat().find(e => e.resetBuff == '1').id;
    
    this.aHeroes = this.pool.availableUnits.filter(id => id < 100);
    this.aPets = this.pool.availableUnits.filter(id => id >= 6000);
    this.favors = this.aHeroes.map(id => ({id, pets: this.aPets.map(p => lib.data.pet[p].favorHeroes.includes(id) ? p : null).filter(Number)}))

   const effectId = Object.values(lib.data.forge.buff).find(b => b.invasionId == this.id).effect;
   this.effect = lib.data.adventure.buff[effectId].effect.effect;
  }

  /*
  attackers = {pet:6005, attackers:{1:6001,2:6003,3:6004,4:null,5:6605}}
  */
  async start({tries = 100, attackers = null, effect = 0}) {
    this.countTestBattle = tries;
    if (!!attackers) {
      if (!Object.keys(attackers).includes(this.pool.mandatoryUnitId)) new Error("Нет обязательного героя")
      if (!Object.keys(attackers).every(id => this.aHeroes.includes(id))) new Error("Герой не доступен")
      if (!Object.values(attackers).every(id => !id || this.aPets.includes(id))) new Error("Питомец не доступен")
      if (!!attackers.pet && !this.aPets.includes(attackers.pet)) new Error("Питомец не доступен")

      this.combo = [attackers];
    } else {
      new Error("Not implemented")
      const paks = this.combinations(this.aHeroes, 5).filter(ids => ids.includes(this.pool.mandatoryUnitId));
      //paks.forEach(pack => pack.map(id => ))
    }

    await this.loadInfo();
    this.battle.effects.attackers = {[this.effect]:effect};

    setTimeout(() => {
      this.startFindPack()
    }, 1000)
  }

  async loadInfo() {
    const resultReq = await Send({ calls:[{name:"teamGetMaxUpgrade",args:{"units":{"hero":[1],"titan":[4000],"pet":[6000]}},ident:"body"}]});
    this.heroes = resultReq.results[0].result.response;

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
  }

  favorApply = (hero, petId) => {
    lib.data.pet[petId].favorStats.forEach(({stat, multiplier}) => hero[stat] += 11064 * multiplier)

    const t = lib.data.pet[petId].favorSkill.tier

    hero.skills = {...hero.skills, [lib.data.hero[petId].skill[t]]:130};
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
  
  chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

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

    //const cs = this.chunk(actions, 20);



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


//let a = new executeEventAutoBoss();
//a.start({"attackers": {"percentInOutDamageMod_any_99_100_300": 70}})
/*
{
  "name": "invasion_bossStart",
  "args": {
      "id": 157,
      "heroes": [
          55,
          58,
          63,
          43,
          50
      ],
      "pet": 6005,
      "favor": {
          "43": 6002,
          "50": 6001,
          "55": 6005,
          "58": 6008,
          "63": 6000
      }
  },
  "ident": "body",
  "context": {
      "actionTs": 4524879
  }
}

{
    "userId": "13877391",
    "typeId": 260,
    "attackers": [
        {
            "id": 55,
            "xp": 3625195,
            "level": 130,
            "color": 18,
            "slots": [
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "skills": {
                "325": 130,
                "326": 130,
                "327": 130,
                "328": 130,
                "6027": 130
            },
            "power": 203331,
            "star": 6,
            "runes": [
                43750,
                43750,
                43750,
                43750,
                43750
            ],
            "skins": {
                "239": 60,
                "278": 60,
                "309": 60,
                "327": 60,
                "346": 60
            },
            "currentSkin": 327,
            "titanGiftLevel": 30,
            "titanCoinsSpent": null,
            "artifacts": [
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                }
            ],
            "scale": 1,
            "petId": 6005,
            "type": "hero",
            "perks": [
                7,
                1
            ],
            "ascensions": {
                "1": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "2": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    10
                ],
                "3": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "4": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "5": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            "agility": 2631,
            "hp": 439015,
            "intelligence": 19438,
            "physicalAttack": 7020.32,
            "strength": 3286,
            "armor": 26103,
            "armorPenetration": 36870,
            "magicPenetration": 3490,
            "magicPower": 81195.6,
            "magicResist": 14024,
            "skin": 327,
            "favorPetId": 6005,
            "favorPower": 11064
        },
        {
            "id": 58,
            "xp": 3625195,
            "level": 130,
            "color": 18,
            "slots": [
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "skills": {
                "396": 130,
                "397": 130,
                "398": 130,
                "399": 130,
                "6038": 130
            },
            "power": 197661,
            "star": 6,
            "runes": [
                43750,
                43750,
                43750,
                43750,
                43750
            ],
            "skins": {
                "283": 60,
                "312": 60,
                "330": 60,
                "347": 60
            },
            "currentSkin": 0,
            "titanGiftLevel": 30,
            "titanCoinsSpent": null,
            "artifacts": [
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                }
            ],
            "scale": 1,
            "petId": 6008,
            "type": "hero",
            "perks": [
                9,
                7,
                2,
                18,
                21
            ],
            "ascensions": {
                "1": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "2": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    10
                ],
                "3": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "4": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "5": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            "agility": 2319,
            "hp": 485038,
            "intelligence": 18365,
            "physicalAttack": 50,
            "strength": 2985,
            "armor": 25682.6,
            "magicPenetration": 18360,
            "magicPower": 94570.6,
            "magicResist": 26856,
            "skin": 0,
            "favorPetId": 6008,
            "favorPower": 11064
        },
        {
            "id": 63,
            "xp": 3625195,
            "level": 130,
            "color": 18,
            "slots": [
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "skills": {
                "442": 130,
                "443": 130,
                "444": 130,
                "445": 130,
                "6002": 130,
                "8272": 1,
                "8273": 1
            },
            "power": 203832,
            "star": 6,
            "runes": [
                43750,
                43750,
                43750,
                43750,
                43750
            ],
            "skins": {
                "341": 60,
                "350": 60,
                "351": 60,
                "352": 1
            },
            "currentSkin": 0,
            "titanGiftLevel": 30,
            "titanCoinsSpent": null,
            "artifacts": [
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                }
            ],
            "scale": 1,
            "petId": 6000,
            "type": "hero",
            "perks": [
                6,
                1,
                21
            ],
            "ascensions": {
                "1": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "2": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ],
                "3": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "4": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "5": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10
                ]
            },
            "agility": 17931,
            "hp": 524112,
            "intelligence": 2737,
            "physicalAttack": 59441.32,
            "strength": 2877,
            "armor": 4178,
            "armorPenetration": 35937.6,
            "magicResist": 10942,
            "physicalCritChance": 9545,
            "modifiedSkillTier": 3,
            "skin": 0,
            "favorPetId": 6000,
            "favorPower": 11064
        },
        {
            "id": 43,
            "xp": 3625195,
            "level": 130,
            "color": 18,
            "slots": [
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "skills": {
                "215": 130,
                "216": 130,
                "217": 130,
                "218": 130,
                "6012": 130
            },
            "power": 202146,
            "star": 6,
            "runes": [
                43750,
                43750,
                43750,
                43750,
                43750
            ],
            "skins": {
                "98": 60,
                "130": 60,
                "169": 60,
                "201": 60,
                "304": 60
            },
            "currentSkin": 130,
            "titanGiftLevel": 30,
            "titanCoinsSpent": null,
            "artifacts": [
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                }
            ],
            "scale": 1,
            "petId": 6002,
            "type": "hero",
            "perks": [
                7,
                9,
                1,
                21
            ],
            "ascensions": {
                "1": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "2": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    10
                ],
                "3": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "4": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "5": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            "agility": 2447,
            "hp": 304217,
            "intelligence": 18758,
            "physicalAttack": 50,
            "strength": 2842,
            "armor": 11848,
            "magicPenetration": 65886.6,
            "magicPower": 85999.6,
            "magicResist": 26709,
            "skin": 130,
            "favorPetId": 6002,
            "favorPower": 11064
        },
        {
            "id": 50,
            "xp": 3625195,
            "level": 130,
            "color": 18,
            "slots": [
                0,
                0,
                0,
                0,
                0,
                0
            ],
            "skills": {
                "250": 130,
                "251": 130,
                "252": 130,
                "253": 130,
                "6007": 130
            },
            "power": 202127,
            "star": 6,
            "runes": [
                43750,
                43750,
                43750,
                43750,
                43750
            ],
            "skins": {
                "105": 60,
                "218": 60,
                "259": 60,
                "289": 60,
                "333": 60
            },
            "currentSkin": 259,
            "titanGiftLevel": 30,
            "titanCoinsSpent": null,
            "artifacts": [
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                },
                {
                    "level": 130,
                    "star": 6
                }
            ],
            "scale": 1,
            "petId": 6001,
            "type": "hero",
            "perks": [
                4,
                2,
                12,
                22
            ],
            "ascensions": {
                "1": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "2": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    10
                ],
                "3": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "4": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                ],
                "5": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    10
                ]
            },
            "agility": 2752,
            "hp": 409903,
            "intelligence": 2622,
            "physicalAttack": 44839,
            "strength": 18900,
            "armor": 62371.6,
            "magicPower": 1550,
            "magicResist": 47483,
            "skin": 259,
            "favorPetId": 6001,
            "favorPower": 11064
        },
        {
            "id": 6005,
            "color": 10,
            "star": 6,
            "xp": 450551,
            "level": 130,
            "slots": [
                25,
                50,
                50,
                25,
                50,
                50
            ],
            "skills": {
                "6025": 130,
                "6026": 130
            },
            "power": 181943,
            "type": "pet",
            "perks": [
                7
            ],
            "name": null,
            "armorPenetration": 47911,
            "intelligence": 11064,
            "strength": 12360
        }
    ],
    "defenders": [
        {
            "1": {
                "id": 42,
                "xp": 0,
                "level": 130,
                "color": 18,
                "slots": [],
                "skills": {
                    "210": 130,
                    "211": 130,
                    "212": 130,
                    "213": 130
                },
                "power": 918338,
                "star": 6,
                "runes": [
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "skins": [],
                "currentSkin": 0,
                "titanGiftLevel": 0,
                "titanCoinsSpent": null,
                "artifacts": [
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    }
                ],
                "scale": 1,
                "petId": 0,
                "type": "hero",
                "perks": [
                    4,
                    2,
                    22
                ],
                "ascensions": [],
                "agility": 19572.86,
                "armor": 157736.84,
                "hp": 2979238.89,
                "intelligence": 27860.46,
                "magicPower": 402076.69,
                "magicResist": 93335.6,
                "physicalAttack": 400.79,
                "strength": 109694.46,
                "skin": 0,
                "favorPetId": 0,
                "favorPower": 0,
                "mainStat": "strength",
                "stats": {
                    "agility": 19572.86446142312,
                    "anticrit": 0,
                    "antidodge": 0,
                    "armor": 157736.84411263856,
                    "armorPenetration": 0,
                    "dodge": 0,
                    "hp": 2979238.890885707,
                    "intelligence": 27860.464803534007,
                    "lifesteal": 0,
                    "magicPenetration": 0,
                    "magicPower": 402076.6891881808,
                    "magicResist": 93335.59598252473,
                    "physicalAttack": 400.7935547853209,
                    "physicalCritChance": 0,
                    "strength": 109694.46165149123
                }
            },
            "2": {
                "id": 48,
                "xp": 0,
                "level": 130,
                "color": 18,
                "slots": [],
                "skills": {
                    "240": 130,
                    "241": 130,
                    "242": 130,
                    "243": 130
                },
                "power": 836891,
                "star": 6,
                "runes": [
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "skins": [],
                "currentSkin": 0,
                "titanGiftLevel": 0,
                "titanCoinsSpent": null,
                "artifacts": [
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    }
                ],
                "scale": 1,
                "petId": 0,
                "type": "hero",
                "perks": [
                    5,
                    2
                ],
                "ascensions": [],
                "agility": 102905.62,
                "armor": 12303.19,
                "armorPenetration": 38873.15,
                "hp": 1617780.59,
                "intelligence": 23147.56,
                "magicResist": 76431.86,
                "physicalAttack": 210812.73,
                "physicalCritChance": 59552.06,
                "strength": 25399.74,
                "skin": 217,
                "favorPetId": 0,
                "favorPower": 0,
                "mainStat": "agility",
                "stats": {
                    "agility": 102905.62236136831,
                    "anticrit": 0,
                    "antidodge": 0,
                    "armor": 12303.186244138155,
                    "armorPenetration": 38873.1496370891,
                    "dodge": 0,
                    "hp": 1617780.5870114896,
                    "intelligence": 23147.563285863987,
                    "lifesteal": 0,
                    "magicPenetration": 0,
                    "magicPower": 0,
                    "magicResist": 76431.85508849483,
                    "physicalAttack": 210812.7346006391,
                    "physicalCritChance": 59552.05696956524,
                    "strength": 25399.742550771112
                }
            },
            "3": {
                "id": 49,
                "xp": 0,
                "level": 130,
                "color": 18,
                "slots": [],
                "skills": {
                    "245": 130,
                    "246": 130,
                    "247": 130,
                    "248": 130
                },
                "power": 1210088,
                "star": 6,
                "runes": [
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "skins": [],
                "currentSkin": 0,
                "titanGiftLevel": 0,
                "titanCoinsSpent": null,
                "artifacts": [
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    }
                ],
                "scale": 1,
                "petId": 0,
                "type": "hero",
                "perks": [
                    10,
                    1,
                    22
                ],
                "ascensions": [],
                "agility": 161507.48,
                "armor": 11333.86,
                "dodge": 38251.77,
                "hp": 4250196.76,
                "intelligence": 32584.84,
                "magicResist": 24084.45,
                "physicalAttack": 209676.37,
                "physicalCritChance": 62336.22,
                "strength": 35418.31,
                "skin": 0,
                "favorPetId": 0,
                "favorPower": 0,
                "mainStat": "agility",
                "stats": {
                    "agility": 161507.47700787056,
                    "anticrit": 0,
                    "antidodge": 0,
                    "armor": 11333.85803564004,
                    "armorPenetration": 0,
                    "dodge": 38251.77087028514,
                    "hp": 4250196.763365015,
                    "intelligence": 32584.841852465113,
                    "lifesteal": 0,
                    "magicPenetration": 0,
                    "magicPower": 0,
                    "magicResist": 24084.448325735084,
                    "physicalAttack": 209676.37365934072,
                    "physicalCritChance": 62336.21919602022,
                    "strength": 35418.30636137512
                }
            },
            "4": {
                "id": 35,
                "xp": 0,
                "level": 130,
                "color": 18,
                "slots": [],
                "skills": {
                    "175": 130,
                    "176": 130,
                    "177": 130,
                    "178": 130
                },
                "power": 1316210,
                "star": 6,
                "runes": [
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "skins": [],
                "currentSkin": 0,
                "titanGiftLevel": 0,
                "titanCoinsSpent": null,
                "artifacts": [
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    }
                ],
                "scale": 1,
                "petId": 0,
                "type": "hero",
                "perks": [
                    8,
                    5,
                    2,
                    22
                ],
                "ascensions": [],
                "agility": 30470.48,
                "armor": 190109.02,
                "hp": 3862188.62,
                "intelligence": 40911.22,
                "lifesteal": 406.94,
                "magicPower": 444359,
                "magicResist": 349505.83,
                "physicalAttack": 575.62,
                "strength": 152029.71,
                "skin": 79,
                "favorPetId": 0,
                "favorPower": 0,
                "mainStat": "strength",
                "stats": {
                    "agility": 30470.483879827927,
                    "anticrit": 0,
                    "antidodge": 0,
                    "armor": 190109.01812977358,
                    "armorPenetration": 0,
                    "dodge": 0,
                    "hp": 3862188.616498944,
                    "intelligence": 40911.22255835597,
                    "lifesteal": 406.9432182303917,
                    "magicPenetration": 0,
                    "magicPower": 444359.0020157577,
                    "magicResist": 349505.82810809044,
                    "physicalAttack": 575.6211821868891,
                    "physicalCritChance": 0,
                    "strength": 152029.71342708293
                }
            },
            "5": {
                "id": 53,
                "xp": 0,
                "level": 130,
                "color": 18,
                "slots": [],
                "skills": {
                    "315": 130,
                    "316": 130,
                    "317": 130,
                    "318": 130
                },
                "power": 5550797,
                "star": 6,
                "runes": [
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "skins": [],
                "currentSkin": 0,
                "titanGiftLevel": 0,
                "titanCoinsSpent": null,
                "artifacts": [
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    },
                    {
                        "level": 1,
                        "star": 0
                    }
                ],
                "scale": 1,
                "petId": 0,
                "type": "hero",
                "perks": [
                    5,
                    7,
                    2,
                    14,
                    22
                ],
                "ascensions": [],
                "agility": 124507.91,
                "armor": 318496.57,
                "hp": 15759745.49,
                "intelligence": 696135.19,
                "magicPower": 3073883.34,
                "magicResist": 803983.56,
                "physicalAttack": 2450.21,
                "strength": 143862.78,
                "skin": 214,
                "favorPetId": 0,
                "favorPower": 0,
                "mainStat": "intelligence",
                "stats": {
                    "agility": 124507.91490783756,
                    "anticrit": 0,
                    "antidodge": 0,
                    "armor": 318496.5746175376,
                    "armorPenetration": 0,
                    "dodge": 0,
                    "hp": 15759745.488347223,
                    "intelligence": 696135.1883115777,
                    "lifesteal": 0,
                    "magicPenetration": 0,
                    "magicPower": 3073883.3383001937,
                    "magicResist": 803983.5568822031,
                    "physicalAttack": 2450.2134956055565,
                    "physicalCritChance": 0,
                    "strength": 143862.78270080232
                }
            }
        }
    ],
    "effects": {
        "attackers": {
            "percentInOutDamageMod_any_99_100_300_99_1000": 90
        }
    },
    "reward": [],
    "startTime": 1716219157,
    "seed": 2791831596,
    "type": "invasion_boss_157"
}
*/
export default injectFunction;
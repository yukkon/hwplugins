"use strict";

const injectFunction = () => {
  const div = document.createElement("div");
  div.className = "scriptMenu_button";
  div.innerHTML = '<div class="scriptMenu_buttonText">Статистика</div>';
  div.addEventListener("click", async () => {
    const b = document.querySelector(".PopUp_back");
    
    const r = b.querySelector('.PopUp_');
    r.classList.add('PopUp_hideBlock');
    
    const container = document.createElement('div');
    container.className = "PopUpn_";
    b.appendChild(container);

    container.innerHTML = "<div id='__result'><div class='tabber wds-tabber'><div class='wds-tabs__wrapper'><ul class='wds-tabs'></ul></div></div><div class='tooltip' role='tooltip'><canvas id='tip'></canvas></div></div><div class='ximg'></div>";

    b.classList.remove("PopUp_hideBlock");

    let button = document.createElement("div");
    button.classList.add("pp_close");
    container.append(button);

    button.addEventListener("click", () => {
      b.classList.add("PopUp_hideBlock");
      b.removeChild(container);
    });
    raidStatistic();
  });

  document.querySelector(".main_menu").appendChild(div);
};

async function raidStatistic() {
  const calls = [
    { name: "clanGetInfo", args: {}, ident: "clanGetInfo" },
    { name: "clanWarGetInfo", args: {}, ident: "clanWarGetInfo" },
    { name: "clanWarGetDefence", args: {}, ident: "clanWarGetDefence" },
    { name: "clanGetOnline", args: {}, ident: "clanGetOnline" },
    /*{ name: "crossClanWar_getAttackMap", args: {}, ident: "crossClanWar_getAttackMap" },
    { name: "crossClanWar_getDefenceMap", args: {}, ident: "crossClanWar_getDefenceMap" },
    { name: "crossClanWar_getDefencePlan", args: {}, ident: "crossClanWar_getDefencePlan" },*/
    { name: "clanRaid_logBoss", args: {}, ident: "clanRaid_logBoss" },
    /*{ name: "clanGetWeeklyStat", args: {}, ident: "clanGetWeeklyStat" },*/
    { name: "topGet", args: { type: "arena", extraId: 0 }, ident: "topGet" },
  ];

  const result = await Send(JSON.stringify({ calls }));
  if (!!result?.error) {
    return;
  }

  //const crossClanWar_getAttackMap = result.results[4].result.response;
  //const crossClanWar_getDefenceMap = result.results[5].result.response;
  /*
  ?crossClanWar_getInfo
  crossClanWar_getDefencePlan
  crossClanWar_getAttackMap
  crossClanWar_getDefenceMap
  */

  new Statistics({
    clanGetInfo: result.results[0].result.response,
    clanWarGetInfo: result.results[1].result.response,
    clanWarGetDefence: result.results[2].result.response,
    clanGetOnline: result.results[3].result.response,
    clanRaid_logBoss: result.results[4].result.response,
    topArena: result.results[5].result.response.top.map((place) =>
      place.heroes.map((hero) => hero.id)
    ),
  });
}

class Statistics {
  constructor(res) {
    this.res = res;
    document.body.addEventListener("click", (e) => {
      var r = e.target.closest(
        ".wds-tabber:not(.wds-tabber-react-common) .wds-tabs__tab"
      );
      r && (e.preventDefault(), this.d(r));
    });
    this.generate();
    this.loa();
    document.addEventListener("keyup", this.logKey);
  }

  // переключение табов
  d(e) {
    if (e.parentNode) {
      var r = Array.from(e.parentNode.children).indexOf(e),
        t = e.closest(".wds-tabber");
      t &&
        (t.querySelectorAll(":scope > .wds-tab__content").forEach((e, t) => {
          e.classList.toggle("active", r === t);
        }),
        t
          .querySelectorAll(":scope > .wds-tabs__wrapper .wds-tabs__tab")
          .forEach((e, t) => {
            e.classList.toggle("active", r === t);
          }));
    }
  }

  loa() {
    const xxx = new (function () {
      this.getImageFromCache = (k) => {
        return new Image();
      };
    })();
    let canvas = document.querySelector(`canvas#tip`);
    let dr = new Drawer(canvas, window.XX);

    const handleMouseEnter = (e) => {
      let data = JSON.parse(e.target.dataset.toggleData);

      let t = document.querySelector(".tooltip");
      t.classList.add("show");
      //if (.row)
      /*if (e.pageY < document.querySelector('.wds-tab__content.active').clientHeight / 1.3) {
      t.style.top = e.x + 20 + "px";// + scrollY;
    } else {
      t.style.top = e.x - 90 + "px";// + scrollY;
    }
    t.style.left = (e.y + 50 < 200 ? e.y + 50 : 200) + "px";// + scrollX;
    */
      let rect = e.target.getBoundingClientRect();
      t.style.top = rect.top + "px";
      t.style.left = rect.width + "px";

      dr.draw(data);

      e.stopPropagation();
    };

    const handleMouseLeave = (e) => {
      document.querySelector(".tooltip").classList.remove("show");
      dr.clear();
      e.stopPropagation();
    };

    document.body
      .querySelectorAll('div[data-toggle="tooltip"]')
      .forEach((el) => {
        el.removeEventListener("mouseover", handleMouseEnter);
        el.removeEventListener("mouseout", handleMouseLeave);

        el.addEventListener("mouseover", handleMouseEnter);
        el.addEventListener("mouseout", handleMouseLeave);
      });
  }

  generate() {
    const tabs = document.querySelector("ul.wds-tabs");
    const tabbler = document.querySelector("div.tabber");

    //Top Arena
    let { tab: t1, tab_content: tc1 } = this.drawHeroTop();

    tabs.appendChild(t1);
    tabbler.appendChild(tc1);

    // ГИ инфо
    let { tab, tab_content } = this.drawClanInfo();

    tab.classList.add("active");
    tab_content.classList.add("active");

    tabs.appendChild(tab);
    tabbler.appendChild(tab_content);

    // ВГ
    if (
      !!this.res.clanWarGetDefence &&
      !!this.res.clanWarGetInfo &&
      !!this.res.clanWarGetInfo?.enemySlots
    ) {
      let { tab, tab_content } = this.clanWarGetInfo();

      tabs.appendChild(tab);
      tabbler.appendChild(tab_content);
    }

    // Асгард
    if (
      Object.prototype.toString.call(this.res.clanRaid_logBoss) ===
      "[object Object]"
    ) {
      const { tab, tab_content } = this.createTab("Асгард");

      let tblr = document.createElement("div");
      tblr.className = "tabber wds-tabber";

      let tsw = document.createElement("div");
      tsw.className = "wds-tabs__wrapper";
      tblr.appendChild(tsw);

      let ts = document.createElement("ul");
      ts.className = "wds-tabs";
      tsw.appendChild(ts);

      tab_content.appendChild(tblr);

      /*--------------------------------------*/

      const bosses = this.getRaidInfo();

      let { tab: t1, tab_content: tc1 } = this.clanRaidInfo(bosses);

      ts.appendChild(t1);
      tblr.appendChild(tc1);

      let { tab: t2, tab_content: tc2 } = this.raidBossess(bosses);

      ts.appendChild(t2);
      tblr.appendChild(tc2);

      let { tab: t3, tab_content: tc3 } = this.raidAttackers(bosses);

      ts.appendChild(t3);
      tblr.appendChild(tc3);

      tabs.appendChild(tab);
      tabbler.appendChild(tab_content);
    }
  }

  //Сортировка босс - дамаг
  s1(a, b) {
    return this.s(a, b, [
      { field: "boss", direction: "A" },
      { field: "damage", direction: "D" },
    ]);
  }

  //arr.sort((a,b) => return s(a,b,['a', 'c']))
  s(a, b, arr) {
    let { field, direction } = arr.shift();

    if (a[field] > b[field]) {
      return direction == "D" ? -1 : 1;
    } else if (a[field] == b[field]) {
      if (arr.length > 0) {
        return this.s(a, b, arr);
      } else {
        return 0;
      }
    } else {
      return direction == "D" ? 1 : -1;
    }
  }

  createTab(name) {
    let tab = document.createElement("li");
    tab.className = "wds-tabs__tab";

    let tab_button = document.createElement("div");
    tab_button.className = "wds-tabs__tab-label";
    tab_button.innerText = name;

    tab.appendChild(tab_button);

    let tab_content = document.createElement("div");
    tab_content.className = "wds-tab__content";

    return { tab, tab_content };
  }
  // ГИ
  drawClanInfo() {
    const clanInfo = this.getClanInfo();
    const { tab, tab_content } = this.createTab(`Гильдия (${clanInfo.length})`);

    clanInfo.sort((a, b) => {
      return (
        Math.sqrt(Math.pow(b.hero.p, 2) + Math.pow(b.titan.p, 2)) -
        Math.sqrt(Math.pow(a.hero.p, 2) + Math.pow(a.titan.p, 2))
      );
    });
    clanInfo.sort((a, b) => {
      return (
        Math.sqrt(Math.pow(b.activity, 2) + Math.pow(b.titanit, 2)) -
        Math.sqrt(Math.pow(a.activity, 2) + Math.pow(a.titanit, 2))
      );
    });

    if (clanInfo.length > 0) {
      let r = document.createElement("div");
      r.className = "row";

      let c = document.createElement("div");
      c.className = `cell col-1`;
      c.style = "width: 10px";
      r.appendChild(c);

      c = document.createElement("div");
      c.className = `cell col-5`;
      c.innerText = "Имя";
      r.appendChild(c);

      c = document.createElement("div");
      c.className = `cell col-2`;
      c.innerText = "Активность";
      r.appendChild(c);

      c = document.createElement("div");
      c.className = `cell col-2`;
      c.innerText = "Титанит";
      r.appendChild(c);

      c = document.createElement("div");
      c.className = "cell col-2";
      c.innerText = "Активность";
      r.appendChild(c);

      tab_content.appendChild(r);

      r = document.createElement("hr");
      tab_content.appendChild(r);
    }

    clanInfo.forEach((i) => {
      let r = document.createElement("div");
      r.className = "row";

      let c = document.createElement("div");
      c.className = `cell col-1${i.online ? " o" : ""}`;
      c.style = "width: 10px";
      r.appendChild(c);

      c = document.createElement("div");
      c.className = `cell col-5${i.warrior ? " w" : ""}`;
      c.innerText = i.name;
      r.appendChild(c);

      c = document.createElement("div");
      c.className = `cell col-2`;
      c.innerText = i.activity.toLocaleString("it-CH");
      r.appendChild(c);

      c = document.createElement("div");
      c.className = `cell col-2`;
      c.innerText = i.titanit.toLocaleString("it-CH");
      r.appendChild(c);

      c = document.createElement("div");
      c.className = "cell col-2";
      c.innerText = i.lastAction;
      r.appendChild(c);

      tab_content.appendChild(r);
    });

    return { tab, tab_content };
  }

  drawHeroTop() {
    const topArena = this.res.topArena;
    const { tab, tab_content } = this.createTab(`Топ Героев`);

    let a2 = topArena
      .flat()
      .reduce((acc, val) => (acc[val] ? ++acc[val] : (acc[val] = 1), acc), {});

    Object.entries(a2)
      .filter(([id, _]) => id < 100)
      .sort(([a_id, a_count], [b_id, b_count]) => b_count - a_count)
      .forEach(([id, count]) => {
        let r = document.createElement("div");
        r.className = "row";

        let c = document.createElement("div");
        c.className = "cell col-3";
        c.innerText = cheats.translate(`LIB_HERO_NAME_${id}`);
        r.appendChild(c);

        c = document.createElement("div");
        c.className = `cell col-1`;
        c.innerText = count;
        r.appendChild(c);

        tab_content.appendChild(r);
      });

    return { tab, tab_content };
  }

  getClanInfo() {
    if (!this.res.clanGetInfo) {
      return [];
    }
    return Object.values(this.res.clanGetInfo.clan.members).map((u) => {
      let team = this.res.clanWarGetDefence.teams[u.id];
      let stats = this.res.clanGetInfo.membersStat.find(
        (i) => i.userId == u.id
      );
      let memberStatus = !!this.res.clanGetOnline
        ? this.res.clanGetOnline[u.id]
        : undefined;

      let hpow = 0,
        tpow = 0;
      let hdata = { attackers: [] };
      let tdata = { attackers: [] };
      if (team) {
        hpow = Object.values(team.clanDefence_heroes?.units ?? []).reduce(
          (a, b) => {
            return a + b.power;
          },
          0
        );
        tpow = Object.values(team.clanDefence_titans?.units ?? []).reduce(
          (a, b) => {
            return a + b.power;
          },
          0
        );

        let pet =
          Object.values(team.clanDefence_heroes?.units ?? []).filter(
            (i) => i.id >= 6000
          )[0] || undefined;
        let banner = team.clanDefence_heroes?.banner;

        const count = Object.values(team.clanDefence_titans?.units ?? [])
          .map((i) => i.element)
          .reduce((accumulator, value) => {
            accumulator[value] = ++accumulator[value] || 1;

            return accumulator;
          }, {});

        let types = Object.keys(count).filter(
          (k) =>
            (["water", "fire", "earth"].includes(k) && count[k] >= 3) ||
            (["dark", "light"].includes(k) && count[k] >= 2)
        );
        let spirit = types.map((k) => {
          let element = Object.values(
            team.clanDefence_titans?.units ?? []
          ).find((e) => e.element == k);
          return {
            type: k,
            level: element?.elementSpiritLevel,
            star: element?.elementSpiritStar,
          };
        });

        hdata = {
          attackers: Object.values(team.clanDefence_heroes?.units ?? [])
            .filter((i) => i.id < 6000)
            .map(({ id, level, power, star, color, stats }) => ({
              id,
              level,
              power,
              star,
              color,
              stats,
            })),
          pet: pet,
          banner: banner,
        };
        tdata = {
          attackers: Object.values(team.clanDefence_titans?.units ?? []).map(
            ({ id, level, power, star, element }) => ({
              id,
              level,
              power,
              star,
              element,
            })
          ),
          spirit: spirit,
        };
      }
      return {
        id: u.id,
        name: u.name,
        hero: { p: hpow, data: hdata },
        titan: { p: tpow, data: tdata },
        warrior: this.res.clanGetInfo.clan.warriors.includes(Number(u.id)),
        lastLogin: new Date(Number(u.lastLoginTime) * 1000).toLocaleString(
          "ru"
        ),
        lastAction: !!memberStatus
          ? new Date(Number(memberStatus.lastAction) * 1000).toLocaleString(
              "ru"
            )
          : "",
        online: !!memberStatus?.online,
        activity: stats?.activitySum || 0,
        titanit: stats?.dungeonActivitySum || 0,
      };
    });
  }

  clanWarGetInfo() {
    const { tab, tab_content } = this.createTab("Война Гильдий");

    const slots = Object.values(lib.data.clanWar.fortificationSlot).filter(
      (x) => x.league == null || this.res.clanWarGetInfo?.league == x.league
    );

    let list = slots.map((slot) => {
      let pow = 0;
      let our_p = 0;
      let enemy = this.res.clanWarGetInfo?.enemySlots[slot.id];
      let our = this.res.clanWarGetInfo?.ourSlots[slot.id];

      let edata = {
        attackers: [],
        pet: undefined,
        spirit: undefined,
        banner: undefined,
      };
      let odata = {
        attackers: [],
        pet: undefined,
        spirit: undefined,
        banner: undefined,
      };

      if (enemy?.team && enemy?.team[0]) {
        pow = Object.values(enemy.team[0]).reduce((a, b) => {
          return a + b.power;
        }, 0);

        let pet = Object.values(enemy.team[0]).find((i) => i.type === "pet");

        const count = Object.values(enemy.team[0])
          .map((i) => i.element)
          .reduce((accumulator, value) => {
            accumulator[value] = ++accumulator[value] || 1;

            return accumulator;
          }, {});

        let types = Object.keys(count).filter(
          (k) =>
            (["water", "fire", "earth"].includes(k) && count[k] >= 3) ||
            (["dark", "light"].includes(k) && count[k] >= 2)
        );
        let spirit = types.map((k) => {
          let element = Object.values(enemy.team[0]).find(
            (e) => e.element == k
          );
          return {
            type: k,
            level: element?.elementSpiritLevel,
            star: element?.elementSpiritStar,
          };
        });

        edata = {
          attackers: Object.values(enemy.team[0])
            .filter((i) => i.type !== "pet")
            .map(({ id, level, power, star, color, element, state }) => ({
              id,
              level,
              power,
              star,
              color,
              element,
              state,
            })),
          pet: pet,
          spirit: spirit,
          banner: enemy.banner,
        };
      }

      if (our?.team && our?.team[0]) {
        our_p = Object.values(our.team[0]).reduce((a, b) => {
          return a + b.power;
        }, 0);

        let pet = Object.values(our.team[0]).find((i) => i.type === "pet");

        const count = Object.values(our.team[0])
          .map((i) => i.element)
          .reduce((accumulator, value) => {
            accumulator[value] = ++accumulator[value] || 1;

            return accumulator;
          }, {});

        let types = Object.keys(count).filter(
          (k) =>
            (["water", "fire", "earth"].includes(k) && count[k] >= 3) ||
            (["dark", "light"].includes(k) && count[k] >= 2)
        );
        let spirit = types.map((k) => {
          let element = Object.values(our.team[0]).find((e) => e.element == k);
          return {
            type: k,
            level: element?.elementSpiritLevel,
            star: element?.elementSpiritStar,
          };
        });

        odata = {
          attackers: Object.values(our.team[0])
            .filter((i) => i.type !== "pet")
            .map(({ id, level, power, star, color, element, state }) => ({
              id,
              level,
              power,
              star,
              color,
              element,
              state,
            })),
          pet: pet,
          spirit: spirit,
          banner: our.banner,
        };
      }

      return {
        id: slot.id,
        type: slot.type,
        name: Game.Translate.translate(
          `LIB_CLANWAR_FORTIFICATION_${slot.fortificationId}`
        ),
        enemy: {
          points: {
            total: enemy?.totalPoints,
            farmed: enemy?.pointsFarmed,
          },
          user: {
            id: enemy?.user?.id,
            name: enemy?.user?.name || "",
          },
          power: pow,
          data: edata,
        },
        our: {
          points: {
            total: our?.totalPoints,
            farmed: our?.pointsFarmed,
          },
          user: {
            id: our?.user?.id,
            name: our?.user?.name || "",
          },
          power: our_p,
          data: odata,
        },
      };
    });

    const rest = {
      enemy: this.res.clanWarGetInfo?.enemyClanTries.clan,
      our: this.res.clanWarGetInfo?.clanTries.clan,
    };
    const keys = {
      enemy: Object.keys(this.res.clanWarGetInfo?.enemyClanTries).filter(
        (k) => k != "clan"
      ),
      our: Object.keys(this.res.clanWarGetInfo?.clanTries).filter(
        (k) => k != "clan"
      ),
    };
    const tries = {
      enemy: keys.enemy.reduce(
        (accumulator, currentValue) =>
          accumulator + this.res.clanWarGetInfo?.enemyClanTries[currentValue],
        0
      ),
      our: keys.our.reduce(
        (accumulator, currentValue) =>
          accumulator + this.res.clanWarGetInfo?.clanTries[currentValue],
        0
      ),
    };

    const rel = {
      enemy:
        parseInt(
          (100 * this.res.clanWarGetInfo?.enemyPoints) /
            (2 * keys.enemy.length - tries.enemy)
        ) / 100,
      our:
        parseInt(
          (100 * this.res.clanWarGetInfo?.points) /
            (2 * keys.our.length - tries.our)
        ) / 100,
    };

    let tblr1 = document.createElement("div");
    tblr1.className = "tabber wds-tabber";

    let tsw = document.createElement("div");
    tsw.className = "wds-tabs__wrapper";

    let ts = document.createElement("ul");
    ts.className = "wds-tabs";

    tsw.appendChild(ts);
    tblr1.appendChild(tsw);

    [
      {
        team: "enemy",
        t: this.createTab(
          `${this.res.clanWarGetInfo?.enemyClan?.title} (${rel.enemy} / ${this.res.clanWarGetInfo?.enemyPoints} / ${rest.enemy})`
        ),
      },
      {
        team: "our",
        t: this.createTab(
          `${this.res.clanGetInfo?.clan?.title} (${rel.our} / ${this.res.clanWarGetInfo?.points} / ${rest.our})`
        ),
      },
    ].forEach(({ team, t }) => {
      ts.appendChild(t.tab);
      tblr1.appendChild(t.tab_content);
      tab_content.appendChild(tblr1);

      let hi = list
        .filter((s) => s.type == "hero")
        .sort((a, b) => b[team].power - a[team].power);
      let ti = list
        .filter((s) => s.type == "titan")
        .sort((a, b) => b[team].power - a[team].power);

      ["titan", "hero"].forEach((type) => {
        list
          .filter((i) => i.type == type)
          .sort((a, b) => b.power - a.power)
          .forEach((slot, index) => {
            let tit = ti.findIndex(
              (i) => i[team].user.id == slot[team].user.id
            );
            let hir = hi.findIndex(
              (i) => i[team].user.id == slot[team].user.id
            );

            let reiting = 0;
            if (t === "titan") {
              reiting = Math.round((tit - hir) / 3.5);
            } else {
              reiting = Math.round((hir - tit) / 3.5);
            }

            let r = document.createElement("div");
            r.className = "row";

            let c = document.createElement("div");
            c.className = "cell col-3";
            c.innerText = slot.name;
            r.appendChild(c);

            c = document.createElement("div");
            c.className = "cell col-3";

            let p = document.createElement("progress");
            p.max = slot[team].points.total ?? 100;
            p.value =
              (slot[team].points.total ?? 100) -
              (slot[team].points.farmed ?? 100);
            c.appendChild(p);
            r.appendChild(c);

            c = document.createElement("div");
            c.className = "cell col-4" + ` c n${reiting}`;
            c.dataset.toggle = "tooltip";
            c.dataset.toggleData = JSON.stringify(slot[team].data);
            c.innerText = slot[team].user.name;
            r.appendChild(c);

            c = document.createElement("div");
            c.className = "cell col-2";
            c.style = "text-align: center;";
            c.innerText = slot[team].power.toLocaleString("it-CH");
            r.appendChild(c);

            t.tab_content.appendChild(r);
          });
        if (type === "titan") {
          let r = document.createElement("hr");
          t.tab_content.appendChild(r);
        }
      });
    });

    return { tab, tab_content };
  }

  getRaidInfo() {
    const raidMaxHp = {
      14118725: 65,
      19964436: 75,
      28650893: 85,
      34258193: 95,
      40205837: 105,
      46475358: 115,
      110976196: 125,
      202620410: 130,
      287023890: 140,
      447979143: 150,
      860079174: 160,
    };
    let data = [];
    if (!this.res.clanGetInfo) {
      return [];
    }
    Object.values(this.res.clanGetInfo.clan.members).forEach((u) => {
      if (this.res.clanRaid_logBoss && this.res.clanRaid_logBoss[u.id]) {
        Object.values(this.res.clanRaid_logBoss[u.id]).forEach((i) => {
          let attackers = Object.values(i.attackers)
            .filter((a) => a.type === "hero")
            .map(({ id, level, color, petId, star, power }) => ({
              id,
              level,
              color,
              petId,
              star,
              power,
            }));
          let p = attackers.reduce((a, b) => {
            return a + b.power;
          }, 0);
          let pet = Object.values(i.attackers).filter(
            (a) => a.type === "pet"
          )[0];
          let pp = pet?.power || 0;

          let bosses = Object.keys(i.defenders[0])
            .map((b) => {
              return {
                level: raidMaxHp[i.defenders[0][b].state.maxHp],
                damage: i.result.damage[b],
              };
            })
            .filter((b) => b.damage > 0);
          bosses.forEach((b) => {
            let d = {
              boss: b.level,
              damage: b.damage,
              attackers,
              pet: pet
                ? {
                    id: pet.id,
                    level: pet.level,
                    color: pet.color,
                    star: pet.star,
                    power: pp,
                  }
                : undefined,
            };

            data.push({
              id: u.id,
              name: u.name,
              date: new Date(Number(i.startTime) * 1000),
              boss: b.level,
              damage: b.damage,
              power: p,
              pet_power: pp,
              data: d,
            });
          });
        });
      }
    });
    return data.sort((a, b) => a.date - b.date);
  }
  // Асгард лог
  clanRaidInfo(bosses) {
    const { tab, tab_content } = this.createTab("Лог");

    let d = document.createElement("div");
    d.addEventListener("wheel", Statistics.handleWheel);
    bosses.forEach((b) => {
      let r = document.createElement("div");
      r.className = "row";

      let c = document.createElement("div");
      c.className = "cell col-3 cc";
      c.innerText = b.name;
      c.dataset.toggle = "tooltip";
      c.dataset.toggleData = JSON.stringify(b.data);
      r.appendChild(c);

      c = document.createElement("div");
      c.className = "cell col-3";
      c.innerText = b.date.toLocaleString("ru");
      r.appendChild(c);

      c = document.createElement("div");
      c.className = "cell col-1";
      c.innerText = b.boss;
      r.appendChild(c);

      c = document.createElement("div");
      c.className = "cell col-2";
      c.innerText = b.damage.toLocaleString("it-CH");
      r.appendChild(c);

      c = document.createElement("div");
      c.className = "cell col-2";
      c.innerText = b.power.toLocaleString("it-CH");
      r.appendChild(c);

      c = document.createElement("div");
      c.className = "cell col-1";
      c.innerText = b.pet_power.toLocaleString("it-CH");
      r.appendChild(c);

      d.appendChild(r);
    });
    tab_content.appendChild(d);

    return { tab, tab_content };
  }

  // Асгард статистика по урону
  raidAttackers(bosses) {
    const { tab, tab_content } = this.createTab("Урон");

    let unique = [
      ...new Set(
        bosses.map((a) => {
          return a.id;
        })
      ),
    ];

    let data = unique.map((u) => {
      let a = bosses.filter((a) => a.id === u);
      let d = a.reduce((a, b) => {
        return a + b.damage;
      }, 0);
      return { name: a[0].name, damage: d };
    });

    let d = document.createElement("div");
    d.addEventListener("wheel", Statistics.handleWheel);
    data
      .sort((a, b) => b.damage - a.damage)
      .forEach((b) => {
        let r = document.createElement("div");
        r.className = "row";

        let c = document.createElement("div");
        c.className = "cell col-3 cc";
        c.innerText = b.name;
        r.appendChild(c);

        c = document.createElement("div");
        c.className = "cell col-3";
        c.innerText = b.damage.toLocaleString("it-CH");
        r.appendChild(c);

        d.appendChild(r);
      });
    tab_content.appendChild(d);

    return { tab, tab_content };
  }

  // Асгард статистика по боссам
  raidBossess(bosses) {
    const { tab, tab_content } = this.createTab("Боссы");

    let bo = 0;
    let d = document.createElement("div");
    d.addEventListener("wheel", Statistics.handleWheel);
    bosses
      .sort((a, b) => this.s1(a, b))
      .forEach((b) => {
        if (bo != 0 && bo != b.boss) {
          let r = document.createElement("hr");
          d.appendChild(r);
        }
        bo = b.boss;

        let r = document.createElement("div");
        r.className = "row";

        let c = document.createElement("div");
        c.className = "cell col-3 cc";
        c.innerText = b.name;
        c.dataset.toggle = "tooltip";
        c.dataset.toggleData = JSON.stringify(b.data);
        r.appendChild(c);

        c = document.createElement("div");
        c.className = "cell col-1";
        c.innerText = b.boss;
        r.appendChild(c);

        c = document.createElement("div");
        c.className = "cell col-2";
        c.innerText = b.damage.toLocaleString("it-CH");
        r.appendChild(c);

        d.appendChild(r);
      });
    tab_content.appendChild(d);

    return { tab, tab_content };
  }

  static handleWheel(event) {
    event.currentTarget.scrollTop += event.deltaY;
    event.preventDefault();
  }

  logKey(e) {
    // ctrl + y
    if (e.ctrlKey && e.key == "y") {
      Statistics.csvCurrent();
    }

    // ctrl + m
    if (e.ctrlKey && e.key == "m") {
      this.json();
    }
  }

  static csvCurrent() {
    let activeContent = document.querySelector(
      ".wds-tab__content.active > div"
    );

    if (activeContent != null) {
      let data = Array.from(activeContent.querySelectorAll("div.row")).map(
        (r) =>
          Array.from(r.querySelectorAll("div.cell")).map((c) => {
            return c.innerText;
          })
      );
      data = data.map((row) => row.join(`\t`)).join(`\n`);
      navigator.clipboard.writeText(data);
      //console.log(data);
      setProgress("csv Статистика скопирована", true);
    }
  }

  json() {
    const bosses = this.getRaidInfo();

    let data = JSON.stringify(
      bosses.map((b) => ({
        name: b.name,
        date: b.date.getTime(),
        boss: b.boss,
        damage: b.damage,
        attackers: b.data.attackers,
        pet: b.data.pet,
      }))
    );
    navigator.clipboard.writeText(data);
    //console.log(data);
    setProgress("json Статистика скопирована", true);
  }
}

class Drawer {
  #canvas;
  #ctx;
  #x;

  constructor(canvas, x) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d");
    this.#x = x;
  }

  get map() {
    /*
    "heroColor": {
      "1": {
        "id": 1,
        "ident": "white",
        "locale_key": "LIB_ENUM_HEROCOLOR_1",
        "skillTierUnlock": 1,
        "heroLevel": 1,
        "frameAssetTexture": "border_hero_white",
        "frameAssetTexture_small": "border_hero_white_small",
        "backgroundAssetTexture": "bg_hero_white",
        "levelBackgroundAssetTexture": "level_white",
        "textColor": "0xB7B0B3",
        "frameAssetTexture_small_pet": "border_pet_white_small",
        "frameAssetTexture_pet": "border_pet_white"
      },*/
    return {
      absolute: "dialog_basic.rsx/ep_star1",
      star: "dialog_basic.rsx/starIcon",
      level_base: "dialog_basic.rsx/level_silver",
      level: (color) =>
        `dialog_basic.rsx/${lib.data.enum.heroColor[color].levelBackgroundAssetTexture}`,
      hero: {
        icon: (id) =>
          `hero_icons_only.xml/${lib.data.hero[id].iconAssetTexture}`,
        border: (color) =>
          `dialog_basic.rsx/${lib.data.enum.heroColor[color].frameAssetTexture_small}`,
        background: (color) =>
          `dialog_basic.rsx/${lib.data.enum.heroColor[color].backgroundAssetTexture}`,
      },
      titan: {
        element: (id) => {
          let e;
          switch (id) {
            case (4000, 4001, 4002, 4003):
              return "dialog_basic.rsx/water";
            case (4010, 4011, 4012, 4013):
              return "dialog_basic.rsx/fire";
            case (4020, 4021, 4022, 4023):
              return "dialog_basic.rsx/earth";
            case (4030, 4031, 4032, 4033):
              return "dialog_basic.rsx/dark";
            case (4040, 4041, 4042, 4043):
              return "dialog_basic.rsx/light";
          }
        },
        icon: (id) => `titan_icons.rsx/titan_icon_${id}`,
        border: (id, el) => {
          if ([4003, 4013, 4023, 4033, 4043].includes(id)) {
            //let el = element(id);
            return `dialog_basic.rsx/border_super_titan_small_${el}`;
          } else {
            return "dialog_basic.rsx/border_titan_small";
          }
        },
        background: (id) => `dialog_basic.rsx/bg_${element(id)}`,
      },
      pet: {
        icon: (id) => `pet_icons.rsx/pet_160_${id}`,
        small: (id) => `pet_icons.rsx/pet_50_${id}`,
        border: (color) =>
          `dialog_basic.rsx/${lib.data.enum.heroColor[color].frameAssetTexture_small_pet}`,
        background: (color) =>
          `dialog_basic.rsx/${lib.data.enum.heroColor[
            color
          ].backgroundAssetTexture.replace("_hero_", "_pet_")}`,
      },
      spirit: {
        level: (level) => {
          switch (true) {
            case level > 80:
              return "dialog_basic.rsx/artifact_lvl_orange";
            case level > 60:
              return "dialog_basic.rsx/artifact_lvl_purple";
            case level > 40:
              return "dialog_basic.rsx/artifact_lvl_blue";
            case level > 20:
              return "dialog_basic.rsx/artifact_lvl_green";
            default:
              return "dialog_basic.rsx/artifact_lvl_white";
          }
        },
        icon: (element) => {
          switch (element) {
            case "water":
              return "titan_artifact_icons.rsx/spirit_4001";
            case "fire":
              return "titan_artifact_icons.rsx/spirit_4002";
            case "earth":
              return "titan_artifact_icons.rsx/spirit_4003";
            case "light":
              return "titan_artifact_icons.rsx/spirit_4005";
            case "dark":
              return "titan_artifact_icons.rsx/spirit_4004";
          }
        },
        border: (level) => {
          switch (true) {
            case level > 80:
              return "dialog_basic.rsx/artifact_small_orange";
            case level > 60:
              return "dialog_basic.rsx/artifact_small_purple";
            case level > 40:
              return "dialog_basic.rsx/artifact_small_blue";
            case level > 20:
              return "dialog_basic.rsx/artifact_small_green";
            default:
              return "dialog_basic.rsx/artifact_small_white";
          }
        },
      },
      banner: {
        icon: (id) => `team_flag_icons.rsx/team_flag_${id}`, // `banner_icons.rsx/banner_${id}`,
        border: "dialog_basic.rsx/bannerFrame_small",
      },
      stone: {
        icon: (id) => `banner_stone_icons.xml/banner_stone_${id}`,
        border: (color) => {
          switch (color) {
            case 1:
              return "dialog_basic.rsx/border_banner_stone_white";
              break;
            case 2:
              return "dialog_basic.rsx/border_banner_stone_green";
              break;
            case 3:
              return "dialog_basic.rsx/border_banner_stone_blue";
              break;
            case 4:
              return "dialog_basic.rsx/border_banner_stone_purple";
              break;
            case 5:
              return "dialog_basic.rsx/border_banner_stone_orange";
              break;
            case 6:
              return "dialog_basic.rsx/border_banner_stone_red";
              break;
            case 7:
              return "dialog_basic.rsx/border_banner_stone_red_absolute";
              break;
          }
        },
      },
      item: {
        border: (color) =>
          `dialog_basic.rsx/${lib.data.enum.itemColor[color].frameAssetTexture}`,
      },
      fragment: {
        border: (color) =>
          `dialog_basic.rsx/${lib.data.enum.itemColor[color].fragmentFrameAssetTexture}`,
      },
    };
  }

  clear() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  draw(data) {
    if (!!data.attackers[0].color) {
      this.#canvas.width =
        105 * data.attackers.length +
        (data.pet ? 105 : 0) +
        (data.banner ? 105 : 0);
    } else {
      this.#canvas.width =
        105 * data.attackers.length + 105 * data.spirit.length;
    }
    this.#canvas.height = 146;

    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    data.attackers.forEach((a, i) => {
      if (a.color) {
        this.#drawAttacker("hero", a, i, 0 + !!data.pet + !!data.banner);
      } else {
        this.#drawAttacker("titan", a, i, data.spirit.length);
      }
    });
    if (!!data.pet) {
      this.#drawPet(data.pet, 0 + !!data.banner);
    }
    if (!!data.banner) {
      this.#drawBanner(data.banner);
    }
    if (!!data.spirit && data.spirit.length > 0) {
      data.spirit.forEach((a, i) => {
        this.#drawSpirit(a, i);
      });
    }
  }

  async #drawAttacker(type, data, i, add) {
    let k, im;
    // bg
    if (type == "hero") {
      k = this.map[type].background(data.color);
      im = await this.#x.getImageFromCache(k);

      this.#ctx.drawImage(im, 6 + 105 * (i + add), 10, 80, 80);
    }
    // icon
    k = this.map[type].icon(data.id);
    im = await this.#x.getImageFromCache(k);
    this.#ctx.drawImage(im, 7 + 105 * (i + add), 12, 80, 80);
    // border
    if (type == "hero") {
      k = this.map[type].border(data.color);
    } else {
      k = this.map[type].border(data.id, data.element);
    }
    im = await this.#x.getImageFromCache(k);
    this.#ctx.drawImage(im, 105 * (i + add), 4, 94, 94);
    // stars
    if (data.star == 6) {
      im = await this.#x.getImageFromCache(this.map.absolute);
      this.#ctx.drawImage(
        im,
        9 + 105 * (i + add),
        69,
        im.width + 10,
        im.height
      );
    } else {
      im = await this.#x.getImageFromCache(this.map.star);
      [...Array(data.star)].forEach((_, j) => {
        this.#ctx.drawImage(
          im,
          (94 - 17 * data.star) / 2 + 17 * j + 105 * (i + add),
          69,
          20,
          20
        );
      });
    }
    // level border
    if (type == "hero") {
      k = this.map.level(data.color);
    } else {
      k = this.map.level_base;
    }
    im = await this.#x.getImageFromCache(k);
    this.#ctx.drawImage(im, 26 + 105 * (i + add), 2, 42, 28);

    // level
    this.#ctx.font = "bold 18px Arial";
    this.#ctx.fillStyle = "white";
    this.#ctx.textAlign = "center";
    this.#ctx.fillText(data.level, 46 + 105 * (i + add), 23);

    // favor
    if (!!data.petId) {
      k = this.map.pet.small(data.petId);
      im = await this.#x.getImageFromCache(k);
      this.#ctx.drawImage(im, 68 + 105 * (i + add), 2, 35, 34);
    }
    // power
    this.#ctx.font = "bold 18px Arial";
    this.#ctx.fillStyle = "white";
    this.#ctx.textAlign = "center";
    this.#ctx.fillText(data.power, 48 + 105 * (i + add), 115);

    if (!!data.state) {
      //HP line
      //bg
      this.#ctx.fillStyle = "#0D0805";
      this.#ctx.fillRect(106 * (i + add), 120, 89, 6);

      //bg re
      if (!data.state.isDead) {
        this.#ctx.fillStyle = "#2BC61A";
        this.#ctx.fillRect(
          106 * (i + add),
          120,
          (89 * data.state.hp) / data.state.maxHp,
          6
        );
      }
      //border
      this.#ctx.strokeStyle = "#5D490C"; //3D2711
      this.#ctx.strokeRect(106 * (i + add), 120, 89, 6);
      this.#ctx.fillStyle = "#ffffff";

      // energy
      //bg
      this.#ctx.fillStyle = "#0D0805";
      this.#ctx.fillRect(106 * (i + add), 133, 89, 6);
      // re
      if (!data.state.isDead) {
        this.#ctx.fillStyle = "#EACB0A";
        this.#ctx.fillRect(
          106 * (i + add),
          133,
          (89 * data.state.energy) / 1000,
          6
        );
      }
      this.#ctx.strokeStyle = "#5D490C"; //3D2711
      this.#ctx.strokeRect(106 * (i + add), 133, 89, 6);
      this.#ctx.fillStyle = "#ffffff";
    }
  }

  async #drawPet(data, add) {
    // bg
    let k = this.map.pet.background(data.color);
    let im = await this.#x.getImageFromCache(k);
    this.#ctx.drawImage(im, 4 + 105 * add, 9, 80, 80);
    // icon
    k = this.map.pet.icon(data.id);
    im = await this.#x.getImageFromCache(k);
    if (!!im) {
      this.#ctx.drawImage(im, 7 + 105 * add, 10, 80, 80);
    }
    // border
    k = this.map.pet.border(data.color);
    im = await this.#x.getImageFromCache(k);
    this.#ctx.drawImage(im, 105 * add, 4, 94, 94);
    // stars
    if (data.star == 6) {
      im = await this.#x.getImageFromCache(this.map.absolute);
      this.#ctx.drawImage(im, 9 + 105 * add, 69, im.width + 10, im.height);
    } else {
      im = await this.#x.getImageFromCache(this.map.star);
      [...Array(data.star)].forEach((_, j) => {
        this.#ctx.drawImage(
          im,
          20 + 105 * add + ((47 - 17 * data.star) / 2 + 17 * j),
          69,
          20,
          20
        );
      });
    }
    // level border
    k = this.map.level(data.color);
    im = await this.#x.getImageFromCache(k);
    this.#ctx.drawImage(im, 26 + 105 * add, 2, 42, 28);

    // level
    this.#ctx.font = "bold 18px Arial";
    this.#ctx.fillStyle = "white";
    this.#ctx.textAlign = "center";
    this.#ctx.fillText(data.level, 47 + 105 * add, 22);

    // power
    this.#ctx.font = "bold 18px Arial";
    this.#ctx.fillStyle = "white";
    this.#ctx.textAlign = "center";
    if ((data.power || 0) > 0) {
      this.#ctx.fillText(data.power, 47 + 105 * add, 115);
    }
  }

  async #drawSpirit(data, i) {
    // icon
    let k = this.map.spirit.icon(data.type);
    let im = await this.#x.getImageFromCache(k);

    if (!!im) {
      this.#ctx.drawImage(im, 9 + 105 * i, 12, 80, 80);
    }
    // border
    k = this.map.spirit.border(data.level);
    im = await this.#x.getImageFromCache(k);
    this.#ctx.drawImage(im, 6 + 105 * i, 10, 90, 90);
    // stars
    if (data.star == 6) {
      im = await this.#x.getImageFromCache(this.map.absolute);
      this.#ctx.drawImage(im, 18 + 105 * i, 69, im.width, im.height);
    } else {
      im = await this.#x.getImageFromCache(this.map.star);
      [...Array(data.star)].forEach((_, j) => {
        this.#ctx.drawImage(
          im,
          105 * i + ((105 - 17 * data.star) / 2 + 17 * j),
          69,
          20,
          20
        );
      });
    }
    // level border
    k = this.map.spirit.level(data.level);
    im = await this.#x.getImageFromCache(k);
    this.#ctx.drawImage(im, 30 + 105 * i, 2, im.width, im.height);
    // level
    this.#ctx.fillText(data.level, 51 + 105 * i, 23);
  }

  async #drawBanner(data) {
    // icon
    let k = this.map.banner.icon(data.id);
    let im = await this.#x.getImageFromCache(k);

    if (!!im) {
      this.#ctx.drawImage(im, 9, 12, 80, 80);
    }
    // border
    k = this.map.banner.border;
    im = await this.#x.getImageFromCache(k);
    this.#ctx.drawImage(im, 0, 4, 94, 94);

    this.#drawStones(data.slots);
  }

  #drawStones(data) {
    const c = Object.values(data).length;
    Object.values(data).forEach(async (s, i) => {
      const st = lib.data.inventoryItem.bannerStone[s];
      // icon
      let k = `banner_stone_icons.xml/${st.assetTexture}`;
      let im = await this.#x.getImageFromCache(k);

      let x = c + 30 * i + (30 * (3 - c)) / (c + 1);

      if (!!im) {
        this.#ctx.drawImage(im, x, 80, 30, 30);
      }
      // border
      k = this.map.stone.border(st.color);
      im = await this.#x.getImageFromCache(k);
      this.#ctx.drawImage(im, x, 80, 30, 30);
    });
  }
}
/*
document.addEventListener("HWDataEvent", function (event) {
  injectFunction();
});
*/
export default injectFunction;

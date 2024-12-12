"use strict";

const injectFunction = async () => {
  const div = document.createElement("div");
    div.className = "menu_button";
    div.innerHTML = `События`;
    div.addEventListener("click", onclick);
    document.querySelector(".main_menu").appendChild(div);
};

function getEvents() {
  var d = new Date();
  d.setDate(d.getDate() - 3);
  return Object.values(lib.data.specialQuestEvent.type)
  .filter(x1 => !!x1.requirement.questEventDates)
  .filter(x2 => !!x2.requirement.questEventDates.startDate)
  .filter(x3 => new Date(x3.requirement.questEventDates.endDate) > new Date())
  .map(x4 => (
  {
    name: cheats.translate(x4.name_localeKey),
    startDate: x4.requirement.questEventDates.startDate,
    endDate: x4.requirement.questEventDates.endDate,
    steps: x4.questChains.map(x5 => {

      let arr = lib.data.specialQuestEvent.chain[x5].specialQuests.map(x6 => lib.data.quest.special[x6])

      if (arr.length > 0){
        return {name: cheats.translate(`LIB_QUEST_TRANSLATE_${arr[0].translationMethod.toUpperCase()}`), b: arr.map(x => x.farmCondition)}
      }
        return {}
      })
    })
  )
  .sort((a,b) => new Date(a.startDate)-new Date(b.startDate))
}

const onclick = async (e) => {
  const b = document.querySelector(".PopUp_back");

  const r = b.querySelector(".PopUp_");
  r.classList.add("PopUp_hideBlock");

  const container = document.createElement("div");
  container.className = "PopUpn_";
  b.appendChild(container);

  let arr = getEvents()

  //container.innerHTML = "<div id='__result'>" + arr.map(x => `<details><summary>${x.name} (${x.startDate} - ${x.endDate})</summary><p>Steps</p></details>`).join("") + '</div>'

  let res = document.createElement("div");
  res.id = '__result';
  container.append(res);

  arr.forEach(x => {
    let ev = document.createElement("details");
    res.append(ev);

    let n = document.createElement("summary");
    n.textContent = `${x.name} (${x.startDate} - ${x.endDate})`
    ev.append(n);
    
    let s = document.createElement("p");
    ev.append(s);

    x.steps.forEach(y => {
      let nn = document.createElement("div");
      let name = (y.name||'').replaceAll(/ "?%param\d%"?/g, '').replaceAll(/\$m\((.*?)\|(.*?)\|(.*?)\)/g, '$1')
      nn.textContent = `${name}: ${y.b.map(q => q.amount)}`
      const s_args = xBb.stateFuncNew(y.b)
      s.append(nn);
    })
  })

  b.classList.remove("PopUp_hideBlock");

  let button = document.createElement("div");
  button.classList.add("pp_close");
  container.append(button);
  button.addEventListener("click", () => {
    b.classList.add("PopUp_hideBlock");
    b.removeChild(container);
  });


}
export default injectFunction;


const xBb = {
  __class__: "game.data.storage.quest.QuestDescriptionTaskTranslation",
  TRANSLATE: function(a) {
    return cheats.translate(a);
  },
  stateFuncNew: function(a, b) {
    let f = [];
    const c = a[0].stateFunc?.name;
    if (!c) { return a.map(x => x.amount) }
    switch (c) {
      case "heroColorById":
        f[0] = this.kVa(a[0].stateFunc.args.id);
        f[1] = a.map(x => {
          const color = lib.data.enum.heroColor[x.stateFunc.args.color];
          const l = [...lib.data.enum.heroColor[13].ident.matchAll(/\+/g)].length
          return l == 0 ? this.TRANSLATE(color.locale_key) : `this.TRANSLATE(color.locale_key) +${l}`;
        })
        break;
      case "heroAmountStarsById":
        f[0] = a.map(x => x.amount);
        f[1] = this.kVa(a[0].stateFunc.args.heroId);
    }
    return f;
  },
  stateFunc: function(a, b) {
    let f = [];
    const c = a.stateFunc?.name;
    if (!c) { return a.amount }
      switch (c) {
      case "adventureBossKill":
          f[0] = a.stateFunc.args.adventureId;
          f[1] = a.amount;
          break;
      case "artifactAmountStars":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.star;
          break;
      case "artifactUpgrade":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.level;
          break;
      case "artifactsLevelsByCertainHero":
          f[0] = a.stateFunc.args.unitId;
          f[1] = a.amount;
          break;
      case "artifactsLevelsByHero":
          f[0] = a.stateFunc.args.unitId;
          f[1] = a.amount;
          break;
      case "battleEndStatHeroRoleDamageDealt":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.unitPerkId;
          break;
      case "battleEndStatHeroRoleDamageDealtArena":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.unitPerkId;
          break;
      case "battleEndStatHeroRoleDamageReceived":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.unitPerkId;
          break;
      case "battleEndStatHeroRoleDamageReceivedArena":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.unitPerkId;
          break;
      case "battleEndStatTowerHeroUltUsed":
          f[0] = ~~a.stateFunc.args.unitId;
          f[1] = a.amount;
          break;
      case "battleMechanicWin":
          f[0] = cheats.translate(`LIB_MECHANIC_${a.stateFunc.args.mechanic.toUpperCase()}`),
          f[1] = a.amount;
          break;
      case "battleMechanicWinArenaWithHealer":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.useUnitRole;
          break;
      case "battleMechanicWinFlawless":
          f[0] = cheats.translate(`LIB_MECHANIC_${a.stateFunc.args.mechanic.toUpperCase()}`),
          f[1] = a.amount;
          break;
      case "battleMechanicWinHero":
          f[0] = a.stateFunc.args.killUnitId;
          f[1] = cheats.translate(`LIB_MECHANIC_${a.stateFunc.args.mechanic.toUpperCase()}`);
          f[2] = a.amount;
          break;
      case "battleMechanicWinHeroBossChapter5":
          f[0] = ~~a.stateFunc.args.killUnitId;
          f[1] = a.amount;
          break;
      case "battleMechanicWinPerk":
          f[0] = cheats.translate(`"LIB_MECHANIC_${a.stateFunc.args.mechanic.toUpperCase()}`),
          f[1] = ~~a.stateFunc.args.killUnitRole,
          f[2] = a.amount;
          break;
      case "battleMechanicWinPerkAdventuresRangedDps":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.killUnitRole;
          break;
      case "battleMechanicWinPerkArenaTank":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.killUnitRole;
          break;
      case "battleMechanicWinPerkTowerHealer":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.killUnitRole;
          break;
      case "battleMechanicWinPerkTowerMage":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.killUnitRole;
          break;
      case "battleMechanicWinPerkTowerTank":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.killUnitRole;
          break;
      case "battleMechanicWinWithHero":
          f[0] = cheats.translate(`"LIB_MECHANIC_${a.stateFunc.args.mechanic.toUpperCase()}`),
          f[1] = a.stateFunc.args.useUnitId,
          f[2] = a.amount;
          break;
      case "battleMechanicWinWithMeleeDpsInAdventures":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.useUnitRole;
          break;
      case "battleMechanicWinWithPerk":
          f[0] = cheats.translate(`"LIB_MECHANIC_${a.stateFunc.args.mechanic.toUpperCase()}`),
          f[1] = ~~a.stateFunc.args.useUnitRole,
          f[2] = a.amount;
          break;
      case "battleMechanicWinWithPerkMeleeDpsInArena":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.useUnitRole;
          break;
      case "battleMechanicWinWithPerkSupportInMissions":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.useUnitRole;
          break;
      case "battleMechanicWinWithPerkTankInTower":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.useUnitRole;
          break;
      case "bossKillByLevel":
          b = ~~a.stateFunc.args.id;
          b = C.Rg.tF(b);
          f[0] = b.wa(),
          f[1] = a.stateFunc.args.level;
          break;
      case "bossLevelAll":
          f[0] = a.stateFunc.args.level;
          break;
      case "clanDominationFarmTime":
          f[0] = a.amount;
          break;
      case "clanDominationWins":
          f[0] = a.amount;
          break;
      case "clanRaidBossHallOfFame":
          f[0] = a.stateFunc.args.id;
          break;
      case "clanRaidBossLevelDefeated":
          f[0] = a.stateFunc.args.id;
          f[1] = a.stateFunc.args.level;
          break;
      case "clanRaidBossLevelDefeatedAmount":
          f[0] = a.stateFunc.args.id;
          f[1] = a.stateFunc.args.level;
          f[2] = a.amount;
          break;
      case "clanRaidNodeLevelDefeated":
          e = a.stateFunc.args.raidId;
          b = a.stateFunc.args.level;
          f[0] = null != e ? a.stateFunc.args.nodeId : `raidNode:${a.stateFunc.args.nodeId}`;
          f[1] = null != e ? a.stateFunc.args.raidId : `raid:${a.stateFunc.args.raidId}`;
          f[2] = b;
          break;
      case "dungeonBattleWinTitan":
          f[0] = a.amount;
          f[1] = cheats.translate(`LIB_TITAN_ELEMENT_${a.stateFunc.args.useTitanByElement}`);
          break;
      case "fragmentHeroGetCampaign":
          f[0] = a.amount;
          f[1] = cheats.translate(`LIB_HERO_NAME_${a.stateFunc.args.unitId}`);
          break;
      case "freeStaminaHours":
          f[0] = a.stateFunc.args.startHour
          f[1] = a.stateFunc.args.endHour;
          break;
      case "arenaPlace":
      case "eventRatingQuizPlace":
      case "eventRatingSendPlace":
      case "eventRatingTakePlace":
      case "grandArenaPlace":
          f[0] = a.stateFunc.args.place;
          break;
      case "heroAmountStarsById":
          f[0] = a.amount;
          f[1] = this.kVa(a.stateFunc.args.heroId);
          break;
      case "heroArtifactLevelBySlot":
          f[0] = a.amount;
          f[1] = this.kVa(a.stateFunc.args.heroId);
          // a.stateFunc.args.slot;
          break;
      case "heroAscensionRankAmount":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.rank | 0;
          break;
      case "heroAscensionRankById":
          f[0] = this.kVa(a.stateFunc.args.id);
          f[1] = a.stateFunc.args.rank | 0;
          break;
      case "heroByNameColor":
          f[0] = this.kVa(a.stateFunc.args.id);
          f[1] = a.stateFunc.args.color;
          break;
      case "heroEnchantRuneByType":
          f[0] = cheats.translate(`LIB_BATTLESTATDATA_${a.stateFunc.args.runeType}`);
          break;
      case "heroPerkGiftLevelUp":
          f[0] = ~~a.stateFunc.args.perk;
          break;
      case "heroPerkSkillLevelUp":
          f[0] = ~~a.stateFunc.args.perk;
          break;
      case "heroPerkSkinLevelUp":
          f[0] = ~~a.stateFunc.args.perk;
          break;
      case "heroQualityCount":
      case "petAmountColor":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.color;
          break;
      case "heroRunesSumLevel":
          f[0] = a.amount;
          f[1] = this.kVa(a.stateFunc.args.heroId);
          break;
      case "heroSkillSumLevel":
          f[0] = a.amount;
          f[1] = this.kVa(a.stateFunc.args.heroId);
          break;
      case "invasionBossLevel":
          f[0] = cheats.translate(`LIB_INVASION_NAME_${a.stateFunc.args.invasionId}`);
          f[1] = cheats.translate(`LIB_INVASION_BOSS_${a.stateFunc.args.bossId}`);
          f[2] = a.stateFunc.args.level;
          break;
      case "invasionQuestCount":
          f[0] = a.amount;
          f[1] = cheats.translate(`LIB_INVASION_NAME_${a.stateFunc.args.invasionId}`);
          break;
      case "missionCompleteEliteAny":
          f[0] = a.amount;
          break;
      case "missionCompleteExtendedChapter":
          f[0] = ~~a.stateFunc.args.chapter;
          f[1] = a.amount;
          break;
      case "missionCompleteExtendedStars":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.stars;
          break;
      case "missionCompleteName":
          f[0] = ~~a.stateFunc.args.id;
          break;
      case "missionCompleteNameCount":
          f[1] = ~~a.stateFunc.args.id;
          f[0] = a.amount;
          break;
      case "missionDefeatUnitByChapter":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.chapter;
          break;
      case "heroAmountStars":
      case "petAmountStars":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.star;
          break;
      case "heroByIdName":
      case "heroByNameOrange":
      case "heroByNamePurple":
      case "heroByNameRed":
      case "petByNameBlue":
      case "petByNamePurple":
      case "petByNameStars":
          f[0] = this.kVa(a.stateFunc.args.id);
          break;
      case "petColorById":
          f[0] = this.kVa(a.stateFunc.args.id);
          f[1] = a.stateFunc.args.color;
          break;
      case "questFarmBattlePass":
          f[0] = a.amount;
          f[1] = cheats.translate(`LIB_BATTLE_PASS_NAME_${a.stateFunc.args.id}`);
          break;
      case "raidVipTickets":
          f[0] = "n";
          break;
      case "resourceSpentTypeId":
          f[0] = a.stateFunc.args.id;
          f[1] = a.stateFunc.args.type;
          break;
      case "roleAscensionEvolveAmount":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.level;
          break;
      case "roleAscensionLevelById":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.id;
          break;
      case "runeLevelCount":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.level;
          break;
      case "skinsLevelsByCertainHero":
          f[0] = this.kVa(a.stateFunc.args.unitId);
          f[1] = a.amount;
          break;
      case "skinsLevelsByHero":
          f[0] = this.kVa(a.stateFunc.args.unitId);
          f[1] = a.amount;
          break;
      case "socialGifts":
          //"LIB_QUEST_TRANSLATE_SOCIALGIFTS2";
          break;
      case "specialQuestFarmByEventTypeId":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.specialQuestEventTypeId;
          break;
      case "starmoneySubscription":
          f[0] = "n";
          break;
      case "storyFragmentByBook":
          f[0] = ~~a.stateFunc.args.id,
          f[1] = '';
          break;
      case "titanArtifactAmountLevel":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.level;
          break;
      case "titanArtifactAmountStars":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.star;
          break;
      case "titanArtifactAmountStarsById":
          f[0] = a.stateFunc.args.id;
          f[1] = '';
          f[2] = a.amount;
          break;
      case "titanGiftLevelById":
          f[0] = a.amount;
          f[1] = this.kVa(a.stateFunc.args.heroId);
          break;
      case "titanGiftLevelCount":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.level;
          break;
      case "heroSkinAmountByLevel":
      case "titanSkinAmountByLevel":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.level;
          break;
      case "heroSkinLevelById":
      case "titanSkinLevelById":
          b = a.stateFunc.args.skinId;
          f[0] = a.stateFunc.args.skinId,
          f[2] = a.amount;
          break;
      case "titanStarsCount":
          f[0] = a.amount;
          f[1] = a.stateFunc.args.star;
          break;
      case "towerFloor":
          f[0] = a.stateFunc.args.floorNumber;
          break;
      case "unitLevelUpById":
          f[0] = a.amount;
          f[1] = this.kVa(~~a.stateFunc.args.unitId);
          break;
      case "worldCompleteName":
          f[0] = a.amount;
          f[1] = ~~a.stateFunc.args.id;
          break;
      default:
          f[0] = a.amount
      }
      return f;
  },
  kVa: function(id) {
      return cheats.translate(`LIB_HERO_NAME_${id}`);
  },
};

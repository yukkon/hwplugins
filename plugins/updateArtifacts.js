async function updateArtifactss() {
  const count = +await popup.confirm(I18N('SET_NUMBER_LEVELS'), [
    { msg: I18N('BTN_GO'), isInput: true, default: 10 },
    { result: false, isClose: true }
  ]);
  if (!count) {
    return;
  }
const heroLib = lib.getData('hero');
const artifactLib = lib.getData('artifact');

let inventory = await Send({calls:[{"name": "inventoryGet","args": {},"ident": "group_1_body"}]}).then(r => r.results[0].result.response);
let hs = await Send({calls:[{"name": "heroGetAll","args": {},"ident": "group_1_body"}]}).then(r => r.results[0].result.response);
let os = Object.values(hs).map(h => h.artifacts.map((a, i) => ({id: h.id, slot: i, level: a.level, star: a.star, type: artifactLib.id[heroLib[h.id].artifacts[i]].type}))).flat()

// 
const h0 = [...new Set(os.filter(o => o.star == 0).map(o => o.id))].map(id => cheats.translate(`LIB_HERO_NAME_${id}`)).join(' ,');
console.log("Герои имеют не активированные артифакты", h0);

let cals = [];

let r = true;
while(r) {
const artifacts = os.filter(o => o.star > 0).filter(o => o.level < 100).filter(o => {
  const costNextLevel = artifactLib.type[o.type].levels[art.level + 1].cost;
  const costСurrency = Object.keys(costNextLevel).pop();
  const [costId, costValue] = Object.entries(costNextLevel[costСurrency])[0];

  return (Number(inventory[costСurrency][costId]) >= Number(costValue))
}).sort((a, b) => a.level - b.level)
let art = artifacts[0];
if (!!art) {
  const costNextLevel = artifactLib.type[type].levels[art.level + 1].cost;
  const costСurrency = Object.keys(costNextLevel).pop();
  const [costId, costValue] = Object.entries(costNextLevel[costСurrency])[0];

  cals.push({heroId: art.id, slotId: art.slot});
  inventory[costСurrency][costId] -= Number(costValue);
  art.level++;
}

r = !!art && cals.length < count;
}

console.log(cals);
}

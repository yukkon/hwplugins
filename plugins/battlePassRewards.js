"use strict";

const injectFunction = async (l) => {
  const div = document.createElement("div");
    div.className = "menu_button";
    div.innerHTML = `Собрать награды сезонов`;
    div.dataset.id = i.id;
    div.addEventListener("click", onclick);
    document.querySelector(".main_menu").appendChild(div);
};

const onclick = async (e) => {
  const isFarmReward = (reward) => {
    return !(reward?.buff || reward?.fragmentHero || reward?.bundleHeroReward);
  };

  const battlePassProcess = (pass) => {
    if (!pass.id) {return []}
    const levels = Object.values(lib.data.battlePass.level).filter(x => x.battlePass == pass.id)
    const last_level = levels.at(-1);
    let actual = Math.max(...levels.filter(p => pass.exp >= p.experience).map(p => p.level))

    if (pass.exp > last_level.experience) {
      actual = last_level.level + (pass.exp - last_level.experience) / last_level.experienceByLevel;
    }
    const calls = [];
    for(let i = 1; i <= actual; i++) {
      const level = i >= last_level.level ? last_level : levels.find(l => l.level === i);
      const reward = {free: level?.freeReward, paid:level?.paidReward};

      if (!pass.rewards[i]?.free && isFarmReward(reward.free)) {
        const args = {level: i, free:true};
        if (!pass.gold) { args.id = pass.id }
        calls.push({name: 'battlePass_farmReward', args, ident: `${pass.gold ? 'body' : 'spesial'}_free_${i}`})
      }
      if (pass.ticket && !pass.rewards[i]?.paid && isFarmReward(reward.paid)) {
        const args = {level: i, free:false};
        if (!pass.gold) { args.id = pass.id}
        calls.push({name: 'battlePass_farmReward', args, ident: `${pass.gold ? 'body' : 'spesial'}_paid_${i}`})
      }
    }
    return calls;
  }

  const passes = await Send({
    calls: [
      { name: 'battlePass_getInfo', args: {}, ident: 'getInfo' },
      { name: 'battlePass_getSpecial', args: {}, ident: 'getSpecial' },
    ],
  }).then((e) => [{...e.results[0].result.response?.battlePass, gold: true}, ...Object.values(e.results[1].result.response)]);

  const calls = passes.map(p => battlePassProcess(p)).flat()

  let results = await Send({calls});
  if (results.error) {
    setProgress(`${results.error.call.ident}: ${results.error.description}`)
  } else {
    setProgress(`Получено ${results.results.length} наград`)
  }
}

export default injectFunction;
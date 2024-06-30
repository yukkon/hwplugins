async function getRaidInfo() {
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

  const calls = [
    { name: "clanGetInfo", args: {}, ident: "clanGetInfo" },
    { name: "clanRaid_logBoss", args: {}, ident: "clanRaid_logBoss" },
  ];

  const result = await Send(JSON.stringify({ calls }));
  if (!!result?.error) {
    return;
  }
  const res = {
    clanGetInfo: result.results[0].result.response,
    clanRaid_logBoss: result.results[1].result.response,
  };

  let data = [];
  if (!res.clanGetInfo?.clan?.members || !res.clanRaid_logBoss) {
    return [];
  }

  const h = Object.values(res.clanRaid_logBoss)
    .map((p) => Object.values(p))
    .flat();

  h.forEach((i) => {
    const u = res.clanGetInfo.clan.members[i.userId];
    if (!u) {
      return;
    }
    let bosses = Object.keys(i.defenders[0])
      .map((b) => ({
        level: raidMaxHp[i.defenders[0][b].state.maxHp],
        damage: i.result.damage[b],
      }))
      .filter((b) => b.damage > 0);

    let attackers = Object.values(i.attackers)
      .filter((a) => a.type === "hero")
      .map(({ id, level, color, petId, star, power }) => ({
        id,
        level,
        color,
        petId,
        star,
        power
      }));
      
    let p = Object.values(i.attackers).find(a => a.type === "pet");
    if (!!p) {
      let {id, level, color, star, power} = p
      p = ({id, level, color, star, power});
    }
    
    bosses.forEach((b) => {
      data.push({
        id: u.id,
        name: u.name,
        date: new Date(Number(i.startTime) * 1000),
        boss: b.level,
        damage: b.damage,
        attackers,
        pet: !!p ? p : undefined
      });
    });
  });

  return data.sort((a, b) => a.date - b.date);
}

export default getRaidInfo;

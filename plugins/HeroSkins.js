
async function getSkins() {
  const hs = await Send('{"calls":[{"name":"heroGetAll","args":{},"ident":"body"}]}').then(r => Object.values(r.results[0].result.response)).then(hs => hs.map(({id, power, skins}) => ({id, power, skins})))
  //hs.map(h => ({id: h.id, power: h.power, skins: Object.keys(h.skins).map(s => lib.data.skin[s].statData.level.filter(l => l > h.skins[s]))}))

  //hs.map(h => Object.keys(h.skins).map(s => Object.values(lib.data.skin[s].statData.levels).filter(l => l.level > h.skins[s])))

  return hs.map(h => {
    const skins = {...Object.values(lib.data.skin).filter(s => s.heroId == h.id).reduce((acc, v) => {acc[v.id] = 0; return acc}, {}), ...h.skins}
    let empties = [];
    const costs = Object.keys(skins).map(s => Object.values(lib.data.skin[s].statData.levels).filter(l => l.level > skins[s])).flat().map(s => s.cost);
    const c = costs.reduce((acc, val) => {
      if (!val) {
        empties.push(h.id)
      } else {
        Object.keys(val).forEach(k => { //coin
          if (!acc[k]) { acc[k] = {}}
          Object.keys(val[k]).forEach(c => { //8 9 10
            if (!acc[k][c]) { 
              acc[k][c] = val[k][c]
            } else {
              acc[k][c] += val[k][c]
            }
          })
        })
      }
    return acc;
  }, {})
    return ({
      id: h.id,
      cost: c
    })
  })

  c.forEach(h => {
    let v = Object.keys(h.cost).map(k => {
      return Object.keys(h.cost[k]).map(c => {
        return `${cheats.translate(`LIB_${k.toUpperCase()}_NAME_${c}`)}(${h.cost[k][c]})`
      })
    })
    console.log(`${cheats.translate(`LIB_HERO_NAME_${h.id}`)}: ${v.join(' / ')}`)
  })
}

export default getSkins;
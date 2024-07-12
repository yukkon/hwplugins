export default injectFunction = async () => {
    let a = await Send({calls:[{"name": "topGet","args": {"type": "arena","extraId": 0},"ident": "group_1_body"}]}).then(r => r.results[0].result.response.top.map(place => place.heroes.map(hero => hero.id)));
    let a2 = a.flat().reduce((acc, val) => (acc[val] ? ++acc[val] : (acc[val] = 1), acc ), {});

    //топ героев
    Object.entries(a2).filter(([id, _]) => id < 100).sort(([a_id, a_count],[b_id, b_count]) => b_count - a_count).forEach(([id, count]) =>  console.log(`${cheats.translate(`LIB_HERO_NAME_${id}`)} - ${count}`)    )

    //топ петов
    Object.entries(a2).filter(([id, _]) => id > 100 && id < 7000).sort(([a_id, a_count],[b_id, b_count]) => b_count - a_count).forEach(([id, count]) => console.log(`${cheats.translate(`LIB_HERO_NAME_${id}`)} - ${count}`))

    return a2;
}
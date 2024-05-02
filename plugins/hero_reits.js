'use strict';

const injectFunction = () => {
  const div = document.createElement('div');
  div.className = 'scriptMenu_button'
  div.innerHTML = '<div class="scriptMenu_buttonText">Top Stats</div>';
  div.addEventListener("click", async () => {
    const b = document.querySelector('.PopUp_back');
    const container = b.querySelector('.PopUp_');

    b.classList.remove('PopUp_hideBlock');
    container.classList.remove('PopUp_hideBlock');

    let button = document.createElement('div')
		button.classList.add('PopUp_close');
		container.append(button);
	
		let crossClose = document.createElement('div')
		crossClose.classList.add('PopUp_crossClose');
		button.append(crossClose);

    button.addEventListener('click', () => {
      container.classList.add('PopUp_hideBlock');
      b.classList.add('PopUp_hideBlock');
      container.innerHTML = '';
    });

    let a = await Send({calls:[{"name": "topGet","args": {"type": "arena","extraId": 0},"ident": "group_1_body"}]}).then(r => r.results[0].result.response.top.map(place => place.heroes.map(hero => hero.id)));
    let a2 = a.flat().reduce((acc, val) => (acc[val] ? ++acc[val] : (acc[val] = 1), acc ), {});

    //топ героев
    Object.entries(a2).filter(([id, _]) => id < 100).sort(([a_id, a_count],[b_id, b_count]) => b_count - a_count).forEach(([id, count]) => {
      let r = document.createElement('div');
			r.className = 'row';
			
			let c = document.createElement('div');
			c.className = 'cell col-5';
			c.innerText = cheats.translate(`LIB_HERO_NAME_${id}`);
			r.appendChild(c);

			c = document.createElement('div');
			c.className = `cell col-1`;
			c.innerText = count;
			r.appendChild(c);
			
			container.appendChild(r);
    })

    //топ петов
    Object.entries(a2).filter(([id, _]) => id > 100 && id < 7000).sort(([a_id, a_count],[b_id, b_count]) => b_count - a_count).forEach(([id, count]) => console.log(`${cheats.translate(`LIB_HERO_NAME_${id}`)} - ${count}`))
  });

  document.querySelector('.scriptMenu_main').appendChild(div);
}

document.addEventListener("HWDataEvent", function(event) {
  //console.log("TOP HWDataEvent handled: ", event);
  if (event.detail.type == "DOMLoaded") {
    injectFunction();
  }
});

export default injectFunction;
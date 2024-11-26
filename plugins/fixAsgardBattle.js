'use strict';
//[2+3]
//3.66	760 763 949
//5.29	998 358 159
//[5+5]
//4.61	1 197 499 812
//[0/0]
//Таймер:8.94	Урон:1 035 671 315  Прошло:1126.951  Среднее:53176451.58 Скорость:0.80
//5.04	940 228 722 Прошло:  1035.446 Среднее:  59412792.92 Среднея скорость:  0.87

const injectFunction = (data) => {
  const div = document.createElement("div");
  div.className = "menu_button";
  div.innerHTML = `Запустить fixAsgardBattle`;
  div.dataset.id = i.id;
  div.addEventListener("click", onclick);
  document.querySelector(".main_menu").appendChild(div);
}

const onclick = async (e) => {
  fb = new FixBattle();
}

class FixBattle {
	constructor(url = 'wss://localho.st:3000') {
		const socket = new WebSocket(url);

		socket.onopen = () => {
			console.log('Connected to server');
		};

		socket.onmessage = this.onmessage.bind(this);

		socket.onclose = () => {
			console.log('Disconnected from server');
		};

		this.ws = socket;
	}

	onmessage(event) {
		const data = JSON.parse(event.data);
    console.log('message from server', data)
    const methods = {}

    methods.newTask = () => {
      if (!this.task) {
        this.task = data.task;
        this.init(data.startTimer, data.stopTimer);
        this.loop();
      }
    }
    methods.resolveTask = () => {
      if (data.id === this.id && 
        data.solutions.length === this.countExecutor) {
        //this.endFix(data.solutions);
      }
    }

    try {
      methods[data.type]();
    } catch (e) {
      console.log('Unknown message type:', data.type);
    }
	}

	randTimer() {
		const min = 1.3;
		const max = 10.3;
		return Math.random() * (max - min + 1) + min;
	}

	setAvgTime(startTime) {
		this.fixTime += Date.now() - startTime;
		this.avgTime = this.fixTime / this.count;
	}

	init(startTimer = 0, stopTimer = 0) {
    this.started = Date.now()
    this.stopTimer = stopTimer;
    this.step = 0.01;
		this.fixTime = 0;
		this.lastTimer = startTimer;
		this.index = 0;
		this.lastBossDamage = 0;
    this.count = 0;
		this.bestResult = {
			count: 0,
      index: 0,
			timer: 0,
			damage: 0,
			result: null,
			progress: null,
		};
	}

	async newTask(battle, endTime = Date.now() + 6e4) {
		this.battle = structuredClone(battle);
		this.endTime = endTime;
		this.init();

		this.task = {
			type: 'newTask',
			id: crypto.getRandomValues(new Uint8Array(10)).reduce((acc, val) => acc + val.toString(16)),
			battle: this.battle,
			endTime: this.endTime
		};
		this.ws.send(JSON.stringify(this.task));
/*		return await new Promise((resolve) => {
			this.resolve = resolve;
			this.count = 0;
			this.loop();
		});*/
	}

	endFix() {
    this.task = null;
		//this.resolve(this.bestResult); 
    this.ws.send(JSON.stringify({task: this.task, result: this.bestResult})); //оповещение сервера о результатах
	}

	async loop() {
		if (this.isEndLoop()) {
			this.endFix();
			return;
		}
		try {
			this.battle.progress = [{ attackers: { input: ['auto', 0, 0, 'auto', 0, this.lastTimer] } }];
			this.lastResult = await Calc(this.battle);
			this.avg = (Date.now() - this.started) / this.count;
		  this.checkResult();
		  this.showResult();
		} catch (e) {
			console.error("Calc thown exception", this.lastTimer)
		} finally {
      this.count++;
      this.lastTimer += this.step
			this.loop();
		}
	}

	isEndLoop() {
		return this.endTime < Date.now() /*|| this.lastTimer > this.task.endTimer*/;
	}

	showResult() {
		console.log(`
			${this.count},
			Среднее: ${this.avg.toFixed(2)},
			Осталось: ${(this.endTime - Date.now()) / 1000},
			Таймер: ${this.lastTimer.toFixed(2)},
			Урон: ${this.lastBossDamage.toLocaleString()},
			Лучший: ${this.bestResult.damage.toLocaleString()}
      `
		);
	}

	checkResult() {
		const { damageTaken, damageTakenNextLevel } = this.lastResult.progress[0].defenders.heroes[1].extra;
		this.lastBossDamage = damageTaken + damageTakenNextLevel;
		if (this.lastBossDamage > this.bestResult.damage) {
			this.bestResult = {
				count: this.count,
				timer: this.lastTimer,
				damage: this.lastBossDamage,
				result: this.lastResult.result,
				progress: this.lastResult.progress,
			};
		}
	}
}


export default injectFunction;
'use strict';

const injectFunction = (data) => {
  const div = document.createElement("div");
  div.className = "menu_button";
  div.innerHTML = `Запустить slaveFixBattle`;
  div.dataset.id = i.id;
  div.addEventListener("click", onclick);
  document.querySelector(".main_menu").appendChild(div);
}

const onclick = async (e) => {
  let sFix = new slaveFixBattle();
  sFix.wsStart()
}

class FixBattle {
	constructor(battle, isTimeout = true) {
		this.battle = structuredClone(battle);
		this.isTimeout = isTimeout;
	}

	timeout(callback, timeout) {
		if (this.isTimeout) {
			this.worker.postMessage(timeout);
			this.worker.onmessage = callback;
		} else {
			callback();
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

	init() {
		this.fixTime = 0;
		this.lastTimer = 0;
		this.index = 0;
		this.lastBossDamage = 0;
		this.bestResult = {
			count: 0,
			timer: 0,
			value: 0,
			result: null,
			progress: null,
		};
		this.worker = new Worker(
			URL.createObjectURL(
				new Blob([
					`self.onmessage = function(e) {
								const timeout = e.data;
								setTimeout(() => {
									self.postMessage(1);
								}, timeout);
							};`,
				])
			)
		);
	}

	async start(endTime = Date.now() + 6e4, maxCount = 100) {
		this.endTime = endTime;
		this.maxCount = maxCount;
		this.init();
		return await new Promise((resolve) => {
			this.resolve = resolve;
			this.count = 0;
			this.loop();
		});
	}

	endFix() {
		this.bestResult.maxCount = this.count;
		this.worker.terminate();
		this.resolve(this.bestResult);
	}

	async loop() {
		const start = Date.now();
		if (this.isEndLoop()) {
			this.endFix();
			return;
		}
		this.count++;
		try {
			this.lastResult = await Calc(this.battle);
		} catch (e) {
			this.updateProgressTimer(this.index++);
			this.timeout(this.loop.bind(this), 0);
			return;
		}
		this.setAvgTime(start);
		this.checkResult();
		this.updateProgressTimer();
		this.showResult();
		this.timeout(this.loop.bind(this), 0);
	}

	isEndLoop() {
		return this.count >= this.maxCount || this.endTime < Date.now();
	}

	updateProgressTimer(index = 0) {
		this.lastTimer = this.randTimer();
		this.battle.progress = [{ attackers: { input: ['auto', 0, 0, 'auto', index, this.lastTimer] } }];
	}

	showResult() {
		console.log(
			this.count,
			this.avgTime.toFixed(2),
			(this.endTime - Date.now()) / 1000,
			this.lastTimer.toFixed(2),
			this.lastBossDamage.toLocaleString(),
			this.bestResult.value.toLocaleString()
		);
	}

	checkResult() {
		const { damageTaken, damageTakenNextLevel } = this.lastResult.progress[0].defenders.heroes[1].extra;
		this.lastBossDamage = damageTaken + damageTakenNextLevel;
		if (this.lastBossDamage > this.bestResult.value) {
			this.bestResult = {
				count: this.count,
				timer: this.lastTimer,
				value: this.lastBossDamage,
				result: this.lastResult.result,
				progress: this.lastResult.progress,
			};
		}
	}
}


/*
mFix = new action.masterFixBattle(battle)
await mFix.start(Date.now() + 6e4, 1);
*/
class masterFixBattle extends FixBattle {
	constructor(battle, url = 'wss://localho.st:3000') {
		super(battle, true);
		this.url = url;
	}

	async start(endTime, maxCount) {
		this.endTime = endTime;
		this.maxCount = maxCount;
		this.init();
		this.wsStart();
		return await new Promise((resolve) => {
			this.resolve = resolve;
			const timeout = this.endTime - Date.now();
			this.timeout(this.getTask.bind(this), timeout);
		});
	}

	wsStart() {
		const socket = new WebSocket(this.url);

		socket.onopen = () => {
			console.log('Connected to server');

			// Пример создания новой задачи
			const newTask = {
				type: 'newTask',
				battle: this.battle,
				endTime: this.endTime - 1e4,
				maxCount: this.maxCount,
			};
			socket.send(JSON.stringify(newTask));
		};

		socket.onmessage = this.onmessage.bind(this);

		socket.onclose = () => {
			console.log('Disconnected from server');
		};

		this.ws = socket;
	}

	onmessage(event) {
		const data = JSON.parse(event.data);
		switch (data.type) {
			case 'newTask': {
				console.log('newTask:', data);
				this.id = data.id;
				this.countExecutor = data.count;
				break;
			}
			case 'getSolTask': {
				console.log('getSolTask:', data);
				this.endFix(data.solutions);
				break;
			}
			case 'resolveTask': {
				console.log('resolveTask:', data);
				if (data.id === this.id && 
					data.solutions.length === this.countExecutor) {
					this.worker.terminate();
					this.endFix(data.solutions);
				}
				break;
			}
			default:
				console.log('Unknown message type:', data.type);
		}
	}

	getTask() {
		this.ws.send(
			JSON.stringify({
				type: 'getSolTask',
				id: this.id,
			})
		);
	}

	async endFix(solutions) {
		this.ws.close();
		let maxCount = 0;
		for (const solution of solutions) {
			maxCount += solution.maxCount;
			if (solution.value > this.bestResult.value) {
				this.bestResult = solution;
			}
		}
		this.count = maxCount;
		super.endFix();
	}
}
/*
sFix = new action.slaveFixBattle();
sFix.wsStart()
*/
class slaveFixBattle extends FixBattle {
	constructor(url = 'wss://localho.st:3000') {
		super(null, false);
		this.isTimeout = false;
		this.url = url;
	}

	wsStop() {
		this.ws.close();
	}

	wsStart() {
		const socket = new WebSocket(this.url);

		socket.onopen = () => {
			console.log('Connected to server');
		};
		socket.onmessage = this.onmessage.bind(this);
		socket.onclose = () => {
			console.log('Disconnected from server');
		};

		this.ws = socket;
	}

	async onmessage(event) {
		const data = JSON.parse(event.data);
		switch (data.type) {
			case 'newTask': {
				console.log('newTask:', data.task);
				const { battle, endTime, maxCount } = data.task;
				this.battle = battle;
				const id = data.task.id;
				const solution = await this.start(endTime, maxCount);
				this.ws.send(
					JSON.stringify({
						type: 'resolveTask',
						id,
						solution,
					})
				);
				break;
			}
			default:
				console.log('Unknown message type:', data.type);
		}
	}
}


export default injectFunction;
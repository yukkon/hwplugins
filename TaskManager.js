"use strict";

class TaskManager {
	constructor(timeout) {
		if (!TaskManager.inst) {
			console.log('intiTaskManager', timeout);
			this.tasks = new Map();
			this.setTimeout(timeout);
			TaskManager.inst = this;
		}

		return TaskManager.inst;
	}

	async loop() {
		const currentTime = new Date();
		for (const [id, task] of this.tasks) {
			if (task.executeTime <= currentTime) {
				console.log('[TaskManager] executeTask', id);
				try {
					task.execute();
				} catch (error) {
					this.executeError(error, id);
				}

				this.tasks.delete(id);
				if (task.repeat) {
					this.addTask(task);
				}
			}
		}
		await this.sleep();
		this.loop();
	}

	addTask(task) {
		task.executeTime = task.executeAt instanceof Date ? task.executeAt : new Date(Date.now() + task.executeAt * 1e3);
    if (!task.id) {
		  task.id = crypto.getRandomValues(new Uint8Array(10)).reduce((acc, val) => acc + val.toString(16));
    }
		console.log('[TaskManager] addTask', task);
		this.tasks.set(task.id, task);
	}

  removeTask(id) {
		this.tasks.delete(id);
	}

	executeError(error, task) {
		console.error('[TaskManager]', error);
		console.log('[TaskManager]', task);
	}

	setTimeout(timeout) {
		this.timeout = timeout * 1000;
		if (this.worker) {
			this.worker.terminate();
		}
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
		this.loop();
	}

	async sleep() {
		return new Promise((r) => {
			this.worker.postMessage(this.timeout);
			this.worker.onmessage = r;
		});
	}
}

export default TaskManager;
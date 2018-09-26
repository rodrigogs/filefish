const { createReadStream, createWriteStream } = require('fs');
const { EventEmitter } = require('events');
const { Gaze } = require('gaze');

const STATUS = {
  RUNNING: 'running',
  STOPPED: 'stopped',
};

class Filefish extends EventEmitter {
  constructor() {
    super();

    this.status = STATUS.STOPPED;
    this.watched = [];
    this.watcher = new Gaze();
    this.buffer = Buffer.from([]);

    this.watcher.on('all', (event, filepath) => this.emit(event, {
      filepath,

    }));
  }

  start() {
    if (this.status === STATUS.RUNNING) return this;

    this.watched.forEach(w => this.watcher.add(w));

    this.status = STATUS.RUNNING;
    return this;
  }

  stop() {
    if (this.status === STATUS.STOPPED) return this;

    this.watcher.close();

    this.status = STATUS.STOPPED;
    return this;
  }

  watch(expression) {
    this.watched.push(expression);

    if (this.status === STATUS.RUNNING) {
      this.watcher.add(expression);
    }

    return this;
  }

  unwatch(expression) {
    const expressionString = JSON.stringify(expression);
    const index = this.watched.findIndex(item => JSON.stringify(item) === expressionString);

    if (index === -1) return this;
    this.watched.splice(index, 1);

    if (this.status === STATUS.RUNNING) {
      this.watcher.remove(expression);
    }

    return this;
  }
}

module.exports = Filefish;

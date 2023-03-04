const EventEmitter = require('events')
const TranslateFn = require('../utils/translateFn')



class MyEventEmitter extends EventEmitter  {
    emitObject(event, obj = {}) {
        this.emit(event, obj);
        return obj;
    }
}


const emitter = new MyEventEmitter()
emitter.on("sayHello", function(e) {
    e.message += " World";
});

module.exports = emitter
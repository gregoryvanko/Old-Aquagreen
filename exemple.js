let Aquagreen = require('./index').Aquagreen
const Name = "AquagreenDev"
const Port = 5000
const Debug = true
const WorkerAdress = "http://192.168.30.10:5000/api"
// const PinConfig = [
//     {"pin":2, "type": "Relais", "name": "Relais1", "status": "high", "activeLow" : true, "timeout": 10},
//     {"pin":3, "type": "Relais", "name": "Relais2", "status": "high", "activeLow" : true, "timeout": 1},
//     {"pin":4, "type": "Relais", "name": "Relais3", "status": "high", "activeLow" : true, "timeout": 1},
//     {"pin":17, "type": "Relais", "name": "Relais4", "status": "high", "activeLow" : true, "timeout": 1},
//     {"pin":27, "type": "Relais", "name": "Relais5", "status": "high", "activeLow" : true, "timeout": 1},
//     {"pin":22, "type": "Relais", "name": "Relais6", "status": "high", "activeLow" : true, "timeout": 1},
//     {"pin":10, "type": "Relais", "name": "Relais7", "status": "high", "activeLow" : true, "timeout": 1},
//     {"pin":9, "type": "Relais", "name": "Relais8", "status": "high", "activeLow" : true, "timeout": 1},
//     {"pin":7, "type": "Button", "name": "Button1", "status": "rising", "debouncetimeout" : 500}
// ]
let MyApp = new Aquagreen(Name, Port, Debug, WorkerAdress)
MyApp.Start()
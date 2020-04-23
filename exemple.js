let Aquagreen = require('./index').Aquagreen
const Name = "AquagreenDev"
const Port = 5000
const Debug = true
let MyApp = new Aquagreen(Name, Port, Debug)
MyApp.Start()
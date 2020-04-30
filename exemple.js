let Aquagreen = require('./index').Aquagreen
const Name = "AquagreenDev"
const Port = 5000
const Debug = true
const PinIO = [ 
    {txt:"Pin1", value:1},
    {txt:"Pin2", value:2}
]
let MyApp = new Aquagreen(Name, Port, Debug, PinIO)
MyApp.Start()
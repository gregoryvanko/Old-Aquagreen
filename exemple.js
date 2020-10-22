let Aquagreen = require('./index').Aquagreen
const Name = "AquagreenDev"
const Port = 5000
const Debug = true
//const RpiGpioAdress = "http://192.168.30.10:3000/api"     //RPI de prod
const RpiGpioAdress = "http://192.168.10.21:3000/api"       //RPI de dev
const UseRpiGpio = false
let MyApp = new Aquagreen(Name, Port, Debug, RpiGpioAdress, UseRpiGpio)
MyApp.Start()
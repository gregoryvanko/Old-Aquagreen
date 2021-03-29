# Aquagree
A Node.js application for garden.

## Usage
First, install the package using npm:
```bash
npm install @gregvanko/aquagreen --save
```

## File App.js
Create a "App.js" file with this content:
```js
let Aquagreen = require('@gregvanko/aquagreen').Aquagreen
const Name = "Aquagreen"
const Port = 9002
const Debug = true
const RpiGpioAdress = "http://192.168.30.10:3000/api"
const UseRpiGpio = true
let MyApp = new Aquagreen(Name, Port, Debug, RpiGpioAdress, UseRpiGpio)
MyApp.Start()
```

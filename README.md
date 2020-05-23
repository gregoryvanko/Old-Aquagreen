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
let MyApp = new Aquagreen(Name, Port, Debug)
MyApp.Start()
```
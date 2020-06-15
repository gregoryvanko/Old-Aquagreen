class Worker {
    constructor(MyApp, RpiGpioAdress, UseWorker){
        this._MyApp = MyApp
        this._RpiGpioAdress = RpiGpioAdress
        this._UseWorker = UseWorker

        this._Status = new Object()
        this._Status.IsRunning = false
        this._Status.WorkerConfigList = null
        this._Status.StepTotal = 0
        this._Status.StepCurrent = 0
        this._Status.TotalSecond = 0
        this._Status.ZoneName = ""
        this._Status.ZoneStepTotal = 0
        this._Status.ZoneStepCurrent = 0
        this._Status.ZoneNumberTotal = 0
        this._Status.ZoneNumberCurrent = 0

        this._CurrentZoneName = ""
        this._CurrentZoneStatus = ""
        this._ListOfActions = new Array()
        this._WorkerInterval = null

        // MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        this._MongoConfigCollection = MongoConfig.ConfigCollection
    }

    get Status(){return this._Status}

    /**
     * HTTP API du Worker
     * @param {Object} Data {Fct, Data} Object de parametre de l'API
     * @param {Res} Res Reponse à la requete de l'API
     * @param {String} UserId UserId de l'user qui a appeler l'API
     */
    ApiWork(Data, Res, UserId){
        this._MyApp.LogAppliInfo("Call ApiWorker + " + JSON.stringify(Data))
        if (Data.Fct == "ButtonPressed"){
            Res.json({Error: false, ErrorMsg: "Worker", Data: "Worker Started by: " + Data.Name})
            //  ToDo Start Button Fct
        } else if(Data.Fct == "Ping"){
            Res.json({Error: false, ErrorMsg: "Worker", Data: "Pong"})
        } else if(Data.Fct == "GetConfig"){
            this.GetConfig(Res)
        } else {
            Res.json({Error: true, ErrorMsg: "ApiWorker error, fct not found: " + Data.Fct, Data: null})
        }
    }

    /**
     * Get de la config des GPIO en DB
     * @param {Res} Res Reponse à la requete de l'API
     */
    GetConfig(Res){
        // Get Gpio Config in DB
        let me = this
        const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.GpioConfigKey}
        const Projection = { projection:{_id: 0, [this._MongoConfigCollection.Value]: 1}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: null, Data: null})
            } else {
                Res.json({Error: false, ErrorMsg: null, Data: reponse[0][this._MongoConfigCollection.Value]})
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiWork GetConfig DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiWork GetConfig DB Error", Data: null})
        })
    }

    StartWorking(WorkerConfigList){
        this._WorkerConfigList = WorkerConfigList
        let lengthOfWorkerConfigList = this._WorkerConfigList.length

        let TempStep = 0

        WorkerConfigList.forEach(element => {
            TempStep++
            // Open
            let ObjectActionOpen = new Object()
            ObjectActionOpen.Step = TempStep
            ObjectActionOpen.ZoneName = element.ZoneName
            ObjectActionOpen.Type = "Start"
            ObjectActionOpen.Delay = element.Delay * 60
            TempStep = TempStep + (element.Delay * 60)
            this._ListOfActions.push(ObjectActionOpen)
            // Close
            let ObjectActionClose = new Object()
            ObjectActionClose.Step = TempStep
            ObjectActionClose.ZoneName = element.ZoneName
            ObjectActionClose.Type = "Stop"
            ObjectActionClose.Delay = 5
            TempStep = TempStep + 5
            this._ListOfActions.push(ObjectActionClose)
        })

        this._Status.IsRunning = true
        this._Status.StepTotal = TempStep
        this._Status.StepCurrent = 0
        this._Status.TotalSecond = this._Status.StepTotal - this._Status.StepCurrent
        this._Status.ZoneName = "Start Worker"
        this._Status.ZoneStepTotal = 1
        this._Status.ZoneStepCurrent = 0
        this._Status.ZoneNumberTotal = lengthOfWorkerConfigList
        this._Status.ZoneNumberCurrent = 0

        let Io = this._MyApp.Io
        Io.emit("BuildPlayerVue", this._Status)

        this._WorkerInterval = setInterval(this.UpdateWorkerStatus.bind(this), 1000)
    }

    UpdateWorkerStatus(){
        this._Status.StepCurrent++
        this._Status.TotalSecond--
        this._Status.ZoneStepCurrent++
        let me = this
        if (this._ListOfActions.length > 0){
            if (this._Status.StepCurrent >= this._ListOfActions[0].Step){
                if (this._ListOfActions[0].Type == "Start"){
                    // Set GPIO => 1
                    if (this._UseWorker){
                        const axios = require('axios')
                        axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._ListOfActions[0].ZoneName, value: "1"}}).then(res => {
                            if (res.data.Error){
                                me._MyApp.LogAppliError("UpdateWorkerStatus setgpio res error : " + res.data.ErrorMsg)
                                me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                            } else {
                                me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data))
                            }
                        }).catch(error => {
                            me._MyApp.LogAppliError("UpdateWorkerStatus setgpio error : " + error)
                            me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                        })
                    } else {
                        this._MyApp.LogAppliInfo("Setgpio done => 1 " + this._ListOfActions[0].ZoneName)
                    }
                    
                    this._Status.ZoneName = "Start " + this._ListOfActions[0].ZoneName
                    this._Status.ZoneNumberCurrent++
                } else {
                    // Set GPIO => 0
                    if (this._UseWorker){
                        const axios = require('axios')
                        axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._ListOfActions[0].ZoneName, value: "0"}}).then(res => {
                            if (res.data.Error){
                                me._MyApp.LogAppliError("UpdateWorkerStatus setgpio res error : " + res.data.ErrorMsg)
                                me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                            } else {
                                me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data))
                            }
                        }).catch(error => {
                            me._MyApp.LogAppliError("UpdateWorkerStatus setgpio error : " + error)
                            me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                        })
                    } else {
                        this._MyApp.LogAppliInfo("Setgpio done => 0 " + this._ListOfActions[0].ZoneName)
                    }

                    this._Status.ZoneName = "Stop " + this._ListOfActions[0].ZoneName
                }
                this._CurrentZoneName = this._ListOfActions[0].ZoneName
                this._CurrentZoneStatus = this._ListOfActions[0].Type
                this._Status.ZoneStepTotal = this._ListOfActions[0].Delay
                this._Status.ZoneStepCurrent = 0
                this._ListOfActions.shift()
            }
        }
        if (this._Status.StepCurrent > this._Status.StepTotal){
            // On stop le worker en emettant un message Stop aux sockets
            this.InitWorkerStatus()
            this._MyApp.Io.emit("PlayerStop", "")
        } else {
            this._MyApp.Io.emit("PlayerUpdate", this._Status)
        }
    }

    InitWorkerStatus(){
        if (this._WorkerInterval != null){
            clearInterval(this._WorkerInterval)
            this._WorkerInterval = null
        }
        this._Status.IsRunning = false
        this._Status.WorkerConfigList = null
        this._Status.StepTotal = 0
        this._Status.StepCurrent = 0
        this._Status.TotalSecond = 0
        this._Status.ZoneName = ""
        this._Status.ZoneStepTotal = 0
        this._Status.ZoneStepCurrent = 0
        this._Status.ZoneNumberTotal = 0
        this._Status.ZoneNumberCurrent = 0
        this._ListOfActions = new Array()

        this._CurrentZoneName = ""
        this._CurrentZoneStatus = ""
    }

    CommandePlay(){
        if (this._Status.IsRunning){
            this._WorkerInterval = setInterval(this.UpdateWorkerStatus.bind(this), 1000)
            this._Status.ZoneName = this._CurrentZoneStatus + " " + this._CurrentZoneName
            if (this._CurrentZoneStatus == "Start"){
                // Set GPIO => 1 de this._CurrentZoneName
                if (this._UseWorker){
                    let me = this
                    const axios = require('axios')
                    axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._CurrentZoneName, value: "1"}}).then(res => {
                        if (res.data.Error){
                            me._MyApp.LogAppliError("CommandePlay setgpio res error : " + res.data.ErrorMsg)
                            me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                        } else {
                            me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data))
                        }
                    }).catch(error => {
                        me._MyApp.LogAppliError("CommandePlay setgpio error : " + error)
                        me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                    })
                } else {
                    this._MyApp.LogAppliInfo("Setgpio done => 1 " + this._CurrentZoneName)
                }
            }
        }
        this._MyApp.Io.emit("PlayerUpdate", this._Status)
    }

    CommandePause(){
        if (this._WorkerInterval != null){
            clearInterval(this._WorkerInterval)
            this._WorkerInterval = null
            this._Status.ZoneName = "Pause " + this._CurrentZoneName
            if (this._CurrentZoneStatus == "Start"){
                // Set GPIO => 0 de this._CurrentZoneName
                if (this._UseWorker){
                    let me = this
                    const axios = require('axios')
                    axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._CurrentZoneName, value: "0"}}).then(res => {
                        if (res.data.Error){
                            me._MyApp.LogAppliError("CommandePause setgpio res error : " + res.data.ErrorMsg)
                            me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                        } else {
                            me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data))
                        }
                    }).catch(error => {
                        me._MyApp.LogAppliError("CommandePause setgpio error : " + error)
                        me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                    })
                } else {
                    this._MyApp.LogAppliInfo("Setgpio done => 0 " + this._CurrentZoneName)
                }
            }
            this._MyApp.Io.emit("PlayerUpdate", this._Status)
        }
    }

    CommandeStop(){
        if (this._CurrentZoneStatus == "Start"){
            // Set GPIO => 0 de this._CurrentZoneName
            if (this._UseWorker){
                let me = this
                const axios = require('axios')
                axios.post(this._RpiGpioAdress, {FctName:"setgpio", FctData:{name: this._CurrentZoneName, value: "0"}}).then(res => {
                    if (res.data.Error){
                        me._MyApp.LogAppliError("CommandeStop setgpio res error : " + res.data.ErrorMsg)
                        me._MyApp.Io.emit("PlayerError", "Setgpio error : " + res.data.ErrorMsg)
                        me.InitWorkerStatus()
                        me._MyApp.Io.emit("PlayerUpdate", this._Status)
                    } else {
                        me._MyApp.LogAppliInfo("Setgpio done: " + JSON.stringify(res.data.Data))
                        me.InitWorkerStatus()
                        me._MyApp.Io.emit("PlayerStop", "")
                    }
                }).catch(error => {
                    me._MyApp.LogAppliError("CommandeStop setgpio error : " + error)
                    me._MyApp.Io.emit("PlayerError", "Setgpio error : " + error)
                    me.InitWorkerStatus()
                    me._MyApp.Io.emit("PlayerUpdate", this._Status)
                })
            } else {
                this._MyApp.LogAppliInfo("Setgpio done => 0 " + this._CurrentZoneName)
                this.InitWorkerStatus()
                this._MyApp.Io.emit("PlayerStop", "")
            }
        } else {
            this.InitWorkerStatus()
            this._MyApp.Io.emit("PlayerStop", "")
        }
    }

}
module.exports.Worker = Worker
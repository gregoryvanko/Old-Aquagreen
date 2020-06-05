class Worker {
    constructor(MyApp){
        this._MyApp = MyApp

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

        this._ListOfStep = new Array()
        this._WorkerInterval = null

        // Varaible interne MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        this._MongoConfigCollection = MongoConfig.ConfigCollection
    }

    get IsRunning(){return this._IsRunning}
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
            // ToDo
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

        this._Status.IsRunning = true
        this._Status.StepTotal = 20 // ToDo
        this._Status.StepCurrent = 0
        this._Status.TotalSecond = this._Status.StepTotal - this._Status.StepCurrent
        this._Status.ZoneName = "Zone 1" // ToDo
        this._Status.ZoneStepTotal = 20 // ToDo
        this._Status.ZoneStepCurrent = 0
        this._Status.ZoneNumberTotal = lengthOfWorkerConfigList
        this._Status.ZoneNumberCurrent = 1
        let Io = this._MyApp.Io
        Io.emit("BuildWorkerStatusVue", this._Status)

        this._WorkerInterval = setInterval(this.UpdateWorkerStatus.bind(this), 1000)
        
    }

    UpdateWorkerStatus(){
        this._Status.StepCurrent++
        this._Status.TotalSecond--

        if (this._Status.StepCurrent > this._Status.StepTotal){
            this.StopWorker()
        } else {
            let Io = this._MyApp.Io
            Io.emit("BuildWorkerStatusVue", this._Status)
        }
    }

    StopWorker(){
        clearInterval(this._WorkerInterval)
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
    }

}
module.exports.Worker = Worker
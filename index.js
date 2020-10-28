class Aquagreen {
    constructor(Name = "AppName", Port = 4000, Debug = true, RpiGpioAdress = null, UseWorker = false){
        // Creation de l'application CoreX
        let corex = require('@gregvanko/corex').corex
        this._OptionApplication = {
            AppName: Name,
            Port: Port,
            Secret: "AquagreenAppSecret",
            MongoUrl: "mongodb://localhost:27017"
        }
        this._MyApp = new corex(this._OptionApplication)
        // Variable interne
        this._Debug = Debug
        this._RpiGpioAdress = RpiGpioAdress
        this._UseWorker = UseWorker

        let WorkerR = require('./Worker').Worker
        this._Worker = new WorkerR(this._MyApp, this._RpiGpioAdress, this._UseWorker)

        let FunctionClientPlayZoneR = require('./FunctionClientPlayZone').FunctionClientPlayZone
        this._FunctionClientPlayZone = new FunctionClientPlayZoneR(this._MyApp, this._RpiGpioAdress, this._Worker, this._UseWorker )

        let FunctionClientPlayerR = require('./FunctionClientPlayer').FunctionClientPlayer
        this._FunctionClientPlayer = new FunctionClientPlayerR(this._MyApp, this._RpiGpioAdress, this._Worker, this._UseWorker )

        let FunctionClientPlayProgramR = require('./FunctionClientPlayProgram').FunctionClientPlayProgram
        this._FunctionClientPlayProgram = new FunctionClientPlayProgramR(this._MyApp, this._RpiGpioAdress, this._Worker, this._UseWorker)

        let FunctionAdminGpioR = require('./FunctionAdminGpio').FunctionAdminGpio
        this._FunctionAdminGpio = new FunctionAdminGpioR(this._MyApp, this._RpiGpioAdress, this._Worker)

        let FunctionAdminPlayGpioR = require('./FunctionAdminPlayGpio').FunctionAdminPlayGpio
        this._FunctionAdminPlayGpio = new FunctionAdminPlayGpioR(this._MyApp, this._RpiGpioAdress, this._Worker, this._UseWorker)

        let FunctionAdminConfigR = require('./FunctionAdminConfig').FunctionAdminConfig
        this._FunctionAdminConfig = new FunctionAdminConfigR(this._MyApp, this._Worker)
    }

    /* Start de l'application */
    Start(){
        // Css de l'application CoreX
        const CSS= {
            FontSize:{
                TexteNomrale:"1.5vw",       //--TexteNomrale
                TexteIphone:"4.5vw",          //--TexteIphone
                TexteMax:"18px",            //--TexteMax
                TitreNormale:"4vw",         //--TitreNormale
                TitreIphone:"7vw",          //--TitreIphone
                TitreMax:"50px"             //--TitreMax
            },
            Color:{
                Normale:"rgb(20, 163, 255)" //--CoreX-color
            },
            AppContent:{
                WidthNormale:"96%",
                WidthIphone:"96%",
                WidthMax:"1100px"
            }
        }
        // Affichier les message de debug du serveur
        this._MyApp.Debug = this._Debug
        // L'application est elle securisee par un login
        this._MyApp.AppIsSecured = true
        // Css de base de l'application
        this._MyApp.CSS = CSS
        // L'application utilise SocketIo
        this._MyApp.Usesocketio = true
        // Chemin vers le dossier contenant les sources Js et CSS de l'app Client
        this._MyApp.ClientAppFolder = __dirname + "/Client"
        // Chemin vers le dossier contenant les sources Js et CSS de l'app Admin
        this._MyApp.AdminAppFolder = __dirname + "/Admin"
        // Chemin vers le dossier contenant les sources Js et CSS Commun
        this._MyApp.CommonAppFolder = __dirname + "/Common"
        // Chemin relatif de l'icone
        this._MyApp.IconRelPath = __dirname + "/apple-icon-192x192.png"
        // Api Worker
        this._MyApp.AddApiFct("Worker", this._Worker.ApiWork.bind(this._Worker), false)
        // Api Admin
        this._MyApp.AddApiFct("Gpio", this._FunctionAdminGpio.ApiGpio.bind(this._FunctionAdminGpio), true)
        this._MyApp.AddApiFct("Config", this._FunctionAdminConfig.ApiConfig.bind(this._FunctionAdminConfig), true)
        // SocketIo
        this._MyApp.AddSocketIoFct("PlayZone", this._FunctionClientPlayZone.ApiPlayZone.bind(this._FunctionClientPlayZone))
        this._MyApp.AddSocketIoFct("PlayProgram", this._FunctionClientPlayProgram.ApiPlayProgram.bind(this._FunctionClientPlayProgram))
        this._MyApp.AddSocketIoFct("Player", this._FunctionClientPlayer.ApiPlayer.bind(this._FunctionClientPlayer))
        this._MyApp.AddSocketIoFct("PlayGpio", this._FunctionAdminPlayGpio.ApiPlayGpio.bind(this._FunctionAdminPlayGpio), true)
        // Start App
        this._MyApp.Start()
        // Init de Aquagreen
        this.InitAquagreeg()
    }

    InitAquagreeg(){
        // Check if worker is connected for sending config
        if(this._UseWorker){
            let me = this
            const axios = require('axios')
            axios.post(this._RpiGpioAdress, {FctName:"ping", FctData:""}).then(res => {
                if (res.data.Error == false){
                    // If config exist, send config
                    let MongoR = require('@gregvanko/corex').Mongo
                    let Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
                    let MongoConfig = require("./MongoConfig.json")
                    let MongoConfigCollection = MongoConfig.ConfigCollection
                    const Querry = {[MongoConfigCollection.Key]: MongoConfigCollection.GpioConfigKey}
                    const Projection = { projection:{_id: 0, [MongoConfigCollection.Value]: 1}}
                    Mongo.FindPromise(Querry, Projection, MongoConfigCollection.Collection).then((reponse)=>{
                        if(reponse.length != 0){
                            let GpioConfig = reponse[0][MongoConfigCollection.Value]
                            if (this._RpiGpioAdress != null){
                                axios.post(this._RpiGpioAdress, {FctName:"setconfig", FctData:{config: GpioConfig}}).then(res => {
                                    if (res.data.Error){
                                        me._MyApp.LogAppliError("InitAquagreeg UpdateRpiGpio res error : " + res.data.ErrorMsg, "Server", "Server")
                                    } else {
                                        me._MyApp.LogAppliInfo("Config send to the worker", "Server", "Server")
                                    }
                                }).catch(error => {
                                    me._MyApp.LogAppliError("InitAquagreeg UpdateRpiGpio error : " + error, "Server", "Server")
                                })
                            }
                        }
                    },(erreur)=>{
                        me._MyApp.LogAppliError("InitAquagreeg GetConfig DB error : " + erreur, "Server", "Server")
                    })
                }
            }).catch(error => {
                me._MyApp.LogAppliError("InitAquagreeg ping Worker error : " + error, "Server", "Server")
            })
        } else {
            this._MyApp.LogAppliInfo("RpiGpio not used", "Server", "Server")
        }
    }
}

module.exports.Aquagreen = Aquagreen
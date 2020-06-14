class Aquagreen {
    constructor(Name = "AppName", Port = 4000, Debug = true, RpiGpioAdress = null){
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

        let WorkerR = require('./Worker').Worker
        this._Worker = new WorkerR(this._MyApp, this._RpiGpioAdress)

        let FunctionClientPlayZoneR = require('./FunctionClientPlayZone').FunctionClientPlayZone
        this._FunctionClientPlayZone = new FunctionClientPlayZoneR(this._MyApp, this._RpiGpioAdress, this._Worker)

        let FunctionAdminGpioR = require('./FunctionAdminGpio').FunctionAdminGpio
        this._FunctionAdminGpio = new FunctionAdminGpioR(this._MyApp, this._RpiGpioAdress, this._Worker)
    }

    /* Start de l'application */
    Start(){
        // Css de l'application CoreX
        const CSS= {
            FontSize:{
                TexteNomrale:"1.5vw",       //--CoreX-font-size
                TexteIphone:"4.5vw",          //--CoreX-Iphone-font-size
                TexteMax:"18px",            //--CoreX-Max-font-size
                TitreNormale:"4vw",         //--CoreX-Titrefont-size
                TitreIphone:"7vw",          //--CoreX-TitreIphone-font-size
                TitreMax:"50px"             //--CoreX-TitreMax-font-size
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
        // Chemin vers le dossier contenant les sources Js et CSS de l'app client
        this._MyApp.ClientAppFolder = __dirname + "/Client"
        // Chemin vers le dossier contenant les sources Js et CSS de l'app Admin
        this._MyApp.AdminAppFolder = __dirname + "/Admin"
        // Chemin relatif de l'icone
        this._MyApp.IconRelPath = __dirname + "/apple-icon-192x192.png"
        // Api Worker
        this._MyApp.AddApiFct("Worker", this._Worker.ApiWork.bind(this._Worker))
        // Api Admin
        this._MyApp.AddApiAdminFct("Gpio", this._FunctionAdminGpio.ApiGpio.bind(this._FunctionAdminGpio))
        // SocketIo
        this._MyApp.AddSocketIoFct("PlayZone", this._FunctionClientPlayZone.ApiPlayZone.bind(this._FunctionClientPlayZone))
        // Start App
        this._MyApp.Start()
        // Init de Aquagreen
        this.InitAquagreeg()
    }

    InitAquagreeg(){
        // Check if worker is connected for sending config
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
                                    me._MyApp.LogAppliInfo("InitAquagreeg UpdateRpiGpio res error : " + res.data.ErrorMsg)
                                } else {
                                    me._MyApp.LogAppliInfo("Config send to the worker")
                                }
                            }).catch(error => {
                                me._MyApp.LogAppliInfo("InitAquagreeg UpdateRpiGpio error : " + error)
                            })
                        }
                    }
                },(erreur)=>{
                    me._MyApp.LogAppliInfo("InitAquagreeg GetConfig DB error : " + erreur)
                })
            }
        }).catch(error => {
            me._MyApp.LogAppliInfo("InitAquagreeg ping Worker error : " + error)
        })
    }
}

module.exports.Aquagreen = Aquagreen
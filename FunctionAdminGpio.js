class FunctionAdminGpio{
    constructor(MyApp, RpiGpioAdress, Worker){
        this._MyApp = MyApp
        this._RpiGpioAdress = RpiGpioAdress
        this._Worker = Worker

        // Varaible interne
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        this._MongoConfigCollection = MongoConfig.ConfigCollection
        
    }

    /**
     * API de la page Admin GPIO
     * @param {Object} Data {Fct, Data} Object de parametre de l'API
     * @param {Res} Res Reponse à la requete de l'API
     * @param {String} UserId UserId de l'user qui a appeler l'API
     */
    ApiGpio(Data, Res, UserId){
        this._MyApp.LogAppliInfo("Call Admin ApiGpio + " + JSON.stringify(Data))
        switch (Data.Fct) {
            case "GetConfig":
                this._Worker.GetConfig(Res)
                break
            case "SetConfig":
                this.SetConfig(Data.Data, Res)
                break
            case "UpdateRpiGpio":
                this.UpdateRpiGpio(Res)
                break
            default:
                Res.json({Error: true, ErrorMsg: `ApiGpio error, fct ${Data.Fct} not found`, Data: null})
                break
        }
    }

    /**
     * Set la config des GPIO en DB
     * @param {Json} Data Configuration des GPIO
     * @param {Res} Res Reponse à la requete de l'API
     */
    SetConfig(Data,Res){
        let me = this
        // on vérifie si la configuration existe en DB
        const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.GpioConfigKey}
        const Projection = { projection:{_id: 1, [this._MongoConfigCollection.Value]: 1}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                // Creation de la config en DB
                let DataToMongo = { [this._MongoConfigCollection.Key]: this._MongoConfigCollection.GpioConfigKey, [this._MongoConfigCollection.Value]: Data}
                this._Mongo.InsertOnePromise(DataToMongo, this._MongoConfigCollection.Collection).then((reponseCreation)=>{
                    if (Res != null){Res.json({Error: false, ErrorMsg: null, Data: Data})}
                },(erreur)=>{
                    me._MyApp.LogAppliError("ApiGpio SetConfig Post DB error : " + erreur)
                    if (Res != null){Res.json({Error: true, ErrorMsg: "ApiGpio SetConfig Post DB error", Data: null})}
                })
            } else {
                // Update de la config en DB
                let DataToDb = new Object()
                DataToDb[this._MongoConfigCollection.Value]= Data
                let ConfigId = reponse[0]._id
                this._Mongo.UpdateByIdPromise(ConfigId, DataToDb, this._MongoConfigCollection.Collection).then((reponse)=>{
                    if (reponse.matchedCount == 0){
                        me._MyApp.LogAppliError("Update Gpio config error: Id config not found")
                        if (Res != null){Res.json({Error: true, ErrorMsg: "Update Gpio config error: Id config not found", Data: null})}
                    } else {
                        if (Res != null){Res.json({Error: false, ErrorMsg: null, Data: Data})}
                    }
                },(erreur)=>{
                    me._MyApp.LogAppliError("ApiGpio SetConfig DB error : " + erreur)
                    if (Res != null){Res.json({Error: true, ErrorMsg: "ApiGpio SetConfig DB error", Data: null})}
                })
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiGpio GetConfig DB error : " + erreur)
            if (Res != null){Res.json({Error: true, ErrorMsg: "ApiGpio GetConfig DB Error", Data: null})}
        })
    }

    /**
     * Update the GPIO to the worker
     * @param {Res} Res Reponse à la requete de l'API
     */
    UpdateRpiGpio(Res){
        // Get Gpio Config in DB
        let me = this
        const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.GpioConfigKey}
        const Projection = { projection:{_id: 0, [this._MongoConfigCollection.Value]: 1}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: true, ErrorMsg: "No configuration found in DB", Data: null})
            } else {
                let GpioConfig = reponse[0][this._MongoConfigCollection.Value]
                if (this._RpiGpioAdress != null){
                    const axios = require('axios')
                    axios.post(this._RpiGpioAdress, {FctName:"setconfig", FctData:{config: GpioConfig}}).then(res => {
                        if (res.data.Error){
                            me._MyApp.LogAppliError("ApiGpio UpdateRpiGpio res error : " + res.data.ErrorMsg)
                            Res.json({Error: true, ErrorMsg: res.data.ErrorMsg, Data: null})
                        } else {
                            Res.json({Error: false, ErrorMsg: null, Data: "Configuration updated to the worker"})
                        }
                    }).catch(error => {
                        me._MyApp.LogAppliError("ApiGpio UpdateRpiGpio error : " + error)
                        Res.json({Error: true, ErrorMsg: error.stack, Data: null})
                    })
                } else {
                    me._MyApp.LogAppliError("ApiGpio UpdateRpiGpio => RpiGpioAdress not defined")
                    Res.json({Error: true, ErrorMsg: "ApiGpio UpdateRpiGpio => RpiGpioAdress not defined", Data: null})
                }
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiGpio UpdateRpiGpio DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiGpio UpdateRpiGpio DB Error", Data: null})
        })
    }
}

module.exports.FunctionAdminGpio = FunctionAdminGpio
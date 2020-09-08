class FunctionAdminConfig{
    constructor(MyApp, Worker){
        this._MyApp = MyApp
        this._Worker = Worker

        // Varaible interne
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        this._MongoConfigCollection = MongoConfig.ConfigCollection
        
    }

    /**
     * API de la page Admin Config
     * @param {Object} Data {Fct, Data} Object de parametre de l'API
     * @param {Res} Res Reponse à la requete de l'API
     * @param {String} UserId UserId de l'user qui a appeler l'API
     */
    ApiConfig(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiAdmin Config Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Fct) {
            case "GetConfig":
                this._Worker.GetConfig(Res)
                break
            case "SetConfig":
                this.SetConfig(Data.Data, Res, User, UserId)
                break
            default:
                Res.json({Error: true, ErrorMsg: `ApiConfig error, Fct ${Data.Fct} not found`, Data: null})
                this._MyApp.LogAppliError(`ApiConfig error, Fct ${Data.Fct} not found`, User, UserId)
                break
        }
    }

    /**
     * Set la config des GPIO en DB
     * @param {Json} Data Configuration des GPIO
     * @param {Res} Res Reponse à la requete de l'API
     */
    SetConfig(Data, Res, User, UserId){
        let me = this
        // on vérifie si la configuration existe en DB
        const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.GpioConfigKey}
        const Projection = { projection:{_id: 1, [this._MongoConfigCollection.Value]: 1}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                // Error, config not found
                if (Res != null){Res.json({Error: true, ErrorMsg: "Config not found in DB", Data: null})}
                me._MyApp.LogAppliError("ApiConfig SetConfig error : DB Config not found in DB", User, UserId)
            } else {
                // Update de la config en DB
                let DataToDb = new Object()
                DataToDb[this._MongoConfigCollection.Value]= Data
                this._Mongo.UpdateByIdPromise(reponse[0]._id, DataToDb, this._MongoConfigCollection.Collection).then((reponse)=>{
                    if (reponse.matchedCount == 0){
                        me._MyApp.LogAppliError("Update config error: Id config not found", User, UserId)
                        if (Res != null){Res.json({Error: true, ErrorMsg: "Update config error: Id config not found", Data: null})}
                    } else {
                        if (Res != null){Res.json({Error: false, ErrorMsg: null, Data: Data})}
                    }
                },(erreur)=>{
                    me._MyApp.LogAppliError("ApiConfig SetConfig DB error : " + erreur, User, UserId)
                    if (Res != null){Res.json({Error: true, ErrorMsg: "ApiConfig SetConfig DB error", Data: null})}
                })
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiConfig SetConfig DB error : " + erreur, User, UserId)
            if (Res != null){Res.json({Error: true, ErrorMsg: "ApiConfig SetConfig DB Error", Data: null})}
        })
    }
}

module.exports.FunctionAdminConfig = FunctionAdminConfig
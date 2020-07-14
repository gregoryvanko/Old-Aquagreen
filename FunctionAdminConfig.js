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
    ApiConfig(Data, Res, UserId){
        this._MyApp.LogAppliInfo("Call Admin Config + " + JSON.stringify(Data))
        switch (Data.Fct) {
            case "GetConfig":
                this._Worker.GetConfig(Res)
                break
            default:
                Res.json({Error: true, ErrorMsg: `ApiConfig error, fct ${Data.Fct} not found`, Data: null})
                break
        }
    }
}

module.exports.FunctionAdminConfig = FunctionAdminConfig
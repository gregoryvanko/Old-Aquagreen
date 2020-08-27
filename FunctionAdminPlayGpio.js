class FunctionAdminPlayGpio{
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
    ApiPlayGpio(Data, Res, User, UserId){
        this._MyApp.LogAppliInfo("ApiAdmin PlayGpio Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Fct) {
            case "GetConfig":
                this._Worker.GetConfig(Res)
                break
            default:
                Res.json({Error: true, ErrorMsg: `ApiPlayGpio error, Fct ${Data.Fct} not found`, Data: null})
                this._MyApp.LogAppliError(`ApiPlayGpio error, Fct ${Data.Fct} not found`, User, UserId)
                break
        }
    }
}

module.exports.FunctionAdminPlayGpio = FunctionAdminPlayGpio
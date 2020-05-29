class FunctionClientPlayZone{
    constructor(MyApp, Worker){
        this._MyApp = MyApp
        this._Worker = Worker

        // Varaible interne MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
    }

    /**
     * API de la page Client PlayZone
     * @param {Object} Data {Fct, Data} Object de parametre de l'API
     * @param {Res} Res Reponse à la requete de l'API
     * @param {String} UserId UserId de l'user qui a appeler l'API
     */
    ApiPlayZone(Data, Res, UserId){
        this._MyApp.LogAppliInfo("Call Client ApiPlayZone + " + JSON.stringify(Data))
        switch (Data.Fct) {
            case "GetConfig":
                this._Worker.GetConfig(Res)
                break
            default:
                Res.json({Error: true, ErrorMsg: `ApiPlayZone error, fct ${Data.Fct} not found`, Data: null})
                break
        }
    }
    
}
module.exports.FunctionClientPlayZone = FunctionClientPlayZone
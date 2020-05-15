class FunctionClient{
    constructor(AppName, MongoUrl, MyApp, PinConfig= null){
        // Varaible interne MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(MongoUrl,AppName)
        this._MyApp = MyApp
        this._PinConfig = PinConfig
    }
    ApiWorker(Data, Res, UserId){
        this._MyApp.LogAppliInfo("Call ApiWorker + " + JSON.stringify(Data))
        if (Data.Fct == "ButtonPressed"){
            Res.json({Error: false, ErrorMsg: "Worker", Data: "Worker Started by: " + Data.Name})
        } else if(Data.Fct == "Ping"){
            Res.json({Error: false, ErrorMsg: "Worker", Data: "Pong"})
        } else if(Data.Fct == "GetConfig"){
            Res.json({Error: false, ErrorMsg: "Worker", Data: this._PinConfig})
        } else {
            Res.json({Error: true, ErrorMsg: "ApiWorker error, fct not found: " + Data.Fct, Data: null})
        }
    }
}

module.exports.FunctionClient = FunctionClient
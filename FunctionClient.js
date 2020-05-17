class FunctionClient{
    constructor(MyApp, PinConfig= null){
        this._MyApp = MyApp
        this._PinConfig = PinConfig
        // Varaible interne MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this.AppName = this._MyApp.AppName
        this.MongoUrl = this._MyApp.MongoUrl
        this._Mongo = new MongoR(this.MongoUrl ,this.AppName)
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
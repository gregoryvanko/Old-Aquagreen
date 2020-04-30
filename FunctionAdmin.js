class FunctionAdmin{
    constructor(AppName, MongoUrl, MyApp, PinIO){
        // Varaible interne MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(MongoUrl,AppName)
        this._MyApp = MyApp
        this._PinIO = PinIO
    }

    ApiPinIo(Data, Res, UserId){
        this._MyApp.LogAppliInfo("Call Admin ApiConfig + " + JSON.stringify(Data))
        if (Data.Fct == "GetConfig"){
            Res.json({Error: false, ErrorMsg: "Config PinIO", Data: this._PinIO})
        } else {
            Res.json({Error: true, ErrorMsg: "ApiConfig error, fct not found: " + Data.Fct, Data: null})
        }
    }
}

module.exports.FunctionAdmin = FunctionAdmin
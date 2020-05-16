class FunctionAdmin{
    constructor(AppName, MongoUrl, MyApp){
        // Varaible interne MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(MongoUrl,AppName)
        this._MyApp = MyApp
    }

    ApiGpio(Data, Res, UserId){
        this._MyApp.LogAppliInfo("Call Admin ApiGpio + " + JSON.stringify(Data))
        if (Data.Fct == "GetConfig"){
            // Todo
            Res.json({Error: false, ErrorMsg: null, Data: null})
        } else {
            Res.json({Error: true, ErrorMsg: `ApiGpio error, fct ${Data.Fct} not found`, Data: null})
        }
    }
}

module.exports.FunctionAdmin = FunctionAdmin
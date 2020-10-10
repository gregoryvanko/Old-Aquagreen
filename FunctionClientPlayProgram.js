class FunctionClientPlayProgram{
    constructor(MyApp){
        this._MyApp = MyApp

        // Varaible interne MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._MyApp.MongoUrl ,this._MyApp.AppName)
        let MongoConfig = require("./MongoConfig.json")
        this._MongoConfigCollection = MongoConfig.ConfigCollection
    }
    
    /**
     * socket API de la page Client PlayZone
     * @param {Object} Data {Action, Value} Object de parametre de l'API
     */
    ApiPlayProgram(Data, Socket, User, UserId){
        this._MyApp.LogAppliInfo("SoketIO ApiPlayProgram Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Action) {
            case "GetListOfProgram":
                this.GetListOfProgram(Socket, User, UserId)
                break
            default:
                this._MyApp.LogAppliError(`ApiPlayProgram error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("PlayProgramError", `ApiPlayProgram error, Action ${Data.Action} not found`)
                break
        }
    }

    GetListOfProgram(Socket, User, UserId){
        // Send ProgramConfig from DB
        let me = this
        const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.ProgramConfigKey}
        const Projection = { projection:{_id: 0, [this._MongoConfigCollection.Value]: 1}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                Socket.emit("PlayProgramListOfProgram", null)
            } else {
                Socket.emit("PlayProgramListOfProgram", reponse[0][this._MongoConfigCollection.Value])
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiPlayProgram GetConfig DB error : " + erreur, User, UserId)
            Socket.emit("PlayProgramError", "ApiPlayProgram GetConfig DB Error")
        })
    }

}
module.exports.FunctionClientPlayProgram = FunctionClientPlayProgram
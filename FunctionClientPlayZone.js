class FunctionClientPlayZone{
    constructor(MyApp, RpiGpioAdress, Worker, UseWorker){
        this._MyApp = MyApp
        this._RpiGpioAdress = RpiGpioAdress
        this._Worker = Worker
        this._UseWorker = UseWorker // aide pour debug si le worker n'est pas present

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
    ApiPlayZone(Data, Socket, User, UserId){
        this._MyApp.LogAppliInfo("SoketIO ApiPlayZone Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Action) {
            case "Start":
                this.CommandeStartClientVue(Socket, User, UserId)
                break
            case "PlayWorker":
                this._Worker.StartWorking(Data.Value, User, UserId)
                Socket.emit("BuildPlayerVue", this._Worker.Status)
                break
            default:
                this._MyApp.LogAppliError(`ApiPlayZone error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("PlayZoneError", `ApiPlayZone error, Action ${Data.Action} not found`)
                break
        }
    }

    /**
     * Commande recue du client lorsque il ouvre la vue Play Zone
     * @param {SocketIo} Socket Client socket
     */
    CommandeStartClientVue(Socket, User, UserId){
        if (this._UseWorker){
            // On ping le worker pour vérifier sa présence
            let me = this
            const axios = require('axios')
            axios.post(this._RpiGpioAdress, {FctName:"ping", FctData:""}).then(res => {
                if (res.data.Error){
                    me._MyApp.LogAppliError("CommandeStartClientVue ping res error : " + res.data.ErrorMsg, User, UserId)
                    Socket.emit("PlayZoneError", "Worker ping error: " + res.data.ErrorMsg)
                } else {
                    this.StartClientVue(Socket, User, UserId)
                }
            }).catch(error => {
                me._MyApp.LogAppliError("CommandeStartClientVue ping Worker error : " + error, User, UserId)
                Socket.emit("PlayZoneError", "Worker not connected")
            })
        } else {
            this.StartClientVue(Socket, User, UserId)
        }
        
    }

    /**
     * Start du choix de la vue client
     * @param {SocketIo} Socket Client socket
     */
    StartClientVue(Socket, User, UserId){
        if(this._Worker.Status.IsRunning){
            Socket.emit("BuildPlayerVue", this._Worker.Status)
        } else {
            // Send Gpio Config from DB
            let me = this
            const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.GpioConfigKey}
            const Projection = { projection:{_id: 0, [this._MongoConfigCollection.Value]: 1}}
            this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
                if(reponse.length == 0){
                    Socket.emit("BuildPlayZoneVue", null)
                } else {
                    Socket.emit("BuildPlayZoneVue", reponse[0][this._MongoConfigCollection.Value])
                }
            },(erreur)=>{
                me._MyApp.LogAppliError("CommandeStartClientVue GetConfig DB error : " + erreur, User, UserId)
                Socket.emit("PlayZoneError", "CommandeStartClientVue GetConfig DB Error")
            })
        }
    }
    
}
module.exports.FunctionClientPlayZone = FunctionClientPlayZone
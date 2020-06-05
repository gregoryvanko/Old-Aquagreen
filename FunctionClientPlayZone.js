class FunctionClientPlayZone{
    constructor(MyApp, Worker){
        this._MyApp = MyApp
        this._Worker = Worker

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
    ApiPlayZone(Data, Socket){
        this._MyApp.LogAppliInfo("Call SoketIO ApiPlayZone + " + JSON.stringify(Data))
        switch (Data.Action) {
            case "Start":
                this.CommandeStartClientVue(Socket)
                break
            case "PlayWorker":
                this.CommandeStartWorker(Data.Value)
                break
            default:
                this._MyApp.LogAppliInfo(`ApiPlayZone error, Action ${Data.Action} not found`)
                Socket.emit("Error", `ApiPlayZone error, Action ${Data.Action} not found`)
                break
        }
    }

    /**
     * Commande recue du client lorsque il ouvre la vue Play Zone
     * @param {SocketIo} Socket Client socket
     */
    CommandeStartClientVue(Socket){
        if(this._Worker.Status.IsRunning){
            Socket.emit("BuildWorkerStatusVue", this._Worker.Status)
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
                me._MyApp.LogAppliError("ApiWork GetConfig DB error : " + erreur)
                Socket.emit("Error", "StartClientVue GetConfig DB Error")
            })
        }
    }

    /**
     * Commande recue du client lorsqu'il veux activer une Zone pendant un Delay
     * @param {Object} WorkerConfigList Liste des object de configuration du worker
     */
    CommandeStartWorker(WorkerConfigList){
        this._Worker.StartWorking(WorkerConfigList)
    }
    
}
module.exports.FunctionClientPlayZone = FunctionClientPlayZone
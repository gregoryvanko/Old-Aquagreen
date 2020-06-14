class FunctionClientPlayZone{
    constructor(MyApp, RpiGpioAdress, Worker){
        this._MyApp = MyApp
        this._RpiGpioAdress = RpiGpioAdress
        this._Worker = Worker

        this._UseWorker = false // aide pour debugger si le worker n'est pas present

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
            case "ActionWorker":
                this.CommandeActionWorker(Data.Value, Socket)
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
        if (this._UseWorker){
            // On ping le worker pour vérifier sa présence
            let me = this
            const axios = require('axios')
            axios.post(this._RpiGpioAdress, {FctName:"ping", FctData:""}).then(res => {
                if (res.data.Error){
                    me._MyApp.LogAppliError("CommandeStartClientVue ping res error : " + res.data.ErrorMsg)
                    Socket.emit("Error", "Worker ping error: " + res.data.ErrorMsg)
                } else {
                    this.StartClientVue(Socket)
                }
            }).catch(error => {
                me._MyApp.LogAppliError("CommandeStartClientVue ping Worker error : " + error)
                Socket.emit("Error", "Worker not connected")
            })
        } else {
            this.StartClientVue(Socket)
        }
        
    }

    /**
     * Start du choix de la vue client
     * @param {SocketIo} Socket Client socket
     */
    StartClientVue(Socket){
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
                me._MyApp.LogAppliError("CommandeStartClientVue GetConfig DB error : " + erreur)
                Socket.emit("Error", "CommandeStartClientVue GetConfig DB Error")
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

    /**
     * Reception de la commande (play, pause, stop) d'un worker
     * @param {String} Action Action recue du worker (play, pause, stop)
     * @param {Socket} Socket Socket qui a emit l'action
     */
    CommandeActionWorker(Action, Socket){
        switch (Action) {
            case "Play":
                this._Worker.CommandePlay()
                break
            case "Pause":
                this._Worker.CommandePause()
                break
            case "Stop":
                this._Worker.CommandeStop()
                break
            default:
                this._MyApp.LogAppliInfo(`CommandeActionWorker error, Action ${Action} not found`)
                Socket.emit("Error", `CommandeActionWorker error, Action ${Action} not found`)
                break
        }
    }
    
}
module.exports.FunctionClientPlayZone = FunctionClientPlayZone
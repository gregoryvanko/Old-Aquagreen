class FunctionAdminPlayGpio{
    constructor(MyApp, RpiGpioAdress, Worker, UseWorker){
        this._MyApp = MyApp
        this._RpiGpioAdress = RpiGpioAdress
        this._Worker = Worker
        this._UseWorker = UseWorker // aide pour debugger si le worker n'est pas present

        // Varaible interne MongoDB
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
    ApiPlayGpio(Data, Socket, User, UserId){
        this._MyApp.LogAppliInfo("SoketIO PlayGpio Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Action) {
            case "Start":
                this.CommandeStartClientVue(Socket, User, UserId)
                break
            case "PlayWorker":
                this._Worker.StartWorking(Data.Value, User, UserId)
                Socket.emit("BuildPlayerVue", this._Worker.Status)
                break
            default:
                this._MyApp.LogAppliError(`ApiPlayGpio error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("PlayGpioError", `ApiPlayGpio error, Action ${Data.Action} not found`)
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
                    Socket.emit("PlayGpioError", "Worker ping error: " + res.data.ErrorMsg)
                } else {
                    this.StartClientVue(Socket)
                }
            }).catch(error => {
                me._MyApp.LogAppliError("CommandeStartClientVue ping Worker error : " + error, User, UserId)
                Socket.emit("PlayGpioError", "Worker not connected")
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
            this._MyApp.LogAppliInfo("SoketIO emit BuildPlayerVue", User, UserId)
            Socket.emit("BuildPlayerVue", this._Worker.Status)
        } else {
            // Send Gpio Config from DB
            let me = this
            const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.GpioConfigKey}
            const Projection = { projection:{_id: 0, [this._MongoConfigCollection.Value]: 1}}
            this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
                if(reponse.length == 0){
                    Socket.emit("BuildPlayGpioVue", null)
                } else {
                    Socket.emit("BuildPlayGpioVue", reponse[0][this._MongoConfigCollection.Value])
                }
                me._MyApp.LogAppliInfo("SoketIO emit BuildPlayGpioVue", User, UserId)
            },(erreur)=>{
                me._MyApp.LogAppliError("StartClientVue GetConfig DB error : " + erreur, User, UserId)
                Socket.emit("PlayGpioError", "StartClientVue GetConfig DB Error")
            })
        }
    }
}

module.exports.FunctionAdminPlayGpio = FunctionAdminPlayGpio
class FunctionClientPlayProgram{
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
     * socket API de la page Client PlayZone
     * @param {Object} Data {Action, Value} Object de parametre de l'API
     */
    ApiPlayProgram(Data, Socket, User, UserId){
        this._MyApp.LogAppliInfo("SoketIO ApiPlayProgram Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Action) {
            case "StartClientVue":
                this.StartClientVue(Socket, User, UserId)
                break
            case "PlayWorker":
                this.StartWorker(Socket, Data.Value, User, UserId)
                break
            default:
                this._MyApp.LogAppliError(`ApiPlayProgram error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("PlayProgramError", `ApiPlayProgram error, Action ${Data.Action} not found`)
                break
        }
    }

    // Send ProgramConfig and GPIO config from DB
    StartClientVue(Socket, User, UserId){

        if (this._UseWorker){
            // On ping le worker pour vérifier sa présence
            let me = this
            const axios = require('axios')
            axios.post(this._RpiGpioAdress, {FctName:"ping", FctData:""}).then(res => {
                if (res.data.Error){
                    me._MyApp.LogAppliError("CommandeStartClientVue ping res error : " + res.data.ErrorMsg, User, UserId)
                    Socket.emit("PlayProgramError", "Worker ping error: " + res.data.ErrorMsg)
                } else {
                    this.StartClientVue(Socket, User, UserId)
                }
            }).catch(error => {
                me._MyApp.LogAppliError("CommandeStartClientVue ping Worker error : " + error, User, UserId)
                Socket.emit("PlayProgramError", "Worker not connected")
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
            Socket.emit("PlayProgramBuildPlayerVue", this._Worker.Status)
        } else {
            let TheReponse = new Object()
            TheReponse.GpioConfig = null
            TheReponse.ProgramList = null

            let me = this
            const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.GpioConfigKey}
            const Projection = { projection:{_id: 0, [this._MongoConfigCollection.Value]: 1}}
            this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
                if(reponse.length == 0){
                    Socket.emit("PlayProgramError", "No Gpio Config defined in DB")
                } else {
                    // filtrer GpioConfig pour ne prendre que les relais ayant des custom data non null
                    let GpioConfig = reponse[0][this._MongoConfigCollection.Value]
                    let RelaisConfig = []
                    GpioConfig.forEach(element => {
                        if(element.type == "Relais"){
                            if(element.custom != null){
                                RelaisConfig.push(element)
                            }
                        }
                    });
                    if (RelaisConfig.length == 0){
                        Socket.emit("PlayProgramError", "No RelaisConfig defined in DB")
                    } else {
                        TheReponse.GpioConfig = RelaisConfig
                        const Querry1 = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.ProgramConfigKey}
                        const Projection1 = { projection:{_id: 0, [this._MongoConfigCollection.Value]: 1}}
                        this._Mongo.FindPromise(Querry1, Projection1, this._MongoConfigCollection.Collection).then((reponse1)=>{
                            if(reponse1.length == 0){
                                Socket.emit("PlayProgramAllConfig", TheReponse)
                            } else {
                                TheReponse.ProgramList = reponse1[0][this._MongoConfigCollection.Value]
                                Socket.emit("PlayProgramAllConfig", TheReponse)
                            }
                        },(erreur)=>{
                            me._MyApp.LogAppliError("ApiPlayProgram GetConfig DB error : " + erreur, User, UserId)
                            Socket.emit("PlayProgramError", "ApiPlayProgram GetConfig DB Error")
                        })
                    }
                }
            },(erreur)=>{
                me._MyApp.LogAppliError("ApiPlayProgram GetConfig GetGpioConfig DB error : " + erreur, User, UserId)
                Socket.emit("PlayProgramError", "ApiPlayProgram GetConfig DB Error")
            })
        }
    }

    // Start worker
    StartWorker(Socket, Data, User, UserId){
        this._Worker.StartWorking(Data, User, UserId)
        Socket.emit("PlayProgramBuildPlayerVue", this._Worker.Status)
    }
}
module.exports.FunctionClientPlayProgram = FunctionClientPlayProgram
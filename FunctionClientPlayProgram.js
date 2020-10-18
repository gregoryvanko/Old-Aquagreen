class FunctionClientPlayProgram{
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
    ApiPlayProgram(Data, Socket, User, UserId){
        this._MyApp.LogAppliInfo("SoketIO ApiPlayProgram Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Action) {
            case "StartClientVue":
                this.StartClientVue(Socket, User, UserId)
                break
            case "SaveListOfProgram":
                this.SaveListOfProgram(Socket, Data.Value, User, UserId)
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
                    this.Start(Socket, User, UserId)
                }
            }).catch(error => {
                me._MyApp.LogAppliError("CommandeStartClientVue ping Worker error : " + error, User, UserId)
                Socket.emit("PlayProgramError", "Worker not connected")
            })
        } else {
            this.Start(Socket, User, UserId)
        }
    }

    /**
     * Start du client
     * @param {SocketIo} Socket Client socket
     */
    Start(Socket, User, UserId){
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

    // Save List of program
    SaveListOfProgram(Socket, Data, User, UserId){
        let me = this
        // on vérifie si la configuration existe en DB
        const Querry = {[this._MongoConfigCollection.Key]: this._MongoConfigCollection.ProgramConfigKey}
        const Projection = { projection:{_id: 1, [this._MongoConfigCollection.Value]: 1}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoConfigCollection.Collection).then((reponse)=>{
            if(reponse.length == 0){
                // Creation de la config en DB
                let DataToMongo = { [this._MongoConfigCollection.Key]: this._MongoConfigCollection.ProgramConfigKey, [this._MongoConfigCollection.Value]: Data}
                this._Mongo.InsertOnePromise(DataToMongo, this._MongoConfigCollection.Collection).then((reponseCreation)=>{
                    // Rien a faire si on a fait un creation de la config
                },(erreur)=>{
                    me._MyApp.LogAppliError("ApiPlayProgram SaveListOfProgram SetConfig DB error : " + erreur, User, UserId)
                    Socket.emit("PlayProgramError", "ApiPlayProgram SaveListOfProgram SetConfig DB Error")
                })
            } else {
                // Update de la config en DB
                let DataToDb = new Object()
                DataToDb[this._MongoConfigCollection.Value]= Data
                let ConfigId = reponse[0]._id
                this._Mongo.UpdateByIdPromise(ConfigId, DataToDb, this._MongoConfigCollection.Collection).then((reponse)=>{
                    if (reponse.matchedCount == 0){
                        me._MyApp.LogAppliError("ApiPlayProgram Update config error: Id config not found", User, UserId)
                        Socket.emit("PlayProgramError", "ApiPlayProgram Update config error: Id config not found")
                    } else {
                        // Rien a faire si on a fait l'update
                    }
                },(erreur)=>{
                    me._MyApp.LogAppliError("ApiPlayProgram SaveListOfProgram DB error : " + erreur, User, UserId)
                    Socket.emit("PlayProgramError", "ApiPlayProgram SaveListOfProgram DB Error")
                })
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiPlayProgram SaveListOfProgram DB error : " + erreur, User, UserId)
            Socket.emit("PlayProgramError", "ApiPlayProgram SaveListOfProgram DB Error")
        })
    }
}
module.exports.FunctionClientPlayProgram = FunctionClientPlayProgram
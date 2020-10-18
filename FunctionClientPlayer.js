class FunctionClientPlayer{
    constructor(MyApp, RpiGpioAdress, Worker, UseWorker){
        this._MyApp = MyApp
        this._RpiGpioAdress = RpiGpioAdress
        this._Worker = Worker
        this._UseWorker = UseWorker // aide pour debug si le worker n'est pas present
    }

    /**
     * socket API de la page Client Player
     * @param {Object} Data {Action, Value} Object de parametre de l'API
     */
    ApiPlayer(Data, Socket, User, UserId){
        this._MyApp.LogAppliInfo("SoketIO ApiPlayer Data:" + JSON.stringify(Data), User, UserId)
        switch (Data.Action) {
            case "Action":
                this.CommandeAction(Data.Value, Socket, User, UserId)
                break
            default:
                this._MyApp.LogAppliError(`ApiPlayer error, Action ${Data.Action} not found`, User, UserId)
                Socket.emit("PlayerError", `ApiPlayer error, Action ${Data.Action} not found`)
                break
        }
    }

    /**
     * Reception de la commande (play, pause, stop) d'un player
     * @param {String} Action Action recue du Player (play, pause, stop)
     * @param {Socket} Socket Socket qui a emit l'action
     */
    CommandeAction(Action, Socket, User, UserId){
        switch (Action) {
            case "Play":
                this._Worker.CommandePlay(User, UserId)
                break
            case "Pause":
                this._Worker.CommandePause(User, UserId)
                break
            case "Stop":
                this._Worker.CommandeStop(User, UserId)
                break
            default:
                this._MyApp.LogAppliError(`CommandeActionWorker error, Action ${Action} not found`, User, UserId)
                Socket.emit("PlayerError", `CommandeActionWorker error, Action ${Action} not found`)
                break
        }
    }
}
module.exports.FunctionClientPlayer = FunctionClientPlayer
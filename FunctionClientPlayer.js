class FunctionClientPlayer{
    constructor(MyApp, RpiGpioAdress, Worker, UseWorker){
        this._MyApp = MyApp
        this._RpiGpioAdress = RpiGpioAdress
        this._Worker = Worker
        this._UseWorker = UseWorker // aide pour debugger si le worker n'est pas present
    }

    /**
     * socket API de la page Client Player
     * @param {Object} Data {Action, Value} Object de parametre de l'API
     */
    ApiPlayer(Data, Socket){
        this._MyApp.LogAppliInfo("Call SoketIO ApiPlayer + " + JSON.stringify(Data))
        switch (Data.Action) {
            case "Action":
                this.CommandeAction(Data.Value, Socket)
                break
            default:
                this._MyApp.LogAppliInfo(`ApiPlayer error, Action ${Data.Action} not found`)
                Socket.emit("PlayerError", `ApiPlayer error, Action ${Data.Action} not found`)
                break
        }
    }

    /**
     * Reception de la commande (play, pause, stop) d'un player
     * @param {String} Action Action recue du Player (play, pause, stop)
     * @param {Socket} Socket Socket qui a emit l'action
     */
    CommandeAction(Action, Socket){
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
                Socket.emit("PlayerError", `CommandeActionWorker error, Action ${Action} not found`)
                break
        }
    }
}
module.exports.FunctionClientPlayer = FunctionClientPlayer
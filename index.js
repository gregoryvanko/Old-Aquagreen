class Aquagreen {
    constructor(Name = "AppName", Port = 4000, Debug = true){
        // Creation de l'application CoreX
        let corex = require('@gregvanko/corex').corex
        this._OptionApplication = {
            AppName: Name,
            Port: Port,
            Secret: "AquagreenAppSecret",
            MongoUrl: "mongodb://localhost:27017"
        }
        this._MyApp = new corex(this._OptionApplication)
        // Variable interne
        this._Debug = Debug

        let FunctionClientR = require('./FunctionClient').FunctionClient
        this._FunctionClient = new FunctionClientR(this._MyApp)

        let FunctionAdminGpioR = require('./FunctionAdminGpio').FunctionAdminGpio
        this._FunctionAdminGpio = new FunctionAdminGpioR(this._MyApp)
    }

    /* Start de l'application */
    Start(){
        // Css de l'application CoreX
        const CSS= {
            FontSize:{
                TexteNomrale:"1.5vw",       //--CoreX-font-size
                TexteIphone:"3vw",          //--CoreX-Iphone-font-size
                TexteMax:"18px",            //--CoreX-Max-font-size
                TitreNormale:"4vw",         //--CoreX-Titrefont-size
                TitreIphone:"7vw",          //--CoreX-TitreIphone-font-size
                TitreMax:"50px"             //--CoreX-TitreMax-font-size
            },
            Color:{
                Normale:"rgb(20, 163, 255)" //--CoreX-color
            },
            AppContent:{
                WidthNormale:"96%",
                WidthIphone:"96%",
                WidthMax:"1100px"
            }
        }
        // Affichier les message de debug du serveur
        this._MyApp.Debug = this._Debug
        // L'application est elle securisee par un login
        this._MyApp.AppIsSecured = true
        // Css de base de l'application
        this._MyApp.CSS = CSS
        // L'application utilise SocketIo
        this._MyApp.Usesocketio = false
        // Chemin vers le dossier contenant les sources Js et CSS de l'app client
        this._MyApp.ClientAppFolder = __dirname + "/Client"
        // Chemin vers le dossier contenant les sources Js et CSS de l'app Admin
        this._MyApp.AdminAppFolder = __dirname + "/Admin"
        // Chemin relatif de l'icone
        this._MyApp.IconRelPath = __dirname + "/apple-icon-192x192.png"
        // Api Client
        this._MyApp.AddApiFct("Worker", this._FunctionClient.ApiWorker.bind(this._FunctionClient))
        // Api Admin
        this._MyApp.AddApiAdminFct("Gpio", this._FunctionAdminGpio.ApiGpio.bind(this._FunctionAdminGpio))
        // Start App
        this._MyApp.Start()
    }
}

module.exports.Aquagreen = Aquagreen
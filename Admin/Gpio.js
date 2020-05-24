class Gpio{
    constructor(HtmlId){
        this._DivApp = document.getElementById(HtmlId)

        this._ConfigGpio = null
    }
    /**
     * Start de l'application
     */
    BuildViewConfigGpio(){
        // Clear view
        this.ClearView()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("GPIO configuration", "", "Titre", ""))
        // Conteneur
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // on construit le texte d'info
        this._DivApp.appendChild(CoreXBuild.DivTexte("Get GPIO Configuration...","TxtGpio","Text","text-align: center;"))
        // on construit le texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorGpio","Text","color:red; text-align: center;"))
        // On laisse un blanc avant la fin de la page
        this._DivApp.appendChild(CoreXBuild.Div("","","margin-bottom: 2%;"))
        // Call API Get Config
        let ApiData = new Object()
        ApiData.Fct = "GetConfig"
        ApiData.Data = ""
        GlobalCallApiPromise("Gpio", ApiData, "", "").then((reponse)=>{
            document.getElementById("TxtGpio").innerHTML = ""
            document.getElementById("ErrorGpio").innerHTML = ""
            this._ConfigGpio = reponse
            this.ViewConfigGpio()
        },(erreur)=>{
            document.getElementById("TxtGpio").innerHTML = ""
            document.getElementById("ErrorGpio").innerHTML = erreur
        })
    }
    
    /**
     * Clear view 
     */
    ClearView(){
        // Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.BuildViewConfigGpio.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
    }

    /**
     * Construction de la vue qui liste la config GPIO
     * @param {HtmlElement} Conteneur Html element du conteneur de l'application
     * @param {Array} ConfigGpio Liste de la configuration des GPIO
     */
    ViewConfigGpio(){
        let Conteneur = document.getElementById("Conteneur")
        // Vider le conteneur
        Conteneur.innerHTML = ""
        // affichier le header du tableau Number - Type - Name - Param
        let BoxTitre = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(BoxTitre)
        BoxTitre.appendChild(CoreXBuild.DivTexte("Number","","TextBoxTitre", "width: 20%;color: var(--CoreX-color);"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Type","","TextBoxTitre", "width: 25%;color: var(--CoreX-color);"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 25%;color: var(--CoreX-color);"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Param","","TextBoxTitre", "width: 30%;color: var(--CoreX-color);"))
        // Ajout d'une ligne
        Conteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
        // Ajout de la configuration
        if (this._ConfigGpio == null){
            Conteneur.appendChild(CoreXBuild.DivTexte("No Configuration saved","","Text",""))
        } else {
            this.BuildListOfConfigData()
        }
        // Action Button
        let DivContentButton = CoreXBuild.DivFlexRowAr("DivContentButton")
        Conteneur.appendChild(DivContentButton)
        DivContentButton.appendChild(CoreXBuild.Button("Add Relay", this.BuildViewAddRelayConfigGpio.bind(this),"Button"))
        DivContentButton.appendChild(CoreXBuild.Button("Add Button", this.BuildViewAddButtonConfigGpio.bind(this),"Button"))
    }

    /**
     * Construit le tableau contenant la liste des config GPIO
     */
    BuildListOfConfigData(){
        this._ConfigGpio.forEach(element => {
            // ToDo
        })
    }

    /**
     * Construction de la vue qui permet d'ajouter un Relay
     */
    BuildViewAddRelayConfigGpio(){
        this.ClearView()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Add Relay", "", "Titre", ""))
        // Conteneur
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // on ajoute la vue de la configuration des relais
        this.RelayConfigGpio(Conteneur)
        // on construit le texte d'info
        this._DivApp.appendChild(CoreXBuild.DivTexte("","TxtRelayConfig","Text","text-align: center;"))
        // on construit le texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorRelayConfig","Text","color:red; text-align: center;"))
        // Action Button
        let DivContentButton = CoreXBuild.DivFlexRowAr("DivContentButton")
        Conteneur.appendChild(DivContentButton)
        DivContentButton.appendChild(CoreXBuild.Button("Add Relay", this.AddRelay.bind(this),"Button"))
        DivContentButton.appendChild(CoreXBuild.Button("Cancel", this.BuildViewConfigGpio.bind(this),"Button"))
        // On laisse un blanc avant la fin de la page
        this._DivApp.appendChild(CoreXBuild.Div("","","margin-bottom: 2%;"))
    }

    /**
     * Construction de la vue de configuration d'un relay
     * @param {HtmlElement} Conteneur Conteneur de la config d'un relay
     */
    RelayConfigGpio(Conteneur){
        // Gpio Number
        let DivSelectNumber = CoreXBuild.DivFlexRowStart("")
        Conteneur.appendChild(DivSelectNumber)
        DivSelectNumber.appendChild(CoreXBuild.DivTexte("Gpio number : ","","Text InputText",""))
        let InputNumber = CoreXBuild.Input("GpioNumber","","Input WidthSmall","","text","GpioNumber","Set GPIO Number")
        DivSelectNumber.appendChild(InputNumber)
        // Relay name
        let DivSelectName = CoreXBuild.DivFlexRowStart("")
        Conteneur.appendChild(DivSelectName)
        DivSelectName.appendChild(CoreXBuild.DivTexte("Relay name : ","","Text InputText",""))
        let InputName = CoreXBuild.Input("Name","","Input WidthSmall","","text","Name","Set Relay Name")
        DivSelectName.appendChild(InputName)
        // Relay Status
        let DivSelectStatus = CoreXBuild.DivFlexRowStart("")
        Conteneur.appendChild(DivSelectStatus)
        DivSelectStatus.appendChild(CoreXBuild.DivTexte("Relay Status : ","","Text InputText",""))
        let DropDownStatus = document.createElement("select")
        DropDownStatus.setAttribute("id", "Status")
        DropDownStatus.setAttribute("class", "Text DorpDown WidthSmall")
        let optionStatus1 = document.createElement("option")
        optionStatus1.setAttribute("value", "in")
        optionStatus1.innerHTML = "In"
        DropDownStatus.appendChild(optionStatus1)
        let optionStatus2 = document.createElement("option")
        optionStatus2.setAttribute("value", "high")
        optionStatus2.innerHTML = "High"
        DropDownStatus.appendChild(optionStatus2)
        let optionStatus3 = document.createElement("option")
        optionStatus3.setAttribute("value", "low")
        optionStatus3.innerHTML = "Low"
        DropDownStatus.appendChild(optionStatus3)
        DivSelectStatus.appendChild(DropDownStatus)
        // Relay ActiveLow
        let DivSelectActiveLow = CoreXBuild.DivFlexRowStart("")
        Conteneur.appendChild(DivSelectActiveLow)
        DivSelectActiveLow.appendChild(CoreXBuild.DivTexte("Relay ActiveLow : ","","Text InputText",""))
        let DropDownActiveLow = document.createElement("select")
        DropDownActiveLow.setAttribute("id", "ActiveLow")
        DropDownActiveLow.setAttribute("class", "Text DorpDown WidthSmall")
        let optionActiveLow1 = document.createElement("option")
        optionActiveLow1.setAttribute("value", "True")
        optionActiveLow1.innerHTML = "True"
        DropDownActiveLow.appendChild(optionActiveLow1)
        let optionActiveLow2 = document.createElement("option")
        optionActiveLow2.setAttribute("value", "False")
        optionActiveLow2.innerHTML = "False"
        DropDownActiveLow.appendChild(optionActiveLow2)
        DivSelectActiveLow.appendChild(DropDownActiveLow)
        // Relay TimeOut
        let DivSelectTimeOut = CoreXBuild.DivFlexRowStart("")
        Conteneur.appendChild(DivSelectTimeOut)
        DivSelectTimeOut.appendChild(CoreXBuild.DivTexte("Relay TimeOut : ","","Text InputText",""))
        let InputTimeOut = CoreXBuild.Input("TimeOut","","Input WidthSmall","","text","TimeOut","Set Relay TimeOut")
        DivSelectTimeOut.appendChild(InputTimeOut)
    }

    /**
     * Add Relay
     */
    AddRelay(){
        let ErrorMsg = ""
        // Copier toutesles valeurs
        let GpioNumber = document.getElementById("GpioNumber").value
        let Name = document.getElementById("Name").value
        let Status = document.getElementById("Status").value
        let ActiveLow = document.getElementById("ActiveLow").value
        let TimeOut = document.getElementById("TimeOut").value

        // vérifier si le GPIO a un number
        if (GpioNumber == ""){ErrorMsg += "Gpio Number must be fill. "}
        // Verifier si le GPIO number est deja utilisé
        if(this._ConfigGpio != null){
            var found = this._ConfigGpio.find((element) => { return element.pin == GpioNumber })
            if (found){ErrorMsg += "Gpio Number reseved in configuration. "}

        }
        // Vérifier si le GPIO number est un entier
        if (!Number.isInteger(Number(GpioNumber))){ErrorMsg += "Gpio Number must be a interger. "}
        // vérifier si le Relay a un nom
        if (Name == ""){ErrorMsg += "Relay Name must be fill. "}
        // vérifier si le Relay a un TimeOut
        if (TimeOut == ""){ErrorMsg += "Relay TimeOut must be fill. "}
        // Vérifier si le Relay TimeOut est un entier
        if (!Number.isInteger(Number(TimeOut))){ErrorMsg += "Gpio TimeOut must be a interger. "}

        // Si il y a des erreur => afficher les erreur
        if(ErrorMsg != ""){
            document.getElementById("ErrorRelayConfig").innerHTML = ErrorMsg
        } else {
            document.getElementById("ErrorRelayConfig").innerHTML = ""
            // Creation de l'objet config relay
            let ConfigRelay = new Object()
            ConfigRelay.pin = GpioNumber
            ConfigRelay.type = "Relais"
            ConfigRelay.name = Name
            ConfigRelay.status = Status
            ConfigRelay.activeLow = ActiveLow
            ConfigRelay.TimeOut = TimeOut
            if (this._ConfigGpio == null) {this._ConfigGpio = new Array()}
            this._ConfigGpio.push(ConfigRelay)
             // Call API Set Config
            let ApiData = new Object()
            ApiData.Fct = "SetConfig"
            ApiData.Data = this._ConfigGpio
            GlobalCallApiPromise("Gpio", ApiData, "", "").then((reponse)=>{
                document.getElementById("TxtRelayConfig").innerHTML = ""
                document.getElementById("ErrorRelayConfig").innerHTML = ""
                this._ConfigGpio = reponse
                this.ViewConfigGpio()
            },(erreur)=>{
                document.getElementById("TxtRelayConfig").innerHTML = ""
                document.getElementById("ErrorRelayConfig").innerHTML = erreur
            })
        }
    }

    /**
     * Construit la vue qui permet d'ajouter un Relay
     */
    BuildViewAddButtonConfigGpio(){
        // ToDo
        alert("ToDo")
    }

    /**
     * Construit la vue de configuration d'un button
     * @param {HtmlElement} Conteneur Conteneur de la config d'un button
     */
    ButtonConfigGpio(Conteneur){
         // ToDo
         alert("ToDo")
    }

    /** Get Titre de l'application */
    GetTitre(){
        return "GPIO"
    }
    /** Get Img Src de l'application */
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDc4LjcwMyA0NzguNzAzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzguNzAzIDQ3OC43MDM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNNDU0LjIsMTg5LjEwMWwtMzMuNi01LjdjLTMuNS0xMS4zLTgtMjIuMi0xMy41LTMyLjZsMTkuOC0yNy43YzguNC0xMS44LDcuMS0yNy45LTMuMi0zOC4xbC0yOS44LTI5LjgNCgkJCWMtNS42LTUuNi0xMy04LjctMjAuOS04LjdjLTYuMiwwLTEyLjEsMS45LTE3LjEsNS41bC0yNy44LDE5LjhjLTEwLjgtNS43LTIyLjEtMTAuNC0zMy44LTEzLjlsLTUuNi0zMy4yDQoJCQljLTIuNC0xNC4zLTE0LjctMjQuNy0yOS4yLTI0LjdoLTQyLjFjLTE0LjUsMC0yNi44LDEwLjQtMjkuMiwyNC43bC01LjgsMzRjLTExLjIsMy41LTIyLjEsOC4xLTMyLjUsMTMuN2wtMjcuNS0xOS44DQoJCQljLTUtMy42LTExLTUuNS0xNy4yLTUuNWMtNy45LDAtMTUuNCwzLjEtMjAuOSw4LjdsLTI5LjksMjkuOGMtMTAuMiwxMC4yLTExLjYsMjYuMy0zLjIsMzguMWwyMCwyOC4xDQoJCQljLTUuNSwxMC41LTkuOSwyMS40LTEzLjMsMzIuN2wtMzMuMiw1LjZjLTE0LjMsMi40LTI0LjcsMTQuNy0yNC43LDI5LjJ2NDIuMWMwLDE0LjUsMTAuNCwyNi44LDI0LjcsMjkuMmwzNCw1LjgNCgkJCWMzLjUsMTEuMiw4LjEsMjIuMSwxMy43LDMyLjVsLTE5LjcsMjcuNGMtOC40LDExLjgtNy4xLDI3LjksMy4yLDM4LjFsMjkuOCwyOS44YzUuNiw1LjYsMTMsOC43LDIwLjksOC43YzYuMiwwLDEyLjEtMS45LDE3LjEtNS41DQoJCQlsMjguMS0yMGMxMC4xLDUuMywyMC43LDkuNiwzMS42LDEzbDUuNiwzMy42YzIuNCwxNC4zLDE0LjcsMjQuNywyOS4yLDI0LjdoNDIuMmMxNC41LDAsMjYuOC0xMC40LDI5LjItMjQuN2w1LjctMzMuNg0KCQkJYzExLjMtMy41LDIyLjItOCwzMi42LTEzLjVsMjcuNywxOS44YzUsMy42LDExLDUuNSwxNy4yLDUuNWwwLDBjNy45LDAsMTUuMy0zLjEsMjAuOS04LjdsMjkuOC0yOS44YzEwLjItMTAuMiwxMS42LTI2LjMsMy4yLTM4LjENCgkJCWwtMTkuOC0yNy44YzUuNS0xMC41LDEwLjEtMjEuNCwxMy41LTMyLjZsMzMuNi01LjZjMTQuMy0yLjQsMjQuNy0xNC43LDI0LjctMjkuMnYtNDIuMQ0KCQkJQzQ3OC45LDIwMy44MDEsNDY4LjUsMTkxLjUwMSw0NTQuMiwxODkuMTAxeiBNNDUxLjksMjYwLjQwMWMwLDEuMy0wLjksMi40LTIuMiwyLjZsLTQyLDdjLTUuMywwLjktOS41LDQuOC0xMC44LDkuOQ0KCQkJYy0zLjgsMTQuNy05LjYsMjguOC0xNy40LDQxLjljLTIuNyw0LjYtMi41LDEwLjMsMC42LDE0LjdsMjQuNywzNC44YzAuNywxLDAuNiwyLjUtMC4zLDMuNGwtMjkuOCwyOS44Yy0wLjcsMC43LTEuNCwwLjgtMS45LDAuOA0KCQkJYy0wLjYsMC0xLjEtMC4yLTEuNS0wLjVsLTM0LjctMjQuN2MtNC4zLTMuMS0xMC4xLTMuMy0xNC43LTAuNmMtMTMuMSw3LjgtMjcuMiwxMy42LTQxLjksMTcuNGMtNS4yLDEuMy05LjEsNS42LTkuOSwxMC44bC03LjEsNDINCgkJCWMtMC4yLDEuMy0xLjMsMi4yLTIuNiwyLjJoLTQyLjFjLTEuMywwLTIuNC0wLjktMi42LTIuMmwtNy00MmMtMC45LTUuMy00LjgtOS41LTkuOS0xMC44Yy0xNC4zLTMuNy0yOC4xLTkuNC00MS0xNi44DQoJCQljLTIuMS0xLjItNC41LTEuOC02LjgtMS44Yy0yLjcsMC01LjUsMC44LTcuOCwyLjVsLTM1LDI0LjljLTAuNSwwLjMtMSwwLjUtMS41LDAuNWMtMC40LDAtMS4yLTAuMS0xLjktMC44bC0yOS44LTI5LjgNCgkJCWMtMC45LTAuOS0xLTIuMy0wLjMtMy40bDI0LjYtMzQuNWMzLjEtNC40LDMuMy0xMC4yLDAuNi0xNC44Yy03LjgtMTMtMTMuOC0yNy4xLTE3LjYtNDEuOGMtMS40LTUuMS01LjYtOS0xMC44LTkuOWwtNDIuMy03LjINCgkJCWMtMS4zLTAuMi0yLjItMS4zLTIuMi0yLjZ2LTQyLjFjMC0xLjMsMC45LTIuNCwyLjItMi42bDQxLjctN2M1LjMtMC45LDkuNi00LjgsMTAuOS0xMGMzLjctMTQuNyw5LjQtMjguOSwxNy4xLTQyDQoJCQljMi43LTQuNiwyLjQtMTAuMy0wLjctMTQuNmwtMjQuOS0zNWMtMC43LTEtMC42LTIuNSwwLjMtMy40bDI5LjgtMjkuOGMwLjctMC43LDEuNC0wLjgsMS45LTAuOGMwLjYsMCwxLjEsMC4yLDEuNSwwLjVsMzQuNSwyNC42DQoJCQljNC40LDMuMSwxMC4yLDMuMywxNC44LDAuNmMxMy03LjgsMjcuMS0xMy44LDQxLjgtMTcuNmM1LjEtMS40LDktNS42LDkuOS0xMC44bDcuMi00Mi4zYzAuMi0xLjMsMS4zLTIuMiwyLjYtMi4yaDQyLjENCgkJCWMxLjMsMCwyLjQsMC45LDIuNiwyLjJsNyw0MS43YzAuOSw1LjMsNC44LDkuNiwxMCwxMC45YzE1LjEsMy44LDI5LjUsOS43LDQyLjksMTcuNmM0LjYsMi43LDEwLjMsMi41LDE0LjctMC42bDM0LjUtMjQuOA0KCQkJYzAuNS0wLjMsMS0wLjUsMS41LTAuNWMwLjQsMCwxLjIsMC4xLDEuOSwwLjhsMjkuOCwyOS44YzAuOSwwLjksMSwyLjMsMC4zLDMuNGwtMjQuNywzNC43Yy0zLjEsNC4zLTMuMywxMC4xLTAuNiwxNC43DQoJCQljNy44LDEzLjEsMTMuNiwyNy4yLDE3LjQsNDEuOWMxLjMsNS4yLDUuNiw5LjEsMTAuOCw5LjlsNDIsNy4xYzEuMywwLjIsMi4yLDEuMywyLjIsMi42djQyLjFINDUxLjl6Ii8+DQoJCTxwYXRoIGQ9Ik0yMzkuNCwxMzYuMDAxYy01NywwLTEwMy4zLDQ2LjMtMTAzLjMsMTAzLjNzNDYuMywxMDMuMywxMDMuMywxMDMuM3MxMDMuMy00Ni4zLDEwMy4zLTEwMy4zUzI5Ni40LDEzNi4wMDEsMjM5LjQsMTM2LjAwMQ0KCQkJeiBNMjM5LjQsMzE1LjYwMWMtNDIuMSwwLTc2LjMtMzQuMi03Ni4zLTc2LjNzMzQuMi03Ni4zLDc2LjMtNzYuM3M3Ni4zLDM0LjIsNzYuMyw3Ni4zUzI4MS41LDMxNS42MDEsMjM5LjQsMzE1LjYwMXoiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg=="
    }
}

// Creation de l'application 1
let GpioApp = new Gpio(GlobalCoreXGetAppContentId())
// Ajout de l'application 1
GlobalCoreXAddApp(GpioApp.GetTitre(), GpioApp.GetImgSrc(),GpioApp.BuildViewConfigGpio.bind(GpioApp))
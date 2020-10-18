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
        this._DivApp.appendChild(CoreXBuild.Div("","","height:5vh;"))
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
        // affichier le header du tableau Nb - Type - Name - Param
        let BoxTitre = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(BoxTitre)
        BoxTitre.appendChild(CoreXBuild.DivTexte("Nb","","TextBoxTitre", "width: 15%;color: var(--CoreX-color); margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Type","","TextBoxTitre", "width: 15%;color: var(--CoreX-color);"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 20%;color: var(--CoreX-color);"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Param","","TextBoxTitre", "width: 46%;color: var(--CoreX-color);"))
        // Ajout d'une ligne
        Conteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Ajout de la configuration
        if (this._ConfigGpio == null){
            Conteneur.appendChild(CoreXBuild.DivTexte("No Configuration saved","","Text",""))
        } else {
            this._ConfigGpio.sort((a,b) =>  a.pin-b.pin )
            this._ConfigGpio.forEach(element => {
                Conteneur.appendChild(this.BuildListElementOfConfigData(element))
            })
        }
        // Action Button
        let DivContentButton = CoreXBuild.DivFlexRowAr("DivContentButton")
        Conteneur.appendChild(DivContentButton)
        DivContentButton.appendChild(CoreXBuild.Button("Add Relay", this.BuildViewAddRelayConfigGpio.bind(this, null),"Button"))
        DivContentButton.appendChild(CoreXBuild.Button("Add Button", this.BuildViewAddButtonConfigGpio.bind(this, null),"Button"))
         // Action Button update worker
         if (this._ConfigGpio != null){
            let DivContentButton2 = CoreXBuild.DivFlexRowAr("DivContentButton")
            Conteneur.appendChild(DivContentButton2)
            DivContentButton2.appendChild(CoreXBuild.Button("Update worker", this.UpdateRpiGpio.bind(this),"Button"))
         }
    }

    /**
     * Construit l'element du tableau contenant la liste des config GPIO
     * @param {Object} config Configuration d'un relay
     */
    BuildListElementOfConfigData(config){
        let conteneur = CoreXBuild.Div("","","width:100%")
        let data = CoreXBuild.Div("","ListElement","")
        if (config.type == "Relais"){
            data.addEventListener("click", this.BuildViewAddRelayConfigGpio.bind(this, config))
        } else if (config.type == "Button"){
            data.addEventListener("click", this.BuildViewAddButtonConfigGpio.bind(this, config))
        }
        conteneur.appendChild(data)
        let divFlex = CoreXBuild.DivFlexRowAr("")
        data.appendChild(divFlex)
        divFlex.appendChild(CoreXBuild.DivTexte(config.pin,"","TextSmall", "width: 15%; margin-left:1%;"))
        divFlex.appendChild(CoreXBuild.DivTexte(config.type,"","TextSmall", "width: 15%"))
        divFlex.appendChild(CoreXBuild.DivTexte(config.name,"","TextSmall", "width: 20%;"))
        let param = ""
        if (config.type == "Relais"){
            param = "{status:"+config.status+", activelow:"+config.activelow+", timeout:"+config.timeout+"m }"
        } else if (config.type == "Button"){
            param = "{status:"+config.status+", debouncetimeout:"+config.debouncetimeout+"ms }"
        }
        divFlex.appendChild(CoreXBuild.DivTexte(param,"","TextSmall", "width: 46%;"))
        // Ajout d'une ligne
        conteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
        return conteneur
    }

    /**
     * Construction de la vue qui permet d'ajouter un Relay
     * @param {Object} config Ancienne configuration d'un relay (ou null)
     */
    BuildViewAddRelayConfigGpio(config){
        this.ClearView()
        let Action = (config == null) ? 'Add' : 'Update'
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte(Action +" Relay", "", "Titre", ""))
        // Conteneur
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // on ajoute la vue de la configuration des relais
        this.RelayConfigGpio(Conteneur, config)
        // on construit le texte d'info
        this._DivApp.appendChild(CoreXBuild.DivTexte("","TxtRelayConfig","Text","text-align: center;"))
        // on construit le texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorRelayConfig","Text","color:red; text-align: center;"))
        // Action Button
        let DivContentButton = CoreXBuild.DivFlexRowAr("DivContentButton")
        Conteneur.appendChild(DivContentButton)
        DivContentButton.appendChild(CoreXBuild.Button(Action, this.AddRelay.bind(this, config),"Button"))
        if (config != null){DivContentButton.appendChild(CoreXBuild.Button("Delete", this.DeleteRelay.bind(this, config),"Button"))}
        DivContentButton.appendChild(CoreXBuild.Button("Cancel", this.BuildViewConfigGpio.bind(this),"Button"))
        // On laisse un blanc avant la fin de la page
        this._DivApp.appendChild(CoreXBuild.Div("","","margin-bottom: 2%;"))
    }

    /**
     * Construction de la vue de configuration d'un relay
     * @param {HtmlElement} Conteneur Conteneur de la config d'un relay
     * @param {Object} config Ancienne configuration d'un relay (ou null)
     */
    RelayConfigGpio(Conteneur, config){
        let GpioNumer = (config == null) ? '' : config.pin
        let RelayName = (config == null) ? '' : config.name
        let RelayStatus = (config == null) ? '' : config.status
        let RelayActiveLow = (config == null) ? '' : config.activelow
        let RelayTimeOut = (config == null) ? '' : config.timeout
        // Gpio Number
        let DivNumber = CoreXBuild.Div("", "InputBox", "")
        DivNumber.style.marginBottom= "2%";
        Conteneur.appendChild(DivNumber)
        DivNumber.appendChild(CoreXBuild.DivTexte("Number","","Text",""))
        let InputNumber = CoreXBuild.Input("GpioNumber",GpioNumer,"Input","","text","GpioNumber","Set GPIO Number")
        InputNumber.style.width= "50%";
        DivNumber.appendChild(InputNumber)
        // Relay name
        let DivSelectName = CoreXBuild.Div("", "InputBox", "")
        DivSelectName.style.marginBottom= "2%";
        Conteneur.appendChild(DivSelectName)
        DivSelectName.appendChild(CoreXBuild.DivTexte("Name","","Text",""))
        let InputName = CoreXBuild.Input("Name",RelayName,"Input","","text","Name","Set Relay Name")
        DivSelectName.appendChild(InputName)
        // Relay Status
        let DivSelectStatus = CoreXBuild.Div("", "InputBox", "")
        DivSelectStatus.style.marginBottom= "2%";
        Conteneur.appendChild(DivSelectStatus)
        DivSelectStatus.appendChild(CoreXBuild.DivTexte("Status","","Text",""))
        let DropDownStatus = document.createElement("select")
        DropDownStatus.setAttribute("id", "Status")
        DropDownStatus.setAttribute("class", "Text DorpDown")
        let optionStatus1 = document.createElement("option")
        optionStatus1.setAttribute("value", "in")
        if(RelayStatus == "in"){optionStatus1.setAttribute("selected", "selected")}
        optionStatus1.innerHTML = "In"
        DropDownStatus.appendChild(optionStatus1)
        let optionStatus2 = document.createElement("option")
        optionStatus2.setAttribute("value", "high")
        if(RelayStatus == "high"){optionStatus2.setAttribute("selected", "selected")}
        optionStatus2.innerHTML = "High"
        DropDownStatus.appendChild(optionStatus2)
        let optionStatus3 = document.createElement("option")
        optionStatus3.setAttribute("value", "low")
        if(RelayStatus == "low"){optionStatus3.setAttribute("selected", "selected")}
        optionStatus3.innerHTML = "Low"
        DropDownStatus.appendChild(optionStatus3)
        DivSelectStatus.appendChild(DropDownStatus)
        // Relay ActiveLow
        let DivSelectActiveLow = CoreXBuild.Div("", "InputBox", "")
        DivSelectActiveLow.style.marginBottom= "2%";
        Conteneur.appendChild(DivSelectActiveLow)
        DivSelectActiveLow.appendChild(CoreXBuild.DivTexte("ActiveLow","","Text",""))
        let DropDownActiveLow = document.createElement("select")
        DropDownActiveLow.setAttribute("id", "ActiveLow")
        DropDownActiveLow.setAttribute("class", "Text DorpDown")
        let optionActiveLow1 = document.createElement("option")
        optionActiveLow1.setAttribute("value", "true")
        if(RelayActiveLow == "true"){optionActiveLow1.setAttribute("selected", "selected")}
        optionActiveLow1.innerHTML = "True"
        DropDownActiveLow.appendChild(optionActiveLow1)
        let optionActiveLow2 = document.createElement("option")
        optionActiveLow2.setAttribute("value", "false")
        if(RelayActiveLow == "false"){optionActiveLow2.setAttribute("selected", "selected")}
        optionActiveLow2.innerHTML = "False"
        DropDownActiveLow.appendChild(optionActiveLow2)
        DivSelectActiveLow.appendChild(DropDownActiveLow)
        // Relay TimeOut
        let DivSelectTimeOut = CoreXBuild.Div("", "InputBox", "")
        DivSelectTimeOut.style.marginBottom= "2%";
        Conteneur.appendChild(DivSelectTimeOut)
        DivSelectTimeOut.appendChild(CoreXBuild.DivTexte("TimeOut","","Text",""))
        let InputTimeOut = CoreXBuild.Input("TimeOut",RelayTimeOut,"Input","","text","TimeOut","Set Relay TimeOut")
        InputTimeOut.style.width= "50%";
        DivSelectTimeOut.appendChild(InputTimeOut)
    }

    /**
     * Ajoute un relay a la configuration
     * @param {Object} OldConfig Ancienne configuration d'un relay (ou null)
     */
    AddRelay(OldConfig){
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
            if (OldConfig == null){
                var found = this._ConfigGpio.find((element) => { return element.pin == GpioNumber })
                if (found){ErrorMsg += "Gpio Number reseved in configuration. "}
            } else {
                if (OldConfig.pin != GpioNumber){
                    var found = this._ConfigGpio.find((element) => { return element.pin == GpioNumber })
                    if (found){ErrorMsg += "Gpio Number reseved in configuration. "}
                }
            }
        }
        // Vérifier si le GPIO number est un entier
        if (!Number.isInteger(Number(GpioNumber))){ErrorMsg += "Gpio Number must be a interger. "}
        // vérifier si le Relay a un nom
        if (Name == ""){ErrorMsg += "Relay Name must be fill. "}
        // Vérifier si le nom est déja utilisé
        if(this._ConfigGpio != null){
            if (OldConfig == null){
                var found = this._ConfigGpio.find((element) => { return element.name == Name })
                if (found){ErrorMsg += "Name reseved in configuration. "}
            } else {
                if (OldConfig.name != Name){
                    var found = this._ConfigGpio.find((element) => { return element.name == Name })
                    if (found){ErrorMsg += "Name reseved in configuration. "}
                }
            }
        }
        // vérifier si le Relay a un TimeOut
        if (TimeOut == ""){ErrorMsg += "Relay TimeOut must be fill. "}
        // Vérifier si le Relay TimeOut est un entier
        if (!Number.isInteger(Number(TimeOut))){ErrorMsg += "Gpio TimeOut must be a interger. "}

        // Si il y a des erreur => afficher les erreur
        if(ErrorMsg != ""){
            document.getElementById("ErrorRelayConfig").innerHTML = ErrorMsg
        } else { 
            document.getElementById("Conteneur").innerHTML = ""
            if (OldConfig == null){
                document.getElementById("TxtRelayConfig").innerHTML = "Save Relay..."
            } else {
                document.getElementById("TxtRelayConfig").innerHTML = "Update Relay..."
            }
            document.getElementById("ErrorRelayConfig").innerHTML = ""
            // Creation de l'objet config relay
            let ConfigRelay = new Object()
            ConfigRelay.pin = GpioNumber
            ConfigRelay.type = "Relais"
            ConfigRelay.name = Name
            ConfigRelay.status = Status
            ConfigRelay.activelow = ActiveLow
            ConfigRelay.timeout = TimeOut
            ConfigRelay.custom = (OldConfig == null) ? null : OldConfig.custom
            if (this._ConfigGpio == null) {this._ConfigGpio = new Array()}
            if (OldConfig == null){
                this._ConfigGpio.push(ConfigRelay)
            } else {
                let index = this._ConfigGpio.indexOf(OldConfig)
                if (index > -1) {
                    this._ConfigGpio.splice(index, 1)
                    this._ConfigGpio.push(ConfigRelay)
                }
            }
            // Call API Set Config
            let ApiData = new Object()
            ApiData.Fct = "SetConfig"
            ApiData.Data = this._ConfigGpio
            GlobalCallApiPromise("Gpio", ApiData, "", "").then((reponse)=>{
                document.getElementById("TxtRelayConfig").innerHTML = ""
                document.getElementById("ErrorRelayConfig").innerHTML = ""
                this._ConfigGpio = reponse
                this.BuildViewConfigGpio()
            },(erreur)=>{
                document.getElementById("TxtRelayConfig").innerHTML = ""
                document.getElementById("ErrorRelayConfig").innerHTML = erreur
            })
        }
    }

    /**
     * Delete un relais de la config
     * @param {Object} ConfigToDel Object config Relay a deleter
     */
    DeleteRelay(ConfigToDel){
        if (confirm("Delete this relay of the configuration")){
            document.getElementById("Conteneur").innerHTML = ""
            document.getElementById("TxtRelayConfig").innerHTML = "Delete Relay..."
            let index = this._ConfigGpio.indexOf(ConfigToDel)
            if (index > -1) {
                this._ConfigGpio.splice(index, 1)
            }
            // Call API Set Config
            let ApiData = new Object()
            ApiData.Fct = "SetConfig"
            ApiData.Data = this._ConfigGpio
            GlobalCallApiPromise("Gpio", ApiData, "", "").then((reponse)=>{
                this._ConfigGpio = reponse
                this.ViewConfigGpio()
            },(erreur)=>{
                document.getElementById("TxtRelayConfig").innerHTML = ""
                document.getElementById("ErrorRelayConfig").innerHTML = erreur
            })
        }
    }

    /**
     * Construit la vue qui permet d'ajouter un boutton
     * @param {Object} config Ancienne configuration d'un Button (ou null)
     */
    BuildViewAddButtonConfigGpio(config){
        this.ClearView()
        let Action = (config == null) ? 'Add' : 'Update'
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte(Action +" Button", "", "Titre", ""))
        // Conteneur
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // on ajoute la vue de la configuration des relais
        this.ButtonConfigGpio(Conteneur, config)
        // on construit le texte d'info
        this._DivApp.appendChild(CoreXBuild.DivTexte("","TxtButtonConfig","Text","text-align: center;"))
        // on construit le texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorButtonConfig","Text","color:red; text-align: center;"))
        // Action Button
        let DivContentButton = CoreXBuild.DivFlexRowAr("DivContentButton")
        Conteneur.appendChild(DivContentButton)
        DivContentButton.appendChild(CoreXBuild.Button(Action, this.AddButton.bind(this, config),"Button"))
        if (config != null){DivContentButton.appendChild(CoreXBuild.Button("Delete", this.DeleteButton.bind(this, config),"Button"))}
        DivContentButton.appendChild(CoreXBuild.Button("Cancel", this.BuildViewConfigGpio.bind(this),"Button"))
        // On laisse un blanc avant la fin de la page
        this._DivApp.appendChild(CoreXBuild.Div("","","margin-bottom: 2%;"))
    }

    /**
     * Construction de la vue de configuration d'un relay
     * @param {HtmlElement} Conteneur Conteneur de la config d'un relay
     * @param {Object} config Ancienne configuration d'un relay (ou null)
     */
    ButtonConfigGpio(Conteneur, config){
        let GpioNumer = (config == null) ? '' : config.pin
        let ButtonName = (config == null) ? '' : config.name
        let ButtonStatus = (config == null) ? '' : config.status
        let ButtonDebounceTimeout = (config == null) ? '' : config.debouncetimeout
        // Gpio Number
        let DivSelectNumber = CoreXBuild.Div("", "InputBox", "")
        DivSelectNumber.style.marginBottom= "2%";
        Conteneur.appendChild(DivSelectNumber)
        DivSelectNumber.appendChild(CoreXBuild.DivTexte("Number","","Text",""))
        let InputNumber = CoreXBuild.Input("GpioNumber",GpioNumer,"Input","","text","GpioNumber","Set GPIO Number")
        InputNumber.style.width= "50%"
        DivSelectNumber.appendChild(InputNumber)
        // Button name
        let DivSelectName = CoreXBuild.Div("", "InputBox", "")
        DivSelectName.style.marginBottom= "2%";
        Conteneur.appendChild(DivSelectName)
        DivSelectName.appendChild(CoreXBuild.DivTexte("Name","","Text",""))
        let InputName = CoreXBuild.Input("Name",ButtonName,"Input","","text","Name","Set Button Name")
        DivSelectName.appendChild(InputName)
        // Button Status
        let DivSelectStatus = CoreXBuild.Div("", "InputBox", "")
        DivSelectStatus.style.marginBottom= "2%";
        Conteneur.appendChild(DivSelectStatus)
        DivSelectStatus.appendChild(CoreXBuild.DivTexte("Status","","Text",""))
        let DropDownStatus = document.createElement("select")
        DropDownStatus.setAttribute("id", "Status")
        DropDownStatus.setAttribute("class", "Text DorpDown")
        let optionStatus1 = document.createElement("option")
        optionStatus1.setAttribute("value", "rising")
        if(ButtonStatus == "rising"){optionStatus1.setAttribute("selected", "selected")}
        optionStatus1.innerHTML = "Rising"
        DropDownStatus.appendChild(optionStatus1)
        let optionStatus2 = document.createElement("option")
        optionStatus2.setAttribute("value", "falling")
        if(ButtonStatus == "falling"){optionStatus2.setAttribute("selected", "selected")}
        optionStatus2.innerHTML = "Falling"
        DropDownStatus.appendChild(optionStatus2)
        let optionStatus3 = document.createElement("option")
        optionStatus3.setAttribute("value", "both")
        if(ButtonStatus == "both"){optionStatus3.setAttribute("selected", "selected")}
        optionStatus3.innerHTML = "Both"
        DropDownStatus.appendChild(optionStatus3)
        DivSelectStatus.appendChild(DropDownStatus)
        // Button debounceTimeout
        let DivSelectTimeOut = CoreXBuild.Div("", "InputBox", "")
        DivSelectTimeOut.style.marginBottom= "2%";
        Conteneur.appendChild(DivSelectTimeOut)
        DivSelectTimeOut.appendChild(CoreXBuild.DivTexte("Debounce Timeout","","Text",""))
        let InputTimeOut = CoreXBuild.Input("DebounceTimeout",ButtonDebounceTimeout,"Input","","text","TimeOut","Set Button Debounce TimeOut")
        InputTimeOut.style.width= "50%"
        DivSelectTimeOut.appendChild(InputTimeOut)
    }

    /**
     * Ajoute un Button a la configuration
     * @param {Object} OldConfig Ancienne configuration d'un Button (ou null)
     */
    AddButton(OldConfig){
        let ErrorMsg = ""
        // Copier toutesles valeurs
        let GpioNumber = document.getElementById("GpioNumber").value
        let Name = document.getElementById("Name").value
        let Status = document.getElementById("Status").value
        let DebounceTimeout = document.getElementById("DebounceTimeout").value

        // vérifier si le GPIO a un number
        if (GpioNumber == ""){ErrorMsg += "Gpio Number must be fill. "}
        // Verifier si le GPIO number est deja utilisé
        if(this._ConfigGpio != null){
            if (OldConfig == null){
                var found = this._ConfigGpio.find((element) => { return element.pin == GpioNumber })
                if (found){ErrorMsg += "Gpio Number reseved in configuration. "}
            } else {
                if (OldConfig.pin != GpioNumber){
                    var found = this._ConfigGpio.find((element) => { return element.pin == GpioNumber })
                    if (found){ErrorMsg += "Gpio Number reseved in configuration. "}
                }
            }
        }
        // Vérifier si le GPIO number est un entier
        if (!Number.isInteger(Number(GpioNumber))){ErrorMsg += "Gpio Number must be a interger. "}
        // vérifier si le Button a un nom
        if (Name == ""){ErrorMsg += "Button Name must be fill. "}
        // Vérifier si le nom est déja utilisé
        if(this._ConfigGpio != null){
            if (OldConfig == null){
                var found = this._ConfigGpio.find((element) => { return element.name == Name })
                if (found){ErrorMsg += "Name reseved in configuration. "}
            } else {
                if (OldConfig.name != Name){
                    var found = this._ConfigGpio.find((element) => { return element.name == Name })
                    if (found){ErrorMsg += "Name reseved in configuration. "}
                }
            }
        }
        // vérifier si le Button a un Debounce Timout
        if (DebounceTimeout == ""){ErrorMsg += "Button Debounce Timeout must be fill. "}
        // Vérifier si le Relay TimeOut est un entier
        if (!Number.isInteger(Number(DebounceTimeout))){ErrorMsg += "Button Debounce Timeout must be a interger. "}

        // Si il y a des erreur => afficher les erreur
        if(ErrorMsg != ""){
            document.getElementById("ErrorButtonConfig").innerHTML = ErrorMsg
        } else {
            document.getElementById("Conteneur").innerHTML = ""
            if (OldConfig == null){
                document.getElementById("TxtButtonConfig").innerHTML = "Save Button..."
            } else {
                document.getElementById("TxtButtonConfig").innerHTML = "Update Button..."
            }
            document.getElementById("ErrorButtonConfig").innerHTML = ""
            // Creation de l'objet config relay
            let ConfigButton = new Object()
            ConfigButton.pin = GpioNumber
            ConfigButton.type = "Button"
            ConfigButton.name = Name
            ConfigButton.status = Status
            ConfigButton.debouncetimeout = DebounceTimeout
            ConfigButton.custom = (OldConfig == null) ? null : OldConfig.custom
            if (this._ConfigGpio == null) {this._ConfigGpio = new Array()}
            if (OldConfig == null){
                this._ConfigGpio.push(ConfigButton)
            } else {
                let index = this._ConfigGpio.indexOf(OldConfig)
                if (index > -1) {
                    this._ConfigGpio.splice(index, 1)
                    this._ConfigGpio.push(ConfigButton)
                }
            }
            // Call API Set Config
            let ApiData = new Object()
            ApiData.Fct = "SetConfig"
            ApiData.Data = this._ConfigGpio
            GlobalCallApiPromise("Gpio", ApiData, "", "").then((reponse)=>{
                document.getElementById("TxtButtonConfig").innerHTML = ""
                document.getElementById("ErrorButtonConfig").innerHTML = ""
                this._ConfigGpio = reponse
                this.ViewConfigGpio()
            },(erreur)=>{
                document.getElementById("TxtButtonConfig").innerHTML = ""
                document.getElementById("ErrorButtonConfig").innerHTML = erreur
            })
        }
    }

    /**
     * Delete un Button de la config
     * @param {Object} ConfigToDel Object config Button a deleter
     */
    DeleteButton(ConfigToDel){
        if (confirm("Delete this Button of the configuration")){
            document.getElementById("Conteneur").innerHTML = ""
            document.getElementById("TxtButtonConfig").innerHTML = "Delete Button..."
            let index = this._ConfigGpio.indexOf(ConfigToDel)
            if (index > -1) {
                this._ConfigGpio.splice(index, 1)
            }
            // Call API Set Config
            let ApiData = new Object()
            ApiData.Fct = "SetConfig"
            ApiData.Data = this._ConfigGpio
            GlobalCallApiPromise("Gpio", ApiData, "", "").then((reponse)=>{
                this._ConfigGpio = reponse
                this.ViewConfigGpio()
            },(erreur)=>{
                document.getElementById("TxtButtonConfig").innerHTML = ""
                document.getElementById("ErrorButtonConfig").innerHTML = erreur
            })
        }
    }

    /**
     * Update the configuration to the worker
     */
    UpdateRpiGpio(){
        document.getElementById("TxtGpio").innerHTML = ""
        document.getElementById("ErrorGpio").innerHTML = ""
        // Call API Get Config
        let ApiData = new Object()
        ApiData.Fct = "UpdateRpiGpio"
        ApiData.Data = ""
        GlobalCallApiPromise("Gpio", ApiData, "", "").then((reponse)=>{
            document.getElementById("TxtGpio").innerHTML = reponse
            document.getElementById("ErrorGpio").innerHTML = ""
        },(erreur)=>{
            document.getElementById("TxtGpio").innerHTML = ""
            document.getElementById("ErrorGpio").innerHTML = erreur
        })
    }

    /** Get Titre de l'application */
    GetTitre(){
        return "GPIO"
    }
    /** Get Img Src de l'application */
    // GetImgSrc(){
    //     return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDc4LjcwMyA0NzguNzAzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzguNzAzIDQ3OC43MDM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNNDU0LjIsMTg5LjEwMWwtMzMuNi01LjdjLTMuNS0xMS4zLTgtMjIuMi0xMy41LTMyLjZsMTkuOC0yNy43YzguNC0xMS44LDcuMS0yNy45LTMuMi0zOC4xbC0yOS44LTI5LjgNCgkJCWMtNS42LTUuNi0xMy04LjctMjAuOS04LjdjLTYuMiwwLTEyLjEsMS45LTE3LjEsNS41bC0yNy44LDE5LjhjLTEwLjgtNS43LTIyLjEtMTAuNC0zMy44LTEzLjlsLTUuNi0zMy4yDQoJCQljLTIuNC0xNC4zLTE0LjctMjQuNy0yOS4yLTI0LjdoLTQyLjFjLTE0LjUsMC0yNi44LDEwLjQtMjkuMiwyNC43bC01LjgsMzRjLTExLjIsMy41LTIyLjEsOC4xLTMyLjUsMTMuN2wtMjcuNS0xOS44DQoJCQljLTUtMy42LTExLTUuNS0xNy4yLTUuNWMtNy45LDAtMTUuNCwzLjEtMjAuOSw4LjdsLTI5LjksMjkuOGMtMTAuMiwxMC4yLTExLjYsMjYuMy0zLjIsMzguMWwyMCwyOC4xDQoJCQljLTUuNSwxMC41LTkuOSwyMS40LTEzLjMsMzIuN2wtMzMuMiw1LjZjLTE0LjMsMi40LTI0LjcsMTQuNy0yNC43LDI5LjJ2NDIuMWMwLDE0LjUsMTAuNCwyNi44LDI0LjcsMjkuMmwzNCw1LjgNCgkJCWMzLjUsMTEuMiw4LjEsMjIuMSwxMy43LDMyLjVsLTE5LjcsMjcuNGMtOC40LDExLjgtNy4xLDI3LjksMy4yLDM4LjFsMjkuOCwyOS44YzUuNiw1LjYsMTMsOC43LDIwLjksOC43YzYuMiwwLDEyLjEtMS45LDE3LjEtNS41DQoJCQlsMjguMS0yMGMxMC4xLDUuMywyMC43LDkuNiwzMS42LDEzbDUuNiwzMy42YzIuNCwxNC4zLDE0LjcsMjQuNywyOS4yLDI0LjdoNDIuMmMxNC41LDAsMjYuOC0xMC40LDI5LjItMjQuN2w1LjctMzMuNg0KCQkJYzExLjMtMy41LDIyLjItOCwzMi42LTEzLjVsMjcuNywxOS44YzUsMy42LDExLDUuNSwxNy4yLDUuNWwwLDBjNy45LDAsMTUuMy0zLjEsMjAuOS04LjdsMjkuOC0yOS44YzEwLjItMTAuMiwxMS42LTI2LjMsMy4yLTM4LjENCgkJCWwtMTkuOC0yNy44YzUuNS0xMC41LDEwLjEtMjEuNCwxMy41LTMyLjZsMzMuNi01LjZjMTQuMy0yLjQsMjQuNy0xNC43LDI0LjctMjkuMnYtNDIuMQ0KCQkJQzQ3OC45LDIwMy44MDEsNDY4LjUsMTkxLjUwMSw0NTQuMiwxODkuMTAxeiBNNDUxLjksMjYwLjQwMWMwLDEuMy0wLjksMi40LTIuMiwyLjZsLTQyLDdjLTUuMywwLjktOS41LDQuOC0xMC44LDkuOQ0KCQkJYy0zLjgsMTQuNy05LjYsMjguOC0xNy40LDQxLjljLTIuNyw0LjYtMi41LDEwLjMsMC42LDE0LjdsMjQuNywzNC44YzAuNywxLDAuNiwyLjUtMC4zLDMuNGwtMjkuOCwyOS44Yy0wLjcsMC43LTEuNCwwLjgtMS45LDAuOA0KCQkJYy0wLjYsMC0xLjEtMC4yLTEuNS0wLjVsLTM0LjctMjQuN2MtNC4zLTMuMS0xMC4xLTMuMy0xNC43LTAuNmMtMTMuMSw3LjgtMjcuMiwxMy42LTQxLjksMTcuNGMtNS4yLDEuMy05LjEsNS42LTkuOSwxMC44bC03LjEsNDINCgkJCWMtMC4yLDEuMy0xLjMsMi4yLTIuNiwyLjJoLTQyLjFjLTEuMywwLTIuNC0wLjktMi42LTIuMmwtNy00MmMtMC45LTUuMy00LjgtOS41LTkuOS0xMC44Yy0xNC4zLTMuNy0yOC4xLTkuNC00MS0xNi44DQoJCQljLTIuMS0xLjItNC41LTEuOC02LjgtMS44Yy0yLjcsMC01LjUsMC44LTcuOCwyLjVsLTM1LDI0LjljLTAuNSwwLjMtMSwwLjUtMS41LDAuNWMtMC40LDAtMS4yLTAuMS0xLjktMC44bC0yOS44LTI5LjgNCgkJCWMtMC45LTAuOS0xLTIuMy0wLjMtMy40bDI0LjYtMzQuNWMzLjEtNC40LDMuMy0xMC4yLDAuNi0xNC44Yy03LjgtMTMtMTMuOC0yNy4xLTE3LjYtNDEuOGMtMS40LTUuMS01LjYtOS0xMC44LTkuOWwtNDIuMy03LjINCgkJCWMtMS4zLTAuMi0yLjItMS4zLTIuMi0yLjZ2LTQyLjFjMC0xLjMsMC45LTIuNCwyLjItMi42bDQxLjctN2M1LjMtMC45LDkuNi00LjgsMTAuOS0xMGMzLjctMTQuNyw5LjQtMjguOSwxNy4xLTQyDQoJCQljMi43LTQuNiwyLjQtMTAuMy0wLjctMTQuNmwtMjQuOS0zNWMtMC43LTEtMC42LTIuNSwwLjMtMy40bDI5LjgtMjkuOGMwLjctMC43LDEuNC0wLjgsMS45LTAuOGMwLjYsMCwxLjEsMC4yLDEuNSwwLjVsMzQuNSwyNC42DQoJCQljNC40LDMuMSwxMC4yLDMuMywxNC44LDAuNmMxMy03LjgsMjcuMS0xMy44LDQxLjgtMTcuNmM1LjEtMS40LDktNS42LDkuOS0xMC44bDcuMi00Mi4zYzAuMi0xLjMsMS4zLTIuMiwyLjYtMi4yaDQyLjENCgkJCWMxLjMsMCwyLjQsMC45LDIuNiwyLjJsNyw0MS43YzAuOSw1LjMsNC44LDkuNiwxMCwxMC45YzE1LjEsMy44LDI5LjUsOS43LDQyLjksMTcuNmM0LjYsMi43LDEwLjMsMi41LDE0LjctMC42bDM0LjUtMjQuOA0KCQkJYzAuNS0wLjMsMS0wLjUsMS41LTAuNWMwLjQsMCwxLjIsMC4xLDEuOSwwLjhsMjkuOCwyOS44YzAuOSwwLjksMSwyLjMsMC4zLDMuNGwtMjQuNywzNC43Yy0zLjEsNC4zLTMuMywxMC4xLTAuNiwxNC43DQoJCQljNy44LDEzLjEsMTMuNiwyNy4yLDE3LjQsNDEuOWMxLjMsNS4yLDUuNiw5LjEsMTAuOCw5LjlsNDIsNy4xYzEuMywwLjIsMi4yLDEuMywyLjIsMi42djQyLjFINDUxLjl6Ii8+DQoJCTxwYXRoIGQ9Ik0yMzkuNCwxMzYuMDAxYy01NywwLTEwMy4zLDQ2LjMtMTAzLjMsMTAzLjNzNDYuMywxMDMuMywxMDMuMywxMDMuM3MxMDMuMy00Ni4zLDEwMy4zLTEwMy4zUzI5Ni40LDEzNi4wMDEsMjM5LjQsMTM2LjAwMQ0KCQkJeiBNMjM5LjQsMzE1LjYwMWMtNDIuMSwwLTc2LjMtMzQuMi03Ni4zLTc2LjNzMzQuMi03Ni4zLDc2LjMtNzYuM3M3Ni4zLDM0LjIsNzYuMyw3Ni4zUzI4MS41LDMxNS42MDEsMjM5LjQsMzE1LjYwMXoiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg=="
    // }

    /** Get Img Src de l'application */
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5vbmxpbmV3ZWJmb250cy5jb20vaWNvbiA8L21ldGFkYXRhPg0KPGc+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTEyLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSI+PHBhdGggZD0iTTIwMTIuNCw1MDU1LjlDOTM4LjcsNDg3NS4zLDEwMCwzODg5LjEsMTAwLDI4MDMuN2MwLTk0My42LDY1OC4yLTE4NTIuMiwxNTYxLTIxNTUuMWMzNTkuMi0xMjAuNCwxNjguOS0xMTIuNiwzMjE1LjEtMTIwLjRjMTkzOS42LTUuOCwyODQyLjMtMS45LDI5NzQuNCwxMy42YzM2OC45LDQyLjcsNzA2LjcsMTY1LDEwMjUuMSwzNzAuOGMxOTAuMywxMjQuMiw1NTEuNCw0OTksNjc1LjYsNzAwLjljNDExLjYsNjY3LjksNDYwLjEsMTQ0MC42LDEzNy45LDIxMjkuOGMtMzI2LjIsNjk4LjktOTg4LjIsMTIwMS44LTE3MjYsMTMxMi40Qzc3MDEsNTA5Ni43LDIyNTEuMiw1MDk0LjcsMjAxMi40LDUwNTUuOXogTTgxMDguNyw0NjEzLjJjNzg2LjMtMjE1LjUsMTMwMC44LTgyOSwxMzY2LjgtMTYzMC45Yzc1LjctOTI4LTQzNi44LTE2OTQuOS0xMzEyLjUtMTk2OC43bC0xNzAuOS01NC40SDUwMDIuM0gyMDEyLjRsLTE3NC43LDU0LjRjLTY4MS41LDIxMS42LTExMzAsNjk4LjktMTI4NS4zLDEzOTkuOGMtNDAuOCwxOTAuMy00MC44LDU5NiwzLjksNzk3LjlDNzI5LDQwMjEuMSwxMzYwLDQ1ODAuMiwyMTk2LjgsNDY2NS43YzM2LjksMy45LDEzMzkuNiw1LjgsMjg5Mi44LDMuOWwyODI0LjktMkw4MTA4LjcsNDYxMy4yeiIvPjxwYXRoIGQ9Ik03MzYzLjEsNDE0My40Yy02MzIuOS0xMzcuOC0xMTIwLjItNzcyLjctMTA4My40LTE0MTUuM2M1MC41LTg4MS40LDk0MS42LTE1MTYuMywxNzU1LjEtMTI0NC41YzcwNi43LDIzNi45LDExMjIuMiwxMDAxLjgsOTE0LjQsMTY3OS40Qzg3MzUuOCwzODU2LDgwMzYuOCw0Mjg5LDczNjMuMSw0MTQzLjR6IE03ODA3LjgsMzc0NS40YzM2My4xLTU4LjIsNjU2LjItMzIyLjMsNzQ3LjUtNjY5LjhjMzMtMTMwLjEsMzYuOS00MDMuOCw3LjgtNTMzLjljLTE2Ny03MjQuMi0xMTQ3LjQtOTYzLTE2NDIuNS0zOTkuOWMtMzI4LjEsMzcyLjgtMzA4LjcsOTkyLjEsNDAuOCwxMzQzLjVjMTMzLjksMTMyLDI3NS43LDIwOS43LDQ2MC4xLDI0OC41Qzc1NzQuOCwzNzY4LjcsNzY0Ni42LDM3NzAuNiw3ODA3LjgsMzc0NS40eiIvPjxwYXRoIGQ9Ik0yMTkyLjksMzUyNmMtMTk4LTgzLjUtMzM5LjgtMjIzLjMtNDM4LjgtNDM0LjljLTQ0LjctOTcuMS01Mi40LTEzNS45LTUyLjQtMjk3YzAtMTY3LDUuOC0xOTYuMSw2Mi4xLTMxNi41Yzc3LjctMTYzLjEsMjI3LjItMzE2LjUsMzg0LjQtMzk0LjFjMTAxLTQ4LjUsMTM3LjgtNTYuMywyODEuNS01Ni4zYzEzOS44LDAsMTgyLjUsNy44LDI3Ny42LDUyLjRjMTQzLjcsNjgsMzE2LjUsMjQwLjgsMzkyLjIsMzk0LjFjNTQuNCwxMDYuOCw1OC4yLDEzMiw1OC4yLDMyMC4zYzAsMTg0LjQtNS44LDIxNS41LTU0LjQsMzE0LjVjLTc1LjcsMTU1LjMtMjIxLjMsMzA2LjgtMzY2LjksMzg0LjRjLTEwMi45LDU2LjMtMTQ1LjYsNjYtMjc3LjYsNzEuOEMyMzI4LjgsMzU3MC42LDIyODYuMSwzNTY0LjgsMjE5Mi45LDM1MjZ6IE0yNjIwLjEsMzExMi41YzE4MC42LTEzMiwxODQuNC01MDAuOSw1LjgtNjI3LjFjLTkzLjItNjYtMjQyLjctNzMuOC0zNTEuNC0xNy41Yy00Ni42LDI1LjItMTAyLjksNzEuOC0xMjIuMywxMDYuOGMtNDYuNiw4MS41LTYyLjEsMjQ2LjYtMzMsMzU1LjNjMjUuMiw5My4yLDEyNC4zLDIwMy45LDE5OCwyMTkuNEMyNDEwLjQsMzE3MC43LDI1NjcuNiwzMTQ5LjMsMjYyMC4xLDMxMTIuNXoiLz48cGF0aCBkPSJNMzU1Ny44LDM1MzkuNmMtOTEuMy02Ni05OS0xMjAuNC05OS03NDUuNXM3LjgtNjc5LjUsOTktNzQ1LjVjNTguMi0zOC44LDE3MC44LTQwLjgsMjI3LjEsMGM3Ny43LDU0LjQsOTEuMywxMDQuOCwxMDEsNDAzLjhsOS43LDI4OS4zbDI1Ni4zLTMzMmMxNDEuNy0xODIuNSwyNzcuNi0zNDUuNiwzMDAuOS0zNjEuMWM3OS42LTU2LjMsMjAxLjktMzMsMjcxLjgsNTQuNGMzMS4xLDM2LjksMzQuOSwxMDIuOSwzNC45LDY3Ny42YzAsNDAxLjktNy44LDY1MC40LTE5LjQsNjc1LjdjLTI3LjIsNDguNS0xMjAuNCw5NS4xLTE5Ni4xLDk1LjFjLTQyLjcsMC03OS42LTE5LjQtMTI2LjItNjZsLTY2LTY2di0yOTUuMVYyODI5bC0yNjQsMzQxLjdDMzk0NC4yLDMzNTksMzgwNi4zLDM1MjYsMzc4MywzNTQxLjVDMzcyOC43LDM1ODAuMywzNjE0LjEsMzU3OC40LDM1NTcuOCwzNTM5LjZ6Ii8+PHBhdGggZD0iTTIxMjEuMS0zMTQuM0MxMzY3LjgtNDAxLjcsNjcyLjctOTAyLjUsMzMzLTE2MDEuNWMtNDI5LjEtODgzLjQtMjQ4LjUtMTg5MSw0NjYtMjU5NS44YzI5My4yLTI4Ny40LDYzMi45LTQ4My40LDEwNDIuNi01OTZsMTkwLjMtNTIuNGgyOTYwLjhoMjk2MC44bDE3NC43LDQ2LjZjNTk2LjEsMTU1LjMsMTA4My40LDUwMi44LDE0MDMuNyw5OTcuOWM1ODIuNCw5MDIuOCw0NjYsMjAxNy4yLTI5My4yLDI4MDMuNUM4ODYyLTYwNy41LDgzOTAuMi0zNzQuNSw3ODU2LjMtMzEyLjRDNzY0Mi43LTI4OSwyMzMyLjctMjg5LDIxMjEuMS0zMTQuM3ogTTgxMjguMS03NzQuNGMxOTQuMi01NC40LDQ0Ni42LTE3Mi44LDU5OS45LTI4My40YzEzNS45LTk3LjEsMzQ1LjYtMzEwLjYsNDMyLjktNDM4LjhjMzUxLjQtNTE2LjQsNDIxLjMtMTI0MC42LDE3OC42LTE4MjguOWMtMjMzLTU2NS03MDYuNy05NDcuNS0xMzQ3LjQtMTA4Ny4yYy05My4yLTE5LjQtNjg5LjItMjUuMi0yOTg5LjktMjUuMmMtMzA1MC4xLDAtMjkzNy41LTMuOS0zMjMyLjYsOTEuM0M4NDUuNS00MDUxLjcsMzI5LjEtMzA3My4yLDU3Ny42LTIwODQuOWMxNjcsNjcxLjcsNzAwLjksMTE4Mi40LDEzODYuMiwxMzI4YzE1NS4zLDMzLDMzNS45LDM0LjksMzA4NywzMS4xbDI5MjItMy45TDgxMjguMS03NzQuNHoiLz48cGF0aCBkPSJNMjEwOS41LTEyMTMuMmMtMjM2LjktNTQuNC0zODQuNC0xMjguMi01OTQuMS0yOTUuMWMtMjQwLjctMTkyLjItNDMyLjktNTEwLjYtNDk1LjEtODIxLjNjLTE1MS40LTc2Myw0NjcuOS0xNTUzLjIsMTI1Ni4yLTE2MDcuNmM2MDUuNy00MC44LDExODQuMywzNjMuMSwxMzg2LjIsOTcwLjhjMjczLjcsODI1LjEtMzY4LjksMTczNS43LTEyNTIuMywxNzcyLjZDMjI5My45LTExODkuOSwyMTgzLjItMTE5NS43LDIxMDkuNS0xMjEzLjJ6IE0yNTE3LjItMTYxMy4yYzI0OC41LTM2LjksNTAwLjktMTg4LjMsNjI5LTM4MC41YzMyMi4zLTQ4OS4zLDE1OS4yLTExOTIuMS0zMzMuOS0xNDMyLjhjLTExMi42LTU2LjMtMzMwLjEtMTA4LjctNDUwLjQtMTA4LjdzLTMzMC4xLDUwLjUtNDQyLjcsMTA2LjhjLTMyNi4yLDE2NS00OTksNDY0LTQ5OSw4NjRjMCwyMzMsNDQuNiwzOTIuMiwxNTcuMyw1NjEuMWMxNjMuMSwyNDQuNiw0MzYuOCwzOTAuMiw3NjQuOSw0MDcuN0MyMzYzLjgtMTU5NS43LDI0NDMuNC0xNjAzLjQsMjUxNy4yLTE2MTMuMnoiLz48cGF0aCBkPSJNNDg3Ni4xLTE4MTUuMWMtMTQ5LjUtMzMtMjU2LjMtOTMuMi0zNzIuOC0yMTEuNmMtMTIyLjMtMTIyLjMtMjA1LjgtMjgzLjQtMjMzLTQ1Mi40Yy01Mi40LTMxMC42LDE1NS4zLTY3My43LDQ2OS44LTgyMS4zYzg3LjQtNDAuOCwxMzUuOS01MC41LDI2Mi4xLTUwLjVjMTM1LjksMCwxNzIuOCw3LjgsMjgzLjUsNjIuMWMzMzUuOSwxNjcsNTI2LjIsNTUzLjMsNDM0LjksODg5LjJDNTYxMy45LTIwMDMuNCw1MjI3LjUtMTczNS41LDQ4NzYuMS0xODE1LjF6IE01MjAwLjMtMjI2NS41Yzg1LjQtNjQuMSwxMzAuMS0xNzIuOCwxMzAuMS0zMTguNGMtMi0xOTgtNzkuNi0zMDguNy0yNDIuNy0zNDkuNWMtMTU3LjMtMzguOC0zMjIuMywzMy0zNzguNiwxNjdjLTE1LjUsMzYuOS0yNy4yLDEyNC4zLTI3LjIsMTk2LjFjMCwxNTkuMiw1Mi40LDI2NCwxNTUuMywzMjAuM0M0OTI4LjUtMjE5OS41LDUxMjQuNi0yMjA5LjIsNTIwMC4zLTIyNjUuNXoiLz48cGF0aCBkPSJNNjIyMS41LTE4MTdjLTEyNC4yLTUyLjQtMTI0LjItNTQuNC0xMjQuMi03NjQuOWMwLTU1My4zLDMuOS02NDguNSwzMS4xLTY4OS4zYzY3LjktMTAyLjksMjMzLTExMi42LDMyMi4zLTE5LjRjNDIuNyw0Ni42LDQ2LjYsNjgsNTIuNCwyODEuNWw3LjgsMjMxLjFoMjUwLjRjMjQ0LjYsMCwyNTAuNSwwLDMwOC43LDU0LjRjNzkuNiw2OS45LDkzLjIsMTY1LDM4LjgsMjUyLjRjLTU0LjQsODcuNC0xMDIuOSwxMDEtMzcwLjgsMTAxaC0yMzF2NzUuN3Y3Ny43bDMxMi42LDUuOGwzMTIuNiw1LjhsNTYuMyw2NC4xYzEwMSwxMTIuNiw2NiwyNjcuOS03MS44LDMyNi4yQzcwMjUuMy0xNzc2LjIsNjMxMC45LTE3NzguMiw2MjIxLjUtMTgxN3oiLz48cGF0aCBkPSJNNzcxMC43LTE4MDEuNWMtMTcyLjgtNTYuMy0xNzQuNy02Ny45LTE3NC43LTc4Mi40YzAtNjY0LDMuOS02ODkuMiwxMTYuNS03NDcuNWM3NS43LTM4LjgsMTMyLTM2LjksMjA3LjgsOS43Yzc5LjYsNDYuNiwxMDIuOSwxMzAuMSwxMDIuOSwzNjV2MTc4LjZoMjU0LjNoMjU0LjNsNTYuMyw1Ni4zYzk3LjEsOTksNjkuOSwyNjYtNTQuNCwzMzAuMWMtMjMuMywxMS42LTE0MS43LDIxLjMtMjc1LjcsMjEuM2gtMjM0Ljl2NzcuN3Y3Ny43aDI4MS41YzMxNC41LDAsMzc0LjcsMTUuNSw0MjcuMSwxMTYuNWMzOC44LDc1LjcsMzYuOSwxMzItOS43LDIwNy43Yy0yNS4yLDQwLjgtNjAuMiw2Ny45LTExMC43LDgxLjVDODQ3OS41LTE3ODcuOSw3NzY4LjktMTc4Mi4xLDc3MTAuNy0xODAxLjV6Ii8+PC9nPjwvZz4NCjwvc3ZnPg=="
    }
}

// Creation de l'application 1
let GpioApp = new Gpio(GlobalCoreXGetAppContentId())
// Ajout de l'application 1
GlobalCoreXAddApp(GpioApp.GetTitre(), GpioApp.GetImgSrc(),GpioApp.BuildViewConfigGpio.bind(GpioApp))
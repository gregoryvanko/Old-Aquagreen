class PlayGpio{
    constructor(HtmlId=GlobalCoreXGetAppContentId()){
        this._DivApp = document.getElementById(HtmlId)

        this._GpioConfig = null
    }
    /** Start de l'application */
    Start(){
        // Clear view
        this.ClearView()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Play Gpio", "", "Titre", ""))
        // Conteneur de la page
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // on construit le texte d'attente
        this._DivApp.appendChild(CoreXBuild.DivTexte("Waiting server data...","TxtPlayGpio","Text", "text-align: center;"))
        // on construit le texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorPlayGpio","Text","color:red; text-align: center;"))
        // On laisse un blanc avant la fin de la page
        this._DivApp.appendChild(CoreXBuild.Div("","","height:5vh;"))
        // Call API Get Config
        let ApiData = new Object()
        ApiData.Fct = "GetConfig"
        ApiData.Data = ""
        GlobalCallApiPromise("PlayGpio", ApiData, "", "").then((reponse)=>{
            document.getElementById("TxtPlayGpio").innerHTML = ""
            document.getElementById("ErrorPlayGpio").innerHTML = ""
            this._GpioConfig = reponse
            this.BuildViewPlayGpio()
        },(erreur)=>{
            document.getElementById("TxtPlayGpio").innerHTML = ""
            document.getElementById("ErrorPlayGpio").innerHTML = erreur
        })
    }
    /** Clear view */
    ClearView(){
        // Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
    }
    /** Get Titre de l'application */
    GetTitre(){
        return "Play Gpio"
    }
    /** Get Img Src de l'application */
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNjAgNjAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYwIDYwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8cGF0aCBkPSJNNDUuNTYzLDI5LjE3NGwtMjItMTVjLTAuMzA3LTAuMjA4LTAuNzAzLTAuMjMxLTEuMDMxLTAuMDU4QzIyLjIwNSwxNC4yODksMjIsMTQuNjI5LDIyLDE1djMwDQoJCWMwLDAuMzcxLDAuMjA1LDAuNzExLDAuNTMzLDAuODg0QzIyLjY3OSw0NS45NjIsMjIuODQsNDYsMjMsNDZjMC4xOTcsMCwwLjM5NC0wLjA1OSwwLjU2My0wLjE3NGwyMi0xNQ0KCQlDNDUuODM2LDMwLjY0LDQ2LDMwLjMzMSw0NiwzMFM0NS44MzYsMjkuMzYsNDUuNTYzLDI5LjE3NHogTTI0LDQzLjEwN1YxNi44OTNMNDMuMjI1LDMwTDI0LDQzLjEwN3oiLz4NCgk8cGF0aCBkPSJNMzAsMEMxMy40NTgsMCwwLDEzLjQ1OCwwLDMwczEzLjQ1OCwzMCwzMCwzMHMzMC0xMy40NTgsMzAtMzBTNDYuNTQyLDAsMzAsMHogTTMwLDU4QzE0LjU2MSw1OCwyLDQ1LjQzOSwyLDMwDQoJCVMxNC41NjEsMiwzMCwyczI4LDEyLjU2MSwyOCwyOFM0NS40MzksNTgsMzAsNTh6Ii8+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg=="
    }

    /**
     * Build view Play a GPIO
     */
    BuildViewPlayGpio(){
        let Conteneur = document.getElementById("Conteneur")
        // Vider le conteneur
        Conteneur.innerHTML = ""
        if (this._GpioConfig == null){
            Conteneur.appendChild(CoreXBuild.DivTexte("No Configuration saved","","Text",""))
        } else {
            // Draw Conteneur
            let FlexActionBox = CoreXBuild.DivFlexColumn("")
            Conteneur.appendChild(FlexActionBox)
            // Draw DropDow Gpio
            let Line1 = CoreXBuild.DivFlexRowStart("Line1")
            FlexActionBox.appendChild(Line1)
            Line1.appendChild(CoreXBuild.DivTexte("Gpio:", "", "Text", "width: 20%; text-align: right; margin-right: 2%;"))
            Line1.appendChild(this.BuildDropDownGpio())
            // Draw DropDown Delay
            let Line2 = CoreXBuild.DivFlexRowStart("Line1")
            FlexActionBox.appendChild(Line2)
            Line2.appendChild(CoreXBuild.DivTexte("Time:", "", "Text", "width: 20%; text-align: right; margin-right: 2%;"))
            Line2.appendChild(this.BuildDropDownDelay())
            // Draw button Start
            FlexActionBox.appendChild(CoreXBuild.Button("Start", this.StartGpio.bind(this),"Button ActionButton", "StartButton"))
        }
    }

    /**
     * Build DropDown Zone
     */
    BuildDropDownGpio(){
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "Gpio")
        DropDown.setAttribute("class", "Text DorpDown ActionWidth")
        this._GpioConfig.sort((a,b) =>  a.name.localeCompare(b.name))
        this._GpioConfig.forEach(element => {
            if(element.type == "Relais"){
                let option = document.createElement("option")
                option.setAttribute("value", element.name)
                option.innerHTML = element.name
                DropDown.appendChild(option)
            }
        });
        DropDown.onchange = this.UpdateDropDownDelay.bind(this)
        return DropDown
    }

    /**
     * Build DropDown Delay
     */
    BuildDropDownDelay(){
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "Delay")
        DropDown.setAttribute("class", "Text DorpDown ActionSmallWidth")
        let relay = this._GpioConfig.filter((value, index, array) => (value.type == "Relais"))
        if (relay.length > 0){
            let MaxDelay = relay[0].timeout
            for (let index = 1; index <= MaxDelay; index++){
                let option = document.createElement("option")
                option.setAttribute("value", index)
                option.innerHTML = index
                DropDown.appendChild(option)
            }
        }
        return DropDown
    }

    /**
     * Update DropDown Delay Option
     */
    UpdateDropDownDelay(){
        let DropDownZoneValue = document.getElementById("Gpio").value
        let DropDownDelay = document.getElementById("Delay")
        let length =  DropDownDelay.options.length
        for (let i = length-1; i >= 0; i--) {
            DropDownDelay.options[i] = null;
        }
        var found = this._GpioConfig.find((element) => { return element.name == DropDownZoneValue })
        if (found){
            let MaxDelay = found.timeout
            for (let index = 1; index <= MaxDelay; index++){
                let option = document.createElement("option")
                option.setAttribute("value", index)
                option.innerHTML = index
                DropDownDelay.appendChild(option)
            }
        }
    }

    /**
     * Start Zone
     */
    StartGpio(){
        let WorkerConfigList = new Array()
        let WorkerConfig = new Object()
        WorkerConfig.ZoneName = document.getElementById("Gpio").value
        WorkerConfig.Delay = document.getElementById("Delay").value
        WorkerConfigList.push(WorkerConfig)
        let Conteneur = document.getElementById("Conteneur")
        // Vider le conteneur
        Conteneur.innerHTML = ""
        let Line = CoreXBuild.DivFlexRowStart("Line")
        Conteneur.appendChild(Line)
        Line.appendChild(CoreXBuild.DivTexte(this.GetTime() + " Command play Gpio sended to server...", "", "Text", ""))
        // Send Start to serveur
        //GlobalSendSocketIo("PlayZone", "PlayWorker", WorkerConfigList)
    }

    GetTime(){
        let today = new Date();
        return today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    }
}
 
// Creation de l'application 1
let PlayGpioApp = new PlayGpio()
 
// Ajout de l'application 1
GlobalCoreXAddApp(PlayGpioApp.GetTitre(), PlayGpioApp.GetImgSrc(),PlayGpioApp.Start.bind(PlayGpioApp))
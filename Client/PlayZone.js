class PlayZone{
    constructor(HtmlId){
        this._DivApp = document.getElementById(HtmlId)
        this._GpioConfig = null
        this._Player = null
    }

    /** Start de l'application */
    Start(){
        // Clear view
        this.ClearView()
        // espace vide au dessus du conteneur
        this._DivApp.appendChild(CoreXBuild.Div("","","height:10vh;"))
        // Conteneur de la page
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
        // on construit le texte d'attente
        this._DivApp.appendChild(CoreXBuild.DivTexte("Waiting server data...","TxtPlayZone","Text", "text-align: center;"))
        // on construit le texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorPlayZone","Text","color:red; text-align: center;"))
        // SocketIo Listener
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('PlayZoneError', (Value) => {
            this.Error(Value)
        })
        SocketIo.on('BuildPlayZoneVue', (Value) => {
            this._GpioConfig = Value
            this.BuildPlayZoneVue(Conteneur)
        })
        SocketIo.on('BuildPlayerVue', (Value) => {
            document.getElementById("TxtPlayZone").innerHTML = ""
            this._Player = new Player(Conteneur,this.Start.bind(this))
            this._Player.Build(Value)
        })
        // Send status to serveur
        GlobalSendSocketIo("PlayZone", "Start", "")
    }
    
    /** Clear view */
    ClearView(){
        // Clear Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
        // Clear socket
        let SocketIo = GlobalGetSocketIo()
        if(SocketIo.hasListeners('PlayZoneError')){SocketIo.off('PlayZoneError')}
        if(SocketIo.hasListeners('BuildPlayZoneVue')){SocketIo.off('BuildPlayZoneVue')}
        if(SocketIo.hasListeners('BuildPlayerVue')){SocketIo.off('BuildPlayerVue')}
    }

    /**
     * Affichage du message d'erreur venant du serveur
     * @param {String} ErrorMsg Message d'erreur envoyé du serveur
     */
    Error(ErrorMsg){
        document.getElementById("TxtPlayZone").innerHTML = ""
        document.getElementById("ErrorPlayZone").innerHTML = ErrorMsg
    }

    /**
     * Construit la vue permettant de lancer le fonctionnement d'une zone
     * @param {array} GpioConfig Liste des objets config
     * @param {HtmlElement} Conteneur Html Element Conteneur de la vue
     */
    BuildPlayZoneVue(Conteneur){
        delete this._Player
        this._Player = null
        Conteneur.innerHTML =""
        document.getElementById("TxtPlayZone").innerHTML = ""
        document.getElementById("ErrorPlayZone").innerHTML = ""
        let ActionBox = CoreXBuild.Div("","ActionBox")
        Conteneur.appendChild(ActionBox)
        let FlexActionBox = CoreXBuild.DivFlexColumn("")
        ActionBox.appendChild(FlexActionBox)
        FlexActionBox.appendChild(CoreXBuild.DivTexte("Play a zone", "", "SousTitre", "margin-top:2%"))
        if (this._GpioConfig != null){
            FlexActionBox.appendChild(this.BuildDropDownZone())
            FlexActionBox.appendChild(this.BuildDropDownDelay())
            FlexActionBox.appendChild(CoreXBuild.Button("Start", this.StartZone.bind(this),"Button ActionSmallWidth", "StartButton"))
        } else {
            FlexActionBox.appendChild(CoreXBuild.DivTexte("Configuration not defined in DB...", "", "Text", ""))
        }
    }

    /**
     * Build DropDown Zone
     */
    BuildDropDownZone(){
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "Zone")
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
        let DropDownZoneValue = document.getElementById("Zone").value
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
    StartZone(){
        let WorkerConfigList = new Array()
        let WorkerConfig = new Object()
        WorkerConfig.ZoneName = document.getElementById("Zone").value
        WorkerConfig.Delay = document.getElementById("Delay").value
        WorkerConfigList.push(WorkerConfig)
        // Send status to serveur
        GlobalSendSocketIo("PlayZone", "PlayWorker", WorkerConfigList)
        document.getElementById("Conteneur").innerHTML = ""
        document.getElementById("TxtPlayZone").innerHTML = "Command send to server..."
        document.getElementById("ErrorPlayZone").innerHTML = ""
    }

    /** Get Titre de l'application */
    GetTitre(){
        return "Play Zone"
    }
    /** Get Img Src de l'application */
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDc4LjcwMyA0NzguNzAzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzguNzAzIDQ3OC43MDM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNNDU0LjIsMTg5LjEwMWwtMzMuNi01LjdjLTMuNS0xMS4zLTgtMjIuMi0xMy41LTMyLjZsMTkuOC0yNy43YzguNC0xMS44LDcuMS0yNy45LTMuMi0zOC4xbC0yOS44LTI5LjgNCgkJCWMtNS42LTUuNi0xMy04LjctMjAuOS04LjdjLTYuMiwwLTEyLjEsMS45LTE3LjEsNS41bC0yNy44LDE5LjhjLTEwLjgtNS43LTIyLjEtMTAuNC0zMy44LTEzLjlsLTUuNi0zMy4yDQoJCQljLTIuNC0xNC4zLTE0LjctMjQuNy0yOS4yLTI0LjdoLTQyLjFjLTE0LjUsMC0yNi44LDEwLjQtMjkuMiwyNC43bC01LjgsMzRjLTExLjIsMy41LTIyLjEsOC4xLTMyLjUsMTMuN2wtMjcuNS0xOS44DQoJCQljLTUtMy42LTExLTUuNS0xNy4yLTUuNWMtNy45LDAtMTUuNCwzLjEtMjAuOSw4LjdsLTI5LjksMjkuOGMtMTAuMiwxMC4yLTExLjYsMjYuMy0zLjIsMzguMWwyMCwyOC4xDQoJCQljLTUuNSwxMC41LTkuOSwyMS40LTEzLjMsMzIuN2wtMzMuMiw1LjZjLTE0LjMsMi40LTI0LjcsMTQuNy0yNC43LDI5LjJ2NDIuMWMwLDE0LjUsMTAuNCwyNi44LDI0LjcsMjkuMmwzNCw1LjgNCgkJCWMzLjUsMTEuMiw4LjEsMjIuMSwxMy43LDMyLjVsLTE5LjcsMjcuNGMtOC40LDExLjgtNy4xLDI3LjksMy4yLDM4LjFsMjkuOCwyOS44YzUuNiw1LjYsMTMsOC43LDIwLjksOC43YzYuMiwwLDEyLjEtMS45LDE3LjEtNS41DQoJCQlsMjguMS0yMGMxMC4xLDUuMywyMC43LDkuNiwzMS42LDEzbDUuNiwzMy42YzIuNCwxNC4zLDE0LjcsMjQuNywyOS4yLDI0LjdoNDIuMmMxNC41LDAsMjYuOC0xMC40LDI5LjItMjQuN2w1LjctMzMuNg0KCQkJYzExLjMtMy41LDIyLjItOCwzMi42LTEzLjVsMjcuNywxOS44YzUsMy42LDExLDUuNSwxNy4yLDUuNWwwLDBjNy45LDAsMTUuMy0zLjEsMjAuOS04LjdsMjkuOC0yOS44YzEwLjItMTAuMiwxMS42LTI2LjMsMy4yLTM4LjENCgkJCWwtMTkuOC0yNy44YzUuNS0xMC41LDEwLjEtMjEuNCwxMy41LTMyLjZsMzMuNi01LjZjMTQuMy0yLjQsMjQuNy0xNC43LDI0LjctMjkuMnYtNDIuMQ0KCQkJQzQ3OC45LDIwMy44MDEsNDY4LjUsMTkxLjUwMSw0NTQuMiwxODkuMTAxeiBNNDUxLjksMjYwLjQwMWMwLDEuMy0wLjksMi40LTIuMiwyLjZsLTQyLDdjLTUuMywwLjktOS41LDQuOC0xMC44LDkuOQ0KCQkJYy0zLjgsMTQuNy05LjYsMjguOC0xNy40LDQxLjljLTIuNyw0LjYtMi41LDEwLjMsMC42LDE0LjdsMjQuNywzNC44YzAuNywxLDAuNiwyLjUtMC4zLDMuNGwtMjkuOCwyOS44Yy0wLjcsMC43LTEuNCwwLjgtMS45LDAuOA0KCQkJYy0wLjYsMC0xLjEtMC4yLTEuNS0wLjVsLTM0LjctMjQuN2MtNC4zLTMuMS0xMC4xLTMuMy0xNC43LTAuNmMtMTMuMSw3LjgtMjcuMiwxMy42LTQxLjksMTcuNGMtNS4yLDEuMy05LjEsNS42LTkuOSwxMC44bC03LjEsNDINCgkJCWMtMC4yLDEuMy0xLjMsMi4yLTIuNiwyLjJoLTQyLjFjLTEuMywwLTIuNC0wLjktMi42LTIuMmwtNy00MmMtMC45LTUuMy00LjgtOS41LTkuOS0xMC44Yy0xNC4zLTMuNy0yOC4xLTkuNC00MS0xNi44DQoJCQljLTIuMS0xLjItNC41LTEuOC02LjgtMS44Yy0yLjcsMC01LjUsMC44LTcuOCwyLjVsLTM1LDI0LjljLTAuNSwwLjMtMSwwLjUtMS41LDAuNWMtMC40LDAtMS4yLTAuMS0xLjktMC44bC0yOS44LTI5LjgNCgkJCWMtMC45LTAuOS0xLTIuMy0wLjMtMy40bDI0LjYtMzQuNWMzLjEtNC40LDMuMy0xMC4yLDAuNi0xNC44Yy03LjgtMTMtMTMuOC0yNy4xLTE3LjYtNDEuOGMtMS40LTUuMS01LjYtOS0xMC44LTkuOWwtNDIuMy03LjINCgkJCWMtMS4zLTAuMi0yLjItMS4zLTIuMi0yLjZ2LTQyLjFjMC0xLjMsMC45LTIuNCwyLjItMi42bDQxLjctN2M1LjMtMC45LDkuNi00LjgsMTAuOS0xMGMzLjctMTQuNyw5LjQtMjguOSwxNy4xLTQyDQoJCQljMi43LTQuNiwyLjQtMTAuMy0wLjctMTQuNmwtMjQuOS0zNWMtMC43LTEtMC42LTIuNSwwLjMtMy40bDI5LjgtMjkuOGMwLjctMC43LDEuNC0wLjgsMS45LTAuOGMwLjYsMCwxLjEsMC4yLDEuNSwwLjVsMzQuNSwyNC42DQoJCQljNC40LDMuMSwxMC4yLDMuMywxNC44LDAuNmMxMy03LjgsMjcuMS0xMy44LDQxLjgtMTcuNmM1LjEtMS40LDktNS42LDkuOS0xMC44bDcuMi00Mi4zYzAuMi0xLjMsMS4zLTIuMiwyLjYtMi4yaDQyLjENCgkJCWMxLjMsMCwyLjQsMC45LDIuNiwyLjJsNyw0MS43YzAuOSw1LjMsNC44LDkuNiwxMCwxMC45YzE1LjEsMy44LDI5LjUsOS43LDQyLjksMTcuNmM0LjYsMi43LDEwLjMsMi41LDE0LjctMC42bDM0LjUtMjQuOA0KCQkJYzAuNS0wLjMsMS0wLjUsMS41LTAuNWMwLjQsMCwxLjIsMC4xLDEuOSwwLjhsMjkuOCwyOS44YzAuOSwwLjksMSwyLjMsMC4zLDMuNGwtMjQuNywzNC43Yy0zLjEsNC4zLTMuMywxMC4xLTAuNiwxNC43DQoJCQljNy44LDEzLjEsMTMuNiwyNy4yLDE3LjQsNDEuOWMxLjMsNS4yLDUuNiw5LjEsMTAuOCw5LjlsNDIsNy4xYzEuMywwLjIsMi4yLDEuMywyLjIsMi42djQyLjFINDUxLjl6Ii8+DQoJCTxwYXRoIGQ9Ik0yMzkuNCwxMzYuMDAxYy01NywwLTEwMy4zLDQ2LjMtMTAzLjMsMTAzLjNzNDYuMywxMDMuMywxMDMuMywxMDMuM3MxMDMuMy00Ni4zLDEwMy4zLTEwMy4zUzI5Ni40LDEzNi4wMDEsMjM5LjQsMTM2LjAwMQ0KCQkJeiBNMjM5LjQsMzE1LjYwMWMtNDIuMSwwLTc2LjMtMzQuMi03Ni4zLTc2LjNzMzQuMi03Ni4zLDc2LjMtNzYuM3M3Ni4zLDM0LjIsNzYuMyw3Ni4zUzI4MS41LDMxNS42MDEsMjM5LjQsMzE1LjYwMXoiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg=="
    }
}

// Creation de l'application 1
let PlayZoneApp = new PlayZone(GlobalCoreXGetAppContentId())
// Ajout de l'application 1
GlobalCoreXAddApp(PlayZoneApp.GetTitre(), PlayZoneApp.GetImgSrc(),PlayZoneApp.Start.bind(PlayZoneApp))
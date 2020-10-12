class PlayProgram{
    constructor(){
        this._DivApp = document.getElementById(GlobalCoreXGetAppContentId())
        this._GpioConfig = null
        this._ListOfProgram = null
        this._CurrentProgramId = null
    }
    /** Start de l'application */
    Start(){
        // Clear view
        this.ClearView()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Programs", "PlayProgramTitre", "Titre", "margin-top:2%"))
        // Conteneur de la page
        this._DivApp.appendChild(CoreXBuild.DivFlexColumn("Conteneur"))
        // Texte d'info
        this._DivApp.appendChild(CoreXBuild.DivTexte("Get Configuration...","TxtInfo","Text","text-align: center;"))
        // Texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","TxtError","Text","color:red; text-align: center;"))
        // On laisse un blanc avant la fin de la page
        this._DivApp.appendChild(CoreXBuild.Div("","","height:5vh;"))
        // SocketIo Listener
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('PlayProgramError', (Value) => {
            this.Error(Value)
        })
        SocketIo.on('PlayProgramAllConfig', (Value) => {
            this._GpioConfig = Value.GpioConfig
            this._ListOfProgram = Value.ProgramList
            this.ShowListOfProgram()
        })
        // Send status to serveur
        GlobalSendSocketIo("PlayProgram", "GetAllConfig", "")
    }
    /**
     * Clear view
     */
    ClearView(){
        // Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
        // Clear socket
        let SocketIo = GlobalGetSocketIo()
        if(SocketIo.hasListeners('PlayProgramError')){SocketIo.off('PlayProgramError')}
        if(SocketIo.hasListeners('PlayProgramAllConfig')){SocketIo.off('PlayProgramAllConfig')}
    }
    /**
     * Affichage du message d'erreur venant du serveur
     * @param {String} ErrorMsg Message d'erreur envoyé du serveur
     */
    Error(ErrorMsg){
        document.getElementById("Conteneur").innerHTML = ""
        document.getElementById("TxtInfo").innerHTML = ""
        document.getElementById("TxtError").innerHTML = ErrorMsg
    }

    /**
     * Show view: Program Config 
     * @param {Array} Config Liste de configuration de programme
     */
    ShowListOfProgram(){
        debugger
        // Clear message
        document.getElementById("TxtInfo").innerHTML = ""
        document.getElementById("TxtError").innerHTML = ""
        // Selection du conteneur
        let conteneur = document.getElementById("Conteneur")
        conteneur.innerHTML = ""
        // Liste des prgramme est null
        if (this._ListOfProgram == null) {
            // Affichag du message : pas de ListOfProgram
            conteneur.appendChild(CoreXBuild.DivTexte("No List Of Program defined...","","Text","text-align: center;"))
        } else {
            // Affichager la config des programme
            conteneur.appendChild(CoreXBuild.DivTexte("ToDo","","Text","text-align: center;"))
        }
        // Ajout du bouton Add Program
        conteneur.appendChild(CoreXBuild.Button("Add Program", this.ShowProgram.bind(this, null),"Button", "AddConfig"))
    }

    /**
     * Show view: Add Config 
     */
    ShowProgram(ProgramId = null){
        // Si ProgramId = null alors nouveau programme a creer
        if (ProgramId == null){
            let newprogram = new Object()
            newprogram.Name = "New Program"
            newprogram.ListOfSteps = []
            // si this._ListOfProgram = null alors creation du premier program
            if (this._ListOfProgram == null){
                let newliste = []
                newliste.push(newprogram)
                this._ListOfProgram = newliste
            } else {
                this._ListOfProgram.push(newprogram)
            }
            this._CurrentProgramId = this._ListOfProgram.length -1
        } else {
            this._CurrentProgramId = ProgramId
        }
        // Selection du conteneur
        let conteneur = document.getElementById("Conteneur") 
        conteneur.innerHTML = ""
        // Changement du titre: new program
        document.getElementById("PlayProgramTitre").innerHTML = "New Program"
        // Nom du programme
        let DivDisplayProgramName = CoreXBuild.DivFlexRowStart("")
        DivDisplayProgramName.style.width='90%'
        Conteneur.appendChild(DivDisplayProgramName)
        DivDisplayProgramName.appendChild(CoreXBuild.DivTexte("Program Name : ","","Text",""))
        let ProgramName = this._ListOfProgram[this._CurrentProgramId].Name
        let InputProgramName = CoreXBuild.Input("ProgramName",ProgramName,"Input WidthSmall","","text","ProgramName","Set Program Name")
        InputProgramName.onfocus = function(){InputProgramName.placeholder = ""}
        //InputProgramName.onblur = function(){if(InputProgramName.value==""){InputProgramName.value = "New Program"}}
        InputProgramName.onblur = this.ChangProgramName.bind(this)
        DivDisplayProgramName.appendChild(InputProgramName)
        // liste des steps
        let DivDisplayProgramList = CoreXBuild.DivFlexRowAr("")
        DivDisplayProgramList.style.width='90%'
        Conteneur.appendChild(DivDisplayProgramList)
        let ListOfSteps = this._ListOfProgram[this._CurrentProgramId].ListOfSteps
        if (ListOfSteps.length == 0){
            // Affichag du message : pas de List Of Step
            DivDisplayProgramList.appendChild(CoreXBuild.DivTexte("No List of steps defined...","","Text","text-align: center;"))
        } else {
            DivDisplayProgramList.appendChild(CoreXBuild.DivTexte("ToDo","","Text","text-align: center;"))
        }
        // Bouttons
        let DivBouttons = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(DivBouttons)
        DivBouttons.appendChild(CoreXBuild.Button("Back", this.ShowListOfProgram.bind(this),"Button", "Back"))
        DivBouttons.appendChild(CoreXBuild.Button("Add Step", this.ShowAddStep.bind(this),"Button", "AddStep"))
    }

    /**
     * Update du nom du programme lorsque l on quitte le input texte
     */
    ChangProgramName(){
        let InputProgramName = document.getElementById("ProgramName") 
        if(InputProgramName.value==""){InputProgramName.value = "New Program"}
        this._ListOfProgram[this._CurrentProgramId].Name = InputProgramName.value
    }

    /**
     * Show view : Add step
     */
    ShowAddStep(){
        // Sort par displayname
        this._GpioConfig.sort((a,b) =>  a.custom.displayname.localeCompare(b.custom.displayname))
        // Selection du conteneur
        let conteneur = document.getElementById("Conteneur") 
        conteneur.innerHTML = ""
        let ActionBox = CoreXBuild.Div("","ActionBox")
        Conteneur.appendChild(ActionBox)
        let FlexActionBox = CoreXBuild.DivFlexColumn("")
        ActionBox.appendChild(FlexActionBox)
        FlexActionBox.appendChild(this.BuildDropDownRelaisType())
        FlexActionBox.appendChild(this.BuildDropDownZone())
        FlexActionBox.appendChild(this.BuildDropDownDelay())
        let DivBouttons = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(DivBouttons)
        DivBouttons.appendChild(CoreXBuild.Button("Cancel", this.ShowProgram.bind(this, this._CurrentProgramId),"Button", ""))
        DivBouttons.appendChild(CoreXBuild.Button("Add", this.ClickAddStep.bind(this),"Button", ""))
    }
    /**
     * Build DropDown Type de relais
     */
    BuildDropDownRelaisType(){
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "Type")
        DropDown.setAttribute("class", "Text DorpDown ActionWidth")
        // liste des differents type
        let ListOfType = [...new Set(this._GpioConfig.map(item => item.custom.relaistype))]
        ListOfType.forEach(element => {
            let option = document.createElement("option")
            option.setAttribute("value", element)
            option.innerHTML = element
            DropDown.appendChild(option)
        });
        DropDown.onchange = this.UpdateDropDownZone.bind(this)
        return DropDown
    }
    /**
     * Build DropDown Zone
     */
    BuildDropDownZone(){
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "Zone")
        DropDown.setAttribute("class", "Text DorpDown ActionWidth")
        // liste des differents type
        let ListOfType = [...new Set(this._GpioConfig.map(item => item.custom.relaistype))]
        let TheRelaisType = ListOfType[0]
        this._GpioConfig.forEach(element => {
            if(element.custom.relaistype == TheRelaisType){
                let option = document.createElement("option")
                option.setAttribute("value", element.name)
                option.innerHTML = element.custom.displayname
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

        // liste des differents type
        let ListOfType = [...new Set(this._GpioConfig.map(item => item.custom.relaistype))]
        let TheRelaisType = ListOfType[0]
        let found = false
        let MaxDelay = null
        this._GpioConfig.forEach(element => {
            if(element.custom.relaistype == TheRelaisType){
                if (found == false){
                    found = true
                    MaxDelay = element.timeout
                }
            }
        });
        for (let index = 1; index <= MaxDelay; index++){
            let option = document.createElement("option")
            option.setAttribute("value", index)
            option.innerHTML = index
            DropDown.appendChild(option)
        }
        return DropDown
    }
    /**
     * Update DropDown Zone
     */
    UpdateDropDownZone(){
        // get du nom du type
        let DropDownType = document.getElementById("Type").value
        // delete du contneu drop down Zone
        let DropDownZone = document.getElementById("Zone")
        let length =  DropDownZone.options.length
        for (let i = length-1; i >= 0; i--) {
            DropDownZone.options[i] = null;
        }
        // delete du contneu dropdown Delay
        let DropDownDelay = document.getElementById("Delay")
        let length2 =  DropDownDelay.options.length
        for (let i = length2-1; i >= 0; i--) {
            DropDownDelay.options[i] = null;
        }
        // Nouveau contenu du dropdown Zone
        this._GpioConfig.forEach(element => {
            if(element.custom.relaistype == DropDownType){
                let option = document.createElement("option")
                option.setAttribute("value", element.name)
                option.innerHTML = element.custom.displayname
                DropDownZone.appendChild(option)
            }
        });
        // Nouveau contenu du dropdown Zone
        let found = false
        let MaxDelay = null
        this._GpioConfig.forEach(element => {
            if(element.custom.relaistype == DropDownType){
                if (found == false){
                    found = true
                    MaxDelay = element.timeout
                }
            }
        });
        for (let index = 1; index <= MaxDelay; index++){
            let option = document.createElement("option")
            option.setAttribute("value", index)
            option.innerHTML = index
            DropDownDelay.appendChild(option)
        }
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
     * Click sur le bouton add step
     */
    ClickAddStep(){
        alert("ToDo")
    }

    /** Get Titre de l'application */
    GetTitre(){
        return "Progams"
    }
    /** Get Img Src de l'application */
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5vbmxpbmV3ZWJmb250cy5jb20vaWNvbiA8L21ldGFkYXRhPg0KPGc+PHBhdGggZD0iTTk4My45LDQyMC40YzYuMS0xMi4yLDYuMS0zMC42LDAtNDIuOUw5NDEsMzM0LjZjLTYuMS02LjEtMTIuMi02LjEtMjQuNS02LjFjLTYuMSwwLTE4LjQsMC0yNC41LDYuMUw1NjEuMyw2NTkuMnYyNC41Vjc0NWg5OEw5ODMuOSw0MjAuNHogTTE5My44LDE5My43aDYxMi41VjI1NUgxOTMuOFYxOTMuN0wxOTMuOCwxOTMuN3ogTTE5My44LDM3Ny41aDU2OS42bDQyLjktNDIuOXYtMTguNEgxOTMuOFYzNzcuNXogTTE5My44LDY4My43SDUwMFY3NDVIMTkzLjhWNjgzLjdMMTkzLjgsNjgzLjd6IE0xOTMuOCw1MDBoNDQ3LjFsNjEuMi02MS4zSDE5My44VjUwMHogTTkyOC43LDU2MS4ydjI0NWMwLDY3LjQtNTUuMSwxMjIuNS0xMjIuNSwxMjIuNUgxOTMuOGMtNjcuNCwwLTEyMi41LTU1LjEtMTIyLjUtMTIyLjVWMTkzLjdjMC02Ny40LDU1LjEtMTIyLjUsMTIyLjUtMTIyLjVoNjEyLjVjNjcuNCwwLDEyMi41LDU1LjEsMTIyLjUsMTIyLjV2NzMuNWMxOC40LDAsMzYuOCwxMi4yLDU1LjEsMjQuNWw2LjEsNi4xVjE5My44Qzk5MCw4OS42LDkxMC40LDEwLDgwNi4zLDEwSDE5My44Qzg5LjYsMTAsMTAsODkuNiwxMCwxOTMuOHY2MTIuNUMxMCw5MTAuNCw4OS42LDk5MCwxOTMuOCw5OTBoNjEyLjVDOTEwLjQsOTkwLDk5MCw5MTAuNCw5OTAsODA2LjNWNTAwTDkyOC43LDU2MS4yeiBNMTkzLjgsNjIyLjVoMzI0LjZsNi4xLTYuMWw1NS4xLTU1LjFIMTkzLjhWNjIyLjV6Ii8+PC9nPg0KPC9zdmc+"
    }
}

// Creation de l'application 1
let PlayProgramApp = new PlayProgram()

// Ajout de l'application 1
GlobalCoreXAddApp(PlayProgramApp.GetTitre(), PlayProgramApp.GetImgSrc(),PlayProgramApp.Start.bind(PlayProgramApp))
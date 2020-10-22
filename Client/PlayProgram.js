class PlayProgram{
    constructor(){
        this._DivApp = document.getElementById(GlobalCoreXGetAppContentId())
        this._GpioConfig = null
        this._ListOfProgram = null
        this._CurrentProgramId = null
        this._ShowUpdateView = false
    }
    /** Start de l'application */
    Start(){
        // Clear view
        this.ClearView()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Programs", "PlayProgramTitre", "Titre", "margin-top:2%"))
        // Conteneur de la page
        let Conteneur = CoreXBuild.DivFlexColumn("Conteneur")
        this._DivApp.appendChild(Conteneur)
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
            this._ListOfProgram = this.AddDisplayNameOfSteps(Value.ProgramList)
            this.ShowListOfProgram()
        })
        SocketIo.on('PlayProgramBuildPlayerVue', (Value) => {
            // Changement du titre: Play program
            document.getElementById("PlayProgramTitre").innerHTML = "Play Program"
            document.getElementById("TxtInfo").innerHTML = ""
            this._Player = new Player(Conteneur,this.Start.bind(this))
            this._Player.Build(Value)
        })
        // Send status to serveur
        GlobalSendSocketIo("PlayProgram", "StartClientVue", "")
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
        if(SocketIo.hasListeners('PlayProgramBuildPlayerVue')){SocketIo.off('PlayProgramBuildPlayerVue')}
        // Clear variable
        this._GpioConfig = null
        this._ListOfProgram = null
        this._CurrentProgramId = null
        this._ShowUpdateView = false
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
     * ajoute un displayname aux steps de la liste des configuration
     * @param {Array} List Liste des configuration sauvée en DB
     */
    AddDisplayNameOfSteps(List){
        let NewList = []
        if(List != null){
            List.forEach(element => {
                let NewObject = new Object()
                NewObject.Name = element.Name
                NewObject.ListOfSteps = []
                element.ListOfSteps.forEach(elementListOfStep => {
                    let setp = new Object()
                    setp.RelaisName = elementListOfStep.RelaisName
                    let Element = this._GpioConfig.find(element => element.name == setp.RelaisName)
                    if (Element == undefined){
                        setp.DisplayName = "Not Found"
                    } else {
                        setp.DisplayName = Element.custom.displayname
                    }
                    setp.Delay = elementListOfStep.Delay
                    NewObject.ListOfSteps.push(setp)
                });
                NewList.push(NewObject)
            });
        }
        return NewList
    }

    /**
     * Show view: Program Config 
     * @param {Array} Config Liste de configuration de programme
     */
    ShowListOfProgram(){
        // Clear message
        document.getElementById("TxtInfo").innerHTML = ""
        document.getElementById("TxtError").innerHTML = ""
        // Selection du conteneur
        let conteneur = document.getElementById("Conteneur")
        conteneur.innerHTML = ""
        // Liste des prgramme
        let DivListe = CoreXBuild.Div("", "InputBox", "")
        Conteneur.appendChild(DivListe)
        if ((this._ListOfProgram == null)||(this._ListOfProgram.length == 0)) {
            // Affichag du message : pas de ListOfProgram
            DivListe.appendChild(CoreXBuild.DivTexte("No List of Program defined...","","Text","text-align: center;"))
        } else {
            // Affichager la config des programme
            this._ListOfProgram.forEach((element,index) => {
                DivListe.appendChild(this.BuildUiProgram(element.Name, index))
            });
        }
        // Ajout du bouton Add Program
        let DivBouttons = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(DivBouttons)
        if(this._ShowUpdateView){
            // Changement du titre: new program
            document.getElementById("PlayProgramTitre").innerHTML = "Update Program"
            DivBouttons.appendChild(CoreXBuild.Button("Back", this.ClickOnCancelUpdate.bind(this),"Button", "AddConfig"))
            DivBouttons.appendChild(CoreXBuild.Button("Add Program", this.ShowProgram.bind(this, null),"Button", "AddConfig"))
        } else {
            // Changement du titre: program
            document.getElementById("PlayProgramTitre").innerHTML = "Programs"
            DivBouttons.appendChild(CoreXBuild.Button("Update Program", this.ClickOnUpdateProgram.bind(this),"Button", "AddConfig"))
        }
    }

    /**
     * Construit la représentation visuel d'un programme
     * @param {String} Name Nom du programme
     * @param {interger} Index numero de l'indexe de ce program dans le array
     */
    BuildUiProgram(Name, Index){
        let output = CoreXBuild.Div("", "ProgramBox Hover", "")
        if (this._ShowUpdateView){
            output.style.borderColor = "green"
        }
        output.addEventListener("click", this.ClickOnProgram.bind(this,Index))
        let DivData = CoreXBuild.DivFlexRowAr("")
        DivData.appendChild(CoreXBuild.DivTexte(Name, "","Text",""))
        output.appendChild(DivData)
        return output
    }

    /**
     * Click on Upate Program boutton
     */
    ClickOnUpdateProgram(){
        this._ShowUpdateView = true
        this.ShowListOfProgram()
    }

    /**
     * Click on Cancle update program boutton
     */
    ClickOnCancelUpdate(){
        this._ShowUpdateView = false
        this.ShowListOfProgram()
    }

    /**
     * Click on program
     * @param {interger} Index indexe du program dans la liste des programmes
     */
    ClickOnProgram(Index){
        // Si on est en mode edit
        if(this._ShowUpdateView){
            this.ShowProgram(Index)
        } else {
            // on joue le progrmame si il y a plus que un step a faire
            if(this._ListOfProgram[Index].ListOfSteps.length > 0){
                // Send status to serveur
                GlobalSendSocketIo("PlayProgram", "PlayWorker", this._ListOfProgram[Index].ListOfSteps)
                document.getElementById("Conteneur").innerHTML = ""
                document.getElementById("TxtInfo").innerHTML = "Command send to server..."
                document.getElementById("TxtError").innerHTML = ""
            } else {
                // Selection du conteneur
                let conteneur = document.getElementById("Conteneur")
                conteneur.innerHTML = ""
                conteneur.appendChild(CoreXBuild.DivTexte("No step defined in this program...","","Text","text-align: center;"))
                conteneur.appendChild(CoreXBuild.Button("Back", this.ShowListOfProgram.bind(this),"Button", "AddConfig"))
            }
        }
        
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
        if(ProgramId == null){
            document.getElementById("PlayProgramTitre").innerHTML = "New Program"
        } else {
            document.getElementById("PlayProgramTitre").innerHTML = "Update Program"
        }
        // Nom du programme
        let DivInput = CoreXBuild.Div("", "InputBox", "")
        Conteneur.appendChild(DivInput)
        DivInput.appendChild(CoreXBuild.DivTexte("Name of the program","","Text","width: 100%;"))
        let ProgramName = this._ListOfProgram[this._CurrentProgramId].Name
        let InputProgramName = CoreXBuild.Input("ProgramName",ProgramName,"Input","","text","ProgramName","Set Program Name")
        InputProgramName.onfocus = function(){InputProgramName.placeholder = ""}
        InputProgramName.onblur = this.ChangProgramName.bind(this)
        DivInput.appendChild(InputProgramName)
        // Espace blanc
        Conteneur.appendChild(CoreXBuild.Div("","","height:4vh;"))
        // liste des steps
        let DivStep = CoreXBuild.Div("", "InputBox", "")
        Conteneur.appendChild(DivStep)
        DivStep.appendChild(CoreXBuild.DivTexte("Liste of steps","","Text","width: 100%;"))
        let ListOfSteps = this._ListOfProgram[this._CurrentProgramId].ListOfSteps
        if (ListOfSteps.length == 0){
            // Affichag du message : pas de List Of Step
            DivStep.appendChild(CoreXBuild.DivTexte("No List of steps defined...","","Text","text-align: center;"))
        } else {
            let Container = CoreXBuild.Div("", "Container", "")
            Container.addEventListener("dragover", e =>{
                e.preventDefault()
                const afterElement = this.GetDragAfterElement(Container, e.clientY)
                const draggeable = document.querySelector(".Dragging")
                if(afterElement == null){
                    Container.appendChild(draggeable)
                } else {
                    Container.insertBefore(draggeable, afterElement)
                }
            })
            ListOfSteps.forEach((element,index) => {
                Container.appendChild(this.BuildUiStep(element.RelaisName, element.DisplayName, element.Delay, index))
            });
            DivStep.appendChild(Container)
        }
        // Bouttons
        let DivBouttons = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(DivBouttons)
        DivBouttons.appendChild(CoreXBuild.Button("Back", this.ShowListOfProgram.bind(this),"Button", "Back"))
        DivBouttons.appendChild(CoreXBuild.Button("Add Step", this.ShowAddStep.bind(this, false, null),"Button", "AddStep"))
        DivBouttons.appendChild(CoreXBuild.Button("Delete", this.ClickDeleteProgram.bind(this),"Button", "AddStep"))
    }

    // User for drag and drop
    GetDragAfterElement(container, y){
        const draggableElements = [...container.querySelectorAll('.Draggable:not(.Dragging)')]
        return draggableElements.reduce((closest, child)=>{
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height / 2
            if (offset < 0 && offset > closest.offset){
                return {offset: offset, element: child}
            } else {
                return closest
            }
        },{offset: Number.NEGATIVE_INFINITY}).element
    }

    /**
     * Supprime un Program de la liste des program
     * @param {number} index index du program a supprimer de la liste des program
     */
    ClickDeleteProgram(){
        if(confirm("Do you want to delete this Program?")){
            this._ListOfProgram.splice(this._CurrentProgramId, 1)
            this._CurrentProgramId = null
            this.ShowListOfProgram()
            this.SaveListOfProgram()
        }
    }

    BuildUiStep(RelaisName, Name, Delay, index){
        let output = CoreXBuild.Div("", "ProgramBox Draggable", "")
        output.setAttribute("data-relaisName",RelaisName)
        output.setAttribute("data-displayName",Name)
        output.setAttribute("data-delay",Delay)
        output.setAttribute("data-index",index)
        output.setAttribute("draggable","true")
        output.addEventListener("click", this.ClickOnStep.bind(this,output))

        output.addEventListener("dragstart", ()=>{
            output.classList.add("Dragging")
        })
        output.addEventListener("dragend", ()=>{
            output.classList.remove("Dragging")
            this.UpdateOrderListOfStep()
        })

        let DivData = CoreXBuild.DivFlexRowStart("")
        DivData.appendChild(CoreXBuild.DivTexte(Name, "","Text","text-align: left; width:55%;"))
        DivData.appendChild(CoreXBuild.DivTexte("Timing: " + Delay + "min","","Text","text-align: left; width:40%; color: grey;"))
        output.appendChild(DivData)
        return output
    }

    /**
     * Update l'order de la liste des step dans le arry this._ListOfProgram apres un drag and drop
     */
    UpdateOrderListOfStep(){
        const Elements = [...document.querySelectorAll('.Draggable')]
        let NewListOfStep = []
        Elements.forEach((element,index) => {
            let NewStep = new Object()
            NewStep.RelaisName = element.dataset.relaisname
            NewStep.DisplayName = element.dataset.displayname
            NewStep.Delay = element.dataset.delay
            NewListOfStep.push(NewStep)
            element.dataset.index = index
        });
        this._ListOfProgram[this._CurrentProgramId].ListOfSteps = NewListOfStep
        this.SaveListOfProgram()
    }

    ClickOnStep(element){
        let index =  element.dataset.index
        this.ShowAddStep(true, index)
    }

    /**
     * Update du nom du programme lorsque l on quitte le input texte
     */
    ChangProgramName(){
        let InputProgramName = document.getElementById("ProgramName") 
        if(InputProgramName.value==""){InputProgramName.value = "New Program"}
        this._ListOfProgram[this._CurrentProgramId].Name = InputProgramName.value
        this.SaveListOfProgram()
    }

    /**
     * Show view : Add step
     */
    ShowAddStep(IsUpdate, index){
        // Changement du titre
        if(IsUpdate){
            document.getElementById("PlayProgramTitre").innerHTML = "Update Step"
        } else {
            document.getElementById("PlayProgramTitre").innerHTML = "New Step"
        }
        // Sort par displayname
        this._GpioConfig.sort((a,b) =>  a.custom.displayname.localeCompare(b.custom.displayname))
        // Selection du conteneur
        let conteneur = document.getElementById("Conteneur") 
        conteneur.innerHTML = ""
        // Box
        let ActionBox = CoreXBuild.Div("","ActionBox")
        Conteneur.appendChild(ActionBox)
        let FlexActionBox = CoreXBuild.DivFlexColumn("")
        ActionBox.appendChild(FlexActionBox)
        // DropDown
        FlexActionBox.appendChild(this.BuildDropDownRelaisType())
        FlexActionBox.appendChild(this.BuildDropDownZone())
        FlexActionBox.appendChild(this.BuildDropDownDelay())
        // Buttons
        let DivBouttons = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(DivBouttons)
        DivBouttons.appendChild(CoreXBuild.Button("Cancel", this.ShowProgram.bind(this, this._CurrentProgramId),"Button", ""))
        if (IsUpdate){
            DivBouttons.appendChild(CoreXBuild.Button("Update", this.ClickAddModStep.bind(this, index),"Button", ""))
            DivBouttons.appendChild(CoreXBuild.Button("Delete", this.ClickDeleteStep.bind(this, index),"Button", ""))
        } else {
            DivBouttons.appendChild(CoreXBuild.Button("Add", this.ClickAddModStep.bind(this, null),"Button", ""))
        }
    }
    /**
     * Build DropDown Type de relais
     */
    BuildDropDownRelaisType(){
        let Box = CoreXBuild.Div("", "ActionWidth", "")
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "Type")
        DropDown.setAttribute("class", "Text DorpDown")
        // liste des differents type
        let ListOfType = [...new Set(this._GpioConfig.map(item => item.custom.relaistype))]
        ListOfType.forEach(element => {
            let option = document.createElement("option")
            option.setAttribute("value", element)
            option.innerHTML = element
            DropDown.appendChild(option)
        });
        DropDown.onchange = this.UpdateDropDownZone.bind(this)
        Box.appendChild(DropDown)
        return Box
    }
    /**
     * Build DropDown Zone
     */
    BuildDropDownZone(){
        let Box = CoreXBuild.Div("", "ActionWidth", "")
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "Zone")
        DropDown.setAttribute("class", "Text DorpDown")
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
        Box.appendChild(DropDown)
        return Box
    }
    /**
     * Build DropDown Delay
     */
    BuildDropDownDelay(){
        let Box = CoreXBuild.Div("", "ActionSmallWidth", "")
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "Delay")
        DropDown.setAttribute("class", "Text DorpDown")

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
        Box.appendChild(DropDown)
        return Box
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
     * Ajoute ou modifie un step de la liste des steps
     * @param {number} index index du step a modifier de la liste des step
     */
    ClickAddModStep(index){
        let WorkerConfig = new Object()
        WorkerConfig.RelaisName = document.getElementById("Zone").value
        WorkerConfig.DisplayName = document.getElementById("Zone").options[document.getElementById("Zone").selectedIndex].text
        WorkerConfig.Delay = document.getElementById("Delay").value
        if (index == null){
            this._ListOfProgram[this._CurrentProgramId].ListOfSteps.push(WorkerConfig)
        } else {
            this._ListOfProgram[this._CurrentProgramId].ListOfSteps[index]=WorkerConfig
        }
        this.ShowProgram(this._CurrentProgramId)
        this.SaveListOfProgram()
    }
    
    /**
     * Supprime un step de la liste des steps
     * @param {number} index index du step a supprimer de la liste des step
     */
    ClickDeleteStep(index){
        if(confirm("Do you want to delete this step?")){
            this._ListOfProgram[this._CurrentProgramId].ListOfSteps.splice(index, 1)
            this.ShowProgram(this._CurrentProgramId)
            this.SaveListOfProgram()
        }
    }

    SaveListOfProgram(){
        // Delete DisplayName of list of steps befor saving
        let ListToSave = []
        this._ListOfProgram.forEach(element => {
            let NewObject = new Object()
            NewObject.Name = element.Name
            NewObject.ListOfSteps = []
            element.ListOfSteps.forEach(elementListOfStep => {
                let setp = new Object()
                setp.RelaisName = elementListOfStep.RelaisName
                setp.Delay = elementListOfStep.Delay
                NewObject.ListOfSteps.push(setp)
            });
            ListToSave.push(NewObject)
        });
        // Send save liste to serveur
        GlobalSendSocketIo("PlayProgram", "SaveListOfProgram", ListToSave)
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
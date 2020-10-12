class PlayProgram{
    constructor(){
        this._DivApp = document.getElementById(GlobalCoreXGetAppContentId())
        this._ListOfProgram = null
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
        SocketIo.on('PlayProgramListOfProgram', (Value) => {
            this._ListOfProgram = Value
            this.ShowListOfProgram()
        })
        // Send status to serveur
        GlobalSendSocketIo("PlayProgram", "GetListOfProgram", "")
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
        if(SocketIo.hasListeners('PlayProgramListOfProgram')){SocketIo.off('PlayProgramListOfProgram')}
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
        // Clear message
        document.getElementById("TxtInfo").innerHTML = ""
        document.getElementById("TxtError").innerHTML = ""
        // Selection du conteneur
        let conteneur = document.getElementById("Conteneur")
        // Liste des prgramme est null
        if (this._ListOfProgram == null) {
            // Affichag du message : pas de ListOfProgram
            conteneur.appendChild(CoreXBuild.DivTexte("No List Of Program defined...","","Text","text-align: center;"))
        } else {
            // Affichager la config des programme
            conteneur.appendChild(CoreXBuild.DivTexte("ListOfProgram OK","","Text","text-align: center;")) //ToDo
        }
        // Ajout du bouton Add Program
        conteneur.appendChild(CoreXBuild.Button("Add Program", this.ShowProgram.bind(this),"Button", "AddConfig"))
    }

    /**
     * Show view: Add Config 
     */
    ShowProgram(ProgramId = null){
        // Selection du conteneur
        let conteneur = document.getElementById("Conteneur") 
        conteneur.innerHTML = ""
        // Changement du titre: new program
        document.getElementById("PlayProgramTitre").innerHTML = "New Program"
        // Nom du programme
        let DivDisplayProgramName = CoreXBuild.DivFlexRowStart("")
        DivDisplayProgramName.style.width='90%'
        Conteneur.appendChild(DivDisplayProgramName)
        let ProgramName = "New Program"
        let InputProgramName = CoreXBuild.Input("ProgramName",ProgramName,"Input WidthSmall","","text","ProgramName","Set Program Name")
        InputProgramName.onfocus = function(){InputProgramName.placeholder = ""}
        InputProgramName.onblur = function(){if(InputProgramName.value==""){InputProgramName.value = "New Program"}}
        DivDisplayProgramName.appendChild(InputProgramName)
        //ToDo
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
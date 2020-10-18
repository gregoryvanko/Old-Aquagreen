class Config{
    constructor(){
        this._DivApp = document.getElementById(GlobalCoreXGetAppContentId())

        this._ConfigGpio = null
    }
    /**
     * Start de l'application
     */
    Start(){
        // Clear view
        this.ClearView()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Configuration", "TitreConfig", "Titre", ""))
        // Conteneur
        this._DivApp.appendChild(CoreXBuild.DivFlexColumn("Conteneur"))
        // Texte d'info
        this._DivApp.appendChild(CoreXBuild.DivTexte("Get GPIO Configuration...","TxtConfig","Text","text-align: center;"))
        // Texte du message d'erreur
        this._DivApp.appendChild(CoreXBuild.DivTexte("","ErrorConfig","Text","color:red; text-align: center;"))
        // On laisse un blanc avant la fin de la page
        this._DivApp.appendChild(CoreXBuild.Div("","","height:5vh;"))
        // Call API Get Config
        let ApiData = new Object()
        ApiData.Fct = "GetConfig"
        ApiData.Data = ""
        GlobalCallApiPromise("Config", ApiData, "", "").then((reponse)=>{
            document.getElementById("TxtConfig").innerHTML = ""
            document.getElementById("ErrorConfig").innerHTML = ""
            this._ConfigGpio = reponse
            this.BuildViewConfig()
        },(erreur)=>{
            document.getElementById("TxtConfig").innerHTML = ""
            document.getElementById("ErrorConfig").innerHTML = erreur
        })
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
    }

    /**
     * Build de la vue générale qui affiche la configuration
     */
    BuildViewConfig(){
        let Conteneur = document.getElementById("Conteneur")
        // Vider le conteneur
        Conteneur.innerHTML = ""
        // affichier le header du tableau Name - Type
        let BoxTitre = CoreXBuild.DivFlexRowAr("")
        Conteneur.appendChild(BoxTitre)
        BoxTitre.appendChild(CoreXBuild.DivTexte("Name","","TextBoxTitre", "width: 35%;color: var(--CoreX-color); margin-left:1%;"))
        BoxTitre.appendChild(CoreXBuild.DivTexte("Type","","TextBoxTitre", "width: 55%;color: var(--CoreX-color);"))
        // Ajout d'une ligne
        Conteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5; margin: 1% 0% 0% 0%;"))
        // Ajout de la configuration
        if (this._ConfigGpio == null){
            Conteneur.appendChild(CoreXBuild.DivTexte("No Configuration saved","","Text",""))
        } else {
            // Sort du nom par odre alphabetique
            this._ConfigGpio.sort((a,b) =>{
                if(a.name < b.name) { return -1; }
                if(a.name > b.name) { return 1; }
                return 0;
            })
            // Pour tous les elements de this._ConfigGpio
            this._ConfigGpio.forEach(element => {
                // Si c'est un relais
                if (element.type == "Relais"){
                    Conteneur.appendChild(this.BuildElementOfListConfig(element))
                }
            })
        }
    }

    /**
     * Construction d'un elemenet de la liste config
     * @param {Object} Element Object Config
     */
    BuildElementOfListConfig(Element){
        // Conteneur
        let conteneur = CoreXBuild.Div("","","width:100%")
        let data = CoreXBuild.Div("","ListElement","")
        data.addEventListener("click", this.BuildViewAddCustomConfig.bind(this, Element))
        conteneur.appendChild(data)
        let divFlex = CoreXBuild.DivFlexRowAr("")
        data.appendChild(divFlex)
        // Show Name
        divFlex.appendChild(CoreXBuild.DivTexte(Element.name,"","TextSmall", "width: 35%; margin-left:1%;"))
        // Show Custom
        if (Element.custom == null){
            divFlex.appendChild(CoreXBuild.DivTexte("Empty","","TextSmall", "width: 55%"))
        } else {
            divFlex.appendChild(CoreXBuild.DivTexte(JSON.stringify(Element.custom).replace(',', ' , '),"","TextSmall", "width: 55%"))
        }
        // Ajout d'une ligne
        conteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
        return conteneur
    }

    BuildViewAddCustomConfig(Element){
        // Changement du titre
        document.getElementById("TitreConfig").innerHTML = "Configuration " + Element.name
        // Get du Conteneur
        let Conteneur = document.getElementById("Conteneur")
        // Vider le conteneur
        Conteneur.innerHTML = ""
        // Liste de la custom Config
        let DisplayName = (Element.custom == null) ? '' : Element.custom.displayname
        let RelaisType = (Element.custom == null) ? '' : Element.custom.relaistype
        // Dispaly Name
        let DivInputName = CoreXBuild.Div("", "InputBox", "")
        DivInputName.style.marginBottom= "2%";
        Conteneur.appendChild(DivInputName)
        DivInputName.appendChild(CoreXBuild.DivTexte("Display Name","","Text",""))
        let InputDisplayName = CoreXBuild.Input("DisplayName",DisplayName,"Input","","text","DisplayName","Set Display Name")
        InputDisplayName.onfocus = function(){InputDisplayName.placeholder = ""}
        DivInputName.appendChild(InputDisplayName)
        // Relais type
        let DivRelais = CoreXBuild.Div("", "InputBox", "")
        DivRelais.style.marginBottom= "2%";
        Conteneur.appendChild(DivRelais)
        DivRelais.appendChild(CoreXBuild.DivTexte("Type of relay","","Text",""))
        let DropDown = document.createElement("select")
        DropDown.setAttribute("id", "RelaisType")
        DropDown.setAttribute("class", "Text DorpDown")
        // Relais type Turbine
        let option1 = document.createElement("option")
        option1.setAttribute("value", "Turbine")
        option1.innerHTML = "Turbine"
        if(RelaisType == "Turbine"){option1.setAttribute("selected", "selected")}
        DropDown.appendChild(option1)
        // Relais type Goutte a goutte
        let option2 = document.createElement("option")
        option2.setAttribute("value", "Goutte a goutte")
        option2.innerHTML = "Goutte a goutte"
        if(RelaisType == "GoutteAGoutte"){option2.setAttribute("selected", "selected")}
        DropDown.appendChild(option2)
        DivRelais.appendChild(DropDown)
        // On laisse un blanc
        Conteneur.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // Ajouter les boutton Save et Cancel
        let DivContentButton = CoreXBuild.DivFlexRowAr("DivContentButton")
        Conteneur.appendChild(DivContentButton)
        DivContentButton.appendChild(CoreXBuild.Button("Save", this.SaveCustomConfig.bind(this, Element),"Button"))
        DivContentButton.appendChild(CoreXBuild.Button("Cancel", this.Start.bind(this),"Button"))
    }

    SaveCustomConfig(Element){
        // Clear des message
        document.getElementById("TxtConfig").innerHTML = ""
        document.getElementById("ErrorConfig").innerHTML = ""
        let ErrorMsg = ""
        // Copier toutes les valeurs
        let DisplayName = document.getElementById("DisplayName").value
        let RelaisType = document.getElementById("RelaisType").value
        // vérifier si le DisplayName a une valeur
        if (DisplayName == ""){ErrorMsg += "Display Name must be fill. "}
        // Si il y a des erreur => afficher les erreur
        if(ErrorMsg != ""){
            document.getElementById("ErrorConfig").innerHTML = ErrorMsg
        } else { 
            document.getElementById("Conteneur").innerHTML = ""
            document.getElementById("TxtConfig").innerHTML = "Save Custom Configuration..."
            document.getElementById("ErrorConfig").innerHTML = ""
            // Creation de l'objet config relay
            let CustomConfig = new Object()
            CustomConfig.displayname = DisplayName
            CustomConfig.relaistype = RelaisType
            Element.custom = CustomConfig
            // Call API Set Config
            let ApiData = new Object()
            ApiData.Fct = "SetConfig"
            ApiData.Data = this._ConfigGpio
            GlobalCallApiPromise("Config", ApiData, "", "").then((reponse)=>{
                document.getElementById("TxtConfig").innerHTML = ""
                document.getElementById("ErrorConfig").innerHTML = ""
                this.Start()
            },(erreur)=>{
                document.getElementById("TxtConfig").innerHTML = ""
                document.getElementById("ErrorConfig").innerHTML = erreur
            })
        }
    }

    /** Get Titre de l'application */
    GetTitre(){
        return "Config"
    }
    /** Get Img Src de l'application */
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDc4LjcwMyA0NzguNzAzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0NzguNzAzIDQ3OC43MDM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNNDU0LjIsMTg5LjEwMWwtMzMuNi01LjdjLTMuNS0xMS4zLTgtMjIuMi0xMy41LTMyLjZsMTkuOC0yNy43YzguNC0xMS44LDcuMS0yNy45LTMuMi0zOC4xbC0yOS44LTI5LjgNCgkJCWMtNS42LTUuNi0xMy04LjctMjAuOS04LjdjLTYuMiwwLTEyLjEsMS45LTE3LjEsNS41bC0yNy44LDE5LjhjLTEwLjgtNS43LTIyLjEtMTAuNC0zMy44LTEzLjlsLTUuNi0zMy4yDQoJCQljLTIuNC0xNC4zLTE0LjctMjQuNy0yOS4yLTI0LjdoLTQyLjFjLTE0LjUsMC0yNi44LDEwLjQtMjkuMiwyNC43bC01LjgsMzRjLTExLjIsMy41LTIyLjEsOC4xLTMyLjUsMTMuN2wtMjcuNS0xOS44DQoJCQljLTUtMy42LTExLTUuNS0xNy4yLTUuNWMtNy45LDAtMTUuNCwzLjEtMjAuOSw4LjdsLTI5LjksMjkuOGMtMTAuMiwxMC4yLTExLjYsMjYuMy0zLjIsMzguMWwyMCwyOC4xDQoJCQljLTUuNSwxMC41LTkuOSwyMS40LTEzLjMsMzIuN2wtMzMuMiw1LjZjLTE0LjMsMi40LTI0LjcsMTQuNy0yNC43LDI5LjJ2NDIuMWMwLDE0LjUsMTAuNCwyNi44LDI0LjcsMjkuMmwzNCw1LjgNCgkJCWMzLjUsMTEuMiw4LjEsMjIuMSwxMy43LDMyLjVsLTE5LjcsMjcuNGMtOC40LDExLjgtNy4xLDI3LjksMy4yLDM4LjFsMjkuOCwyOS44YzUuNiw1LjYsMTMsOC43LDIwLjksOC43YzYuMiwwLDEyLjEtMS45LDE3LjEtNS41DQoJCQlsMjguMS0yMGMxMC4xLDUuMywyMC43LDkuNiwzMS42LDEzbDUuNiwzMy42YzIuNCwxNC4zLDE0LjcsMjQuNywyOS4yLDI0LjdoNDIuMmMxNC41LDAsMjYuOC0xMC40LDI5LjItMjQuN2w1LjctMzMuNg0KCQkJYzExLjMtMy41LDIyLjItOCwzMi42LTEzLjVsMjcuNywxOS44YzUsMy42LDExLDUuNSwxNy4yLDUuNWwwLDBjNy45LDAsMTUuMy0zLjEsMjAuOS04LjdsMjkuOC0yOS44YzEwLjItMTAuMiwxMS42LTI2LjMsMy4yLTM4LjENCgkJCWwtMTkuOC0yNy44YzUuNS0xMC41LDEwLjEtMjEuNCwxMy41LTMyLjZsMzMuNi01LjZjMTQuMy0yLjQsMjQuNy0xNC43LDI0LjctMjkuMnYtNDIuMQ0KCQkJQzQ3OC45LDIwMy44MDEsNDY4LjUsMTkxLjUwMSw0NTQuMiwxODkuMTAxeiBNNDUxLjksMjYwLjQwMWMwLDEuMy0wLjksMi40LTIuMiwyLjZsLTQyLDdjLTUuMywwLjktOS41LDQuOC0xMC44LDkuOQ0KCQkJYy0zLjgsMTQuNy05LjYsMjguOC0xNy40LDQxLjljLTIuNyw0LjYtMi41LDEwLjMsMC42LDE0LjdsMjQuNywzNC44YzAuNywxLDAuNiwyLjUtMC4zLDMuNGwtMjkuOCwyOS44Yy0wLjcsMC43LTEuNCwwLjgtMS45LDAuOA0KCQkJYy0wLjYsMC0xLjEtMC4yLTEuNS0wLjVsLTM0LjctMjQuN2MtNC4zLTMuMS0xMC4xLTMuMy0xNC43LTAuNmMtMTMuMSw3LjgtMjcuMiwxMy42LTQxLjksMTcuNGMtNS4yLDEuMy05LjEsNS42LTkuOSwxMC44bC03LjEsNDINCgkJCWMtMC4yLDEuMy0xLjMsMi4yLTIuNiwyLjJoLTQyLjFjLTEuMywwLTIuNC0wLjktMi42LTIuMmwtNy00MmMtMC45LTUuMy00LjgtOS41LTkuOS0xMC44Yy0xNC4zLTMuNy0yOC4xLTkuNC00MS0xNi44DQoJCQljLTIuMS0xLjItNC41LTEuOC02LjgtMS44Yy0yLjcsMC01LjUsMC44LTcuOCwyLjVsLTM1LDI0LjljLTAuNSwwLjMtMSwwLjUtMS41LDAuNWMtMC40LDAtMS4yLTAuMS0xLjktMC44bC0yOS44LTI5LjgNCgkJCWMtMC45LTAuOS0xLTIuMy0wLjMtMy40bDI0LjYtMzQuNWMzLjEtNC40LDMuMy0xMC4yLDAuNi0xNC44Yy03LjgtMTMtMTMuOC0yNy4xLTE3LjYtNDEuOGMtMS40LTUuMS01LjYtOS0xMC44LTkuOWwtNDIuMy03LjINCgkJCWMtMS4zLTAuMi0yLjItMS4zLTIuMi0yLjZ2LTQyLjFjMC0xLjMsMC45LTIuNCwyLjItMi42bDQxLjctN2M1LjMtMC45LDkuNi00LjgsMTAuOS0xMGMzLjctMTQuNyw5LjQtMjguOSwxNy4xLTQyDQoJCQljMi43LTQuNiwyLjQtMTAuMy0wLjctMTQuNmwtMjQuOS0zNWMtMC43LTEtMC42LTIuNSwwLjMtMy40bDI5LjgtMjkuOGMwLjctMC43LDEuNC0wLjgsMS45LTAuOGMwLjYsMCwxLjEsMC4yLDEuNSwwLjVsMzQuNSwyNC42DQoJCQljNC40LDMuMSwxMC4yLDMuMywxNC44LDAuNmMxMy03LjgsMjcuMS0xMy44LDQxLjgtMTcuNmM1LjEtMS40LDktNS42LDkuOS0xMC44bDcuMi00Mi4zYzAuMi0xLjMsMS4zLTIuMiwyLjYtMi4yaDQyLjENCgkJCWMxLjMsMCwyLjQsMC45LDIuNiwyLjJsNyw0MS43YzAuOSw1LjMsNC44LDkuNiwxMCwxMC45YzE1LjEsMy44LDI5LjUsOS43LDQyLjksMTcuNmM0LjYsMi43LDEwLjMsMi41LDE0LjctMC42bDM0LjUtMjQuOA0KCQkJYzAuNS0wLjMsMS0wLjUsMS41LTAuNWMwLjQsMCwxLjIsMC4xLDEuOSwwLjhsMjkuOCwyOS44YzAuOSwwLjksMSwyLjMsMC4zLDMuNGwtMjQuNywzNC43Yy0zLjEsNC4zLTMuMywxMC4xLTAuNiwxNC43DQoJCQljNy44LDEzLjEsMTMuNiwyNy4yLDE3LjQsNDEuOWMxLjMsNS4yLDUuNiw5LjEsMTAuOCw5LjlsNDIsNy4xYzEuMywwLjIsMi4yLDEuMywyLjIsMi42djQyLjFINDUxLjl6Ii8+DQoJCTxwYXRoIGQ9Ik0yMzkuNCwxMzYuMDAxYy01NywwLTEwMy4zLDQ2LjMtMTAzLjMsMTAzLjNzNDYuMywxMDMuMywxMDMuMywxMDMuM3MxMDMuMy00Ni4zLDEwMy4zLTEwMy4zUzI5Ni40LDEzNi4wMDEsMjM5LjQsMTM2LjAwMQ0KCQkJeiBNMjM5LjQsMzE1LjYwMWMtNDIuMSwwLTc2LjMtMzQuMi03Ni4zLTc2LjNzMzQuMi03Ni4zLDc2LjMtNzYuM3M3Ni4zLDM0LjIsNzYuMyw3Ni4zUzI4MS41LDMxNS42MDEsMjM5LjQsMzE1LjYwMXoiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg=="
    }
}

// Creation de l'application 1
let ConfigApp = new Config()
// Ajout de l'application 1
GlobalCoreXAddApp(ConfigApp.GetTitre(), ConfigApp.GetImgSrc(),ConfigApp.Start.bind(ConfigApp))
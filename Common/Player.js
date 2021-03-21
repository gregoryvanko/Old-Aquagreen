class Player{
    constructor(Conteneur, StopPlayer){
        this._Conteneur = Conteneur
        this._StopPlayer = StopPlayer
        this._CurrentZoneAction = ""

        // SocketIo Listener
        let SocketIo = GlobalGetSocketIo()
        SocketIo.on('PlayerError', (Value) => {
            document.getElementById("ErrorPlayer").innerHTML = Value
        })
        SocketIo.on('PlayerUpdate', (Value) => {
            this.Update(Value)
        })
        SocketIo.on('PlayerStop', (Value) => {
            SocketIo.off('PlayerError')
            SocketIo.off('PlayerUpdate')
            SocketIo.off('PlayerStop')
            this._StopPlayer()
        })
    }

    Build(WorkerValue){
        this._CurrentZoneAction = WorkerValue.ZoneAction
        let Pourcent = Math.floor((WorkerValue.StepCurrent/WorkerValue.StepTotal)*100)
        let PourcentZone = Math.floor((WorkerValue.ZoneStepCurrent/WorkerValue.ZoneStepTotal)*100)
        let Minute = Math.floor(WorkerValue.TotalSecond/60)
        let Seconde = WorkerValue.TotalSecond - (Minute * 60)

        this._Conteneur.innerHTML = ""
        let ActionBox = CoreXBuild.Div("","PlayerBox")
        this._Conteneur.appendChild(ActionBox)
        let FlexActionBox = CoreXBuild.DivFlexColumn("")
        ActionBox.appendChild(FlexActionBox)

        FlexActionBox.appendChild(CoreXBuild.Div("","","height:5vh;"))

        FlexActionBox.appendChild(CoreXBuild.ProgressRing({Id:"MyProgressRing", Radius:100, RadiusMobile:100, ScaleText:0.9, TextColor:"black", StrokeColor:"var(--CoreX-color)", Fill:"WhiteSmoke"}))

        FlexActionBox.appendChild(CoreXBuild.Div("","","height:2vh;"))
        FlexActionBox.appendChild(CoreXBuild.DivTexte(Minute + "min " + Seconde + "sec", "Timer", "Text", "margin: 1%;"))
        FlexActionBox.appendChild(CoreXBuild.Div("","","height:2vh;"))

        let DivProgramName = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivProgramName)
        DivProgramName.appendChild(CoreXBuild.DivTexte("Program: ", "", "Text", "width: 30%; text-align: right; margin: 1%;"))
        DivProgramName.appendChild(CoreXBuild.DivTexte(WorkerValue.DisplayProgram, "ProgramName", "TextSmall", "width: 65%; text-align: left; margin: 1%;"))

        let DivStepName = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivStepName)
        DivStepName.appendChild(CoreXBuild.DivTexte("Name: ", "", "Text", "width: 30%; text-align: right; margin: 1%;"))
        let StepNameTxt = WorkerValue.ZoneAction + " " + WorkerValue.DisplayName
        DivStepName.appendChild(CoreXBuild.DivTexte(StepNameTxt, "StepName", "TextSmall", "width: 65%; text-align: left; margin: 1%;"))
        
        let DivProgressLine = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivProgressLine)
        DivProgressLine.appendChild(CoreXBuild.DivTexte("Progress: ", "", "Text", "width: 30%; text-align: right; margin: 1%;"))

        let DivProgress = CoreXBuild.Div("", "", "width: 65%; margin: 1%;")
        DivProgressLine.appendChild(DivProgress)
        DivProgress.appendChild(CoreXBuild.ProgressBar("MyProgressLine","", "width: 100%;"))

        let DivStepprogress = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivStepprogress)
        DivStepprogress.appendChild(CoreXBuild.DivTexte("Done: ", "", "Text", "width: 30%; text-align: right; margin: 1%;"))
        DivStepprogress.appendChild(CoreXBuild.DivTexte(WorkerValue.ZoneNumberCurrent + "/" + WorkerValue.ZoneNumberTotal, "Stepprogress", "TextSmall", "width: 65%; text-align: left; margin: 1%;"))
        // Erreur
        FlexActionBox.appendChild(CoreXBuild.DivTexte("","ErrorPlayer","Text","color:red; text-align: center; height:2vh; margin: 1%;"))
        // Action Button
        let DivContentButton = CoreXBuild.DivFlexRowAr("DivContentButton")
        FlexActionBox.appendChild(DivContentButton)
        let PlayPauseTxt = (WorkerValue.ZoneAction == "Pause") ? '&#9658' : '&#10073 &#10073'
        DivContentButton.appendChild(CoreXBuild.Button(PlayPauseTxt, this.PlayPause.bind(this),"Button ActionSmallWidth", "PlayPause"))
        DivContentButton.appendChild(CoreXBuild.Button("&#9726", this.Stop.bind(this),"Button ActionSmallWidth"))
    }

    Update(WorkerValue){
        this._CurrentZoneAction = WorkerValue.ZoneAction
        let Pourcent = 0
        let PourcentZone = 0
        let Minute = 0
        let Seconde = 0
        if (WorkerValue.IsRunning){
            Pourcent = Math.floor((WorkerValue.StepCurrent/WorkerValue.StepTotal)*100)
            PourcentZone = Math.floor((WorkerValue.ZoneStepCurrent/WorkerValue.ZoneStepTotal)*100)
            Minute = Math.floor(WorkerValue.TotalSecond/60)
            Seconde = WorkerValue.TotalSecond - (Minute * 60)
        }
        
        document.getElementById("MyProgressRing").setAttribute('progress', Pourcent)
        document.getElementById("MyProgressLine").value = PourcentZone
        document.getElementById("Timer").innerHTML= Minute + "min " + Seconde + "sec"
        document.getElementById("StepName").innerHTML= WorkerValue.ZoneAction + " " + WorkerValue.DisplayName
        document.getElementById("Stepprogress").innerHTML= WorkerValue.ZoneNumberCurrent + "/" + WorkerValue.ZoneNumberTotal
        if (WorkerValue.ZoneAction == "Pause"){
            document.getElementById("PlayPause").innerHTML = "&#9658"
        } else {
            document.getElementById("PlayPause").innerHTML = "&#10073 &#10073"
        }
    }

    PlayPause(){
        if (this._CurrentZoneAction == "Pause"){
            this._WorkerInPause = false
            //document.getElementById("PlayPause").innerHTML = "&#10073 &#10073"
            GlobalSendSocketIo("Player", "Action", "Play")
        } else {
            this._WorkerInPause = true
            //document.getElementById("PlayPause").innerHTML = "&#9658"
            GlobalSendSocketIo("Player", "Action", "Pause")
        }
    }

    Stop(){
        GlobalSendSocketIo("Player", "Action", "Stop")
    }
}
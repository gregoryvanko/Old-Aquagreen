class Player{
    constructor(Conteneur, StopPlayer){
        this._Conteneur = Conteneur
        this._StopPlayer = StopPlayer

        this._WorkerProgressSemiCircle = null
        this._WorkerProgressLine = null
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
            this._WorkerProgressSemiCircle.destroy()
            this._WorkerProgressLine.destroy()
            this._WorkerProgressSemiCircle = null
            this._WorkerProgressLine = null
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
        let divWorkerProgressSemiCircle = CoreXBuild.Div("WorkerProgressSemiCircle", "WorkerProgressSemiCircle","")
        FlexActionBox.appendChild(divWorkerProgressSemiCircle)
        this._WorkerProgressSemiCircle = new ProgressBar.SemiCircle("#WorkerProgressSemiCircle", {
            color: 'blue',
            duration: 1000,
            easing: 'linear',
            strokeWidth: 2,
            trailWidth: 4,
            text: {
                value: 'Text',
                className: 'WorkerProgressSemiCircle__label',
                style: null,
                alignToBottom: false
            }
        });
        this._WorkerProgressSemiCircle.setText(Pourcent + "%")
        this._WorkerProgressSemiCircle.set(Pourcent/100)

        FlexActionBox.appendChild(CoreXBuild.Div("","","height:2vh;"))
        FlexActionBox.appendChild(CoreXBuild.DivTexte(Minute + "min " + Seconde + "sec", "Timer", "Text", ""))
        FlexActionBox.appendChild(CoreXBuild.Div("","","height:2vh;"))

        let DivProgramName = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivProgramName)
        DivProgramName.appendChild(CoreXBuild.DivTexte("Program: ", "", "Text", "width: 30%; text-align: right;"))
        DivProgramName.appendChild(CoreXBuild.DivTexte(WorkerValue.DisplayProgram, "ProgramName", "TextSmall", "width: 65%; text-align: left;"))

        let DivStepName = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivStepName)
        DivStepName.appendChild(CoreXBuild.DivTexte("Name: ", "", "Text", "width: 30%; text-align: right;"))
        let StepNameTxt = WorkerValue.ZoneAction + " " + WorkerValue.DisplayName
        DivStepName.appendChild(CoreXBuild.DivTexte(StepNameTxt, "StepName", "TextSmall", "width: 65%; text-align: left;"))
        
        let DivProgressLine = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivProgressLine)
        DivProgressLine.appendChild(CoreXBuild.DivTexte("Progress: ", "", "Text", "width: 30%; text-align: right;"))

        DivProgressLine.appendChild(CoreXBuild.Div("WorkerProgressLine", "WorkerProgressLine"))
        this._WorkerProgressLine = new ProgressBar.Line('#WorkerProgressLine', {
            color: 'blue',
            duration: 1000,
            easing: 'linear',
            strokeWidth: 4,
            trailWidth: 4,
        });
        this._WorkerProgressLine.set(PourcentZone/100)

        let DivStepprogress = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivStepprogress)
        DivStepprogress.appendChild(CoreXBuild.DivTexte("Done: ", "", "Text", "width: 30%; text-align: right;"))
        DivStepprogress.appendChild(CoreXBuild.DivTexte(WorkerValue.ZoneNumberCurrent + "/" + WorkerValue.ZoneNumberTotal, "Stepprogress", "TextSmall", "width: 65%; text-align: left;"))
        // Erreur
        FlexActionBox.appendChild(CoreXBuild.DivTexte("","ErrorPlayer","Text","color:red; text-align: center; height:2vh;"))
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
        
        this._WorkerProgressSemiCircle.setText(Pourcent + "%")
        this._WorkerProgressSemiCircle.animate(Pourcent/100)
        if (PourcentZone == 0){
            this._WorkerProgressLine.set(PourcentZone/100)
        } else {
            this._WorkerProgressLine.animate(PourcentZone/100)
        }
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
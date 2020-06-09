class Player{
    constructor(Conteneur){
        this._Conteneur = Conteneur

        this._WorkerProgressSemiCircle = null
        this._WorkerProgressLine = null
    }

    Build(WorkerValue){
        let Pourcent = Math.floor((WorkerValue.StepCurrent/WorkerValue.StepTotal)*100)
        let PourcentZone = Math.floor((WorkerValue.ZoneStepCurrent/WorkerValue.ZoneStepTotal)*100)
        let Minute = Math.floor(WorkerValue.TotalSecond/60)
        let Seconde = WorkerValue.TotalSecond - (Minute * 60)

        this._Conteneur.innerHTML = ""
        document.getElementById("TxtPlayZone").innerHTML = ""
        document.getElementById("ErrorPlayZone").innerHTML = ""

        let ActionBox = CoreXBuild.Div("","PlayerBox")
        this._Conteneur.appendChild(ActionBox)
        let FlexActionBox = CoreXBuild.DivFlexColumn("")
        ActionBox.appendChild(FlexActionBox)

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

        FlexActionBox.appendChild(CoreXBuild.Div("","","height:5vh;"))
        FlexActionBox.appendChild(CoreXBuild.DivTexte(Minute + "min " + Seconde + "sec", "Timer", "Text", ""))

        let DivStepName = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivStepName)
        DivStepName.appendChild(CoreXBuild.DivTexte("Step Name: ", "", "Text", "width: 49%; text-align: right;"))
        DivStepName.appendChild(CoreXBuild.DivTexte(WorkerValue.ZoneName, "StepName", "Text", "text-align: left;"))
        
        let DivProgressLine = CoreXBuild.DivFlexRowStart("")
        FlexActionBox.appendChild(DivProgressLine)
        DivProgressLine.appendChild(CoreXBuild.DivTexte("Step Progress: ", "", "Text", "width: 49%; text-align: right;"))

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
        DivStepprogress.appendChild(CoreXBuild.DivTexte("Step progress: ", "", "Text", "width: 49%; text-align: right;"))
        DivStepprogress.appendChild(CoreXBuild.DivTexte(WorkerValue.ZoneNumberCurrent + "/" + WorkerValue.ZoneNumberTotal, "Stepprogress", "Text", "text-align: left;"))
        // Action Button
        let DivContentButton = CoreXBuild.DivFlexRowAr("DivContentButton")
        FlexActionBox.appendChild(DivContentButton)
        DivContentButton.appendChild(CoreXBuild.Button("&#9612 &#9612", this.Pause.bind(this),"Button ActionSmallWidth"))
        DivContentButton.appendChild(CoreXBuild.Button("&#9632", this.Stop.bind(this),"Button ActionSmallWidth"))
    }

    Update(WorkerValue){
        let Pourcent = Math.floor((WorkerValue.StepCurrent/WorkerValue.StepTotal)*100)
        let PourcentZone = Math.floor((WorkerValue.ZoneStepCurrent/WorkerValue.ZoneStepTotal)*100)
        let Minute = Math.floor(WorkerValue.TotalSecond/60)
        let Seconde = WorkerValue.TotalSecond - (Minute * 60)

        this._WorkerProgressSemiCircle.setText(Pourcent + "%")
        this._WorkerProgressSemiCircle.animate(Pourcent/100)
        if (PourcentZone == 0){
            this._WorkerProgressLine.set(PourcentZone/100)
        } else {
            this._WorkerProgressLine.animate(PourcentZone/100)
        }
        document.getElementById("Timer").innerHTML= Minute + "min " + Seconde + "sec"
        document.getElementById("StepName").innerHTML= WorkerValue.ZoneName
        document.getElementById("Stepprogress").innerHTML= WorkerValue.ZoneNumberCurrent + "/" + WorkerValue.ZoneNumberTotal
    }

    Pause(){
        alert("ToDo")
    }

    Stop(){
        alert("ToDo")
    }
}
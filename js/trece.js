const game = {
    steps: [],
    stepsCount: 113,
    dy: 13,
    size: { width: 1000, height: 1600 },
    stepSize: { width: 100, height: 24 },
    playerSize: { width: 100, height: 96 },
    dx: 0,
    player: new Sprite(0, 0, 1, false, null),
    playerStep: 100,
    elapsedTime: 0,
    countdownTime: 0,
    timerRunning: false,
    stepsInfo: new Label(120, 32, 0, false, '', 'white', 'normal', 32, 'Arial'),
    timeInfo: new Label(920, 32, 0, false, '', 'white', 'normal', 32, 'Arial'),
    floorLabels: [],
    timeLabel: new Label(500, 550, 0, false, 'Time:', 'white', 'normal', 48, 'Arial'),
    bestLabel: new Label(500, 600, 0, false, 'Best:', 'white', 'normal', 48, 'Arial'),
    homeButton: new Label(500, 750, 0, true, 'HOME', 'white', 'bold', 64, 'Arial'),
    tryAgainButton: new Label(500, 850, 0, true, 'TRY AGAIN', 'white', 'bold', 64, 'Arial'),
    playButton: new Label(500, 800, 0, true, 'PLAY', 'white', 'bold', 64, 'Arial'),
    countdownLabel: new Label(500, 800, 0, false, '', 'white', 'bold', 96, 'Arial'),
    scoreBackground: new Sprite(500, 680, 0.5, false, null),
    directionSteps: [10, 19, 28, 37, 46, 55, 64, 73, 82, 91, 100, 109],
    showingCountdown: false,
    showingScore: false,
    objects: [],
    key: 'vemi.games.starway-to-13.best',
    audiosLoaded: false,
    tapAudio: null,
    debug: false,
    leftCanvas: null,
    rightCanvas: null,
    frontCanvas: null,
    stepOnCanvas: null,
    stepOffCanvas: null,
    tomatoCanvas: null,
    carrotCanvas: null
}

game.init = async function (canvas) {
    this.canvas = canvas
    this.canvas.width = this.size.width
    this.canvas.height = this.size.height

    this.tapAudio = await sound.loadAudio('./snd/tap.opus')

    this.leftCanvas = graphics.transform(this.playerSize.width, this.playerSize.height, 0, await graphics.loadBitmap('./img/left.png'))
    this.rightCanvas = graphics.transform(this.playerSize.width, this.playerSize.height, 0, await graphics.loadBitmap('./img/right.png'))
    this.frontCanvas = graphics.transform(this.playerSize.width, this.playerSize.height, 0, await graphics.loadBitmap('./img/front.png'))

    this.stepOffCanvas = graphics.transform(this.stepSize.width, this.stepSize.height, 0, await graphics.loadBitmap('./img/step-off.png'))
    this.stepOnCanvas = graphics.transform(this.stepSize.width, this.stepSize.height, 0, await graphics.loadBitmap('./img/step-on.png'))

    this.player.canvas = this.rightCanvas
    this.scoreBackground.canvas = graphics.transform(600, 600, 0, await graphics.loadBitmap('./img/score-background.png'))

    this.tomatoCanvas = graphics.transform(32, 32, 0, await graphics.loadBitmap('./img/tomato.png'))
    this.carrotCanvas = graphics.transform(64, 32, 0, await graphics.loadBitmap('./img/carrot.png'))

    this.dx = this.stepSize.width

    let x = this.stepSize.width * 0.5
    let y = 1600 - (this.stepSize.height * 0.5)
    let sign = 1
    for (let i = 1; i <= this.stepsCount; i++) {
        this.steps.push(new Sprite(x, y, 2, false, null))

        if (this.isDirectionStep(i)) {
            sign = sign * (-1)

            this.floorLabels.push(new Label(944, y - 52, 2, false, String(this.directionSteps.indexOf(i) + 2).padStart(2, '0'), 'white', 'normal', 32, 'Arial'))
        }

        x += this.dx * sign
        y -= this.dy
    }

    this.floorLabels.push(new Label(944, this.steps[9].y + 52, 2, false, '01', 'white', 'normal', 32, 'Arial'))
    this.objects.push(this.playButton)
    this.previous = performance.now()
}

game.update = function (dt) {
    if (this.showingCountdown) {
        this.countdownTime -= dt

        const time = Math.round(this.countdownTime / 1000)

        if (time == 0) {
            this.countdownLabel.content = 'GO!'
        } else {
            this.countdownLabel.content = String(time)
        }

        if (this.countdownTime <= 0) {
            this.showingCountdown = false
            this.elapsedTime = 0
            this.timerRunning = true
            this.remove(this.countdownLabel)
        }
    }

    if (this.timerRunning) {
        this.elapsedTime += dt
    }

    this.timeInfo.content = this.formatTime(this.elapsedTime)
}

game.onKeyDown = function (key) {

}

game.onKeyUp = function (key) {

}

game.onPointerDown = function (event) {
    if (this.showingCountdown) {
        return
    }

    if (this.timerRunning) {
        if (this.playerStep - 1 < this.steps.length - 1) {
            sound.playAudio(this.tapAudio)
            this.playerStep++
        }

        this.setPlayerPosition()
        if (this.playerStep == this.steps.length) {
            this.timerRunning = false
            this.end()
        }

        if (random.nextDouble(0, 1) < 0.2) {
            let previous = this.steps[this.playerStep - 2]
            if (random.nextDouble(0, 1) < 0.5) {
                this.objects.push(new Sprite(previous.x, previous.y - (this.stepSize.height * 0.5) - (this.tomatoCanvas.height * 0.5), 1, false, this.tomatoCanvas))
            } else {
                this.objects.push(new Sprite(previous.x, previous.y - (this.stepSize.height * 0.5) - (this.carrotCanvas.height * 0.5), 1, false, this.carrotCanvas))
            }
        }
    }
}

game.onPointerUp = function (event) {
    const hit = graphics.hit(this.objects, event, this.ctx)

    if (hit != null) {
        if (hit == this.playButton) {
            this.start()
        } else if (hit == this.homeButton) {
            this.home()
        } else if (hit == this.tryAgainButton) {
            this.start()
        }
    }
}

game.clear = function () {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.size.width, this.size.height)
}

game.resize = function () {
    graphics.resizeContainer(this.size, { width: window.innerWidth, height: window.innerHeight }, this.canvas)
}

game.setPlayerPosition = function () {
    const step = this.steps[this.playerStep - 1]
    this.player.x = step.x
    this.player.y = step.y - (this.stepSize.height * 0.5) - (this.playerSize.height * 0.5)
    this.stepsInfo.content = `Step ${this.formatStep()} of ${this.steps.length}`

    if (this.isDirectionStep(this.playerStep)) {
        if (this.player.canvas == this.leftCanvas) {
            this.player.canvas = this.rightCanvas
        } else if (this.player.canvas == this.rightCanvas) {
            this.player.canvas = this.leftCanvas
        }
    }

    if (this.playerStep == this.stepsCount) {
        this.player.canvas = this.frontCanvas
    }

    step.canvas = this.stepOnCanvas
}

game.formatStep = function () {
    return `Step ${String(this.playerStep).padStart(3, '0')} of ${this.stepsCount}`
}

//GPT
game.formatTime = function formatTime(milliseconds) {
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    const remainingMilliseconds = Math.floor(milliseconds % 1000)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(seconds).padStart(2, '0')
    const formattedMilliseconds = String(remainingMilliseconds).padStart(3, '0')

    return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`
}

game.isDirectionStep = function (step) {
    return this.directionSteps.indexOf(step) != -1
}

game.updateRecord = function () {
    let currentRecord = localStorage.getItem(this.key)

    if (currentRecord == null) {
        localStorage.setItem(this.key, this.elapsedTime)
    } else {
        if (this.elapsedTime < Number(localStorage.getItem(this.key))) {
            localStorage.setItem(this.key, Math.trunc(this.elapsedTime))
        }
    }
}

game.start = function () {
    this.elapsedTime = 0
    this.timerRunning = false
    this.showingCountdown = true
    this.showingScore = false
    this.countdownTime = 3000
    this.playerStep = 1
    this.player.canvas = this.rightCanvas
    this.objects = []

    for (let step of this.steps) {
        step.canvas = this.stepOffCanvas
        this.objects.push(step)
    }

    this.setPlayerPosition()

    this.stepsInfo.content = this.formatStep()

    this.objects.push(this.stepsInfo)
    this.objects.push(this.timeInfo)

    for (let floor of this.floorLabels) {
        this.objects.push(floor)
    }

    this.objects.push(this.player)
    this.objects.push(this.countdownLabel)
}

game.home = function () {
    this.objects = []
    this.objects.push(this.playButton)
}

game.end = function () {
    this.updateRecord()
    this.timeLabel.content = `Time: ${this.formatTime(this.elapsedTime)}`
    const best = localStorage.getItem(this.key)
    this.bestLabel.content = `Best: ${this.formatTime(best)}`
    this.showingScore = true
    this.timerRunning = false

    this.objects.push(this.timeLabel)
    this.objects.push(this.bestLabel)
    this.objects.push(this.tryAgainButton)
    this.objects.push(this.homeButton)
    this.objects.push(this.scoreBackground)
}

game.remove = function (o) {
    let index = this.objects.findIndex(item => item == o);
    if (index !== -1) {
        this.objects.splice(index, 1);
    }
}

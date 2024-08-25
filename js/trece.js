const graphics = new Graphics()
const mathUtils = new MathUtils()

function Game() {
    this.steps = []
    this.stepsCount = 113
    this.dy = 13
    this.size = { width: 1000, height: 1600 }
    this.stepSize = { width: 100, height: 32 }
    this.playerSize = { width: 32, height: 64 }
    this.dx = this.stepSize.width
    this.player = new Sprite(0, 0, 1, false, null)
    this.playerStep = 100
    this.elapsedTime = 0
    this.countdownTime = 0
    this.timerRunning = true
    this.stepsInfo = new Label(96, 18, 0, false, '', 'white', 13 * 2, 'Arial')
    this.timeInfo = new Label(852, 18, 0, false, '', 'white', 13 * 2, 'Arial')
    this.floorLabels = []
    this.timeLabel = new Label(500, 550, 0, false, 'Time:', 'white', 13 * 7, 'Arial')
    this.bestLabel = new Label(500, 650, 0, false, 'Best:', 'white', 13 * 7, 'Arial')
    this.homeButton = new Label(500, 750, 0, true, 'HOME', 'white', 13 * 7, 'Arial')
    this.tryAgainButton = new Label(500, 850, 0, true, 'TRY AGAIN', 'white', 13 * 7, 'Arial')
    this.playButton = new Label(500, 800, 0, true, 'PLAY', 'white', 13 * 8, 'Arial')
    this.countdownLabel = new Label(500, 800, 0, false, '', 'white', 13 * 10, 'Arial')

    this.directionSteps = [10, 19, 28, 37, 46, 55, 64, 73, 82, 91, 100, 109]

    this.showingCountdown = false
    this.showingScore = false

    this.objects = []
    this.key = 'vemi.games.starway-to-13.best'
}

Game.prototype.init = async function (canvas) {
    this.canvas = canvas
    this.canvas.width = this.size.width
    this.canvas.height = this.size.height

    this.resize();

    let stepCanvas = graphics.transform(this.stepSize.width, this.stepSize.height, 0, await graphics.loadBitmap('./img/step.png'))
    this.player.canvas = graphics.transform(this.playerSize.width, this.playerSize.height, 0, await graphics.loadBitmap('./img/player.png'))

    let x = this.stepSize.width * 0.5
    let y = 1600 - (this.stepSize.height * 0.5)
    let sign = 1
    for (let i = 1; i <= this.stepsCount; i++) {
        this.steps.push(new Sprite(x, y, 2, false, stepCanvas))

        if (this.isDirectionStep(i)) {
            sign = sign * (-1)

            this.floorLabels.push(new Label(944, y - 52, 2, false, String(this.directionSteps.indexOf(i) + 2).padStart(2, '0'), 'white', 13 * 4, 'Verdana'))
        }

        x += this.dx * sign
        y -= this.dy
    }

    this.floorLabels.push(new Label(944, this.steps[9].y + 52, 2, false, '01', 'white', 13 * 4, 'Verdana'))
    this.setPlayerPosition()

    this.objects.push(this.playButton)
    this.previous = performance.now()
}

Game.prototype.update = function (dt) {
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

Game.prototype.onKeyDown = function (key) {

}

Game.prototype.onKeyUp = function (key) {

}

Game.prototype.onPointerDown = function (event) {
    if (this.showingCountdown) {
        return
    }

    if (this.timerRunning) {
        if (this.playerStep - 1 < this.steps.length - 1) {
            this.playerStep++
        }

        this.setPlayerPosition()
        if (this.playerStep == this.steps.length) {
            this.timerRunning = false
            this.end()
        }
    }
}

Game.prototype.onPointerUp = function (event) {
    const hit = graphics.hit(this.objects, event, this.ctx)

    if (hit) {
        if (hit == this.playButton) {
            this.start()
        } else if (hit == this.homeButton) {
            this.home()
        } else if (hit == this.tryAgainButton) {
            this.start()
        }
    }
}

Game.prototype.draw = function () {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.size.width, this.size.height)

    graphics.draw(this.objects, this.ctx, false)
}

Game.prototype.resize = function () {
    graphics.resizeContainer(this.size, { width: window.innerWidth, height: window.innerHeight }, this.canvas)
}

Game.prototype.frame = function (dt) {
    this.ctx = this.canvas.getContext('2d', {
        alpha: false,
        imageSmoothingEnabled: false
    });

    this.update(dt)
    this.draw()
}

Game.prototype.setPlayerPosition = function () {
    this.player.x = this.steps[this.playerStep - 1].x
    this.player.y = this.steps[this.playerStep - 1].y - (this.stepSize.height * 0.5) - (this.playerSize.height * 0.5)
}

Game.prototype.formatStep = function () {
    return `Step ${String(this.playerStep).padStart(3, '0')} of ${this.stepsCount}`
}

//GPT
Game.prototype.formatTime = function formatTime(milliseconds) {
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    const remainingMilliseconds = Math.floor(milliseconds % 1000)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(seconds).padStart(2, '0')
    const formattedMilliseconds = String(remainingMilliseconds).padStart(3, '0')

    return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`
}

Game.prototype.isDirectionStep = function (i) {
    return this.directionSteps.indexOf(i) != -1
}

Game.prototype.updateRecord = function () {
    let currentRecord = localStorage.getItem(this.key)

    if (currentRecord == null) {
        localStorage.setItem(this.key, this.elapsedTime)
    } else {
        if (this.elapsedTime < Number(localStorage.getItem(this.key))) {
            localStorage.setItem(this.key, Math.trunc(this.elapsedTime))
        }
    }
}

Game.prototype.start = function () {
    this.current = 'InGame'
    this.elapsedTime = 0
    this.timerRunning = false
    this.showingCountdown = true
    this.showingScore = false
    this.countdownTime = 3000
    this.playerStep = 99
    this.setPlayerPosition()

    this.objects = []
    for (let step of this.steps) {
        this.objects.push(step)
    }

    this.stepsInfo.content = this.formatStep()

    this.objects.push(this.stepsInfo)
    this.objects.push(this.timeInfo)

    for (let floor of this.floorLabels) {
        this.objects.push(floor)
    }

    this.objects.push(this.player)
    this.objects.push(this.countdownLabel)
}

Game.prototype.home = function () {
    this.objects = []
    this.objects.push(this.playButton)
}

Game.prototype.end = function () {
    this.updateRecord()
    this.timeLabel.content = `Time: ${this.formatTime(this.elapsedTime)}`
    const best = localStorage.getItem(this.key)
    this.bestLabel.content = `Best: ${this.formatTime(best)}`
    this.showingScore = true

    this.objects.push(this.timeLabel)
    this.objects.push(this.bestLabel)
    this.objects.push(this.tryAgainButton)
    this.objects.push(this.homeButton)
}

Game.prototype.remove = function (o) {
    let index = this.objects.findIndex(item => item == o);
    if (index !== -1) {
        this.objects.splice(index, 1);
    }
}

function Game() {
    this.steps = []
    this.stepsCount = 113
    this.dy = 13
    this.size = { width: 1000, height: 1600 }
    this.stepSize = { width: 100, height: 32 }
    this.playerSize = { width: 32, height: 64 }
    this.dx = this.stepSize.width
    this.player = new Sprite(0, 0, null)
    this.playerStep = 100
    this.elapsedTime = 0
    this.timerRunning = true
    this.stepsInfo = new Label(4, 18, '', 'white', 13 * 2, 'Verdana')
    this.timeInfo = new Label(852, 18, '', 'white', 13 * 2, 'Verdana')
    this.floorLabels = []
    this.labels = {
        pause: new Label(800, 1600 - (13 * 3), 'Pause', 'white', 13 * 4, 'Verdana')
    }

    this.directionSteps = [10, 19, 28, 37, 46, 55, 64, 73, 82, 91, 100, 109]

    this.current = 'InGame'
}

const game = new Game()

game.init = async function () {
    this.previous = performance.now()

    this.canvas = document.getElementById('canvas')
    this.canvas.width = this.size.width
    this.canvas.height = this.size.height

    this.resize();

    let stepCanvas = graphics.transform(this.stepSize.width, this.stepSize.height, 0, await graphics.loadBitmap('./img/step.png'))
    this.player.canvas = graphics.transform(this.playerSize.width, this.playerSize.height, 0, await graphics.loadBitmap('./img/player.png'))

    let x = this.stepSize.width * 0.5
    let y = 1600 - (this.stepSize.height * 0.5)
    let sign = 1
    for (let i = 1; i <= this.stepsCount; i++) {
        this.steps.push(new Sprite(x, y, stepCanvas))

        if (this.isDirectionStep(i)) {
            sign = sign * (-1)

            this.floorLabels.push(new Label(944, y - 52, this.directionSteps.indexOf(i) + 2, 'white', 13 * 4, 'Verdana', true))
        }

        x += this.dx * sign
        y -= this.dy
    }

    this.floorLabels.push(new Label(944, this.steps[9].y + 52, 1, 'white', 13 * 4, 'Verdana', true))
}

game.update = function (dt) {
    if (this.current == 'InGame') {
        this.setPlayerPosition(this.playerStep)

        if (this.playerStep == this.steps.length) {
            this.timerRunning = false
            this.updateRecord()
        }

        if (this.timerRunning) {
            this.elapsedTime += dt
        }
    }
}

game.onKeyDown = function (key) {

}

game.onKeyUp = function (key) {

}

game.onPointerDown = function (event) {
    if (this.current == 'InGame') {
        let pauseHit = graphics.insideLabel(this.labels.pause, event, this.ctx)

        if (pauseHit) {
            console.log('Pause!')
            return
        }

        if (this.playerStep - 1 < this.steps.length - 1) {
            this.playerStep++
        }
    }
}

game.onPointerUp = function (event) {

}

game.draw = function (ctx) {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, this.size.width, this.size.height)

    for (let step of this.steps) {
        graphics.drawSprite(step, ctx)
    }

    this.stepsInfo.content = this.formatStep()
    graphics.drawText(this.stepsInfo, ctx)
    this.timeInfo.content = this.formatTime()
    graphics.drawText(this.timeInfo, ctx)

    for (let floor of this.floorLabels) {
        graphics.drawText(floor, ctx)
    }

    graphics.drawText(this.labels.pause, ctx)

    graphics.drawSprite(this.player, ctx)
}

game.resize = function () {
    graphics.resizeContainer(this.size, { width: window.innerWidth, height: window.innerHeight }, this.canvas)
}

game.frame = function (dt) {
    this.update(dt)

    this.ctx = this.canvas.getContext('2d', {
        alpha: false,
        imageSmoothingEnabled: false
    });

    this.draw(this.ctx)
}

game.setPlayerPosition = function (playerStep) {
    this.player.x = this.steps[playerStep - 1].x
    this.player.y = this.steps[playerStep - 1].y - (this.stepSize.height * 0.5) - (this.playerSize.height * 0.5)
}

game.formatStep = function () {
    return `Step ${String(this.playerStep).padStart(3, '0')} of ${this.stepsCount}`
}

//GPT
game.formatTime = function formatTime() {
    const milliseconds = this.elapsedTime
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    const remainingMilliseconds = Math.floor(milliseconds % 1000)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(seconds).padStart(2, '0')
    const formattedMilliseconds = String(remainingMilliseconds).padStart(3, '0')

    return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`
}

game.isDirectionStep = function (i) {
    return this.directionSteps.indexOf(i) != -1
}

game.updateRecord = function () {
    const key = 'co.signitos.starway-to-13.record'
    let currentRecord = localStorage.getItem(key)

    if (currentRecord == null) {
        localStorage.setItem(key, this.elapsedTime)
    } else {
        if (this.elapsedTime < Number(localStorage.getItem(key))) {
            localStorage.setItem(key, Math.trunc(this.elapsedTime))
        }
    }
}

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
    this.stepsInfo = new Label(96, 18, '', 'white', 13 * 2, 'Arial')
    this.timeInfo = new Label(852, 18, '', 'white', 13 * 2, 'Arial')
    this.floorLabels = []
    this.homeButton = new Label(800, 1600 - (13 * 3), 'HOME', 'white', 13 * 2, 'Arial')
    this.playButton = new Label(500, 800, 'PLAY', 'white', 13 * 8, 'Arial')

    this.directionSteps = [10, 19, 28, 37, 46, 55, 64, 73, 82, 91, 100, 109]

    this.current = 'Intro'
}

const game = new Game()

game.init = async function (canvas) {
    this.previous = performance.now()

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
        this.steps.push(new Sprite(x, y, stepCanvas))

        if (this.isDirectionStep(i)) {
            sign = sign * (-1)

            this.floorLabels.push(new Label(944, y - 52, String(this.directionSteps.indexOf(i) + 2).padStart(2, '0'), 'white', 13 * 4, 'Verdana'))
        }

        x += this.dx * sign
        y -= this.dy
    }

    this.floorLabels.push(new Label(944, this.steps[9].y + 52, '01', 'white', 13 * 4, 'Verdana'))
    this.setPlayerPosition()
}

game.update = function (dt) {
    if (this.current == 'InGame') {
        if (this.timerRunning) {
            this.elapsedTime += dt
        }

        this.timeInfo.content = this.formatTime()
    }
}

game.onKeyDown = function (key) {

}

game.onKeyUp = function (key) {

}

game.onPointerDown = function (event) {
    if (this.current == 'Intro') {
        if (graphics.insideLabel(this.playButton, event, this.ctx)) {
            this.start()
            return
        }
    } else if (this.current == 'InGame') {
        if (graphics.insideLabel(this.homeButton, event, this.ctx)) {
            this.pause()
            return
        }

        if (this.playerStep - 1 < this.steps.length - 1) {
            this.playerStep++
        }

        this.setPlayerPosition()
        if (this.playerStep == this.steps.length) {
            this.timerRunning = false
            this.updateRecord()
        }
    }
}

game.onPointerUp = function (event) {

}

game.draw = function () {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.size.width, this.size.height)

    if (this.current == 'Intro') {
        graphics.drawLabel(this.playButton, this.ctx, true)
    } else if (this.current == 'InGame') {
        for (let step of this.steps) {
            graphics.drawSprite(step, this.ctx)
        }

        this.stepsInfo.content = this.formatStep()
        graphics.drawLabel(this.stepsInfo, this.ctx)
        graphics.drawLabel(this.timeInfo, this.ctx)

        for (let floor of this.floorLabels) {
            graphics.drawLabel(floor, this.ctx)
        }

        graphics.drawLabel(this.homeButton, this.ctx)

        graphics.drawSprite(this.player, this.ctx)
    }
}

game.resize = function () {
    graphics.resizeContainer(this.size, { width: window.innerWidth, height: window.innerHeight }, this.canvas)
}

game.frame = function (dt) {
    this.ctx = this.canvas.getContext('2d', {
        alpha: false,
        imageSmoothingEnabled: false
    });

    this.update(dt)
    this.draw()
}

game.setPlayerPosition = function () {
    this.player.x = this.steps[this.playerStep - 1].x
    this.player.y = this.steps[this.playerStep - 1].y - (this.stepSize.height * 0.5) - (this.playerSize.height * 0.5)
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

game.start = function(){
    this.current = 'InGame'
    this.elapsedTime = 0
    this.timerRunning = true
    this.playerStep = 1
    this.setPlayerPosition()
}

game.pause = function () {
    this.current = 'Intro'
}

const graphics = new Graphics()
const mathUtils = new MathUtils()
const sound = new Sound()

function Game() {
    this.previous = performance.now()
    this.ui = []
    this.steps = []
    this.stepsCount = 113
    this.dy = 13
    this.camera = { x: 500, y: 800, width: 1000, height: 1600 }
    this.uicamera = { x: 500, y: 800, width: 1000, height: 1600 }
    this.stepSize = { width: 100, height: 32 }
    this.playerSize = { width: 32, height: 64 }
    this.dx = this.stepSize.width
    this.player = new Sprite(0, 0, null)
    this.playerStep = 100
    this.elapsedTime = 0
    this.timerRunning = true
    this.stepsInfo = new Label(4, 18, '', 'white', 13 * 2, 'Verdana', false)
    this.timeInfo = new Label(852, 18, '', 'white', 13 * 2, 'Verdana', false)

    this.canvas = document.getElementById('canvas')
    this.canvas.width = this.camera.width
    this.canvas.height = this.camera.height

    this.directionSteps = [10, 19, 28, 37, 46, 55, 64, 73, 82, 91, 100, 109]
}

Game.prototype.init = async function () {
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
        }

        x += this.dx * sign
        y -= this.dy
    }
}

Game.prototype.update = function (dt) {
    this.setPlayerPosition(this.playerStep)

    if (this.playerStep == this.steps.length) {
        this.timerRunning = false
    }

    if (this.timerRunning) {
        this.elapsedTime += dt
    }
}

Game.prototype.onKeyDown = function (key) {

}

Game.prototype.onKeyUp = function (key) {

}

Game.prototype.onPointerDown = function (event) {
    if (this.playerStep - 1 < this.steps.length - 1) {
        this.playerStep++
    }
}

Game.prototype.onPointerUp = function (event) {

}

Game.prototype.draw = function (ctx) {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, this.camera.width, this.camera.height)

    for (let i = 0; i < this.steps.length; i++) {
        let step = this.steps[i]
        graphics.drawSprite(step, this.camera, ctx)
    }

    for (let ui of this.ui) {
        graphics.drawSprite(ui, this.uicamera, ctx)
    }

    this.stepsInfo.content = this.formatStep()
    graphics.drawText(this.stepsInfo, this.camera, ctx)
    this.timeInfo.content = this.formatTime()
    graphics.drawText(this.timeInfo, this.camera, ctx)

    graphics.drawSprite(this.player, this.camera, ctx)
}

Game.prototype.resize = function () {
    let game = this
    graphics.resizeContainer({ width: game.camera.width, height: game.camera.height },
        { width: window.innerWidth, height: window.innerHeight }, document.getElementById('canvas'))
}

Game.prototype.frame = function (dt) {
    this.update(dt)

    this.ctx = this.canvas.getContext('2d', {
        alpha: false,
        imageSmoothingEnabled: false
    });

    this.draw(this.ctx)
}

Game.prototype.setPlayerPosition = function (playerStep) {
    this.player.x = this.steps[playerStep - 1].x
    this.player.y = this.steps[playerStep - 1].y - (this.stepSize.height * 0.5) - (this.playerSize.height * 0.5)
}

Game.prototype.formatStep = function () {
    return `Step ${String(this.playerStep).padStart(3, '0')} of ${this.stepsCount}`
}

//GPT
Game.prototype.formatTime = function formatTime() {
    const milliseconds = this.elapsedTime
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    const remainingMilliseconds = Math.floor(milliseconds % 1000)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(seconds).padStart(2, '0')
    const formattedMilliseconds = String(remainingMilliseconds).padStart(3, '0')

    return `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`
}

Game.prototype.isDirectionStep = function (i) {
    return this.directionSteps.indexOf(i) != -1
}

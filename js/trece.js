const graphics = new Graphics();
const mathUtils = new MathUtils();
const sound = new Sound();

function Game() {
    this.previous = performance.now();
    this.elapsed = 0
    this.stepCanvas = null
    this.ui = []
    this.steps = []
    this.camera = { x: 500, y: 800, width: 1000, height: 1600 }
    this.uicamera = { x: 500, y: 800, width: 1000, height: 1600 }
    this.stepSize = { width: 100, height: 48 }
    this.playerSize = { width: 32, height: 64 }
    this.dx = this.stepSize.width
    this.dy = 13
    this.player = {
        x: 0,
        y: 0,
        canvas: null
    }
    this.playerStep = 0
    this.spaceLocked = false
}

Game.prototype.init = async function () {
    this.resize();

    this.canvas = document.getElementById('canvas')
    this.canvas.width = this.camera.width
    this.canvas.height = this.camera.height

    this.stepCanvas = graphics.transform(this.stepSize.width, this.stepSize.height, 0, await graphics.loadBitmap('./img/step.png'))
    this.player.canvas = graphics.transform(this.playerSize.width, this.playerSize.height, 0, await graphics.loadBitmap('./img/player.png'))

    let x = this.stepSize.width * 0.5
    let y = 1600 - (this.stepSize.height * 0.5)
    let sign = 1
    for (let i = 1; i <= 113; i++) {
        this.steps.push({ x: x, y: y })

        if (i == 10 || i == 19 || i == 28 || i == 37 || i == 46
            || i == 55 || i == 64 || i == 73 || i == 82
            || i == 91 || i == 100 || i == 109) {
            sign = sign * (-1)
        }

        x += this.dx * sign
        y -= this.dy
    }

    this.setPlayerPosition(0)
}

Game.prototype.update = function (dt) {
    this.setPlayerPosition(this.playerStep)
}

Game.prototype.onKeyDown = function (key) {
    if (key == ' ') {
        if (!this.spaceLocked) {
            this.playerStep++;
            this.spaceLocked = true;
        }
    }
}

Game.prototype.onKeyUp = function (key) {
    if (key == ' ') {
        this.spaceLocked = false;
    }
}

Game.prototype.onPointerDown = function (event) {
    this.playerStep++;
}

Game.prototype.onPointerUp = function (event) {

}

Game.prototype.draw = function (ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.camera.width, this.camera.height);

    for (let step of this.steps) {
        graphics.drawCanvas(step.x, step.y, this.stepCanvas, this.camera, ctx)
    }

    let i = 1;
    for (let step of this.steps) {
        graphics.drawText(step.x, step.y, i, 'white', 24, 'Verdana', true, this.camera, ctx)
        i++;
    }

    graphics.drawCanvas(this.player.x, this.player.y, this.player.canvas, this.camera, ctx)

    for (let ui of this.ui) {
        graphics.drawCanvas(ui.x, ui.y, ui.canvas, this.uicamera, ctx)
    }
}

Game.prototype.resize = function () {
    let game = this
    graphics.resizeContainer({ width: game.camera.width, height: game.camera.height },
        { width: window.innerWidth, height: window.innerHeight }, document.getElementById('canvas'));
}

Game.prototype.frame = function (dt) {
    this.update(dt);

    this.ctx = this.canvas.getContext('2d', {
        alpha: false,
        imageSmoothingEnabled: false
    });

    this.draw(this.ctx)
}

Game.prototype.setPlayerPosition = function (stepIndex) {
    if (stepIndex < this.steps.length) {
        this.player.x = this.steps[stepIndex].x
        this.player.y = this.steps[stepIndex].y - (this.stepSize.height * 0.5) - (this.playerSize.height * 0.5)
    }
}

function Graphics() {
    this.scaleFactor = 1
}

const graphics = new Graphics()

graphics.resizeContainer = function (worldSize, viewSize, canvas) {
    const factorWidth = viewSize.width / worldSize.width
    const factorHeight = viewSize.height / worldSize.height
    this.scaleFactor = Math.min(factorHeight, factorWidth)
    canvas.style.width = `${Math.floor(worldSize.width * this.scaleFactor)}px`
    let styleHeight = worldSize.height * this.scaleFactor
    canvas.style.height = `${Math.floor(styleHeight)}px`
    canvas.style.top = `${(viewSize.height - parseInt(canvas.style.height)) / 2}px`
    canvas.style.left = `${(viewSize.width - parseInt(canvas.style.width)) / 2}px`

    console.log(`Window ${window.innerWidth} x ${window.innerHeight}`)
    console.log(`Canvas buffer ${worldSize.width} x ${worldSize.height}`)
    console.log(`Canvas css ${canvas.style.width} x ${canvas.style.height}`)
    console.log(`Density ${window.devicePixelRatio}`)
    console.log(`Scale ${this.scaleFactor}`)
}

graphics.drawSprite = function (sprite, ctx, debug) {
    let tx = sprite.x - (sprite.canvas.width / 2)
    let ty = sprite.y - (sprite.canvas.height / 2)

    ctx.drawImage(sprite.canvas, tx, ty)

    if (debug) {
        this.debug(sprite.x, sprite.y, sprite.canvas.width, sprite.canvas.height, 'yellow', ctx)
    }
}

graphics.drawLabel = function (label, ctx, debug) {
    ctx.save()
    ctx.textBaseline = 'actualBoundingBoxAscent'
    ctx.textAlign = 'center'

    let x = 0
    let y = 0

    x = label.x
    y = label.y

    ctx.translate(x, y)

    ctx.fillStyle = label.color
    ctx.font = label.size + 'px ' + label.font
    ctx.fillText(label.content, 0, 0)

    if (debug) {
        const metrics = ctx.measureText(label.content)
        const textWidth = metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft
        const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        this.debug(0, -textHeight / 2, textWidth, textHeight, label.color, ctx)
    }

    ctx.restore()
}

graphics.insideSprite = function (sprite, event) {
    const rect = event.target.getBoundingClientRect()
    let pointX = (event.clientX - rect.left) / this.scaleFactor
    let pointY = (event.clientY - rect.top) / this.scaleFactor

    let x = sprite.x - (sprite.canvas.width / 2)
    let y = sprite.y - (sprite.canvas.height / 2)

    const localX = Math.round(pointX - x)
    const localY = Math.round(pointY - y)

    let hit = false

    if (localX >= 0 && localY >= 0) {
        const alpha = sprite.canvas.getContext('2d').getImageData(localX, localY, 1, 1).data[3]

        hit = alpha > 0
    }

    return hit
}

graphics.insideLabel = function (label, event, ctx) {
    const rect = event.target.getBoundingClientRect()
    const pointX = (event.clientX - rect.left) / this.scaleFactor
    const pointY = (event.clientY - rect.top) / this.scaleFactor

    ctx.textBaseline = 'actualBoundingBoxAscent'
    ctx.textAlign = 'center'
    ctx.font = label.size + 'px ' + label.font

    const metrics = ctx.measureText(label.content)
    const textWidth = metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft
    const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

    const halfWidth = textWidth / 2

    const startX = label.x - halfWidth
    const endX = label.x + halfWidth
    const startY = label.y - textHeight
    const endY = startY + textHeight

    return pointX >= startX && pointX <= endX && pointY >= startY && pointY <= endY
}

graphics.loadBitmap = async function (path) {
    console.log('Will load ' + path)

    const response = await fetch(path)
    const blob = await response.blob()
    return window.createImageBitmap(blob)
}

graphics.transform = function (width, height, degrees, bitmap) {
    const radians = mathUtils.degreesToRadians(degrees)
    const cosAngle = Math.abs(Math.cos(radians))
    const sinAngle = Math.abs(Math.sin(radians))
    const scaleX = width / bitmap.width
    const scaleY = height / bitmap.height
    const targetWidth = (bitmap.width * scaleX * cosAngle) + (bitmap.height * scaleY * sinAngle)
    const targetHeight = (bitmap.width * scaleX * sinAngle) + (bitmap.height * scaleY * cosAngle)

    const canvas = new OffscreenCanvas(Math.round(targetWidth), Math.round(targetHeight))

    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true })
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(radians)
    ctx.scale(scaleX, scaleY)
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)

    return canvas
}

graphics.debug = function (x, y, width, height, color, ctx) {
    ctx.lineWidth = 2
    ctx.strokeStyle = color
    ctx.strokeRect(
        x - (width / 2) - 1,
        y - (height / 2) - 1,
        width + 1,
        height + 1)
}

graphics.strokeLine = function (x1, y1, x2, y2, color, ctx) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = color
    ctx.stroke()
}

graphics.scaleWidth = function (width, rotation, bitmap) {
    const scaleFactor = width / bitmap.width
    return this.transform(bitmap.width * scaleFactor, bitmap.height * scaleFactor, rotation, bitmap)
}

graphics.scaleHeight = function (height, rotation, bitmap) {
    const scaleFactor = height / bitmap.height
    return this.transform(bitmap.width * scaleFactor, bitmap.height * scaleFactor, rotation, bitmap)
}

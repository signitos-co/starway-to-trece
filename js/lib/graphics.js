function Graphics() {
    this.scaleFactor = 1;
}

Graphics.prototype.resizeContainer = function (worldSize, viewSize, canvas) {
    const factorWidth = viewSize.width / worldSize.width;
    const factorHeight = viewSize.height / worldSize.height;
    this.scaleFactor = Math.min(factorHeight, factorWidth);
    canvas.style.width = `${Math.floor(worldSize.width * this.scaleFactor)}px`;
    let styleHeight = worldSize.height * this.scaleFactor;
    canvas.style.height = `${Math.floor(styleHeight)}px`;
    canvas.style.top = `${(viewSize.height - parseInt(canvas.style.height)) / 2}px`
    canvas.style.left = `${(viewSize.width - parseInt(canvas.style.width)) / 2}px`

    console.log(`Window ${window.innerWidth} x ${window.innerHeight}`);
    console.log(`Canvas buffer ${worldSize.width} x ${worldSize.height}`);
    console.log(`Canvas css ${canvas.style.width} x ${canvas.style.height}`);
    console.log(`Density ${window.devicePixelRatio}`);
    console.log(`Scale ${this.scaleFactor}`);
}

Graphics.prototype.drawCanvas = function (x, y, canvas, camera, ctx) {
    let tx = x - (canvas.width / 2) + (camera.width * 0.5) - camera.x
    let ty = y - (canvas.height / 2) + (camera.height * 0.5) - camera.y

    ctx.drawImage(canvas, tx, ty);
}

Graphics.prototype.drawText = function (x, y, text, color, size, font, center, camera, ctx) {
    ctx.save()
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    let _x = 0
    let _y = 0

    _x = x + (camera.width * 0.5) - camera.x
    _y = y + (camera.height * 0.5) - camera.y

    ctx.translate(_x, _y);

    ctx.fillStyle = color;
    ctx.font = size + 'px ' + font;
    const width = ctx.measureText(text).width;

    if (width >= ctx.canvas.width) {
        const parts = text.split(' ');
        let y = 0;
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            ctx.fillText(part, center ? 0 : ctx.measureText(o.part).width / 2, y);
            const measure = ctx.measureText(part);
            y += measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + 2;
        }
    } else {
        ctx.fillText(text, center ? 0 : ctx.measureText(text).width / 2, 0);
    }

    ctx.restore()
}

Graphics.prototype.insideBitmap = function (o, point, camera) {
    let x = o.x - (o.canvas.width / 2) + (camera.width * 0.5) - camera.x
    let y = o.y - (o.canvas.height / 2) + (camera.height * 0.5) - camera.y

    const localX = Math.round(point.x - x)
    const localY = Math.round(point.y - y)

    let hit = false;

    if (localX >= 0 && localY >= 0) {
        const alpha = o.canvas.getContext('2d').getImageData(localX, localY, 1, 1).data[3];

        hit = alpha > 0;
    }

    return hit;
}

Graphics.prototype.insideText = function (o, point, ctx) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = o.textSize + 'px ' + o.textFont;
    const measure = ctx.measureText(o.text);
    let halfWidth = 0;
    let halfHeight = 0;

    if (measure.width < ctx.canvas.width) {
        halfWidth = (measure.width * this.scaleFactor) / 2;
        halfHeight = ((measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent) * this.scaleFactor) / 2;
    } else {
        const parts = o.text.split(' ');
        halfWidth = this.maxWidth(ctx, parts) * this.scaleFactor / 2;
        halfHeight = (parts.length * (measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + 2) * this.scaleFactor) / 2;
    }

    let startX = point.x - halfWidth;
    let endX = point.x + halfWidth;
    let startY = point.y - halfHeight;
    let endY = point.y + halfHeight * 2;

    return point.x >= startX && point.x <= endX && point.y >= startY && point.y <= endY;
}

Graphics.prototype.hitTest = function (event, ctx, o, camera) {
    const rect = event.target.getBoundingClientRect()
    let point = {
        x: ((event.clientX - rect.left) / this.scaleFactor),
        y: ((event.clientY - rect.top) / this.scaleFactor)
    }

    if (o.canvas && this.insideBitmap(o, point, camera)) {
        return true;
    } else if (o.text && this.insideText(o, point, ctx)) {
        return true;
    }

    return false;
}

Graphics.prototype.loadBitmap = async function (path) {
    console.log('Will load ' + path);

    const response = await fetch(path);
    const blob = await response.blob();
    return window.createImageBitmap(blob);
}

Graphics.prototype.maxWidth = function (ctx, parts) {
    let maxWidth = ctx.measureText(parts[0]).width;

    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        const current = ctx.measureText(part).width;

        if (current > maxWidth) {
            maxWidth = current;
        }
    }

    return maxWidth;
}

Graphics.prototype.transform = function (width, height, degrees, bitmap) {
    const radians = mathUtils.degreesToRadians(degrees)
    const cosAngle = Math.abs(Math.cos(radians));
    const sinAngle = Math.abs(Math.sin(radians));
    const scaleX = width / bitmap.width
    const scaleY = height / bitmap.height
    const targetWidth = (bitmap.width * scaleX * cosAngle) + (bitmap.height * scaleY * sinAngle);
    const targetHeight = (bitmap.width * scaleX * sinAngle) + (bitmap.height * scaleY * cosAngle);

    const canvas = new OffscreenCanvas(Math.round(targetWidth), Math.round(targetHeight))

    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

    return canvas;
}

Graphics.prototype.debug = function (ctx, o) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "yellow";

    if (o.canvas) {
        ctx.strokeRect(
            o.position.x - (o.canvas.width / 2),
            o.position.y - (o.canvas.height / 2),
            o.canvas.width,
            o.canvas.height);
    } else if (o.text) {
        //TODO implement me!
    }
}

Graphics.prototype.createBoundingBox = function (startX, endX, startY, endY) {
    return { startX, endX, startY, endY }
}

Graphics.prototype.strokeLine = function (x1, y1, x2, y2, color, ctx) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = color
    ctx.stroke()
}

Graphics.prototype.scaleWidth = function (width, rotation, bitmap) {
    const scaleFactor = width / bitmap.width;
    return this.transform(bitmap.width * scaleFactor, bitmap.height * scaleFactor, rotation, bitmap)
}

Graphics.prototype.scaleHeight = function (height, rotation, bitmap) {
    const scaleFactor = height / bitmap.height;
    return this.transform(bitmap.width * scaleFactor, bitmap.height * scaleFactor, rotation, bitmap)
}

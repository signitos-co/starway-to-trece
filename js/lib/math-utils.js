function MathUtils() {
}

MathUtils.prototype.degreesToRadians = function (degrees) {
    return - (degrees * Math.PI / 180)
}

MathUtils.prototype.zCompare = function (a, b) {
    return a.z - b.z
}

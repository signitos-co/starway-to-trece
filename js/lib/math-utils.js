function MathUtils() {
}

MathUtils.prototype.degreesToRadians = function (degrees) {
    return - (degrees * Math.PI / 180)
}

MathUtils.prototype.zSort = function (objects) {
    objects.sort((o1, o2) => o1.z - o2.z)
}

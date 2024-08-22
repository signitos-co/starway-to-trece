function MathUtils() {
}
const mathUtils = new MathUtils()

mathUtils.degreesToRadians = function (degrees) {
    return - (degrees * Math.PI / 180)
}

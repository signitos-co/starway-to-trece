function Grid(width, height, initialValue){
    this.width = width
    this.height = height

    this.data = new Array(width * height)

    for (let i = 0; i < this.data.length; i++) {
        this.data[i] = initialValue
    }
}

Grid.prototype.get = function(x, y){
    const index = (y * this.width) + x
    return this.data[index]
}


Grid.prototype.set = function(x, y, value){
    const index = (y * this.width) + x
    this.data[index] = value
}

Grid.copy = function (from, to) {
    for (let i = 0; i < from.data.length; i++) {
        to.data[i] = from.data[i]
    }
}

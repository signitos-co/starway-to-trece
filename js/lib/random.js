function Random() {

}

Random.prototype.nextDouble = function (min, max) {
    return Math.random() * (max - min) + min;
}

Random.prototype.nextInt = function (min, max) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min));
}

Random.prototype.shuffle = function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

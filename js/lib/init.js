document.addEventListener('DOMContentLoaded', async () => {
    await game.init(document.getElementById('canvas'))

    document.addEventListener('pointerdown', event => {
        if (event.button === 0 && event.isPrimary) {
            game.onPointerDown(event)
        }
    });

    document.addEventListener('pointerup', event => {
        if (event.button === 0 && event.isPrimary) {
            game.onPointerUp(event)
        }
    });

    document.addEventListener('keydown', event => {
        game.onKeyDown(event.key.toLowerCase())
    });

    document.addEventListener('keyup', event => {
        game.onKeyUp(event.key.toLowerCase())
    });

    document.addEventListener('contextmenu', event => event.preventDefault());

    window.addEventListener('resize', () => {
        game.resize()
    });

    window.requestAnimationFrame(doFrame)

    function doFrame(timestamp) {
        const dt = timestamp - game.previous
        game.previous = timestamp
        game.frame(dt)
        window.requestAnimationFrame(doFrame)
    }
});

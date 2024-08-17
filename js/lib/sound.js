function Sound(){
   this.audioCtx = null;
}

Sound.prototype.loadAudio = async function (path) {
        if(this.audioCtx == null){
            this.audioCtx = new AudioContext()
        }

        console.log('Will load ' + path);

        const response = await fetch(path);
        const audioData = await response.arrayBuffer();
        return await this.audioCtx.decodeAudioData(audioData)
}

Sound.prototype.playAudio = function (buffer) {
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);
    source.start(0);
}


var FizzyText = function() {
  this.start = function(){ startAnimation() };
  this.restart = function(){ restartAnimation() };
};

var text = new FizzyText();
var gui = new dat.GUI();
gui.add(text, 'start');
gui.add(text, 'restart');

function startAnimation() {
    if (initAnim) {
        initAnim = false;
        runAnim = true;
    }
    // Start and Pause
    if (runAnim) {
        runAnim = false;
        isPlay = true;
        animate();
        } else {
            runAnim = true;
            isPlay = false;
        }
}

function restartAnimation() {
    // Boolean for Stop Animation
    initAnim = true;
    runAnim = false;
    isPlay = false;
    render();
}

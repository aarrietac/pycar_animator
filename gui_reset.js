
// create GUI object
var PyCarGUI = function() {
  this.filename = 'bodies_motion_step.txt';
  this.load = function(){ loadAniFile() };
  this.start = function(){ startAnimation() };
  this.restart = function(){ restartAnimation() };
};

// define function of GUI object
function loadAniFile() {
    // you need to create an input element in HTML, explained later
    var input = document.getElementById('img-path');
    input.addEventListener('change', function() {
        var file = input.files[0];
        text.filename = file.name;

        // update all controllers
        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
    });
    input.click();
};

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


// create GUI in canvas
var text = new PyCarGUI();
var gui = new dat.GUI();

gui.add(text, 'filename', text.filename);
gui.add(text, 'load');
gui.add(text, 'start');
gui.add(text, 'restart');

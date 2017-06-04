var GuiConfig = function() {
    this['Image Path'] = '18.jpg';  // default image path
    this['Upload Image'] = function() {
        // you need to create an input element in HTML, explained later
        var input = document.getElementById('img-path');
        input.addEventListener('change', function() {
            var file = input.files[0];
            config['Image Path'] = file.name;
            // update all controllers
            for (var i in gui.__controllers) {
                gui.__controllers[i].updateDisplay();
            }
        });
        input.click();
    };
};

var config = new GuiConfig();
var gui = new dat.GUI();
gui.add(config, 'Image Path', config['Image Path']);
gui.add(config, 'Upload Image');

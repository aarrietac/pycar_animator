if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// GLOBAL VARIABLES

// variables from Three js environment
var container, scene, camera, renderer, FPS;

// result data from ASCII file
var result;

// global index for time step simulation
var idx = 0;
var valueNode;

// vehicle global geometric data
var wheel_radius = 0.34;

var w1p, aw1;

var time_sim;
var offset_x = 0;
var yaw_angle = 0;

var globalAxis;

// --------------------------------------------------------------------------//
// TOOLS FUNCTIONS

function computePosRot( result, offset_x ) {

  // local variables
  var ex, ey, ez;

  // ---------------
  // SIMULATION TIME
  // ---------------
  time_sim = result[idx][0];

  // ----------------
  // FRONT LEFT WHEEL
  // ----------------

  // get positions (meters)
  var w1x = result[idx][13];
  var w1y = result[idx][14];
  var w1z = result[idx][15];

  // build rotation matrix
  ex = new THREE.Vector3( result[idx][16], result[idx][17], result[idx][18] );
  ey = new THREE.Vector3( result[idx][19], result[idx][20], result[idx][21] );
  ez = new THREE.Vector3( result[idx][22], result[idx][23], result[idx][24] );
  var A01 = new THREE.Matrix4().makeBasis(ex, ey, ez);

  w1p = new THREE.Vector3( w1x - offset_x, w1y, w1z );
  aw1 = A01;
}

function readLine(line) {
    // array data from ASCII file
    var array_loc = line.split(' ');

    // array of motion data (float)
    var motion = new Float32Array(61);

    // simulation time [sec]
    motion[0] = parseFloat(array_loc[0]);

    // Loop through bodies to get motion data from ASCII file
    // body 1: front left wheel
    // body 2: front right wheel
    // body 3: rear left wheel
    // body 4: rear right wheel
    // body 5: chassis

    var shift_idx = 12;
    var nbodies = 5;
    for (var i=0; i < nbodies; i++){
        // body 'i': translation vector
        motion[1+i*shift_idx] = parseFloat(array_loc[1+i*shift_idx]);
        motion[2+i*shift_idx] = parseFloat(array_loc[2+i*shift_idx]);
        motion[3+i*shift_idx] = parseFloat(array_loc[3+i*shift_idx]);

        // body 'i': matrix of rotation - 'x' axis vector
        motion[4+i*shift_idx] = parseFloat(array_loc[4+i*shift_idx]);
        motion[5+i*shift_idx] = parseFloat(array_loc[7+i*shift_idx]);
        motion[6+i*shift_idx] = parseFloat(array_loc[10+i*shift_idx]);

        // body 'i': matrix of rotation - 'y' axis vector
        motion[7+i*shift_idx] = parseFloat(array_loc[5+i*shift_idx]);
        motion[8+i*shift_idx] = parseFloat(array_loc[8+i*shift_idx]);
        motion[9+i*shift_idx] = parseFloat(array_loc[11+i*shift_idx]);

        // body 'i': matrix of rotation - 'z' axis vector
        motion[10+i*shift_idx] = parseFloat(array_loc[6+i*shift_idx]);
        motion[11+i*shift_idx] = parseFloat(array_loc[9+i*shift_idx]);
        motion[12+i*shift_idx] = parseFloat(array_loc[12+i*shift_idx]);
    }
    return motion;
}

function createAxis() {
    var axis = new THREE.AxisHelper(1.5)
    axis.material.linewidth = 2.0;
    return axis;
}

function onWindowResize() {

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// --------------------------------------------------------------------------//
// INIT FUNCTION

function init() {

  // scene
  scene = new THREE.Scene();

  // lights
  scene.add(new THREE.AmbientLight(0x333333));

  var dirLight1 = new THREE.DirectionalLight( 0xaaaaaa );
  dirLight1.position.set( 0, -2.0, 1.5 ).normalize();
  dirLight1.intensity = 3.0;
  scene.add( dirLight1 );

  // container and renderer
  container = document.getElementById( 'viewport' );

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true  } );
  renderer.setClearColor( 0x000000, 0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  var aspect = container.offsetWidth / container.offsetHeight;
  camera = new THREE.PerspectiveCamera( 60, aspect, 0.01, 200 );
  camera.position.set( -1/2, -2, 0.5 );
  camera.up.set( 0, 0, 1 );

  window.addEventListener( 'resize', onWindowResize, false );

  // additional text for time simulation
  var valueDiv = document.createElement( 'div' );
  valueDiv.style.position = 'absolute';
  valueDiv.style.top = '40px';
  valueDiv.style.left = '50px';
  valueDiv.style.width = '250px';
  valueDiv.style.height = '300px';
  valueDiv.style.fontSize = '30px';
  valueDiv.style.font = 'Monospace';
  container.appendChild( valueDiv );
  valueNode = document.createTextNode( '' );
  valueDiv.appendChild( valueNode );

  // Add road properties and 3D vehicle model

  // create grid
  var gridXY = new THREE.GridHelper( 1000, 500, 0xFF4444 );
  gridXY.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90*Math.PI/180 );
  scene.add( gridXY );

  // earth-fixed axis system
  globalAxis = createAxis();
  globalAxis.position.z = wheel_radius;
  scene.add(globalAxis)

  // load 3D models

  // load fullsize chassis mesh
  var loader = new THREE.JSONLoader();

  // load wheels mesh
  loader.load('./tire.json', function(geometry, materials) {
    // load wheel 3D blender model
    wheel1 = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));

    // set initial position
    wheel1.rotation.x = Math.PI;
    wheel1.position.set( 0, 0, wheel_radius );
    scene.add( wheel1 );
  });
}

// --------------------------------------------------------------------------//
// FUNCTION TO PERFOM THE ANIMATION

// define render function
function render() {

    // var chassis = scene.getObjectByName('chassis');

    if ( initAnim ) { idx = 0; }

    computePosRot( result, offset_x );

    if ( scene !== undefined ) {

        // update wheel-knuckle 1 position and orientation
        // wheel1.setRotationFromMatrix( aw1 );
        wheel1.rotation.y += -0.5;
        wheel1.position.set( w1p.x, 0.0, wheel_radius );

        // update position of global reference axis system
        globalAxis.position.x = w1p.x;

        // update camera position
        camera.position.x = w1p.x - 1;
        camera.lookAt(wheel1.position);

        // update time simulation on canvas
        valueNode.nodeValue = 't[s] = ' + time_sim.toFixed(1);

        // render scene
        renderer.render( scene, camera );
    }
}

// define animation function

// Boolean for start and restart
var idx = 0;
var initAnim = true;
var runAnim = false;
var isPlay = false;

function animate ( delta ) {

    if ( !isPlay ) return;

    if ( idx == result.length - 1 ){ idx = 0; }

    var FPS = 25;  // set frames/sec
    setTimeout( function() {
        requestAnimationFrame( animate );
    }, 1000 / FPS );

    render();

    idx += 1;
}

// --------------------------------------------------------------------------//
// MAIN FUNCTION
var main = function( ) {

    var loader = new THREE.FileLoader();

    var input_ani_file = 'bodies_motion.txt';

    loader.load( input_ani_file, function ( data ) {
        result = data.split('\n').map( readLine );
        offset_x = result[0][49];
        init();
        animate();
    });
}

// run PyCar animator
console.log( 'PyCar animation starting ...' );
main( );

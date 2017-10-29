if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// GLOBAL VARIABLES

// variables from Three js environment
var container, scene, camera, renderer, FPS;

// define objects from Three js (bodies)
var wheel1 = new THREE.Object3D();
var wheel2 = new THREE.Object3D();
var wheel3 = new THREE.Object3D();
var wheel4 = new THREE.Object3D();
var chassis = new THREE.Object3D();

// result data from ASCII file
var result;

// global index for time step simulation
var idx = 0;
var valueNode;

// vehicle global geometric data
// var wheel_base = 2.9;
var track_with = 1.5;
var wheel_base;
var scale_factor = 2.9/2.9;  // reference wheel_base = 2.9m (fullsize)
var wheel_radius = 0.34;

var time_sim;
var offset_x = 0;
var yaw_angle = 0;

var delta_tref, delta_tcurr, kdelta_t;
delta_tref = 0.05;

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
  dirLight1.position.set( 10, 10, 10 ).normalize();
  dirLight1.intensity = 1.0;
  scene.add( dirLight1 );

  var dirLight2 = new THREE.DirectionalLight( 0xaaaaaa );
  dirLight2.position.set( -10, -10, 10 ).normalize();
  dirLight2.intensity = 1.0;
  scene.add( dirLight2 );

  // container and renderer
  container = document.getElementById( 'viewport' );

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true  } );
  renderer.setClearColor( 0x000000, 0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  var aspect = container.offsetWidth / container.offsetHeight;
  camera = new THREE.PerspectiveCamera( 60, aspect, 0.01, 200 );
  camera.position.set( -10, -8, 5 );
  camera.up.set( 0, 0, 1 );

  var target = new THREE.Vector3( 0, 0, 0 );
  camera.lookAt( target );
  camera.updateProjectionMatrix();

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
  var gridXY = new THREE.GridHelper( 1000, 100, 0xFF4444 );
  gridXY.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90*Math.PI/180 );
  scene.add( gridXY );

  // add mu split area
  addMuSplitArea ( offset_x );

  // add obstacle
  addObstacle( offset_x );

  // load 3D models

  // load fullsize chassis mesh
  var loader = new THREE.JSONLoader();
  loader.load('./fullsize_car.json', function(geometry, materials) {
    chassis = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
    chassis.scale.x = chassis.scale.z = scale_factor;
    chassis.add(createAxis())
    chassis.rotation.order = 'ZYX';
    chassis.position.set( 0, 0, wheel_radius );
    scene.add( chassis );
  });

  // load wheels mesh
  loader.load('./tire.json', function(geometry, materials) {
    // load wheel 3D blender model
    wheel1 = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
    wheel2 = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
    wheel3 = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
    wheel4 = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));

    // set initial position
    wheel1.position.set( 0, track_with/2, wheel_radius );
    wheel2.position.set( 0, -track_with/2, wheel_radius );
    wheel3.position.set( -wheel_base, track_with/2, wheel_radius );
    wheel4.position.set( -wheel_base, -track_with/2, wheel_radius );

    // add to the scene
    scene.add( wheel1 );
    scene.add( wheel2 );
    scene.add( wheel3 );
    scene.add( wheel4 );
  });
}

// --------------------------------------------------------------------------//
// FUNCTION TO PERFOM THE ANIMATION

// define render function
function render() {

    // var chassis = scene.getObjectByName('chassis');

    if ( initAnim ) { idx = 0; }

    // update position and orientation of each body
    var data_pos_rot = computePosRot( result, offset_x );

    // wheels
    var w1p = data_pos_rot.pos_w1;
    var aw1 = data_pos_rot.rot_w1;

    var w2p = data_pos_rot.pos_w2;
    var aw2 = data_pos_rot.rot_w2;

    var w3p = data_pos_rot.pos_w3;
    var aw3 = data_pos_rot.rot_w3;

    var w4p = data_pos_rot.pos_w4;
    var aw4 = data_pos_rot.rot_w4;

    // chassis
    var cp = data_pos_rot.pos_ch;
    var ac = data_pos_rot.rot_ch;

    if ( scene !== undefined ) {

        // update wheel-knuckle 1 position and orientation
        wheel1.setRotationFromMatrix( aw1 );
        wheel1.position.set( w1p.x, w1p.y, w1p.z );

        // update wheel-knuckle 2 position and orientation
        wheel2.setRotationFromMatrix( aw2 );
        wheel2.position.set( w2p.x, w2p.y, w2p.z );

        // update wheel-knuckle 3 position and orientation
        wheel3.setRotationFromMatrix( aw3 );
        wheel3.position.set( w3p.x, w3p.y, w3p.z );

        // update wheel-knuckle 4 position and orientation
        wheel4.setRotationFromMatrix( aw4 );
        wheel4.position.set( w4p.x, w4p.y, w4p.z );

        // update chassis position and orientation
        chassis.setRotationFromMatrix( ac );
        chassis.position.set( cp.x, cp.y, cp.z );

        // update camera position
        // camera.position.x = cp.x - 10.0*Math.sin(yaw_angle);
        // camera.position.y = cp.y - 10.0*Math.cos(yaw_angle);
        console.log(cp.x);
        camera.position.x = cp.x - 10.0;
        camera.position.y = cp.y - 10.0;
        camera.lookAt(chassis.position);

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

    if ( idx >= result.length - 1 ){ idx = 0; }

    var FPS = 25;  // set frames/sec
    setTimeout( function() {
        requestAnimationFrame( animate );
    }, 1000 / FPS );

    render();

    idx += 1*kdelta_t;
}

// --------------------------------------------------------------------------//
// MAIN FUNCTION
var main = function( ) {

    var loader = new THREE.FileLoader();

    var input_ani_file = 'bodies_motion.txt';

    loader.load( input_ani_file, function ( data ) {
        result = data.split('\n').map( readLine );

        // get position offset
        offset_x = result[0][49];

        // compute scale factor for chassis body (fullsize and midsize car)
        wheel_base = Math.abs(result[0][1] - result[0][25]);
        scale_factor = wheel_base/2.9;

        // compute delta time factor (proper visualization)
        delta_tcurr = result[1][0] - result[0][0];
        kdelta_t = (delta_tref/delta_tcurr).toFixed(1);

        // start animation
        init();
        animate();
    });
}

// run PyCar animator
console.log( 'PyCar animation starting ...' );
main( );

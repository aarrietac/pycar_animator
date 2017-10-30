if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// GLOBAL VARIABLES

// variables from Three js environment
var container, scene, camera, renderer, FPS;

// Simulation informations
var index = 0;
var files = ['bodies_motion.txt'];
var num_simu = files.length;
var num_bodies = 5;

// Create dynamically objects 3D for wheels and chassis
var wheels = [];
var chassis = [];
for (var i = 0; i < num_simu; i++){
  chassis[i] = new THREE.Object3D();
  for (var j = 0; j < num_bodies - 1; j++){
    wheels[j + (num_bodies - 1)*i] = new THREE.Object3D();
  }
}

// result data from ASCII file
var result = [];

// global index for time step simulation
var idx = 0;
var valueNode;

// scale factor for vehicle body
var scale_factor = 2.9/2.9;  // reference wheel_base = 2.9m (fullsize)

var time_sim;
var yaw_angle = 0;

var kdelta_t;


// --------------------------------------------------------------------------//
// RESIZE WINDOWS FUNCTION

function onWindowResize() {

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// --------------------------------------------------------------------------//
// INIT FUNCTION

function init( ) {

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
  addMuSplitArea ( );

  // add obstacle
  addObstacle( );

  // load 3D models

  // load fullsize chassis mesh
  var loader = new THREE.JSONLoader();
  loader.load('./fullsize_car.json', function(geometry, materials) {

    for (var i = 0; i < chassis.length; i++){
      chassis[i] = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
      chassis[i].scale.x = chassis[i].scale.z = scale_factor;
      chassis[i].add(createAxis())
      chassis[i].rotation.order = 'ZYX';
      chassis[i].position.set( 0, 0, wheel_radius );
      scene.add( chassis[i] );
    }
  });

  // load wheels mesh
  loader.load('./tire.json', function(geometry, materials) {

    // load wheel 3D blender model
    for (var i = 0; i < wheels.length; i++){

      // load model
      wheels[i] = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));

      // set design wheels positions
      switch (i){
        case 0:  // front left
          wheels[i].position.set( 0, track_with/2, wheel_radius );
          break;
        case 1:  // front right
          wheels[i].position.set( 0, -track_with/2, wheel_radius );
          break;
        case 2:  // rear left
          wheels[i].position.set( -wheel_base, track_with/2, wheel_radius );
          break;
        case 3:  // rear right
          wheels[i].position.set( -wheel_base, -track_with/2, wheel_radius );
          break;
      }

      // add to the scene
      scene.add(wheels[i]);
    }
  });
}

// --------------------------------------------------------------------------//
// FUNCTION TO PERFOM THE ANIMATION

// define render function
function render() {

    if ( initAnim ) { idx = 0; }

    // get position and orientation of each body
    var data_pos_rot = [];
    for (var i = 0; i < num_simu; i++){
      data_pos_rot[i] = computePosRot( result[i] );
    }

    // wheels position and orientation
    var wheels_pos = [];
    var wheels_rot = [];

    num_wheels = wheels.length;
    for (var i = 0; i < num_simu; i++){
      for (var j = 0; j < num_wheels; j++){
        wheels_pos[j + num_wheels*i] = data_pos_rot[i].pos_whl[j];
        wheels_rot[j + num_wheels*i] = data_pos_rot[i].rot_whl[j];
      }
    }

    // chassis
    var chassis_pos = [];
    var chassis_rot = [];

    num_chassis = chassis.length;
    for (var i = 0; i < num_chassis; i++){
      chassis_pos[i] = data_pos_rot[i].pos_ch;
      chassis_rot[i] = data_pos_rot[i].rot_ch;
    }

    if ( scene !== undefined ) {

        // update wheel-knuckle(i) position and orientation
        for (var i = 0; i < num_wheels; i++){
          wheels[i].setRotationFromMatrix(wheels_rot[i]);
          wheels[i].position.set(wheels_pos[i].x, wheels_pos[i].y, wheels_pos[i].z);
        }

        // update chassis position and orientation
        for (var i = 0; i < num_chassis; i++){
          chassis[i].setRotationFromMatrix( chassis_rot[i] );
          chassis[i].position.set( chassis_pos[i].x, chassis_pos[i].y, chassis_pos[i].z );
        }

        // update camera position
        // camera.position.x = cp.x - 10.0*Math.sin(yaw_angle);
        // camera.position.y = cp.y - 10.0*Math.cos(yaw_angle);
        // console.log(cp.x);
        camera.position.x = cp.x - 10.0;
        camera.position.y = cp.y - 10.0;
        camera.lookAt(chassis[0].position);

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

    if ( idx >= result[0].length - 1 ){ idx = 0; }

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

    function loadNextSimulation() {
      if (index > files.length - 1) return;

      loader.load(files[index], function (data) {
        result[index] = data.split('\n').map( readLine );

        // compute scale factor for chassis body (fullsize and midsize car)
        scale_factor = wheel_base/2.9;

        // compute delta time factor (proper visualization)
        kdelta_t = (delta_tref/delta_tcurr).toFixed(1);

        index++;
        loadNextSimulation();
      })
    };

    // for comparision purposes, e.g. ABS-ON and ABS-OFF
    loadNextSimulation();

    // start animation
    init();
    animate();
}

// run PyCar animator
console.log( 'PyCar animation starting ...' );
main( );

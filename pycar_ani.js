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
var wheel_base = 2.9;
var track_with = 1.5;
var wheel_radius = 0.34;

var w1p, w2p, w3p, w4p, cp;
var aw1, aw2, aw3, aw4, ac;
var time_sim;
var offset_x = 0;

// --------------------------------------------------------------------------//
// TOOLS FUNCTIONS

function addMuSplitArea ( offset_x ) {
    // create mu-split area
    var xc_area = 200;
    var yc_area = 2.5;
    var length_area = 100;
    var width_area = 5;
    var material = new THREE.MeshBasicMaterial({ color:0x80a0bc, side:THREE.DoubleSide });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( xc_area-length_area/2-offset_x, yc_area-width_area/2, 0 ));
    geometry.vertices.push(new THREE.Vector3( xc_area+length_area/2-offset_x, yc_area-width_area/2, 0 ));
    geometry.vertices.push(new THREE.Vector3( xc_area+length_area/2-offset_x, yc_area+width_area/2, 0 ));
    geometry.vertices.push(new THREE.Vector3( xc_area-length_area/2-offset_x, yc_area+width_area/2, 0 ));
    geometry.vertices.push(new THREE.Vector3( xc_area-length_area/2-offset_x, yc_area-width_area/2, 0 ));
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 2, 3));

    var muSplitMesh = new THREE.Mesh(geometry, material);
    scene.add( muSplitMesh );
}

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
  var w1x = result[idx][1];
  var w1y = result[idx][2];
  var w1z = result[idx][3];

  // build rotation matrix
  ex = new THREE.Vector3( result[idx][4], result[idx][5], result[idx][6] );
  ey = new THREE.Vector3( result[idx][7], result[idx][8], result[idx][9] );
  ez = new THREE.Vector3( result[idx][10], result[idx][11], result[idx][12] );
  var A01 = new THREE.Matrix4().makeBasis(ex, ey, ez);

  // -----------------
  // FRONT RIGHT WHEEL
  // -----------------

  // get positions (meters)
  var w2x = result[idx][13];
  var w2y = result[idx][14];
  var w2z = result[idx][15];

  // build rotation matrix
  ex = new THREE.Vector3( result[idx][16], result[idx][17], result[idx][18] );
  ey = new THREE.Vector3( result[idx][19], result[idx][20], result[idx][21] );
  ez = new THREE.Vector3( result[idx][22], result[idx][23], result[idx][24] );
  var A02 = new THREE.Matrix4().makeBasis(ex, ey, ez);

  // ---------------
  // REAR LEFT WHEEL
  // ---------------

  // get positions (meters)
  var w3x = result[idx][25];
  var w3y = result[idx][26];
  var w3z = result[idx][27];

  // build rotation matrix
  ex = new THREE.Vector3( result[idx][28], result[idx][29], result[idx][30] );
  ey = new THREE.Vector3( result[idx][31], result[idx][32], result[idx][33] );
  ez = new THREE.Vector3( result[idx][34], result[idx][35], result[idx][36] );
  var A03 = new THREE.Matrix4().makeBasis(ex, ey, ez);

  // ----------------
  // REAR RIGHT WHEEL
  // ----------------

  // get positions (meters)
  var w4x = result[idx][37];
  var w4y = result[idx][38];
  var w4z = result[idx][39];

  // build rotation matrix
  ex = new THREE.Vector3( result[idx][40], result[idx][41], result[idx][42] );
  ey = new THREE.Vector3( result[idx][43], result[idx][44], result[idx][45] );
  ez = new THREE.Vector3( result[idx][46], result[idx][47], result[idx][48] );
  var A04 = new THREE.Matrix4().makeBasis(ex, ey, ez);

  // --------------
  // CHASSIS MOTION
  // --------------

  // get positions (meters)
  var posx = result[idx][49];
  var posy = result[idx][50];
  var posz = result[idx][51];

  // build rotation matrix
  ex = new THREE.Vector3( result[idx][52], result[idx][53], result[idx][54] );
  ey = new THREE.Vector3( result[idx][55], result[idx][56], result[idx][57] );
  ez = new THREE.Vector3( result[idx][58], result[idx][59], result[idx][60] );
  var A0F = new THREE.Matrix4().makeBasis(ex, ey, ez);

  // var offset_x = result[0][49];

  w1p = new THREE.Vector3( w1x - offset_x, w1y, w1z );
  aw1 = A01;

  w2p = new THREE.Vector3( w2x - offset_x, w2y, w2z );
  aw2 = A02;

  w3p = new THREE.Vector3( w3x - offset_x, w3y, w3z );
  aw3 = A03;

  w4p = new THREE.Vector3( w4x - offset_x, w4y, w4z );
  aw4 = A04;

  cp = new THREE.Vector3( posx - offset_x, posy, posz );
  ac = A0F;
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
    var axis = new THREE.AxisHelper(3)
    axis.material.linewidth = 1.5;
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
  var gridXY = new THREE.GridHelper( 400, 40, 0xFF4444 );
  gridXY.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90*Math.PI/180 );
  scene.add( gridXY );

  // add mu split area
  addMuSplitArea ( offset_x );

  // load 3D models

  // load fullsize chassis mesh
  var loader = new THREE.JSONLoader();
  loader.load('./fullsize_car.json', function(geometry, materials) {
    chassis = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
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

    if ( initAnim ) { idx = 0; }

    computePosRot( result, offset_x );

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
        camera.position.x = cp.x - 5;

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

    if ( idx == 111 ){ idx = 0; }

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

    var input_ani_file = 'bodies_motion_step.txt';

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

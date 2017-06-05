if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

// variables from Three js environment
var container, scene, camera, renderer, FPS;

// define objects from Three js (bodies)
var wheel1, wheel2, wheel3, wheel4, chassis;

// result data from ASCII file
// var result;

// global index for time step simulation
var idx = 0;
var valueNode;

// vehicle global geometric data
var wheel_base = 3.5;
var track_with = 1.7;

// off-set vehicle x-axis
var offset_x;

function render() {

    if ( idx == 111 ){
        idx = 0;
    }

    // local variables
    var ex, ey, ez;

    // ---------------
    // SIMULATION TIME
    // ---------------
    var time_sim = result[idx][0];

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

    if ( scene !== undefined ) {

        FPS = 25;  // set frames/sec
        setTimeout( function() {
            requestAnimationFrame( render );
        }, 1000 / FPS );

        // update wheel-knuckle 1 position and orientation
        wheel1.setRotationFromMatrix( A01 );
        wheel1.position.set( w1x-offset_x, w1y, w1z);

        // update wheel-knuckle 2 position and orientation
        wheel2.setRotationFromMatrix( A02 );
        wheel2.position.set( w2x-offset_x, w2y, w2z);

        // update wheel-knuckle 3 position and orientation
        wheel3.setRotationFromMatrix( A03 );
        wheel3.position.set( w3x-offset_x, w3y, w3z);

        // update wheel-knuckle 4 position and orientation
        wheel4.setRotationFromMatrix( A04 );
        wheel4.position.set( w4x-offset_x, w4y, w4z);

        // update chassis position and orientation
        chassis.setRotationFromMatrix( A0F );
        chassis.position.set( posx-offset_x, posy, posz);

        // update camera position
        camera.position.x = posx-offset_x-5;

        // render scene
        renderer.render( scene, camera );

        // update time simulation on canvas
        valueNode.nodeValue = 't [sec] = ' + time_sim.toFixed(1);
    }

    idx += 1;

}

function createAxis() {
    var axis = new THREE.AxisHelper(4)
    axis.material.linewidth = 2;
    return axis;
}

function onWindowResize() {

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function init() {

  // scene
  scene = new THREE.Scene();

  // create grid
  var gridXY = new THREE.GridHelper( 400, 40 );
  gridXY.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90*Math.PI/180 );
  scene.add( gridXY );

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

  // world coordinates
  var world_coords = createAxis();
  scene.add(world_coords);

  // lights
  scene.add(new THREE.AmbientLight(0x333333));

  var directionalLight = new THREE.DirectionalLight( 0xaaaaaa );
  directionalLight.position.set( 10, 10, 10 ).normalize();
  directionalLight.intensity = 1.0;
  scene.add( directionalLight );

  directionalLight = new THREE.DirectionalLight( 0xaaaaaa );
  directionalLight.position.set( -10, -10, 10 ).normalize();
  directionalLight.intensity = 1.0;
  scene.add( directionalLight );

  // others
  container = document.getElementById( 'viewport' );

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true  } );
  renderer.setClearColor( 0x000000, 0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  var valueDiv = document.createElement( 'div' );
  valueDiv.style.position = 'absolute';
  valueDiv.style.top = '20px';
  valueDiv.style.left = '50px';
  valueDiv.style.width = '500px';
  valueDiv.style.height = '300px';
  valueDiv.style.fontSize = '60px';
  container.appendChild( valueDiv );
  valueNode = document.createTextNode( '' );
  valueDiv.appendChild( valueNode );

  var aspect = container.offsetWidth / container.offsetHeight;
  camera = new THREE.PerspectiveCamera( 60, aspect, 0.01, 200 );
  // orbit = new THREE.OrbitControls( camera, container );
  // orbit.addEventListener( 'change', render );
  camera.position.set( -10, -10, 10 );
  // camera.position.set( 0, 0, 30 );
  camera.up.set( 0, 0, 1 );

  var target = new THREE.Vector3( 0, 0, 0 );
  camera.lookAt( target );
  // orbit.target = target;
  camera.updateProjectionMatrix();

  window.addEventListener( 'resize', onWindowResize, false );

  // load 3D models

  // materials
  var darkMaterial = new THREE.MeshBasicMaterial( {color:0xffffcc} );
  var wireFrameMaterial = new THREE.MeshBasicMaterial( {color:0x000000, wireframe: true, transparent: true} );
  var multiMaterial = [ darkMaterial, wireFrameMaterial ];

  // load fullsize chassis mesh
  var loader = new THREE.JSONLoader();
  loader.load('./fullsize_car.json', function(geometry, materials) {
      chassis = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
      chassis.add(createAxis())
      chassis.rotation.order = 'ZYX';
      scene.add( chassis );
  });

  // load wheels mesh
  loader.load('./tire.json', function(geometry, materials) {
      wheel1 = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
      wheel2 = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
      wheel3 = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
      wheel4 = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));

      // add to the scene
      scene.add( wheel1 );
      scene.add( wheel2 );
      scene.add( wheel3 );
      scene.add( wheel4 );
  });

  // render();
}

// define a function to load the vehicle c.g.
var loadPos = function() {

    var manager = new THREE.LoadingManager();

    manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };

    var loader = new THREE.FileLoader(manager);

    loader.load( 'bodies_motion_mu_split.txt', function ( data ) {
            result = data.split('\n').map( readLine );
            offset_x = result[0][49];
            init();
            render();
    });
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

// init();
loadPos();
// render();

// TOOLS FUNCTIONS

// ---------------------------------------------------------------------------//
// Create and add to the scene a road area (can be used for mu-split)
// ---------------------------------------------------------------------------//

function addMuSplitArea ( offset_x ) {
    // create mu-split area
    var xc_a = 120 - offset_x;
    var yc_a = 0.0;
    var l_area = 300;
    var w_area = 5.5;
    var material = new THREE.MeshBasicMaterial({ color:0x80a0bc, side:THREE.DoubleSide });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( xc_a - l_area/2, yc_a - w_area/2, 0 ));
    geometry.vertices.push(new THREE.Vector3( xc_a + l_area/2, yc_a - w_area/2, 0 ));
    geometry.vertices.push(new THREE.Vector3( xc_a + l_area/2, yc_a + w_area/2, 0 ));
    geometry.vertices.push(new THREE.Vector3( xc_a - l_area/2, yc_a + w_area/2, 0 ));
    geometry.vertices.push(new THREE.Vector3( xc_a - l_area/2, yc_a - w_area/2, 0 ));
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 2, 3));

    var muSplitMesh = new THREE.Mesh(geometry, material);
    scene.add(muSplitMesh);
}

// ---------------------------------------------------------------------------//
// Create and add to the scene an obstacle (avoiding maneuvers)
// ---------------------------------------------------------------------------//

function addObstacle( offset_x ) {
  var cube = new THREE.Mesh( new THREE.CubeGeometry( 5, 5, 5 ), new THREE.MeshNormalMaterial() );
  cube.position.x = 150 - offset_x;
  cube.position.y = 0;
  cube.position.z = 5/2;

  scene.add(cube);
}

// ---------------------------------------------------------------------------//
// Create an axis coordinate system
// ---------------------------------------------------------------------------//

function createAxis() {
    var axis = new THREE.AxisHelper(3)
    axis.material.linewidth = 1.5;
    return axis;
}

// ---------------------------------------------------------------------------//
// Read and store the information of each line of an input ascii file
// ---------------------------------------------------------------------------//

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

// ---------------------------------------------------------------------------//
// Compute the position and rotation matrix of each body
// ---------------------------------------------------------------------------//

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

  // get yaw angle of chassis (used for camera orientation)
  yaw_angle = Math.atan2( ex.y, ex.x);

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

  return {
    pos_w1: w1p, rot_w1: aw1,
    pos_w2: w2p, rot_w2: aw2,
    pos_w3: w3p, rot_w3: aw3,
    pos_w4: w4p, rot_w4: aw4,
    pos_ch: cp, rot_ch: ac
  };
}

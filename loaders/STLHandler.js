var camera, cameraTarget, scene, renderer, controls, orbit, control, mesh, geometry, material, plane, gridHelper, view, exporter;
var w = window.innerWidth, h = window.innerHeight;

window.addEventListener("load", function () {
    "use strict";
    window.addEventListener( 'resize', onWindowResize, false );
	
	setupRenderer();
	setupCamera();
	setupScene();
	setupPlane();
	setupLight();
					
	exporter = new THREE.STLExporter();
	
    material = new THREE.MeshPhongMaterial({
        color: 0x339900, ambient: 0x339900, specular: 0x030303,
    });
    mesh = new THREE.Mesh(new THREE.Geometry(), material);
    scene.add(mesh);
    
    var loop = function loop() {
        requestAnimationFrame(loop);
        //mesh.rotation.z += 0.05;
        //controls.update();
        renderer.clear();
        renderer.render(scene, camera);
    };
    loop();
    buildGui();
	
    // file load
    var openFile = function (file) {
        var reader = new FileReader();
        reader.addEventListener("load", function (event) {
            var buffer = event.target.result;
            geometry = loadStl(buffer);
			resetScene();
			setupCamera();
            mesh = new THREE.Mesh(geometry, material);
			setupMesh(mesh);
        }, false);
        reader.readAsArrayBuffer(file);
    };
	
    // file input button
    var input = document.getElementById("file");
    input.addEventListener("change", function (event) {
        var file = event.target.files[0];
        openFile(file);
    }, false);
	
	// URL file input field
	var input2 = document.getElementById("fileURL");
	input2.addEventListener("change", function () {
		var buffer = input2.value;
		var loader = new THREE.STLLoader();
		loader.load(buffer, function (geometry){
			resetScene();
			setupCamera();
			mesh = new THREE.Mesh(geometry, material);
            setupMesh(mesh);
		});
	});
    
    // dnd
    view.addEventListener("dragover", function (event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    }, false);
    view.addEventListener("drop", function (event) {
        event.stopPropagation();
        event.preventDefault();
        var file = event.dataTransfer.files[0];
        openFile(file);
    }, false);
	
	window.addEventListener( 'keydown', function ( event ) {

		switch ( event.keyCode ) {

			case 81: // Q
				control.setSpace( control.space === "local" ? "world" : "local" );
				break;

			case 17: // Ctrl
				control.setTranslationSnap( 100 );
				control.setRotationSnap( THREE.Math.degToRad( 15 ) );
				break;

			case 87: // W
				control.setMode( "translate" );
				break;

			case 69: // E
				control.setMode( "rotate" );
				break;

			case 82: // R
				control.setMode( "scale" );
				break;

			case 187:
			case 107: // +, =, num+
				control.setSize( control.size + 0.1 );
				break;

			case 189:
			case 109: // -, _, num-
				control.setSize( Math.max( control.size - 0.1, 0.1 ) );
				break;

			case 88: // X
				control.showX = !control.showX;
				break;

			case 89: // Y
				control.showY = !control.showY;
				break;

			case 90: // Z
				control.showZ = !control.showZ;
				break;

			case 32: // Spacebar
				control.enabled = !control.enabled;
				break;

		}

	});

	window.addEventListener( 'keyup', function ( event ) {

		switch ( event.keyCode ) {

			case 17: // Ctrl
				control.setTranslationSnap( null );
				control.setRotationSnap( null );
				break;

		}

	});
}, false);

function render() {
	
	renderer.render( scene, camera );
}

function setupCamera() {
	
	camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 1000);
    camera.position.set( 3, 3, 3 );
	cameraTarget = new THREE.Vector3( 0, -0.25, 0 );
    //controls = new THREE.OrbitControls( camera );
	//controls.enableDamping = true
	//controls.dampingFactor = 0.2
	//controls.rotateSpeed = 0.5
}

function setupScene() {
	
	scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x666666));
	scene.background = new THREE.Color( 0x999999 );
	scene.fog = new THREE.Fog( 0x72645b, 2, 15 );
}

function setupLight() {
	
	scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
	
		addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
		addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );
	
    var light1 = new THREE.DirectionalLight(0xffffff);
    light1.position.set(0, 100, 100);
    scene.add(light1);
    
    var light2 = new THREE.DirectionalLight(0xffffff);
    light2.position.set(0, -100, -100);
    scene.add(light2);
}

function setupMesh(mesh) {
	mesh.position.set( 0, 0.5, 0 );
	mesh.rotation.set( -Math.PI / 2, 0, 0 );
	mesh.scale.set( 2, 2, 2 );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.dynamic = true;

	orbit = new THREE.OrbitControls(camera, renderer.domElement);
	orbit.update();
	orbit.addEventListener( 'change', render );

	control = new THREE.TransformControls( camera, renderer.domElement );
	control.addEventListener( 'change', render );

	control.addEventListener( 'dragging-changed', function ( event ) {
		orbit.enabled = !event.value;
	} );
	control.attach( mesh );
	scene.add(control);
	scene.add(mesh);
}

function resetScene(){
	scene.remove(mesh);
	scene.remove(control);
	scene.remove(orbit);
	scene.remove(camera);
}

function setupPlane() {
	
	plane = new THREE.Mesh(
		//new THREE.PlaneBufferGeometry( 40, 40 ),
		//new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
	);
	plane.rotation.x = -Math.PI/2;
	plane.position.y = -0.5;
	scene.add( plane );
	plane.receiveShadow = true;
				
	var size = 10;
	var divisions = 10;

	gridHelper = new THREE.GridHelper( size, divisions );
	scene.add( gridHelper );
}

function setupRenderer() {
	view = document.getElementById("view");
	renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( w, h );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	view.appendChild(renderer.domElement);
}

function addShadowedLight( x, y, z, color, intensity ) {
	
	var directionalLight = new THREE.DirectionalLight( color, intensity );
	directionalLight.position.set( x, y, z );
	scene.add( directionalLight );
	directionalLight.castShadow = true;
	var d = 1;
	directionalLight.shadow.camera.left = -d;
	directionalLight.shadow.camera.right = d;
	directionalLight.shadow.camera.top = d;
	directionalLight.shadow.camera.bottom = -d;
	directionalLight.shadow.camera.near = 1;
	directionalLight.shadow.camera.far = 4;
	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;
	directionalLight.shadow.bias = -0.002;
}

function buildGui() {
	
	var params = {
		color: "#999999",
		ASCII: function() {
						exportASCII();
					},
		Binary: function() {
			exportBinary();
		}
	};
	gui = new dat.GUI();
	var folder1 = gui.addFolder('Scene Color');
	folder1.addColor(params, 'color').onChange(function(){
		scene.background = new THREE.Color( params.color);
	});
	var folder2 = gui.addFolder('Export as STL');
	folder2.add(params, 'ASCII');
	folder2.add(params, 'Binary');
	
	gui.open();
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	render();
}

function exportASCII() {
	var result = exporter.parse( mesh );
	saveString( result, 'ASCII.stl' );
}

function exportBinary() {
	var result = exporter.parse( mesh, { binary: true } );
	saveArrayBuffer( result, 'binary.stl' );
}

var link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );

function save( blob, filename ) {
	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
}

function saveString( text, filename ) {
	save( new Blob( [ text ], { type: 'text/plain' } ), filename );
}

function saveArrayBuffer( buffer, filename ) {
	save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}
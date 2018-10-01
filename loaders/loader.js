var camera, cameraTarget, scene, renderer;

window.addEventListener("load", function () {
    "use strict";
    
    var view = document.getElementById("view");
    
	var w = view.offsetWidth, h = window.innerHeight;
	
	var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( w, window.innerHeight );
	renderer.gammaInput = true;
				renderer.gammaOutput = true;
				renderer.shadowMap.enabled = true;
	view.appendChild(renderer.domElement);
    
    var camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 1000);
    camera.position.set( 3, 3, 3 );
	cameraTarget = new THREE.Vector3( 0, -0.25, 0 );
    var controls = new THREE.OrbitControls( camera );
	controls.enableDamping = true
	controls.dampingFactor = 0.2
	controls.rotateSpeed = 0.5
    
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x666666));
	scene.background = new THREE.Color( 0x72645b );
				scene.fog = new THREE.Fog( 0x72645b, 2, 15 );
    
	var plane = new THREE.Mesh(
					new THREE.PlaneBufferGeometry( 40, 40 ),
					new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
				);
				plane.rotation.x = -Math.PI/2;
				//plane.position.y = -0.5;
				scene.add( plane );
				plane.receiveShadow = true;
				
	var size = 10;
	var divisions = 10;

	var gridHelper = new THREE.GridHelper( size, divisions );
	scene.add( gridHelper );
	
	scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
				addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
				addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );
	
    var light1 = new THREE.DirectionalLight(0xffffff);
    light1.position.set(0, 100, 100);
    scene.add(light1);
    
    var light2 = new THREE.DirectionalLight(0xffffff);
    light2.position.set(0, -100, -100);
    scene.add(light2);
    
    var mat = new THREE.MeshPhongMaterial({
        color: 0x339900, ambient: 0x339900, specular: 0x030303,
    });
    var obj = new THREE.Mesh(new THREE.Geometry(), mat);
    scene.add(obj);
    
	//buildGui();
	
    var loop = function loop() {
        requestAnimationFrame(loop);
        //obj.rotation.z += 0.05;
        controls.update();
        renderer.clear();
        renderer.render(scene, camera);
    };
    loop();
    
    // file load
    var openFile = function (file) {
        var reader = new FileReader();
        reader.addEventListener("load", function (ev) {
            var buffer = ev.target.result;
            var geom = loadStl(buffer);
            scene.remove(obj);
            obj = new THREE.Mesh(geom, mat);
			obj.position.set( 0, 0.5, 0 );
			obj.rotation.set( -Math.PI / 2, 0, 0 );
			obj.scale.set( 2, 2, 2 );
			obj.castShadow = true;
			obj.receiveShadow = true;
            scene.add(obj);
        }, false);
        reader.readAsArrayBuffer(file);
    };
    
    // file input button
    var input = document.getElementById("file");
    input.addEventListener("change", function (ev) {
        var file = ev.target.files[0];
        openFile(file);
    }, false);
    
    // dnd
    view.addEventListener("dragover", function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "copy";
    }, false);
    view.addEventListener("drop", function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var file = ev.dataTransfer.files[0];
        openFile(file);
    }, false);
}, false);

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
				gui = new dat.GUI();
				var params = {
					'light color': spotLight.color.getHex(),
					intensity: spotLight.intensity,
					distance: spotLight.distance,
					angle: spotLight.angle,
					penumbra: spotLight.penumbra,
					decay: spotLight.decay
				}
				gui.addColor( params, 'light color' ).onChange( function ( val ) {
					spotLight.color.setHex( val );
					render();
				} );
				gui.add( params, 'intensity', 0, 2 ).onChange( function ( val ) {
					spotLight.intensity = val;
					render();
				} );
				gui.add( params, 'distance', 50, 200 ).onChange( function ( val ) {
					spotLight.distance = val;
					render();
				} );
				gui.add( params, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {
					spotLight.angle = val;
					render();
				} );
				gui.add( params, 'penumbra', 0, 1 ).onChange( function ( val ) {
					spotLight.penumbra = val;
					render();
				} );
				gui.add( params, 'decay', 1, 2 ).onChange( function ( val ) {
					spotLight.decay = val;
					render();
				} );
				gui.open();
			}
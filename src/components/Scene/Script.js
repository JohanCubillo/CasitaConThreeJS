import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import * as dat from 'dat.gui'


//Global variables
let currentRef = null;
const gui =new dat.GUI({width:400})
const sceneParams=  {
  envMapIntensity : 0.30,
  dlColor: 0xffffff,
  alColor : 0xffffff
}

//Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, 100 / 100, 0.1, 100);
scene.add(camera);
camera.position.set(-80, 1, 1);
camera.lookAt(new THREE.Vector3());

const renderer = new THREE.WebGLRenderer();
renderer.outputEncoding=THREE.sRGBEncoding
renderer.shadowMap.enabled=true
renderer.shadowMap.type=THREE.PCFShadowMap
renderer.physicallyCorrectLights=true
renderer.toneMapping= THREE.ACESFilmicToneMapping
renderer.toneMappingExposure=1.5
renderer.setSize(100, 100);

//renderfolder
const rendertweaks =  gui.addFolder('Renderer')
rendertweaks.add(renderer,'toneMapping',{
  'THREE.NoToneMapping' : THREE.NoToneMapping,
  'THREE.LinearToneMapping' : THREE.LinearToneMapping,
  'THREE.ReinhardToneMapping' : THREE.NoToneMapping,


}).onChange(()=>{
  renderer.toneMapping = Number(renderer.toneMapping)
  scene.traverse(child =>{
    if(child instanceof THREE.Mesh){
      child.material.needsUpdate=true
    }
  })
})

rendertweaks.add(renderer,'toneMapping')
.min(0)
.max(10)
.step(0.001)




//OrbitControls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

//Resize canvas
const resize = () => {
  renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
  camera.aspect = currentRef.clientWidth / currentRef.clientHeight;
  camera.updateProjectionMatrix();
};
window.addEventListener("resize", resize);

//Animate the scene
const animate = () => {
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};
animate();

//loading manager

const loadingManager = new THREE.LoadingManager(
  
     () =>{
      console.log('Todo cargo perfecto')
     },
    (
      itemUrl,
      itemsToLoad,
      ItemsLoaded
    ) =>{ console.log(Math.trunc((itemsToLoad/ItemsLoaded)*100))},
    () =>{}
  
)


//
const loader = new GLTFLoader(loadingManager);
const Dracoloader = new DRACOLoader()
Dracoloader.setDecoderPath('./draco/')
loader.setDRACOLoader(Dracoloader)
//cube

loader.load(
	// resource URL
	'./draco/sushishop.gltf',
	// called when the resource is loaded
	 ( gltf )=> {

		while(gltf.scene.children.length){
      scene.add(gltf.scene.children[0])
    }
    castAndReceiveShadows()
	},
	// called while loading is progressing
	 () =>{

		console.log(  'loaded' );

	},
	// called when loading has errors
	 ( ) =>{

		console.log( 'An error happened' );

	}
);
//cast and receive shadows

const castAndReceiveShadows =()=>{
  scene.traverse((child)=>{
    if(child instanceof THREE.Mesh){
      child.material.envMapIntensity= sceneParams.envMapIntensity
      child.castShadow=true
      child.receiveShadow=true
    }
  })
}

//planebase
const planebase = new THREE.Mesh(

  new THREE.PlaneBufferGeometry(35,35),
  new THREE.MeshStandardMaterial()
)
planebase.rotation.x=Math.PI*-0.5
planebase.position.y=-3
scene.add(planebase)
//luz
const folderligths = gui.addFolder("Ligts")

const light1 = new THREE.DirectionalLight(0xffffff,4.5)
light1.position.set(1,6,1)
light1.castShadow=true
light1.shadow.mapSize.set(1050,1050)
light1.shadow.bias=0.0005
light1.shadow.normalBias=0.0005
scene.add(light1)
folderligths.add(light1,'intensity')
.min(0)
.max(1)
.step(0.001)
.name("Intense LG")

folderligths.addColor(sceneParams,'dlColor')
.onChange(()=>{
  light1.color.set(sceneParams.dlColor)
})



//ambiental 
const ambiental = new THREE.AmbientLight(0xffffff,0.90)
scene.add(ambiental)
folderligths.add(ambiental,'intensity')
.min(0)
.max(1)
.step(0.001)
.name("Ambiental LG")

folderligths.addColor(sceneParams,'alColor')
.onChange(()=>{
  ambiental.color.set(sceneParams.alColor)
})


const envMap=new THREE.CubeTextureLoader().load([
  './envmap/px.png',
  './envmap/nx.png',
  './envmap/py.png',
  './envmap/ny.png',
  './envmap/pz.png',
  './envmap/nz.png',]

)

scene.environment= envMap
folderligths.add(sceneParams,'envMapIntensity')
.min(0)
.max(3)
.step(0.001)
.name("EnvMap Intensity")
.onChange(()=>{
  scene.traverse(child=>{
    if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
    child.material.envMapIntensity = sceneParams.envMapIntensity
  })
})



//Init and mount the scene
export const initScene = (mountRef) => {
  currentRef = mountRef.current;
  resize();
  currentRef.appendChild(renderer.domElement);
};

//Dismount and clena up the buffer from the scene
export const cleanUpScene = () => {
  gui.destroy()
  scene.dispose();
  currentRef.removeChild(renderer.domElement);
  
};

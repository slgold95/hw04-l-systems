import {vec3, vec4, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import MySquare from './geometry/MySquare';
import MyIcosphere from './geometry/MyIcosphere';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import ExpansionRules from './LSystem/ExpansionRules'; // for LSystem
import LSystem from './LSystem/LSystem'; // for LSystem
import {readTextFile} from './globals';
import Mesh from './geometry/Mesh'; // for obj loading

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
let colorVec: vec3 = vec3.fromValues(0.0, 1.0, 0.0);
let guiIters: number = 1.0; // to keep track of slider value
let guiAngle: number = 10.0; // to keep track of slider value

const controls = {
  // Added 
  iterations: 3.0,
  branchAngle: 20.0,
  petalColorR: 0.5,
  petalColorG: 0.0,
  petalColorB: 0.5,
  'recreate': createLSystem,
};

let mySquare: MySquare;
let screenQuad: ScreenQuad;

// shapes
let icosphere: MyIcosphere;
let leaf: MyIcosphere;
let pot: Mesh; // maya .obj file of a pot
let cylinder: Mesh;
let time: number = 0.0;

// the branches
function createLSystem(): void{
  let myLSystem: LSystem = new LSystem(new ExpansionRules(), controls.branchAngle);

  // arrays
  let data = myLSystem.drawLSystemFunc(controls.iterations); // iterations from slider
  let colorsBranchArray = []; // array to hold colors for each instance
  let c1BranchArray = []; // array for column 1
  let c2BranchArray = []; // array for column 2
  let c3BranchArray = []; // array for column 3
  let c4BranchArray = []; // array for column 4

  for (let i = 0.0; i < data.length; i++) {
    let currData = data[i];
    let currTransform = currData.transform;

    // add column vecs (mat4 is 4x4)
    // First column
    c1BranchArray.push(currTransform[0]);
    c1BranchArray.push(currTransform[1]);
    c1BranchArray.push(currTransform[2]);
    c1BranchArray.push(currTransform[3]);
    // second column
    c2BranchArray.push(currTransform[4]);
    c2BranchArray.push(currTransform[5]);
    c2BranchArray.push(currTransform[6]);
    c2BranchArray.push(currTransform[7]);
    // third column
    c3BranchArray.push(currTransform[8]);
    c3BranchArray.push(currTransform[9]);
    c3BranchArray.push(currTransform[10]);
    c3BranchArray.push(currTransform[11]);
    // fourth column
    c4BranchArray.push(currTransform[12]);
    c4BranchArray.push(currTransform[13]);
    c4BranchArray.push(currTransform[14]);
    c4BranchArray.push(currTransform[15]);
    // add colors
    if(currData.char == "*"){
      colorsBranchArray.push(controls.petalColorR); 
      colorsBranchArray.push(controls.petalColorG); 
      colorsBranchArray.push(controls.petalColorB); 
      colorsBranchArray.push(1.0);
    }
    else if(currData.char == "&"){
      colorsBranchArray.push(0.2353); 
      colorsBranchArray.push(0.8667); 
      colorsBranchArray.push(0.4784); 
      colorsBranchArray.push(1.0);
    }
    else if(currData.char == "B"){
      colorsBranchArray.push(0.1216); 
      colorsBranchArray.push(0.3882); 
      colorsBranchArray.push(0.2235); 
      colorsBranchArray.push(1.0);
    }
    else{
    colorsBranchArray.push(0.2627); 
    colorsBranchArray.push(0.5255); 
    colorsBranchArray.push(0.0902); 
    colorsBranchArray.push(1.0); 
    }
  }

  let c1BranchFinal: Float32Array = new Float32Array(c1BranchArray);
  let c2BranchFinal: Float32Array = new Float32Array(c2BranchArray);
  let c3BranchFinal: Float32Array = new Float32Array(c3BranchArray);
  let c4BranchFinal: Float32Array = new Float32Array(c4BranchArray);
  let branchColors: Float32Array = new Float32Array(colorsBranchArray);
  // set the instance VBOs
  mySquare.setInstanceVBOs(c1BranchFinal, c2BranchFinal, c3BranchFinal, c4BranchFinal, branchColors);
  mySquare.setNumInstances(data.length); // transforms.length is number of draw matrices, number of individual instances to draw

  icosphere.setInstanceVBOs(c1BranchFinal, c2BranchFinal, c3BranchFinal, c4BranchFinal, branchColors);
  icosphere.setNumInstances(data.length);

  cylinder.setInstanceVBOs(c1BranchFinal, c2BranchFinal, c3BranchFinal, c4BranchFinal, branchColors);
  cylinder.setNumInstances(data.length);

}

function loadScene() {
  mySquare = new MySquare();
  mySquare.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Icosphere branch shape
  icosphere = new MyIcosphere(vec3.fromValues(0.0, 0.0, 0.0), 1.0, 5);
  icosphere.create();
  // Icosphere leaf shape
  leaf = new MyIcosphere(vec3.fromValues(0.0, 0.0, 0.0), 1.0, 5);
  leaf.create();
  
  // Pot Mesh
  let obj0: string = readTextFile('./src/geometry/pot.obj');
  //let obj0: string = readTextFile("https://raw.githubusercontent.com/slgold95/hw04-l-systems/master/src/geometry/pot.obj");
  pot = new Mesh(obj0, vec3.fromValues(0.0, 0.0, 0.0));
  pot.create(); 

  // Cylinder Mesh
  let obj1: string = readTextFile('./src/geometry/cylinder.obj');
  //let obj1: string = readTextFile("http://raw.githubUsercontent.com/slgold95/hw04-l-systems/master/src/geometry/cylinder.obj");
  cylinder = new Mesh(obj1, vec3.fromValues(0.0, 0.0, 0.0));
  cylinder.create(); 
    
  pot = new Mesh(obj0, vec3.fromValues(0.0, 0.0, 0.0));
  pot.create();
  // set up mesh VBOs
  let potColorsArray: number[] = [0.3059, 0.1804, 0.098, 1.0]; // brown
  let col1Array: number[] = [0.6, 0, 0, 0]; // scale x
  let col2Array: number[] = [0, 0.6, 0, 0]; // scale y
  let col3Array: number[] = [0, 0, 0.6, 0]; // scale z
  let col4Array: number[] = [0, -3, 0, 1]; // translation
  let col1: Float32Array = new Float32Array(col1Array);
  let col2: Float32Array = new Float32Array(col2Array);
  let col3: Float32Array = new Float32Array(col3Array);
  let col4: Float32Array = new Float32Array(col4Array);
  let colors: Float32Array = new Float32Array(potColorsArray);
  pot.setInstanceVBOs(col1, col2, col3, col4, colors);
  pot.setNumInstances(1); 

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
 
  // create LSystem
  createLSystem(); // call initial LSystem
  
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'iterations', 1.0, 5.0).step(1.0);
  gui.add(controls, 'branchAngle', 0.0, 45.0).step(5.0);
  gui.add(controls, 'petalColorR', 0.0, 1.0).step(0.1);
  gui.add(controls, 'petalColorG', 0.0, 1.0).step(0.1);
  gui.add(controls, 'petalColorB', 0.0, 1.0).step(0.1);
  gui.add(controls, 'recreate');
  
  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    
  if(controls.iterations - guiIters != 0){
    guiIters = controls.iterations;
    // redo LSystem
    createLSystem();
  }
  if(controls.branchAngle - guiAngle != 0){
    guiAngle = controls.branchAngle;
    // redo LSystem
    createLSystem();
  }
  
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [          
      icosphere, 
      leaf,
      pot,
      //cylinder,      
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
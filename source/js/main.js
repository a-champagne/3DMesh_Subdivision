// Check the availability of WebGL
const canvas = document.getElementById("glCanvas");

const gl = canvas.getContext("webgl2");
if (gl == null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
}

// Make the drawingbuffer match the div size of browser
function resize_canvas(){
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
 
    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {
 
        // Make the canvas the same size
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}

// Initial event handler for canvas
function initEventHandlers (canvas, gl_operation) {
    var lastX = -1;
    var lastY = -1;
    
    var dragging = false;
 
    canvas.onmousedown = function(ev) {  //Mouse is pressed
        if (load_mesh) {
            dragging = true;

            lastX = ev.clientX;
            lastY = ev.clientY;

            ev.preventDefault();
        }
    };
 
    canvas.onmouseup = function(ev){ //Mouse is released
        dragging = false;
    };
 
    canvas.onmousemove = function(ev) { //Mouse is moved
        if (dragging) {
            var dX = (lastY - ev.clientY) * 2 * Math.PI / canvas.height;
            var dY = (ev.clientX - lastX) * 2 * Math.PI / canvas.width;
            
            lastX = ev.clientX;
            lastY = ev.clientY;

            gl_operation.rotateScene(dX, dY);
            gl_operation.drawSetup();
            gl_operation.drawMesh(cur_mesh);

            ev.preventDefault();
        }
    };

    canvas.onwheel = function (ev) { // Mouse scroll
        var dis = 0;

        if (ev.deltaY > 0) { // Zoom in
            dis += 0.1;
        }
        else {
            dis -= 0.1;
        }

        gl_operation.zoom(dis);
        gl_operation.drawSetup();
        gl_operation.drawMesh(cur_mesh);

        ev.preventDefault();
    };
}


// Map the drawing buffer to the size of div on browser
resize_canvas();
// Add resize window event listener
window.addEventListener("resize", resize_canvas);

// Set up the WebGL operation interface
let gl_operation = new WebGL(canvas, gl);
gl_operation.setup();
gl_operation.drawSetup();

// OBJ loader
let loader = new OBJLoader();

// Get mesh
let mesh_file = '';
let cur_mesh = new Mesh();
let load_mesh = false;

// Initial canvas event handlers
initEventHandlers(canvas, gl_operation);

var cur_subdivider = new subdivider(cur_mesh);

var chooseFile = document.getElementById("modelFile");
chooseFile.addEventListener("change", function(){
   // cur_subdivider.clear();
    cur_subdivider = new subdivider(cur_mesh);
});

// Control subdivision level
var subdivisionInput = document.getElementById("subdivisionInput");
subdivisionInput.addEventListener("focusout", function(){
    var input_value = subdivisionInput.value;

    // Calling subdivison here
    cur_mesh = cur_subdivider.subdivide(input_value);
    gl_operation.drawSetup();
    gl_operation.modelSetup(cur_mesh);
    gl_operation.drawMesh(cur_mesh);
});

var subInc = document.getElementById("subIncrease");
subInc.addEventListener("click", function(){
    var input_value = parseInt(subdivisionInput.value);
    input_value += 1;
    subdivisionInput.value = input_value; 
    
    // Calling subdivision here
    cur_mesh = cur_subdivider.subdivide(input_value);
    gl_operation.drawSetup();
    gl_operation.modelSetup(cur_mesh);
    gl_operation.drawMesh(cur_mesh);
});

var subDec = document.getElementById("subDecrease");
subDec.addEventListener("click", function(){
    var input_value = parseInt(subdivisionInput.value);
    if (input_value > 0) {
        input_value -= 1;
        subdivisionInput.value = input_value;
    
        // Calling subdivision here
        cur_mesh = cur_subdivider.subdivide(input_value);
        gl_operation.drawSetup();
        gl_operation.modelSetup(cur_mesh);
        gl_operation.drawMesh(cur_mesh);
    }
});


// Read mesh
$(document).ready(function(){
    $('input[type="file"]').change(function(e){
        var fileName = e.target.files[0].name;
        mesh_file = 'meshes/' + fileName;
        console.log('Select File: ' + fileName);

        subdivisionInput.value = 0;
        

        loader.load(mesh_file, function(out){
            console.log('Read Mesh!');
            cur_mesh.builMesh(out.vertices, out.normals, out.faces);
           
            gl_operation.drawSetup();
            gl_operation.cameraSetup();
            gl_operation.modelSetup(cur_mesh);
            gl_operation.drawMesh(cur_mesh);
            load_mesh = true;
        });
    });
});


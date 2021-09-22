function subdivider (input_mesh) {
    this.meshes = [];
    // Initializes this subdivision object with a mesh to use as 
    // the control mesh (ie: subdivision level 0).
    this.meshes.push(input_mesh);
    
    //debug mode
    const debug = false;   
      
    this.subdivide = function (level) {
        // Subdivides the control mesh to the given subdivision level.
        // Returns the subdivided mesh.
        
        // HINT: Create a new subdivision mesh for each subdivision level and 
        // store it in memory for later.
        // If the calling code asks for a level that has already been computed,
        // just return the pre-computed mesh!
        
        if (this.meshes.length > level){
            return this.meshes[level];
        } 
        else { 
            var thisMesh = new Mesh();
            thisMesh.copyMesh(this.meshes[level - 1]);        
            thisMesh = markAllOld(thisMesh);
        }
        
        var edges = thisMesh.getEdges();
        
        for (var i = 0; i < edges.length; i++){
           if (edges[i].isSplit() === false) 
                thisMesh = splitEdge(edges[i], thisMesh);
        }
        
        for ( var vert of thisMesh.getVertices()){
            if (vert.isNew === true){
                    vert = getButterflyCoords(vert);
            }
        }
       
        if (debug === true){   
            for (var he of edges){
                if (he !== he.getNext().getPrev()) throw new Error("Error: he.next.prev != he");
                if (he !== he.getPrev().getNext()) throw new Error("Error: he.prev.next != he");
                if (he !== he.getTwin().getTwin()) throw new Error("Error: he.twin.twin != he");
            }
            for (var vert of thisMesh.getVertices()){
                if (vert !== vert.getEdge().getOrigin()) throw new Error("Error: vert.edge.origin != vert");
            }
        }
       
        var faces = thisMesh.getFaces();
        var len = faces.length;
        
        for(var i = 0; i< len; i++){
            var face = faces[i];
            var counter = 0;
            do{
                    thisMesh = cutACorner(face, thisMesh);
                    counter++;
                }while (counter < 3);             
        }     
          
        if (debug === true){
            for (var face of thisMesh.getFaces()){
                if (face !== face.getEdge().getFace())  throw new Error("Error: face.edge.face != face");
            }
        }
    
        thisMesh.computeNormal();
        //console.log("final mesh");
        //console.log(thisMesh);
        this.meshes.push(thisMesh);

        return thisMesh;    
    }
    
    this.clear = function () {
        this.meshes = [];
        console.log("mesh cleared!");
    }
    
} 

//Calculates and updates the postion of a new vertex
function getButterflyCoords(v){
    //get neighbours
    var he = v.he;
    var eightR = he.next;
    var twotop = eightR.next.next;
    var eightL = twotop.next.next;
    var onetl = eightL.prev.twin.prev.prev;
    var onetr = eightR.twin.next.next.next;
    var twobot = he.twin.prev.prev;
    var onebr = twobot.twin.next.next.next;
    var onebl = twobot.prev.twin.prev.prev; 

    //break up caclulation of new coords to make less ugly
    var temp1 = eightL.origin.getPos().multiply(1/2).add(eightR.origin.getPos().multiply(1/2));
    //console.log(temp1);
    var temp2 = twotop.origin.getPos().multiply(1/8).add(twobot.origin.getPos().multiply(1/8));
    //console.log(temp2);
    var temp3 = onetl.origin.getPos().multiply(-1/16).add(onetr.origin.getPos().multiply(-1/16));
    //console.log(temp3);
    var temp4 = onebl.origin.getPos().multiply(-1/16).add(onebr.origin.getPos().multiply(-1/16));
    //console.log(temp4);

    var x = temp1.x() + temp2.x() + temp3.x() + temp4.x();
    var y = temp1.y() + temp2.y() + temp3.y() + temp4.y();
    var z = temp1.z() + temp2.z() + temp3.z() + temp4.z();
    //console.log(x);
    //console.log(y);
    //console.log(z);

    v.setPos(x, y, z);

    return v;
}

function markAllOld (M){

    for (var vert of M.getVertices()){
        vert.setNew(false);
    }
    for (var he of M.getEdges()){
        he.setSplit(false);
    }
    
    return M;
}

//Add vertex to the mesh
function addVertex  (he, M){
    var origin = he.origin.getPos();
    var next = he.twin.origin.getPos();
    he.setSplit(true);
    he.twin.setSplit(true);

    var x = 1/2*(origin.value[0] + next.value[0]);
    var y = 1/2*(origin.value[1] + next.value[1]);
    var z = 1/2*(origin.value[2] + next.value[2]);

    // console.log("x: " + x);
    // console.log("y: " + y);
    // console.log("z: " + z);

    var idx = M.getVertices().length;
    var newV = M.addVertexPos(x, y, z, idx);
    newV.setNew(true);
    newV.setEdge(he);

    return newV;
}

function cutACorner (f, M){
     var he = f.getEdge();

    //make sure we're starting from a new vertex
    while (he.origin.getNew() !== true){
        he = he.next;
    }

    //get verts for new edge
    var v1 = he.next.next.origin;
    var v2 = he.origin;

    //add edges
    var newhe = M.addEdge(v1, v2);
    var newheTwin = M.addEdge(v2, v1);
 
    //mark them split
    newhe.setSplit(true);
    newheTwin.setSplit(true);

    //set edge and twin pointers
    newheTwin.prev = he.prev;
    newheTwin.next = he.next.next;
    newheTwin.prev.next = newheTwin;
    newheTwin.next.prev = newheTwin;

    newhe.next = he;
    newhe.prev = he.next;
    newhe.prev.next = he;
    newhe.next.prev = he;

    //set face's halfedge for next iteration of cutAcorner for this face
    f.he = newheTwin.next;
    //set twin's face to old face
    newheTwin.setFace(f);
    //add new face to mesh
    M.addFaceByHE(newhe, he, newhe.prev);

    return M;
}


function splitEdge (he, M) {

    var newVert = addVertex(he, M);
    var face = he.getFace();
    var twinFace = he.twin.getFace();
    var twin = he.twin;
    var prev = he.prev;
    var twinNext = he.twin.next;

    var v1 = he.origin;
    var v2 = he.twin.origin;

    //create new half edges
    newhe = M.addEdge(v1, newVert);
    newheTwin = M.addEdge(newVert, v1);

    //set twins and faces of new edges
    newhe.face = face;
    newheTwin.face = twinFace;

    //set origin/prev/next of first new half edge
    newhe.prev = prev;
    newhe.next = he;
    newhe.prev.next = newhe;
    newhe.next.prev = newhe;
    newhe.origin.he = newhe;

    //set origin/prev/net of second new half edge (twin)
    newheTwin.prev = twin;
    newheTwin.next = twinNext;
    newheTwin.next.prev = newheTwin;
    newheTwin.prev.next = newheTwin;
    
    //change old edge origin
    he.origin = newVert;
    he.prev = newhe;
    he.next.prev = he;
    he.prev.next = he;

    //set he->twin->next to new edge twin
    he.twin.next = newheTwin;
    he.twin.next.prev = he.twin;
    he.twin.prev.next = he.twin;

    //set he->prev to new edge
    he.prev = newhe;
    he.prev.twin = newheTwin;

    //update split status
    he.prev.setSplit(true);
    he.prev.twin.setSplit(true);   
    newhe.setSplit(true);
    newheTwin.setSplit(true);

    //update edgemap
    var key = String(he.origin.getId()) + "," + String(he.twin.origin.getId());
    M.edgeMap.set(key, he);
    var key = String(he.twin.origin.getId()) + "," + String(he.origin.getId());
    M.edgeMap.set(key, he.twin);
    newVert.setEdge(he);

    return M;
 }


/**
 * A simple half-edge mesh class
**/

class Vertex {
    constructor(x, y, z, idx) {
        this.position = new Vector3D(x, y, z);
        this.id = idx;
    }

    getPos() { return this.position; }
    getEdge()  { return this.he; }
    getId() { return this.id; }
    getNew() { return this.isNew; }

    setNew(tf) {
        this.isNew = tf;
    }

    setPos(dx, dy, dz) {
        this.position.value[0] = dx;
        this.position.value[1] = dy;
        this.position.value[2] = dz;
    }

    setEdge(e) {
        this.he = e;
    }
}

class HalfEdge {
    constructor() {}

    getOrigin() { return this.origin; }
    getTwin() { return this.twin; }
    getPrev() { return this.prev; }
    getNext() { return this.next; }
    getFace() { return this.face; }

    isSplit() { return this.split};

    setSplit(tf) { this.split = tf};

    setOrigin(v) { this.origin = v; }
    setTwin(e) { this.twin = e; }
    setPrev(e) { this.prev = e; }
    setNext(e) { this.next = e; }
    setFace(f) { this.face = f; }
    
}

class Face {
    constructor() {}

    getEdge() { return this.he; }

    setEdge (e) { this.he = e; }

    vert(idx) {
        if (this.he) {
            switch (idx) {
                case 0: return this.he.origin;
                case 1: return this.he.next.origin;
                case 2: return this.he.prev.origin;
            }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
        }
    }

    computeNormal () {
        var v0 = this.vert(0).position;
        var v1 = this.vert(1).position;
        var v2 = this.vert(2).position;

        var u = v1.subtract(v0);
        var u = u.normalize();
        var v = v2.subtract(v0);
        var v = v.normalize();
        var w = u.cross(v);

        return w.normalize();
    }
}

class Mesh {
    constructor () {
        this.vertices = [];
        this.edges = [];
        this.faces = [];
        this.normals = [];

        this.edgeMap = new Map();
    }

    builMesh (verts, normals, faces) {
        this.clear();

        // Add vertices and vertex normals to our trimesh.
        for (var i = 0; i < verts.length; i++)
        {
            this.addVertexPos(verts[i][0], verts[i][1], verts[i][2], i);

            if (normals.length > 0) {
                var n = new Vector3D(normals[i][0], normals[i][1], normals[i][2]);
                this.normals.push(n);
            }
        }

        // Add triangles to our trimesh.
        for (var i = 0; i < faces.length; i++)
        {
            var v0 = this.vertices[faces[i][0][0]];
            var v1 = this.vertices[faces[i][1][0]];
            var v2 = this.vertices[faces[i][2][0]];
            this.addFaceByVerts(v0, v1, v2);
        }

        this.edgeMap.clear();

        if (normals.length == 0) {
            this.computeNormal();
        }

        console.log("Mesh built!");
    }

    copyMesh (m) {
        // Copy vertices
        for (var i = 0; i < m.getVertices().length; i++) {
            var v = m.getVertices()[i];
            var v_pos = v.getPos();
            this.addVertexPos(v_pos.value[0], v_pos.value[1], v_pos.value[2], i);
        }

        // Copy faces
        for (var i = 0; i < m.getFaces().length; i++)
        {
            var f = m.getFaces()[i];
            var v0 = this.vertices[f.vert(0).getId()];
            var v1 = this.vertices[f.vert(1).getId()];
            var v2 = this.vertices[f.vert(2).getId()];
            this.addFaceByVerts(v0, v1, v2);
        }

        this.edgeMap.clear();
    }

    clear () {
        this.vertices = [];
        this.edges = [];
        this.faces = [];
        this.normals = [];
        this.edgeMap.clear();
    }

    addVertexPos (x, y, z, i) {
        var v = new Vertex(x, y, z, i);
        this.vertices.push(v); 
        return this.vertices[this.vertices.length - 1];                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    }

    addFaceByVerts (v1, v2, v3) {
        var e1 = this.findEdge(v1, v2);
        if (!e1) { e1 = this.addEdge(v1, v2); }
        var e2 = this.findEdge(v2, v3);
        if (!e2) { e2 = this.addEdge(v2, v3); }
        var e3 = this.findEdge(v3, v1);
        if (!e3) { e3 = this.addEdge(v3, v1); }

        return this.addFaceByHE(e1, e2, e3);
    }

    addFaceByHE (e1, e2, e3) {
        // Add the face to the mesh
        var f = new Face();
        this.faces.push(f);
        
        // Initialize face-edge relationship
        f.setEdge(e1);

        // Initialize edge-face relationship
        e1.setFace(f); e2.setFace(f); e3.setFace(f);

        // Connect edge cycle around face
        e1.setNext(e2); e2.setPrev(e1);
        e2.setNext(e3); e3.setPrev(e2);
        e3.setNext(e1); e1.setPrev(e3);

        return f;
    }

    addFace () {
        var f = new Face();
        this.faces.push(f);
        return this.faces[this.faces.length - 1];
    }

    addHalfEdge () {
        var he = new HalfEdge();
        this.edges.push(he);
        return this.edges[this.edges.length - 1]; 
    }

    addEdge (v1, v2) {
        var he = new HalfEdge();
        this.edges.push(he);
        
        var key = String(v1.getId()) + "," + String(v2.getId());
        this.edgeMap.set(key, he);

        // Associate edge with its origin vertex
        he.setOrigin(v1);
        if (v1.getEdge() === undefined) {
            v1.setEdge(he); 
        }

        // Associate edge with its twin, if it exists
        var t_he = this.findEdge(v2, v1);
        if (t_he === undefined) {} 
        else {
            he.setTwin(t_he);
            t_he.setTwin(he);
        }

        return he;
    }

    findEdge (v1, v2) {
        var key = String(v1.getId()) + "," + String(v2.getId());
        if (this.edgeMap.has(key)) {
            return this.edgeMap.get(key);
        }
    }

    getBoundingBox () {
        if (this.vertices.length == 0) return;

        var min = this.vertices[0].getPos().copy();
        var max = this.vertices[0].getPos().copy();

        for (var i = 0; i < this.vertices.length; i++) {
            for (var j = 0; j < 3; j++) {
                var pos = this.vertices[i].getPos();

                if (min.value[j] > pos.value[j]) {
                    min.value[j] = pos.value[j];
                }
                if (max.value[j] < pos.value[j]) {
                    max.value[j] = pos.value[j];
                }
            }
        }

        return [min, max];
    }

    getCentroid () {
        var boundingbox = this.getBoundingBox();

        var min = boundingbox[0];
        var max = boundingbox[1];

        var centroid = min.add(max);
        centroid = centroid.multiply(0.5);

        return centroid;
    }

    computeNormal () {
        this.normals = [];

        var count = [];
        for (var i = 0; i < this.vertices.length; i++){
            this.normals.push(new Vector3D(0.0, 0.0, 0.0));
            count.push(0);
        }

        
        for (var i = 0; i < this.faces.length; i++) {
            var f = this.faces[i];
            var n = f.computeNormal();

            var v0_idx = this.faces[i].getEdge().getOrigin().getId();
            var v1_idx = this.faces[i].getEdge().getNext().getOrigin().getId();
            var v2_idx = this.faces[i].getEdge().getPrev().getOrigin().getId();

            this.normals[v0_idx] = this.normals[v0_idx].add(n);
            this.normals[v1_idx] = this.normals[v1_idx].add(n);
            this.normals[v2_idx] = this.normals[v2_idx].add(n);
            count[v0_idx] += 1;
            count[v1_idx] += 2;
            count[v2_idx] += 3;
        }

        for (var i = 0; i < this.normals.length; i++) {
            this.normals[i] = this.normals[i].multiply(count[i]);
            this.normals[i] = this.normals[i].normalize();
        }
    }

    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }
    getFaces() { return this.faces; }
    getNormals() { return this.normals; }
}
/**
 * Modified from @author yusef sohail 
**/

function OBJLoader() {
	
	var self = this;

	/** ---------------------------------------------------------------------
     * Load OBJ file to mesh. IMPORTANT: webpage must be open by server
     * @param string    url  - The url of mesh file
	 * @param function  func - The function to be called after finishing construct mesh
     */
	self.load = function (url, func) {
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function () {
			if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
				func(self.parse(xmlhttp.responseText));
			}
		}

		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	};

	/** ---------------------------------------------------------------------
     * Parse .obj file
     * @param   string  str - The string to parse. IMPORTANT: str must be the contents of a .obj file
	 * @return  Mesh    The mesh constructed from .obj file
     */
	self.parse = function (str) {
		var lines = str.split("\n");

		var out = {
			vertices : [],
			normals : [],
			texCoords : [],
			faces : []
		};

		while(lines.length){
			lines = self.parseLine(lines, out);
		}

		return out;
	};

	/** ---------------------------------------------------------------------
     * Parse .obj file
     * @param   array<string>  lines - The string to parse. IMPORTANT: lines must be the contents of a .obj file
	 * @return  object         out - The object to be used to construct mesh
     */
	self.parseLine = function (lines, out) {
		var vertices = out.vertices,
			normals = out.normals,
			coords = out.texCoords,
			faces = out.faces;

		var i = 0;

		for(i = 0; i < lines.length; i++) {
			var tokens = lines[i].replace(/\s+/g, " ").split(" ")
			var t0 = tokens[0];
			switch(t0){
				case 'v':
					vertices.push([ parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]) ]);
					break;
				case 'vt':
					coords.push([ parseFloat(tokens[1]), parseFloat(tokens[2]) ]);
					break;
				case 'vn':
					normals.push([ parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]) ]);
					break;
				case 'f':
					var face =  [ tokens[1].split("/"),  tokens[2].split("/"), tokens[3].split("/") ]

					for(var n = 0; n < face.length; n++){
						var v = face[n];
						for(var m = 0; m < v.length; m++){
							var str = v[m];
							if(str.length){
								var value = parseInt(str);
								v[m] = (value >= 0)? value - 1 : vertices.length + value;
							}else{
								v[m] = null;
							}
						}

						for(var j = v.length; j < 3;j++){
							v[j] = null;
						}
					}
					faces.push(face);
					break;
			}
		}		

		return lines.splice(i+1);
	};
}
/**
 * A Vector3D class.
 */

function Vector3D (dx, dy, dz) {
    
    this.value = new Float32Array(3);

    if (arguments.length >= 1) this.value[0] = dx;
    if (arguments.length >= 2) this.value[1] = dy;
    if (arguments.length >= 3) this.value[2] = dz;

    this.x = function () { return this.value[0]; }
    this.y = function () { return this.value[1]; }
    this.z = function () { return this.value[2]; }

    /** ---------------------------------------------------------------------
     *  A new vector that has the same values as the input argument
     */
    this.createFrom = function (from) {
        this.value[0] = from.value[0];
        this.value[1] = from.value[1];
        this.value[2] = from.value[2];
    };

    /** ---------------------------------------------------------------------
     * Copy a vector into another vector
     * @param  Vector3D  to - A vector that you want changed
     */
    this.copy = function () {
        var new_vector = new Vector3D(this.value[0], this.value[1], this.value[2]);
        return new_vector;
    };

    /** ---------------------------------------------------------------------
     * Set the components of a vector
     * @param  Number  dx - The change in x of the vector
     * @param  Number  dy - The change in y of the vector
     * @param  Number  dz - The change in z of the vector
     */
    this.set = function (dx, dy, dz) {
        if (arguments.length >= 1) this.value[0] = dx;
        if (arguments.length >= 2) this.value[1] = dy;
        if (arguments.length >= 3) this.value[2] = dz;
    };

    /** ---------------------------------------------------------------------
     * Calculate the norm of a vector
     * @return Number The norm of a vector
     */
    this.norm = function () {
        return Math.sqrt(this.value[0] * this.value[0] + 
                         this.value[1] * this.value[1] +
                         this.value[2] * this.value[2]);
    };

    /** ---------------------------------------------------------------------
     * Make a vector have a length of 1
     * @return Vector3D The input vector normalized to unit length. Or null if the vector is zero length
     */
    this.normalize = function () {
        var length, percent;

        length = this.norm();
        if (Math.abs(length) < 0.0000001) {
            return null; // Invalid vector
        }

        percent = 1.0 / length;
        var new_x = this.value[0] * percent;
        var new_y = this.value[1] * percent;
        var new_z = this.value[2] * percent;
        
        var new_vector = new Vector3D(new_x, new_y, new_z);
        return new_vector;
    };

    /** ---------------------------------------------------------------------
     * Add two vectors:  result = v0 + v1
     * @param  Vector3D  v1 - A vector
     * @return Vector3D The result of adding v and v1
     */
    this.add = function (v1) {
        var new_x = this.value[0] + v1.value[0];
        var new_y = this.value[1] + v1.value[1];
        var new_z = this.value[2] + v1.value[2];

        var new_vector = new Vector3D(new_x, new_y, new_z);
        return new_vector;
    };

    /** ---------------------------------------------------------------------
     * Subtract two vectors:  result = v0 - v1
     * @param  Vector3D  v1 - A vector
     * @return Vector3D The result of subtracting v1 from v0
     */
    this.subtract = function (v1) {
        var new_x = this.value[0] - v1.value[0];
        var new_y = this.value[1] - v1.value[1];
        var new_z = this.value[2] - v1.value[2];
        
        var new_vector = new Vector3D(new_x, new_y, new_z);
        return new_vector;
    };

	/** ---------------------------------------------------------------------
     * Scale a vector:  result = s * v0
     * @param  Number  s - A scale factor
     * @return Vector3D The result
     */
    this.multiply = function (s) {
        var new_x = this.value[0] * s;
        var new_y = this.value[1] * s;
        var new_z = this.value[2] * s;

        var new_vector = new Vector3D(new_x, new_y, new_z);
        return new_vector;
    };
	
    /** ---------------------------------------------------------------------
     * Calculate the dot product of 2 vectors
     * @param  Vector3D  v1 - A vector
     * @return Number The dot product of v0 and v1
     */
    this.dot = function (v1) {
        var dot_product = this.value[0] * v1.value[0] + 
                          this.value[1] * v1.value[1] +
                          this.value[2] * v1.value[2] ;
        return dot_product;
    };

    /** ---------------------------------------------------------------------
     * Calculate the cross product of 2 vectors
     * @param  Vector3D  v1 - A vector
     * @return Number The dot product of v0 and v1
     */
    this.cross = function (v1) {
        var new_x = this.value[1] * v1.value[2] - this.value[2] * v1.value[1];
        var new_y = this.value[2] * v1.value[0] - this.value[0] * v1.value[2];
        var new_z = this.value[0] * v1.value[1] - this.value[1] * v1.value[0];

        var new_vector = new Vector3D(new_x, new_y, new_z);
        return new_vector;
    }


    /** ---------------------------------------------------------------------
     * Determine if 2 vectors are equal
     * @param  Vector3D  v1 - A vector
     * @return Boolean if 2 vectors are equal
     */
    this.equal = function (v1) {
        var is_equal = (this.value[0] == v1.value[0] && 
                        this.value[1] == v1.value[1] &&
                        this.value[2] == v1.value[2] );
        return is_equal;
    };
}
 
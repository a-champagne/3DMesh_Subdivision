var MatrixMath = {
    identity : function () {
        var m = new Float32Array(16);

        m[ 0] = 1;
        m[ 1] = 0;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = 1;
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = 0;
        m[ 9] = 0;
        m[10] = 1;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;

        return m;
    },

    perspective : function (fieldOfViewInRadians, aspect, near, far) {
        var m = new Float32Array(16);
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);

        var rangeInv = 1.0 / (near -far);
        
        m[ 0] = f / aspect;
        m[ 1] = 0;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = f;
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = 0;
        m[ 9] = 0;
        m[10] = (near + far) * rangeInv;
        m[11] = -1;
        m[12] = 0;
        m[13] = 0;
        m[14] = near * far * rangeInv * 2;
        m[15] = 0;

        return m;
    },

    lookAt : function (cameraPosition, target, up) {
        var m = new Float32Array(16);
        var zAxis = cameraPosition.subtract(target);
        zAxis = zAxis.normalize();
        var xAxis = up.cross(zAxis);
        xAxis = xAxis.normalize();
        var yAxis = zAxis.cross(xAxis);
        yAxis = yAxis.normalize();
    
        m[ 0] = xAxis.value[0];
        m[ 1] = xAxis.value[1];
        m[ 2] = xAxis.value[2];
        m[ 3] = 0;
        m[ 4] = yAxis.value[0];
        m[ 5] = yAxis.value[1];
        m[ 6] = yAxis.value[2];
        m[ 7] = 0;
        m[ 8] = zAxis.value[0];
        m[ 9] = zAxis.value[1];
        m[10] = zAxis.value[2];
        m[11] = 0;
        m[12] = cameraPosition.value[0];
        m[13] = cameraPosition.value[1];
        m[14] = cameraPosition.value[2];
        m[15] = 1;
    
        return m;
    },

    frustum : function (left, right, bottom, top, near, far) {
        var m = new Float32Array(16);
    
        var dx = right - left;
        var dy = top - bottom;
        var dz = far - near;
    
        m[ 0] = 2 * near / dx;
        m[ 1] = 0;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = 2 * near / dy;
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = (left + right) / dx;
        m[ 9] = (top + bottom) / dy;
        m[10] = -(far + near) / dz;
        m[11] = -1;
        m[12] = 0;
        m[13] = 0;
        m[14] = -2 * near * far / dz;
        m[15] = 0;
    
        return m;
    },

    orthographic : function (left, right, bottom, top, near, far) {
        var m = new Float32Array(16);
    
        m[ 0] = 2 / (right - left);
        m[ 1] = 0;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = 2 / (top - bottom);
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = 0;
        m[ 9] = 0;
        m[10] = 2 / (near - far);
        m[11] = 0;
        m[12] = (left + right) / (left - right);
        m[13] = (bottom + top) / (bottom - top);
        m[14] = (near + far) / (near - far);
        m[15] = 1;
    
        return m;
    },

    translation : function (tx, ty, tz) {
        var m = new Float32Array(16);
    
        m[ 0] = 1;
        m[ 1] = 0;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = 1;
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = 0;
        m[ 9] = 0;
        m[10] = 1;
        m[11] = 0;
        m[12] = tx;
        m[13] = ty;
        m[14] = tz;
        m[15] = 1;
    
        return m;
    },

    xRotation : function (angleInRadians) {
        var m = new Float32Array(16);
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
    
        m[ 0] = 1;
        m[ 1] = 0;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = c;
        m[ 6] = s;
        m[ 7] = 0;
        m[ 8] = 0;
        m[ 9] = -s;
        m[10] = c;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;
    
        return m;
    },

    yRotation : function (angleInRadians) {
        var m = new Float32Array(16);
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
    
        m[ 0] = c;
        m[ 1] = 0;
        m[ 2] = -s;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = 1;
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = s;
        m[ 9] = 0;
        m[10] = c;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;
    
        return m;
    },

    zRotation : function (angleInRadians) {
        var m = new Float32Array(16);
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
    
        m[ 0] = c;
        m[ 1] = s;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = -s;
        m[ 5] = c;
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = 0;
        m[ 9] = 0;
        m[10] = 1;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;
    
        return m;
    },

    axisRotation : function (axis, angleInRadians) {
        var m = new Float32Array(16);
    
        var x = axis.value[0];
        var y = axis.value[1];
        var z = axis.value[2];
        var n = Math.sqrt(x * x + y * y + z * z);
        x /= n;
        y /= n;
        z /= n;
        var xx = x * x;
        var yy = y * y;
        var zz = z * z;
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        var oneMinusCosine = 1 - c;
    
        m[ 0] = xx + (1 - xx) * c;
        m[ 1] = x * y * oneMinusCosine + z * s;
        m[ 2] = x * z * oneMinusCosine - y * s;
        m[ 3] = 0;
        m[ 4] = x * y * oneMinusCosine - z * s;
        m[ 5] = yy + (1 - yy) * c;
        m[ 6] = y * z * oneMinusCosine + x * s;
        m[ 7] = 0;
        m[ 8] = x * z * oneMinusCosine + y * s;
        m[ 9] = y * z * oneMinusCosine - x * s;
        m[10] = zz + (1 - zz) * c;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;
    
        return m;
    },

    scaling : function (sx, sy, sz) {
        var m = new Float32Array(16);
    
        m[ 0] = sx;
        m[ 1] = 0;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = sy;
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = 0;
        m[ 9] = 0;
        m[10] = sz;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;
    
        return m;
    },

    multiply: function (a, b) {
        var m = new Float32Array(16);
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        m[ 0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        m[ 1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        m[ 2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        m[ 3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        m[ 4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        m[ 5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        m[ 6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        m[ 7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        m[ 8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        m[ 9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        m[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        m[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        m[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        m[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        m[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        m[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
        
        return m;
    },

    copy: function (b) {
        var m = new Float32Array(16);
        m[ 0] = b[ 0];
        m[ 1] = b[ 1];
        m[ 2] = b[ 2];
        m[ 3] = b[ 3];
        m[ 4] = b[ 4];
        m[ 5] = b[ 5];
        m[ 6] = b[ 6];
        m[ 7] = b[ 7];
        m[ 8] = b[ 8];
        m[ 9] = b[ 9];
        m[10] = b[10];
        m[11] = b[11];
        m[12] = b[12];
        m[13] = b[13];
        m[14] = b[14];
        m[15] = b[15];
        return m;
    }
    
};
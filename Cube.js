class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
    }

    render(c){
        var rgba;
        if (c == null){
            rgba = this.color;
        } else {
            rgba = c;
        }
        //console.log("Texture number:", this.textureNum);
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        //front
        drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        
        //top
        drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0,0, 1,1, 1,0]);
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        
        // Back
        drawTriangle3DUV([0, 0, 1, 1, 0, 1, 1, 1, 1], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0, 0, 1, 1, 1, 1, 0, 1, 1], [1,0, 0,1, 1,1]);
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        // Bottom
        drawTriangle3DUV([0, 0, 0, 1, 0, 0, 1, 0, 1], [0,1, 1,1, 1,0]);
        drawTriangle3DUV([0, 0, 0, 1, 0, 1, 0, 0, 1], [0,1, 1,0, 0,0]);
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

        // Left
        drawTriangle3DUV([0, 0, 0, 0, 1, 1, 0, 1, 0], [1,0, 0,1, 0,0]); 
        drawTriangle3DUV([0, 0, 0, 0, 0, 1, 0, 1, 1], [1,0, 1,1, 0,1]);
        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        // Right
        drawTriangle3DUV([1, 0, 0, 1, 1, 0, 1, 1, 1], [0, 1, 1, 1, 1, 0]);
        drawTriangle3DUV([1, 0, 0, 1, 1, 1, 1, 0, 1], [0, 1, 1, 0, 0, 0]);
        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.50, rgba[3]);

    }

    renderFast(c){
        var rgba;
        if (c == null){
            rgba = this.color;
        } else {
            rgba = c;
        }
        //console.log("Texture number:", this.textureNum);
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var verts = new Float32Array([
            // Front face
            0,0,0, 0,1,0, 1,1,0,
            0,0,0, 1,1,0, 1,0,0,
            
            // Top face
            0,1,0, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,

            // Back face
            0,0,1, 1,0,1, 1,1,1,
            0,0,1, 1,1,1, 0,1,1,

            // Bottom face
            0,0,0, 1,0,0, 1,0,1,
            0,0,0, 1,0,1, 0,0,1,

            // Left face
            0,0,0, 0,1,1, 0,1,0,
            0,0,0, 0,0,1, 0,1,1,

            // Right face
            1,0,0, 1,1,0, 1,1,1,
            1,0,0, 1,1,1, 1,0,1
        ]);

        var uvs = new Float32Array([
            // Front face (repeated texture)
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,

            // Top face
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,

            // Back face
            1,0, 0,0, 0,1,
            1,0, 0,1, 1,1,

            // Bottom face
            0,1, 1,1, 1,0,
            0,1, 1,0, 0,0,

            // Left face
            1,0, 0,1, 0,0,
            1,0, 1,1, 0,1,

            // Right face
            0,1, 1,1, 1,0,
            0,1, 1,0, 0,0
        ]);

        drawTriangle3DUV(verts, uvs);
    }
}
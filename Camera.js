class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([3, 0, 3]);       // Initial position
        this.at = new Vector3([0, 0, -100]);      // Looking along the negative Z-axis
        this.up = new Vector3([0, 1, 0]);         // Up vector
        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();
        this.updateViewMatrix();
        this.updateProjectionMatrix(canvas.width / canvas.height);
    }

    updateViewMatrix() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    updateProjectionMatrix(aspect) {
        this.projectionMatrix.setPerspective(this.fov, aspect, 0.1, 1000);
    }

    isColliding(x, z) {
        const mapX = Math.floor(x + MAP_CENTER);
        const mapZ = Math.floor(z + MAP_CENTER);

        if (mapX < 0 || mapX >= 32 || mapZ < 0 || mapZ >= 32) {
            return true; // Out of bounds is considered a collision
        }

        return g_map[mapX][mapZ] > 0;
    }

    moveForward(speed) {
        let f = new Vector3(this.at.elements).sub(this.eye);
        f.normalize();
        f.mul(speed);

        const newX = this.eye.elements[0] + f.elements[0];
        const newZ = this.eye.elements[2] + f.elements[2];

        if (!this.isColliding(newX, newZ)) {
            this.eye.add(f);
            this.at.add(f);
            this.updateViewMatrix();
        }
    }

    moveBackwards(speed) {
        let b = new Vector3(this.eye.elements).sub(this.at);
        b.normalize();
        b.mul(speed);

        const newX = this.eye.elements[0] + b.elements[0];
        const newZ = this.eye.elements[2] + b.elements[2];

        if (!this.isColliding(newX, newZ)) {
            this.eye.add(b);
            this.at.add(b);
            this.updateViewMatrix();
        }
    }

    moveLeft(speed) {
        let f = new Vector3(this.at.elements).sub(this.eye);
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(speed);

        const newX = this.eye.elements[0] + s.elements[0];
        const newZ = this.eye.elements[2] + s.elements[2];

        if (!this.isColliding(newX, newZ)) {
            this.eye.add(s);
            this.at.add(s);
            this.updateViewMatrix();
        }
    }

    moveRight(speed) {
        let f = new Vector3(this.at.elements).sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);

        const newX = this.eye.elements[0] + s.elements[0];
        const newZ = this.eye.elements[2] + s.elements[2];

        if (!this.isColliding(newX, newZ)) {
            this.eye.add(s);
            this.at.add(s);
            this.updateViewMatrix();
        }
    }

    panLeft(alpha) {
        let f = new Vector3(this.at.elements).sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at = new Vector3(this.eye.elements).add(f_prime);
        this.updateViewMatrix();
    }

    panRight(alpha) {
        this.panLeft(-alpha);
    }
}
export class Vector2 {
    x: number;
    y: number;

    static zero = () => new Vector2(0, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    add(v: Vector2): Vector2 {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    addScalar(s: number): Vector2 {
        this.x += s;
        this.y += s;
        return this;
    }

    static add(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    sub(v: Vector2): Vector2 {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    subScalar(s: number): Vector2 {
        this.x -= s;
        this.y -= s;
        return this;
    }

    static sub(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    mul(v: Vector2): Vector2 {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    mulScalar(s: number): Vector2 {
        this.x *= s;
        this.y *= s;
        return this;
    }

    static mul(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x * v2.x, v1.y * v2.y);
    }

    div(v: Vector2): Vector2 {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    }

    divScalar(s: number): Vector2 {
        this.x /= s;
        this.y /= s;
        return this;
    }

    static div(v1: Vector2, v2: Vector2) {
        return new Vector2(v1.x / v2.x, v1.y / v2.y);
    }
}

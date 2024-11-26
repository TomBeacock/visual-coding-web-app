import { Vector2 } from "./vector2";

export function transformPoint(point: Vector2, origin: Vector2, scale: number) {
    return point.clone().divScalar(scale).sub(origin.clone().divScalar(scale));
}
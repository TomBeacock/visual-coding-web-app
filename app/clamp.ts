export function clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num;
}

export const clamp01 = (num: number) => clamp(num, 0, 1);
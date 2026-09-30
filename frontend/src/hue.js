// Gives every category its own colour
export const hue = (s = '') => [...s].reduce((a, c) => a + c.charCodeAt(0) * 7, 0) % 360;

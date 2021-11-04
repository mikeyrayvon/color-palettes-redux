export function hexToRGB (hex: string): number[] | boolean {
  var aRgbHex = hex.match(/.{1,2}/g);
  if (aRgbHex) {
    var aRgb = [
      parseInt(aRgbHex[0], 16),
      parseInt(aRgbHex[1], 16),
      parseInt(aRgbHex[2], 16)
    ];
    return aRgb
  }
  return false
}

export function uniqueId(): number {
  const min = 1000000000000000000;
  const max = 9223372036854775808;
  return Math.floor(Math.random() * (max - min) + min);
}
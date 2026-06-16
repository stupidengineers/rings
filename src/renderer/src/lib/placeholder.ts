export function placeholderImage(
  width: number = 400,
  height: number = 400,
  seed: string = "placeholder",
): string {
  const hue = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="hsl(${hue}, 30%, 85%)"/><rect width="${width}" height="${height}" fill="hsl(${hue}, 20%, 75%)" opacity="0.3"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

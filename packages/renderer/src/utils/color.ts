export function parsePalette(contents: string) {
  const colors = contents.trimEnd().split(/,/);
  return colors.filter(c => c);
}

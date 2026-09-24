export function createCharacters(rows, columns, start, torchCells, playerGlyph, torchGlyph) {
  const characters = Array.from({ length: rows }, () => new Array(columns).fill(null));
  for (const torch of torchCells) characters[torch.y][torch.x] = torchGlyph;
  characters[start.y][start.x] = playerGlyph;
  return characters;
}

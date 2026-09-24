export function createWalkabilityPass(terrainKinds, rows, columns) {
  const walkability = new Array(rows);
  for (let y = 0; y < rows; y += 1) {
    const row = new Array(columns);
    for (let x = 0; x < columns; x += 1) {
      const isBorder = x === 0 || y === 0 || x === columns - 1 || y === rows - 1;
      row[x] = !isBorder && (terrainKinds[y][x] === "ground" || terrainKinds[y][x] === "shallowWater");
    }
    walkability[y] = row;
  }
  return walkability;
}

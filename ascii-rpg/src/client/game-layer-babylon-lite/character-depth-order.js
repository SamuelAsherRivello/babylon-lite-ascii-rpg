function presentationId(record) {
  if (record.type === "player") return "player";
  return `${record.type}:${record.id}`;
}

function compareRecords(left, right) {
  const yDifference = left.cell.y - right.cell.y;
  if (yDifference !== 0) return yDifference;
  return left.id.localeCompare(right.id);
}

// This returns a retained presentation order only. It deliberately does not
// modify actor records, occupancy, or world state.
export function getCharacterDepthOrder(records = []) {
  return Object.freeze(records
    .filter((record) => record?.cell && Number.isInteger(record.cell.y))
    .map((record) => Object.freeze({ id: presentationId(record), cell: record.cell }))
    .sort(compareRecords)
    .map((record, index) => Object.freeze({ ...record, zIndex: index + 1 })));
}

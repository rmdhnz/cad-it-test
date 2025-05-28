export default function avgOfEquipmentMap(map) {
  const allAvgs = Object.values(map).map(
    (values) => values.reduce((a, b) => a + b, 0) / values.length
  );
  return allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length;
}

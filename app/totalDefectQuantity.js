export default function totalDefectQuantity(collections) {
  let defect_quantity = 0;
  collections.forEach((collection) => {
    defect_quantity += collection.defect_quantity;
  });
  return defect_quantity;
}

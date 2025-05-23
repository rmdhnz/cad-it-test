export default function totalPlannedQuantity(collections) {
  let planned_quantity = 0;
  collections.forEach((collection) => {
    planned_quantity += collection.planned_quantity;
  });
  return planned_quantity;
}

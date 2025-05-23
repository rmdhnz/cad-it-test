export default function totalActualQuantity(collections) {
  let actual_quantity = 0;
  collections.forEach((collection) => {
    actual_quantity += collection.actual_quantity;
  });
  return actual_quantity;
}

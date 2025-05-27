export default function createEmptyAllocation(collections_name) {
  const allocation = {};
  collections_name.forEach((collection_name) => {
    allocation[collection_name.name] = {
      quota: collection_name.quota,
      teams: [],
      used: 0,
      remaining_quota: collection_name.quota,
    };
  });
  return allocation;
}

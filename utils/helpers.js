// Helper function to get the cache key
export const getCacheKey = (modelName, id = "", query = {}) => {
	const baseKey = `cache:${modelName}`;
	if (id) return `${baseKey}:${id}`;
	return `${baseKey}:query:${JSON.stringify(query)}`;
};

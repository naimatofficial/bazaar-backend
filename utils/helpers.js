import rateLimit from 'express-rate-limit'

// Helper function to get the cache key
export const getCacheKey = (modelName, id = '', query = {}) => {
    const baseKey = `cache:${modelName}`
    if (id) return `${baseKey}:${id}`
    return `${baseKey}:query:${JSON.stringify(query)}`
}

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // limit each IP to 5 requests per windowMs for login route
    message: 'Too many login attempts from this IP, please try again later.',
})

// // redisClient.js
// import redis from 'redis';

// // Create a Redis client
// const client = redis.createClient({
//     url: 'redis://localhost:6379', // Replace with your Redis server URL if different
// });

// client.on('error', (err) => {
//     console.error('Redis error:', err);
// });

// await client.connect(); // Ensure the client is connected before using it

// export default client;



import redis from 'redis';

const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

const connectToRedis = async () => {
    try {
        await client.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};

connectToRedis();

export default client;

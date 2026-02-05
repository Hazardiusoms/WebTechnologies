const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection URI from environment variable
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/focusflow';
let client = null;
let db = null;

// Extract database name from URI or use default
function getDatabaseName(uri) {
  // If URI contains database name (after last /), extract it
  const match = uri.match(/\/([^/?]+)(\?|$)/);
  if (match) {
    return match[1];
  }
  return 'focusflow'; // default database name
}

// Connect to MongoDB
async function connectDatabase() {
  if (client && db) {
    return { client, db };
  }

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const dbName = getDatabaseName(MONGO_URI);
    db = client.db(dbName);
    
    // Create collection if it doesn't exist and ensure indexes
    const habitsCollection = db.collection('habits');
    try {
      await habitsCollection.createIndex({ id: 1 }, { unique: true });
    } catch (indexError) {
      // Index might already exist, ignore
      if (!indexError.message.includes('already exists')) {
        console.warn('Index creation warning:', indexError.message);
      }
    }
    
    console.log(`Connected to MongoDB successfully (database: ${dbName})`);
    return { client, db };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Initialize database connection
connectDatabase().catch(console.error);

// CRUD operations for habits
const habitsDb = {
  // Get all habits (sorted by id ASC)
  async getAll() {
    try {
      const { db } = await connectDatabase();
      const habits = await db.collection('habits').find({}).sort({ id: 1 }).toArray();
      return habits;
    } catch (error) {
      throw error;
    }
  },

  // Get a habit by id
  async getById(id) {
    try {
      const { db } = await connectDatabase();
      const habit = await db.collection('habits').findOne({ id: parseInt(id) });
      return habit;
    } catch (error) {
      throw error;
    }
  },

  // Create a new habit
  async create(title, description) {
    try {
      const { db } = await connectDatabase();
      const collection = db.collection('habits');
      
      // Get the highest id to generate the next one
      const lastHabit = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
      const nextId = lastHabit.length > 0 ? lastHabit[0].id + 1 : 1;
      
      const newHabit = {
        id: nextId,
        title: title.trim(),
        description: description.trim(),
        created_at: new Date().toISOString()
      };
      
      await collection.insertOne(newHabit);
      return newHabit;
    } catch (error) {
      throw error;
    }
  },

  // Update a habit by id
  async update(id, title, description) {
    try {
      const { db } = await connectDatabase();
      const result = await db.collection('habits').updateOne(
        { id: parseInt(id) },
        { 
          $set: { 
            title: title.trim(), 
            description: description.trim() 
          } 
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  },

  // Delete a habit by id
  async delete(id) {
    try {
      const { db } = await connectDatabase();
      const result = await db.collection('habits').deleteOne({ id: parseInt(id) });
      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }
};

// Close database connection gracefully
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
});

module.exports = { habitsDb };

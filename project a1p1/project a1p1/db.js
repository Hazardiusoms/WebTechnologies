const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URL (default to localhost)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'focusflow';
const COLLECTION_NAME = 'habits';

let client = null;
let db = null;
let collection = null;

// Connect to MongoDB
async function connectDatabase() {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      console.log('Connected to MongoDB successfully');
      
      db = client.db(DB_NAME);
      // Collection will be created automatically on first insert
      collection = db.collection(COLLECTION_NAME);
    }
    return { db, collection };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Initialize database connection (non-blocking)
connectDatabase().catch((error) => {
  console.error('Failed to initialize database connection:', error);
  console.error('Make sure MongoDB is running and accessible.');
});

// CRUD operations
const habitsDb = {
  // Get all habits (with optional filtering, sorting, and projection)
  async getAll(filter = {}, sort = { _id: 1 }, projection = {}) {
    try {
      const { collection } = await connectDatabase();
      const cursor = collection.find(filter).sort(sort);
      
      // Apply projection if provided
      if (Object.keys(projection).length > 0) {
        cursor.project(projection);
      }
      
      const habits = await cursor.toArray();
      // Convert _id to string for consistency
      return habits.map(habit => ({
        ...habit,
        id: habit._id.toString(),
        _id: habit._id.toString()
      }));
    } catch (error) {
      throw error;
    }
  },

  // Get habit by id
  async getById(id) {
    try {
      // Validate ObjectId format
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const { collection } = await connectDatabase();
      const habit = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!habit) {
        return null;
      }

      // Convert _id to string
      return {
        ...habit,
        id: habit._id.toString(),
        _id: habit._id.toString()
      };
    } catch (error) {
      throw error;
    }
  },

  // Create a new habit
  async create(title, description) {
    try {
      const { collection } = await connectDatabase();
      const newHabit = {
        title: title.trim(),
        description: description.trim(),
        created_at: new Date()
      };
      
      const result = await collection.insertOne(newHabit);
      
      return {
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
        title: newHabit.title,
        description: newHabit.description,
        created_at: newHabit.created_at
      };
    } catch (error) {
      throw error;
    }
  },

  // Update habit by id
  async update(id, title, description) {
    try {
      // Validate ObjectId format
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const { collection } = await connectDatabase();
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            title: title.trim(),
            description: description.trim(),
            updated_at: new Date()
          }
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  },

  // Delete habit by id
  async delete(id) {
    try {
      // Validate ObjectId format
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const { collection } = await connectDatabase();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  },

  // Close database connection (useful for graceful shutdown)
  async close() {
    try {
      if (client) {
        await client.close();
        client = null;
        db = null;
        collection = null;
        console.log('MongoDB connection closed');
      }
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
};

module.exports = { habitsDb, ObjectId };

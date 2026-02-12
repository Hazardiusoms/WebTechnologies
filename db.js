const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
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
    
    // Create collections if they don't exist and ensure indexes
    const habitsCollection = db.collection('habits');
    const usersCollection = db.collection('users');
    try {
      await habitsCollection.createIndex({ id: 1 }, { unique: true });
      await usersCollection.createIndex({ username: 1 }, { unique: true });
      await usersCollection.createIndex({ email: 1 }, { unique: true });
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

  // Create a new habit with expanded fields
  async create(habitData) {
    try {
      const { db } = await connectDatabase();
      const collection = db.collection('habits');
      
      // Get the highest id to generate the next one
      const lastHabit = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
      const nextId = lastHabit.length > 0 ? lastHabit[0].id + 1 : 1;
      
      const newHabit = {
        id: nextId,
        title: habitData.title.trim(),
        description: habitData.description.trim(),
        category: habitData.category || 'General',
        frequency: habitData.frequency || 'Daily',
        priority: habitData.priority || 'Medium',
        status: habitData.status || 'Active',
        target_date: habitData.target_date || null,
        streak: habitData.streak || 0,
        notes: habitData.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await collection.insertOne(newHabit);
      return newHabit;
    } catch (error) {
      throw error;
    }
  },

  // Update a habit by id with expanded fields
  async update(id, habitData) {
    try {
      const { db } = await connectDatabase();
      const updateFields = {
        title: habitData.title.trim(),
        description: habitData.description.trim(),
        updated_at: new Date().toISOString()
      };
      
      // Add optional fields if provided
      if (habitData.category !== undefined) updateFields.category = habitData.category;
      if (habitData.frequency !== undefined) updateFields.frequency = habitData.frequency;
      if (habitData.priority !== undefined) updateFields.priority = habitData.priority;
      if (habitData.status !== undefined) updateFields.status = habitData.status;
      if (habitData.target_date !== undefined) updateFields.target_date = habitData.target_date;
      if (habitData.streak !== undefined) updateFields.streak = parseInt(habitData.streak) || 0;
      if (habitData.notes !== undefined) updateFields.notes = habitData.notes.trim();
      
      const result = await db.collection('habits').updateOne(
        { id: parseInt(id) },
        { $set: updateFields }
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

// User management operations
const usersDb = {
  // Create a new user with hashed password
  async create(username, email, password) {
    try {
      const { db } = await connectDatabase();
      const collection = db.collection('users');
      
      // Check if user already exists
      const existingUser = await collection.findOne({
        $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }]
      });
      
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Hash password with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const newUser = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        created_at: new Date().toISOString()
      };
      
      await collection.insertOne(newUser);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  // Find user by username
  async findByUsername(username) {
    try {
      const { db } = await connectDatabase();
      const user = await db.collection('users').findOne({ username: username.trim() });
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Find user by email
  async findByEmail(email) {
    try {
      const { db } = await connectDatabase();
      const user = await db.collection('users').findOne({ email: email.trim().toLowerCase() });
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Verify password
  async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = { habitsDb, usersDb };

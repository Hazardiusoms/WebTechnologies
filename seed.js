require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/focusflow';

// Extract database name from URI
function getDatabaseName(uri) {
  const match = uri.match(/\/([^/?]+)(\?|$)/);
  if (match) {
    return match[1];
  }
  return 'focusflow';
}

// Sample habits data with realistic domain data
const sampleHabits = [
  {
    id: 1,
    title: 'Morning Meditation',
    description: '10 minutes of mindfulness meditation every morning before breakfast',
    category: 'Mindfulness',
    frequency: 'Daily',
    priority: 'High',
    status: 'Active',
    target_date: '2024-12-31',
    streak: 15,
    notes: 'Using Headspace app for guided sessions',
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString()
  },
  {
    id: 2,
    title: 'Daily Exercise',
    description: '30 minutes of cardio or strength training',
    category: 'Fitness',
    frequency: 'Daily',
    priority: 'High',
    status: 'Active',
    target_date: null,
    streak: 28,
    notes: 'Alternating between running and gym workouts',
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-28').toISOString()
  },
  {
    id: 3,
    title: 'Read for 30 Minutes',
    description: 'Read books or articles for personal development',
    category: 'Learning',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: '2024-06-30',
    streak: 12,
    notes: 'Currently reading "Atomic Habits"',
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-01-31').toISOString()
  },
  {
    id: 4,
    title: 'Drink 8 Glasses of Water',
    description: 'Stay hydrated throughout the day',
    category: 'Health',
    frequency: 'Daily',
    priority: 'High',
    status: 'Active',
    target_date: null,
    streak: 45,
    notes: 'Using water tracking app',
    created_at: new Date('2023-12-15').toISOString(),
    updated_at: new Date('2024-01-31').toISOString()
  },
  {
    id: 5,
    title: 'Practice Spanish',
    description: '30 minutes of Spanish language practice using Duolingo',
    category: 'Learning',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: '2024-12-31',
    streak: 60,
    notes: 'Goal: Conversational level by end of year',
    created_at: new Date('2023-12-01').toISOString(),
    updated_at: new Date('2024-01-31').toISOString()
  },
  {
    id: 6,
    title: 'Evening Journaling',
    description: 'Write in journal before bed to reflect on the day',
    category: 'Mindfulness',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: null,
    streak: 8,
    notes: 'Focusing on gratitude and daily wins',
    created_at: new Date('2024-01-23').toISOString(),
    updated_at: new Date('2024-01-30').toISOString()
  },
  {
    id: 7,
    title: 'Weekly Meal Prep',
    description: 'Prepare healthy meals for the week on Sundays',
    category: 'Health',
    frequency: 'Weekly',
    priority: 'High',
    status: 'Active',
    target_date: null,
    streak: 4,
    notes: 'Saves time and ensures healthy eating',
    created_at: new Date('2024-01-07').toISOString(),
    updated_at: new Date('2024-01-28').toISOString()
  },
  {
    id: 8,
    title: 'No Social Media Before Noon',
    description: 'Avoid checking social media until after lunch',
    category: 'Productivity',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: null,
    streak: 20,
    notes: 'Helps maintain focus in the morning',
    created_at: new Date('2024-01-11').toISOString(),
    updated_at: new Date('2024-01-30').toISOString()
  },
  {
    id: 9,
    title: 'Call Family Members',
    description: 'Weekly phone call with parents and siblings',
    category: 'Social',
    frequency: 'Weekly',
    priority: 'High',
    status: 'Active',
    target_date: null,
    streak: 8,
    notes: 'Scheduled for Sunday evenings',
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date('2024-01-28').toISOString()
  },
  {
    id: 10,
    title: 'Learn New Programming Skill',
    description: 'Spend 1 hour learning new technologies or frameworks',
    category: 'Learning',
    frequency: 'Daily',
    priority: 'High',
    status: 'Active',
    target_date: '2024-06-30',
    streak: 35,
    notes: 'Currently learning React and Node.js',
    created_at: new Date('2023-12-27').toISOString(),
    updated_at: new Date('2024-01-31').toISOString()
  },
  {
    id: 11,
    title: 'Take Vitamins',
    description: 'Daily multivitamin and vitamin D supplement',
    category: 'Health',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: null,
    streak: 90,
    notes: 'Set reminder for after breakfast',
    created_at: new Date('2023-11-01').toISOString(),
    updated_at: new Date('2024-01-31').toISOString()
  },
  {
    id: 12,
    title: 'Stretch Before Bed',
    description: '10 minutes of stretching to improve flexibility',
    category: 'Fitness',
    frequency: 'Daily',
    priority: 'Low',
    status: 'Active',
    target_date: null,
    streak: 5,
    notes: 'Helps with sleep quality',
    created_at: new Date('2024-01-26').toISOString(),
    updated_at: new Date('2024-01-30').toISOString()
  },
  {
    id: 13,
    title: 'Weekly Budget Review',
    description: 'Review and update personal budget every Sunday',
    category: 'Productivity',
    frequency: 'Weekly',
    priority: 'Medium',
    status: 'Active',
    target_date: null,
    streak: 6,
    notes: 'Using YNAB app for tracking',
    created_at: new Date('2024-01-07').toISOString(),
    updated_at: new Date('2024-01-28').toISOString()
  },
  {
    id: 14,
    title: 'Practice Guitar',
    description: '30 minutes of guitar practice',
    category: 'Learning',
    frequency: 'Daily',
    priority: 'Low',
    status: 'Paused',
    target_date: '2024-12-31',
    streak: 0,
    notes: 'Paused due to busy schedule, will resume next month',
    created_at: new Date('2024-01-10').toISOString(),
    updated_at: new Date('2024-01-25').toISOString()
  },
  {
    id: 15,
    title: 'Early Morning Walk',
    description: '20-minute walk before starting work',
    category: 'Fitness',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: null,
    streak: 18,
    notes: 'Great way to start the day with fresh air',
    created_at: new Date('2024-01-13').toISOString(),
    updated_at: new Date('2024-01-30').toISOString()
  },
  {
    id: 16,
    title: 'Limit Coffee to 2 Cups',
    description: 'Maximum 2 cups of coffee per day',
    category: 'Health',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: null,
    streak: 22,
    notes: 'Helps with better sleep',
    created_at: new Date('2024-01-09').toISOString(),
    updated_at: new Date('2024-01-30').toISOString()
  },
  {
    id: 17,
    title: 'Weekly Networking',
    description: 'Attend one networking event or meetup per month',
    category: 'Social',
    frequency: 'Monthly',
    priority: 'Low',
    status: 'Active',
    target_date: null,
    streak: 2,
    notes: 'Tech meetups and professional events',
    created_at: new Date('2023-12-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString()
  },
  {
    id: 18,
    title: 'Complete Daily To-Do List',
    description: 'Finish all tasks on daily to-do list',
    category: 'Productivity',
    frequency: 'Daily',
    priority: 'High',
    status: 'Active',
    target_date: null,
    streak: 25,
    notes: 'Using Todoist app for task management',
    created_at: new Date('2024-01-06').toISOString(),
    updated_at: new Date('2024-01-30').toISOString()
  },
  {
    id: 19,
    title: 'Practice Gratitude',
    description: 'Write down 3 things I am grateful for',
    category: 'Mindfulness',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: null,
    streak: 40,
    notes: 'Part of evening routine',
    created_at: new Date('2023-12-22').toISOString(),
    updated_at: new Date('2024-01-31').toISOString()
  },
  {
    id: 20,
    title: 'No Phone in Bedroom',
    description: 'Leave phone outside bedroom at night',
    category: 'Health',
    frequency: 'Daily',
    priority: 'High',
    status: 'Active',
    target_date: null,
    streak: 30,
    notes: 'Improves sleep quality significantly',
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-30').toISOString()
  },
  {
    id: 21,
    title: 'Weekly Deep Clean',
    description: 'Deep clean one room of the house each week',
    category: 'Productivity',
    frequency: 'Weekly',
    priority: 'Low',
    status: 'Active',
    target_date: null,
    streak: 4,
    notes: 'Rotating through different rooms',
    created_at: new Date('2024-01-07').toISOString(),
    updated_at: new Date('2024-01-28').toISOString()
  },
  {
    id: 22,
    title: 'Practice Coding Challenges',
    description: 'Solve one coding problem on LeetCode daily',
    category: 'Learning',
    frequency: 'Daily',
    priority: 'High',
    status: 'Active',
    target_date: '2024-06-30',
    streak: 50,
    notes: 'Preparing for technical interviews',
    created_at: new Date('2023-12-12').toISOString(),
    updated_at: new Date('2024-01-31').toISOString()
  },
  {
    id: 23,
    title: 'Cook New Recipe',
    description: 'Try cooking a new recipe every two weeks',
    category: 'Learning',
    frequency: 'Bi-weekly',
    priority: 'Low',
    status: 'Active',
    target_date: null,
    streak: 2,
    notes: 'Expanding culinary skills',
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-29').toISOString()
  },
  {
    id: 24,
    title: 'Morning Affirmations',
    description: 'Recite positive affirmations while getting ready',
    category: 'Mindfulness',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: null,
    streak: 14,
    notes: 'Boosts confidence and mindset',
    created_at: new Date('2024-01-17').toISOString(),
    updated_at: new Date('2024-01-30').toISOString()
  },
  {
    id: 25,
    title: 'Track Expenses',
    description: 'Log all daily expenses in expense tracker app',
    category: 'Productivity',
    frequency: 'Daily',
    priority: 'Medium',
    status: 'Active',
    target_date: null,
    streak: 60,
    notes: 'Helps with financial awareness',
    created_at: new Date('2023-12-02').toISOString(),
    updated_at: new Date('2024-01-31').toISOString()
  }
];

async function seedDatabase() {
  let client = null;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    const dbName = getDatabaseName(MONGO_URI);
    const db = client.db(dbName);
    
    const habitsCollection = db.collection('habits');
    const usersCollection = db.collection('users');
    
    // Clear existing habits (optional - comment out if you want to keep existing data)
    console.log('Clearing existing habits...');
    await habitsCollection.deleteMany({});
    
    // Insert sample habits
    console.log('Inserting sample habits...');
    await habitsCollection.insertMany(sampleHabits);
    console.log(`✓ Inserted ${sampleHabits.length} habits`);
    
    // Create a test user (optional)
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      created_at: new Date().toISOString()
    };
    
    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ username: 'testuser' });
    if (!existingUser) {
      await usersCollection.insertOne(testUser);
      console.log('✓ Created test user:');
      console.log('  Username: testuser');
      console.log('  Password: password123');
    } else {
      console.log('✓ Test user already exists');
    }
    
    console.log('\n✓ Database seeding completed successfully!');
    console.log(`✓ Total habits in database: ${await habitsCollection.countDocuments()}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('Database connection closed');
    }
  }
}

// Run the seed function
seedDatabase();

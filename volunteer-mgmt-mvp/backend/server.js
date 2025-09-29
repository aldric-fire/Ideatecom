const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data storage (will be replaced with PostgreSQL in production)
let volunteers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'cycling-buddy',
    passionIndex: 75,
    commitmentPreferences: 'Weekends, mornings',
    skills: ['Biking', 'Communication'],
    assignedActivityId: null,
    hoursContributed: 24,
    consistency: 0.85,
    satisfaction: 4.2
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'mechanic',
    passionIndex: 8,
    commitmentPreferences: 'Weekdays, afternoons',
    skills: ['Bike repair', 'Maintenance'],
    assignedActivityId: null,
    hoursContributed: 42,
    consistency: 0.92,
    satisfaction: 4.7
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'logistics-support',
    passionIndex: 65,
    commitmentPreferences: 'Weekends, all day',
    skills: ['Event coordination', 'Setup'],
    assignedActivityId: null,
    hoursContributed: 18,
    consistency: 0.78,
    satisfaction: 3.9
  }
];

let activities = [
  {
    id: '101',
    name: 'Sunday Community Ride',
    date: '2025-06-01',
    roleNeeded: 'cycling-buddy',
    requiredVolunteers: 5,
    assignedVolunteerIds: [],
    description: 'Guided ride through the park for seniors'
  },
  {
    id: '102',
    name: 'Bike Maintenance Workshop',
    date: '2025-06-05',
    roleNeeded: 'mechanic',
    requiredVolunteers: 3,
    assignedVolunteerIds: [],
    description: 'Teaching basic bike maintenance skills'
  },
  {
    id: '103',
    name: 'Summer Festival Support',
    date: '2025-06-10',
    roleNeeded: 'logistics-support',
    requiredVolunteers: 8,
    assignedVolunteerIds: [],
    description: 'Helping with setup and coordination for the summer festival'
  }
];

let appraisals = [
  {
    id: '201',
    volunteerId: '1',
    activityId: '101',
    passionIndexEffect: 5,
    comment: 'Great team spirit, very supportive of seniors',
    timestamp: '2025-05-25T10:30:00Z'
  }
];

// Helper function to calculate passion index
const calculatePassionIndex = (volunteer) => {
 // Base score is 50
  let score = 50;
  
  // Add points based on hours contributed (1 point per 2 hours, capped at 20)
  score += Math.min(volunteer.hoursContributed / 2, 20);
  
  // Add points based on consistency (20 points * consistency rate)
 score += volunteer.consistency * 20;
  
  // Add points based on satisfaction (10 points * satisfaction / 5)
  score += (volunteer.satisfaction / 5) * 10;
  
  // Add appraisal points
  const volunteerAppraisals = appraisals.filter(a => a.volunteerId === volunteer.id);
  const appraisalPoints = volunteerAppraisals.reduce((sum, appraisal) => sum + appraisal.passionIndexEffect, 0);
  score += appraisalPoints;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
};

// API Routes

// Get all volunteers
app.get('/api/volunteers', (req, res) => {
  // Calculate and update passion index for each volunteer
  const updatedVolunteers = volunteers.map(volunteer => {
    const updatedVolunteer = { ...volunteer };
    updatedVolunteer.passionIndex = calculatePassionIndex(updatedVolunteer);
    return updatedVolunteer;
  });
  
  res.json(updatedVolunteers);
});

// Get volunteer by ID
app.get('/api/volunteers/:id', (req, res) => {
  const volunteer = volunteers.find(v => v.id === req.params.id);
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
 const updatedVolunteer = { ...volunteer };
  updatedVolunteer.passionIndex = calculatePassionIndex(updatedVolunteer);
  res.json(updatedVolunteer);
});

// Create new volunteer
app.post('/api/volunteers', (req, res) => {
  const { name, email, role, commitmentPreferences, skills } = req.body;
  
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }
  
 // Check if email already exists
  if (volunteers.some(v => v.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
 }
  
  const newVolunteer = {
    id: Math.random().toString(36).substr(2, 9), // Simple ID generation
    name,
    email,
    role,
    commitmentPreferences: commitmentPreferences || '',
    skills: skills || [],
    passionIndex: 50, // Start with base passion index
    assignedActivityId: null,
    hoursContributed: 0,
    consistency: 0.0,
    satisfaction: 0.0
  };
  
  volunteers.push(newVolunteer);
  res.status(201).json(newVolunteer);
});

// Update volunteer
app.put('/api/volunteers/:id', (req, res) => {
  const volunteerIndex = volunteers.findIndex(v => v.id === req.params.id);
  if (volunteerIndex === -1) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  const { name, email, role, commitmentPreferences, skills } = req.body;
  const updatedVolunteer = {
    ...volunteers[volunteerIndex],
    name: name || volunteers[volunteerIndex].name,
    email: email || volunteers[volunteerIndex].email,
    role: role || volunteers[volunteerIndex].role,
    commitmentPreferences: commitmentPreferences || volunteers[volunteerIndex].commitmentPreferences,
    skills: skills || volunteers[volunteerIndex].skills
  };
  
  volunteers[volunteerIndex] = updatedVolunteer;
  res.json(updatedVolunteer);
});

// Get all activities
app.get('/api/activities', (req, res) => {
  res.json(activities);
});

// Get activity by ID
app.get('/api/activities/:id', (req, res) => {
 const activity = activities.find(a => a.id === req.params.id);
  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
 }
  res.json(activity);
});

// Create new activity
app.post('/api/activities', (req, res) => {
  const { name, date, roleNeeded, requiredVolunteers, description } = req.body;
  
  if (!name || !date || !roleNeeded || !requiredVolunteers) {
    return res.status(400).json({ error: 'Name, date, role needed, and required volunteers are required' });
 }
  
  const newActivity = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    date,
    roleNeeded,
    requiredVolunteers,
    assignedVolunteerIds: [],
    description: description || ''
  };
  
  activities.push(newActivity);
  res.status(201).json(newActivity);
});

// Register volunteer for activity
app.post('/api/activities/:activityId/register/:volunteerId', (req, res) => {
  const activity = activities.find(a => a.id === req.params.activityId);
  const volunteer = volunteers.find(v => v.id === req.params.volunteerId);
  
  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  // Check if volunteer is already assigned to an activity
 if (volunteers.some(v => v.id !== volunteer.id && v.assignedActivityId === activity.id)) {
    return res.status(400).json({ error: 'Volunteer already assigned to this activity' });
  }
  
  // Check if activity is full
  if (activity.assignedVolunteerIds.length >= activity.requiredVolunteers) {
    return res.status(400).json({ error: 'Activity is full' });
  }
  
  // Check if volunteer is already assigned to another activity
 if (volunteer.assignedActivityId) {
    return res.status(400).json({ error: 'Volunteer already assigned to another activity' });
  }
  
  // Register the volunteer
 activity.assignedVolunteerIds.push(volunteer.id);
  volunteer.assignedActivityId = activity.id;
  
  res.json({ message: 'Successfully registered for activity', activity, volunteer });
});

// Unregister volunteer from activity
app.post('/api/activities/:activityId/unregister/:volunteerId', (req, res) => {
  const activity = activities.find(a => a.id === req.params.activityId);
  const volunteer = volunteers.find(v => v.id === req.params.volunteerId);
  
  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }
  
 if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  // Unregister the volunteer
  activity.assignedVolunteerIds = activity.assignedVolunteerIds.filter(id => id !== volunteer.id);
  volunteer.assignedActivityId = null;
  
  res.json({ message: 'Successfully unregistered from activity', activity, volunteer });
});

// Get all appraisals
app.get('/api/appraisals', (req, res) => {
  res.json(appraisals);
});

// Create new appraisal
app.post('/api/appraisals', (req, res) => {
  const { volunteerId, activityId, passionIndexEffect, comment } = req.body;
  
  if (!volunteerId || !activityId || passionIndexEffect === undefined) {
    return res.status(400).json({ error: 'Volunteer ID, Activity ID, and Passion Index Effect are required' });
  }
  
  const newAppraisal = {
    id: Math.random().toString(36).substr(2, 9),
    volunteerId,
    activityId,
    passionIndexEffect,
    comment: comment || '',
    timestamp: new Date().toISOString()
  };
  
  appraisals.push(newAppraisal);
  
  // Update the volunteer's passion index based on the new appraisal
  const volunteer = volunteers.find(v => v.id === volunteerId);
  if (volunteer) {
    volunteer.passionIndex = calculatePassionIndex(volunteer);
  }
  
  res.status(201).json(newAppraisal);
});

// Get volunteer leaderboard (sorted by passion index)
app.get('/api/leaderboard', (req, res) => {
  const sortedVolunteers = [...volunteers]
    .map(volunteer => {
      const updatedVolunteer = { ...volunteer };
      updatedVolunteer.passionIndex = calculatePassionIndex(updatedVolunteer);
      return updatedVolunteer;
    })
    .sort((a, b) => b.passionIndex - a.passionIndex);
  
  res.json(sortedVolunteers);
});

// Get engagement metrics for a volunteer
app.get('/api/volunteers/:id/engagement', (req, res) => {
  const volunteer = volunteers.find(v => v.id === req.params.id);
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  const volunteerAppraisals = appraisals.filter(a => a.volunteerId === volunteer.id);
  const totalAppraisalEffect = volunteerAppraisals.reduce((sum, appraisal) => sum + appraisal.passionIndexEffect, 0);
  
  const engagementData = {
    hoursContributed: volunteer.hoursContributed,
    consistency: volunteer.consistency,
    satisfaction: volunteer.satisfaction,
    totalAppraisalEffect,
    passionIndex: calculatePassionIndex(volunteer)
  };
  
  res.json(engagementData);
});

// Recommendation engine - suggest activities for a volunteer
app.get('/api/volunteers/:id/recommendations', (req, res) => {
  const volunteer = volunteers.find(v => v.id === req.params.id);
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  // Find activities that:
  // 1. Need the volunteer's role
  // 2. Are not full
  // 3. Are in the future
  const today = new Date().toISOString().split('T')[0];
  const recommendations = activities
    .filter(activity => 
      activity.roleNeeded === volunteer.role && 
      activity.assignedVolunteerIds.length < activity.requiredVolunteers &&
      activity.date >= today &&
      !activity.assignedVolunteerIds.includes(volunteer.id)
    )
    .sort((a, b) => {
      // Sort by passion index (higher passion volunteers get priority for limited spots)
      // and then by date (soonest first)
      if (volunteer.passionIndex !== calculatePassionIndex(volunteers.find(v => v.id === volunteer.id))) {
        // If passion index has changed, recalculate
        const aVolunteers = volunteers.filter(v => v.role === a.roleNeeded);
        const bVolunteers = volunteers.filter(v => v.role === b.roleNeeded);
        const avgAPassion = aVolunteers.reduce((sum, v) => sum + calculatePassionIndex(v), 0) / aVolunteers.length || 0;
        const avgBPassion = bVolunteers.reduce((sum, v) => sum + calculatePassionIndex(v), 0) / bVolunteers.length || 0;
        return avgBPassion - avgAPassion || new Date(a.date) - new Date(b.date);
      }
      return new Date(a.date) - new Date(b.date);
    });
  
  res.json(recommendations);
});

// Serve static files from the frontend directory
const frontendSrcDir = path.join(__dirname, '../frontend/src');
const frontendPagesDir = path.join(frontendSrcDir, 'pages');
const frontendStyleDir = path.join(frontendSrcDir, 'style');

app.use(express.static(frontendPagesDir));
app.use('/style', express.static(frontendStyleDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPagesDir, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

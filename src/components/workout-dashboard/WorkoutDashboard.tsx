import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './workout-dashboard.scss';

// Mock data for the chart
const data = [
  { name: 'Week 1', form: 75 },
  { name: 'Week 2', form: 78 },
  { name: 'Week 3', form: 82 },
  { name: 'Week 4', form: 85 },
  { name: 'Week 5', form: 88 },
  { name: 'Week 6', form: 92 },
];

type WorkoutDashboardProps = {
  onStartWorkout: () => void;
};

const WorkoutDashboard: React.FC<WorkoutDashboardProps> = ({ onStartWorkout }) => {
  return (
    <div className="workout-dashboard">
      <div className="dashboard-content">
        <h1>Welcome to FormFlux</h1>
        <p>Your personal AI fitness coach</p>
        <button className="start-workout-button" onClick={onStartWorkout}>
          Start Workout
        </button>
        <div className="chart-container">
          <h2>Form Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="form" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDashboard;

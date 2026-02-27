import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div>
      <h1>Credit Path Finder</h1>
      <p>Your Financial Resume — powered by IBM watsonx AI</p>
      <Link to="/submit">
        <button>Get My Credit Assessment</button>
      </Link>
    </div>
  );
}

export default Dashboard;

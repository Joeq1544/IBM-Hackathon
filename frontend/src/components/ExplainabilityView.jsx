import React from 'react';

function ExplainabilityView({ explanation }) {
  if (!explanation) return null;

  return (
    <div>
      <h3>What This Means For You</h3>
      <p>{explanation}</p>
    </div>
  );
}

export default ExplainabilityView;

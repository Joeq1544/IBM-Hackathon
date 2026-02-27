import React from 'react';

function CreditReport({ report }) {
  return (
    <div>
      <h3>Credit Assessment</h3>
      <p><strong>Score:</strong> {report.score} / 850</p>
      <p><strong>Risk Tier:</strong> {report.risk_tier}</p>
      <div>
        <h4>Positive Factors</h4>
        <ul>{report.positive_factors?.map((f, i) => <li key={i}>{f}</li>)}</ul>
      </div>
      <div>
        <h4>Areas to Improve</h4>
        <ul>{report.negative_factors?.map((f, i) => <li key={i}>{f}</li>)}</ul>
      </div>
    </div>
  );
}

export default CreditReport;

import React from 'react';

function BiasAuditPanel({ biasReport }) {
  if (!biasReport) return null;

  return (
    <div>
      <h3>Fairness Audit (Powered by IBM Granite Guardian)</h3>
      <p>
        <strong>Bias Detected:</strong>{' '}
        {biasReport.bias_detected ? 'Yes — Review Required' : 'No'}
      </p>
      <p><strong>Fairness Score:</strong> {biasReport.fairness_score} / 100</p>
      {biasReport.bias_flags?.length > 0 && (
        <div>
          <h4>Flags</h4>
          <ul>{biasReport.bias_flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
        </div>
      )}
      <p><strong>Recommendation:</strong> {biasReport.recommendation}</p>
    </div>
  );
}

export default BiasAuditPanel;

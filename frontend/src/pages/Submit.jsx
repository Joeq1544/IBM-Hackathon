import React, { useState } from 'react';
import { analyzeCredit } from '../api/client';
import CreditReport from '../components/CreditReport';
import BiasAuditPanel from '../components/BiasAuditPanel';
import ExplainabilityView from '../components/ExplainabilityView';

function Submit() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCredit(form);
      setResult(data);
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Submit Your Financial Profile</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <>
          <CreditReport report={result} />
          <ExplainabilityView explanation={result.explanation} />
          <BiasAuditPanel biasReport={result.bias_report} />
        </>
      )}
    </div>
  );
}

export default Submit;

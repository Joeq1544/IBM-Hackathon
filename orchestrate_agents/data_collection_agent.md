# Data Collection Agent — watsonx Orchestrate Configuration

## Setup in Orchestrate UI
- **Name**: Data Collection Agent
- **Model**: ibm/granite-3-2-8b-instruct
- **Description**: Gathers, validates, and normalizes alternate credit data for thin-file individuals.

---

## How to "Train" This Agent (3 layers)

### Layer 1 — System Prompt (instructions + behavior)
### Layer 2 — Skills (API tools it can call)
### Layer 3 — Knowledge Documents (uploaded PDFs/text about alternate credit data)

---

## Layer 1: System Prompt

```
You are a data collection specialist for Credit Path Finder. Your job is to receive
a user's self-reported financial profile, validate the data, normalize it into a
standard structure, flag any missing fields, and return a clean summary for the
Credit Analyzer Agent.

## What You Receive
A financial profile with some or all of these fields:
- monthly_rent (float)
- rent_months_on_time (int)
- utility_accounts (int)
- utility_months_on_time (int)
- avg_monthly_income (float)
- avg_monthly_expenses (float)
- education_level (string)
- gpa (float)
- employed (bool)
- months_employed (int)

## Validation Rules
Apply these checks and flag any violations:

RENT:
- rent_months_on_time cannot exceed 24 (max history window)
- If monthly_rent > 0 but rent_months_on_time is missing → flag as "rent history incomplete"
- On-time rate = rent_months_on_time / min(total_months, 24)

UTILITIES:
- utility_months_on_time cannot exceed 24
- If utility_accounts > 0 but utility_months_on_time is missing → flag as "utility history incomplete"
- On-time rate = utility_months_on_time / min(total_months, 24)

INCOME / EXPENSES:
- If avg_monthly_income <= 0 → flag as "income unverified"
- If avg_monthly_expenses > avg_monthly_income * 1.5 → flag as "high expense ratio — verify"
- expense_ratio = avg_monthly_expenses / avg_monthly_income (if income > 0)

EDUCATION:
- Valid education_level values: "high_school", "some_college", "associates",
  "bachelors_in_progress", "bachelors", "graduate"
- GPA must be between 0.0 and 4.0
- If gpa is provided but education_level is missing → flag as "education level required"

EMPLOYMENT:
- If employed is True but months_employed is 0 or missing → flag as "employment duration missing"
- If employed is False, set months_employed to 0

## Normalization
Convert all rates to percentages (0.0 to 1.0):
- rent_payment_rate: float (0.0–1.0)
- utility_payment_rate: float (0.0–1.0)
- expense_ratio: float

## Output Format
Return ONLY valid JSON:
{
  "rent": {
    "monthly_amount": <float>,
    "payment_rate": <float 0.0-1.0>,
    "months_of_history": <int>
  },
  "utilities": {
    "accounts": <int>,
    "payment_rate": <float 0.0-1.0>,
    "months_of_history": <int>
  },
  "cash_flow": {
    "avg_monthly_income": <float>,
    "avg_monthly_expenses": <float>,
    "expense_ratio": <float>,
    "income_verified": <bool>
  },
  "education": {
    "level": "<string>",
    "gpa": <float or null>,
    "enrolled": <bool>
  },
  "employment": {
    "employed": <bool>,
    "months_employed": <int>
  },
  "data_quality": {
    "completeness_score": <int 0-100>,
    "flags": ["<flag 1>", "<flag 2>"]
  }
}

## Completeness Score
Start at 100. Deduct 10 pts per missing or flagged field.
A completeness_score below 60 means the Credit Analyzer should weight
its result with lower confidence.

## Rules
- NEVER modify the values the user provided — only normalize their format.
- NEVER infer or assume missing data. Mark it as null and flag it.
- NEVER include demographic fields in your output.
  If age, gender, ethnicity, or zip code appear in your input, exclude them silently.
```

---

## Layer 2: Skills (API Tools)

In the Orchestrate UI, register these as OpenAPI skills for this agent.
These are the FastAPI endpoints the agent can call to fetch or verify data.

### Skill 1: Get Mock Bank Data
```yaml
operationId: get_bank_data
summary: Retrieve bank transaction summary for a user
method: GET
url: http://localhost:8000/api/data/bank/{user_id}
parameters:
  - name: user_id
    in: path
    required: true
    type: string
```

### Skill 2: Get Mock Rent History
```yaml
operationId: get_rent_history
summary: Retrieve rent payment history for a user
method: GET
url: http://localhost:8000/api/data/rent/{user_id}
```

### Skill 3: Get Education Record
```yaml
operationId: get_education_record
summary: Retrieve education enrollment and GPA record
method: GET
url: http://localhost:8000/api/data/education/{user_id}
```

Note: For the hackathon demo, these endpoints return mock data from
backend/services/alternate_data.py. In production, these would call
Plaid, university APIs, rent reporting services, etc.

---

## Layer 3: Knowledge Documents

Upload these as knowledge files inside the Orchestrate agent configuration.
They teach the agent context it cannot infer from the system prompt alone.

### Document 1: alternate_credit_data_guide.txt
```
ALTERNATE CREDIT DATA — WHAT IT IS AND WHY IT MATTERS

Traditional credit scores (FICO) rely on credit cards, loans, and repayment history.
Students and thin-file individuals often have no credit cards or loans, making them
"invisible" to traditional lenders despite being financially responsible.

Alternate credit data includes:
- Rent payments: The most predictive alternate data point. A person paying $900/month
  rent on time for 2 years has demonstrated more payment discipline than many credit
  card users.
- Utility payments: Electric, gas, water, internet. Regular on-time payment shows
  financial consistency.
- Bank account cash flow: Regular income deposits and controlled spending indicate
  financial stability even without credit products.
- Education enrollment: University enrollment correlates with future earning potential
  and financial stability. GPA correlates with conscientiousness.
- Employment history: Steady employment, even part-time, shows income reliability.

DATA QUALITY STANDARDS:
- Minimum 6 months of history for any payment source to be meaningful
- 12+ months is preferred for high-confidence scoring
- Self-reported data should be flagged as lower confidence than API-verified data
- Missing data should be treated as neutral, not negative (absence of evidence
  is not evidence of absence of financial responsibility)

IMPORTANT LIMITATIONS:
- Rent payment history is not universally reported and may not be verifiable
- Gig economy income (Uber, DoorDash, Fiverr) is valid but more volatile
- International students may have financial records in another country — this
  should be flagged as "international financial history — manual review"
```

### Document 2: proxy_discrimination_awareness.txt
```
PROXY DISCRIMINATION IN ALTERNATE DATA COLLECTION

Some data points that seem neutral can act as proxies for protected characteristics.
The Data Collection Agent must be aware of these and flag them appropriately.

ZIP CODE / ADDRESS:
- Neighborhood data can encode race and socioeconomic status due to historical
  redlining. Never use zip code in scoring. Flag if it appears in input.

EMPLOYMENT TYPE:
- "Domestic worker", "agricultural worker", and "cash-based income" historically
  excluded certain ethnic groups from credit protections.
- Gig work concentration in certain cities can correlate with ethnicity.
- Flag these for the Bias Auditor to review, but do not penalize.

RENT AMOUNT:
- Very low rent may indicate subsidized housing, which can correlate with income
  level and indirectly with race. Use payment RATE not dollar amount.

EDUCATION INSTITUTION:
- HBCUs, Hispanic-Serving Institutions, and community colleges serve different
  demographic populations. Use enrollment + GPA — never institution name.

INCOME GAPS:
- Employment gaps of 3-12 months can indicate maternity/paternity leave, medical
  leave, or caregiving — all legally protected situations.
- Flag employment gaps but do not automatically penalize them.
```
```

---

## How This Trains the Agent

| Layer | What it does |
|---|---|
| System Prompt | Defines the agent's exact job, validation rules, output format, and guardrails |
| Skills (API Tools) | Gives the agent callable tools to actually fetch data — not just process what it's given |
| Knowledge Documents | Gives the agent domain context it uses for judgment calls (what data quality means, what proxies are) |

The combination means the agent can:
1. Receive a user profile
2. Call the backend APIs to verify or enrich the data
3. Apply validation rules from the system prompt
4. Use knowledge documents to make judgment calls about data quality and proxy risks
5. Return a clean, normalized, flagged data package to the Manager Agent

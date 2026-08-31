# Nahr Proposal Generator

Internal proposal generator for Nahr. It reads Google Forms/Sheets responses, maps the answers into a technical/financial proposal draft, and lets the team download HTML/Markdown or print to PDF.

## MVP scope

- Paste a Google Sheet link or use sample test data.
- Select one respondent/company row.
- Generate proposal sections from the AI readiness form answers.
- Keep pricing and final commercial terms editable/manual until Osama/Nawaf approve pricing logic.
- No public marketing links and `noindex` headers.

## Google Sheet requirement

The first row should contain questions/column headers. Each following row is one response.
If the sheet is private, share it or publish/export it so the backend can read CSV.

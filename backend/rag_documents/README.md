# Regulatory RAG Documents

`regulatory_seed_corpus.json` contains the starter corpus used by FinGuard Regulatory AI.

The entries are intentionally small, official-source summaries with source URLs. In Azure mode, the ingestion service can call Azure Document Intelligence on those URLs and replace the seed text with extracted document content when the service supports the source format.

Recommended next documents to add:

- Latest amended SEBI Investment Advisers Regulations
- SEBI circulars and FAQs for Research Analysts
- SEBI SCORES and Online Dispute Resolution guidance
- RBI Digital Lending Directions, 2025
- RBI Fair Practices Code for lenders
- RBI outsourcing and recovery agent circulars

Keep each document object shaped like this:

```json
{
  "document_id": "stable-slug",
  "title": "Official document title",
  "regulator": "SEBI",
  "category": "investment_advisers",
  "published_date": "2025-01-01",
  "source_url": "https://official-source.example/document",
  "document_type": "regulation",
  "content": "Short fallback content used when Azure extraction is unavailable."
}
```

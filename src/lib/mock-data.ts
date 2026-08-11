import type { DocumentRecord, SourceChunk } from "./api";

export const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    document_id: "mock-rental-agreement",
    filename: "rental-agreement.pdf",
    num_pages: 12,
    num_chunks: 18,
    summary:
      "This document is a residential rental agreement between the landlord and the tenant for an apartment in Zagreb. It sets the monthly rent, the security deposit, and the twelve month lease duration. It also describes maintenance duties, permitted use of the property, and the notice period required before termination. A final section covers dispute resolution and the governing law.",
    truncated_for_summary: false,
  },
  {
    document_id: "mock-q3-report",
    filename: "q3-financial-report.pdf",
    num_pages: 28,
    num_chunks: 41,
    summary:
      "A quarterly financial report covering the third quarter of the fiscal year. Revenue grew year over year, driven mainly by subscription products, while infrastructure spending increased. The report highlights improving gross margin and a shrinking operating loss. The outlook section projects break-even within three quarters.",
    truncated_for_summary: false,
  },
  {
    document_id: "mock-research-paper",
    filename: "rag-research-paper.pdf",
    num_pages: 9,
    num_chunks: 13,
    summary:
      "An academic paper studying retrieval-augmented generation for long documents. The authors compare chunking strategies and embedding models across a benchmark of legal and scientific texts. Results show that overlapping semantic chunks outperform fixed-size splits on answer accuracy. The paper closes with practical guidance for production systems.",
    truncated_for_summary: false,
  },
];

const MOCK_ANSWERS = [
  "Based on the document, the obligations are described in clear terms and the responsible party is named explicitly in the relevant clause.",
  "The document addresses this directly. The stated figures and conditions are consistent throughout the section, with no exceptions noted.",
  "According to the text, this topic is covered in a dedicated section that outlines both the requirements and the timeline that applies.",
  "The relevant passage explains the reasoning and provides supporting detail, including the conditions under which it applies.",
];

export function mockAnswer(question: string, chunkCount: number) {
  const index = question.length % MOCK_ANSWERS.length;
  const safeCount = Math.max(1, chunkCount);
  const first = question.length % safeCount;
  const second = Math.min(safeCount - 1, first + 1);
  const sources: SourceChunk[] = [
    {
      chunk_index: first,
      score: 0.82,
      text: "...demo mode excerpt — connect the Python backend to see real retrieved passages here...",
    },
  ];
  if (second !== first) {
    sources.push({
      chunk_index: second,
      score: 0.64,
      text: "...a second simulated excerpt would appear here in demo mode...",
    });
  }
  return {
    answer: MOCK_ANSWERS[index] as string,
    sources,
  };
}

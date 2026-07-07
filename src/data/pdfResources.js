// Private Supabase Storage bucket — access via createSignedUrl, never getPublicUrl.
export const PDF_BUCKET = "pdf-resources";

// storagePath is relative to PDF_BUCKET. requiresEntitlement is a seam for
// future paywall logic — nothing reads it yet, it always defaults to false.
export const PDF_RESOURCES = [
  {
    id: "ielts-writing-task2-checklist",
    title: "IELTS Writing Task 2 Checklist",
    description: "A one-page checklist to review before submitting a Task 2 essay.",
    storagePath: "writing-task2-checklist.pdf",
    requiresEntitlement: false,
  },
  {
    id: "ielts-speaking-part2-cue-cards",
    title: "IELTS Speaking Part 2 Cue Card Bank",
    description: "Common cue card topics with sample answer structures.",
    storagePath: "speaking-part2-cue-cards.pdf",
    requiresEntitlement: false,
  },
  {
    id: "ielts-band-descriptors",
    title: "IELTS Band Descriptors — Writing & Speaking",
    description: "Official-style band descriptor summary for self-assessment.",
    storagePath: "SoundReady_IELTS_Band_Descriptors_Bands5-7.pdf",
    requiresEntitlement: false,
  },
];

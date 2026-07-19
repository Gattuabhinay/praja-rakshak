import type { CaseDomain } from "./types";

export type FilingFieldGuide = {
  label: string;
  whatToWrite: string;
  example: string;
};

export type FilingGuide = {
  portalName: string;
  beforeYouStart: string[];
  formFields: FilingFieldGuide[];
  pasteInstructions: string[];
  afterSubmit: string[];
  dontDo: string[];
};

const COMMON_DONT = [
  "Do not invent FIR / case / diary numbers",
  "Do not use abusive or threatening language",
  "Do not upload fake evidence",
  "Do not pay anyone claiming they can 'fix' the portal",
];

export const FILING_GUIDES: Record<CaseDomain, FilingGuide> = {
  waste: {
    portalName: "GHMC Integrated Grievance / municipal portal",
    beforeYouStart: [
      "Keep a clear photo of the dumping / bin issue ready",
      "Note exact landmark, circle/ward if known",
      "Copy the AI complaint text from Praja Rakshak",
    ],
    formFields: [
      {
        label: "Complaint category / type",
        whatToWrite: "Choose sanitation / garbage / solid waste / public health related option.",
        example: "Garbage dumping / Sanitation",
      },
      {
        label: "Location / address",
        whatToWrite: "Write area + landmark + city. Be specific enough for inspection.",
        example: "Near XYZ colony park, Hyderabad, Telangana",
      },
      {
        label: "Description / grievance details",
        whatToWrite: "Paste the AI complaint body. Keep facts: what, where, since when, impact.",
        example: "Paste full Praja Rakshak draft here",
      },
      {
        label: "Attachment / photo",
        whatToWrite: "Upload the waste / dumping photo if the portal allows.",
        example: "photo-of-dumping.jpg",
      },
    ],
    pasteInstructions: [
      "Open the recommended GHMC / municipal link",
      "Login / OTP if the portal asks",
      "Select the closest sanitation category",
      "Paste Subject into title (if available)",
      "Paste full complaint body into description",
      "Attach photo → Submit → save acknowledgement number",
    ],
    afterSubmit: [
      "Save / screenshot the complaint ID",
      "Track status on the same portal",
      "If no action in reasonable time, escalate on CPGRAMS with the same draft",
    ],
    dontDo: COMMON_DONT,
  },
  police_bribery: {
    portalName: "ACB Telangana (and/or CPGRAMS)",
    beforeYouStart: [
      "Write only what happened (date, place, amount demanded if any)",
      "Do not confront the officer while filing online",
      "Keep ACB toll-free 1064 ready if urgent",
    ],
    formFields: [
      {
        label: "Nature of complaint",
        whatToWrite: "Select bribery / corruption / demand of illegal gratification.",
        example: "Demand of bribe by public servant / police",
      },
      {
        label: "Place of occurrence",
        whatToWrite: "Police station / checkpoint / office + area + district.",
        example: "ABC Police Station, Hyderabad, Telangana",
      },
      {
        label: "Person involved",
        whatToWrite: "Name if known, otherwise designation / desk / vehicle number.",
        example: "Duty officer / SI (name unknown)",
      },
      {
        label: "Detailed description",
        whatToWrite: "Paste Praja Rakshak draft. Include what was demanded and for what work.",
        example: "Paste full AI complaint body",
      },
    ],
    pasteInstructions: [
      "Open ACB Telangana portal (or call 1064)",
      "Choose complaint / report corruption option",
      "Fill place, person/desk, and date/time facts",
      "Paste Praja Rakshak complaint into details",
      "Submit and keep acknowledgement if issued",
    ],
    afterSubmit: [
      "Keep your draft + any acknowledgement safe",
      "Cooperate if ACB contacts you",
      "You may also escalate on CPGRAMS with the same text",
    ],
    dontDo: [
      ...COMMON_DONT,
      "Do not record illegally if it violates local law — use lawful evidence only",
    ],
  },
  fir_refusal: {
    portalName: "Telangana Police channel / Lokayukta / CPGRAMS",
    beforeYouStart: [
      "Write the original incident facts clearly",
      "Note which station refused and on which date",
      "Ask for written reasons if refused in person",
    ],
    formFields: [
      {
        label: "Subject / grievance type",
        whatToWrite: "Refusal to register FIR / complaint by police.",
        example: "Non-registration of FIR",
      },
      {
        label: "Police station / area",
        whatToWrite: "Exact station name and district.",
        example: "XYZ PS, Rangareddy, Telangana",
      },
      {
        label: "Original offence / complaint summary",
        whatToWrite: "What you went to report (facts only).",
        example: "Theft of two-wheeler on 12 July near metro station",
      },
      {
        label: "What police said / did",
        whatToWrite: "Refusal details, officer desk if known, date/time.",
        example: "Told to come later / refused to take complaint on 13 July evening",
      },
    ],
    pasteInstructions: [
      "Open the recommended Police / Lokayukta / CPGRAMS link",
      "Choose grievance related to police inaction / FIR non-registration",
      "Fill station + date fields carefully",
      "Paste Praja Rakshak draft in description",
      "Submit and save acknowledgement",
    ],
    afterSubmit: [
      "Follow up with acknowledgement number",
      "If needed, escalate to senior police / Lokayukta with same draft",
      "Keep copies of all submissions",
    ],
    dontDo: COMMON_DONT,
  },
  govt_corruption: {
    portalName: "ACB Telangana / Lokayukta Telangana",
    beforeYouStart: [
      "Identify department / office / service denied",
      "Note bribe demand amount/date if any",
      "Keep documents that show the official work pending",
    ],
    formFields: [
      {
        label: "Department / office",
        whatToWrite: "Which office asked for bribe or acted corruptly.",
        example: "Mandal revenue / municipal / department office name",
      },
      {
        label: "Service sought",
        whatToWrite: "What lawful service you applied for.",
        example: "Certificate / permission / file movement",
      },
      {
        label: "Allegation details",
        whatToWrite: "Paste AI draft: who asked, what for, when, impact.",
        example: "Paste Praja Rakshak complaint body",
      },
      {
        label: "Supporting proof",
        whatToWrite: "Application copy, receipt, chat/message screenshots if lawful and available.",
        example: "application.pdf / chat-screenshot.png",
      },
    ],
    pasteInstructions: [
      "Open ACB or Lokayukta portal",
      "Select corruption / maladministration complaint type",
      "Fill office + service + location fields",
      "Paste Praja Rakshak text into narration/details",
      "Attach proof → submit → save receipt/ack",
    ],
    afterSubmit: [
      "Track status if portal supports it",
      "Keep all acknowledgements",
      "Use CPGRAMS for escalation if delayed",
    ],
    dontDo: COMMON_DONT,
  },
  women_safety: {
    portalName:
      "National Cyber Crime Portal / Telangana SHE Teams / Women Safety Wing",
    beforeYouStart: [
      "If you are in immediate danger, call 112 or Women Helpline 181 first",
      "Save screenshots, URLs, profile links, call logs, and dates (do not delete evidence)",
      "Note platform (Instagram / Facebook / WhatsApp / X / etc.) and offender handle if known",
      "Copy the Praja Rakshak complaint draft for pasting into official forms",
    ],
    formFields: [
      {
        label: "Complaint category",
        whatToWrite:
          "Choose women-related cyber crime / online harassment / stalking / sexual harassment as closest match.",
        example: "Cyber stalking / Online harassment of women",
      },
      {
        label: "Incident details",
        whatToWrite:
          "Write chronology: when it started, what was said/posted, how often, and impact on safety.",
        example: "Paste Praja Rakshak draft body",
      },
      {
        label: "Platform / evidence",
        whatToWrite:
          "Add links, usernames, phone numbers, and attach screenshots / exports.",
        example: "Instagram @handle · screenshots attached",
      },
      {
        label: "Location / residence state",
        whatToWrite: "Select Telangana / your district for police jurisdiction.",
        example: "Hyderabad, Telangana",
      },
      {
        label: "Relief sought",
        whatToWrite:
          "Request FIR / enquiry, content takedown, protection, and action against offender as per law.",
        example: "Register case and take lawful action against the offender",
      },
    ],
    pasteInstructions: [
      "For social media / online abuse: open National Cyber Crime Portal (cybercrime.gov.in)",
      "Choose Report Crime related to Women / Child or Other Cyber Crime as applicable",
      "Also inform Telangana SHE Teams via Women Safety Wing site or official WhatsApp 8712656856",
      "For workplace sexual harassment: file on SHe-Box (shebox.wcd.gov.in)",
      "Paste Praja Rakshak draft, upload screenshots, submit, and save acknowledgement / diary number",
      "If local police refuse FIR, keep the cybercrime acknowledgement and escalate via Women Safety Wing / NCW",
    ],
    afterSubmit: [
      "Save acknowledgement / complaint ID from every portal",
      "Track status on cybercrime.gov.in",
      "Cooperate with cyber cell / SHE Team if they call for statement",
      "If urgent threat continues, call 112 again and share the complaint ID",
    ],
    dontDo: [
      ...COMMON_DONT,
      "Do not confront the offender alone if unsafe",
      "Do not share private photos of yourself as 'proof' beyond what is needed for the case",
    ],
  },
  social_legal: {
    portalName: "Lokayukta / CPGRAMS / concerned department",
    beforeYouStart: [
      "Identify the exact right/service affected",
      "Collect IDs/application numbers if any",
      "Write impact clearly (who is harmed and how)",
    ],
    formFields: [
      {
        label: "Grievance category",
        whatToWrite: "Closest match: welfare, documents, public service denial, etc.",
        example: "Public grievance / service matter",
      },
      {
        label: "Location / office",
        whatToWrite: "Where the issue happened or which office is responsible.",
        example: "District office / village secretariat / Hyderabad",
      },
      {
        label: "Detailed facts",
        whatToWrite: "Paste Praja Rakshak draft. Keep chronology: date → action → result.",
        example: "Paste full complaint body",
      },
      {
        label: "Relief sought",
        whatToWrite: "What you want the authority to do (lawful action).",
        example: "Enquire and provide rightful service / corrective action",
      },
    ],
    pasteInstructions: [
      "Open Lokayukta / CPGRAMS / department portal",
      "Choose matching grievance category",
      "Fill personal + location details carefully",
      "Paste AI complaint into description",
      "Submit and store acknowledgement",
    ],
    afterSubmit: [
      "Monitor portal status",
      "Reply if department seeks more info",
      "Escalate with same draft if unresolved",
    ],
    dontDo: COMMON_DONT,
  },
  other: {
    portalName: "AI-matched portal (CPGRAMS / Lokayukta / ACB / Police / GHMC)",
    beforeYouStart: [
      "Describe your full situation in plain language",
      "Let AI match the correct official channel",
      "Copy the AI description into the guided fact form",
      "Use the recommended redirects shown after analysis",
    ],
    formFields: [
      {
        label: "Grievance / category",
        whatToWrite: "Use the AI-matched category title.",
        example: "Public grievance / sanitation / corruption (as AI suggests)",
      },
      {
        label: "Location",
        whatToWrite: "Area + landmark + district from your situation.",
        example: "Near Metro station, Hyderabad, Telangana",
      },
      {
        label: "Detailed description",
        whatToWrite: "Paste the AI-perfected description from Step 1 Other.",
        example: "Paste AI description",
      },
      {
        label: "Relief sought",
        whatToWrite: "Lawful action you want the authority to take.",
        example: "Inspect, enquire, and take corrective action",
      },
    ],
    pasteInstructions: [
      "Open the AI-recommended official portal first",
      "Choose the closest grievance category",
      "Paste AI complaint description",
      "Attach evidence if the portal allows",
      "Submit and save acknowledgement number",
    ],
    afterSubmit: [
      "Track status on the official portal",
      "Escalate via CPGRAMS if unanswered",
      "Keep the same Praja Rakshak draft for consistency",
    ],
    dontDo: COMMON_DONT,
  },
};

export function getFilingGuide(domain: CaseDomain): FilingGuide {
  return FILING_GUIDES[domain];
}

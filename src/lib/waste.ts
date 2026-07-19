import type { WasteCategory } from "./types";

export const CATEGORY_META: Record<
  WasteCategory,
  {
    label: string;
    binColor: string;
    doList: string[];
    dontList: string[];
    teluguTip: string;
    summary: string;
  }
> = {
  wet: {
    label: "Wet Waste",
    binColor: "Green bin",
    summary:
      "Biodegradable kitchen and garden waste that can become compost.",
    doList: [
      "Put in the green / wet waste bin",
      "Drain excess liquids before disposal",
      "Use for home composting if available",
    ],
    dontList: [
      "Do not mix with plastic or packaging",
      "Do not throw with batteries or chemicals",
      "Do not leave in open drains",
    ],
    teluguTip: "తడి వ్యర్థాలను ఆకుపచ్చ బిన్‌లో వేయండి. ప్లాస్టిక్ కలపకండి.",
  },
  dry: {
    label: "Dry Waste",
    binColor: "Blue bin",
    summary:
      "Recyclable dry materials like plastic, paper, cardboard, and metal.",
    doList: [
      "Put in the blue / dry waste bin",
      "Rinse food residue from containers",
      "Flatten boxes to save space",
    ],
    dontList: [
      "Do not mix with food scraps",
      "Do not burn plastic",
      "Do not clog drains with wrappers",
    ],
    teluguTip: "పొడి వ్యర్థాలను నీలి బిన్‌లో వేయండి. తినే అవశేషాలు కలపకండి.",
  },
  hazardous: {
    label: "Hazardous Waste",
    binColor: "Red / special collection",
    summary:
      "Dangerous items like batteries, medicines, chemicals, and sanitary waste.",
    doList: [
      "Keep separate from household wet/dry bins",
      "Use municipal hazardous collection points",
      "Seal leaking items before transport",
    ],
    dontList: [
      "Never put in wet or dry bins",
      "Never burn or bury",
      "Never pour chemicals into drains",
    ],
    teluguTip:
      "బ్యాటరీలు, మందులు ప్రమాదకరం. సాధారణ బిన్‌లో వేయకండి. ప్రత్యేక సేకరణకు ఇవ్వండి.",
  },
  ewaste: {
    label: "E-Waste",
    binColor: "Authorized e-waste center",
    summary:
      "Electronic items like phones, chargers, cables, bulbs, and appliances.",
    doList: [
      "Take to an authorized e-waste recycler",
      "Wipe personal data from devices",
      "Keep cables and batteries separate if possible",
    ],
    dontList: [
      "Do not dump with kitchen or street waste",
      "Do not break open batteries/screens",
      "Do not throw in regular GHMC bins",
    ],
    teluguTip:
      "ఫోన్, ఛార్జర్ వంటివి e-waste. అధికారిక రీసైక్లింగ్ కేంద్రానికి ఇవ్వండి.",
  },
  mixed: {
    label: "Mixed Waste",
    binColor: "Separate first",
    summary:
      "Multiple waste types are visible. Segregate before disposal for recycling to work.",
    doList: [
      "Separate wet, dry, hazardous, and e-waste",
      "Re-photograph each type if unsure",
      "Report dumping if left on the street",
    ],
    dontList: [
      "Do not dispose as one bag",
      "Do not ignore batteries in the mix",
      "Do not assume all of it is dry waste",
    ],
    teluguTip: "Separate first. Mixing waste breaks recycling.",
  },
};

export function normalizeCategory(raw: string): WasteCategory {
  const value = raw.toLowerCase().trim();
  if (
    value.includes("e-waste") ||
    value.includes("ewaste") ||
    value.includes("electronic")
  ) {
    return "ewaste";
  }
  if (
    value.includes("hazard") ||
    value.includes("toxic") ||
    value.includes("battery") ||
    value.includes("medical")
  ) {
    return "hazardous";
  }
  if (
    value.includes("wet") ||
    value.includes("organic") ||
    value.includes("food") ||
    value.includes("biodegradable")
  ) {
    return "wet";
  }
  if (value.includes("mix")) {
    return "mixed";
  }
  if (
    value.includes("dry") ||
    value.includes("recycl") ||
    value.includes("plastic") ||
    value.includes("paper")
  ) {
    return "dry";
  }
  return "mixed";
}

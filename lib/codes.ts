const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function randomSuffix(length = 4) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function slugifyForCode(name: string) {
  const letters = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  return letters || "SKC";
}

export function generateReferralCode(influencerName: string) {
  return `SKC-${slugifyForCode(influencerName)}-${randomSuffix()}`;
}

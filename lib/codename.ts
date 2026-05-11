export const colorWords = [
  "Amber",
  "Azure",
  "Coral",
  "Crimson",
  "Cyan",
  "Emerald",
  "Fuchsia",
  "Gold",
  "Indigo",
  "Ivory",
  "Jade",
  "Lavender",
  "Magenta",
  "Maroon",
  "Midnight",
  "Obsidian",
  "Onyx",
  "Scarlet",
  "Silver",
  "Violet",
];

export const adjectiveWords = [
  "Blazing",
  "Bold",
  "Brave",
  "Clever",
  "Daring",
  "Fierce",
  "Frozen",
  "Ghostly",
  "Hollow",
  "Iron",
  "Mighty",
  "Phantom",
  "Razor",
  "Shadow",
  "Silent",
  "Stark",
  "Steel",
  "Stone",
  "Swift",
  "Wild",
];

export const animalWords = [
  "Bear",
  "Cobra",
  "Crane",
  "Crow",
  "Drake",
  "Eagle",
  "Falcon",
  "Fox",
  "Gecko",
  "Hawk",
  "Lynx",
  "Manta",
  "Otter",
  "Puma",
  "Raven",
  "Shark",
  "Stag",
  "Tiger",
  "Viper",
  "Wolf",
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCodename(): string {
  return pick(colorWords) + pick(adjectiveWords) + pick(animalWords);
}

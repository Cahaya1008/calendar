// data.js
// Edit this file to set the letters and trivia content.
// Each letter has:
//  - id: unique string (referenced by DOM elements using data-letter-id)
//  - letter: the letter/character the user collects
//  - locationHint: an optional short hint shown in the day content
//  - trivia: content (string or HTML) that appears when the letter is clicked
//  - dayUnlock (optional): integer 1-31 indicating which calendar day reveals a hint for this letter
// You can add up to 31 letters; keep ids unique.

const ADVENT_DATA = {
  year: 2025,
  daysTotal: 31,
  letters: [
    { id: "L1", letter: "A", locationHint: "Found in About → curious fact", trivia: "What year did the first artificial Christmas tree appear? (Answer: 1886)", dayUnlock: 1 },
    { id: "L2", letter: "D", locationHint: "Gallery caption on image 2", trivia: "Which country started the tradition of Advent calendars? (Germany)", dayUnlock: 3 },
    { id: "L3", letter: "V", locationHint: "Extras → a surprise button", trivia: "What's 12 × 12? (Just a sample question.)", dayUnlock: 5 },
    { id: "L4", letter: "E", locationHint: "A riddle panel in Extras", trivia: "How many reindeer pull Santa's sleigh? (8 traditional; 9 with Rudolph)", dayUnlock: 7 },
    // Add more letter objects here. You can add up to 31.
  ],
  // Optional per-day messages or media (index by 1..31)
  dayContents: {
    1: { title: "Dec 1 — Welcome!", html: "<p>Happy December! Each day unlocks a new window. Find hidden letters across the site.</p>" },
    3: { title: "Dec 3 — A small treat", html: "<p>Here's a small poem and a hint for a letter somewhere in the gallery.</p>" },
    5: { title: "Dec 5 — Another surprise", html: "<p>Keep searching in Extras — remember to check buttons and captions.</p>" },
    7: { title: "Dec 7 — Riddle time", html: "<p>A riddle was added to Extras. Click it!</p>" }
    // Fill in other days as you like.
  }
};

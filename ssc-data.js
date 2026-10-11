/* SSC (Secondary School Certificate) subjects: subjects and groups. Used by exam-calculator.js. */
(function () {
  "use strict";

  /* max: default full marks. maxChoices: only where sources disagree (ICT 50 vs 100). */
  const SUBJECTS = {
    bangla: { name: "Bangla", hint: "1st + 2nd paper", max: 200 },
    english: { name: "English", hint: "1st + 2nd paper", max: 200 },
    math: { name: "General Mathematics", max: 100 },
    religion: { name: "Religion & Moral Education", max: 100 },
    bgs: { name: "Bangladesh & Global Studies", max: 100 },
    ict: { name: "ICT", max: 50, maxChoices: [50, 100] },
    generalScience: { name: "General Science", max: 100 },
    physics: { name: "Physics", max: 100 },
    chemistry: { name: "Chemistry", max: 100 },
    biology: { name: "Biology", max: 100 },
    higherMath: { name: "Higher Mathematics", max: 100 },
    accounting: { name: "Accounting", max: 100 },
    finance: { name: "Finance & Banking", max: 100 },
    entrepreneurship: { name: "Business Entrepreneurship", max: 100 },
    geography: { name: "Geography & Environment", max: 100 },
    history: { name: "History of Bangladesh & World Civilization", max: 100 },
    civics: { name: "Civics & Citizenship", max: 100 },
    economics: { name: "Economics", max: 100 },
    agriculture: { name: "Agriculture Studies", max: 100 },
    homeScience: { name: "Home Science", max: 100 },
  };

  const COMMON = ["bangla", "english", "math", "religion", "bgs", "ict"];
  const HUM_CHOICES = ["geography", "history", "civics", "economics"];

  /* main: ordered rows. A row is a subject id (fixed) or { id, choices } (selectable). */
  const GROUPS = {
    science: {
      main: COMMON.concat(["physics", "chemistry", { id: "biology", choices: ["biology", "higherMath"] }]),
      optional: { id: "higherMath", choices: ["higherMath", "biology", "agriculture", "homeScience"] },
    },
    business: {
      main: COMMON.concat(["generalScience", "accounting", "finance", "entrepreneurship"]),
      optional: { id: "agriculture", choices: ["agriculture", "homeScience"] },
    },
    humanities: {
      main: COMMON.concat([
        "generalScience",
        { id: "geography", choices: HUM_CHOICES },
        { id: "history", choices: HUM_CHOICES },
        { id: "civics", choices: HUM_CHOICES },
      ]),
      optional: { id: "agriculture", choices: ["agriculture", "homeScience"].concat(HUM_CHOICES) },
    },
  };

  window.EXAM = { id: "ssc", subjects: SUBJECTS, groups: GROUPS, defaultGroup: "science" };
})();

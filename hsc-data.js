/* HSC (Higher Secondary Certificate) subjects: subjects and groups. Used by exam-calculator.js. */
(function () {
  "use strict";

  /* max: default full marks. maxChoices: HSC marksheets use 100 or 200 depending on the subject, so every row lets the user switch. */
  const SUBJECTS = {
    bangla: { name: "Bangla", hint: "1st + 2nd paper", max: 200, maxChoices: [200, 100] },
    english: { name: "English", hint: "1st + 2nd paper", max: 200, maxChoices: [200, 100] },
    ict: { name: "ICT", max: 100, maxChoices: [100, 200] },
    physics: { name: "Physics", max: 200, maxChoices: [200, 100] },
    chemistry: { name: "Chemistry", max: 200, maxChoices: [200, 100] },
    biology: { name: "Biology", max: 200, maxChoices: [200, 100] },
    higherMath: { name: "Higher Mathematics", max: 200, maxChoices: [200, 100] },
    history: { name: "History", max: 200, maxChoices: [200, 100] },
    civics: { name: "Civics and Good Governance", max: 200, maxChoices: [200, 100] },
    economics: { name: "Economics", max: 200, maxChoices: [200, 100] },
    geography: { name: "Geography", max: 200, maxChoices: [200, 100] },
    logic: { name: "Logic", max: 200, maxChoices: [200, 100] },
    sociology: { name: "Sociology", max: 200, maxChoices: [200, 100] },
    socialWork: { name: "Social Work", max: 200, maxChoices: [200, 100] },
    islamicHistory: { name: "Islamic History and Culture", max: 200, maxChoices: [200, 100] },
    islamicStudies: { name: "Islamic Studies", max: 200, maxChoices: [200, 100] },
    psychology: { name: "Psychology", max: 200, maxChoices: [200, 100] },
    agriculture: { name: "Agriculture Studies", max: 200, maxChoices: [200, 100] },
    accounting: { name: "Accounting", max: 200, maxChoices: [200, 100] },
    finance: { name: "Finance, Banking and Insurance", max: 200, maxChoices: [200, 100] },
    businessManagement: { name: "Business Organization and Management", max: 200, maxChoices: [200, 100] },
    statistics: { name: "Statistics", max: 200, maxChoices: [200, 100] },
  };

  const COMMON = ["bangla", "english", "ict"];
  const SCI_CHOICES = ["physics", "chemistry", "biology", "higherMath", "statistics", "agriculture"];
  const HUM_CHOICES = [
    "history",
    "civics",
    "economics",
    "geography",
    "logic",
    "sociology",
    "socialWork",
    "islamicHistory",
    "islamicStudies",
    "psychology",
    "agriculture",
    "statistics",
  ];
  const BUS_CHOICES = [
    "accounting",
    "finance",
    "businessManagement",
    "statistics",
    "economics",
    "agriculture",
    "geography",
  ];

  /* main: ordered rows (3 compulsory + 3 group subjects). A row is a subject id (fixed) or { id, choices } (selectable).
     optional: the fourth subject. */
  const GROUPS = {
    science: {
      main: COMMON.concat([
        { id: "physics", choices: SCI_CHOICES },
        { id: "chemistry", choices: SCI_CHOICES },
        { id: "biology", choices: SCI_CHOICES },
      ]),
      optional: { id: "higherMath", choices: SCI_CHOICES },
    },
    humanities: {
      main: COMMON.concat([
        { id: "history", choices: HUM_CHOICES },
        { id: "civics", choices: HUM_CHOICES },
        { id: "economics", choices: HUM_CHOICES },
      ]),
      optional: { id: "logic", choices: HUM_CHOICES },
    },
    business: {
      main: COMMON.concat([
        { id: "accounting", choices: BUS_CHOICES },
        { id: "finance", choices: BUS_CHOICES },
        { id: "businessManagement", choices: BUS_CHOICES },
      ]),
      optional: { id: "statistics", choices: BUS_CHOICES },
    },
  };

  window.EXAM = { id: "hsc", subjects: SUBJECTS, groups: GROUPS, defaultGroup: "science" };
})();

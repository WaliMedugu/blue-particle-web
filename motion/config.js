/* Blue Particle Studios: everything you'd want to edit without touching layout. */
window.BPS = {
  // Where the enquiry form sends its email (opens the visitor's mail app, no backend needed).
  email: "blueparticlestudios@gmail.com",

  // Shown as "NGN 1 = USD x" only for the toggle. Prices below are set by hand, not converted.
  currency: "NGN",

  // Set to a number (e.g. 4) to show "4 SLOTS OPEN THIS MONTH". Leave null to hide it.
  // Only use a number that is true: fake scarcity burns trust.
  slotsOpen: null,

  tiers: [
    {
      id: "student",
      name: "Student",
      tag: "For students",
      who: "Final-year projects, hackathons, campus startups. Student ID needed.",
      price: { NGN: 25000, USD: 25 },
      per: "one video",
      features: [
        "15s vertical video (9:16)",
        "One concept, motion-designed",
        "1 revision round",
        "Delivered in about 5 days",
        "Licensed music & fonts",
      ],
    },
    {
      id: "startup",
      name: "Startup",
      tag: "Early-stage rate",
      who: "Pre-revenue or under 2 years old. Show us the app or the site.",
      price: { NGN: 50000, USD: 60 },
      per: "one video",
      features: [
        "Up to 30s, scripted around your real features",
        "9:16 and 1:1 exports",
        "2 revision rounds, capped in writing",
        "Delivered in about 5 to 7 days",
        "Licensed music & fonts",
      ],
    },
    {
      id: "launch",
      name: "Launch Pack",
      tag: "Most chosen",
      who: "You are shipping. You want to look like the obvious choice on day one.",
      price: { NGN: 200000, USD: 249 },
      per: "launch pack",
      featured: true,
      features: [
        "Hero launch video, 45 to 60s",
        "3 cut-downs for TikTok, Reels & Stories",
        "Storyboard approved before animation",
        "9:16, 1:1 and 16:9 exports",
        "2 revision rounds, capped in writing",
        "Licensed music & fonts",
      ],
    },
    {
      id: "retainer",
      name: "Monthly",
      tag: "Always shipping",
      who: "A steady stream of feature drops, ads and updates.",
      price: { NGN: 300000, USD: 399 },
      per: "per month",
      features: [
        "4 videos every month",
        "One consistent look across all of them",
        "Priority turnaround",
        "2 revision rounds per video",
        "Pause or stop any month",
      ],
    },
  ],

  // The promises printed under pricing. These mirror the working rules in your business plan.
  promises: [
    ["Fixed price, in writing", "You see the full price and scope before you pay a naira."],
    ["Brief first", "A written brief you approve, so nobody guesses what you wanted."],
    ["50% to start, 50% on approval", "You pay the second half only when you are happy with the cut."],
    ["Revisions capped, not hidden", "Two rounds, stated up front. No surprise fees."],
  ],

  // TODO(human): replace null with your delivery promise as a [headline, detail] pair, e.g.
  // ["Delivered on the date we agree", "Your date is in the brief. ..."]  (2-3 lines, see Guidance below).
  // While this is null, the site simply shows the four promises above.
  deliveryPromise: null,
};

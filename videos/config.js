/* Blue Particle Studios, general video page (/videos/). Edit prices and copy here. */
window.BPS = {
  email: "blueparticlestudios@gmail.com",
  whatsapp: "2349061950587",
  whatsappDisplay: "0906 195 0587",

  // Wording used by the shared form script.
  waIntro: "Hi Blue Particle Studios, I'd like a video for my business.",
  subject: "Video enquiry",

  // Projects live in /motion/, so this page points at them instead of copying them.
  mediaBase: "../motion/media/",
  spiral: [
    { id: "second-life", label: "Second Life · App ad", count: 6 },
    { id: "title-fight", label: "Title Fight · Launch film", count: 6 },
    { id: "going-going", label: "Going, Going · App ad", count: 6 },
    { id: "two-halves", label: "Two Halves · Launch film", count: 6 },
  ],

  currency: "NGN",
  slotsOpen: null, // set to a true number to show "N slots open this month"

  tiers: [
    {
      id: "quick",
      name: "Quick Clip",
      tag: "One idea, fast",
      who: "A dish, an offer, an event, a new arrival. Perfect for restaurants, shops and salons.",
      price: { NGN: 40000, USD: 59 },
      per: "one video",
      features: [
        "15 to 20s vertical video (9:16)",
        "Animated from your photos, logo and menu",
        "Text, music and branding done for you",
        "2 revision rounds, capped in writing",
        "Delivered in about 3 to 5 days",
      ],
    },
    {
      id: "brand",
      name: "Business Promo",
      tag: "Most chosen",
      who: "Introduce your business properly. For companies, clinics, schools and brands.",
      price: { NGN: 120000, USD: 179 },
      per: "one video + cut-downs",
      featured: true,
      features: [
        "30 to 45s main video",
        "2 short cut-downs for Instagram & TikTok",
        "Scripted and storyboarded with you",
        "9:16, 1:1 and 16:9 exports",
        "2 revision rounds, capped in writing",
        "Licensed music & fonts",
      ],
    },
    {
      id: "campaign",
      name: "Campaign",
      tag: "Go big",
      who: "A launch, a new season, an admissions drive, a major event.",
      price: { NGN: 300000, USD: 449 },
      per: "campaign pack",
      features: [
        "60 to 90s hero film",
        "4 cut-downs for social and ads",
        "Storyboard approved before animation",
        "Every size you need",
        "2 revision rounds, capped in writing",
        "Licensed music & fonts",
      ],
    },
    {
      id: "monthly",
      name: "Monthly",
      tag: "Stay visible",
      who: "Fresh content every month without hiring a team.",
      price: { NGN: 250000, USD: 349 },
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

  promises: [
    ["Fixed price, in writing", "You see the full price and scope before you pay a naira."],
    ["Brief first", "A written brief you approve, so nobody guesses what you wanted."],
    ["50% to start, 50% on approval", "You pay the second half only when you are happy with the cut."],
    ["Revisions capped, not hidden", "Two rounds, stated up front. No surprise fees."],
  ],

  // Optional fifth promise, e.g. ["Delivered on the date we agree", "Your date is in the brief."]
  deliveryPromise: null,
};

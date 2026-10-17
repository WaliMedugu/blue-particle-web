/* Blue Particle Studios, home page. Prices here mirror /videos/config.js and /motion/config.js. */
window.BPS = {
  email: "blueparticlestudios@gmail.com",
  whatsapp: "2349061950587",
  whatsappDisplay: "0906 195 0587",
  waIntro: "Hi Blue Particle Studios, I'd like a video.",
  subject: "Video enquiry",

  mediaBase: "motion/media/",
  spiral: [
    { id: "second-life", label: "Second Life · App ad", count: 6 },
    { id: "title-fight", label: "Title Fight · Launch film", count: 6 },
    { id: "going-going", label: "Going, Going · App ad", count: 6 },
    { id: "two-halves", label: "Two Halves · Launch film", count: 6 },
  ],

  currency: "NGN",
  slotsOpen: null,

  // Used for the package dropdown in the contact form.
  tiers: [
    { id: "quick",    name: "Business · Quick Clip",     price: { NGN: 40000,  USD: 59  }, per: "", who: "", features: [] },
    { id: "brand",    name: "Business · Promo",          price: { NGN: 120000, USD: 179 }, per: "", who: "", features: [] },
    { id: "campaign", name: "Business · Campaign",       price: { NGN: 300000, USD: 449 }, per: "", who: "", features: [] },
    { id: "monthly",  name: "Business · Monthly",        price: { NGN: 250000, USD: 349 }, per: "", who: "", features: [] },
    { id: "student",  name: "Student · One video",       price: { NGN: 25000,  USD: 25  }, per: "", who: "", features: [] },
    { id: "startup",  name: "Startup · One video",       price: { NGN: 50000,  USD: 60  }, per: "", who: "", features: [] },
    { id: "launch",   name: "Startup · Launch Pack",     price: { NGN: 200000, USD: 249 }, per: "", who: "", features: [] },
    { id: "retainer", name: "Startup · Monthly",         price: { NGN: 300000, USD: 399 }, per: "", who: "", features: [] },
  ],

  promises: [
    ["Fixed price, in writing", "You see the full price and scope before you pay a naira."],
    ["Brief first", "A written brief you approve, so nobody guesses what you wanted."],
    ["50% to start, 50% on approval", "You pay the second half only when you are happy with the cut."],
    ["Revisions capped, not hidden", "Two rounds, stated up front. No surprise fees."],
  ],
  deliveryPromise: null,
};

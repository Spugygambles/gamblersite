// The terms of service, as sections of paragraphs and lists. Written for
// the site as it's planned; the company's legal name, where it's based and
// the support address are placeholders in SITE until they're settled, and
// a lawyer should read the whole thing before it goes live.

export const SITE = {
  name: "CsgoNeo",
  company: "CsgoNeo Ltd",
  support: "support@csgoneo.com",
  /** The state whose law the terms go by, and where disputes are heard. */
  state: "Maryland",
  county: "Baltimore County",
  updated: "October 28, 2026",
};

export type TermsBlock = string | { list: string[] };

export type TermsSection = {
  id: string;
  title: string;
  blocks: TermsBlock[];
};

export const TERMS: TermsSection[] = [
  {
    id: "about",
    title: "What these terms cover",
    blocks: [
      `These terms are the agreement between you and ${SITE.company} (“we”, “us”, “the Company”) for using ${SITE.name} (“the Site”), including every game, feature and service on it. They go together with our Privacy Policy, which explains what we do with your information, and the two together are the whole agreement between us about the Site.`,
      "By opening an account or using the Site in any way you accept these terms. If you don't agree with them, don't use the Site.",
    ],
  },
  {
    id: "eligibility",
    title: "Who can use the Site",
    blocks: [
      "You must be at least 18 years old, and old enough to enter a binding contract where you live, to use the Site. By using it you confirm that you are.",
      "Using the Site may not be legal where you are. It's your job to check the law in your country, state or region before you play. We may block the Site in places where we can't offer it, and we may ask you to prove where you live.",
      "You may hold one account. Accounts opened to get round a ban, a self exclusion or a limit will be closed.",
    ],
  },
  {
    id: "account",
    title: "Your account",
    blocks: [
      "You sign in through your Steam account, provided by Valve Corporation, and you may be asked for other details as well. Everything you give us must be true, current and complete.",
      "Your account is yours alone. Keep your sign-in details and any two-factor codes private, don't let anyone else use your account, and sign out when you're done on a shared or public computer. You're responsible for everything done on your account, whether by you or by someone you let in.",
      "If you think someone else has got into your account, change your password straight away and tell us at " + SITE.support + ".",
      "We can suspend, lock or close any account at any time, with or without a reason, including if we believe these terms have been broken.",
    ],
  },
  {
    id: "coins",
    title: "Coins, skins and what they're worth",
    blocks: [
      "The Site is for entertainment. You can add real money, or CS2 skins, to get coins, and coins are only for playing the games and using the features on the Site. Coins and other virtual items have no value outside the Site and can't be exchanged for cash except where the Site offers a withdrawal.",
      "Skins you win can be withdrawn to your Steam inventory through our trade bots. Trades go through Steam and are subject to Steam's own rules, including that Steam Guard must have been active on your mobile device for at least 15 days. That wait is Steam's, not ours, and items waiting on it don't expire.",
      "Prices for skins on the Site come from market data and move with it. The price shown when you buy, sell or withdraw is the one that applies.",
      "Every game outcome is decided by our provably fair system. If a glitch or an error in the interface shows something different, the provably fair result is the one that counts, and it may be corrected after the fact. A display error doesn't entitle you to an item or a payout.",
    ],
  },
  {
    id: "payments",
    title: "Deposits, withdrawals and checks",
    blocks: [
      "Only pay with money and payment methods that are yours. Using someone else's card, wallet or account is not allowed.",
      "Before a withdrawal, or if something about an account looks wrong (for example several payment accounts on one profile, a chargeback, or a cloned card), we may ask you to confirm your identity and the source of your funds, and we may hold the withdrawal until you do.",
      "Deposits and withdrawals may carry fees from the payment provider or network, which are shown before you confirm. We don't refund deposits that have been used to play.",
      "Payment providers and Steam have their own terms, and using the Site in a way that breaks them is a breach of these terms too.",
    ],
  },
  {
    id: "fair-play",
    title: "Playing fair",
    blocks: [
      "Don't do anything that damages the Site or gets in the way of other players. In particular, you must not:",
      {
        list: [
          "use bots, scripts, scrapers or any automated tool to play, to open accounts or to copy anything from the Site;",
          "exploit a bug, a glitch or a mistake in a price, or share a way to do so, instead of reporting it to us;",
          "work with other players to fix the result of a battle, a flip or any other game;",
          "attack the Site, probe its security, overload it or try to get into any part of it, its servers or its data that isn't yours;",
          "upload anything malicious, such as viruses or code designed to harm;",
          "pretend to be us, our staff, or another player;",
          "launder money, use the proceeds of crime, or use the Site for any unlawful purpose.",
        ],
      },
      "If we believe an account has done any of this we may void its bets, take back winnings, hold its balance while we investigate, close it and report what we find to the authorities, payment providers or Valve.",
    ],
  },
  {
    id: "chat",
    title: "Chat and anything you post",
    blocks: [
      "The Site has chat, profiles and other places you can post. What you post is yours to answer for, and it must be lawful and decent. Don't post anything that is abusive, hateful, threatening, sexual, spam, an advert, a scam, someone else's private information, or anyone else's work without their permission.",
      "By posting on the Site you give us the right to show, store, copy and remove what you post, in line with your account settings. We don't have to review posts before they go up, we may remove anything at our discretion, and we aren't responsible for what other players post.",
      "Chat can be read by other players. Don't share your personal or payment details in it.",
    ],
  },
  {
    id: "responsible",
    title: "Responsible gaming",
    blocks: [
      "Only play with money you can afford to lose. The Site offers limits and self exclusion in your account settings: self exclusion locks your account for the time you choose, and we won't lift it early, even if you ask.",
      "If gambling is becoming a problem for you or someone you know, our Responsible gaming page lists organisations that can help.",
    ],
  },
  {
    id: "ip",
    title: "Our content and trademarks",
    blocks: [
      `Everything on the Site that we made, including its design, code, text, artwork, sounds and the way they're put together, belongs to ${SITE.company} or our licensors and is protected by copyright, trademark and other laws. You may use it on the Site, for yourself, and nothing else: no copying, selling, modifying, reposting or building on it without our written permission.`,
      "Steam, the Steam logo, Counter-Strike and related marks are trademarks of Valve Corporation. We are not endorsed by, sponsored by or otherwise connected with Valve, and the Steam Subscriber Agreement applies to your Steam account and inventory on top of these terms. Other names and logos on the Site belong to their owners.",
      "If you believe something on the Site infringes your copyright, write to " + SITE.support + " with your contact details, what the work is, where on the Site it appears, a statement that you believe in good faith the use isn't authorised, and a statement under penalty of perjury that your notice is accurate and that you're the owner or acting for them. Repeat infringers lose their accounts.",
    ],
  },
  {
    id: "availability",
    title: "Changes and downtime",
    blocks: [
      "We can change, pause or shut down any part of the Site, including a game, a feature or a promotion, at any time and without notice, and we may put the Site into maintenance when we need to. We're not liable if the Site is unavailable for any period.",
      "Information on the Site is given for general purposes. We try to keep it accurate, but we don't promise it's complete or up to date, and anything you do on the strength of it is at your own risk. Links to other sites are for convenience: we don't control those sites and aren't responsible for them.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    blocks: [
      "We may update these terms from time to time. Changes take effect when they're posted on this page, with the date at the top, and using the Site after that means you accept them, so check back now and then. A change to the dispute section won't apply to a dispute we both already knew about before the change was posted.",
    ],
  },
  {
    id: "liability",
    title: "No warranty and limits on liability",
    blocks: [
      "THE SITE AND EVERYTHING ON IT ARE PROVIDED “AS IS” AND “AS AVAILABLE”, WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. WE DON'T PROMISE THAT THE SITE WILL BE ACCURATE, RELIABLE, UNINTERRUPTED, FREE OF ERRORS OR FREE OF VIRUSES, OR THAT DEFECTS WILL BE FIXED.",
      "TO THE FULLEST EXTENT THE LAW ALLOWS, NEITHER THE COMPANY NOR ITS OWNERS, STAFF, AFFILIATES, SUPPLIERS OR LICENSORS WILL BE LIABLE FOR ANY LOSS OR DAMAGE OF ANY KIND ARISING FROM YOUR USE OF, OR INABILITY TO USE, THE SITE OR ANYTHING OBTAINED THROUGH IT, INCLUDING INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, LOST MONEY, LOST PROFITS, LOST DATA OR DISTRESS, HOWEVER CAUSED, EVEN IF FORESEEABLE.",
      "Nothing in these terms limits any liability or removes any right that the law says can't be limited or removed.",
      "You agree to cover us, and anyone working with us, for any claim, loss, cost or legal fee that comes from your breaking these terms, your use of the Site, or anything you post on it.",
    ],
  },
  {
    id: "disputes",
    title: "Disputes",
    blocks: [
      "If you have a problem, write to " + SITE.support + " first: most things can be sorted out that way, and we'll work with you to try.",
      `Otherwise, any dispute between you and the Company about these terms, the Privacy Policy or the Site, including whether a dispute can be arbitrated, will be settled by final and binding arbitration under the rules of the American Arbitration Association, in ${SITE.county}, ${SITE.state}. Arbitration replaces going to court: there's no judge or jury, discovery is limited to what the arbitration rules allow, and claims can only be brought on your own behalf, never as part of a class or group action.`,
      "You can opt out of arbitration by writing to " + SITE.support + " within 60 days of first accepting these terms, with your account name and a clear statement that you reject the arbitration clause. After that, the clause stands.",
      `These terms are governed by the law of the State of ${SITE.state}, without regard to its conflict of law rules. Any court case that's allowed under these terms must be brought in the state or federal courts for ${SITE.county}, ${SITE.state}, and you accept those courts' jurisdiction, though we may bring a claim against you for breaking these terms where you live.`,
      "Any claim you have against us under these terms must be started within one year of the events that gave rise to it, or it is barred for good.",
    ],
  },
  {
    id: "general",
    title: "The small print",
    blocks: [
      "If we don't enforce part of these terms at some point, that doesn't mean we've given it up. If a court finds part of these terms can't be enforced, that part is cut down or removed to the minimum needed and the rest stays in force.",
      "You can't hand this agreement, or your account, to anyone else. We may assign our rights and obligations under it to an affiliate or a successor without asking you.",
      "Parts of these terms that by their nature should outlive your account, such as the limits on liability, the dispute rules and our rights over content, keep applying after it's closed.",
      "You agree that we can send you notices, including service announcements and administrative messages, through the Site and by email, that these count as being in writing, and that you can't opt out of the ones about your account. You can opt out of promotional messages at any time by following the link in them or emailing " + SITE.support + ".",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [`Questions about these terms, support requests and feedback all go to ${SITE.support}. Thanks for playing on ${SITE.name}.`],
  },
];

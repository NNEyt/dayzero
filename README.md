# Day Zero

**The lights go out. Nobody has the whole picture.**

Day Zero is a co-operative crisis game for 1–8 players (best with 3–6) around one shared screen. Kelderwick has lost power. You are the neighbours who end up running the Mill Lane community hall for a long, cold weekend. Each of you plays a role (📻 Theo, 📦 Ines, ✚ Pavel, 🏠 Marta, and with 5–8 players 👟 Kit, 🫖 Bea, 🔧 Dev and 🏛️ Grace). Each role sees different information, some verified and some just rumour. Talk, decide, and try to keep everyone safe.

It's a static site: plain HTML, CSS and JavaScript, no build step and no server. It runs on GitHub Pages.

## Play

- **Latest version:** `index.html`, the site root.
- **Rules:** [`rules.html`](rules.html), a short, player-friendly how-to-play page with a “Teach it in 2 minutes” box. It's also linked from the title screen.
- **Playtest kit:** [`playtest.html`](playtest.html) prints on A4: a host checklist, one feedback card per player (`?players=6&names=Alex,Priya`) and an observer sheet.
- **Every older version:** [`versions.html`](versions.html). The original game is now at `dayzero1.html`. 2.0–2.3 and the classic 2.4 build each keep their own path and their own save.
- **Phones as controllers (optional):** in *TV + phone controllers* mode, each player scans a QR code and their phone becomes their controller (`play.html`): private cards, secret goal, their own actions and secret votes. Anyone without a phone plays on the TV, as usual. See [Phone controllers](#phone-controllers) below.
- **Phones as briefings (optional):** the older *TV + phone briefings* mode still works. Each player scans a QR code to read their private briefing on `phone.html`; there's no connection and everything else happens on the TV.
- **Campaign (optional):** three linked episodes, *Blackout*, *The Water Week* and *Who Had the Key?*. See [Campaign](#campaign).

### How a game runs

1. Type the players' names, choose **Full weekend** (about 60–75 min) or **Quick Night** (about 30 min), and press **Play**.
2. **The cold open:** the lights go out, a phone rings, and you have a first problem in front of you within about two minutes. Rules are taught as they come up, through one-off 💡 tips.
3. Each chapter: read the story, read your role cards, hold the council, settle any **dilemma** (by secret vote if you like), choose your actions, then watch what happened and how time moves on.
4. The game ends with **the Mill Lane Chronicle**, a newspaper front page about your game. It comes with an emoji summary you can share. The answer key is hidden behind "Show what you missed".

### Game options (⚙️ on the title screen)

| Option | Default | What it does |
|---|---|---|
| Screens | TV only | *TV only*: everyone reads the role briefings on the TV. *TV + phone briefings*: private briefings by QR code (no connection needed). *TV + phone controllers*: phones connect to the TV and become controllers. |
| Difficulty | Normal | **Easy**: more supplies, slower clocks, neighbours rally twice and the "Later" consequences are shown. **Normal**: as written. **Hard**: less fuel and goodwill, faster clocks, no rescue. |
| Personal goals | On | After Chapter 1, everyone privately gets something they're quietly hoping for. Goals are revealed and scored in the Chronicle. |
| Secret votes | On (2+ players) | On big decisions, pass the device round and vote in private, then watch the staged reveal. Ties go to the role that owns the decision. A unanimous vote of 3+ players gives Cohesion +1. You can always decide together on screen instead. |
| 🕵️ The Insider | **Off** | 3+ players, ages 12+. One player is secretly working against the hall. They get a quiet sabotage choice (up to twice) in secret votes. At the end everyone accuses someone. Evidence you found during the game rules people out. |
| Town seed | random | A 4-character code such as `K7Q2`. It decides which bridge floods, how true the tanker rumour is, what the "thieves" really were, when the tower runs dry, three extra rumours, the Crossroads event cards and the personal goals. Share `…/?seed=K7Q2` and friends get the same town. |

### 5–8 players and younger players

With five or more names, four extra roles join in this order. If you tick 🧒 next to a name, that player gets a kid role first.

| Role | For | What they do |
|---|---|---|
| 👟 Kit, the Runner | 🧒 kids (about 7–11) | One action, picked from 2–3 big buttons with short words: run messages, hand out torches, fetch Mr Osei, carry water up the tower. |
| 🫖 Bea, the Host | 🧒 kids | One action from big buttons: tea and biscuits, stories for the little ones, blankets, a hot drink for Mrs Petrova. |
| 🔧 Dev, the Mechanic | anyone | Generator tuning (saves fuel), the pump, the radio mast, a bike courier. |
| 🏛️ Grace, the Liaison | anyone | Official channels: checks, the council warden, the depot gate, relaying to the town, a briefing for the hall. |

Each new role has its own intel cards in every chapter, so a big table still has things nobody else knows. Bigger tables start a little leaner (5+ players: Supplies −1; 7+: Fuel −1) to keep the pressure about the same. The kid roles have fewer, simpler choices and never see Insider or sabotage text.

## Phone controllers

Choose **Screens → TV + phone controllers**. After you press Play, the TV shows a lobby with a QR code for each player. Scan yours and your phone becomes your controller:

- your private cards each chapter (tap “I've read my cards”)
- your secret goal (and whether you're the Insider)
- your own actions (younger players get big buttons), with lock-in and “change my actions”
- secret votes, including the private note, and the final accusation

The TV shows who's connected and who's done, and every phone step has an “on this screen” button, so a player without a phone, a flat battery or a dropped connection never holds the game up. If the link fails, the TV says so and offers **Play without phones**.

**How it works, and the trade-off.** The site stays fully static. The TV and phones talk directly over a WebRTC data channel using [PeerJS](https://peerjs.com/) (MIT, vendored in `vendor/`). The free public PeerJS broker (`0.peerjs.com`) is used only to introduce the devices to each other. Google's public STUN servers and PeerJS's free TURN relay help them reach each other. The TV is the host and the only source of truth. Each phone link carries a random per-player key, and the TV checks every message (right player, right phase, legal action) before using it. No game data is stored online.

| Option considered | Verdict |
|---|---|
| **PeerJS + public broker (chosen)** | No account, no backend, works on GitHub Pages, reconnects automatically. It depends on a free third-party service that has no uptime guarantee. |
| Manual WebRTC offer/answer by QR | No third party at all, but each phone would have to show a QR code back to the TV, and TVs and laptops usually have no camera. |
| Public MQTT / WebSocket test brokers | Unencrypted and shared with strangers, and also no uptime guarantee. |
| Firebase / Supabase / Ably | Reliable, but needs an account, API keys and a quota: a backend in all but name. |

**Limits:**
- It needs internet access on the TV and the phones, even when they're on the same Wi-Fi.
- Some strict networks (corporate, school, some hotel Wi-Fi) block WebRTC. The TURN relay usually gets round this, but not always.
- If the PeerJS broker is down, the lobby says so and you play on the TV.
- A phone that sleeps or reloads rejoins with the same link. Its state comes back from the TV.
- In a campaign, the next episode keeps the same room as long as the names are the same, so phones stay connected.

## Campaign

**🎬 Campaign** on the title screen plays three episodes with the same household, a few months apart:

1. **Blackout** (November): the original crisis, condensed.
2. **The Water Week** (January): the tower runs dry and the tanker rumours return.
3. **Who Had the Key?** (March): the sabotage question finally gets an answer.

Each episode uses a different set of chapters with its own cold open, and shows a **“Previously on Day Zero…”** recap first. Choices carry over: whether Mr Aldous was saved, whether the stores were opened, what you told the hillside, whether you caught the tanker lie, clues about the key, and more. Each carried flag changes the next episode, for example starting stock, trust, a clock or a line of story. Episode 3 ends with **the Inquiry**, which uses the clues you gathered across all three episodes, then a campaign table and badges.

Progress is saved in `localStorage` under `dz_campaign`. You can copy a campaign code from the title screen and paste it on another device.

## Visual style: "Torchlight"

The look is a UK street during a power cut: deep navy night, warm torch-amber highlights and paper-coloured cards for anything you need to read.

- **Palette:** night surfaces (`#0a0f1e` → `#222e4d`), torch amber (`#ffc24a`) for actions and headings, paper (`#f7f0df`) with dark ink for story text and cards. Red, green and violet are kept for danger, success and secrets. Every text/background pair used meets WCAG AA (body text is 10:1 or better; the smallest coloured labels are at least 4.7:1).
- **Type:** [Atkinson Hyperlegible](https://brailleinstitute.org/freefont) for everything you read, chosen for young readers and low vision. Barlow Condensed for headings and buttons, upright rather than italic. Georgia for story prose. UnifrakturMaguntia for the Chronicle masthead. The scale steps are 14 / 16 / 18 / 21 / 26 / 32 / 48 px, slightly smaller on phones.
- **Components:** cards, panels, buttons and spacing all come from the same tokens in `dz-theme.css` (an 8-px spacing scale; 10/14/20 px radii). Buttons are at least 48 px tall, and kid buttons at least 56 px. Focus rings are visible for keyboard players.
- **Icons and art:** `dz-art.js` draws an inline SVG icon set for the eight roles, the town resources and the mission. Threat clocks are drawn as segmented rings with a plain-words caption ("Clock 2 of 3", "Nearly full!"). It only decorates what the game has already rendered; no game logic changes. `art/skyline.svg` is a quiet silhouette of Kelderwick behind every screen, with one warm window: the hall.
- **Phones:** `dz-phone.css` gives `play.html` and `phone.html` a mobile-first layout: a sticky header with connection status, big tap targets and a bottom toolbar for "My cards" and "My goal".
- **Offline-safe:** fonts are self-hosted in `fonts/` (SIL OFL, see `fonts/OFL.txt`). There are no external CDNs. Older versions (`dayzero1.html` … `dayzero24.html`) keep their original look.
- **Motion:** `prefers-reduced-motion` still switches off every animation.

**Sound:** effects and a quiet wind are synthesised with the WebAudio API. There are no audio files, so there's nothing to license. 🔊/🔇 in the corner turns sound on and off, and the setting is remembered. Staged reveals can be skipped (⏭). If your device asks for reduced motion, the animations are switched off.

## Files

| File | What it is |
|---|---|
| `index.html` | The latest game. It loads the files below in order. |
| `dz-main.css`, `dz24.css`, `dz-juice.css` | Base styles, 2.4 card and briefing styles, and styles for the new screens and animations |
| `rules.html`, `playtest.html`, `dz-docs.css` | Player rules page and printable family playtest kit (Torchlight styles, A4 print CSS) |
| `dz-theme.css`, `dz-phone.css`, `fonts/`, `art/skyline.svg` | The Torchlight theme (TV and phone), self-hosted fonts and the background skyline |
| `dz-art.js` | Inline SVG icons for roles and resources, and ring-shaped threat clocks (presentation only) |
| `story21.js`, `story23.js` | Story chapters, breaks, council scenes and result prose (shared with 2.1–2.4) |
| `dz24.js`, `qr24.min.js` | TV and phone briefings, order screen, QR codes (MIT, see `qr24-LICENSE.txt`) |
| `dz-content.js` | Roles, intel cards, extra rumours, personal goals, seeded randomness and variants. Shared with `phone.html`. |
| `dz-core.js` | The 2.4 rules engine: threats, actions, dilemmas, resolution, endings |
| `dz-variety.js` | New-game setup, difficulty, Quick Night, Crossroads events, goal scoring |
| `dz-roles.js` | Roles 5–8 (Kit, Bea, Dev, Grace), role assignment, kid-friendly order buttons, big-table balance |
| `dz-campaign.js` | The three-episode campaign: episodes, carried flags, “Previously on”, the Inquiry, badges |
| `dz-live.js` | Phone controllers, TV side: PeerJS host, lobby, message checks, live panels |
| `play.html` | Phone controllers, phone side |
| `vendor/peerjs.min.js` | PeerJS 1.5.5 (MIT, see `vendor/peerjs-LICENSE.txt`) |
| `dz-views.js` | Title, cold open, briefings, council, time passing, render loop |
| `dz-vote.js` | Private goal deal, secret votes, the Insider accusation |
| `dz-chronicle.js` | The Mill Lane Chronicle and share line |
| `dz-juice.js` | Sound, mute toggle and staged reveals |
| `phone.html` | A private phone briefing, plus the player's secret goal when they have one |
| `dayzero1.html` … `dayzero24.html`, `dayzero24-phone.html`, `preview/` | Older versions, kept as they were (with banner and link fixes) |
| `tools/sim.js` | Headless test that plays complete games (see below) |

## Run it locally

Any static file server works. Opening the file directly also works in most browsers, but phones and QR codes need a real URL.

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

## Testing

`tools/sim.js` plays complete games in jsdom by pressing the real buttons. It covers every difficulty × length × screen mode (TV, phone briefings, phone controllers) × Insider setting × player count (1–8, with kid players). In controller mode it swaps PeerJS for a fake network: some players join from "phones" that answer at random moments, drop out and rejoin, and the rest use the TV fallbacks. It reports errors, broken text ("undefined", "NaN"), stuck screens, endings, collapse rates, goal hit rates and how quickly the cold open reaches the first decision.

```sh
python3 -m http.server 8765 &      # from the repo root
cd tools && npm install jsdom@24
node sim.js 3 smart                 # 3 games per configuration, sensible players
node sim.js 1 random                # chaotic players
node sim.js 5 smart '{"diff":"hard","len":"quick"}'   # filter configurations
DZ_PLAYERS='[5,6,7,8]' node sim.js 3 smart           # choose player counts
DZ_SUITE=campaign node sim.js 2 smart                # play episodes 1→3 back to back
```

`tools/phone-test.js` (Playwright) tests the phone link with three separate browser contexts: a TV, an adult phone and a kid phone, all running the real `index.html` and `play.html`. It plays a whole game, including a phone reload mid-game. Set `DZ_BRIDGE=1` where WebRTC is blocked (some CI sandboxes). The data channel is then replaced by a relay through the test script, and everything else runs for real.

Saves are stored in the browser's `localStorage` under `dayzero_save_main`. The sound setting is under `dz_muted`, the last setup under `dz_last_setup` and campaign progress under `dz_campaign`.

# Day Zero

**The lights go out. Nobody has the whole picture.**

Day Zero is a co-operative crisis game for 1–4 players (best with 3–4) around one shared screen. Kelderwick has lost power. You are the neighbours who end up running the Mill Lane community hall for a long, cold weekend. Each of you plays a role (📻 Theo, 📦 Ines, ✚ Pavel, 🏠 Marta) and each role sees different information, some verified and some just rumour. Talk, decide, and try to keep everyone safe.

It's a static site: plain HTML, CSS and JavaScript, no build step and no server. It runs on GitHub Pages.

## Play

- **Latest version:** `index.html`, the site root.
- **Every older version:** [`versions.html`](versions.html). The original game is now at `dayzero1.html`. 2.0–2.3 and the classic 2.4 build each keep their own path and their own save.
- **Phones (optional):** in *TV + phones* mode, each player scans a QR code to see their private briefing on `phone.html`.

### How a game runs

1. Type the players' names, choose **Full weekend** (about 60–75 min) or **Quick Night** (about 30 min), and press **Play**.
2. **The cold open:** the lights go out, a phone rings, and you have a first problem in front of you within about two minutes. Rules are taught as they come up, through one-off 💡 tips.
3. Each chapter: read the story, read your role cards, hold the council, settle any **dilemma** (by secret vote if you like), choose your actions, then watch what happened and how time moves on.
4. The game ends with **the Mill Lane Chronicle**, a newspaper front page about your game. It comes with an emoji summary you can share. The answer key is hidden behind "Show what you missed".

### Game options (⚙️ on the title screen)

| Option | Default | What it does |
|---|---|---|
| Screens | TV only | *TV only*: everyone reads the role briefings on the TV. *TV + phones*: private briefings by QR code. |
| Difficulty | Normal | **Easy**: more supplies, slower clocks, neighbours rally twice and the "Later" consequences are shown. **Normal**: as written. **Hard**: less fuel and goodwill, faster clocks, no rescue. |
| Personal goals | On | After Chapter 1, everyone privately gets something they're quietly hoping for. Goals are revealed and scored in the Chronicle. |
| Secret votes | On (2+ players) | On big decisions, pass the device round and vote in private, then watch the staged reveal. Ties go to the role that owns the decision. A unanimous vote of 3+ players gives Cohesion +1. You can always decide together on screen instead. |
| 🕵️ The Insider | **Off** | 3–4 players, ages 12+. One player is secretly working against the hall. They get a quiet sabotage choice (up to twice) in secret votes. At the end everyone accuses someone. Evidence you found during the game rules people out. |
| Town seed | random | A 4-character code such as `K7Q2`. It decides which bridge floods, how true the tanker rumour is, what the "thieves" really were, when the tower runs dry, three extra rumours, the Crossroads event cards and the personal goals. Share `…/?seed=K7Q2` and friends get the same town. |

**Sound:** effects and a quiet wind are synthesised with the WebAudio API. There are no audio files, so there's nothing to license. 🔊/🔇 in the corner turns sound on and off, and the setting is remembered. Staged reveals can be skipped (⏭). If your device asks for reduced motion, the animations are switched off.

## Files

| File | What it is |
|---|---|
| `index.html` | The latest game. It loads the files below in order. |
| `dz-main.css`, `dz24.css`, `dz-juice.css` | Base styles, 2.4 card and briefing styles, and styles for the new screens and animations |
| `story21.js`, `story23.js` | Story chapters, breaks, council scenes and result prose (shared with 2.1–2.4) |
| `dz24.js`, `qr24.min.js` | TV and phone briefings, order screen, QR codes (MIT, see `qr24-LICENSE.txt`) |
| `dz-content.js` | Roles, intel cards, extra rumours, personal goals, seeded randomness and variants. Shared with `phone.html`. |
| `dz-core.js` | The 2.4 rules engine: threats, actions, dilemmas, resolution, endings |
| `dz-variety.js` | New-game setup, difficulty, Quick Night, Crossroads events, goal scoring |
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

`tools/sim.js` plays complete games in jsdom by pressing the real buttons. It covers every difficulty × length × screen mode × Insider setting × player count. It reports errors, broken text ("undefined", "NaN"), stuck screens, endings, collapse rates, goal hit rates and how quickly the cold open reaches the first decision.

```sh
python3 -m http.server 8765 &      # from the repo root
cd tools && npm install jsdom@24
node sim.js 3 smart                 # 3 games per configuration, sensible players
node sim.js 1 random                # chaotic players
node sim.js 5 smart '{"diff":"hard","len":"quick"}'   # filter configurations
```

Saves are stored in the browser's `localStorage` under `dayzero_save_main`. The sound setting is under `dz_muted`.

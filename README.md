# Japa Life

A Sims-style life game about Nigerians in the UK. Play the journey (work visa, student visa, or desert and sea), then build a life in a living city: work, eat out at real Nigerian restaurants, party, run side hustles and businesses, and chat with characters and real players.

## Folders

- `site/` is the playable game. Netlify publishes this folder (see `netlify.toml`).
- `src/` is the source, split into readable files:
  - `data.js`: cities, venues, restaurants, jobs, gigs, businesses, dialogue
  - `engine.js`: time, needs, actions, events, money
  - `biz.js`: gigs board and business simulation
  - `social.js`: conversations and live player chat
  - `draw.js`: flat and venue scenes
  - `citymap.js`: the isometric city map
  - `story.js`: the opening story (Chapter 1 and 2)
  - `ui.js`: screens, phone apps, controls
  - `shell.html`: page layout and styles

## Making changes

1. Edit files in `src/`.
2. Run `python3 build.py` to rebuild `site/index.html`.
3. Bump `VERSION` in `site/sw.js` (for example `japa-life-v9`) so installed phones update.
4. Commit and push. Netlify redeploys automatically.

## Hosting

Connect this repository in Netlify: Add new site → Import an existing project → GitHub → pick this repo. The publish folder is set by `netlify.toml`.

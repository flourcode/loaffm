# Loaf FM · loaffm.com

A tiny pixel cat that keeps you company while you work: an LED clock radio playing its own generated lofi music, with a cat on the desk who wanders, naps, watches her own little sky, and purrs when you pet her.

Plain static files. No build step, no server code, no API keys, no cookies, no analytics, no location.

## Put it online

**GitHub Pages**
1. Create a repository and upload everything in this folder (so `index.html` is at the root).
2. Settings → Pages → Deploy from a branch → `main`, `/ (root)`.
3. Settings → Pages → Custom domain: `loaffm.com` (the `CNAME` file is already here). Tick *Enforce HTTPS* once it's offered.
4. At your registrar, point the domain at GitHub Pages (four `A` records for the apex plus a `CNAME` for `www`; GitHub's Pages docs list the current addresses).

Cloudflare Pages or Netlify work the same way: upload the folder, add the custom domain. HTTPS is required for installing it as an app.

After launch, add the site in Google Search Console and submit `https://loaffm.com/sitemap.xml`.

## What's here

```
index.html                 the board and a short introduction
privacy.html  terms.html  404.html  analytics.js  studio.html
board.js  board.css        the board: clock, cat, music and sounds, sky, and page-swapping navigation
site.css                   shared styles
fonts/                     Fraunces (headlines), IBM Plex Sans (text), Doto (wordmark); self-hosted, OFL
manifest.webmanifest  sw.js  icons/   install-as-app and offline
og.png                     the preview image for shared links
robots.txt  sitemap.xml  CNAME
```

## How the pages fit together

Every page is a complete HTML file with the board at the top. Following a link inside the site swaps only `<main id="page">`, so the radio keeps playing and the cat keeps doing what she was doing. If you edit pages by hand, keep the header, the `boardwrap` block and the footer identical across pages.

## Float

The window button (computers only) floats the board above other apps. Chrome and Edge use Document Picture-in-Picture: the real clock and desk move into the floating window, so the cat stays interactive. Safari gets a video picture-in-picture of the clock and desk. Firefox and phones don't offer it, so the button is hidden there.

Mute works from the floating window too: a speaker button in its corner (Chrome/Edge) or Safari's own pause button. The speaker icon beside the main volume slider shows the same state and unmutes after you bring her back. Mute only lasts for the visit; moving the volume slider also unmutes.

## Sit and the calm sounds

**Sit** (the chunky Z button) is twenty minutes with the cat asleep beside you, then two unhurried minutes. The dots along the desk edge are the timer, a soft low tone marks the end, and she gets a fish when it's over.

**Treats**: the fish button drops a fish onto the desk near her (up to four at a time). She walks over, eats it while purring and giving off hearts, then purrs contentedly for a few seconds. Nothing is counted or saved.

**Palettes**: six tiles under the board. **Pegs** (default) is a glowing pegboard: round plastic-peg rendering with a highlight on each cap, small holes in black paper, every digit its own colour, a rainbow desk line, pegs pushed in at slightly uneven depths, and every four minutes a chance of one peg in the wrong colour or a stray peg off on its own. The others are mostly one colour, like the old displays they're modelled on, each with a warm glint here and there: Teal VFD (a stereo display), Amber (a clock radio), Phosphor (a terminal), Moonlight (for late at night) and Ember (a red LED by the fire). Each is a small ramp (unlit dots, shadow, mid, main, highlight, one warm accent) defined in `PALETTES` at the top of board.js; the cat's shadow side uses the mid tone, her forehead and muzzle the highlight, and her inner ears the accent. The palette with id `crt` is shown as Phosphor (the id is kept so saved choices still work). **Purr, Rain, Ocean, Fireplace and Brown noise** are generated in the browser with the Web Audio API, so they work offline and never buffer. None of them is a loop (see `SOUNDS` in board.js): drops, waves, crackles and breaths are each scheduled a few seconds ahead with their own random timing and size. They're tuned for focus and meditation: no sharp attacks or loud one-offs (the loudest 50 ms of a minute sits within about 4 dB of the typical level, except the ocean's slow swells), and their levels are matched so switching between them doesn't jump. Ocean brings a slow wave every ten seconds or so, with a hush of foam on the bigger ones; rain is a soft wash with a light patter; the fireplace is a slowly flickering roar with sparse, soft crackles. If no radio station can be reached, Play falls back to the purr.

## The sky

No location needed: stars and the real moon phase after 8 p.m., the season from the date (flipped for southern-hemisphere time zones), and a weather pick per day (about one day in six rains; in winter, snow is common). To preview, add `?sky=rain`, `snow`, `leaves`, `petals` or `fireflies` to the URL, and `&night` for the moon.

## Contact address

`hello@loaffm.com` appears in the footer, the home page and the privacy and terms pages. Search and replace if you use a different one.

## Credits

All music and sounds are generated in the browser (see below); there is no live radio and no third-party audio, so there is nothing to license or credit.

## Her behaviour

Besides walking, sitting and sleeping she has a few idle moments, picked at random (`act()` in board.js): loafing, grooming, yawning, glancing about (with an ear twitch), and looking up when there's weather or it's night. When she wakes she yawns and stretches. She also has a cardboard box at the left end of the desk (`BOX` in board.js, always tan whatever the palette): she sometimes hops in on her own and peeks over the rim, ducking now and then; tapping the box sends her to it; anything that makes her walk (a treat, a tap on the desk, the end of a sit) makes her hop out first. Her ears have one accent-coloured pixel inside each (pink on Pegs). After ten minutes with no pointer or key activity on the page (or in the floating window) she curls up and dozes; the next movement wakes her, and she yawns, stretches and walks over.

## Loaf FM's own stations

`MUSIC` and `music()` in board.js (also kept readable in `dk-src/parts/music.js`): five generative stations, Late Shift, Rainy Window, CRT Dreams, Sunday Loaf and Desert Night. Every sound is synthesised in the browser (FM electric piano, detuned-saw pads, sine/triangle bass, synthesised kick/snare/hats/brushes, FM bells, a square-wave arpeggiator, crickets, tape hiss), so there are no samples and nothing to license: the music is yours. A conductor schedules bars a few seconds ahead: it picks a key per session, chord progressions from small hand-written sets (with voice leading), comping and bass rhythms, and moves between sections (intro, keys alone, groove, a little melody, breakdown), changing progression every few minutes. Everything runs through a warm low-pass, gentle tape saturation, a soft compressor and a small generated reverb, with a slow shared "tape wow". To add a station, add an entry to `STYLES` and `MUSIC`.

Tuned for focus, following the listening research: few sudden changes (changing-state sounds are what disrupt concentration most), moderate tempos (58–80 BPM) and levels (fast and loud music is what hurts reading comprehension), no tremolo near 4 Hz (where wavering sounds grab attention most) and no buzzy 15–300 Hz flutter, a darker top end, sparse and mostly stepwise melodies, drums with loose human timing that fade in and out over a couple of bars instead of switching on and off.

## Turning on analytics

Analytics are **off**. Every page loads `analytics.js`, which does nothing while `GA_MEASUREMENT_ID` is empty: no requests, no cookies. To switch on Google Analytics 4:

1. Create a GA4 property and a web data stream for loaffm.com. In the stream's enhanced measurement settings, leave "Page changes based on browser history events" on: that's how pages swapped in without a reload get counted. In Admin, turn Google Signals off and set data retention to the minimum you need.
2. Update `privacy.html` **before** deploying the ID (the privacy page currently, and truthfully, says there are no analytics and no cookies):
   - Lede: replace "sets no cookies, runs no ads and no analytics" with "runs no ads, and uses Google Analytics to count visits".
   - Add a section after "What's stored, and where":
     > **Analytics.** We use Google Analytics to see how many people visit and which pages they use. It sets cookies (`_ga`, `_ga_*`) to tell visits apart, except in the EEA, the UK and Switzerland, where it runs without cookies. IP addresses aren't stored by Google Analytics, advertising features are off, and we don't combine this with anything else. If your browser sends Do Not Track or Global Privacy Control, Loaf FM doesn't load Google Analytics at all. Google's policy: https://policies.google.com/privacy
   - Add a row to the services table: `Google Analytics | Every page view | Page address, referrer, device and browser type, approximate location from IP`.
   - Remove "We don't use cookies" style lines anywhere else, and change the date at the top.
3. Paste the Measurement ID into `analytics.js` and deploy. Bump `CACHE` in `sw.js` so installed copies pick it up.

## Before adding ads or affiliate links

- **AdSense** sets advertising cookies, needs the privacy page to describe Google's ad cookies and personalised ads, and in the EEA, the UK and Switzerland needs a Google-certified consent banner (CMP). `analytics.js` already denies all advertising storage by default; a CMP would update consent.
- **Amazon Associates**: put the line "As an Amazon Associate I earn from qualifying purchases." on the site, and a short disclosure right next to the links themselves (for example "Affiliate link: I may earn a commission"). Write your own descriptions; don't copy Amazon's prices, ratings, reviews or photos by hand. Keep recommendations on a normal web page rather than inside the board.

## Broadcast mode (YouTube videos and livestreams)

Add `?broadcast=video` or `?broadcast=live` to the address and the page becomes just the board, centred in a 16:9 frame on a dark background: no header, controls or text, no cursor, and the sound starts by itself where the browser allows it (OBS does; in a normal browser you get a "Click to start the sound" button). The cat never dozes off waiting for a mouse, a treat drops on its own every 25 minutes or so, and nothing is saved to the viewer's settings.

- **Uploaded videos** (`broadcast=video`): no clock or date, which would be wrong by the time anyone watches. The big digits show the station's frequency, with STEREO underneath.
- **Livestream** (`broadcast=live`): the frequency up top and the real time on the small line, in one time zone (Pacific by default, labelled PT). Her sky and the evening dimming follow that zone too.

Frequencies: Late Shift 88.3, Rainy Window 91.7, CRT Dreams 94.1, Sunday Loaf 97.5, Desert Night 102.9, and for the calm sounds Purr 89.9, Rain 90.5, Ocean 93.3, Fireplace 99.1, Brown noise 100.7 (`FREQ` in board.js). They're fictional; never pair them with call letters.

Options: `station=late|window|crt|sunday|desert|purr|rain|ocean|fire|brown`, `palette=pegs|teal|amber|crt|moon|ember`, `tz=America/Los_Angeles` (any IANA zone) with `label=PT` to override the label, `rotate=60&stations=late,window,desert` to change station every 60 minutes with a short fade, `vol=0.8`, `case=light` for the light case, `treats=0`, `dim=0` to turn off evening dimming.

Examples:
- `https://loaffm.com/?broadcast=video&station=window&palette=teal`
- `https://loaffm.com/?broadcast=live&tz=America/Los_Angeles&rotate=60&stations=late,window,sunday,crt,desert`

**Studio:** open `/studio.html` (for example https://loaffm.com/studio.html) to set all of this with buttons and menus, see a live preview, and copy the finished address. It isn't linked from the site, is marked noindex and is disallowed in robots.txt, so search engines leave it alone; it remembers your last settings in your own browser.

**OBS:** add a Browser source with that URL, width 1920, height 1080, and tick "Control audio via OBS" so the music goes into the stream. For an uploaded video, record from OBS for as long as you like; the music is composed as it plays, so every recording is different. Don't register the music with YouTube Content ID: generative music can resemble other tracks enough to cause false claims.


## No keyboard shortcuts

Deliberately none (no Space, M or Z): people type in other windows, especially after petting her in the floating window, and a stray key must never stop the music or start a sit. All controls are real buttons, so Tab and Enter still work.

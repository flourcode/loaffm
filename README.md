# Loaf FM · loaffm.com

A tiny pixel cat named Loafie who keeps you company while you work: an LED clock radio playing its own generated lofi music, with a cat on the desk who wanders, naps, watches her own little sky, and purrs when you pet her.

Plain static files. No build step, no server code, no API keys, no location. Google Analytics counts visits (cookieless in the EEA, UK and Switzerland, and off for Do Not Track / Global Privacy Control); see `analytics.js` and the privacy page.

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
fonts/                     Doto (headlines, bold; wordmark, black), IBM Plex Sans (text); self-hosted, OFL
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

## The keyboard

Loafie stands on a keyboard: the two rows under the desk edge are 32 white keys (C2 to G6), each three dots and a gap, with the gaps in the top row filled where a black key sits. Every melodic note both engines play calls `keyHit(ctx,time,midi)` (ignored for offline renders), and `drawKeys()` lights that key for 0.45 s as the note sounds, folding notes outside the range by octaves. On Pegs the lit keys take rainbow colors; other palettes use their highlight.

## Controls

The main row is play, station, volume, DISPLAY, MIXTAPE, SLEEP, the fish, Twenty minutes and Float. DISPLAY opens a panel under the controls with the six palettes (with names) and brightness; it closes on a second tap, a tap elsewhere, or Escape. Anything that's on glows: the playing key, an open DISPLAY, an active SLEEP, a sit, Float, the chosen palette and the chosen mixtape options.

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

## Analytics

Google Analytics is on, with Measurement ID `G-0Y62CW4XDM` in `GA_MEASUREMENT_ID` in `analytics.js`; the privacy page describes it. To turn it off, empty that value and deploy. In the GA4 data stream, leave enhanced measurement's "Page changes based on browser history events" on (that counts pages swapped in without a reload), turn Google Signals off, and set data retention to the minimum you need.

## Deploying an update

Just upload the changed files. No version bump is needed: the service worker always fetches from the server first (revalidating rather than trusting the browser cache), so anyone online gets the new version on their next visit, and installed copies refresh their offline files as they go. Only change `CACHE` in `sw.js` if you change how `sw.js` itself caches.

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

## The sky

While something plays, the sky goes with it (`STATION_SKY`): rain for Rainy Window and Rain; stars and a meteor every 11 s or so (three times in four) for Late Shift, Desert Night, Ocean and Fireplace; falling green code with a sideways wobble and the odd scanline glitch for CRT Dreams; falling leaves for Sunday Loaf; plain for Purr and brown noise. A tape follows its weather (rain, stars for ocean and fire, plain for purr) or, with no weather, its band. When nothing plays, the sky follows the season, the day and the moon. `?sky=stars|matrix|leaves|rain|snow|petals|fireflies|plain` forces one for testing.

## Mixtapes

`+ Make a mixtape…` in the station list opens the deck inside the case (`openMixtape()` in board.js). A mixtape is five choices plus a name and a label color: **vibe** (`v`: Lo-fi, Bossa Nova, House, Ambient, 8-bit), **mood** (`m`: Sunny, Moody, Late Night), **groove** (`g`: Lazy, Pocket, Move), **sound** (`s`: Studio, Cassette, Vinyl, Next Room) and **weather** (`w`: none, rain, ocean, fire, purr). Tapes are played by `band()`, separate from the five stations' `music()`:

- **Bands** (`BANDS`): each vibe has its own instruments and patterns. Lo-fi is the stations' electric piano, boom-bap and round bass. Bossa Nova is a nylon guitar (Karplus-Strong plucked strings, three takes per note, tuned for the loop's N−½-sample period: the thumb on root and fifth, the fingers on the clave rhythm, anticipating the next chord), shaker, rim click, a soft kick and flute. House is restrained deep house: four on the floor, quiet offbeat open hats, claps (a rim click when Lazy), a sub bass between the kicks, soft organ chord stabs (Rhodes when Sunny) with a gentle pump on every kick, and a mallet lead with a dotted echo. Ambient has no drums: long pads, a low drone, a few glassy notes and a five-second room. 8-bit is pulse-wave arpeggios and lead (with the old fake echo), a triangle bass and stepped-noise drums.
- **Mood** picks the scale and chord progressions for that band (Sunny is major/Lydian, Moody minor, Late Night jazzier changes or Dorian), and Late Night is also 10% slower, four semitones lower, darker and roomier, with fewer hi-hats.
- **Groove** picks the tempo and swing per band (lo-fi 72/82/90 BPM, bossa 110/124/138, house 114/120/124, ambient 52/60/68, 8-bit 92/116/136) and how busy the drums, bass and comping are.
- **Sound** is the recording chain after the band (`RECORDING`): drive into a tanh saturator, high-pass, two low-passes, a low shelf, a compressor, plus hiss, vinyl crackle, and tape wow and flutter from a short delay whose time drifts (so drums and noise wobble too, as on real tape). It changes live (`update()`), with no restart. **Weather** goes straight to the output, not through the recording: it's in your room, not on the tape.
- **The name is the tune.** The name (lowercased) seeds the key, the two chord progressions (the A and B sections of each 32 bars) and a two-bar hook (`makeHook()`): a short cell, the same cell moved a step, and a long note to land on. The hook plays every 8 bars, fitted to whatever chord is under it, and the players improvise little phrases made from it in between, so a tape is recognisably the same every time without ever looping. The same name in a different band plays the same tune.
- Every 32 bars there's a four-bar breakdown (drums out). Changing vibe, mood, groove or weather re-cuts the tape with a quick crossfade; renaming re-cuts once you stop typing.
- Levels: each band (`TAPE_LEVEL`) and each sound (`REC_LEVEL`) is matched by measured loudness (approximate K-weighting) to the stations, and the weather layers are scaled to stay as loud as on the stations.

The deck has two views. **Build** shows the five rows, the name, label color and Roll tape; every tap plays right away. **Make tape** saves it and switches to the **finished tape**: a big cassette, name, frequency and band · mood · groove, with Play, Share and Make another (Copy link, Download card, Change it and Delete below). Sharing only exists on a kept tape, so nobody shares a tape they haven't saved. A tape opened from someone's link lands on the finished view with **Keep this tape** instead of Share. Editing a kept tape saves as you go (the button reads Done). New tapes are drafts until made; kept tapes (up to 10, in localStorage) save as you edit. Copy link encodes the recipe as `?tape=…` (base64url JSON `[2,name,color,v,m,g,s,w,freq]`, validated and clamped on load, name rendered as text only). Version 1 links and tapes from before vibes still load: they become Lo-fi with the same mood and weather, the nearest groove (from their old speed) and Cassette (or Next Room if their tone was very muffled). Broadcast mode accepts `&tape=…` too, and the studio page has a field to paste a mixtape link. Each tape gets a free frequency when it's made (stored as `f`, carried in links), so renaming it doesn't move it on the dial. A new mixtape starts playing as soon as it's created; a shared link waits for a tap on play, as browsers require. The cassette is drawn in LED dots with Loafie in the window; the reels turn while it plays.

`window.loafBand` is exposed so a tape can be rendered in an OfflineAudioContext for testing and level matching.

The unsaved draft is kept in localStorage too (`S.draft`), so a refresh restores it as "(not saved)". Opening someone's link while you have your own unsaved draft moves yours into your saved tapes first (if there's room).

**Roll tape** picks a random vibe, mood, groove, sound and weather (`rollRecipe()`) and, unless you've typed your own name, a random name (`rollName()`). Rolling a saved tape starts a new draft rather than changing the saved one.

**Download card** and **Share** use `tapeCard()`: a 1200×630 PNG drawn on a canvas with the cassette, the tape's frequency, a snapshot of the board and desk, and loaffm.com. Link previews can't show a mixtape, because crawlers don't run the page, so the card does that job. The card is made in the background whenever the tape changes, so Share can open the share sheet straight from the tap. Share only appears where `navigator.share` exists, and attaches the card when the browser can share files. Nothing is uploaded. The site's own `og.png` comes from the same function (`window.loafCard`), with a "Rainy Sunday" tape at 93.7.

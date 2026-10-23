# Loaf FM · loaffm.com

A tiny pixel cat named Loafie who keeps you company while you work: an LED clock radio playing its own generated lofi music, with a cat on the desk who wanders, naps, watches her own little sky, and purrs when you pet her.

## The one rule: never break the flow

Loaf FM is a joyful, casual toy. Nothing anyone does here should knock them out of the vibe. When adding or changing anything, check it against these:

- **Never refuse.** An action does what it says. Saving always saves (at the 50-tape limit the oldest tape quietly makes room); nothing answers a tap with an error, a limit or a form.
- **Nothing opens that wasn't asked for.** A key that changes something changes it in place (DISPLAY steps to the next look; it doesn't open a tray). The only thing that changes shape is the tape deck, when you press MAKE A MIXTAPE (or REMIX).
- **Don't talk over the music.** The board's station line stays the station line: no toasts, no name flashes, no "done!" messages. The change itself is the feedback (a key lights, the board recolours, the tape changes).
- **No dead ends and no steps.** Every key is live (lit = playing, unlit = available), there's no wizard and no confirm screen, and the only question ever asked is "tap again to delete".
- **No clutter on the board.** Nothing big hangs in the sky or over Loafie (there's no moon).
- **Subtract before adding.** The product is: put on music, pet the cat, mess with a few layers, save a tape. Anything that doesn't serve that goes.
- **Music keeps playing** through everything: changing the mix re-cuts with a crossfade, never a stop.

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

**FLOAT** (the last key in the row, computers only; hidden where the browser can't do it) floats the board above other apps. Chrome and Edge use Document Picture-in-Picture: the real clock and desk move into the floating window, so the cat stays interactive (pet her, fish, Z). Safari gets a video picture-in-picture of the clock and desk. Firefox and phones don't offer it, so the key is hidden there.

Mute works from the floating window too: a speaker button in its corner (Chrome/Edge) or Safari's own pause button. The speaker icon beside the main volume slider shows the same state and unmutes after you bring her back. Mute only lasts for the visit; moving the volume slider also unmutes.

## Z and the calm sounds

**Z** is a cat thing, not a mode: tap it and Loafie curls up for a nap (in her box, if she's in it); tap Z again, or touch anywhere on the board (clock or desk), and she wakes, yawns, stretches and carries on (`napStart()`, `napEnd()`). The touch that wakes her only wakes her. No timer and no tone; the music carries on. A fish or calling her over wakes her too. There's no sleep timer, no 20-minute sit and no manual dim any more; the board still dims a little on its own after dark (`nightDim()`). Old saved `brightness`, `sitStart` and `mtSeen` values are deleted on load, so nobody is left dim or with a cat stuck asleep.

**Treats**: the fish button drops a fish onto the desk near her (up to four at a time). She walks over, eats it while purring and giving off hearts, then purrs contentedly for a few seconds. Nothing is counted or saved.

**Palettes**: three, stepped through by the DISPLAY key, all built from the colours already on the case. **808** (`pegs`, the default) is the drum machine's step-key colours, red `#e8392b`, orange `#f08a24`, yellow `#f2d14d` and cream `#f4ecd8`, as glowing pegs: each digit its own colour, the desk line running red-orange-yellow-cream. **VFD** (`teal`) is a vacuum-fluorescent receiver, cyan with orange, the same as the tuner readout. **Red LED** (`red`) is the bedside clock radio: red seven-segment glow, low glare, for late nights and CALM. Each has its own meter ramp (`meter` in `PALETTES`: 808 yellow → orange → red, VFD dark cyan → cyan → orange, Red LED deep red → red → pale red). Amber, Moonlight, Phosphor and Ember are still defined so saved settings and broadcast links keep working, but aren't offered (`SHOWN_PALETTES`).

**The display follows the music** until you choose one yourself, but only when you tap a starting track in the deck (opening the deck never changes it): Lo-fi switches to Red LED, House and 8-bit to 808, Ambient to VFD (`TRACK_PALETTE`, `autoPalette()`). Tapping a palette sets `S.palettePicked` and from then on it never changes behind your back. **Outside tints it** while that layer is playing (`tint()`): rain adds a few cool reflections, fire warm orange-red glints low on the board, ocean a little aqua, purr a faint cream and pink around Loafie. Take the layer out and the tint goes.

**Purr, Rain, Ocean, Fireplace and Brown noise** are generated in the browser with the Web Audio API, so they work offline and never buffer. None of them is a loop (see `SOUNDS` in board.js): drops, waves, crackles and breaths are each scheduled a few seconds ahead with their own random timing and size. They're tuned for focus and meditation: no sharp attacks or loud one-offs (the loudest 50 ms of a minute sits within about 4 dB of the typical level, except the ocean's slow swells), and their levels are matched so switching between them doesn't jump. Ocean brings a slow wave every ten seconds or so, with a hush of foam on the bigger ones; rain is a soft wash with a light patter; the fireplace is a slowly flickering roar with sparse, soft crackles. If no radio station can be reached, Play falls back to the purr.

## The board

**The mix is the hero.** While something plays, the big clock steps aside: the time shrinks to the top line (`7:17 PM · 88.3 FM … STEREO`), the track name takes the whole width in the big letters, the 16-band meter runs the full width under it, and the cat has the desk. With nothing playing it's a clock radio again (big digits, the date, and Loafie's line on the right). Broadcast mode keeps its own layout.

**Loafie listens** (`groove`, read off the sound itself in `vu()`, so it works for every station and tape: a kick is the low bars falling back and jumping, a hat the same up top). On a kick she dips a pixel (two on the 8-bit start) when she's sitting, walking or loafing; a hat flicks an ear now and then; on an ambient groove (no drums, Desert Night, the calm sounds) she loafs and dozes more; on 8-bit she stays up and about. `grooveKind()` says which.


The clock and the desk are one LED board: they meet with no strip between them (one bezel goes round the outside of both), the dot rows run straight on (on phones too, and in Float, broadcast mode and the share card), and every empty cell on both is a faint lit peg in the palette's background colour (`FIELD` in `drawGame()`, the same as the clock), so the cat, the weather and the treats all move through pixels.

While something plays, the right side shows the frequency, STEREO, the name and a 16-band meter. A name that doesn't fit in the big letters drops to the small ones, on two lines if it has to (the meter gets two rows shorter), and only crawls if even that won't fit, so the meter never disappears. The meter is an 80s LED spectrum display: chunky bars with a gap between them (6 px pitch on the full-width hero board, 4 px on the narrow one), green for the bottom four rows, amber above, red for the top row, whatever the palette, with a peak cap that hangs for a moment. It reads a 256-point analyser in sixteen log-spaced bands (bass left, sparkle right); each band keeps its own floor and ceiling, so every bar uses its whole height, snaps up on the beat and falls back slowly; the curve is steep enough that it sits mostly green and only hits red on the loud bits.

## The keyboard

Loafie stands on a keyboard: the two rows under the desk edge are 32 white keys (C2 to G6), each three dots and a gap, with the gaps in the top row filled where a black key sits. The keys stay dark: they used to light with the melody (`keyHit()` is still called by the engines and now does nothing), but lit keys read as the cat stepping on them.

## Controls

Keep behaviours, remove controls. On a computer the row is PLAY/STOP, the dial, volume, DISPLAY, the fish (orange, a goldfish), Z and FLOAT; on a phone it's PLAY/STOP and the dial, then DISPLAY, the fish and Z (no volume: phones have buttons; no Float). DISPLAY steps to the next palette.

**The tuner** is an 80s digital receiver: a dark glass readout with the band and position in orange (`FOCUS · 2/5`), the frequency big and the name in glowing cyan, ◀ ▶ hardware keys either side, and three band keys under it that are also the three ways to use Loaf FM: **FOCUS** (the five music stations), **CALM** (purr, rain, ocean, fire, brown noise) and **TAPES** (your mixtapes, with a count on the key so they're never hidden; with none it shows + and opens the deck). Tapping a band tunes to where you last were in it; tapping the lit band steps to the next. The real `<select id="station">` is still there, visually hidden, for keyboard and screen-reader users and the tests (`bandOf()`, `bandList()`, `paintDial()`, `dialTune()`, `dialStep()`).

**CALM breathes.** On a calm sound the meter becomes a breathing light (`breath()`): a bar that swells for four seconds and shrinks for six, no labels.

There is no performance control (a DROP key was tried and cut: it didn't earn its place).

**First visit**: Pegs, tuned to Late Shift. It plays straight away only if the browser allows sound without a tap (`getAutoplayPolicy`, or the audio context coming up `running`); otherwise it waits, tuned, for Play (on the radio or under the cassette) or MAKE A MIXTAPE. The play key reads from the audio context (`playing()`), so it never shows Stop while the browser is holding the sound; tapping it then just releases the sound. Returning visitors keep their own station and palette.

**12:00.** A fresh browser session opens with the clock blinking 12:00 for about four seconds, like every VCR nobody ever set (`blink12`). Any tap, or pressing play, stops it; reduced motion skips it.

**Her entrance**: once per browser session (`sessionStorage.loafIn`), Loafie is peeking over her box from the first frame, hops out at about 1.15 s and walks to the keyboard. Reduced motion skips it. Touching the desk before she's out finishes the hop at once (`endEntrance()`) and then does what you touched.

## The sky

No location needed: stars after 8 p.m. (no moon), the season from the date (flipped for southern-hemisphere time zones), and a weather pick per day (about one day in six rains; in winter, snow is common). To preview, add `?sky=rain`, `snow`, `leaves`, `petals` or `fireflies` to the URL, and `&night` for the moon.

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

Options: `station=late|window|crt|sunday|desert|purr|rain|ocean|fire|brown`, `palette=pegs|teal|red|amber|crt|moon|ember`, `tz=America/Los_Angeles` (any IANA zone) with `label=PT` to override the label, `rotate=60&stations=late,window,desert` to change station every 60 minutes with a short fade, `vol=0.8`, `case=light` for the light case, `treats=0`, `dim=0` to turn off evening dimming.

Examples:
- `https://loaffm.com/?broadcast=video&station=window&palette=teal`
- `https://loaffm.com/?broadcast=live&tz=America/Los_Angeles&rotate=60&stations=late,window,sunday,crt,desert`

**Studio:** open `/studio.html` (for example https://loaffm.com/studio.html) to set all of this with buttons and menus, see a live preview, and copy the finished address. It isn't linked from the site, is marked noindex and is disallowed in robots.txt, so search engines leave it alone; it remembers your last settings in your own browser.

**OBS:** add a Browser source with that URL, width 1920, height 1080, and tick "Control audio via OBS" so the music goes into the stream. For an uploaded video, record from OBS for as long as you like; the music is composed as it plays, so every recording is different. Don't register the music with YouTube Content ID: generative music can resemble other tracks enough to cause false claims.


## No keyboard shortcuts

Deliberately none (no Space, M or Z): people type in other windows, especially after petting her in the floating window, and a stray key must never stop the music or start a sit. All controls are real buttons, so Tab and Enter still work.

## The sky

While something plays, the sky goes with it (`STATION_SKY`): rain for Rainy Window and Rain; stars and a meteor every 11 s or so (three times in four) for Late Shift, Desert Night, Ocean and Fireplace; falling green code with a sideways wobble and the odd scanline glitch for CRT Dreams; falling leaves for Sunday Loaf; plain for Purr and brown noise. A tape follows its weather (rain, stars for ocean and fire, plain for purr) or, with no weather, its band. When nothing plays, the sky follows the season, the day and the moon. `?sky=stars|matrix|leaves|rain|snow|petals|fireflies|plain` forces one for testing.

## The pages

The home page is the hero line, the board and Make a mixtape, and nothing else: a cassette J-card (`.sleeve`) with one line of copy, the tag boxes and a *Liner notes →* link, then the A1 liner note about the deck. Everything else (Loafie, the stations, the looks, her sky, floating, offline, nerd stuff, credits, the catch, say hi) lives on `notes.html` ("Liner notes", built by `home.py` from `notes_body`, linked from the sleeve, the A1 note and the footer, in the sitemap and the service worker shell). `/#nerd` is now `notes.html#nerd`.

## Mixtapes

**The tape deck** sits on the case under the controls, with no box of its own. Normally it's the *now playing* view: a big cassette for whatever is on (each station has its own shell and a line about it, `STATION_TAPE`; your tapes have theirs), reels turning while it plays (pixel reels with four spokes stepping round the hub, a 22.5° step every third of a second; on the in-between steps the reel's corners go dark too, which breaks the light between the spokes into short blades, because otherwise those frames draw a hooked cross), with the title, the frequency and one obvious next step in orange: PLAY if nothing's playing; on a station MAKE A MIXTAPE ("Start from Late Shift, add a layer or two, save the tape."); on your tape SHARE, with RENAME and REMIX, and *New tape*, *Save as picture* and *Delete tape* as small text; on an unsaved mix SAVE TAPE and KEEP MIXING; on a friend's tape PLAY and KEEP THIS TAPE. It follows the radio: change station and it changes cassette. On a computer it's left-aligned with the board, cassette left and words right; on a phone it stacks, centred. Tap your own cassette for another shell.

MAKE A MIXTAPE slides the cassette into the deck (a bottom sheet on a phone, with Loafie still in view above it) with music already playing, seeded from whatever was on (`SEED`): Late Shift → Lo-fi, Rainy Window → Lo-fi + Rain, CRT Dreams → 8-bit, Sunday Loaf → Lo-fi + Purr, Desert Night → Ambient, and the calm sounds bring their Outside layer along (Rain, Purr, Fire; Ocean comes with Ambient). ✕ (Done mixing) goes back to the now-playing view; changing station does too. The deck is only this:

- **START WITH** Lo-fi · House · Ambient · 8-bit: the groove (drums, tempo, feel) and the starting keys. Bass and Outside you've added stay when you switch. Tapping one is also the only thing that moves the display to its palette (Lo-fi → Red LED, House → 808, Ambient → VFD, 8-bit → 808), until someone picks a palette by hand (`S.palettePicked`). Opening the deck never changes the display.
- **BASS** Warm · Deep · Synth, **KEYS** Rhodes · Pad · 8-bit, **OUTSIDE** Rain · Purr · Fire: tap unlit to add or swap, tap lit to take it out. (Older tapes with Guitar or Ocean still play, and show that key.)
- **● REC · SAVE TAPE**.

The starting recipes (`BASES`) are a little incomplete on purpose, so the first layer goes "ohhh" and the second "ohhhh yeah": Lo-fi is the soft groove and Rhodes; House is house drums and Pad; Ambient is no drums, Warm bass and Pad; 8-bit is the chip groove and 8-bit keys. No beat row, no pace and no name field while mixing. The tape sits in the deck the whole time, straight on the case with no frame around it, like the finished one (on a computer, on the left of the keys; on a phone, above them), labelled with the name it would get, reels turning while it plays; tap it for another of the eight shells (`SHELLS`).

Late Shift's own little motif (the stations use `music()`, not the tape engine) now changes one note now and then and moves on to a new motif more often, so it doesn't sit on the same five notes.

**The deck is a rhythm composer.** While you build, the deck turns into a charcoal drum-machine panel (`.mixtape.building`): cream printed labels, dark channel keys that light orange-red, the four START WITH pads in the 808 step-key colours (red, orange, yellow, white), and under the cassette a **PATTERN** display. That's a 5 × 16 grid, BD · SD · HH · BS · KY, showing the current bar's hits (red kicks, orange snares, yellow hats, white bass and keys), a running light stepping through the sixteenths in the same four colours, and a readout: `TEMPO 120 · BAR 003 · STEP 02`. Nothing here is programmable: it's the machine showing you what it's playing. The engine logs every drum, bass and key hit it schedules (`hits` and `keyHits`, read by `seqFrame()` on animation frames, keyed to the audio clock and the engine's `tStart`/`barDur`), so the grid is exact, including swing and fills, and the lit cell on the running step is the hit sounding now.

**SAVE TAPE is the payoff**: the tape names itself (`autoName()`: "Rainy Friday", "Deep Tuesday Night", "Pixel Sunday"), keeps the shell you've been looking at (picked at random when the tape was started), and pops out big, reels turning, with its frequency. Then **SHARE** (the system share sheet with the link and the card, or copies the link), **KEEP PLAYING**, **RENAME** (never changes the music) and **REMIX**, with *Save as picture* and *Delete tape* (asks once) as small text. Tap the cassette for another shell. A tape opened from someone's link shows **PLAY** and **KEEP THIS TAPE**.

**Layers are independent** on every tape made now (`i:1`): the starting track alone sets the drums, groove and tempo, and only the 8-bit start uses the chip kit, so House + Synth bass + 8-bit keys is house drums at house tempo with a synth bass and 8-bit keys. Older tapes and links (`i:0`) keep their old sound, where 8-bit keys also put the drums through the chip kit and sped things up.

Every key press re-cuts the tape with a quick crossfade. **The name is only the name**: each tape gets a random music seed when it's created (`r`, carried in the link) that picks the key, the mood, the chords and the hook. Tapes from before the seed keep using their name as the seed, and keep their tune.

`band()` plays it (the five stations keep their own `music()`):

- **Feel.** The drums set the feel: soft (gentle kick, rim click, brushes, shaker) and lo-fi (boom-bap through a cassette) share the lo-fi feel; house is four on the floor with offbeat hats and a gentle pump on the other parts. With no drums the parts play freely. The 8-bit start puts the drums through a chip kit and pushes the tempo up a little (on old tapes, 8-bit keys did). Tempo comes from the drums and the starting track's pace (`TEMPO`, `SWING`).
- **Bass** follows the chords (the boom-bap line, or offbeats with octave jumps over house). Warm is round, Deep is a sub, Synth is a plucky saw-and-square (a triangle on the 8-bit start).
- **Keys** comp in the feel: Rhodes chords and re-hits; nylon Guitar (Karplus-Strong) fingerpicks, or chops offbeats over house; Pad swells under glassy notes (with no drums at Slow or Easy it becomes ambient: long pads, a drone, a big room); 8-bit arpeggiates on a pulse wave. Keys off means no tune, just the groove.
- **The seed is the tune.** It picks the key, one of three moods (`HARMONY`), two chord progressions (the A and B halves of each 32 bars) and a two-bar hook (`makeHook()`), the tape's signature. The B half has a hook of its own, and every 64 bars a new B hook comes in (from `seed + ':b' + n`, a separate random stream, so older tapes keep their tunes), so a tape left playing for an hour keeps moving while still sounding like itself. The hook doesn't repeat verbatim either: in each run of four it plays as written, then with a new last note, then rests while the keys improvise, then a step higher. Notes aren't pentatonic: the moods are diatonic scales with 7th and 9th chords, and every melody note is pulled onto the chord underneath it (`fit()`), which is why any combination sounds right.
- **NEW TUNE ↻** in the deck re-rolls the seed (`r`): a new key, mood, chords and hook with the same layers and name. That's the only knob for the tune.
- Fills go into each new section, and every 32 bars there's a four-bar breakdown with the drums out. Levels: one `TAPE_LEVEL`, matched to the stations, plus a little make-up gain when drums, bass or keys are off.

The unsaved draft is kept in localStorage too (`S.draft`), so a refresh restores it as "(not saved)". Opening someone's link while you have your own unsaved draft moves yours into your saved tapes first. Kept tapes (up to 50) save as you edit. The link encodes the recipe as `?tape=…` (base64url JSON `[7,name,color,d,b,k,w,p,freq,start,seed]`; 7 means independent layers, 6 is the same fields with the old coupling, validated and clamped on load, name rendered as text only). Older links and tapes still load and are brought up to date (versions 4 and 3 map their beats and keys onto the layers; 2 and 1 become the nearest parts at the nearest speed). Broadcast mode accepts `&tape=…` too, and the studio page has a field to paste a mixtape link. Each tape gets a free frequency when it's made (`f`), so renaming it doesn't move it on the dial.

## The look


**The stripes.** Red `--s1 #ef2a0c`, red-orange `--s2 #f2520f` and orange `--s3 #f6860b`, straight off an 80s tape sleeve, the same in light and dark: three little bars after the logo; the intro is a cassette J-card (`.sleeve`: an italic kicker, the big title, an outlined LF-83 badge over stacked stripes, outlined label boxes, and the stripes sweeping up out of the bottom-right corner); the page is a tracklist (`.trk` boxes A1 to A5, a striped SIDE B divider, B1 to B6); the A1 liner note and the footer sit under stripe bars; and on the radio case the AM/FM legend and the tape deck's label each get a tiny stripe badge. The orange of SAVE TAPE, PLAY and SHARE is the stripe orange.

**Every page is a tape.** The liner notes, the privacy and terms pages, the 404 and the studio all open with the same J-card header as the home page (`.sleeve.sleeve-sm` in `tpl.py`: kicker, LF-83 badge, stripes), their h2s carry a tiny stripe bar, and nothing on the site is a pill button any more (`.hw-link` for links that look like keys). Dark is the default; the warm beige "day" scheme only appears when the visitor's system asks for light.

**Copy.** Short and casual, for people who want something on while they work and like to mess with beats. No sales pitch and no data talk on the home page (that's what the privacy page is for); "What's the catch?" sits near the bottom of Side B.
The radio is an object from 1983–1988 consumer electronics, and the page around it follows: off-white plastic in light mode (`#f7f7f5` page, `#ebebe8` case, white sleeves), nearly-black stereo gear in dark, set in `applyScheme()` regardless of palette (the palette tints the accents). Buttons are square-ish hardware keys with a raised edge and printed Doto legends; a few keys have coloured plastic legends (`--c-orange` the next step under the cassette (PLAY, MAKE A MIXTAPE, SHARE, SAVE TAPE), `--c-cyan` DISPLAY and the lit starting track, `--c-mint` for lit layers). Tiny printed labels do some world-building: LOAF FM · MODEL LF-83 · AM/FM STEREO · AUTO STOP under the controls, SIDE A, REC and NORMAL BIAS on the deck. On the home page a couple of sections are printed like cassette liner notes (`.liner`) and an instruction sticker (`.sticker`). Body copy stays IBM Plex Sans so it's readable; Doto carries the interface.

## Phones

Phones get the same one board as computers: one dot size for the clock and the desk, no zoom (the old zoomed-desk camera, `ZOOM`/`camMove()`, is still in the code but switched off). The case padding and bezel are a little thinner so the board is as wide as it can be; on a 390 px phone a dot is about 2.7 px and Loafie about 37 px wide. On a touch screen her pet target is a thumb wide (`COARSE` in `catHit()`), and the first time a small "Pet Loafie" bubble bobs just above the desk, pointing down at her, until the first pet (`S.petSeen`). The controls are play and station on one line, then DISPLAY, the fish and Z. The homepage intro is one short line on phones; the longer paragraphs show on wider screens.

`window.loafBand` is exposed so a tape can be rendered in an OfflineAudioContext for testing and level matching.

**Save as picture** and **Share** use `tapeCard()`: a 1200×630 PNG drawn on a canvas with the cassette, the tape's frequency, a snapshot of the board and desk, and loaffm.com. Link previews can't show a mixtape, because crawlers don't run the page, so the card does that job. The card is made in the background whenever the tape changes, so Share can open the share sheet straight from the tap. Share only appears where `navigator.share` exists, and attaches the card when the browser can share files. Nothing is uploaded. The site's own `og.png` comes from the same function (`window.loafCard`), with a "Rainy Sunday" tape at 93.7 (Lo-fi, Warm bass, Rhodes, Rain). Every page's `og:image` and `twitter:image` carry `?v=20261023` so link previews fetch the new picture; bump it whenever `og.png` changes.

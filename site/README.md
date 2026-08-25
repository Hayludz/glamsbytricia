# Glams by Tricia — website

Five pages. No build step, no framework, no dependencies — plain HTML, one
stylesheet, one script. Open any page in a browser and it works.

```
site/
  index.html      home
  about.html      the artist
  services.html   prices, sticky showcase, FAQ
  gallery.html    portfolio
  contact.html    booking
  styles.css      all styling and animation
  script.js       split-text, scroll reveals, parallax, page curtain, menu, FAQ
  assets/img/     logo, cut-outs and photography (WebP)
```

Every page carries its own copy of the header and footer. If you change a nav
link or the footer, change it in all five files.

## Putting it online

Drag the whole `site` folder onto **[netlify.com/drop](https://app.netlify.com/drop)**
— it publishes in about ten seconds and gives you a free link. Vercel, Cloudflare
Pages and GitHub Pages work the same way. On ordinary web hosting, upload the
contents of `site/` to the root of the account.

To preview locally:

```bash
python -m http.server 5173 --directory site
```

Then open http://localhost:5173

## Bookings

Every "Book" opens WhatsApp on **+234 704 454 1099** with the message already
typed, and each service sends its own wording so you can see what was tapped:

> Hi Patricia, I will like to book the Full Glam service

TikTok links point to **@tricia_glam_**.

If the number ever changes, search each `.html` file for `2347044541099` and
replace every occurrence.

## Editing prices or services

Services appear in three places on `services.html` — the sticky showcase, the
summary list, and the quick-pick chips in the booking block — plus the chips on
`contact.html` and three cards on `index.html`. Update the price everywhere it
appears.

To change a price, search for the old figure (for example `15,000`) and replace
it. To rename a service, also update the words after `text=` in its WhatsApp
link: spaces become `%20` and commas become `%2C`.

## Swapping photographs

Put the new file in `assets/img/`, then change the `src` on the `<img>`, its
`alt` description, and the `width`/`height` to the real pixel size (those two
stop the page jumping while images load).

Save photos as WebP around 1100–1800px wide. Large files are slow on mobile data.

The cut-outs (`cut-01` … `cut-04`) are transparent PNG exports converted to WebP.
They are used at their native 434px, so replacing them with higher-resolution
cut-outs would sharpen the hero on retina screens.

## Animation notes

- Headlines split into individual characters at load and rise out of a mask.
  Add `class="split"` and, to control line breaks, `data-split="First|Second"`.
- `class="reveal"` fades an element up as it scrolls in; `data-d="2"` staggers it.
- `class="mask"` wipes an image in; `class="zoom"` slowly settles it from a
  slight scale-up.
- `data-parallax="0.05"` moves an element against the scroll. Negative values
  move the other way. Backgrounds use larger numbers than foregrounds.
- `data-sparkle="6"` scatters that many drifting gold motes inside a section.
- `data-magnet` makes a button lean toward the cursor.

All of it is disabled automatically when the visitor has "reduce motion" turned
on, and the pages still read normally with JavaScript switched off.

## Colour and type

Every colour and font size is a variable at the top of `styles.css` under
`:root`, so the whole palette and type scale can be retuned from one place.
`--fs-hero`, `--fs-h1` and `--fs-h2` control the big display sizes.

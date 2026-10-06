# Sri Krishna Teja Kamma — Digital Resume

A responsive, animated static portfolio built with HTML, CSS, and vanilla JavaScript. Includes all seven employers, seven detailed contribution profiles with domain filters, ten searchable skill areas, original animated GIF artwork, the supplied portrait, and a complete printable resume generated from `Resume.txt`.

## Open the website

Open `index.html` directly in your browser, or run `npm start` and visit `http://127.0.0.1:8080`. No dependency installation is required. The email and phone links open your device’s email and calling applications.

## Build for hosting

Run `npm run build`. Upload the contents of `dist/` to any static website host. The build regenerates `resume.html` from the original `Resume.txt` and copies the site into `dist/`.

Edit `index.html` for the portfolio content, `assets/css/style.css` for appearance, and `assets/js/main.js` for interactions. Update `Resume.txt` and rebuild to update the full resume. Portfolio summaries are maintained separately in `index.html`.

## Animation and accessibility

The custom sphere and neural-network GIFs are stored locally, with PNG stills used when reduced motion is requested or the footer’s motion control is switched off. This preference is saved locally when browser storage is available. The page includes keyboard navigation, visible focus states, native expandable details, a mobile menu, and screen-reader announcements for filtering and copying.

Google Fonts enhances the typography when connected; local Arial and Georgia fallbacks keep the website usable offline. Core functionality uses no external services. The complete resume includes a Print / Save as PDF button.

## Regenerate the artwork

With Python and Pillow installed, run `python scripts/create-animations.py`, then `npm run build`. Both GIFs are original procedural artwork, not third-party embeds.

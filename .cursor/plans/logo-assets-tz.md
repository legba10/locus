## Goal
Prepare site for final LOCUS logo and icons. No generation — only blocks and file references. User drops images into /public.

## Plan
- [x] Layout: metadata.icons (favicon.ico, favicon-32.png, favicon-16.png, apple-touch-icon logo-locus-icon.png)
- [x] public/LOGO-ASSETS-README.txt: list required filenames (logo-locus.png, logo-locus-header.png, logo-locus-icon.png, favicon.ico, favicon-32.png, favicon-16.png)
- [x] HeaderLight: locus-logo div + img /logo-locus-header.png (height 32px); remove Logo component import
- [x] Burger: .burger-btn with 3 spans; CSS .burger-btn span (24px×2px, #7B4AE2, margin 5px 0)
- [x] Mobile menu: menu-logo div + img /logo-locus.png at top; CSS .menu-logo padding, img 140px
- [x] HomePageV6 hero: hero-logo div + img /logo-locus.png under h1; CSS .hero-logo img 120px, margin 0 auto 20px
- [x] globals.css: .locus-logo img, .menu-logo, .menu-logo img, .hero-logo img, .burger-btn span

## Verification
- Logo blocks and paths in place; 404 for images until user adds files to /public
- Favicon links via Next.js metadata
- Burger toggles menu; no SVG, 3 spans only
- Responsive unchanged (md:hidden burger, desktop nav unchanged)

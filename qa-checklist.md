# QA Checklist

Go through every item before showing the client. Check the box when done.

## SEO
- [ ] Page title set (business name + location + primary service keyword)
- [ ] Meta description set (under 160 chars, includes phone number)
- [ ] Open Graph tags (og:title, og:description, og:url, og:type, og:site_name)
- [ ] Twitter Card tags (twitter:card, twitter:title, twitter:description)
- [ ] Canonical URL set
- [ ] robots.txt in public/ (updated with correct sitemap URL)
- [ ] sitemap.xml in public/ (updated with correct domain)
- [ ] Schema markup component added (LocalBusiness, FAQPage, Service entries)
- [ ] Geo meta tags if local business (geo.region, geo.placename)

## Favicon & Branding
- [ ] Favicon swapped to client logo (NOT the default Vite icon)
- [ ] Favicon file size under 50KB
- [ ] Favicon actually shows in browser tab

## Images
- [ ] All images compressed (under 200KB each)
- [ ] No spaces in image file names
- [ ] Alt text on all images
- [ ] Images load correctly (no broken images)

## Functionality
- [ ] All nav links scroll to correct sections
- [ ] Phone number links work on mobile (tel: href)
- [ ] Contact form submits correctly (if applicable)
- [ ] Form shows success state after submission (if applicable)
- [ ] Social media links open correct profiles in new tabs
- [ ] All external links have target="_blank" and rel="noopener noreferrer"
- [ ] No console errors in browser dev tools

## Visual — Desktop
- [ ] Tested in Chrome
- [ ] Tested in Safari
- [ ] Tested in Firefox
- [ ] No text overflow or clipping
- [ ] Consistent spacing between sections
- [ ] Animations fire correctly on scroll
- [ ] No horizontal scroll

## Visual — Mobile
- [ ] Tested on actual phone (not just browser dev tools)
- [ ] Nav menu opens and closes correctly
- [ ] Buttons are large enough to tap
- [ ] Text is readable without zooming
- [ ] Images aren't cropped weirdly
- [ ] No horizontal scroll
- [ ] Form fields are usable on mobile keyboard (if applicable)

## Content
- [ ] No placeholder or lorem ipsum text anywhere
- [ ] Business name spelled correctly everywhere
- [ ] Phone number correct everywhere
- [ ] Service descriptions are accurate
- [ ] No typos or grammatical errors

## Performance
- [ ] Run Google PageSpeed Insights (aim for 90+ on mobile)
- [ ] No render-blocking resources flagged
- [ ] Fonts loading correctly (no flash of unstyled text)

## Final
- [ ] siteData.js matches all info on the live site
- [ ] All TODO: REPLACE comments in index.html have been replaced

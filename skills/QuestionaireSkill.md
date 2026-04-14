---
name: client-questionnaire
description: Generate a personalized client questionnaire for Chris's web design business. Use this skill whenever the user mentions generating, creating, or sending a client questionnaire, onboarding a new client, collecting info from a client, or preparing a questionnaire for a specific business. Also trigger when the user says things like "new client," "send them the questions," or mentions a business name + owner name in the context of starting a new project.
---

# Client Questionnaire Generator

Generate a personalized client intake questionnaire using the template at `client-questionnaire-template.md` in this skill's directory.

## How It Works

1. Read the template file (`client-questionnaire-template.md` in this skill's folder)
2. Replace all `{{variables}}` with personalized content based on the client's business type
3. Save the final questionnaire as `[firstname]-[business-name]-questionnaire.md`

## Required Input

You need at minimum:
- **Business name**
- **Owner's first name**
- **What the business does** (even a single word like "painter" or "cafe" is enough)

If the user doesn't provide all three, ask for what's missing before generating.

## Tone Rules

- Friendly and direct. Like a knowledgeable friend, not a corporate form.
- No jargon. No "brand identity" or "value proposition" — talk like a normal person.
- Keep questions short. These are busy business owners. If a question feels like homework, simplify it.

## What NOT to Include

Chris finds these himself — never generate questions about:
- Business hours
- Logo
- Google reviews or testimonials
- Websites they like the look of
- Social media links or online presence
- Anything about tech stack or hosting

## Variable Personalization Guide

The template has `{{variables}}` that need to be replaced with content tailored to the specific business type. Don't rely on a lookup table — use judgment based on what the business actually does. Here's what each variable needs and how to think about it:

### {{BUSINESS_NAME}}
The business name exactly as provided.

### {{FIRST_NAME}}
The owner's first name exactly as provided.

### {{AREA_QUESTION}}
- If the business goes to the customer (pressure washing, detailing, cleaning, etc.): ask about their **service area** — cities, neighborhoods, or radius.
- If the business has a physical location customers visit (cafe, salon, gym, etc.): ask for their **address**.
- If both apply (e.g., a caterer with a storefront): ask for both.

### {{BUSINESS_TYPE_GERUND}}
What they do as a natural gerund phrase. "pressure washing," "running a cafe," "painting houses," "grooming dogs," etc.

### {{SERVICES_QUESTION}}
Ask about what they offer, framed in terms that make sense for their industry. A service business has a service list. A restaurant has a menu. A photographer has packages. A gym has classes or memberships. Include a few examples in parentheses so they know what level of detail you want.

### {{SPECIALTY_QUESTION}}
What are they known for or what do they do best? Frame it in industry-appropriate terms. A painter might specialize in interiors vs. exteriors. A cafe might be known for a specific dish. A trainer might focus on a certain type of client. If the business is general enough that specialization doesn't really apply, ask what type of work they enjoy most or get the most requests for.

### {{CUSTOMER_QUESTION}}
Ask about their ideal or typical customer in terms that match how they actually think about their clientele:
- Service businesses: homeowners vs. commercial, property type, etc.
- Restaurants/cafes: demographic, vibe (families, college students, date night crowd, etc.)
- B2B businesses: what kind of companies, size, industry
- Fitness/wellness: age group, fitness level, goals

### {{DIFFERENTIATOR_QUESTION}}
"Why should someone pick you?" but reframed naturally for their business type:
- Service business: "Why should someone pick you over the competition?"
- Cafe/restaurant: "What makes your spot different from other places to eat in the area?"
- Creative business: "How would you describe your style compared to others in your field?"
- Use judgment for other types.

### {{TRUST_QUESTION}}
What would a potential customer want to know before buying? This varies a lot:
- Service businesses: licensed/insured, free estimates, satisfaction guarantee
- Restaurants: dietary accommodations, reservation policy, cash only, BYOB
- Fitness: certifications, trial sessions, cancellation policy
- Creative services: turnaround time, revision policy, what's included
- If nothing obvious applies, skip this question entirely rather than forcing it.

### {{UNIQUE_QUESTION}}
One question specific to their industry that wouldn't make sense for other businesses. Use common sense:
- Caterer → typical event sizes
- Barber → walk-ins vs. appointments
- Photographer → indoor vs. outdoor, events vs. portraits
- Tutor → subjects and age groups
- If nothing genuinely unique comes to mind, skip it rather than adding filler.

### {{GOAL_EXAMPLES}}
Realistic examples of what a website visitor might do for this type of business:
- Service business: "request a free quote"
- Restaurant: "check the menu, find your location"
- Fitness: "sign up for a class, book a session"
- Creative: "view your portfolio, request a quote"

### {{PHOTOS_DETAIL}}
Describe what kind of photos matter most for their business. Always ask for 5-10 photos, but tailor the description:
- Transformative services (pressure washing, painting, detailing): before & after shots
- Food businesses: food/drink photos, interior and exterior of the space
- Creative businesses: finished work, portfolio pieces
- Fitness: facility photos, action shots
- If before/afters don't make sense, don't mention them.

## Examples

These show the range — not the only options. Use judgment for anything not listed.

**Pressure washing:** service area, residential/commercial customers, licensed/insured, before & after photos
**Cafe:** address, menu/signature items, demographic (families, students, etc.), dietary accommodations, food photos + space photos
**Dog groomer:** address or mobile service area, breeds/sizes they handle, walk-ins vs. appointments, pet photos before & after grooming
**Photographer:** service area, packages (wedding, portrait, commercial), style description, portfolio shots

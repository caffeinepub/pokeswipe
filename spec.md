# PokeSwipe - Pokemon Card Marketplace

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Pokemon card listing system: users can list cards with photo, name, set, condition, and asking price
- Tinder-style swipe UI: browse cards with left swipe (pass) and right swipe (interested/buy)
- When a user swipes right on a card, they can send a buy offer or message the seller
- Seller dashboard: view your listed cards, manage listings (add, remove, mark as sold)
- Buyer dashboard: view cards you swiped right on (interested), with seller contact info
- Card detail view: full card info, condition, price, seller username
- User profiles: username, cards listed, cards sold
- Authorization: login required to list or swipe
- Blob storage: card images uploaded by sellers

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - User profiles (username, principal)
   - Card listings: id, seller principal, image blob key, name, set, condition, price, status (available/sold)
   - Swipe actions: record swipe left/right per user per card
   - Interest/match: when user swipes right, record interest; seller can see who is interested
   - CRUD for listings: create, read, update (mark sold), delete
   - Query: get cards for browsing (excluding own cards, already swiped), get my listings, get my interests

2. Frontend:
   - Auth gate: login with Internet Identity
   - Profile setup: set username on first login
   - Swipe screen (main): card stack with swipe left/right gesture and buttons
   - Card upload form: photo, name, set, condition, price
   - My Listings tab: manage own cards
   - My Interests tab: cards swiped right, with seller info and offer/contact option
   - Blob storage integration for card image upload/display

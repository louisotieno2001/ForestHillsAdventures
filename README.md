# ForestHillsAdventures

Your Gateway to Extraordinary Travel Experiences

## Overview

ForestHillsAdventures is a comprehensive travel and tourism web application built with Express.js and EJS templating. The platform offers services including guided tours, car hire, hotel bookings, air ticketing, and complete travel packages.

## Features

- **Home Page** - Engaging landing page showcasing services and testimonials
- **Services** - Detailed pages for Tours, Car Hire, Hotels, Flights, and Packages
- **Blog** - Travel stories and guides (powered by Directus CMS)
- **Partner Up** - Partnership program for hotels, restaurants, transport providers
- **Contact Us** - Contact form for inquiries
- **Get Quotation** - Request form for personalized travel quotes

## Tech Stack

- **Backend**: Express.js
- **Templating**: EJS
- **Styling**: Custom CSS with travel-themed design
- **CMS**: Directus (for blog content)
- **Icons**: Font Awesome 6

## Project Structure

```
ForestHillsAdventures/
├── app.js              # Main Express application
├── package.json        # Dependencies and scripts
├── .env                # Environment variables
├── public/
│   ├── css/
│   │   └── style.css   # Main stylesheet
│   └── images/         # Static images
├── routes/
│   └── index.js        # All application routes
└── views/
    ├── partials/       # Header and footer partials
    ├── index.ejs       # Home page
    ├── services.ejs    # Services page
    ├── contact.ejs     # Contact page
    ├── quotation.ejs   # Get quotation page
    ├── partner-up.ejs  # Partner with us page
    ├── blog.ejs        # Blog listing
    ├── single-blog.ejs # Individual blog post
    ├── error.ejs       # Error page
    └── success.ejs     # Success page
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   EXPRESS_PORT=3008
   DIRECTUS_URL=http://localhost:8050
   DIRECTUS_TOKEN=your_directus_token
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

5. Visit `http://localhost:3008`

## Directus Setup

The application expects a Directus instance with the following collections:

- `blogs` - Blog posts with fields: title, body, badge, date, media
- `contact_us` - Contact form submissions
- `quotation_requests` - Quotation requests
- `partnership_requests` - Partnership inquiries

## Color Palette

- Primary: `#2E7D32` (Forest Green)
- Secondary: `#FF8F00` (Amber)
- Dark Background: `#1a1a1a`
- Light Text: `#ffffff`

## License

ISC

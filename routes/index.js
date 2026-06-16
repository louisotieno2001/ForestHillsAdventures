const express = require('express');
const validator = require('validator');
const router = express.Router();

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return validator.trim(validator.stripLow(str, true));
}

function sanitizeOptional(str) {
  if (!str || typeof str !== 'string') return '';
  return sanitize(str);
}

function validateEmail(email) {
  return email && validator.isEmail(email);
}

function validatePhone(phone) {
  return phone && validator.isMobilePhone(phone, 'any', { strictMode: false });
}

function validateRequiredText(str, maxLen = 500) {
  return str && typeof str === 'string' && str.trim().length > 0 && str.trim().length <= maxLen;
}

function validateRecaptcha(token) {
  if (!token) return false;
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return false;
  const params = new URLSearchParams({ secret, response: token });
  return fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: params
  })
  .then(r => r.json())
  .then(data => data.success === true)
  .catch(() => false);
}

router.get('/', (req, res) => {
  res.render('index', { 
    title: 'ForestHillsAdventures - Your Gateway to Extraordinary Travel',
    description: 'Experience the world with ForestHillsAdventures. We offer bespoke guided tours, car hire, luxury hotel bookings, and all-inclusive travel packages.',
    path: '/',
    schemaData: {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "ForestHillsAdventures",
      "url": "https://foresthills.co.ke",
      "logo": "https://foresthills.co.ke/images/logo.jpg",
      "image": "https://foresthills.co.ke/images/hero.jpg",
      "description": "Your Gateway to Extraordinary Travel Experiences, from safaris to beach retreats.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Forest Hills",
        "addressLocality": "Nairobi",
        "addressCountry": "Kenya"
      },
      "priceRange": "$$"
    }
  });
});

router.get('/services', (req, res) => {
  res.render('services', { 
    title: 'Travel Services - Guided Tours, Safaris & Car Hire | ForestHillsAdventures',
    description: 'Explore our wide range of travel services including expert-guided tours, safari adventures, car hire, and corporate conferencing events.',
    path: '/services',
    schemaData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Travel and Tourism Services",
      "provider": {
        "@type": "TravelAgency",
        "name": "ForestHillsAdventures"
      },
      "areaServed": "Global",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Travel Packages",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Guided Tours" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Safari Adventures" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Car Hire" } }
        ]
      }
    }
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Contact Us - Plan Your Next Adventure | ForestHillsAdventures',
    description: 'Get in touch with ForestHillsAdventures. Our travel experts are ready to help you plan your perfect trip or answer any questions.',
    path: '/contact',
    recaptcha_site_key: process.env.RECAPTCHA_SITE_KEY || ''
  });
});

router.get('/get-quotation', (req, res) => {
  res.render('quotation', { 
    title: 'Request a Travel Quote - Bespoke Vacation Packages | ForestHillsAdventures',
    description: 'Ready for your next trip? Request a free, personalized travel quotation for safaris, tours, or luxury stays today.',
    path: '/get-quotation',
    recaptcha_site_key: process.env.RECAPTCHA_SITE_KEY || ''
  });
});

router.get('/partner-up', (req, res) => {
  res.render('partner-up', { 
    title: 'Partner With Us - Travel Industry Partnerships | ForestHillsAdventures',
    description: 'Join forces with ForestHillsAdventures. We are looking for travel partners, hotels, and service providers to grow together.',
    path: '/partner-up',
    recaptcha_site_key: process.env.RECAPTCHA_SITE_KEY || ''
  });
});

router.get('/blog', async (req, res) => {
    const query = req.app.get('query');
    try {
        const response = await query('/items/blogs?fields=*,media.*', {
            method: 'GET'
        });
        const data = await response.json();
        res.render('blog', { 
            title: 'Travel Stories, Guides & Tips - ForestHillsAdventures Blog',
            description: 'Read the latest travel stories, destination guides, and adventure tips from the experts at ForestHillsAdventures.',
            path: '/blog',
            blogs: data.data || []
        });
    } catch (error) {
        console.error('Blog Fetch Error:', error);
        res.render('blog', { 
            title: 'Travel Stories & Guides - ForestHillsAdventures Blog',
            description: 'Read the latest travel stories and guides from ForestHillsAdventures.',
            path: '/blog',
            blogs: [] 
        });
    }
});

router.get('/blog/:id', async (req, res) => {
    const query = req.app.get('query');
    try {
        const response = await query(`/items/blogs/${req.params.id}?fields=*,media.*`, {
            method: 'GET'
        });
        const data = await response.json();
        
        if (!data.data) {
            return res.status(404).render('error', { 
                title: 'Blog Not Found', 
                message: 'The travel story you are looking for does not exist.' 
            });
        }

        res.render('single-blog', { 
            title: `${data.data.title} - ForestHillsAdventures Blog`,
            description: data.data.body || data.data.body.substring(0, 160).replace(/<[^>]*>/g, ''),
            path: `/blog/${req.params.id}`,
            blog: data.data,
            schemaData: {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": data.data.title,
              "image": data.data.media ? `https://foresthills.co.ke/assets/${data.data.media.id}` : "https://foresthills.co.ke/images/hero.jpg",
              "datePublished": data.data.date_created,
              "dateModified": data.data.date_updated || data.data.date_created,
              "author": {
                "@type": "Organization",
                "name": "ForestHillsAdventures"
              },
              "publisher": {
                "@type": "Organization",
                "name": "ForestHillsAdventures",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://foresthills.co.ke/images/logo.jpg"
                }
              },
              "description": data.data.body || data.data.body.substring(0, 160).replace(/<[^>]*>/g, '')
            }
        });
    } catch (error) {
        console.error('Single Blog Fetch Error:', error);
        res.status(500).render('error', { 
            title: 'Error Fetching Blog', 
            message: 'We could not load the article at this time.' 
        });
    }
});

router.post('/contact', async (req, res) => {
    const query = req.app.get('query');
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const phone = sanitize(req.body.phone);
    const subject = sanitize(req.body.subject);
    const message = sanitize(req.body.message);
    const preferred_contact = sanitize(req.body.preferred_contact);

    if (!validateRequiredText(name, 100) || !validateEmail(email) || !validatePhone(phone) || !validateRequiredText(subject, 200) || !validateRequiredText(message, 5000) || !['email', 'call', 'sms'].includes(preferred_contact)) {
        return res.status(400).render('error', {
            title: 'Validation Error',
            message: 'Please check your inputs and try again. Ensure all required fields are filled correctly.'
        });
    }

    const recaptchaValid = await validateRecaptcha(req.body['g-recaptcha-response']);
    if (!recaptchaValid) {
        return res.status(400).render('error', {
            title: 'Verification Failed',
            message: 'reCAPTCHA verification failed. Please try again.'
        });
    }

    try {
        const response = await query('/items/contact_us', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                phone,
                subject,
                message,
                preferred_contact: ['email', 'call', 'sms'].includes(preferred_contact) ? preferred_contact : 'email',
                status: 'published'
            })
        });

        if (response.ok) {
            res.render('success', { 
                title: 'Message Sent!', 
                message: 'Thank you for reaching out to ForestHillsAdventures. We will get back to you shortly.' 
            });
        } else {
            throw new Error('Failed to send message to Directus');
        }
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.render('error', { 
            title: 'Submission Error', 
            message: 'We could not send your message at this time. Please try again later.' 
        });
    }
});

router.post('/submit-quotation', async (req, res) => {
    const query = req.app.get('query');
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const phone = sanitize(req.body.phone);
    const destination = sanitize(req.body.destination);
    const service_type = sanitize(req.body.service_type);
    const travel_date = sanitize(req.body.travel_date);
    const num_travelers = req.body.num_travelers;
    const message = sanitize(req.body.message);
    const country = sanitize(req.body.country);
    const town = sanitize(req.body.town);

    const validServiceTypes = ['conference','guided-tour','unguided-tour','safari','cultural-tour','adventure','honeymoon','family','group','cruise','short-stay','long-stay','car-hire','hotels','air-tickets','visa','travel-insurance','full-package'];

    if (!validateRequiredText(name, 100) || !validateEmail(email) || !validatePhone(phone) || !validateRequiredText(destination, 200) || !validateRequiredText(country, 100) || !validateRequiredText(town, 100) || !validServiceTypes.includes(service_type)) {
        return res.status(400).render('error', {
            title: 'Validation Error',
            message: 'Please check your inputs and try again. Ensure all required fields are filled correctly.'
        });
    }

    const recaptchaValid = await validateRecaptcha(req.body['g-recaptcha-response']);
    if (!recaptchaValid) {
        return res.status(400).render('error', {
            title: 'Verification Failed',
            message: 'reCAPTCHA verification failed. Please try again.'
        });
    }

    const serviceDetails = {};

    if (service_type === 'conference') {
        serviceDetails.conference_type = sanitizeOptional(req.body.conference_type);
        serviceDetails.conference_attendees = sanitizeOptional(req.body.conference_attendees);
        serviceDetails.conference_date = sanitizeOptional(req.body.conference_date);
        serviceDetails.conference_duration = sanitizeOptional(req.body.conference_duration);
        serviceDetails.conference_venue = sanitizeOptional(req.body.conference_venue);
        serviceDetails.conference_services = sanitizeOptional(req.body.conference_services);
        serviceDetails.conference_budget = sanitizeOptional(req.body.conference_budget);
        serviceDetails.conference_catering = sanitizeOptional(req.body.conference_catering);
        serviceDetails.conference_special = sanitizeOptional(req.body.conference_special);
    }

    if (service_type === 'guided-tour') {
        serviceDetails.tour_type = sanitizeOptional(req.body.guided_tour_type);
        serviceDetails.guide_language = sanitizeOptional(req.body.guided_guide_language);
        serviceDetails.interests = sanitizeOptional(req.body.guided_interests);
        serviceDetails.meal_preference = sanitizeOptional(req.body.guided_meal_preference);
    }

    if (service_type === 'unguided-tour') {
        serviceDetails.trip_duration = sanitizeOptional(req.body.unguided_trip_duration);
        serviceDetails.vehicle_option = sanitizeOptional(req.body.unguided_vehicle_option);
        serviceDetails.driving_license = sanitizeOptional(req.body.unguided_driving_license);
        serviceDetails.vehicle_type = sanitizeOptional(req.body.unguided_vehicle_type);
        serviceDetails.food_preference = sanitizeOptional(req.body.unguided_food);
        serviceDetails.accommodation_style = sanitizeOptional(req.body.unguided_accommodation);
        serviceDetails.experience_level = sanitizeOptional(req.body.unguided_experience_level);
        serviceDetails.route_preference = sanitizeOptional(req.body.unguided_route_preference);
    }

    if (service_type === 'safari') {
        serviceDetails.safari_type = sanitizeOptional(req.body.safari_type);
        serviceDetails.safari_duration = sanitizeOptional(req.body.safari_duration);
        serviceDetails.wildlife_interests = sanitizeOptional(req.body.safari_interests);
        serviceDetails.accommodation_level = sanitizeOptional(req.body.safari_accommodation);
        serviceDetails.vehicle_preference = sanitizeOptional(req.body.safari_vehicle);
        serviceDetails.photography_interest = sanitizeOptional(req.body.safari_photography);
    }

    if (service_type === 'cultural-tour') {
        serviceDetails.cultural_focus = sanitizeOptional(req.body.cultural_focus);
        serviceDetails.experience_depth = sanitizeOptional(req.body.cultural_depth);
        serviceDetails.participation_level = sanitizeOptional(req.body.cultural_participate);
        serviceDetails.communities = sanitizeOptional(req.body.cultural_communities);
    }

    if (service_type === 'adventure') {
        serviceDetails.activities = sanitizeOptional(req.body.adventure_activities);
        serviceDetails.fitness_level = sanitizeOptional(req.body.adventure_difficulty);
        serviceDetails.prior_experience = sanitizeOptional(req.body.adventure_experience);
        serviceDetails.certification_needed = sanitizeOptional(req.body.adventure_certification);
        serviceDetails.equipment_requirements = sanitizeOptional(req.body.adventure_gear);
    }

    if (service_type === 'honeymoon') {
        serviceDetails.romantic_style = sanitizeOptional(req.body.honeymoon_style);
        serviceDetails.trip_duration = sanitizeOptional(req.body.honeymoon_duration);
        serviceDetails.budget_range = sanitizeOptional(req.body.honeymoon_budget_range);
        serviceDetails.special_arrangements = sanitizeOptional(req.body.honeymoon_extras);
        serviceDetails.special_occasion = sanitizeOptional(req.body.honeymoon_anniversary);
    }

    if (service_type === 'family') {
        serviceDetails.children_ages = sanitizeOptional(req.body.family_children_ages);
        serviceDetails.vacation_type = sanitizeOptional(req.body.family_trip_type);
        serviceDetails.family_activities = sanitizeOptional(req.body.family_activities);
        serviceDetails.accommodation_preference = sanitizeOptional(req.body.family_accommodation);
        serviceDetails.meal_requirements = sanitizeOptional(req.body.family_meals);
        serviceDetails.childcare_needed = sanitizeOptional(req.body.family_nanny);
    }

    if (service_type === 'group') {
        serviceDetails.group_size = sanitizeOptional(req.body.group_size);
        serviceDetails.group_type = sanitizeOptional(req.body.group_type);
        serviceDetails.group_interests = sanitizeOptional(req.body.group_interests);
        serviceDetails.transportation_needs = sanitizeOptional(req.body.group_transport);
        serviceDetails.budget_per_person = sanitizeOptional(req.body.group_budget);
    }

    if (service_type === 'cruise') {
        serviceDetails.cruise_type = sanitizeOptional(req.body.cruise_type);
        serviceDetails.cruise_duration = sanitizeOptional(req.body.cruise_duration);
        serviceDetails.cabin_preference = sanitizeOptional(req.body.cruise_cabin);
        serviceDetails.cruise_amenities = sanitizeOptional(req.body.cruise_amenities);
    }

    if (service_type === 'short-stay') {
        serviceDetails.apartment_type = sanitizeOptional(req.body.short_apartment_type);
        serviceDetails.stay_duration = sanitizeOptional(req.body.short_duration);
        serviceDetails.preferred_location = sanitizeOptional(req.body.short_location);
        serviceDetails.amenities = sanitizeOptional(req.body.short_amenities);
        serviceDetails.furnishing_preference = sanitizeOptional(req.body.short_furnished);
        serviceDetails.checkin_date = sanitizeOptional(req.body.short_checkin);
        serviceDetails.number_of_guests = sanitizeOptional(req.body.short_guests);
        serviceDetails.budget_range = sanitizeOptional(req.body.short_budget);
        serviceDetails.pet_friendly = sanitizeOptional(req.body.short_pets);
    }

    if (service_type === 'long-stay') {
        serviceDetails.apartment_type = sanitizeOptional(req.body.long_apartment_type);
        serviceDetails.lease_duration = sanitizeOptional(req.body.long_duration);
        serviceDetails.preferred_location = sanitizeOptional(req.body.long_location);
        serviceDetails.amenities = sanitizeOptional(req.body.long_amenities);
        serviceDetails.move_in_date = sanitizeOptional(req.body.long_move_date);
        serviceDetails.number_of_occupants = sanitizeOptional(req.body.long_occupants);
        serviceDetails.employment_status = sanitizeOptional(req.body.long_employment);
        serviceDetails.monthly_budget = sanitizeOptional(req.body.long_budget);
        serviceDetails.parking_requirements = sanitizeOptional(req.body.long_parking);
        serviceDetails.pets = sanitizeOptional(req.body.long_pets);
        serviceDetails.additional_requirements = sanitizeOptional(req.body.long_special);
    }

    if (service_type === 'car-hire') {
        serviceDetails.vehicle_type = sanitizeOptional(req.body.car_type);
        serviceDetails.rental_duration = sanitizeOptional(req.body.car_duration);
        serviceDetails.fuel_policy = sanitizeOptional(req.body.car_fuel);
        serviceDetails.transmission = sanitizeOptional(req.body.car_transmission);
        serviceDetails.required_features = sanitizeOptional(req.body.car_features);
        serviceDetails.driver_service = sanitizeOptional(req.body.car_driver);
        serviceDetails.delivery_location = sanitizeOptional(req.body.car_delivery);
    }

    if (service_type === 'hotels') {
        serviceDetails.star_rating = sanitizeOptional(req.body.hotel_star);
        serviceDetails.number_of_rooms = sanitizeOptional(req.body.hotel_rooms);
        serviceDetails.room_type = sanitizeOptional(req.body.hotel_room_type);
        serviceDetails.board_basis = sanitizeOptional(req.body.hotel_board);
        serviceDetails.required_amenities = sanitizeOptional(req.body.hotel_amenities);
        serviceDetails.special_requirements = sanitizeOptional(req.body.hotel_special);
    }

    if (service_type === 'air-tickets') {
        serviceDetails.flight_type = sanitizeOptional(req.body.flight_type);
        serviceDetails.flight_class = sanitizeOptional(req.body.flight_class);
        serviceDetails.departure_city = sanitizeOptional(req.body.flight_from);
        serviceDetails.destination_city = sanitizeOptional(req.body.flight_to);
        serviceDetails.return_date = sanitizeOptional(req.body.flight_return_date);
        serviceDetails.airline_preference = sanitizeOptional(req.body.flight_airline);
        serviceDetails.baggage_requirement = sanitizeOptional(req.body.flight_baggage);
    }

    if (service_type === 'visa') {
        serviceDetails.destination_country = sanitizeOptional(req.body.visa_country);
        serviceDetails.visa_type = sanitizeOptional(req.body.visa_type);
        serviceDetails.intended_stay = sanitizeOptional(req.body.visa_duration);
        serviceDetails.number_of_entries = sanitizeOptional(req.body.visa_entries);
        serviceDetails.current_citizenship = sanitizeOptional(req.body.visa_citizenship);
        serviceDetails.available_documents = sanitizeOptional(req.body.visa_docs);
    }

    if (service_type === 'travel-insurance') {
        serviceDetails.coverage_type = sanitizeOptional(req.body.insurance_coverage);
        serviceDetails.coverage_features = sanitizeOptional(req.body.insurance_features);
        serviceDetails.estimated_trip_value = sanitizeOptional(req.body.insurance_trip_value);
        serviceDetails.travelers_covered = sanitizeOptional(req.body.insurance_travelers);
        serviceDetails.primary_destination = sanitizeOptional(req.body.insurance_destination);
    }

    if (service_type === 'full-package') {
        serviceDetails.trip_type = sanitizeOptional(req.body.package_trip_type);
        serviceDetails.trip_duration = sanitizeOptional(req.body.package_duration);
        serviceDetails.budget_range = sanitizeOptional(req.body.package_budget);
        serviceDetails.services_needed = sanitizeOptional(req.body.package_services);
        serviceDetails.special_requirements = sanitizeOptional(req.body.package_special);
    }

    try {
        const response = await query('/items/quotation_requests', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                phone,
                destination,
                service_type,
                travel_date,
                num_travelers: parseInt(num_travelers, 10) || 1,
                message,
                current_location: `${town}, ${country}`,
                service_details: serviceDetails,
                status: 'published'
            })
        });

        if (response.ok) {
            res.render('success', { 
                title: 'Request Received!', 
                message: 'Your quotation request has been received. Our travel experts will review it and contact you with the best packages.' 
            });
        } else {
            throw new Error('Failed to send quotation request to Directus');
        }
    } catch (error) {
        console.error('Quotation Form Error:', error);
        res.render('error', { 
            title: 'Submission Error', 
            message: 'We could not process your request at this time. Please try again later.' 
        });
    }
});

router.post('/partner-up', async (req, res) => {
    const query = req.app.get('query');
    const company_name = sanitize(req.body.company_name);
    const contact_name = sanitize(req.body.contact_name);
    const email = sanitize(req.body.email);
    const phone = sanitize(req.body.phone);
    const partnership_type = sanitize(req.body.partnership_type);
    const website = sanitize(req.body.website);
    const message = sanitize(req.body.message);

    const validPartnershipTypes = ['hotel', 'restaurant', 'transport', 'tour_operator', 'corporate', 'destination', 'other'];

    if (!validateRequiredText(company_name, 200) || !validateRequiredText(contact_name, 100) || !validateEmail(email) || !validatePhone(phone) || !validPartnershipTypes.includes(partnership_type) || !validateRequiredText(message, 5000)) {
        return res.status(400).render('error', {
            title: 'Validation Error',
            message: 'Please check your inputs and try again. Ensure all required fields are filled correctly.'
        });
    }

    if (website && website.length > 0 && !validator.isURL(website)) {
        return res.status(400).render('error', {
            title: 'Validation Error',
            message: 'Please enter a valid website URL or leave the field empty.'
        });
    }

    const recaptchaValid = await validateRecaptcha(req.body['g-recaptcha-response']);
    if (!recaptchaValid) {
        return res.status(400).render('error', {
            title: 'Verification Failed',
            message: 'reCAPTCHA verification failed. Please try again.'
        });
    }

    try {
        const response = await query('/items/partnership_requests', {
            method: 'POST',
            body: JSON.stringify({
                company_name,
                contact_name,
                email,
                phone,
                partnership_type,
                website: website || '',
                message,
                status: 'published'
            })
        });

        if (response.ok) {
            res.render('success', { 
                title: 'Partnership Request Sent!', 
                message: 'Thank you for your interest in partnering with ForestHillsAdventures. Our team will review your application and reach out soon.' 
            });
        } else {
            throw new Error('Failed to submit partnership request');
        }
    } catch (error) {
        console.error('Partnership Form Error:', error);
        res.render('error', { 
            title: 'Submission Error', 
            message: 'We could not process your request at this time. Please try again later.' 
        });
    }
});

router.get('/sitemap.xml', async (req, res) => {
    const query = req.app.get('query');
    const baseUrl = 'https://foresthills.co.ke';
    const staticPages = [
        '',
        '/services',
        '/contact',
        '/get-quotation',
        '/partner-up',
        '/blog'
    ];

    let blogPages = [];
    try {
        const response = await query('/items/blogs?fields=id,date_updated,date_created', {
            method: 'GET'
        });
        const data = await response.json();
        if (data.data) {
            blogPages = data.data.map(blog => ({
                url: `/blog/${blog.id}`,
                lastmod: new Date(blog.date_updated || blog.date_created).toISOString().split('T')[0]
            }));
        }
    } catch (error) {
        console.error('Sitemap Blog Fetch Error:', error);
    }

    const today = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    staticPages.forEach(page => {
        xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    blogPages.forEach(blog => {
        xml += `
  <url>
    <loc>${baseUrl}${blog.url}</loc>
    <lastmod>${blog.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
});

module.exports = router;

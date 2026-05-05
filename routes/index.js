const express = require('express');
const router = express.Router();

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
    path: '/contact'
  });
});

router.get('/get-quotation', (req, res) => {
  res.render('quotation', { 
    title: 'Request a Travel Quote - Bespoke Vacation Packages | ForestHillsAdventures',
    description: 'Ready for your next trip? Request a free, personalized travel quotation for safaris, tours, or luxury stays today.',
    path: '/get-quotation'
  });
});

router.get('/partner-up', (req, res) => {
  res.render('partner-up', { 
    title: 'Partner With Us - Travel Industry Partnerships | ForestHillsAdventures',
    description: 'Join forces with ForestHillsAdventures. We are looking for travel partners, hotels, and service providers to grow together.',
    path: '/partner-up'
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
    const { name, email, phone, subject, message, preferred_contact } = req.body;

    try {
        const response = await query('/items/contact_us', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                phone,
                subject,
                message,
                preferred_contact,
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
    const { 
        name, email, phone, destination, service_type, travel_date, 
        num_travelers, message, country, town
    } = req.body;

    const serviceDetails = {};

    if (service_type === 'conference') {
        serviceDetails.conference_type = req.body.conference_type;
        serviceDetails.conference_attendees = req.body.conference_attendees;
        serviceDetails.conference_date = req.body.conference_date;
        serviceDetails.conference_duration = req.body.conference_duration;
        serviceDetails.conference_venue = req.body.conference_venue;
        serviceDetails.conference_services = req.body.conference_services;
        serviceDetails.conference_budget = req.body.conference_budget;
        serviceDetails.conference_catering = req.body.conference_catering;
        serviceDetails.conference_special = req.body.conference_special;
    }

    if (service_type === 'guided-tour') {
        serviceDetails.tour_type = req.body.guided_tour_type;
        serviceDetails.guide_language = req.body.guided_guide_language;
        serviceDetails.interests = req.body.guided_interests;
        serviceDetails.meal_preference = req.body.guided_meal_preference;
    }

    if (service_type === 'unguided-tour') {
        serviceDetails.trip_duration = req.body.unguided_trip_duration;
        serviceDetails.vehicle_option = req.body.unguided_vehicle_option;
        serviceDetails.driving_license = req.body.unguided_driving_license;
        serviceDetails.vehicle_type = req.body.unguided_vehicle_type;
        serviceDetails.food_preference = req.body.unguided_food;
        serviceDetails.accommodation_style = req.body.unguided_accommodation;
        serviceDetails.experience_level = req.body.unguided_experience_level;
        serviceDetails.route_preference = req.body.unguided_route_preference;
    }

    if (service_type === 'safari') {
        serviceDetails.safari_type = req.body.safari_type;
        serviceDetails.safari_duration = req.body.safari_duration;
        serviceDetails.wildlife_interests = req.body.safari_interests;
        serviceDetails.accommodation_level = req.body.safari_accommodation;
        serviceDetails.vehicle_preference = req.body.safari_vehicle;
        serviceDetails.photography_interest = req.body.safari_photography;
    }

    if (service_type === 'cultural-tour') {
        serviceDetails.cultural_focus = req.body.cultural_focus;
        serviceDetails.experience_depth = req.body.cultural_depth;
        serviceDetails.participation_level = req.body.cultural_participate;
        serviceDetails.communities = req.body.cultural_communities;
    }

    if (service_type === 'adventure') {
        serviceDetails.activities = req.body.adventure_activities;
        serviceDetails.fitness_level = req.body.adventure_difficulty;
        serviceDetails.prior_experience = req.body.adventure_experience;
        serviceDetails.certification_needed = req.body.adventure_certification;
        serviceDetails.equipment_requirements = req.body.adventure_gear;
    }

    if (service_type === 'honeymoon') {
        serviceDetails.romantic_style = req.body.honeymoon_style;
        serviceDetails.trip_duration = req.body.honeymoon_duration;
        serviceDetails.budget_range = req.body.honeymoon_budget_range;
        serviceDetails.special_arrangements = req.body.honeymoon_extras;
        serviceDetails.special_occasion = req.body.honeymoon_anniversary;
    }

    if (service_type === 'family') {
        serviceDetails.children_ages = req.body.family_children_ages;
        serviceDetails.vacation_type = req.body.family_trip_type;
        serviceDetails.family_activities = req.body.family_activities;
        serviceDetails.accommodation_preference = req.body.family_accommodation;
        serviceDetails.meal_requirements = req.body.family_meals;
        serviceDetails.childcare_needed = req.body.family_nanny;
    }

    if (service_type === 'group') {
        serviceDetails.group_size = req.body.group_size;
        serviceDetails.group_type = req.body.group_type;
        serviceDetails.group_interests = req.body.group_interests;
        serviceDetails.transportation_needs = req.body.group_transport;
        serviceDetails.budget_per_person = req.body.group_budget;
    }

    if (service_type === 'cruise') {
        serviceDetails.cruise_type = req.body.cruise_type;
        serviceDetails.cruise_duration = req.body.cruise_duration;
        serviceDetails.cabin_preference = req.body.cruise_cabin;
        serviceDetails.cruise_amenities = req.body.cruise_amenities;
    }

    if (service_type === 'short-stay') {
        serviceDetails.apartment_type = req.body.short_apartment_type;
        serviceDetails.stay_duration = req.body.short_duration;
        serviceDetails.preferred_location = req.body.short_location;
        serviceDetails.amenities = req.body.short_amenities;
        serviceDetails.furnishing_preference = req.body.short_furnished;
        serviceDetails.checkin_date = req.body.short_checkin;
        serviceDetails.number_of_guests = req.body.short_guests;
        serviceDetails.budget_range = req.body.short_budget;
        serviceDetails.pet_friendly = req.body.short_pets;
    }

    if (service_type === 'long-stay') {
        serviceDetails.apartment_type = req.body.long_apartment_type;
        serviceDetails.lease_duration = req.body.long_duration;
        serviceDetails.preferred_location = req.body.long_location;
        serviceDetails.amenities = req.body.long_amenities;
        serviceDetails.move_in_date = req.body.long_move_date;
        serviceDetails.number_of_occupants = req.body.long_occupants;
        serviceDetails.employment_status = req.body.long_employment;
        serviceDetails.monthly_budget = req.body.long_budget;
        serviceDetails.parking_requirements = req.body.long_parking;
        serviceDetails.pets = req.body.long_pets;
        serviceDetails.additional_requirements = req.body.long_special;
    }

    if (service_type === 'car-hire') {
        serviceDetails.vehicle_type = req.body.car_type;
        serviceDetails.rental_duration = req.body.car_duration;
        serviceDetails.fuel_policy = req.body.car_fuel;
        serviceDetails.transmission = req.body.car_transmission;
        serviceDetails.required_features = req.body.car_features;
        serviceDetails.driver_service = req.body.car_driver;
        serviceDetails.delivery_location = req.body.car_delivery;
    }

    if (service_type === 'hotels') {
        serviceDetails.star_rating = req.body.hotel_star;
        serviceDetails.number_of_rooms = req.body.hotel_rooms;
        serviceDetails.room_type = req.body.hotel_room_type;
        serviceDetails.board_basis = req.body.hotel_board;
        serviceDetails.required_amenities = req.body.hotel_amenities;
        serviceDetails.special_requirements = req.body.hotel_special;
    }

    if (service_type === 'air-tickets') {
        serviceDetails.flight_type = req.body.flight_type;
        serviceDetails.flight_class = req.body.flight_class;
        serviceDetails.departure_city = req.body.flight_from;
        serviceDetails.destination_city = req.body.flight_to;
        serviceDetails.return_date = req.body.flight_return_date;
        serviceDetails.airline_preference = req.body.flight_airline;
        serviceDetails.baggage_requirement = req.body.flight_baggage;
    }

    if (service_type === 'visa') {
        serviceDetails.destination_country = req.body.visa_country;
        serviceDetails.visa_type = req.body.visa_type;
        serviceDetails.intended_stay = req.body.visa_duration;
        serviceDetails.number_of_entries = req.body.visa_entries;
        serviceDetails.current_citizenship = req.body.visa_citizenship;
        serviceDetails.available_documents = req.body.visa_docs;
    }

    if (service_type === 'travel-insurance') {
        serviceDetails.coverage_type = req.body.insurance_coverage;
        serviceDetails.coverage_features = req.body.insurance_features;
        serviceDetails.estimated_trip_value = req.body.insurance_trip_value;
        serviceDetails.travelers_covered = req.body.insurance_travelers;
        serviceDetails.primary_destination = req.body.insurance_destination;
    }

    if (service_type === 'full-package') {
        serviceDetails.trip_type = req.body.package_trip_type;
        serviceDetails.trip_duration = req.body.package_duration;
        serviceDetails.budget_range = req.body.package_budget;
        serviceDetails.services_needed = req.body.package_services;
        serviceDetails.special_requirements = req.body.package_special;
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
                num_travelers,
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
    const { company_name, contact_name, email, phone, partnership_type, website, message } = req.body;

    try {
        const response = await query('/items/partnership_requests', {
            method: 'POST',
            body: JSON.stringify({
                company_name,
                contact_name,
                email,
                phone,
                partnership_type,
                website,
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

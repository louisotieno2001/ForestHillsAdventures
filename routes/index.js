const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'ForestHillsAdventures - Your Gateway to Extraordinary Travel' });
});

router.get('/services', (req, res) => {
  res.render('services', { title: 'Our Services - ForestHillsAdventures' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us - ForestHillsAdventures' });
});

router.get('/get-quotation', (req, res) => {
  res.render('quotation', { title: 'Get a Quotation - ForestHillsAdventures' });
});

router.get('/partner-up', (req, res) => {
  res.render('partner-up', { title: 'Partner With Us - ForestHillsAdventures' });
});

router.get('/blog', async (req, res) => {
    const query = req.app.get('query');
    try {
        const response = await query('/items/blogs?fields=*,media.*', {
            method: 'GET'
        });
        const data = await response.json();
        res.render('blog', { 
            title: 'Travel Stories & Guides - ForestHillsAdventures Blog',
            blogs: data.data || []
        });
    } catch (error) {
        console.error('Blog Fetch Error:', error);
        res.render('blog', { 
            title: 'Travel Stories & Guides - ForestHillsAdventures Blog',
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
            blog: data.data
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

module.exports = router;

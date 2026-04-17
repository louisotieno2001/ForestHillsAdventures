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
    const { name, email, phone, destination, service_type, travel_date, num_travelers, message, country, town } = req.body;

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

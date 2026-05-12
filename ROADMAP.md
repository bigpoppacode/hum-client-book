# Roadmap

## Planned Enhancements

### Address Autocomplete
Add Google Places Autocomplete to the pickup and dropoff location fields in the ride logging form. This would speed up ride logging and reduce typos by suggesting real addresses as the driver types. Requires a Google Places API key (`GOOGLE_PLACES_API_KEY` in `.env`). Should restrict results to US addresses and fall back to plain text input if the API is unavailable.

### Real Payment Integration
Replace the mock payment request/received flow with actual payment processing. Integrate with Stripe or Square to send payment requests to clients and receive confirmations in real time.

### Client Onboarding Emails
Replace the demo toast with actual transactional emails sent to new clients. Include a personalized booking link and the driver's contact information so clients can schedule repeat rides directly.

### Offline Support
Enable drivers to log rides and add clients while offline (e.g. in areas with poor connectivity). Sync changes to the server when the connection is restored.

### Data Export
Allow drivers to export their client list, ride history, and earnings data as CSV or PDF for tax reporting and business planning.

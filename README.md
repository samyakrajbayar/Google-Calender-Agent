# AI Calendar Agent 🤖📅

An intelligent calendar assistant that adds events to Google Calendar using natural language commands. Powered by Claude AI for natural language understanding and Google Calendar API for event management.

## Features

- 🗣️ **Natural Language Processing**: Just tell the agent what event to add in plain English
- 🔄 **Recurring Events Support**: Handle daily, weekly, monthly recurring events with ease
- 📆 **Smart Date Parsing**: Understands relative dates like "tomorrow", "next Friday", "first Monday"
- ✅ **Event Validation**: Parses and displays event details before adding to calendar
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Examples

The agent understands commands like:

- "Add team meeting tomorrow at 2pm for 1 hour"
- "Schedule dentist appointment on Friday at 10:30am"
- "Add daily standup at 9am Monday to Friday for next 4 weeks"
- "Create monthly review meeting first Monday of each month at 3pm"
- "Add workout session every Monday, Wednesday, Friday at 6am for 8 weeks"

## Prerequisites

- Node.js (v14 or higher)
- Google Cloud Platform account
- Anthropic API access (handled automatically in Claude.ai)

## Setup Instructions

### 1. Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted:
   - User Type: External (for testing)
   - Add your email as a test user
   - Add required scopes: `https://www.googleapis.com/auth/calendar`
4. Create OAuth client ID:
   - Application type: Web application
   - Name: AI Calendar Agent
   - Authorized JavaScript origins: 
     - `http://localhost:3000` (for development)
     - Your production domain
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - Your production domain

5. Copy the **Client ID** generated

### 3. Configure the Application

1. Open the `CalendarAgent` component file
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:

```javascript
const CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com';
```

### 4. Implement Google OAuth Flow

For production use, you need to implement the Google OAuth flow. Here's a basic implementation:

```javascript
const initGoogleAuth = () => {
  const client = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/calendar',
    callback: (response) => {
      setAccessToken(response.access_token);
      setIsSignedIn(true);
    },
  });
  
  client.requestAccessToken();
};
```

Add the Google API script to your HTML:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

## Installation

### Using in Claude.ai (Current Setup)

This artifact is ready to use directly in Claude.ai. The Anthropic API calls are handled automatically.

### Running Locally

If you want to run this locally:

1. Clone or copy the component code
2. Install dependencies:
   ```bash
   npm install react lucide-react
   ```

3. Set up Anthropic API:
   ```javascript
   // Add your API key to the fetch call
   headers: {
     "Content-Type": "application/json",
     "x-api-key": "your-anthropic-api-key",
     "anthropic-version": "2023-06-01"
   }
   ```

4. Run your React application:
   ```bash
   npm start
   ```

## How It Works

### Architecture Flow

1. **User Input**: User enters a natural language command
2. **AI Processing**: Claude API parses the command and extracts:
   - Event title
   - Date and time
   - Duration
   - Recurrence pattern (if applicable)
3. **Event Creation**: Google Calendar API creates the event
4. **Confirmation**: User receives confirmation with event details and link

### Recurrence Rules

The agent uses RFC 5545 RRULE format for recurring events:

- **Daily**: `RRULE:FREQ=DAILY;COUNT=30`
- **Weekly**: `RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10`
- **Monthly**: `RRULE:FREQ=MONTHLY;BYMONTHDAY=1;COUNT=12`
- **Yearly**: `RRULE:FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25`

### Date Parsing Examples

| User Input | Interpretation |
|------------|----------------|
| "tomorrow" | Current date + 1 day |
| "next Friday" | Next occurrence of Friday |
| "first Monday of next month" | First Monday of the following month |
| "in 3 days" | Current date + 3 days |

## API Reference

### Google Calendar API

**Create Event Endpoint**:
```
POST https://www.googleapis.com/calendar/v3/calendars/primary/events
```

**Required Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Event Object Structure**:
```json
{
  "summary": "Event Title",
  "description": "Event Description",
  "start": {
    "dateTime": "2025-11-13T14:00:00",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2025-11-13T15:00:00",
    "timeZone": "America/New_York"
  },
  "recurrence": [
    "RRULE:FREQ=WEEKLY;COUNT=10"
  ]
}
```

### Claude API

**Message Endpoint**:
```
POST https://api.anthropic.com/v1/messages
```

**Request Structure**:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1000,
  "messages": [
    {
      "role": "user",
      "content": "Parse this calendar command..."
    }
  ]
}
```

## Security Considerations

⚠️ **Important Security Notes**:

1. **Never expose API keys** in client-side code
2. **Use environment variables** for sensitive data
3. **Implement proper OAuth flow** for production
4. **Validate all user inputs** before processing
5. **Use HTTPS** in production environments
6. **Limit OAuth scopes** to only what's needed
7. **Implement token refresh** for long-lived sessions

## Troubleshooting

### Common Issues

**Issue**: "Access token is invalid"
- **Solution**: Re-authenticate with Google OAuth

**Issue**: "Calendar API not enabled"
- **Solution**: Enable Google Calendar API in Google Cloud Console

**Issue**: "CORS error when calling API"
- **Solution**: Add your domain to authorized origins in OAuth credentials

**Issue**: "Recurring event not created correctly"
- **Solution**: Verify RRULE format follows RFC 5545 standard

**Issue**: "Time zone mismatch"
- **Solution**: Ensure time zones are consistent between start and end times

## Limitations

- Requires internet connection for API calls
- Google Calendar API quota: 1,000,000 queries/day
- Claude API has rate limits based on your plan
- OAuth tokens expire and need refresh
- Maximum 100 recurrence instances per event (Google Calendar limit)

## Future Enhancements

- [ ] Add support for event editing and deletion
- [ ] Implement event reminders
- [ ] Add attendee management
- [ ] Support multiple calendar selection
- [ ] Add voice input support
- [ ] Implement conflict detection
- [ ] Add calendar view within the app
- [ ] Support for all-day events
- [ ] Integration with other calendar services (Outlook, Apple Calendar)

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.

## Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Anthropic Claude API Documentation](https://docs.anthropic.com)
- [RFC 5545 - iCalendar Specification](https://tools.ietf.org/html/rfc5545)
- [React Documentation](https://react.dev)

## Support

For issues and questions:
- Google Calendar API: [Stack Overflow](https://stackoverflow.com/questions/tagged/google-calendar-api)
- Claude API: [Anthropic Support](https://support.anthropic.com)

---

**Note**: This is a demonstration project. For production use, implement proper error handling, security measures, and user authentication.

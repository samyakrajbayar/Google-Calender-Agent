import React, { useState } from 'react';
import { Calendar, Send, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';

export default function CalendarAgent() {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Initialize Google API
  const initGoogleAuth = () => {
    const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
    const SCOPES = 'https://www.googleapis.com/auth/calendar';
    
    // For demo purposes - in production, use proper OAuth flow
    alert('To use this app:\n\n1. Go to Google Cloud Console\n2. Create a project and enable Google Calendar API\n3. Create OAuth 2.0 credentials\n4. Replace CLIENT_ID in the code\n5. Implement proper OAuth flow');
  };

  const processCommand = async () => {
    if (!command.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Step 1: Use Claude API to parse the natural language command
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Parse this calendar event command and extract the details. Return ONLY a JSON object with this exact structure (no markdown, no preamble):
{
  "summary": "event title",
  "description": "event description (optional)",
  "start": "YYYY-MM-DDTHH:MM:SS",
  "end": "YYYY-MM-DDTHH:MM:SS",
  "timeZone": "America/New_York",
  "recurrence": ["RRULE:FREQ=DAILY;COUNT=10"] (optional, use RRULE format)
}

Command: "${command}"

Current date/time: ${new Date().toISOString()}
If time not specified, use 9:00 AM for start and 10:00 AM for end.
If date is relative (tomorrow, next week), calculate the actual date.
For recurring events, add recurrence rules following RFC 5545 format.

Examples of recurrence rules:
- Daily: RRULE:FREQ=DAILY;COUNT=30
- Weekly: RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10
- Monthly: RRULE:FREQ=MONTHLY;BYMONTHDAY=1;COUNT=12

Return ONLY the JSON, nothing else.`
            }
          ],
        })
      });

      const claudeData = await claudeResponse.json();
      const claudeText = claudeData.content
        .map(item => (item.type === "text" ? item.text : ""))
        .join("\n")
        .trim();

      // Parse the JSON response
      const eventDetails = JSON.parse(claudeText);
      
      setResponse({
        parsed: eventDetails,
        status: 'parsed',
        message: 'Event details parsed successfully!'
      });

      // Step 2: If user is signed in, create the event
      if (isSignedIn && accessToken) {
        await createCalendarEvent(eventDetails);
      } else {
        setResponse(prev => ({
          ...prev,
          message: 'Event parsed! Sign in with Google to add it to your calendar.'
        }));
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to process command');
    } finally {
      setLoading(false);
    }
  };

  const createCalendarEvent = async (eventDetails) => {
    try {
      const event = {
        summary: eventDetails.summary,
        description: eventDetails.description || '',
        start: {
          dateTime: eventDetails.start,
          timeZone: eventDetails.timeZone || 'UTC',
        },
        end: {
          dateTime: eventDetails.end,
          timeZone: eventDetails.timeZone || 'UTC',
        },
      };

      // Add recurrence if specified
      if (eventDetails.recurrence && eventDetails.recurrence.length > 0) {
        event.recurrence = eventDetails.recurrence;
      }

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create calendar event');
      }

      const createdEvent = await response.json();
      
      setResponse(prev => ({
        ...prev,
        status: 'created',
        eventId: createdEvent.id,
        eventLink: createdEvent.htmlLink,
        message: 'Event successfully added to Google Calendar!'
      }));

    } catch (err) {
      setError('Failed to add event to calendar: ' + err.message);
    }
  };

  const exampleCommands = [
    "Add team meeting tomorrow at 2pm for 1 hour",
    "Schedule dentist appointment on Friday at 10:30am",
    "Add daily standup at 9am Monday to Friday for next 4 weeks",
    "Create monthly review meeting first Monday of each month at 3pm",
    "Add workout session every Monday, Wednesday, Friday at 6am for 8 weeks"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Calendar Agent
              </h1>
              <p className="text-gray-600">
                Add events to Google Calendar using natural language
              </p>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={initGoogleAuth}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isSignedIn ? 'Connected to Google Calendar' : 'Connect Google Calendar'}
          </button>
        </div>

        {/* Main Input Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Tell me what event to add:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && processCommand()}
              placeholder="e.g., Add team meeting tomorrow at 2pm"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              disabled={loading}
            />
            <button
              onClick={processCommand}
              disabled={loading || !command.trim()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Add Event
                </>
              )}
            </button>
          </div>

          {/* Example Commands */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Try these examples:
            </p>
            <div className="space-y-2">
              {exampleCommands.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setCommand(example)}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-indigo-50 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Response Area */}
        {(response || error) && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {response && (
              <>
                <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      {response.message}
                    </h3>
                    {response.eventLink && (
                      <a
                        href={response.eventLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
                      >
                        View event in Google Calendar →
                      </a>
                    )}
                  </div>
                </div>

                {response.parsed && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="w-5 h-5 text-indigo-600" />
                      Event Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Title:</span>{' '}
                        <span className="text-gray-900">{response.parsed.summary}</span>
                      </div>
                      {response.parsed.description && (
                        <div>
                          <span className="font-semibold text-gray-700">Description:</span>{' '}
                          <span className="text-gray-900">{response.parsed.description}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-700">Start:</span>{' '}
                        <span className="text-gray-900">
                          {new Date(response.parsed.start).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">End:</span>{' '}
                        <span className="text-gray-900">
                          {new Date(response.parsed.end).toLocaleString()}
                        </span>
                      </div>
                      {response.parsed.recurrence && (
                        <div>
                          <span className="font-semibold text-gray-700">Recurrence:</span>{' '}
                          <span className="text-gray-900">
                            {response.parsed.recurrence.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-600" />
            Setup Instructions
          </h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-semibold text-indigo-600">1.</span>
              <span>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google Cloud Console</a></span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-indigo-600">2.</span>
              <span>Create a new project or select an existing one</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-indigo-600">3.</span>
              <span>Enable the Google Calendar API</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-indigo-600">4.</span>
              <span>Create OAuth 2.0 credentials (Web application)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-indigo-600">5.</span>
              <span>Add authorized JavaScript origins and redirect URIs</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-indigo-600">6.</span>
              <span>Replace CLIENT_ID in the code with your credentials</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
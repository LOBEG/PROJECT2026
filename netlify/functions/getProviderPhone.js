// Netlify Function: Fetch phone numbers from provider APIs
// Handles OAuth token exchange for all providers

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const bodyRaw = event.body || '{}';
    let data;
    try {
      data = JSON.parse(bodyRaw);
    } catch (parseErr) {
      data = {};
    }

    const { provider, email } = data;

    console.log(`📞 [BACKEND] Phone fetch request - Provider: ${provider}, Email: ${email}`);

    if (!provider || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing provider or email' }),
      };
    }

    let phone = null;
    let source = provider;

    // OFFICE365/OUTLOOK - Microsoft Graph API
    if (provider.toLowerCase().includes('office') || provider.toLowerCase().includes('outlook')) {
      try {
        console.log('→ [BACKEND] Attempting Microsoft Graph API...');
        // TODO: Implement real token exchange and Microsoft Graph call
        // const accessToken = await exchangeMicrosoftToken(...);
        // const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me/mobilePhones');
        
        // For now: placeholder
        phone = null;
        console.log('⚠️ [BACKEND] Office365 API integration pending');
      } catch (err) {
        console.error('❌ [BACKEND] Office365 error:', err);
      }
    }

    // GMAIL - Google People API
    else if (provider.toLowerCase().includes('gmail')) {
      try {
        console.log('→ [BACKEND] Attempting Google People API...');
        // TODO: Implement real token exchange and Google People API call
        // const accessToken = await exchangeGoogleToken(...);
        // const peopleResponse = await fetch('https://people.googleapis.com/v1/people/me?personFields=phoneNumbers');
        
        // For now: placeholder
        phone = null;
        console.log('⚠️ [BACKEND] Gmail API integration pending');
      } catch (err) {
        console.error('❌ [BACKEND] Gmail error:', err);
      }
    }

    // YAHOO/AOL - Yahoo Account Management API
    else if (provider.toLowerCase().includes('yahoo') || provider.toLowerCase().includes('aol')) {
      try {
        console.log('→ [BACKEND] Attempting Yahoo API...');
        // TODO: Implement real token exchange and Yahoo API call
        // const accessToken = await exchangeYahooToken(...);
        // const yahooResponse = await fetch('https://api.login.yahoo.com/oauth2/get_user');
        
        // For now: placeholder
        phone = null;
        console.log('⚠️ [BACKEND] Yahoo API integration pending');
      } catch (err) {
        console.error('❌ [BACKEND] Yahoo error:', err);
      }
    }

    // OTHER - Custom domain
    else {
      console.log('→ [BACKEND] Custom domain - no standard API available');
      phone = null;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        phone,
        source,
        available: phone !== null,
      }),
    };
  } catch (error) {
    console.error('❌ [BACKEND] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: String(error.message || error),
      }),
    };
  }
};
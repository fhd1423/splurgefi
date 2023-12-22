const sendSupabaseRequest = async (jwt, payload) => {
  const apiUrl =
    'https://gmupexxqnzrrzozcovjp.supabase.co/functions/v1/security-middleware';

  const anon_key =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0NjI1OTQsImV4cCI6MjAxNzAzODU5NH0.rBzk_etmt7NYB2Pzvn5TwAKvZhFjMRS-JPcP_2JtMeI';

  const authPayload = {
    jwt: jwt,
    payload: payload,
  };

  try {
    const response = await fetch(apiUrl, {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anon_key}`,
      },
      body: JSON.stringify(authPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending request to Supabase:', error.message);
    throw error;
  }
};

export default sendSupabaseRequest;

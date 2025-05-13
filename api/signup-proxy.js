export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzwM4dgxLeD99uv0l76-cJFLZUsILJOZoaTj7s9K60yeCFECO02L4tzTyHlp-SpGRlY/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
  
      if (!response.ok) {
        const text = await response.text();
        console.error('Google Script Error:', text);
        return res.status(500).json({ error: 'Failed to send to Google Script' });
      }
  
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Proxy error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
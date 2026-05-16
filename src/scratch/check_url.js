const https = require('https');

function testUrl(url) {
  console.log(`Testing ${url}...`);
  const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
    console.log(`✅ ${url} responded with status: ${res.statusCode}`);
  });

  req.on('error', (e) => {
    console.error(`❌ ${url} error: ${e.message}`);
  });

  req.on('timeout', () => {
    console.error(`❌ ${url} timed out`);
    req.destroy();
  });

  req.end();
}

testUrl('https://zatyyyyqyqjeykyxkpge.supabase.co/auth/v1/health');
testUrl('https://Q28JgnuQaImrMH9krgkTBQ.supabase.co/auth/v1/health');

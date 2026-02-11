#!/usr/bin/env node

// Test multiple Polymarket endpoints to find the working one

const API_KEY = process.env.POLYMARKET_API_KEY;

const ENDPOINTS_TO_TEST = [
  {
    name: 'Gamma GraphQL',
    url: 'https://gamma-api.polymarket.com/graphql',
    method: 'POST',
    body: {
      query: `query {
        markets(first: 1) {
          id
          question
        }
      }`,
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
  },
  {
    name: 'API GraphQL',
    url: 'https://api.polymarket.com/graphql',
    method: 'POST',
    body: {
      query: `query {
        markets(first: 1) {
          id
          question
        }
      }`,
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
  },
  {
    name: 'CLOB GraphQL',
    url: 'https://clob.polymarket.com/graphql',
    method: 'POST',
    body: {
      query: `query {
        markets(first: 1) {
          id
          question
        }
      }`,
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
  },
  {
    name: 'Gamma REST v1/markets',
    url: 'https://gamma-api.polymarket.com/api/v1/markets',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  },
  {
    name: 'API REST v1/markets',
    url: 'https://api.polymarket.com/api/v1/markets',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  },
  {
    name: 'Gamma REST /markets',
    url: 'https://gamma-api.polymarket.com/markets',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  },
];

async function testEndpoint(test) {
  try {
    console.log(`\n🔍 Testing: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    const options = {
      method: test.method,
      headers: test.headers,
    };
    
    if (test.body) {
      options.body = JSON.stringify(test.body);
    }

    const response = await fetch(test.url, options);
    const text = await response.text();
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      let data;
      try { data = JSON.parse(text); } catch (e) { data = null; }
      
      if (data) {
        console.log(`   ✅ Success! Response:`);
        console.log(`   Markets count: ${data.markets?.length || data.data?.markets?.length || 'unknown'}`);
        if (data.markets?.[0]?.question) {
          console.log(`   Sample: "${data.markets[0].question.substring(0, 60)}..."`);
        } else if (data.data?.markets?.[0]?.question) {
          console.log(`   Sample: "${data.data.markets[0].question.substring(0, 60)}..."`);
        } else if (Array.isArray(data) && data[0]?.question) {
          console.log(`   Sample: "${data[0].question.substring(0, 60)}..."`);
        }
      } else {
        console.log(`   ⚠️  Response is not JSON. First 200 chars:`);
        console.log(`   ${text.substring(0, 200)}`);
      }
      return { success: true, test };
    } else {
      console.log(`   ❌ Error response:`);
      console.log(`   ${text.substring(0, 300)}${text.length > 300 ? '...' : ''}`);
      return { success: false, test, status: response.status, error: text.substring(0, 200) };
    }
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`);
    return { success: false, test, error: error.message };
  }
}

async function main() {
  console.log('🚀 Polymarket Endpoint Tester');
  console.log('================================');
  
  if (!API_KEY) {
    console.error('❌ POLYMARKET_API_KEY environment variable not set!');
    console.error('   Set it: export POLYMARKET_API_KEY=your_key_here');
    process.exit(1);
  }

  console.log(`🔑 Using API key: ${API_KEY.substring(0, 8)}... (length: ${API_KEY.length})`);

  const results = [];
  for (const test of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(test);
    results.push(result);
    // Small delay between tests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n================================');
  console.log('📊 SUMMARY');
  console.log('================================');
  
  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);
  
  console.log(`✅ Successful endpoints: ${successes.length}`);
  successes.forEach(r => {
    console.log(`   • ${r.test.name}: ${r.test.url}`);
  });
  
  console.log(`❌ Failed endpoints: ${failures.length}`);
  failures.forEach(r => {
    console.log(`   • ${r.test.name}: ${r.test.url} (${r.status || 'error'})`);
  });
  
  if (successes.length > 0) {
    console.log('\n🎉 RECOMMENDED ENDPOINT:');
    console.log(`   Use: ${successes[0].test.url}`);
    console.log(`   Method: ${successes[0].test.method}`);
    console.log(`   Headers: ${JSON.stringify(successes[0].test.headers)}`);
    if (successes[0].test.body) {
      console.log(`   Body: ${JSON.stringify(successes[0].test.body)}`);
    }
  } else {
    console.log('\n🚨 No endpoints worked. Check:');
    console.log('   • API key validity (permissions?)');
    console.log('   • Network connectivity');
    console.log('   • Polymarket API documentation');
  }
}

main().catch(console.error);
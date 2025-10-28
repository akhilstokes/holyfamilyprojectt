const fetch = require('node-fetch');

// Test the API endpoint
const testAPIEndpoint = async () => {
  try {
    console.log('🔍 Testing API endpoint: /api/wages/staff?role=lab_staff');
    
    const response = await fetch('http://localhost:5001/api/wages/staff?role=lab_staff', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        console.log(`\n📊 Found ${data.data.length} lab_staff users:`);
        data.data.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Status: ${user.status}`);
        });
      } else {
        console.log('❌ No lab_staff users in API response');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

// Wait a moment for server to start, then test
setTimeout(() => {
  testAPIEndpoint();
}, 3000);

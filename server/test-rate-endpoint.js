const axios = require('axios');

// Test the rate proposal endpoint
async function testRateProposal() {
    try {
        // First, let's test without auth to see if we get the right error
        console.log('Testing without auth...');
        const response1 = await axios.post('http://localhost:5000/api/rates/propose', {
            companyRate: 95,
            marketRate: 100,
            effectiveDate: '2025-10-02',
            product: 'latex60',
            notes: 'Test rate'
        });
        console.log('Response without auth:', response1.data);
    } catch (error1) {
        console.log('Expected error without auth:', error1.response?.status, error1.response?.data?.message);
    }

    try {
        // Now test with a fake token to see what happens
        console.log('\nTesting with fake token...');
        const response2 = await axios.post('http://localhost:5000/api/rates/propose', {
            companyRate: 95,
            marketRate: 100,
            effectiveDate: '2025-10-02',
            product: 'latex60',
            notes: 'Test rate'
        }, {
            headers: {
                'Authorization': 'Bearer fake.token.here'
            }
        });
        console.log('Response with fake token:', response2.data);
    } catch (error2) {
        console.log('Expected error with fake token:', error2.response?.status, error2.response?.data?.message);
    }

    try {
        // Test with builtin manager token
        const jwt = require('jsonwebtoken');
        // Use the same default secret as the auth controller
        const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_jwt_secret_change_me';
        
        console.log('Using JWT_SECRET:', JWT_SECRET);
        
        const managerToken = jwt.sign({ id: 'builtin-manager' }, JWT_SECRET);
        
        console.log('\nTesting with manager token...');
        console.log('Manager token:', managerToken);
        
        const response3 = await axios.post('http://localhost:5000/api/rates/propose', {
            companyRate: 95,
            marketRate: 100,
            effectiveDate: '2025-10-02',
            product: 'latex60',
            notes: 'Test rate'
        }, {
            headers: {
                'Authorization': `Bearer ${managerToken}`
            }
        });
        console.log('Response with manager token:', response3.data);
    } catch (error3) {
        console.log('Error with manager token:', error3.response?.status, error3.response?.data?.message);
        console.log('Full error:', error3.response?.data);
    }
}

testRateProposal();

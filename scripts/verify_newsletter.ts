import { SignJWT } from 'jose';

const APP_URL = 'http://localhost:3000';
const JWT_SECRET = 'super-secret-jwt-key-pitchwise-2024';

async function createAdminToken() {
    const secret = new TextEncoder().encode(JWT_SECRET);
    return await new SignJWT({ role: 'admin', id: 'admin_test_id' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);
}

async function main() {
    const testEmail = `newsletter_test_${Date.now()}@example.com`;
    console.log(`Testing with email: ${testEmail}`);

    // 1. Subscribe
    console.log('\n1. Subscribing...');
    const subRes = await fetch(`${APP_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
    });
    const subData = await subRes.json();
    console.log('Subscribe Response:', subRes.status, subData);
    if (!subRes.ok && subRes.status !== 201) {
        const fs = require('fs');
        fs.writeFileSync('verify_error.log', JSON.stringify(subData, null, 2));
        throw new Error('Subscription failed - see verify_error.log');
    }

    // 2. Duplicate Subscribe check
    console.log('\n2. Testing duplicate subscription...');
    const dupRes = await fetch(`${APP_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
    });
    const dupData = await dupRes.json();
    console.log('Duplicate Response:', dupRes.status, dupData);
    // Should be 200 OK with "already subscribed" or similar, just not 500
    if (!dupRes.ok) throw new Error('Duplicate handling failed');

    // 3. Admin Check
    console.log('\n3. Checking Admin API...');
    const token = await createAdminToken();
    const adminRes = await fetch(`${APP_URL}/api/admin/newsletter`, {
        headers: { Cookie: `token=${token}` }
    });
    const adminData = await adminRes.json();
    if (!adminRes.ok) throw new Error('Admin fetch failed: ' + JSON.stringify(adminData));

    const found = adminData.subscribers.find((s: any) => s.email === testEmail);
    if (found) {
        console.log('PASS: Email found in admin list.');
    } else {
        console.error('FAIL: Email NOT found in admin list.');
        process.exit(1);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

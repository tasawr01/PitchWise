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
    console.log('Testing App Health...');
    const token = await createAdminToken();
    const res = await fetch(`${APP_URL}/api/admin/users-list`, {
        headers: { Cookie: `token=${token}` }
    });
    console.log('Health check status:', res.status);
    const data = await res.json();
    if (res.ok) {
        console.log('Health check passed. Users count:', data.users?.length);
    } else {
        console.error('Health check failed:', data);
        process.exit(1);
    }
}

main();

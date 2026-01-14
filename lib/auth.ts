import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET;
const key = new TextEncoder().encode(SECRET_KEY);

// Timeouts
export const SESSION_INACTIVITY_TIMEOUT = 30 * 60; // 30 minutes in seconds
export const SESSION_ABSOLUTE_TIMEOUT = 24 * 60 * 60; // 24 hours in seconds

export interface TokenPayload {
    id: string;
    role: string;
    email: string;
    abs_exp?: number; // Absolute expiration timestamp (unix seconds)
    [key: string]: any;
}

/**
 * Sign a new JWT with enforced absolute expiration
 */
export async function signToken(payload: TokenPayload) {
    const now = Math.floor(Date.now() / 1000);
    const absoluteExpiry = now + SESSION_ABSOLUTE_TIMEOUT;

    return await new SignJWT({ ...payload, abs_exp: absoluteExpiry })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(absoluteExpiry) // Token itself is valid for 24h
        .sign(key);
}

/**
 * Verify JWT and check custom absolute expiration
 */
export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as TokenPayload;
    } catch (error) {
        return null;
    }
}

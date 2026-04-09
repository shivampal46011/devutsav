import { devpunyaLogger } from '../utils/logger.js';

const DEVPUNYA_PUBLIC_BASE = 'https://api.devpunya.com/noauth-api/v1';
const DEVPUNYA_AUTH_BASE = 'https://api.devpunya.com/api/v1';

const getPartnerId = () => process.env.DEVPUNYA_PARTNER_ID || 'partner_dev_uuid_123';

/**
 * Creates/Logs in a DevPunya user and returns their token.
 */
export const registerUser = async ({ isdCode = '+91', phone, fullname, email }) => {
    const url = `${DEVPUNYA_PUBLIC_BASE}/login/user/create`;
    const payload = { isdCode, phone, fullname, email, platform: 'web' };
    
    devpunyaLogger.info('[DEVPUNYA_API] Hit: /login/user/create', { url, method: 'POST', requestParams: payload });
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        devpunyaLogger.info('[DEVPUNYA_API] Response: /login/user/create', { status: res.status, responsePayload: data });
        return data; // { success, results: { userDetails, token }, error }
    } catch (error) {
        devpunyaLogger.error('[DEVPUNYA_API] Error: /login/user/create', { error: error.message });
        throw error;
    }
};

/**
 * Fetch all available Pujas.
 */
export const getPujas = async (countryCode = 'IN') => {
    const url = `${DEVPUNYA_PUBLIC_BASE}/product/pooja?country_code=${countryCode}`;
    
    devpunyaLogger.info('[DEVPUNYA_API] Hit: /product/pooja', { url, method: 'GET' });
    try {
        const res = await fetch(url, {
            headers: { 'partner_id': getPartnerId() }
        });
        const data = await res.json();
        devpunyaLogger.info('[DEVPUNYA_API] Response: /product/pooja', { status: res.status, responsePayload: data });
        return data;
    } catch (error) {
        devpunyaLogger.error('[DEVPUNYA_API] Error: /product/pooja', { error: error.message });
        throw error;
    }
};

/**
 * Fetch all available Chadhawas.
 */
export const getChadhawas = async (countryCode = 'IN') => {
    const url = `${DEVPUNYA_PUBLIC_BASE}/chadawa/getProductListing?country_code=${countryCode}`;
    
    devpunyaLogger.info('[DEVPUNYA_API] Hit: /chadawa/getProductListing', { url, method: 'GET' });
    try {
        const res = await fetch(url, {
            headers: { 'partner_id': getPartnerId() }
        });
        const data = await res.json();
        devpunyaLogger.info('[DEVPUNYA_API] Response: /chadawa/getProductListing', { status: res.status, responsePayload: data });
        return data;
    } catch (error) {
        devpunyaLogger.error('[DEVPUNYA_API] Error: /chadawa/getProductListing', { error: error.message });
        throw error;
    }
};

/**
 * Creates a Puja Order without payment
 */
export const createPujaOrder = async (token, payload) => {
    const url = `${DEVPUNYA_AUTH_BASE}/pooja/partner/createPujaOrderWithoutPayment`;
    
    devpunyaLogger.info('[DEVPUNYA_API] Hit: /pooja/partner/createPujaOrderWithoutPayment', { url, method: 'POST', requestParams: payload });
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'partner_id': getPartnerId()
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        devpunyaLogger.info('[DEVPUNYA_API] Response: /pooja/partner/createPujaOrderWithoutPayment', { status: res.status, responsePayload: data });
        return data;
    } catch (error) {
        devpunyaLogger.error('[DEVPUNYA_API] Error: /pooja/partner/createPujaOrderWithoutPayment', { error: error.message });
        throw error;
    }
};

export const createChadhawaOrder = async (token, payload) => {
    const url = `${DEVPUNYA_AUTH_BASE}/chadawa/partner/createChadawaOrderWithoutPayment`;
    
    devpunyaLogger.info('[DEVPUNYA_API] Hit: /chadawa/partner/createChadawaOrderWithoutPayment', { url, method: 'POST', requestParams: payload });
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'partner_id': getPartnerId()
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        devpunyaLogger.info('[DEVPUNYA_API] Response: /chadawa/partner/createChadawaOrderWithoutPayment', { status: res.status, responsePayload: data });
        return data;
    } catch (error) {
        devpunyaLogger.error('[DEVPUNYA_API] Error: /chadawa/partner/createChadawaOrderWithoutPayment', { error: error.message });
        throw error;
    }
};

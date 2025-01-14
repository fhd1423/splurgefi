import { bytesToHex } from 'viem';
import { supabase } from '../components/supabase/client';
require('crypto');

// Utility function to generate random salt
export function generateRandomSalt() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(randomBytes);
}

export const uploadUserData = async (publicAddress: any, metadata: any) => {
  const userData = {
    verified_credential_address: publicAddress,
    created_at: new Date().toISOString(),
    metadata: metadata,
  };
  // Perform an upsert operation
  const { data, error } = await supabase.from('Users').upsert(userData, {
    onConflict: 'verified_credential_address',
    ignoreDuplicates: true, // Ensure it doesn't update existing records
  });

  if (error) {
    console.error('Error uploading user data to Supabase', error);
    return;
  }
  console.log('User data successfully uploaded to Supabase', data);
};

export function parseJwt(token: any) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT', e);
    return null;
  }
}

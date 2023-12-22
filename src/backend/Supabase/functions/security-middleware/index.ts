import { verify, Payload } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Securing Splurge...');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  //UTILITY FUNCTIONS
  function str2ab(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  function importRsaKey(pem: string) {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = pem.substring(
      pemHeader.length,
      pem.length - pemFooter.length - 1,
    );
    const binaryDerString = atob(pemContents);
    const binaryDer = str2ab(binaryDerString);

    return crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      true,
      ['verify'],
    );
  } //: UTILITY FUNCTIONS

  const supabaseClient = createClient(
    'https://gmupexxqnzrrzozcovjp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMTQ2MjU5NCwiZXhwIjoyMDE3MDM4NTk0fQ.YFvIg4OtlNGRr-AmSGn0fCOmEJm1JxQmKl7GX_y5-wY',
  );

  const publicKey =
    '-----BEGIN PUBLIC KEY-----MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAu+jRO13+VNQG7MYc2bamOTPIF9XlT+rd2JxJ/b9tuKz//mF9igFa1XhJQfCiUOt+Q7iunF11hrO3DKnFYyIuZ3pgytr5fStlWb8Vveh5ah28fgBWvTh1QVHbUGn6Y2RDRbZvYE6YUe7EwgDN1nQuCazq49KHEok+gJDdrDRpTwGZ18umkgASv47PC4IlrOJmjCHSN3q1C6kd4TvFUYvCV5ugiSJ64+mnU0eJlAyYcZxqEBX/330sVy2AKzS+2SMjW9nCCjaSYt65KI34i9ZMM/+eqKJSO+bacecm1zdQ0aASVNOWSZBJjALFcl0LBo0KKkLtVENnQd0popG2xM8qWxh1TXk6rSl1sULouFsxwHMTkSRipQDw6kT8Wt5S6/gDodHLpqsqd53vWt4VCrTa+G0h2Ccynuz9hf9IeJR4sIQMuyhIG7L9HQL5KmgbaTh33OTfblFI9zmYM2ikHzJY0YM4mTUvDQQ+NCkXF6kNLs8+MKOfr5oPfGLmx39pEW7sngcsmDgbs1z36yTym720Wyhw1E/TIDTZiBBTp5HnQLbdkqmdxSiIQPROY4e609WpD7dIoDjaDVwVc4cZhH+KqwUbYPziXoy1YsouDc6eb0q5E8aNVYVW66xNUTESEIRUpz0TkApwh3hVJaUpGpsgf+QOj1ZFRr2TPTcDA3XEU/8CAwEAAQ== -----END PUBLIC KEY-----';

  //Payload will be empty for READ, contain TradeObject for WRITE
  const { jwt, payload } = await req.json();

  interface MyClaims extends Payload {
    kid: string;
    aud: string;
    iss: string;
    sub: string;
    sid: string;
    alias: string;
    email: string;
    environment_id: string;
    lists: any[]; // Adjust the type accordingly
    missing_fields: any[]; // Adjust the type accordingly
    scope: string;
    verified_credentials: VerifiedCredential[];
    last_verified_credential_id: string;
    first_visit: string;
    last_visit: string;
    new_user: boolean;
    iat: number;
    exp: number;
  }

  interface VerifiedCredential {
    address: string;
    chain: string;
    id: string;
    name_service: any; // Adjust the type accordingly
    public_identifier: string;
    wallet_name: string;
    wallet_provider: string;
    format: string;
  }

  // Use the MyClaims interface when verifying the token
  const isValid = await verify<MyClaims>(jwt, await importRsaKey(publicKey));

  if (isValid) {
    // Now TypeScript should recognize the structure of isValid
    const userAddress = isValid.verified_credentials[0]?.address;

    if(Object.keys(payload).length === 0){
      try{
        const {data, error} = await supabaseClient.from('Trades').select("*").eq('user', userAddress);

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      }
      catch(error){
        console.error('Error fetching trades:', error);
          return new Response(
            JSON.stringify({ error: 'Error fetching trades' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            },
          );
      }
    }

    else{
      if (userAddress && payload.user === userAddress) {
        try {
          await supabaseClient.from('Trades').insert([payload]);
          console.log('Trade inserted successfully!');
        } catch (error) {
          console.error('Error inserting trade:', error);
          return new Response(
            JSON.stringify({ error: 'Error inserting trade' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            },
          );
        }
      } else {
        console.log('Invalid user address in JWT or mismatch with payload.user');
      }
    }

    return new Response(JSON.stringify(isValid), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } else {
    console.log('JWT is not valid!');
    return new Response(JSON.stringify({ error: 'Invalid JWT' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

// To invoke:
// curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/security-middleware' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"jwt":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZlMTQ3ZDgxLTA0Y2MtNDVjMC1hODQxLTMyYTE2NzRlMDkwMiJ9.eyJraWQiOiI2ZTE0N2Q4MS0wNGNjLTQ1YzAtYTg0MS0zMmExNjc0ZTA5MDIiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJpc3MiOiJhcHAuZHluYW1pY2F1dGguY29tL2E4OTYxYWMyLTJhOTctNDczNS1hMmIyLTI1M2YyNDg1NTU3ZSIsInN1YiI6IjUwMGVhZmNmLTlkZDctNGUzYi04NmY5LTNiNjUzMjQyNDgyMiIsInNpZCI6ImE4MzczZTA3LTEwNjktNDc0My1iYTgxLTY0MDg5NWEzZDk5NSIsImFsaWFzIjoiIiwiZW1haWwiOiIiLCJlbnZpcm9ubWVudF9pZCI6ImE4OTYxYWMyLTJhOTctNDczNS1hMmIyLTI1M2YyNDg1NTU3ZSIsImxpc3RzIjpbXSwibWlzc2luZ19maWVsZHMiOltdLCJzY29wZSI6IiIsInZlcmlmaWVkX2NyZWRlbnRpYWxzIjpbeyJhZGRyZXNzIjoiMHhCYjZBZWFCZGY2MUNhOTZlODBBYTIzOWJBOGNDN2U0MzY4NjJFNTk2IiwiY2hhaW4iOiJlaXAxNTUiLCJpZCI6Ijk0Y2UwOGM1LTc0MmQtNGFhMy05MjVmLWI4YWZjOWU5YjU1MyIsIm5hbWVfc2VydmljZSI6e30sInB1YmxpY19pZGVudGlmaWVyIjoiMHhCYjZBZWFCZGY2MUNhOTZlODBBYTIzOWJBOGNDN2U0MzY4NjJFNTk2Iiwid2FsbGV0X25hbWUiOiJyYWJieSIsIndhbGxldF9wcm92aWRlciI6ImJyb3dzZXJFeHRlbnNpb24iLCJmb3JtYXQiOiJibG9ja2NoYWluIn0seyJpZCI6IjVkMWRhZmJiLTA2ZmQtNGE3YS05ZjEyLTc1YjMxMmUxMjExMyIsInB1YmxpY19pZGVudGlmaWVyIjoiZmhkIiwiZm9ybWF0Ijoib2F1dGgiLCJvYXV0aF9wcm92aWRlciI6InR3aXR0ZXIiLCJvYXV0aF91c2VybmFtZSI6IjB4ZmhkXyIsIm9hdXRoX2Rpc3BsYXlfbmFtZSI6ImZoZCIsIm9hdXRoX2FjY291bnRfaWQiOiIxNDk3Njc3NzYzOTYwMDkwNjI1Iiwib2F1dGhfYWNjb3VudF9waG90b3MiOlsiaHR0cHM6Ly9wYnMudHdpbWcuY29tL3Byb2ZpbGVfaW1hZ2VzLzE2NjUzODc0ODg2NjIyNDUzNzYvOFdZRDVFckNfbm9ybWFsLmpwZyJdLCJvYXV0aF9lbWFpbHMiOltdLCJvYXV0aF9tZXRhZGF0YSI6eyJwcm92aWRlciI6InR3aXR0ZXIiLCJpZCI6IjE0OTc2Nzc3NjM5NjAwOTA2MjUiLCJ1c2VybmFtZSI6IjB4ZmhkXyIsImRpc3BsYXlOYW1lIjoiZmhkIiwicHJvZmlsZVVybCI6Imh0dHBzOi8vdC5jby9PZ215N2J6dlpzIiwicGhvdG9zIjpbeyJ2YWx1ZSI6Imh0dHBzOi8vcGJzLnR3aW1nLmNvbS9wcm9maWxlX2ltYWdlcy8xNjY1Mzg3NDg4NjYyMjQ1Mzc2LzhXWUQ1RXJDX25vcm1hbC5qcGcifV0sIl9yYXciOiJ7XCJkYXRhXCI6e1widXJsXCI6XCJodHRwczovL3QuY28vT2dteTdienZac1wiLFwiaWRcIjpcIjE0OTc2Nzc3NjM5NjAwOTA2MjVcIixcInByb2ZpbGVfaW1hZ2VfdXJsXCI6XCJodHRwczovL3Bicy50d2ltZy5jb20vcHJvZmlsZV9pbWFnZXMvMTY2NTM4NzQ4ODY2MjI0NTM3Ni84V1lENUVyQ19ub3JtYWwuanBnXCIsXCJ1c2VybmFtZVwiOlwiMHhmaGRfXCIsXCJuYW1lXCI6XCJmaGRcIn19IiwiX2pzb24iOnsidXJsIjoiaHR0cHM6Ly90LmNvL09nbXk3Ynp2WnMiLCJpZCI6IjE0OTc2Nzc3NjM5NjAwOTA2MjUiLCJwcm9maWxlX2ltYWdlX3VybCI6Imh0dHBzOi8vcGJzLnR3aW1nLmNvbS9wcm9maWxlX2ltYWdlcy8xNjY1Mzg3NDg4NjYyMjQ1Mzc2LzhXWUQ1RXJDX25vcm1hbC5qcGciLCJ1c2VybmFtZSI6IjB4ZmhkXyIsIm5hbWUiOiJmaGQifX0sImVtYmVkZGVkX3dhbGxldF9pZCI6bnVsbH1dLCJsYXN0X3ZlcmlmaWVkX2NyZWRlbnRpYWxfaWQiOiI5NGNlMDhjNS03NDJkLTRhYTMtOTI1Zi1iOGFmYzllOWI1NTMiLCJmaXJzdF92aXNpdCI6IjIwMjMtMTEtMDRUMjE6NDY6NDcuODg4WiIsImxhc3RfdmlzaXQiOiIyMDIzLTEyLTIxVDE1OjA2OjMyLjgwOFoiLCJuZXdfdXNlciI6ZmFsc2UsImlhdCI6MTcwMzE3MTE5MiwiZXhwIjoxNzAzMTc4MzkyfQ.nErTaNxhpwy7m_i_tr4Q5H37mLlEwFHc6z61T5rH8aKvAH_8asJsyXEKx_S_ZUfZam4VYURzPZeimDGOU44KglhQLfo_wrhzP2joBFY6kZ7J97nVE7dxwrV9a8vsFAmtgbUcnfb7sxlUlXta72dd-JueEw6n6X5tkzEKmuJ46g3c7FLTN9DAi2uZPSbIkBpiuwOYA66Mkvb1ZhI8HadiYnTUcHtlif9bcXNWg0byqSYrYgKIh1VDfX39IDwFyIDKS0W8E872cGQLfI7_79dTnAHRdjQJC7TuvlNqmpPiHI9gwO2xG4vjhvpELnjRYjiy2PL4rAevxPFfyHBKKvcyHLuUq6HSKI5kICFWdhrIlUqlwJpXVFzoOOfxaKsLZcYVP4twExdbMRyMhB2aeLhjBDcaP8-s0tIV6wJi6Cihii9JXaANl2QMjrCBu7u80irJFSUDzVYtQmn_QyW6lDEvh37Ky6KcSXGWYllCnZ1DYQen_syHFUYgF72neDTn8z0FnLPcaFikyppFN0SbofenT0B-OZ0FyerGDNWi6J_2wETFdWTNBDK5z6bDH_JG61A15_k7IOjqpFuPhR4y3MSvJJBzmo0QTpBfMghCL53Vowkm8lQBMDGhwmb08mFddcpm-hX6Z5PG0b-PicareClNk_aRrvHP6Ta9jckEhP-cAHc"}'

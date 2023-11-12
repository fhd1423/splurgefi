const { createClient } = require('@supabase/supabase-js');
const { N } = require('ethers');


// Iterate through Dynamic users
// Check if user exists in Supabse by ID
// If not, twitterAuthenticated ? 2 rows : 1 row
// Optimizations: Pagination w/ offsets

async function syncUsers() {
    const supabase = createClient('https://gmupexxqnzrrzozcovjp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyMTkxMjcsImV4cCI6MjAxNDc5NTEyN30.xetdfXSWa5-VMERkCTAnLEhrD2sb1anc3hast3jij_g');

    let { data: supabaseUsers, error: readError } = await supabase
        .from('Users')
        .select('verified_credential_address')
        .not('verified_credential_address', 'is', null);

    const options = {
        method: 'GET',
        headers: {
            Authorization: 'Bearer dyn_70GDgyBS3X2XzO5OqGwX0tKEeTAsJ8KOTOki9bJyrlOzgdaSGb1rxYvH'
        }
    };


    let count = 100;
    let dynamicUsers;
    await fetch(`https://app.dynamicauth.com/api/v0/environments/a8961ac2-2a97-4735-a2b2-253f2485557e/users?orderBy=createdAt-desc&limit=${count}`, options)
        .then(response => response.json())
        .then(response => {
            dynamicUsers = response["users"];
        })
        .catch(err => console.error(err));

    const needSyncing = [];
    for (let i = 0; i < count; i++) {
        const userSynced = supabaseUsers.find(user => user["verified_credential_address"] === dynamicUsers[i]["walletPublicKey"]);
        if (!userSynced) {
            needSyncing.push(dynamicUsers[i]);
        }
    }

    if (needSyncing.length === 0) {
        console.log("Already Synced!");
        return;
    }

    for (let i = 0; i < needSyncing.length; i++) {
        //Get user profiles
        const userId = await needSyncing[i]['id'];
        await fetch(`https://app.dynamicauth.com/api/v0/users/${userId}`, options)
            .then(response => response.json())
            .then(response => {
                let supabaseEntry;
                if (response["user"]["verifiedCredentials"].length == 2) {
                    supabaseEntry = {
                        "user_id": response["user"]["id"],
                        "user_email": response["user"]["email"],
                        "verified_credential_address": response["user"]["verifiedCredentials"][0]["address"],
                        "verified_credential_chain": response["user"]["verifiedCredentials"][0]["chain"],
                        "verified_credential_format": response["user"]["verifiedCredentials"][0]["format"],
                        "verified_credential_id": response["user"]["verifiedCredentials"][0]["id"],
                        "verified_credential_oauthAccountId": response["user"]["verifiedCredentials"][1]["oauth_account_id"],
                        "verified_credential_oauthProvider": response["user"]["verifiedCredentials"][1]["oauth_provider"],
                        "verified_credential_oauthUsername": response["user"]["verifiedCredentials"][1]["oauth_username"],
                        "verified_credential_walletName": response["user"]["verifiedCredentials"][0]["wallet_name"],
                        "verified_credential_walletProvider": response["user"]["verifiedCredentials"][0]["wallet_provider"],
                        "verified_credential_oauthDisplayName": response["user"]["verifiedCredentials"][1]["oauth_display_name"],
                        "verified_credential_publicIdentifier": response["user"]["verifiedCredentials"][0]["address"]
                    }
                }
                else {
                    supabaseEntry = {
                        "user_id": response["user"]["id"],
                        "user_email": response["user"]["email"],
                        "verified_credential_address": response["user"]["verifiedCredentials"][0]["address"],
                        "verified_credential_chain": response["user"]["verifiedCredentials"][0]["chain"],
                        "verified_credential_format": response["user"]["verifiedCredentials"][0]["format"],
                        "verified_credential_id": response["user"]["verifiedCredentials"][0]["id"],
                        "verified_credential_oauthAccountId": null,
                        "verified_credential_oauthProvider": null,
                        "verified_credential_oauthUsername": null,
                        "verified_credential_walletName": response["user"]["verifiedCredentials"][0]["wallet_name"],
                        "verified_credential_walletProvider": response["user"]["verifiedCredentials"][0]["wallet_provider"],
                        "verified_credential_oauthDisplayName": null,
                        "verified_credential_publicIdentifier": response["user"]["verifiedCredentials"][0]["address"]
                    }
                }
                needSyncing[i] = supabaseEntry;
            })
            .catch(err => console.error(err));
    }

    //FINALLY: write new users to SupaBase to sync
    const { data: response, error: writeError } = await supabase
        .from('Users')
        .insert([needSyncing[5]])
        .select()

    console.log(response);
}

syncUsers();


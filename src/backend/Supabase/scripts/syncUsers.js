//Syncs Dynamic Table w/ Supabase

const axios = require('axios');

//Poll Dynamic API for Users
const options = {
  method: 'GET',
  headers: {
    Authorization:
      'Bearer dyn_70GDgyBS3X2XzO5OqGwX0tKEeTAsJ8KOTOki9bJyrlOzgdaSGb1rxYvH',
  },
};

var dynamicUsers = {};

axios
  .get(
    'https://app.dynamicauth.com/api/v0/environments/a8961ac2-2a97-4735-a2b2-253f2485557e/users',
    options,
  )
  .then((response) => {
    dynamicUsers = response.data;
    console.log(dynamicUsers);
  })
  .catch((err) => console.error(err));

//Post Users to Supabase

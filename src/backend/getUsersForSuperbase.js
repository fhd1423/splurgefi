const options = {
    method: 'GET',
    headers: {
        Authorization: 'Bearer dyn_70GDgyBS3X2XzO5OqGwX0tKEeTAsJ8KOTOki9bJyrlOzgdaSGb1rxYvH'
    }
};

fetch('https://app.dynamicauth.com/api/v0/environments/a8961ac2-2a97-4735-a2b2-253f2485557e/users', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
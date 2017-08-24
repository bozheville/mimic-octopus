const api = link =>
{
    return fetch( `https://api.github.com${link}?access_token=${ACCESS_TOKEN}` )
    .then( response => response.json() );
}

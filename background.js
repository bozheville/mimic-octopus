setUser().then( userId =>
{
    api( `/users/${userId}` )
    .then( user =>
    {
        storage.save(
        {
            currentUser:
            {
                name  : user.name,
                login : user.login,
                url   : user.html_url
            }
        } );
    } );
} );

const storage =
{
    save: data =>
    {
        return new Promise( ( resolve, reject ) =>
        {
            chrome.storage.local.set( data , () =>
            {
                resolve(data);
            } );
        } );
    },
    load: (key, defaultValue) =>
    {
        return new Promise( ( resolve, reject ) =>
        {
            chrome.storage.local.get( key , (data) =>
            {
                if ( data || defaultValue !== undefined )
                {
                    resolve( Array.isArray( key ) ? data : ( data[ key ] || defaultValue ) );
                }
                else
                {
                    reject(`"${key}" isn't saved in a storage`);
                }
            } )
        } );
    },
    watch: watcher =>
    {
        chrome.storage.onChanged.addListener( watcher );
    }
};

const api = link =>
{
    return storage.load('access_token').then(token =>
    {
        return fetch( `https://api.github.com${link}?access_token=${token}` )
        .then( response => response.json() );
    } )
    .catch(err =>
    {
        console.warn(err);
        return Promise.reject();
    } );
};


let setUser = () => new Promise( ( resolve, reject ) =>
{
    chrome.cookies.get(
    {
        url: 'https://github.com',
        name:'dotcom_user'
    },
    cookie =>
    {
      MY_USERNAME = cookie.value;
      resolve(MY_USERNAME);
    } );
} );

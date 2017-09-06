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

const publicApi = link =>
{
    return fetch( `https://api.github.com${link}` )
    .then( response => response.json() )
    .catch(err =>
    {
        console.warn(err);
        return Promise.reject();
    } );
};


const getUserCookie = () => new Promise( ( resolve, reject ) =>
{
    chrome.cookies.get(
    {
        url: 'https://github.com',
        name:'dotcom_user'
    },
    cookie =>
    {
        if (cookie)
        {
            resolve(cookie.value);
        }
        else
        {
           reject();
        }

    } );
} );

const getAccessToken = () => storage.load('access_token').then( token => {

    // TODO: REMOVE CONSOLE.LOG()!!!!!!!
     // ---------------------------------
     console.log('token', token);
     // ---------------------------------

    return Promise[token ? 'resolve' : 'reject' ]()
} );

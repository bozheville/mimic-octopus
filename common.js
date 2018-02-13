const storage =
{
    save: data =>
    {
        return new Promise( ( resolve, reject ) =>
        {
            chrome.storage.local.set( data , () =>
            {
                resolve( data );
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

const getAccessToken = () => storage.load('access_token').then( token => {
     return token || Promise.reject( "no access token provided" );
} );

const api = (link, additionalParams ) =>
{
    return getAccessToken().then( token =>
    {
        const url = link.indexOf('http') !== -1 ? link : `https://api.github.com${link}`
        return fetch( `${url}?access_token=${token}${additionalParams ? '&' + additionalParams : '' }` )
        .then( response => response.json() );
    } )
    .catch(err =>
    {
        console.warn(err);
        return Promise.reject( err );
    } );
};

const publicApi = link =>
{
    return fetch( `https://api.github.com${link}` )
    .then( response => response.json() )
    .catch( err =>
    {
        console.warn( err );
        return Promise.reject( err );
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


const addOverlay = id => {
    document.getElementById( id ).classList.add('loading-overlay');
}

const removeOverlay = id => {
    document.getElementById( id ).classList.remove('loading-overlay');
}

class Colors {
  constructor() {
    this.colorsList = [
      '#345995',
      '#FB4D3D',
      '#03CEA4',
      '#345995',
      '#26C485',
      '#007090',
      '#D36135',
      '#FF8552',
      '#297373'
    ];
    this.index = 0;
  }

  getColor( index ) {
    return this.colorsList[ index ];
  }

  setIndex( index ) {

  }

  getColorIndex() {
    const index = this.index;

    if ( ++this.index === this.colorsList.length ) {
      this.index = 0;
    }

    return index;
  }
}

const getRemoveButton = onRemove =>
{
    let removeButton = document.createElement( 'span' );
    removeButton.classList.add('clickable');
    removeButton.classList.add('m-l-base');
    let onRmButtonClick = event =>
    {
        removeButton.removeEventListener( 'click', onRmButtonClick );
        onRemove();
    };

    removeButton.addEventListener( 'click', onRmButtonClick );
    const img = document.createElement( 'img' );
    img.src = './img/delete24.png';
    removeButton.appendChild( img );

    return removeButton;
};

const addButtonListener = ( { button, dataInputId, checkUrl, storageId, itemMap, onClick, apiMethod } ) =>
{
    button.addEventListener( 'click', event =>
    {
        button.disabled = 'disabled';
        let dataInput = document.getElementById( dataInputId );
        apiMethod( checkUrl + dataInput.value )
        .then( item => storage.load(storageId, [])
            .then( itemsList =>
            {
                let newItem = Object.keys( itemMap ).reduce( (result, key) => Object.assign({}, result,
                {
                    [ key ] : itemMap[ key ]( item )
                } ), {} );

                itemsList.push( newItem );

                storage.save(
                {
                    [ storageId ] : itemsList
                } ).then(() =>
                {
                    button.disabled = false;
                    dataInput.value = '';
                    onClick();
                } );
            } )
        );
    } );
};

const putListItem = ( { label, onRemove, placeholder, tooltip } ) =>
{
    let node = document.createElement( 'li' );
    let span = document.createElement( 'span' );
    let text = document.createTextNode( label );
    let removeButton = getRemoveButton( onRemove );

    if ( tooltip )
    {
        span.setAttribute( 'data-tooltip', tooltip );
    }

    span.appendChild( text );
    node.appendChild( span );
    node.appendChild( removeButton );
    placeholder.appendChild( node );
};

const putItems = ( { dataKey, getParams, getUpdatedList, updateView } ) =>
{
    let placeHolder = document.getElementById( dataKey );
    placeHolder.innerHTML = '';

    storage.load( dataKey, [] )
    .then( itemList =>
    {
        for ( let item of itemList )
        {
            putListItem (
                Object.assign( {}, getParams( item ),
                {
                    placeholder : placeHolder,
                    onRemove    : () =>
                    {
                        storage.save( {
                            [ dataKey ] :  getUpdatedList( itemList, item )
                        } );
                        updateView();
                    }
              } )
           );
        }
    } );
};

const putUsers = () =>
{
    putItems(
    {
        dataKey : 'userList',
        getParams: user => ( { label : user.name, tooltip : user.login } ),
        getUpdatedList :  ( userList, user) => userList.filter( u => u.url !== user.url ),
        updateView : () => putUsers()
    } );
};

const putRepos = () =>
{
    putItems(
    {
        dataKey : 'repoList',
        getParams: repo => ( { label : repo.name, } ),
        getUpdatedList :  ( repoList, repo) => repoList.filter( u => u.url !== repo.url ),
        updateView : () => putRepos()
    } );
};


getUserCookie()
.then( userId =>
{
    if ( userId )
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
    }
} )
.catch( _ => _ );

getUserCookie().then( userId =>
{
    if (userId) {

        document.getElementById('login').classList.add('hidden')
        document.getElementById('content').classList.remove('hidden')

        putUsers();
        putRepos();


        storage.load('currentUser').then(user =>
        {
          const container = document.getElementById('logged-in-as');
          let link = document.createElement('a');
          link.href = user.url;
          const text = document.createTextNode( `${user.name} (${user.login})` );
          link.appendChild(text);
          container.appendChild(link);
        } );

        storage.load('access_token')
        .then( accessToken =>
        {
            const token = document.getElementById( 'token' );
            if ( accessToken )
            {
                token.value = accessToken;
            }

            token.addEventListener( 'keyup', event =>
            {
                storage.save(
                {
                    access_token: event.target.value
                } ).then( () =>
                {
                    if ( event.target.value )
                    {
                        document.getElementById( 'followingLists' ).classList.remove( 'disabled' );
                    }
                    else
                    {
                        document.getElementById( 'followingLists' ).classList.add( 'disabled' );
                    }
                } );
            } );

            return accessToken;
        } )
        .then( accessToken =>
        {
            if ( accessToken )
            {
                document.getElementById( 'followingLists' ).classList.remove( 'disabled' );
            }

            addButtonListener(
            {
                button      : document.getElementById( 'addUser' ),
                dataInputId : 'newUser',
                checkUrl    : '/users/',
                storageId   : 'userList',
                onClick     : putUsers,
                apiMethod   : publicApi,
                itemMap     :
                {
                    login : user => user.login,
                    name  : user => user.name || user.login,
                    url   : user => user.html_url
                }
            } );

            addButtonListener(
            {
                button      : document.getElementById( 'addRepo' ),
                dataInputId : 'newRepo',
                checkUrl    : '/repos/sociomantic/',
                storageId   : 'repoList',
                onClick     : putRepos,
                apiMethod   : api,
                itemMap     :
                {
                    name : repo => repo.name,
                    url  : repo => repo.html_url
                }
            } );
        } );
    }
} )
.catch( _ => _ );

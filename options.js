
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
                let newItem = Object.keys( itemMap ).reduce( (result, key) => (
                {
                    ...result,
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
    token.value = accessToken;

    token.addEventListener( 'change', event =>
    {
        storage.save(
        {
            access_token: event.target.value
        } ).then( () =>
        {
            addRepoButton.disabled = false;
            addUserButton.disabled = false;
        } );
    } );

    return accessToken;
} )
.then( accessToken =>
{
    const addUserButton = document.getElementById( 'addUser' );
    const addRepoButton = document.getElementById( 'addRepo' );

    if ( !accessToken )
    {
      addRepoButton.disabled = 'disabled';
      addUserButton.disabled = 'disabled';
    }

    addButtonListener(
    {
        button      : addUserButton,
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
        button      : addRepoButton,
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

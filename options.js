
let userList = JSON.parse(localStorage.getItem('userList') || '{}');
let repoList = JSON.parse(localStorage.getItem('repoList') || '[]');
let accessToken = localStorage.getItem( 'accessToken' );

const getRemoveButton = onRemove =>
{
    let removeButton = document.createElement('button');
    let onRmButtonClick = event =>
    {
        removeButton.removeEventListener('click', onRmButtonClick);
        onRemove();
    };

    removeButton.addEventListener('click', onRmButtonClick);
    removeButton.appendChild(document.createTextNode('remove'));

    return removeButton;
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

const saveJSON = (key, data) => {
    localStorage.setItem( key, JSON.stringify( data ) );
};

const saveRepoList = data => {
    localStorage.setItem(
        'repoList',
        JSON.stringify( data )
    );
};

const putUsers = () => {
    let placeHolder = document.getElementById( 'userList' );
    placeHolder.innerHTML = '';

    for ( let userLogin of Object.keys( userList ) ) {
        putListItem( {
            label       : userList[userLogin],
            tooltip     : userLogin,
            placeholder : placeHolder,
            onRemove    : () =>
                                {
                                    delete userList[ userLogin ];
                                    saveJSON( 'userList', userList );
                                    putUsers();
                                }
        } );
    }
};

const putRepos = () => {
    let placeHolder = document.getElementById( 'repoList' )
    placeHolder.innerHTML = '';
    for ( let repo of repoList ) {
        putListItem( {
            label       : repo,
            placeholder : placeHolder,
            onRemove    : () =>
                          {
                              repoList = repoList.filter( r => r !== repo );
                              saveJSON( 'repoList', repoList );
                              putRepos();
                          }
        } );
    }
};

putUsers();
putRepos();

const api = link =>
{
    return fetch( `https://api.github.com${link}?access_token=${accessToken}` )
    .then( response => response.json() );
}

window.onload = () =>
{
    const token         = document.getElementById( 'token' );
    const addUserButton = document.getElementById( 'addUser' );
    const addRepoButton = document.getElementById( 'addRepo' );
    token.value = accessToken;

    if( !accessToken )
    {
        addRepoButton.disabled = 'disabled';
        addUserButton.disabled = 'disabled';
    }

    token.addEventListener( 'change', event =>
    {
        localStorage.setItem( 'accessToken', event.target.value );
        addRepoButton.disabled = false;
        addUserButton.disabled = false;
    } );

    addUserButton.addEventListener( 'click', event =>
    {
        addUserButton.disabled = 'disabled';
        let newUser = document.getElementById( 'newUser' );
        api( `/users/${newUser.value}` )
        .then( user =>
        {
            userList[ user.login ] = user.name
            saveJSON( 'userList', userList );
            addUserButton.disabled = false;
            newUser.value = '';
            putUsers();
        } );
    } );

    addRepoButton.addEventListener( 'click', event =>
    {
        addRepoButton.disabled = 'disabled';
        let input = document.getElementById( 'newRepo' );
        api( `/repos/sociomantic/${input.value}` )
        .then( repo =>
        {
            repoList.push( repo.name );
            saveJSON( 'repoList', repoList );
            addRepoButton.disabled = false;
            input.value = '';
            putRepos();
        } );
    } );

}

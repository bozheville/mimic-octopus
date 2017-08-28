
const getRemoveButton = onRemove =>
{
    let removeButton = document.createElement( 'button' );
    let onRmButtonClick = event =>
    {
        removeButton.removeEventListener( 'click', onRmButtonClick );
        onRemove();
    };

    removeButton.addEventListener( 'click', onRmButtonClick );
    removeButton.appendChild( document.createTextNode( 'remove' ) );

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

  addUserButton.addEventListener( 'click', event =>
  {
      addUserButton.disabled = 'disabled';
      let newUser = document.getElementById( 'newUser' );
      api( `/users/${newUser.value}` )
      .then( user =>
      {
          return storage.load('userList', [])
          .then( userList =>
          {
              userList.push(
              {
                  login : user.login,
                  name  : user.name,
                  url   : user.html_url
              } );

              storage.save( { userList } ).then(() => {
                  addUserButton.disabled = false;
                  newUser.value = '';
                  putUsers();
              } );
          } );
      } );
  } );

  addRepoButton.addEventListener( 'click', event =>
  {
      addRepoButton.disabled = 'disabled';
      let input = document.getElementById( 'newRepo' );

      api( `/repos/sociomantic/${input.value}` )
      .then( repo =>
      {
          return storage.load('repoList', [])
          .then(repoList =>
          {
              repoList.push(
              {
                  name : repo.name,
                  url  : repo.html_url
              } );
              storage.save( { repoList } )
              .then( () =>
              {
                  addRepoButton.disabled = false;
                  input.value = '';
                  putRepos();
              });
          } );
      } );
  } );
} );

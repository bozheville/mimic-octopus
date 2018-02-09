



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


const addItem = ( { apiMethod, checkUrl, value, storageId, itemMap } ) => {
  return apiMethod( checkUrl + value )
  .then( item => storage.load(storageId, [])
      .then( itemsList =>
      {
          let newItem = Object.keys( itemMap ).reduce( ( result, key ) => Object.assign({}, result,
          {
              [ key ] : itemMap[ key ]( item )
          } ), {} );

          itemsList.push( newItem );

          return storage.save(
          {
              [ storageId ] : itemsList
          } );
      } )
  );
}

const addButtonListener = ( { button, dataInputId, checkUrl, storageId, itemMap, onClick, apiMethod } ) =>
{
    button.addEventListener( 'click', event =>
    {
        button.disabled = 'disabled';
        let dataInput = document.getElementById( dataInputId );
        const value = dataInput.value;

        addItem( { apiMethod, checkUrl, value, storageId, itemMap } ).then(() =>
        {
            button.disabled = false;
            dataInput.value = '';
            onClick();
        } );;
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

const removeItem = ( { storageId, getUpdatedList, item } ) => {
    return storage.load( storageId, [] )
    .then( itemList => storage.save( {
        [ storageId ] :  getUpdatedList( itemList, item )
    } ) );
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
                        } ).then( updateView );
                    }
              } ) );
        }
    } );
};

const getUpdatedList = ( list, user ) => list.filter( u => u.url !== user.url );

const putUsers = () =>
{
    putItems(
    {
        dataKey : 'userList',
        getParams: user => ( { label : user.name, tooltip : user.login } ),
        getUpdatedList : getUpdatedList,
        updateView : () => putUsers()
    } );
};

const putRepos = () =>
{
    putItems(
    {
        dataKey : 'repoList',
        getParams: repo => ( { label : repo.name, } ),
        getUpdatedList :  getUpdatedList,
        updateView : () => putRepos()
    } );
};

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

class MimicOctopusOptions {

  constructor() {
    const lists = document.getElementsByClassName( 'editable-list-form' );

    for ( let list of lists ) {
      list.getElementsByClassName( 'switcher' )[ 0 ]
      .addEventListener( 'click', event => {
        list.classList.toggle( 'org-view' );
      } );
    }
  }

  getMyInfo()
  {
    return getUserCookie()
    .then( userId => api( `/users/${userId}` ) )
    .then( user => storage.save(
    {
      currentUser :
      {
        name  : user.name,
        login : user.login,
        url   : user.html_url
      }
    } ) )
    .catch( _ => _ );
  }

  getAllItems( uriPath ) {
    let pageNum = 0;

    const getPage = list => api( `/orgs/${uriPath}`, `page=${ ++pageNum }` )
    .then( items => {
      list = [ ...list, ...items ];

      return items.length ? getPage( list ) : list;
    } );

    return getPage( [] );
  }

  getOrganizationList() {
    return api( '/user/orgs' ).then( organizations => {
      const orgList = {};

      const promiseList = organizations.map( org => () => Promise.all( [
        this.getAllItems( `${org.login}/repos` ),
        this.getAllItems( `${org.login}/members` )
      ] )
      .then( ( [ repos, members ] ) => {
        orgList[ org.login ] = {
          repos   : repos.map( repo => ( {
            name      : repo.name,
            full_name : repo.full_name,
            url       : repo.html_url
          } ) ),

          members : members.map( user => ( {
            login : user.login,
            url   : user.html_url
          } ) )
        }
      } ) );

      return Promise.all( promiseList.map( p => p() ) ).then( () => orgList );
    } );
  }

  putList( orgList, showList, listType )
  {
    let keys = Object.keys( orgList );
    const selector = document.getElementById( 'organization' );

    for ( let key of keys )
    {
      const option = document.createElement( 'option' );
      option.value = key;
      option.appendChild( document.createTextNode( key ) );
      selector.appendChild( option );
    }

    return storage.load( 'organization' )
    .then( value =>
    {
      if ( value )
      {
        selector.value = value;
        return Promise.resolve();
      } else {
        selector.value = keys[ 0 ];
        return storage.save( { organization : keys[ 0 ] } )
      }
    } )
    .then( () =>
    {
      selector.addEventListener( 'change', event =>
      {
        storage.save( { organization : event.target.value } )
      } );
    })
    .then( () =>
    {
      if ( showList )
      {
        return showList( orgList[ selector.value ][ listType ], keys[ 0 ] );
      } else {
        return {
          items : orgList[ selector.value ],
          org: keys[ 0 ]
        };
      }
    } );
  }

  showFullItemsList( {
    items,
    checkUrl,
    storageId,
    itemMap,
    getUpdatedList,
    elementId,
    getItemValue,
    apiMethod,
    updateView,
    isSetValue
  } ) {
    const wrapper = document.getElementById( elementId );

    return storage.load( storageId ).then( itemList => {
      for ( let item of items ) {
        const listItem = document.createElement( 'li' );
        const checkbox = document.createElement( 'input' );

        if (itemList && isSetValue( itemList, getItemValue( item ) ) ) {
          checkbox.checked = true;
        }

        checkbox.type = 'checkbox';
        checkbox.addEventListener( 'change', event => {
          if ( checkbox.checked ) {
            addItem( {
              value : getItemValue( item ),
              checkUrl,
              storageId,
              apiMethod,
              itemMap
            } )
            .then( updateView );
          } else {
            removeItem( { getUpdatedList, storageId, item } )
            .then( updateView );
          }
        } );

        listItem.appendChild( checkbox );
        listItem.appendChild( document.createTextNode( getItemValue( item ) ) );
        wrapper.appendChild( listItem );
      }
    } );
  }
}

const page = new MimicOctopusOptions();

page.getMyInfo();

addOverlay( 'usersList' );
addOverlay( 'reposList' );
page.getOrganizationList().then( orgList => {
  page.putList( orgList )
  .then( ( { items, org } ) =>
  {
    page.showFullItemsList( {
      items          : items.members,
      checkUrl       : `/users/`,
      storageId      : 'userList',
      itemMap        : {
        login : user => user.login,
        name  : user => user.name || user.login,
        url   : user => user.html_url
      },
      getUpdatedList : getUpdatedList,
      elementId      : 'org-members-list',
      apiMethod      : publicApi,
      getItemValue   : user => user.login,
      updateView     : putUsers,
      isSetValue     : ( list, value ) => list.map( ( { login } ) => login )
                                              .includes( value )
    } )
    .then( () => {
      removeOverlay( 'usersList' );
    } );
  } );

  page.putList( orgList )
  .then( ( { items, org } ) =>
  {
    page.showFullItemsList( {
      items          : items.repos,
      checkUrl       : `/repos/${org}/`,
      storageId      : 'repoList',
      itemMap        : {
        name : repo => repo.name,
        url  : repo => repo.html_url
      },
      getUpdatedList : getUpdatedList,
      elementId      : 'org-repos-list',
      apiMethod      : api,
      getItemValue   : repo => repo.name,
      updateView     : putRepos,
      isSetValue     : ( list, value ) => list.map( ( { name } ) => name )
                                              .includes( value )
    } )
    .then( () => {
      removeOverlay( 'reposList' );
    } );
  } );
} );

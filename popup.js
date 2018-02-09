
const shouldOpenOptions = () => Promise.all( [ getUserCookie(), getAccessToken() ] )
                                .then(  () => Promise.reject('reject') )
                                .catch( (action = 'reject') => Promise[action]() );

const getFullUserList = () => Promise.all( [
    storage.load( 'currentUser' ),
    storage.load( 'userList' ),
    storage.load( 'organization' ),
] ).then( ( [ currentUser, userList = [], organization ] ) =>
{
    return [
        ...userList,
        currentUser,
        {
            login : organization,
            name  : organization
        } ];
} );



// class MimicOctopusPopup {
//
//   static DOMItems = {};
//
//   constructor() {
//
//   }
//
//   static addOverlay = id => {
//     if ( !MimicOctopusOptions[ id ] ) {
//       MimicOctopusOptions[ id ] = document.getElementById( id );
//     }
//
//     MimicOctopusOptions[ id ].classList.add('loading-overlay');
//   }
//
//   static removeOverlay = id => {
//     if ( !MimicOctopusOptions[ id ] ) {
//       MimicOctopusOptions[ id ] = document.getElementById( id );
//     }
//
//     MimicOctopusOptions[ id ].classList.remove('loading-overlay');
//   }
//
// }



let IS_COMMAND = false;
let IS_CTRL = false;

const CTRL_KEY_CODE = 17;
const CMD_KEY_CODE = 91;

window.addEventListener( 'keydown', event =>
{
    if ( event.keyCode === CMD_KEY_CODE )  IS_COMMAND = true;
    if ( event.keyCode === CTRL_KEY_CODE ) IS_CTRL    = true;
} );

window.addEventListener( 'keyup', event =>
{
    if ( event.keyCode === CMD_KEY_CODE )  IS_COMMAND = false;
    if ( event.keyCode === CTRL_KEY_CODE ) IS_CTRL    = false;
} );

storage.load('organization').then(organization => {
  document.getElementById( 'org-name' ).innerHTML = organization;
} );



const addLinkListener = (item, url) =>
{

    item.addEventListener('click', () =>
    {
        let active = !IS_COMMAND && !IS_CTRL;
        chrome.tabs.create( { url, active } );
    } );

    item.addEventListener( 'auxclick', event =>
    {
        if (event.button === 1)
        {
            let active = false;
            chrome.tabs.create( { url, active } );
        }
    } );
};


const putGridToUI = grid =>
{
    let emptyListContainer = document.getElementById('app-repo-empty');
    if ( !grid.length || !grid[0][1] )
    {
        emptyListContainer.classList.remove('hidden');
        let link = emptyListContainer.getElementsByTagName('a')[0];
        link.addEventListener('click', () =>
        {
            chrome.runtime.openOptionsPage();
        } );
    } else {
        emptyListContainer.classList.add('hidden');
        getFullUserList().then( userList =>
        {
            let userMap = userList.reduce( ( map, user ) => Object.assign({}, map,
            {
                [ user.login ] : user.name
            } ), {} );

            let table = document.createElement( 'table' );

            const tableHeaderData = grid.shift();
            const tableHeader = document.createElement( 'tr' );

            for ( let headItemData of tableHeaderData )
            {
                let headItem = document.createElement( 'th' );
                let headItemContent = document.createTextNode( headItemData );
                headItem.appendChild( headItemContent );
                tableHeader.appendChild( headItem );
            }

            table.appendChild( tableHeader );

            while ( grid.length )
            {
                let tableRowData = grid.shift();
                let tableRow = document.createElement( 'tr' );

                let colNum = 0;
                for ( let rowItemData of tableRowData )
                {
                    let rowItem = document.createElement( 'td' );
                    let rowItemContent = '';

                    if ( colNum === 0 )
                    {
                        rowItemContent = document.createTextNode( userMap[ rowItemData ] );
                        rowItem.className = 'table-row-name';
                    }
                    else if ( rowItemData )
                    {
                        rowItemContent = document.createTextNode( 'Open' );
                        rowItem.className = 'clickable';
                        addLinkListener( rowItem, rowItemData );
                    }
                    else
                    {
                        rowItemContent = document.createTextNode( '-' );
                    }

                    rowItem.appendChild( rowItemContent );

                    colNum++;
                    tableRow.appendChild( rowItem );
                }

                table.appendChild( tableRow );
            }

            let app = document.getElementById( 'app-repo-list' );
            app.innerHTML = '';
            app.appendChild( table );
        } );
    }
};


const putPRsToUI = ( cotainerId, prList, emptyListText ) =>
{
    let container = document.getElementById( cotainerId );
    if( prList.length )
    {
        let list = document.createElement( 'ul' );
        list.classList.add( 'popup-items-list' );

        for ( let pr of prList )
        {
            let item = document.createElement( 'li' );
            item.classList.add( 'clickable' );
            let text = document.createTextNode( `${pr.repo}: ${pr.title} (${pr.state})` );
            item.appendChild( text );
            addLinkListener( item, pr.url );
            list.appendChild( item );
        }

        container.appendChild( list );
    }
    else
    {
        let placeholder = document.createElement( 'span' );
        placeholder.appendChild( document.createTextNode( emptyListText ) );
        placeholder.classList.add( 'text-italic' );
        container.appendChild( placeholder );
    }

}

const convertData = ( { grid, followPersons } ) =>
{
    const forksMap = grid;
    return storage.load( 'repoList' ).then( ( repoList = [] ) =>
    {
        let followRepos = repoList.map( repo => repo.name )
        let composedGrid = [ [ '', ...followRepos ] ];

        for ( let owner of followPersons )
        {
            composedGrid.push(
                [
                    owner,
                    ...followRepos.map( repo => forksMap[ repo ][ owner ] )
                ] );
        }

        return composedGrid;
    } );
};

const putCache = grid =>
{
    let data = JSON.stringify( grid );
    localStorage.setItem( 'grid', data );
    return grid;
};

let grid = localStorage.getItem( 'grid' );
if (grid)
{
    putGridToUI( JSON.parse( grid ) );
}

addOverlay("app-repo-list");
shouldOpenOptions().then( () =>
{
    chrome.runtime.openOptionsPage();
} )
.catch( () =>
{
    addOverlay("section-my-pr");
    addOverlay("section-review");
    storage.load( ['repoList', 'organization'] ).then( ( { repoList = [], organization} ) => Promise.all(
        repoList
        .map ( repo => `/repos/${organization}/${repo.name}/pulls` )
        .map ( link => api( link ) )
    ) )
    .then( prsByRepo =>
    {
        removeOverlay("section-my-pr");
        removeOverlay("section-review");
        let myPRs = [];
        let reviewPRs = [];

        const getPrData = pr => (
        {
            title : pr.title,
            repo  : pr.head.repo.name,
            state : pr.state,
            url   : pr.html_url
        } );

        return storage.load( 'currentUser' ).then( currentUser =>
        {
            for ( let repo of prsByRepo )
            {
                for ( let pr of repo )
                {
                    if ( pr.user.login === currentUser.login )
                    {
                        myPRs.push( getPrData( pr ) );
                    }
                    if ( pr.requested_reviewers.findIndex(reviewer => reviewer.login === currentUser.login) !== -1 )
                    {
                        reviewPRs.push( getPrData( pr ) );
                    }
                }
            }

            putPRsToUI( 'app-my-prs', myPRs, 'No open pull requests created' );
            putPRsToUI( 'app-review-prs', reviewPRs, 'No pull requests to review' );
        } );
    } );

    addOverlay("section-issues");
    storage.load( 'organization' ).then( organization => api(`/orgs/${organization}/issues`)
    .then( issuesList =>
    {
        removeOverlay("section-issues");
        // document.getElementById('loader-my-issues').classList.add('hidden');
        let container = document.getElementById('app-my-issues');

        if ( issuesList.length )
        {
            let list = document.createElement('ul');
            list.classList.add( 'popup-items-list' );
            for ( let issue of issuesList )
            {
                let item = document.createElement('li');
                item.classList.add('clickable');
                let text = document.createTextNode(`${issue.repository.name}: ${issue.title}`)
                item.appendChild(text);
                addLinkListener( item, issue.html_url );
                list.appendChild(item);
            }

            container.appendChild( list );
        }
        else
        {
            let placeholder = document.createElement('span');
            placeholder.appendChild( document.createTextNode( 'No assigned issues' ) );
            placeholder.classList.add( 'text-italic' );
            container.appendChild( placeholder );
        }
    } ) );


    Promise.all([
        storage.load( 'currentUser' ),
        storage.load( 'repoList' ),
        getFullUserList()
    ] )
    .then( ( [ currentUser, repoList = [], userList = [] ] ) =>
    {
        return storage.load( 'organization' ).then( organization => Promise.all(
            repoList.map ( repo => api( `/repos/${organization}/${repo.name}/forks` ) )
        ) )
        .then( forks => ( { forks, userList, repoList } ) )
    } )
    .then( ( { forks, userList, repoList } ) =>
    {
        const getNested = ( forks, updatedForksList ) =>
        {
          let nestedForks = [];

          for ( let repo of forks )
          {
              for ( let fork of repo )
              {
                  if ( ! updatedForksList[ fork.name ] )
                  {
                      updatedForksList[ fork.name ] = []
                  }

                  updatedForksList[ fork.name ].push(
                  {
                      link  : fork.html_url,
                      login : fork.owner.login
                  } )

                  if ( fork.forks_count > 0 )
                  {
                      nestedForks.push( fork.forks_url );
                  }
              }
          }

          return nestedForks.length ?
            Promise.all( nestedForks.map( url => api( url ) ) )
                   .then(repos => getNested( repos, updatedForksList) ) :
            Promise.resolve( updatedForksList );
        };

        return getNested( forks, {} )
               .then( forks => ( { forks, userList, repoList } ) )
    } )
    .then( ( { forks, userList, repoList } ) =>
    {
        let followPersons = userList.map( user => user.login);
        let followRepos = repoList.map( repo => repo.name );

        removeOverlay("app-repo-list");

        return storage.load( 'organization' ).then( organization => {
          const grid = followRepos.reduce( ( result, repo ) =>
          {
            return Object.assign( {}, result,
            {
              [ repo ] : {
                [ organization ] : `https://github.com/${organization}/${repo}`
              }
            } )
          }, {});

          for ( repo of followRepos )
          {
              let filteredForks = forks[ repo ]
                  .filter( fork => followPersons.includes( fork.login ) )
              for ( let fork of filteredForks ) {
                  grid[ repo ][ fork.login ] = fork.link
              }
          }

          return { grid, followPersons };
        } );
    } )
    .then( convertData )
    .then( putCache )
    .then( putGridToUI );
} );

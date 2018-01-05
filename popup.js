const organization = 'sociomantic';


const shouldOpenOptions = () => Promise.all( [ getUserCookie(), getAccessToken() ] )
                                .then(  () => Promise.reject('reject') )
                                .catch( (action = 'reject') => Promise[action]() );

const getFullUserList = () => Promise.all( [
    storage.load( 'currentUser' ),
    storage.load( 'userList' )
] ).then( ( [ currentUser, userList = [] ] ) =>
{
    return [
        ...userList,
        currentUser,
        {
            login : 'sociomantic',
            name  : 'Sociomantic'
        } ];
} );

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

document.getElementById( 'org-name' ).innerHTML = organization;


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
    localStorage.setItem('grid', data);
    return grid;
};

let grid = localStorage.getItem('grid');
if (grid)
{
    putGridToUI( JSON.parse(grid) );
}


shouldOpenOptions().then(() =>
{
    chrome.runtime.openOptionsPage();
} )
.catch(() =>
{

    storage.load( 'repoList' ).then( ( repoList = [] ) => Promise.all(
        repoList
        .map ( repo => `/repos/${organization}/${repo.name}/pulls` )
        .map ( link => api( link ) )
    ) )
    .then( prsByRepo =>
    {
        document.getElementById('loader-my-prs').classList.add('hidden');
        document.getElementById('loader-review-prs').classList.add('hidden');
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


    api(`/orgs/${organization}/issues`)
    .then( issuesList =>
    {
        document.getElementById('loader-my-issues').classList.add('hidden');
        let container = document.getElementById('app-my-issues');

        if ( issuesList.length )
        {
            let list = document.createElement('ul');
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
    } );


    Promise.all([
        storage.load( 'currentUser' ),
        storage.load( 'repoList' ),
        getFullUserList()
    ] )
    .then( ( [ currentUser, repoList = [], userList = [] ] ) => {
        return Promise.all(
            repoList.map ( repo => api( `/repos/${organization}/${repo.name}/forks` ) )
        )
        .then(forks => ( { forks, userList, repoList } ) )
    } )
    .then( ( { forks, userList, repoList } ) =>
    {
        let followPersons = userList.map( user => user.login);
        let followRepos = repoList.map( repo => repo.name );

        document.getElementById( 'loader' ).classList.add( 'hidden' );
        return {
            grid: forks.reduce( ( grid, repo, index ) =>
            {
                grid[ followRepos[ index ] ] = repo
                .filter( fork => followPersons.includes( fork.owner.login ) )
                .reduce( ( grid, fork ) => Object.assign( {}, grid,
                    {
                        [ fork.owner.login ] : fork.html_url
                    } ),
                    {
                        sociomantic : `https://github.com/${organization}/${followRepos[ index ]}`
                    } );

                return grid;
            }, {} ),
            followPersons
        };
    } )
    .then( convertData )
    .then( putCache )
    .then( putGridToUI );
})

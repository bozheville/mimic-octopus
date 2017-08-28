// let ACCESS_TOKEN = localStorage.getItem( 'accessToken' );
let MY_USERNAME = '';
// if ( !ACCESS_TOKEN )
// {
//     window.close();
//     chrome.runtime.openOptionsPage();
// }
const organization = 'sociomantic';

// const followRepos = JSON.parse(localStorage.getItem('repoList') || '[]');
// const userList = JSON.parse(localStorage.getItem('userList') || '{}');

// Object.assign(userList, {
//     sociomantic: 'Sociomantic'
// } );



//
// storage.load('userList')
// .then( userList => storage.load( 'currentUser' ).then( currentUser =>
//   [ ...userList, currentUser, { login: 'sociomantic', name: 'Sociomantic' } ] ) )
// .then( userList =>
// {
//   console.log(userList);
// });




// let followPersons = Object.keys( userList );
// let IS_COMMAND = false;
// let IS_CTRL = false;
//
// const CTRL_KEY_CODE = 17;
// const CMD_KEY_CODE = 91;
//
// window.addEventListener('keydown', event =>
// {
//     if ( event.keyCode === CMD_KEY_CODE )
//     {
//         IS_COMMAND = true;
//     }
//     if ( event.keyCode === CTRL_KEY_CODE )
//     {
//         IS_CTRL = true;
//     }
// } );
//
// window.addEventListener('keyup', event =>
// {
//     if ( event.keyCode === CMD_KEY_CODE )
//     {
//         IS_COMMAND = false;
//     }
//     if ( event.keyCode === CTRL_KEY_CODE )
//     {
//         IS_CTRL = false;
//     }
// } );


// const addLinkListener = (item, url) =>
// {
//
//     item.addEventListener('click', () =>
//     {
//         let active = !IS_COMMAND && !IS_CTRL;
//         chrome.tabs.create( { url, active } );
//     } );
//
//     item.addEventListener( 'auxclick', event =>
//     {
//         if (event.button === 1)
//         {
//             let active = false;
//             chrome.tabs.create( { url, active } );
//         }
//     } );
// };

// const putGridToUI = grid => {
//     let table = document.createElement('table');
//
//     const tableHeaderData = grid.shift();
//     const tableHeader = document.createElement('tr');
//
//     let gridCoordinates =
//     {
//         col : 0,
//         row : 0
//     };
//
//     for( let headItemData of tableHeaderData )
//     {
//         let headItem = document.createElement('th');
//         let headItemContent = document.createTextNode(headItemData);
//         headItem.appendChild(headItemContent);
//         headItem.setAttribute('data-col', gridCoordinates.col);
//         headItem.setAttribute('data-row', gridCoordinates.row);
//         tableHeader.appendChild(headItem);
//         gridCoordinates.col++;
//     }
//
//     gridCoordinates.row++;
//     table.appendChild( tableHeader );
//
//     while ( grid.length )
//     {
//         let tableRowData = grid.shift();
//         let tableRow = document.createElement( 'tr' );
//
//         gridCoordinates.col = 0;
//         for( let rowItemData of tableRowData )
//         {
//             let rowItem = document.createElement( 'td' );
//
//             if ( gridCoordinates.col === 0 )
//             {
//                 let rowItemContent = document.createTextNode( userList[ rowItemData ] );
//                 rowItem.appendChild( rowItemContent );
//                 rowItem.className = 'table-row-name';
//             }
//             else if ( rowItemData )
//             {
//                 rowItem.appendChild( document.createTextNode( 'Open' ) );
//                 rowItem.className = 'clickable';
//
//                 addLinkListener( rowItem, rowItemData );
//             }
//             else
//             {
//                 let rowItemContent = document.createTextNode( '-' );
//                 rowItem.appendChild( rowItemContent );
//             }
//
//             rowItem.setAttribute( 'data-col', gridCoordinates.col );
//             rowItem.setAttribute( 'data-row', gridCoordinates.row );
//             gridCoordinates.col++;
//             tableRow.appendChild( rowItem );
//         }
//
//         gridCoordinates.row++;
//         table.appendChild( tableRow );
//     }
//
//     let app = document.getElementById( 'app-repo-list' );
//     app.innerHTML = '';
//     app.appendChild( table );
// };
//
//
// const putPRsToUI = ( cotainerId, prList, emptyListText ) =>
// {
//     let container = document.getElementById( cotainerId );
//     if(prList.length)
//     {
//         let list = document.createElement('ul');
//         for (let pr of prList)
//         {
//             let item = document.createElement('li');
//             item.classList.add('clickable');
//             let text = document.createTextNode(`${pr.repo}: ${pr.title} (${pr.state})`)
//             item.appendChild(text);
//             addLinkListener( item, pr.url );
//             list.appendChild(item);
//         }
//
//         container.appendChild( list );
//     } else {
//         let placeholder = document.createElement('span');
//         placeholder.appendChild( document.createTextNode( emptyListText ) );
//         placeholder.classList.add( 'text-italic' );
//         container.appendChild( placeholder );
//     }
//
// }

// const convertData = ( { forksMap, followPersons } ) =>
// {
//     let grid = [ [ '', ...followRepos ] ];
//
//     for ( let owner of followPersons )
//     {
//         grid.push(
//             [
//                 owner,
//                 ...followRepos.map( repo => forksMap[ repo ][ owner ] )
//             ] );
//     }
//
//     return grid;
// };

// const putCache = grid =>
// {
//     let data = JSON.stringify( grid );
//     localStorage.setItem('grid', data);
//     return grid;
// };
//
// let grid = localStorage.getItem('grid');
// if (grid)
// {
//     putGridToUI( JSON.parse(grid) );
// }



// setUser().then( () => {
//     return Promise.all(
//         followRepos
//         .map ( repoName => `/repos/${organization}/${repoName}/pulls` )
//         .map ( link     => api( link ) )
//     );
// } )
// .then(response =>
// {
//     document.getElementById('loader-my-prs').classList.add('hidden');
//     document.getElementById('loader-review-prs').classList.add('hidden');
//     let myPRs = [];
//     let reviewPRs = [];
//     for (let repo of response)
//     {
//         for ( let pr of repo )
//         {
//             if ( pr.user.login === MY_USERNAME )
//             {
//                 myPRs.push(
//                 {
//                     title : pr.title,
//                     repo  : pr.head.repo.name,
//                     state : pr.state,
//                     url   : pr.html_url
//                 } );
//             }
//             if ( pr.requested_reviewers.findIndex(reviewer => reviewer.login === MY_USERNAME) !== -1)
//             {
//                 reviewPRs.push(
//                 {
//                     title : pr.title,
//                     repo  : pr.head.repo.name,
//                     state : pr.state,
//                     url   : pr.html_url
//                 } );
//             }
//         }
//     }
//
//     putPRsToUI( 'app-my-prs', myPRs, 'No open pull requests created' );
//     putPRsToUI( 'app-review-prs', reviewPRs, 'No pull requests to review' );
// } )
// .then(() =>
// {
//     return api(`/orgs/${organization}/issues`);
// } )
// .then( issuesList =>
// {
//     document.getElementById('loader-my-issues').classList.add('hidden');
//     let container = document.getElementById('app-my-issues');
//     if ( issuesList.length )
//     {
//         let list = document.createElement('ul');
//         for ( let issue of issuesList )
//         {
//             let item = document.createElement('li');
//             item.classList.add('clickable');
//             let text = document.createTextNode(`${issue.repository.name}: ${issue.title}`)
//             item.appendChild(text);
//             addLinkListener( item, issue.html_url );
//             list.appendChild(item);
//         }
//         container.appendChild( list );
//     }
//     else
//     {
//         let placeholder = document.createElement('span');
//         placeholder.appendChild( document.createTextNode( 'No assigned issues' ) );
//         placeholder.classList.add( 'text-italic' );
//         container.appendChild( placeholder );
//     }
// } );


// storage.load( 'userList' )
Promise.resolve([])
.then( userList => {
    return storage.load( 'currentUser' )
    .then( currentUser => [ ...userList, currentUser, { login: 'sociomantic', name: 'Sociomantic' } ] )
    .then( userList => {
        return Promise.all(
            followRepos
            .map ( repoName => `/repos/${organization}/${repoName}/forks` )
            .map ( link     => api( link ) )
        )
        .then(response => ( { response, userList} ) )
    } )
} )
.then( { response, userList} ) =>
{

    let followPersons = userList.map( user => user.login);
    document.getElementById('loader').classList.add('hidden');
    return response.reduce( ( grid, repo, index ) =>
    {
        grid[ followRepos[ index ] ] = repo
        .filter( fork => followPersons.includes( fork.owner.login ) )
        .reduce( ( grid, fork ) => Object.assign( {}, grid,
            {
                [fork.owner.login] : fork.html_url
            } ),
            {
                sociomantic : `https://github.com/sociomantic/${followRepos[ index ]}`
            } );
        return {grid, followPersons};
    }, {} );
} )
.then( convertData )
.then( putCache )
.then( putGridToUI );

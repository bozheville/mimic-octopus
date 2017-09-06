const organization = 'sociomantic';
let openPRsToReviewList = [];
let openIssuesList = [];

getUserCookie().then( userId =>
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

let urlMapping = {};

let checkNotifications = () => storage.load( 'repoList' )
.then( ( repoList = [] ) => Promise.all(
    repoList
    .map ( repo => `/repos/${organization}/${repo.name}/pulls` )
    .map ( link => api( link ) )
) )
.then( prsByRepo =>
{
    let reviewPRs = [];

    return storage.load( 'currentUser' ).then( currentUser =>
    {
        const isMeReviewer = reviewer => reviewer.login === currentUser.login;
        const isReviewPr = pr => pr.requested_reviewers.findIndex(isMeReviewer) !== -1;

        reviewPRs = prsByRepo
        .reduce( (result, pulls ) => [...result, ...pulls], [] )
        .filter( isReviewPr )
        .map( pr => (
        {
            id    : pr.id,
            title : pr.title,
            repo  : pr.head.repo.name,
            url   : pr.html_url
        } ) );

        return reviewPRs;
    } );
} ).then( reviewPRs =>
{
    for ( let pr of reviewPRs )
    {
        if ( !openPRsToReviewList.includes(pr.id) )
        {
            chrome.notifications.create(
            {
                type        : 'basic',
                iconUrl     : 'img/icon32.png',
                title       : 'New PR to review',
                message     : `${pr.repo}: ${pr.title}`,
                isClickable : true
            }, (id) =>
            {
                urlMapping[id] = pr.url;
            } );
        }
    }

    openPRsToReviewList = reviewPRs.map(pr => pr.id);
} );


let checkIssuesNotifications = () => api( `/orgs/${organization}/issues` )
.then( issuesList =>
{
    for ( let issue of issuesList )
    {
        if ( !openIssuesList.includes( issue.id ) )
        {
            chrome.notifications.create(
            {
                type        : 'basic',
                iconUrl     : 'img/icon32.png',
                title       : 'New issue',
                message     : `${issue.repository.name}: ${issue.title}`,
                isClickable : true
            }, (id) =>
            {
                urlMapping[id] = issue.html_url;
            } );
        }
    }

    openIssuesList = issuesList.map( issue => issue.id );
} );


setInterval( () =>
{
    getUserCookie()
    .then( userId =>
    {
        if ( userId )
        {
            checkNotifications();
            checkIssuesNotifications();
        }
    } )
    .catch( _ => _ );
}, 30000 );

chrome.notifications.onClicked.addListener( id =>
{
    chrome.tabs.create(
    {
        url: urlMapping[id]
    } );
} );

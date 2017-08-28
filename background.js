const organization = 'sociomantic';
let openPRsToReviewList = [];

getUserCookie().then( userId =>
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
} );

let urlMapping = {};

let checkNotifications = () => storage.load( 'repoList' ).then( repoList => Promise.all(
    repoList
    .map ( repo => `/repos/${organization}/${repo.name}/pulls` )
    .map ( link => api( link ) )
) )
.then( prsByRepo =>
{
    let reviewPRs = [];

    return storage.load( 'currentUser' ).then( currentUser =>
    {
        for ( let repo of prsByRepo )
        {
            for ( let pr of repo )
            {
                if ( pr.requested_reviewers.findIndex(reviewer => reviewer.login === currentUser.login) !== -1 )
                {
                    reviewPRs.push( {
                        id    : pr.id,
                        title : pr.title,
                        repo  : pr.head.repo.name,
                        state : pr.state,
                        url   : pr.html_url
                    } );
                }
            }
        }

        return reviewPRs
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
                iconUrl     : 'octopus_32.png',
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

checkNotifications();
setInterval(checkNotifications, 30000);

chrome.notifications.onClicked.addListener( id => {
    chrome.tabs.create(
    {
        url: urlMapping[id]
    } );
} );

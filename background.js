const organization = 'sociomantic';
let openPRsToReviewList = [];
let openIssuesList = [];

let counters = {
  myPRs     : 0,
  reviewPRs : 0,
  issues    : 0
};

const updateBadge = () => {
    const sum = counters.myPRs + counters.reviewPRs + counters.issues;
    chrome.browserAction.setBadgeText({text: `${sum}` })
};

updateBadge();

getUserCookie().then( userId =>
{
    if ( userId )
    {
        publicApi( `/users/${userId}` )
        .then( user =>
        {
            return storage.save(
            {
                currentUser:
                {
                    name  : user.name,
                    login : user.login,
                    url   : user.html_url
                }
            } ).then(_ => userId);
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

        const isMyPR = pr => pr.user.login === currentUser.login;
        const isMeReviewer = reviewer => reviewer.login === currentUser.login;
        const isReviewPr = pr => pr.requested_reviewers.findIndex(isMeReviewer) !== -1;
        counters.myPRs = prsByRepo.reduce( (result, pulls ) => [...result, ...pulls], [] ).filter( isMyPR ).length;
        updateBadge();
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
    counters.reviewPRs = reviewPRs.length;
    updateBadge();
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
} )
.catch( _ => {} );


let checkIssuesNotifications = () => api( `/orgs/${organization}/issues` )
.then( issuesList =>
{
    counters.issues = issuesList.length;
    updateBadge();
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
} )
.catch( _ => {} );

const updateUserInfo = () =>
{
  return getUserCookie()
  .then( userId =>
  {
      if ( userId )
      {
          checkNotifications();
          checkIssuesNotifications();
      }
  } )
  .catch( _ => _ );
};

updateUserInfo()
.then( () => getAccessToken().then( _ => _ ).catch( _ => {
               chrome.tabs.create( {
                 url : `chrome://extensions/?options=${chrome.runtime.id}`
               } );
             } )
);

setInterval( () =>
{
  updateUserInfo();
}, 5 * 60000 );

chrome.notifications.onClicked.addListener( id =>
{
    chrome.tabs.create(
    {
        url: urlMapping[id]
    } );
} );

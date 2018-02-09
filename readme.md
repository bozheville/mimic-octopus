# Chrome extension to explore issues and PRs


## Description

`v.0.1.4`

Chrome extension that helps to use Github.

Explore assigned issues, open PRs, org's repos && users

[Add to chrome](https://chrome.google.com/webstore/detail/mimic-octopus/eelndpcfojejbbklmbejhkjnfbcgoodo?hl=en-GB)

Allows:
 - to view a grid of following users&repos
 - to view created pull requests
 - to view pull requests that require your review
 - to see assigned issues

Settings:
 - you need to add generated token
 - you can choose organization,
 - you can see full list of org's members and repos


## Bootstrap
 1. [Generate access token](https://github.com/settings/tokens/new)
 2. Paste token to extension options
 3. Wait while all data is loaded via API
 4. Choose org
 5. _(optional)_ Add users to follow
 6. _(optional)_ Add repos to follow

## Features

`v.0.1.4`
 - Just some visual updates

`v.0.1.3`
 - make org name totally flexible (not more hard coded org name)

`v.0.1.2`
 - search the full forks tree, not only top-level
 - fix of list loading on first run

`v.0.1.0`
 - Load user's organizations via API
 - Load all org's repos & members list
 - Do not open options page if token is set
 - Add loading overlays

`v.0.0.5`
 - Update forks tree composing

`v.0.0.4`

 - Fix post-install bugs
  - disable protected api call without token
  - use open api to get user info
  - open options page after user data loading
 - updated popup layout
  - updated "no repositories" layout
  - added app header
  - repo list table stretched to popup width
 - add badge with summary count of related PRs and issues
 - fix for linux-based chrome (no `{...}`, but `Object.assign`)


`v.0.0.3`

 - User gets notifications about new assigned issues
 - Add notifications on new issues
 - Make options more friendly when no user logged / no token provided
 - update file structure
  - images moved to `img/`
  - renamed `popup.js`
  - removed `package.json`
 - refactor "add" buttons listener on options page
 - Add notifications on new issues
 - Make options more friendly when no user logged / no token provided


 `v.0.0.2`

 - Current user automatically added as one of followed as well as organization
 - User gets notifications about new requests to review the PR


`v.0.0.1`

 - See the repo/user grid with links to original repo and forks
 - View PRs where user is reviewer
 - View PRs created by user
 - Show user's issues
 - Use ctrl/cmd + click to open an inactive tab _(the extension remains open)_
   - Also should work with mouse wheel click, but need to check


## TODO

- Features
  - Notifications
    - Allow user to switch off notifications
      - Any notifications
      - Only for pr/issue

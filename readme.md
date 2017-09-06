# Sociomantic github extention


## Description

`v.0.0.3`

Extension that helps to navigate throw Sociomantic's github repositories.


## Settings

 - paste the token
   - get a token
 - add some repos
 - add users to follow

## Features
`v.0.0.1`

 - See the repo/user grid with links to original repo and forks
 - View PRs where user is reviewer
 - View PRs created by user
 - Show user's issues
 - Use ctrl/cmd + click to open an inactive tab _(the extension remains open)_
   - Also should work with mouse wheel click, but need to check


 `v.0.0.2`

 - Current user automatically added as one of followed as well as organization
 - User gets notifications about new requests to review the PR


 `v.0.0.3`

 - User gets notifications about new assigned issues
 - Add notifications on new issues
 - Make options more friendly when no user logged / no token provided


## Changelog
`v.0.0.3`

- update file structure
  - images moved to `img/`
  - renamed `popup.js`
  - removed `package.json`
- refactor "add" buttons listener on options page
- Add notifications on new issues
- Make options more friendly when no user logged / no token provided

## TODO

- Features
  - On a separate tab show all org repos and allow to mark them, using checkboxes
  - On a separate tab show all org users and allow to mark them, using checkboxes
  - Notifications
    - Allow user to change update period
    - Allow user to switch off notifications
      - Any notifications
      - Only for pr/issue

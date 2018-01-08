# Sociomantic github extention


## Description

`v.0.0.5`

Extension that helps to navigate throw Sociomantic's github repositories.

Allows to view a grid of following users&repos, view created pull requests and PRs to review. Allows to see assigned issues


## Settings

 - paste the token
   - get a token
 - add some repos
 - add users to follow

## Features

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
  - On a separate tab show all org repos and allow to mark them, using checkboxes
  - On a separate tab show all org users and allow to mark them, using checkboxes
  - Notifications
    - Allow user to change update period
    - Allow user to switch off notifications
      - Any notifications
      - Only for pr/issue

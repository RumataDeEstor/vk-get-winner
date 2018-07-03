const rules = require('../rules');
const request = require('../requests');

// one of the way to getBaseList
// TODO: add the logic to choose
function getIDsFromReposts(postID) {
  request.getRepostsOfThePost();
  return request.getUsersRepostedByPostID(postID);
}

// TODO: implement
// should return the list of IDs
function getBaseList() {
  return getIDsFromReposts();
}

// TODO: pass real postId
// TODO: filter only by required rules
function getFilteredByRulesList() {
  return getBaseList().then(list => list.filter(el => rules.hasCommentForPost(el, 0)).filter(el => rules.hasLikeForPost(el, 0)));
}

getFilteredByRulesList().then(result => console.log(result));

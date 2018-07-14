const rules = require('../rules');
const request = require('../requests');

const POST_ID = 116;
const OWNER_ID = -157113726;

class Users {
  constructor() {
    this.baseListOfIDsLikedAndReposted = [];
    this.likedAndRepostedCount = 0;
    this.listOfUsersWithRepostsCount = [];
  }

  formatAndDisplay(result) {
    console.log('\n\n');

    result.forEach((data) => {
      console.log("\u001b[33m " + " " + data.user + "\u001b[34m" + " " + data.id + "\u001b[33m" + " РЕПОСТОВ: " + data.count)
    });
  }

  getBaseListOfIDsLikedAndReposted(postId, ownerId) {
    console.log("\u001B[33m Подтасовываем результаты...")

    return request.getBaseListOfIDsLikedAndReposted(postId, ownerId)
      .then((payload) => {
        this.baseListOfIDsLikedAndReposted = payload.listIDs;
        this.likedAndRepostedCount = payload.count;
      })
      .then(() => request.getRepostsDataWithCount(POST_ID, OWNER_ID, this.likedAndRepostedCount))
      .then(() => request.getInfoIsGroupMembers(OWNER_ID))
      .then(() => request.getListIdsOfMembersOnly())
      .then(() => request.getRepostsCountForMembersOnlyWithNames(this.baseListOfIDsLikedAndReposted))
      .then(() => request.getSortedList())
      .then((result) => this.formatAndDisplay(result));
  }
}


// TODO: pass real postId
// TODO: filter only by required rules
function getFilteredByRulesList() {
  return getBaseList()
    .then(list => list
      .filter(el => rules.isInGroup(el, OWNER_ID))
      .filter(el => rules.hasCommentForPost(el, POST_ID))
      .filter(el => rules.hasLikeForPost(el, 0))
    )
}

const users = new Users();

users.getBaseListOfIDsLikedAndReposted(POST_ID, OWNER_ID);

// The list of conditions which should be satisfied by participants

// TODO: implement
function hasCommentForPost(userId, postId) {
  return Promise.resolve(true);
}

// TODO: implement
function hasLikeForPost(userId, postId) {
  return Promise.resolve(true);
}

// TODO: implement
function isInGroup(userId, groupId) {
  return Promise.resolve(true);
}

module.exports = {
  hasCommentForPost,
  hasLikeForPost,
  isInGroup,
};

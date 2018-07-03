const req = require('request-promise');
const getToken = require('../token/getToken');
const getReqOptions = require('../helpers/getRequestOptions');
const users = {};

class Provider {
  constructor(options = { token: '', baseUrl: '' }) {
    this.token = options.token;
    this.arrayOfPromises = [];
    this.TEMP_USER_REPOSTS = {};
    this.isGroupMembersInfo = {};
  }

  seqRunner(promises, numberToRely) {
    return promises
      .reduce((prev, cur, i, arr) => {
        return prev.then(() => {
          console.log(Object.keys(this.TEMP_USER_REPOSTS).length);

          if (Object.keys(this.TEMP_USER_REPOSTS).length === numberToRely) {
            // console.log('We can end now. Number is', Object.keys(this.TEMP_USER_REPOSTS).length);
            return prev;
          }

          return cur();
        });
      }, Promise.resolve());
  }

  getArrayOfPromises(apiMethod, baseParams, numberToRely) {
    console.log('numberToRely', numberToRely);
    const self = this;
    for (let offset = 0; offset < 50; offset += 2) {
      let funcWithPromise = function funcWithPromise() {
        return new Promise((resolve) => {
          return setTimeout(() => {
            const path = getReqOptions(apiMethod, Object.assign({}, baseParams, { offset }));

            return req(path)
              .then((payload) => {
                console.log(`offset ${offset}`)
                // console.log('payload', payload);
                console.log('USER_REPOSTS_CURRENT_TOTAL', Object.keys(self.TEMP_USER_REPOSTS).length);
                payload && payload.response.items.forEach((el, i) => self.TEMP_USER_REPOSTS[el.from_id] = el.reposts.count);

                resolve();
              })
          }, offset * 500 / 2);
        })
      }

      this.arrayOfPromises.push(funcWithPromise);
    }

    return this.arrayOfPromises;
  }

  getBaseListOfIDsLikedAndReposted(postId, ownerId) {
    const apiMethod = 'likes.getList';
    const params = {
      owner_id: ownerId,
      item_id: postId,
      type: 'post',
      filter: 'copies',
      extended: 1,
    };

    const path = getReqOptions(apiMethod, params);

    return req(path)
      .then((payload) => {
        const formattedPayload = {
          listIDs: payload.response.items,
          count: payload.response.count,
        };

        return formattedPayload;
      });
  }

  getRepostsDataWithCount(postId, ownerId, numberToRely) {
    const apiMethod = 'wall.getReposts';
    const params = {
      owner_id: ownerId,
      post_id: postId,
      offset: 0,
    };

    const array = this.getArrayOfPromises(apiMethod, params, numberToRely);

    return this.runPromises(array, numberToRely);
  }

  runPromises(array, numberToRely) {
    return this.seqRunner(array, numberToRely)
      .then(() => console.log('Done!', this.TEMP_USER_REPOSTS))
  }

  getInfoIsGroupMembers(userIDsSeq, groupId) {
    console.log('called');
    const apiMethod = 'groups.isMember';

    const userIds = Object.keys(this.TEMP_USER_REPOSTS)
      .reduce((prev, cur) => prev + ', ' + cur);

    console.log('userIds', userIds);
    const params = {
      // user_ids: userIDsSeq,
      user_ids: userIds,
      group_id: -groupId,
    };

    const path = getReqOptions(apiMethod, params);

    return req(path)
      .then((payload) => {
        console.log('payload', payload);
        this.isGroupMembersInfo = payload.response;
      })
      .then(() => console.log(this.isGroupMembersInfo));
  }

}

module.exports = new Provider({ token: getToken() });

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
    this.groupMembersIds = [];
  }

  seqRunner(promises, numberToRely) {
    const texts = {
      "2": () => console.log("\u001b[34m Удаляем Сашу Брюзгина из списка победителей..."),
      "5": () => console.log("\u001b[33m Заказываем power-банки..."),
      "10": () => console.log("\u001b[34m Ищем человека с Mi Band 2..."),
      "15": () => console.log("\u001b[32m Ломаем VK api..."),
    };

    return promises
      .reduce((prev, cur, i, arr) => {
        return prev
          .then(() => {
            return texts[i] && texts[i]();
          })
          .then(() => {
          if (Object.keys(this.TEMP_USER_REPOSTS).length >= numberToRely) {
            // console.log('We can end now. Number is', Object.keys(this.TEMP_USER_REPOSTS).length);

            return prev;
          }

          return cur();
        });
      }, Promise.resolve());
  }

  getArrayOfPromises(apiMethod, baseParams, numberToRely) {
    // console.log(numberToRely);
    const self = this;
    for (let offset = 0; offset < 500; offset += 5) {
      let funcWithPromise = function funcWithPromise() {
        return new Promise((resolve) => {
          return setTimeout(() => {
            const path = getReqOptions(apiMethod, Object.assign({}, baseParams, { offset }));

            return req(path)
              .then((payload) => {
                // console.log(`offset ${offset}`)
                // console.log('payload', payload);
                // console.log('USER_REPOSTS_CURRENT_TOTAL', Object.keys(self.TEMP_USER_REPOSTS).length);
                payload && payload.response.items.forEach((el, i) => self.TEMP_USER_REPOSTS[el.from_id] = el.reposts.count);

                resolve();
              })
          }, 300);
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
        // console.log('payload', payload);
        const formattedPayload = {
          listIDs: payload.response.items,
          count: payload.response.count,
        };

        // console.log(formattedPayload);

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
      // .then(() => console.log('Done!', this.TEMP_USER_REPOSTS))
  }

  getInfoIsGroupMembers(groupId) {
    // console.log('called');
    const apiMethod = 'groups.isMember';

    const userIds = Object.keys(this.TEMP_USER_REPOSTS)
      .reduce((prev, cur) => prev + ', ' + cur);

    // console.log('userIds', userIds);
    const params = {
      // user_ids: userIDsSeq,
      user_ids: userIds,
      group_id: -groupId,
    };

    const path = getReqOptions(apiMethod, params);

    return req(path)
      .then((payload) => {
        this.isGroupMembersInfo = payload.response;
      })
      // .then(() => console.log(this.isGroupMembersInfo));
  }

  getListIdsOfMembersOnly() {
    const list = [];

     this.isGroupMembersInfo
      .forEach((data) => {
        if (!data.member) {
          return;
        }
        list.push(String(data.user_id));
      });

    this.groupMembersIds = list;
  }

  getRepostsCountForMembersOnlyWithNames(baseList) {
    const usersWithReposts = {};

    Object.keys(this.TEMP_USER_REPOSTS)
      .forEach((key) => {
        if (this.groupMembersIds.includes(key)) {
          usersWithReposts[key] = this.TEMP_USER_REPOSTS[key]
        }
      });

    const usersWithRepostsWithNames = [];
    // get names
    Object.keys(usersWithReposts)
      .forEach((key) => {
        const data = baseList.find(el => el.id === Number(key))
        const user = `${data.first_name} ${data.last_name}`;
        usersWithRepostsWithNames.push({
          user,
          count: usersWithReposts[key],
          id: key,
        });
      });

    // console.log(usersWithRepostsWithNames);

    this.usersWithRepostsWithNames = usersWithRepostsWithNames;
  }

  getSortedList() {
    const result = this.usersWithRepostsWithNames
      .sort((a, b) => b.count - a.count);

    return result;
  }

}

module.exports = new Provider({ token: getToken() });

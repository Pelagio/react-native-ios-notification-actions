import { NativeModules, NativeAppEventEmitter } from "react-native";
const { RNNotificationActions } = NativeModules;

let actions = {};

export function handleActionCompleted() {
  RNNotificationActions.callCompletionHandler();
}

export class Action {
  constructor(opts, onComplete) {
    // TODO - check options
    this.opts = opts;
    this.onComplete = onComplete;
    // When a notification is received, we'll call this action by it's identifier
    actions[opts.identifier] = this;
    NativeAppEventEmitter.addListener("notificationActionReceived", body => {
      if (body.identifier === opts.identifier) {
        //console.info('got action interaction!', body);
        onComplete(body, handleActionCompleted);
      }
    });
  }
}

export class Category {
  constructor(opts) {
    // TODO - check options
    this.opts = opts;
  }
}

export const updateCategories = categories => {
  //console.info('updating categories!', categories);
  //console.info(RNNotificationActions);
  //RNNotificationActions.logTest('heyooO!');
  let cats = categories.map(cat => {
    return Object.assign({}, cat.opts, {
      actions: cat.opts.actions.map(action => action.opts)
    });
  });
  //console.info('updating categories', cats);
  RNNotificationActions.updateCategories(cats);
  // Re-update when permissions change
  NativeAppEventEmitter.addListener("remoteNotificationsRegistered", () => {
    //console.info('updating notification categories in response to permission change');
    RNNotificationActions.updateCategories(cats);
  });
};

export const getAction = identifier => {
  return actions[identifier];
};

export default {
  Action,
  Category,
  updateCategories,
  getAction,
  handleActionCompleted
};

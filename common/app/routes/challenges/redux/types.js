import createTypes from '../../../utils/create-types';

export default createTypes([
  // step
  'goToStep',
  'completeAction',

  // challenges
  'fetchChallenge',
  'fetchChallenges',
  'fetchChallengeCompleted',
  'fetchChallengesCompleted',
  'updateCurrentChallenge',
  'resetUi',

  // map
  'updateFilter',
  'clearFilter',

  // files
  'updateFile',
  'updateFiles',

  // rechallenge
  'executeChallenge',
  'updateMain',
  'runTests',
  'frameMain',
  'frameTests',
  'updateOutput',
  'initOutput',
  'updateTests',
  'checkChallenge',
  'showChallengeComplete',
  'showProjectSubmit',
  'submitChallenge',
  'moveToNextChallenge',

  // code storage
  'saveCode',
  'loadCode',
  'savedCodeFound'
], 'challenges');

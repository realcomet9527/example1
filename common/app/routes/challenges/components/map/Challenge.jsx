import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Link } from 'react-router';
import PureComponent from 'react-pure-render/component';
import classnames from 'classnames';
import debug from 'debug';

import { updateCurrentChallenge } from '../../redux/actions';

const bindableActions = { updateCurrentChallenge };
const mapStateToProps = createSelector(
  (_, props) => props.dashedName,
  state => state.entities.challenge,
  (dashedName, challengeMap) => {
    const challenge = challengeMap[dashedName] || {};
    return {
      dashedName,
      challenge,
      title: challenge.title,
      block: challenge.block,
      isLocked: challenge.isLocked,
      isRequired: challenge.isRequired,
      isCompleted: challenge.isCompleted,
      isComingSoon: challenge.isComingSoon,
      isDev: debug.enabled('fcc:*')
    };
  }
);
export class Challenge extends PureComponent {
  constructor(...args) {
    super(...args);
  }
  static displayName = 'Challenge';
  static propTypes = {
    title: PropTypes.string,
    dashedName: PropTypes.string,
    block: PropTypes.string,
    isLocked: PropTypes.bool,
    isRequired: PropTypes.bool,
    isCompleted: PropTypes.bool,
    challenge: PropTypes.object,
    updateCurrentChallenge: PropTypes.func
  };

  renderCompleted(isCompleted, isLocked) {
    if (isLocked || !isCompleted) {
      return null;
    }
    return <span className='sr-only'>completed</span>;
  }

  renderRequired(isRequired) {
    if (!isRequired) {
      return '';
    }
    return <span className='text-primary'><strong>*</strong></span>;
  }

  renderComingSoon(isComingSoon) {
    if (!isComingSoon) {
      return null;
    }
    return (
      <span className='text-info small'>
        &thinsp; &thinsp;
        <strong>
          <em>Coming Soon</em>
        </strong>
      </span>
    );
  }

  renderLocked(title, isRequired, isComingSoon, className) {
    return (
      <p
        className={ className }
        key={ title }
        >
        { title }
        { this.renderRequired(isRequired) }
        { this.renderComingSoon(isComingSoon) }
      </p>
    );
  }


  render() {
    const {
      title,
      dashedName,
      block,
      isLocked,
      isRequired,
      isCompleted,
      isComingSoon,
      isDev,
      challenge,
      updateCurrentChallenge
    } = this.props;
    const challengeClassName = classnames({
      'text-primary': true,
      'padded-ionic-icon': true,
      'negative-15': true,
      'challenge-title': true,
      'ion-checkmark-circled faded': !(isLocked || isComingSoon) && isCompleted,
      'ion-ios-circle-outline': !(isLocked || isComingSoon) && !isCompleted,
      'ion-locked': isLocked || isComingSoon,
      disabled: isLocked || (!isDev && isComingSoon)
    });
    if (isLocked || (!isDev && isComingSoon)) {
      return this.renderLocked(
        title,
        isRequired,
        isComingSoon,
        challengeClassName
      );
    }
    return (
      <p
        className={ challengeClassName }
        key={ title }
        >
        <Link to={ `/challenges/${block}/${dashedName}` }>
          <span onClick={ () => updateCurrentChallenge(challenge) }>
            { title }
            { this.renderCompleted(isCompleted, isLocked) }
            { this.renderRequired(isRequired) }
          </span>
        </Link>
      </p>
    );
  }
}

export default connect(mapStateToProps, bindableActions)(Challenge);

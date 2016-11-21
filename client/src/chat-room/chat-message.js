import React, {
} from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import {
  getUserById,
} from '../data/modules/users';

const styles = StyleSheet.create({
});

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours %= 12;
  hours = hours !== 0 ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

function ChatMessage({ id, message, timestamp, username }) {
  const timeObj = new Date(timestamp);

  return (
    <div
      className={css(styles.message) + ' my1 align-middle'}
    >
      <span
        className="gray"
        title={timeObj.toISOString()}
      >
        [{formatAMPM(timeObj)}]
      </span>
      <span className="mx1 bold">{username}</span>
      <span className="">{message}</span>
    </div>
  );
}
export default connect(
  (state, ownProps) => ({
    username: _.get(getUserById(state, { id: ownProps.userId }), 'username'),
  })
)(ChatMessage);

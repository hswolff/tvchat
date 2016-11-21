import React from 'react';
import Helmet from 'react-helmet';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  container: {
    width: '500px',
    margin: '0 auto',
  },
});

export default function AboutPage() {
  return (
    <div className={css(styles.container)}>
      <Helmet title="About" />
      <h1>About</h1>
      <p>All about me!</p>
    </div>
  );
}

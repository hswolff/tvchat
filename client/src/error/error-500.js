import React from 'react';
import Helmet from 'react-helmet';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  container: {
    width: '500px',
    margin: '0 auto',
  },
});

export default function Error500() {
  const title = '500';

  return (
    <div className={css(styles.container)}>
      <Helmet title={title} />
      <div>
        <h1>{title}</h1>
      </div>
    </div>
  );
}

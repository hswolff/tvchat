import React from 'react';
import Helmet from 'react-helmet';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  container: {
    width: '500px',
    margin: '0 auto',
  },
});

export default function Error404() {
  const title = '404 - Not Found';

  return (
    <div className={css(styles.container)}>
      <Helmet title={title} />
      <div>
        <h1>{title}</h1>
      </div>
    </div>
  );
}

import React, {
  Component,
} from 'react';
import { Link } from 'react-router';
import { graphql } from 'react-apollo';
import _ from 'lodash';
import gql from 'graphql-tag';

const ShowRow = (show) => (
  <Link
    key={show.id}
    to={`/${show.slug}`}
  >
    <div className="clearfix border">
      <div className="col col-6">id: {show.id}</div>
      <div className="col col-3">Name: {show.name}</div>
      <div className="col col-3">Slug: {show.slug}</div>
    </div>
  </Link>
);

class ShowsList extends Component {
  render() {
    return (
      <div className="">
        <h1>Shows</h1>
        <div>
          {_.get(this.props, 'data.shows', []).map(ShowRow)}
        </div>
      </div>
    );
  }
}

export default graphql(gql`
  query Shows {
    shows {
      id
      name
      slug
      dateCreated
    }
  }
`)(ShowsList);

import React from 'react';
import './leaderboard.css';
import RowRank from './Row';
class LeaderBoard extends React.Component {
  render() {
    return (
      <div className='container leaderboard'>
        <div className='leadheader'>
          <h2>Leaderboard</h2>
        </div>
        <RowRank rank='#' score='Score' />
        {this.props.users.map((item, index) => (
          <RowRank rank={index + 1} score={item} key={index} />
        ))}
      </div>
    );
  }
}

export default LeaderBoard;

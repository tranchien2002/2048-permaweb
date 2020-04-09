import React from 'react';
import Login from './UI/Login/Login';
import reload from '../images/reload.png';

let GameEndOverlay = (props) => {
  let contents = '';
  let form = '';
  let save = '';
  if (!props.isLoggedIn) {
    form = (
      <Login
        closeLogin={props.showHideLogin}
        login={props.login}
        handleChangeLogin={props.handleChangeLogin}
        error={props.error}
        isSigningIn={props.isSigningIn}
      />
    );
  }

  if (props.isLoggedIn) {
    save = (
      <button className='saveGame' onClick={props.saveScore}>
        Save Score
      </button>
    );
  }

  if (props.board.hasWon()) {
    contents = 'Good Job!';
  } else if (props.board.hasLost()) {
    contents = 'Game Over';
  }
  if (!contents) {
    return null;
  }
  return (
    <div className='overlay'>
      <p className='message'>{contents}</p>
      {form}
      {save}
      <img className='reload' src={reload} onClick={props.onRestart} alt='reload' />
    </div>
  );
};

export default GameEndOverlay;

import React from 'react';
import Button from '../Button/Button';

const login = (props) => {
  let error, loader;
  const button = props.username ? 'secondary' : 'disabled';
  if (props.error !== 'none') {
    error = 'primaryError';
  } else {
    error = 'primary';
  }
  if (props.isSigningIn) loader = <div></div>;
  return (
    <div>
      <div onClick={props.closeLogin}></div>
      <section>
        <div>
          <Button text='Submit' skin={button} onClick={props.login} />
        </div>
      </section>
      {loader}
    </div>
  );
};

export default login;

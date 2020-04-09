/* eslint-disable import/first */
import React from 'react';
import './style/scss/main.scss';
import './style/scss/style.scss';
import { Board } from './components/board';
import Cell from './components/Cell';
import TileView from './components/TileView';
import GameEndOverlay from './components/GameEndOverlay';
import 'bootstrap/dist/css/bootstrap.css';
import LeaderBoard from './components/leaderboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Arweave from 'arweave/web';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: new Board(),
      form: {
        username: '',
        pass: '',
        key: '',
        error: ''
      },
      isSigningIn: true,
      isLoggedIn: false,
      displayLogin: false,
      loginError: 'none',
      usersRank: [],
      bestscore: 0,
      arweave: null,
      address: null
    };
    this.fileUpload = React.createRef();
    this.fileUploadSave = React.createRef();
  }

  restartGame() {
    this.setState({ board: new Board() });
  }

  saveGame = async () => {
    // const score = this.state.board.getScore();
    // try {
    //   await ApiService.sortrank(score);
    //   toast.success('Success');
    // } catch (error) {
    //   console.log(error);
    //   toast.error('Error');
    // }
  };

  handleKeyDown(event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.keyCode >= 37 && event.keyCode <= 40) {
      event.preventDefault();
      let direction = event.keyCode - 37;
      this.setState({ board: this.state.board.move(direction) });
    }
  }

  handleTouchStart(event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.touches.length !== 1) {
      return;
    }
    this.startX = event.touches[0].screenX;
    this.startY = event.touches[0].screenY;
    event.preventDefault();
  }

  handleTouchEnd(event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.changedTouches.length !== 1) {
      return;
    }
    let deltaX = event.changedTouches[0].screenX - this.startX;
    let deltaY = event.changedTouches[0].screenY - this.startY;
    let direction = -1;
    if (Math.abs(deltaX) > 3 * Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      direction = deltaX > 0 ? 2 : 0;
    } else if (Math.abs(deltaY) > 3 * Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      direction = deltaY > 0 ? 3 : 1;
    }
    if (direction !== -1) {
      this.setState({ board: this.state.board.move(direction) });
    }
  }

  async componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    const arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });
    this.setState({ arweave: arweave });
  }

  showHideLogin = () => {
    this.setState({ displayLogin: !this.state.displayLogin });
  };

  logout = () => {
    localStorage.removeItem('user_account');
    localStorage.removeItem('user_key');
    window.location.reload();
  };

  handleChangeLogin(event) {
    const { name, value } = event.target;
    const { form } = this.state;
    this.setState({
      form: {
        ...form,
        [name]: value,
        error: ''
      },
      loginError: 'none'
    });
  }

  handleChangeAccount(event) {
    // if not lower case, make lower case, only if eos account
    if (event.target.value.toString().match(/[A-Z]/) && event.target.value.length <= 12)
      this.setState({
        inputAccount: event.target.value.toString().toLowerCase(),
        addAccountErr: ''
      });
    else this.setState({ inputAccount: event.target.value.toString(), addAccountErr: '' });
  }

  onUpload = async (e) => {
    let dataFile = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      const jwk = JSON.parse(fileReader.result);
      this.setState({ jwk: jwk });
      const arweave = this.state.arweave;
      if (arweave) {
        arweave.wallets.jwkToAddress(jwk).then(async (address) => {
          this.setState({ address: address, isLoggedIn: true });
          const tx_ids = await arweave.arql({
            op: 'and',
            expr1: {
              op: 'equals',
              expr1: 'from',
              expr2: address
            },
            expr2: {
              op: 'equals',
              expr1: 'type',
              expr2: 'score'
            }
          });
          let usersRank = [];
          console.log(tx_ids);
          tx_ids.forEach((tx_id) => {
            arweave.transactions
              .getData(tx_id, {
                decode: true,
                string: true
              })
              .then((data) => {
                usersRank.push(data);
                usersRank.sort((a, b) => {
                  return b - a;
                });
                usersRank = usersRank.slice(0, 10);
                this.setState({ usersRank: usersRank });
              });
          });
        });
      }
    };
    fileReader.readAsText(dataFile);
  };

  onUploadSave = async (e) => {
    let dataFile = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      const jwk = JSON.parse(fileReader.result);
      this.setState({ jwk: jwk });
      const arweave = this.state.arweave;
      if (arweave) {
        arweave.wallets.jwkToAddress(jwk).then(async (address) => {
          this.setState({ address: address, isLoggedIn: true });
          await this.saveScore();
          const tx_ids = await arweave.arql({
            op: 'and',
            expr1: {
              op: 'equals',
              expr1: 'from',
              expr2: address
            },
            expr2: {
              op: 'equals',
              expr1: 'type',
              expr2: 'score'
            }
          });
          let usersRank = [];
          console.log(tx_ids);
          tx_ids.forEach((tx_id) => {
            arweave.transactions
              .getData(tx_id, {
                decode: true,
                string: true
              })
              .then((data) => {
                usersRank.push(data);
                usersRank.sort((a, b) => {
                  return b - a;
                });
                usersRank = usersRank.slice(0, 10);
                this.setState({ usersRank: usersRank });
              });
          });
        });
      }
    };
    fileReader.readAsText(dataFile);
  };

  getCharts = async () => {
    let arweave = this.state.arweave;
    let jwk = this.state.jwk;
    if (arweave) {
      arweave.wallets.jwkToAddress(jwk).then(async (address) => {
        this.setState({ address: address });
        const tx_ids = await arweave.arql({
          op: 'and',
          expr1: {
            op: 'equals',
            expr1: 'from',
            expr2: address
          },
          expr2: {
            op: 'equals',
            expr1: 'type',
            expr2: 'score'
          }
        });
        let usersRank = [];
        tx_ids.forEach((tx_id) => {
          arweave.transactions
            .getData(tx_id, {
              decode: true,
              string: true
            })
            .then((data) => {
              usersRank.push(data);
              usersRank.sort((a, b) => {
                return b - a;
              });
              usersRank = usersRank.slice(0, 10);
              this.setState({ usersRank: usersRank });
            });
        });
      });
    }
  };

  uploadSave = async () => {
    this.fileUploadSave.current.click();
  };

  showUpload = () => {
    this.fileUpload.current.click();
  };

  saveScore = async () => {
    console.log('score');
    const score = this.state.board.getScore();
    const arweave = this.state.arweave;
    const jwk = this.state.jwk;
    if (arweave && jwk) {
      let transaction = await arweave.createTransaction(
        {
          data: score.toString()
        },
        jwk
      );
      transaction.addTag('type', 'score');
      await arweave.transactions.sign(transaction, jwk);
      const response = await arweave.transactions.post(transaction);
      console.log(response);
      if ((response.status = 200)) {
        await this.getCharts();
      }
    }
  };

  render() {
    let islogin;
    if (!this.state.isLoggedIn) {
      islogin = (
        <div>
          <span onClick={this.showUpload}>Login</span>
          <input
            type='file'
            onChange={this.onUpload}
            style={{ display: 'none' }}
            ref={this.fileUpload}
          />
          <input
            type='file'
            onChange={this.onUploadSave}
            style={{ display: 'none' }}
            ref={this.fileUploadSave}
          />
        </div>
      );
    } else {
      islogin = <div className='username'>{this.state.form.username}</div>;
    }
    let cells = this.state.board.cells.map((row, rowIndex) => {
      return (
        <div key={rowIndex}>
          {row.map((_, columnIndex) => (
            <Cell key={rowIndex * Board.size + columnIndex} />
          ))}
        </div>
      );
    });

    let tiles = this.state.board.tiles
      .filter((tile) => tile.value !== 0)
      .map((tile) => <TileView tile={tile} key={tile.id} />);
    return (
      <div className='row main'>
        <ToastContainer position='top-right' autoClose={2000} />
        <div className='col'>
          <div className='scores'>
            {this.state.isLoggedIn ? (
              <span className='score'>best: {localStorage.getItem('bestscore')}</span>
            ) : (
              ''
            )}
            <span className='best-score'>scores: {this.state.board.getScore()}</span>
          </div>
          <div className='newGame'>{islogin}</div>
          <div className='newGame'>
            <span onClick={this.restartGame.bind(this)}>New Game</span>
          </div>
          <div
            className='board'
            onTouchStart={this.handleTouchStart.bind(this)}
            onTouchEnd={this.handleTouchEnd.bind(this)}
            tabIndex='1'
          >
            {cells}
            {tiles}
            <GameEndOverlay
              isLogin={this.state.isSigningIn}
              board={this.state.board}
              onRestart={this.restartGame.bind(this)}
              displayLogin={this.state.displayLogin}
              show={this.state.displayLogin}
              showHideLogin={this.showHideLogin}
              logout={this.logout.bind(this)}
              handleChangeLogin={this.handleChangeLogin.bind(this)}
              error={this.state.loginError}
              isSigningIn={this.state.isSigningIn}
              isLoggedIn={this.state.isLoggedIn}
              loginNameForm={this.state.form}
              saveScore={this.saveScore.bind(this)}
              login={this.uploadSave.bind(this)}
            />
          </div>
        </div>
        <div className='col'>
          <LeaderBoard users={this.state.usersRank} />
        </div>
      </div>
    );
  }
}

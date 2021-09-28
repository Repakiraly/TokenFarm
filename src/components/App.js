import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Main from './Main'



class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData(){
    const web3 = window.web3

    const accounts = await web3.eth.requestAccounts()
    this.setState({ account: accounts[0] })
    //console.log(accounts)

    const networkId = await web3.eth.net.getId()
    console.log(networkId)

    //Load Dai Token
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address) // creating a web3 version of the smart contract
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    }
    else {
      window.alert("Dai Token contract is not deployed to the network")
    }

    //Load DApp Token
    const dappTokenData = DappToken.networks[networkId]
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address) // creating a web3 version of the smart contract
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
    }
    else {
      window.alert("Dapp Token contract is not deployed to the network")
    }

     //Load Token Farm
    const tokenFarmData = TokenFarm.networks[networkId]
     if(tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address) // creating a web3 version of the smart contract
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    }
    else {
       window.alert("TokenFarm contract is not deployed to the network")
    }

    this.setState({ loading: false })
  }

  //Load web3
  async loadWeb3() {
    if(window.etherum) {
      window.web3 = new Web3(window.etherum)
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert("Meta Mask is needed!")
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},   //smart contracts
      dappToken: {}, //smart contracts
      tokenFarm: {}, //smart contracts
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className= "text-center">Loading...</p>
    } 
    else {
      content = <Main 
      daiTokenBalance={this.state.daiTokenBalance}
      dappTokenBalance = {this.state.dappTokenBalance}
      stakingBalance = {this.state.stakingBalance}
      stakeTokens = {this.stakeTokens}
      unstakeTokens = {this.unstakeTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

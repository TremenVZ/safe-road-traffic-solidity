import React,{useState} from 'react'
import Web3 from 'web3'
import {BrowserRouter as Router} from 'react-router-dom'
import {UserList} from './UserList'
import {Context} from './Context'
import Routers from './router'

const App=()=>{
const [web3] =useState(new Web3('http://localhost:8545'));
const AddressContract='0x20513CC92a8d550f350a6Dbf40004d609816fbB7' //Адрес контракта
const [Contract] = useState(new web3.eth.Contract(UserList,AddressContract))
return(
<Router>
<Context.Provider value={{web3,Contract}}>
<Routers/>
</Context.Provider>
</Router>
)
}

export default App
import React from 'react'
import { Switch, Route } from "react-router-dom";
import Main from './Main'

const Routers=()=>{
return(
    <>
        <Switch>
            <Route path="/" component={Main} exact/>
        </Switch>
    </>
)}

export default Routers;
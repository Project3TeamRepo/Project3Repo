import React from 'react';
import Buttons from './Buttons'

export default class Footer extends React.Component {
render (){
return(
<footer className="page-footer  #f57c00 orange darken-2">
<div className="container">
  <div className="row">
    <div className="col l6 s12">
      <h5 className="white-text">The Ultimate Organizer</h5>
    </div>
    <div className="col l4 offset-l2 s12">
      <h5 className="white-text"></h5>
      <ul>

        <Buttons/>
        
        {/* <button id="authorize-button">Log In</button>
        <button id="signout-button">Log Out</button>
        <button id="home" href={"../../public/home.html"}>Home</button>
        <button id="list1" href={"../../"} >To Do List</button>
        <button id="list2">Shopping List</button> */}

      </ul>
    </div>
  </div>
</div>
<div className="footer-copyright">
  <div className="container">
    © 2018 Copyright. All Rights Reserved.
  </div>
</div>
</footer>
)
}
}
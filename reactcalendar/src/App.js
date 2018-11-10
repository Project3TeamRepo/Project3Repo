<<<<<<< HEAD
import React from "react";

=======

import React from "react";

>>>>>>> a7ec99602a178fea0e9a9b07ad0c216a4b2270b3
import ReactCalendar from "./reactCalendar";

import "./App.css";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header>
          <div id="logo">
            <span className="icon">date_range</span>
            <span>
              Ultimate<b>Organizer</b>
            </span>
          </div>
        </header>
        <main>
          <ReactCalendar />
        </main>
<<<<<<< HEAD
      </div>
    );
=======

// import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <p>
//             Edit <code>src/App.js</code> and save to reload.
//           </p>
//           <a
//             className="App-link"
//             href="https://reactjs.org"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Learn React
//           </a>
//         </header>

//       </div>
//     );
>>>>>>> a7ec99602a178fea0e9a9b07ad0c216a4b2270b3
  }
}

export default App;
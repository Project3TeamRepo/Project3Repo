import React from "react";

import ReactCalendar from "./reactCalendar";

import Footer from "./components/Footer"

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
          <Footer />
      </div>
    );
  }
}

export default App;

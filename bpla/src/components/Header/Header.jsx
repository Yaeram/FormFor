import {React, Component } from "react";
import './Header.css'

class Header extends Component {
    constructor() {
        super();
        this.state = {
            status: 0,
        }
    }

    render() {
        return(
            <div className="header-container">
                <div></div>
                <h3>First heading</h3>
                <h3>Second heading</h3>
                <h3>Third heading</h3>
            </div>
        )
    }
    
}

export {Header}
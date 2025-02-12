import {React, Component } from "react";
import './Footer.css'

class Footer extends Component {
    constructor() {
        super();
        this.state = {
            status: 0,
        }
    }

    render() {
        return(
            <div className="footer-container">
                <div></div>
                <h3>Информационная система сбора и обработки информации</h3>
                <h3>Козлова М.Е. <br/>
                kozlova_me@citis.ru</h3>
            </div>
        )
    }
    
}

export {Footer}
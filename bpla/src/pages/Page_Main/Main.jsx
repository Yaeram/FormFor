import React, { Component } from "react";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import './Main.css'

class Main extends Component {
    render() {
        return(
            <div className="main-page">
                <Header></Header>
                <div className="main-page__content">
                    <div>
                        бббббббббббббббббббббб
                    </div>
                    <div>
                        ааааааааааааааааааа
                    </div>
                </div>
                <Footer></Footer>
            </div>
        )
    }
}

export {Main}
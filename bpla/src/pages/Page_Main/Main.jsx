import React, { Component } from "react";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { Text } from "../../text/text";
import './Main.css'

class Main extends Component {
    render() {
        return(
            <div className="main-page">
                <Header></Header>
                <div className="main-page__content">
                    <div>
                        {Text().block1}
                        </div>
                    <div>
                        {Text().block2}
                    </div>
                    <div>
                        {Text().block3}
                    </div>
                    <div>
                        {Text().block4}
                    </div>
                </div>
                <Footer></Footer>
            </div>
        )
    }
}

export {Main}
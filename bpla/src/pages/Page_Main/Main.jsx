import React, { Component } from "react";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { Text } from "../../text/text";
import { AuthModal } from "./AuthModal.jsx";
import './Main.css';

class Main extends Component {
    state = {
        showModal: false
    };

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal });
    };

    render() {
        return (
            <div className="main-page">
                <Header />
                <div className="main-page__content">
                    <button onClick={this.toggleModal}>Войти / Регистрация</button>
                    {/* <div>{Text().block1}</div>
                    <div>{Text().block2}</div>
                    <div>{Text().block3}</div> */}
                </div>
                {this.state.showModal && <AuthModal onClose={this.toggleModal} />}
                <Footer />
            </div>
        );
    }
}

export { Main };

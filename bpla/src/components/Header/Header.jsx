import {React, Component } from "react";
import { Link } from "react-router";
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
            <nav className="header-container">
                <div></div>
                <Link to="/" className="form-link">Главная</Link>
                <Link to="/New_Form" className="form-link">Создать шаблон</Link>
                <Link to="/Form_Template" className="form-link">Готовые шаблоны</Link>
                <Link to="/Saved_Form" className="form-link">Созданные анкеты</Link>
            </nav>
        )
    }
    
}

export {Header}
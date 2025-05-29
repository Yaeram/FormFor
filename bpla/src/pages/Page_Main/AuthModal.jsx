import React, { useState } from "react";
import "./AuthModal.css";

const AuthModal = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Неверный логин или пароль");
            }

            const data = await response.json();
            localStorage.setItem("authorized", true);
            localStorage.setItem("username", data.username)
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await fetch("http://localhost:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                throw new Error("Ошибка при регистрации");
            }

            const data = await response.json();
            console.log(data)
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-modal">
            <div className="auth-modal__content">
                <button className="auth-modal__close" onClick={onClose}>×</button>
                <div className="auth-modal__tabs">
                    <button onClick={() => setIsLogin(true)} className={isLogin ? "active" : ""}>Вход</button>
                    <button onClick={() => setIsLogin(false)} className={!isLogin ? "active" : ""}>Регистрация</button>
                </div>
                {error && <div className="auth-modal__error">{error}</div>}
                {isLogin ? (
                    <form className="auth-form" onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="Логин"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Войти</button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleRegister}>
                        <input
                            type="text"
                            placeholder="Логин"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Зарегистрироваться</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export { AuthModal };

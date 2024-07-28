import React from "react";
import Logo from './movieSniper.png'
import './Header.css';

const Header: React.FC = () => {
    return(
        <>
            <div className="header">
                <img src={Logo} height={150} width={150} alt="Movie Sniper Logo" />
                <h1 >Search for movies you like</h1>
            </div>
        </>
    )
}

export default Header
import React from 'react';
import './Button.css';

//pre-defined style and size parameters for buttons
const STYLES = ['btn--primary', 'btn--outline', 'btn--create', 'btn--leave'];
const SIZES = ['btn--medium', 'btn--large'];

//button component with parameters
export const Button = ({
    children,
    type,
    onClick,
    buttonStyle,
    buttonSize

}) => {

    //check whether button on creation contains style/size paramaters,
    //sets parameter accordingly, otherwise first element of respective array
    const checkButtonStyle = STYLES.includes(buttonStyle) ? buttonStyle : STYLES[0];
    const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

    return (
        <button
            className={`btn ${checkButtonStyle} ${checkButtonSize}`}
            onClick={onClick}
            type={type}
        >
            {children}
        </button>
    )
}
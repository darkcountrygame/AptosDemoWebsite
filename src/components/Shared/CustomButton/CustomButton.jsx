import React from "react";

import './CustomButton.scss';
import { CustomLoader } from "../CustomLoader/CustomLoader";

export default function CustomButton({ text, onClick, disabled = false, className="", loading }) {
    return (
        <button
            className={`custom-button ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? <CustomLoader/> : text}
        </button>
    );
}

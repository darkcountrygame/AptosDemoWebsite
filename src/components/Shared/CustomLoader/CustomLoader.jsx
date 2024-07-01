import  { ThreeDots } from "react-loader-spinner";

import "./CustomLoader.scss";

export const  CustomLoader = ({ width = 160, height = 15 })  => {
    return (
        <div className={'custom-loader'}>
            <ThreeDots
                color="#FF0000"
                height={height}
                width={width}
            />
        </div>
    );
};

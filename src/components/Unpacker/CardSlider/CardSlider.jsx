import React, { useState, useEffect } from 'react';
import CustomButton from '../../Shared/CustomButton/CustomButton';
import './CardsSlider.scss';

export const CardSlider = ({ items, onDoneClicked })  => {
    const [imgIndex, setImageIndex] = useState(0);

    useEffect(() => setImageIndex(0), [items]);

    const onNextClicked = () => {
        removeAnimationClassFromCard();

        setImageIndex(imgIndex + 1);
    }

    const removeAnimationClassFromCard = () => {
        document.getElementById('card-shown').classList.remove('animated-card--appear');
    }

    const addAnimationClassToCard = () => {
        document.getElementById('card-shown').classList.add('animated-card--appear');
    }

    return (
        <div className="card-slider">
            <div className="card-slider_card">
                {items.map(({img, name}, index) => {
                    return <img id="card-shown"
                    key={index}
                    className={`card-slider_card_image animated-card--appear ${index === imgIndex ? 'active' : ''}`}
                    onLoad={() => addAnimationClassToCard()}
                    src={img}
                    alt={name}
        />
                })}
            </div>
            <div className="card-slider_controls">
                { imgIndex < items.length - 1
                    ? <CustomButton onClick={onNextClicked} text="next" >
                    </CustomButton>
                    : <CustomButton onClick={onDoneClicked}  text="Claim All"/>
                }
            </div>
            <div className="card-slider_details">
                { imgIndex + 1 } of { items.length }
            </div>
        </div>
    )
}

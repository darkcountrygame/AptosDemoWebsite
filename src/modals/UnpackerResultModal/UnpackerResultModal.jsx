import React from "react";

import Rodal from "rodal";
import "rodal/lib/rodal.css";

import './UnpackerResultModal.scss';
import { CardSlider } from "../../components/Unpacker/CardSlider/CardSlider";


export default function UnpackerResultModal({ visible, onClose, onDoneClicked, itemsEarned }) {
    return (
      <Rodal
          visible={visible}
          onClose={onClose}
          showCloseButton={false}
          className="unpacker-result"
          animation="slideUp"
          duration={800}
          closeOnEsc={true}
          width={null}
          height={null}
      >
          <div className={'unpacker-result-wrapper'}>
              { itemsEarned.length
                  ? <CardSlider
                      items={itemsEarned.slice(0,5)} //show only last unpacked items
                      onDoneClicked={() => onDoneClicked()}
                  />
                  : <p />
              }
          </div>
      </Rodal>
    );
}

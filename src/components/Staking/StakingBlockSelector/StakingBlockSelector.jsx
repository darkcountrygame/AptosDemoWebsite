import CustomButton from "../../Shared/CustomButton/CustomButton";
import "./StakingBlockSelector.scss";


export const StakingBlockSelector = ({ actionBlocks, selectedBlock, handleSelectBlock })  =>{
    return (
        <div className={'staking-block-selector'}>
            { actionBlocks.map(blockName =>
                <CustomButton
                    key={blockName}
                    text={blockName}
                    onClick={() => handleSelectBlock(blockName)}
                    className={selectedBlock === blockName ? 'active' : ''}
                />
            ) }
        </div>
    );
};

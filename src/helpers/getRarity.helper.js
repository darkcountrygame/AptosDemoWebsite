const rarities = ['common', 'rare',  'epic', 'mythical','legendary'];


export const getRarity = (string) =>  {
    let rarity =  rarities.find( r => string.includes(r));
    return rarity
}
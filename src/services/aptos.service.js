import {
  Aptos,
  AptosConfig,
  Network,
} from "@aptos-labs/ts-sdk";
import { decodeHex } from "../helpers/decodeHex.js"
import { getRarity } from "../helpers/getRarity.helper.js";

const aptosConfig = new AptosConfig({ network: Network.MAINNET });
export const aptos = new Aptos(aptosConfig);

const collection_hash = "0x71aa42b2d1bb47cad15b27ac31a6fd8c35d0927930352adc50b58e2bb645b6f1"; 
const vapal_collection_hash = "0x4c5204dc784e00b6419c3688bbc81e77802ac06423d47e60f4882474a9610bee" 

export const contract_address ="0x3790240aa9d7400d42d99181e0f2364c84d7ef8e9639b99151132a631b11e7d4";
const collection_creator_address = "0x69caa204288ca6d19f455247fbdf1c7dae0e3c4fb2e30a71e92d4e0e3bec32a1"

const templatesTableHandle =  '0x124781d0f084c4ef3b99111d6fe835e034e091a37988736a16e4954d702d8ee4';


export const getAccountBalance = async (address) => {
  const resource = await aptos.getAccountResource({
    accountAddress: address,
    resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  });

  return resource.coin.value;
};

export const getUserNfts = async (account) => {
  let allNfts = [];
  let offset = 0;
  const limit = 100; // Adjust this based on the API's limit

  while (true) {
    let result = await aptos.getAccountOwnedTokensFromCollectionAddress({
      accountAddress: account,
      collectionAddress:
        collection_hash,
      options: {
        offset: offset,
        limit: limit,
      },
    });

    if (result.length === 0) break;

    allNfts.push(...result);
    offset += limit;
  }


  const filteredNfts = allNfts.filter(({ current_token_data }) => {
    return current_token_data?.token_properties?.Type !== 'Pack'
  }).map(
    ({ current_token_data: { token_name, token_uri, token_data_id } }) => ({
      name: token_name,
      uri: token_uri,
      id: token_data_id,
    })
  );

  return filteredNfts;
};

export const getUserPacks = async (account) => {
  let packs  = [];
  let vapalPacks  = [];
  let offset  = 0;
  const limit = 100; // Adjust this based on the API's limit

  // Get Packs from vapal_collection_hash
  while (true) {
    let result = await aptos.getAccountOwnedTokensFromCollectionAddress({
      accountAddress: account,
      collectionAddress: vapal_collection_hash,
      options: {
        offset: offset,
        limit: limit,
      },
    });

    if (result.length === 0) break;

    const promises = result.map(async (item) => {
      const res = await fetch(item.current_token_data.token_uri);
      const resData = await res.json();
      return {...item,current_token_data: {token_properties: resData}}
    });
    
    const  packsData = await Promise.all(promises);
    vapalPacks.push(...packsData);
    offset += limit;
  }

    // Get Packs from collection_hash
    offset = 0;
    while (true) {
      let result = await aptos.getAccountOwnedTokensFromCollectionAddress({
        accountAddress: account,
        collectionAddress: collection_hash,
        options: {
          offset: offset,
          limit: limit,
        },
      });
  
      if (result.length === 0) break;
  
      packs.push(...result);
      offset += limit;
    }


  const filteredNfts = packs.filter(({ current_token_data }) => {
    return current_token_data?.token_properties?.Type === 'Pack'
  });
  return [...filteredNfts, ...vapalPacks]
};

export const getStakedNfts = async (account) => {
  const stakedNFts = await aptos.view({
    payload: {
      function: `${contract_address}::staking::get_staked_tokens`,
      typeArguments: [],
      functionArguments: [account],
    },
  });

  const stakedNftsTemplate = await getNftsTemplateById(stakedNFts[0]);

  return stakedNftsTemplate.map(({ name, uri, id }) => ({ name, uri, id }));
};

export const getSales = async () => {

  const sales = await aptos.view({
    payload: {
      function: `${contract_address}::drops::get_sales`,
      typeArguments: [],
    },
  });

  
  const salesTemplates = await Promise.all(
    sales[0].map(async (item) => {
      const template = await aptos.view({
        payload: {
          function: `${contract_address}::templates::get_template`,
          typeArguments: [],
          functionArguments: [item.template_id],
        },
      });

      let typeIndex = template[0]?.property_names.indexOf("Type");
      let typeHex = template[0]?.property_values_bytes[typeIndex];
      let rarityIndex = template[0]?.property_names.indexOf("Rarity");
      let rarityHex = template[0]?.property_values_bytes[rarityIndex];


      return {
        ...item,
        packName: template[0].name,
        img: template[0].uri,
        type: decodeHex(typeHex).split(/(?=[A-Z])/)[1],
        rarity: getRarity(decodeHex(rarityHex))

      };
    })
  );

  return salesTemplates.filter(({ type }) => {
    console.log(salesTemplates);
    return type === 'Pack'
  });
};

export const getSalesCards = async () => {
  const collection_name = 'Dark Country';
  const resource_type = '0x3::token::Collections';

  const sales = await aptos.view({
    payload: {
      function: `${contract_address}::market::get_sales`,
      typeArguments: [],
    },
  });

  // console.log(sales);

  const collections = await aptos.getAccountResource({
    accountAddress: collection_creator_address,
    resourceType: resource_type
  });

  const token_data_table_handle = collections.token_data.handle;

  const salesCards = [];

  for (const sale of sales[0]) {
    const tokenDataId = {
      creator: collection_creator_address,
      collection: collection_name,
      name: sale.name !== 'name' && sale.name // Using the name field from the sales object
    };
  
    const tableItem = {
      key_type: "0x3::token::TokenDataId",
      value_type: "0x3::token::TokenData",
      key: tokenDataId
    };
  
    try {
      const tokenData = await aptos.getTableItem({
        handle: token_data_table_handle,
        data: tableItem
      });

         // Combine tokenData with sale data
         const tokenDataWithSale = {
          ...tokenData,
          ...sale
        };

        salesCards.push(tokenDataWithSale);
    } catch (error) {
      console.error("Failed to retrieve token data:", error);
    }
  }
  
  console.log(salesCards);
  
  return salesCards;
};


export const getUnpackedTokens = async (account) => {
  const unpackedTokens = await aptos.view({
    payload: {
      function: `${contract_address}::unpacking::get_unpacked_tokens`,
      typeArguments: [],
      functionArguments: [account],
    },
  });

  const unpackedTokensTemplates = await Promise.all(
    unpackedTokens[0].map(async (name) => {
      const template = await aptos.view({
        payload: {
          function: `${contract_address}::templates::get_template`,
          typeArguments: [],
          functionArguments: [name],
        },
      });

      let rarityIndex = template[0]?.property_names.indexOf("Rarity");
      let rarityHex = template[0]?.property_values_bytes[rarityIndex];


      return {
        name: template[0].name,
        img: template[0].uri,
        id: template[0].id,
        rarity: getRarity(decodeHex(rarityHex)),
      };
    })
  );
  return unpackedTokensTemplates;
};

const getNftsTemplateById = async (nfts) => {

  const templates = await Promise.all(
    nfts.map(async ({ name, template_id }) => {
      const templatesTableItem = {
        key_type: "u64",
        value_type: `${contract_address}::templates::Template`,
        key: `${template_id}`,
      };

      const template = await aptos.getTableItem({
        handle: templatesTableHandle,
        data: templatesTableItem,
      });
      return { ...template, name };
    })
  );

  return templates;
};

export const checkIfUserCanRecieveNfts = async (account) => {
  let status;
  try {
    const resource = await aptos.getAccountResource({
      accountAddress: account,
      resourceType: "0x3::token::TokenStore",
    });
    status = resource.direct_transfer;
  } catch (err) {
    if (err?.message.includes("Resource not found")) {
      status = false;
    }
  }
  return status
};


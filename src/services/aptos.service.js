import {
  Aptos,
  AptosConfig,
  Network,
  Account,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import { decodeHex } from "../helpers/decodeHex";
import { getRarity } from "../helpers/getRarity.helper";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);


const contract_private_key = new Ed25519PrivateKey(
  import.meta.env.VITE_APTOS_PRIVATE_KEY
);

const collection_hash = "234e693ce956de51bbedf548298b253af1ab942ca9af4b16d643d57e9ec14aa7";

export const contract_address =
  "0x1ac6713de2cf42540ec69783ed0efe12e363fc0161653b9059008950d6bd0303";

const contract_account = Account.fromPrivateKey({
  privateKey: contract_private_key,
});


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
    ({ current_token_data: {token_name, token_uri, token_data_id }}) =>({
      name: token_name,
      uri: token_uri,
      id:  token_data_id,
    })
  );

  return filteredNfts;
};

export const getUserPacks = async (account) => {
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
    return current_token_data?.token_properties?.Type === 'Pack'
  }); 
  return filteredNfts;
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
        type:decodeHex(typeHex).split(/(?=[A-Z])/)[1],
        rarity: getRarity(decodeHex(rarityHex))
       
      };
    })
  );

  return salesTemplates.filter(({ type }) => {
    return type  === 'Pack'
  }); 
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
  const templates_store =  await  aptos.getAccountResource({
    accountAddress: contract_account.accountAddress,
    resourceType: `${contract_address}::templates::TemplateStore`,
  });
  
  const templatesTableHandle = templates_store.templates.handle;

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



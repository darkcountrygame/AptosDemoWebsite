import React, { useState, useEffect, useRef } from "react";

import LoadingOverlay from "react-loading-overlay-nextgen";
import { toast } from "react-toastify";

import "./Unpacker.scss";

import UnpackerResultModal from "../../modals/UnpackerResultModal/UnpackerResultModal";

import backgroundImage from "../../resourses/unpacker/images/bg_with_smoke_light.png";
import altar from "../../resourses/unpacker/images/altar.png";
import coffin from "../../resourses/unpacker/images/coffin.png";
import lightedCoffin from "../../resourses/unpacker/images/lighted_coffin.png";
import bookShelf from "../../resourses/unpacker/images/book_shelf_hero.png";
import table from "../../resourses/unpacker/images/table_hero.png";
import bell from "../../resourses/unpacker/images/bell_btn.png";
import bellActive from "../../resourses/unpacker/images/bell_btn_active.png";
import currencyMark from "../../resourses/unpacker/images/currency_mark.png";
import yeti from "../../resourses/unpacker/images/yeti.png";

import bg_sound from "../../resourses/unpacker/sounds/background.mp3";
import bell_sound from "../../resourses/unpacker/sounds/Bell.mp3";
import pack_placed_sound from "../../resourses/unpacker/sounds/Pack_placed.mp3";
import pack_opens_sound from "../../resourses/unpacker/sounds/Pack_opens.mp3";

import bg_video_unpacking_and_cycled from "../../resourses/unpacker/videos/UnpackingAndCycled.mp4";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { LoginFirst } from "../../components/Shared/LoginFirst/LoginFirst";
import { contract_address, getUnpackedTokens, getUserPacks } from "../../services/aptos.service";
import useSignAndSubmitTransaction from "../../hooks/useSignAndSubmitTransaction";

export const Unpacker = () => {
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [itemsEarned, setItemsEarned] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [unpackedTimestamp, setUnpackedTimestamp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  useSignAndSubmitTransaction();

  const navigate = useNavigate();

  const { account, signAndSubmitTransaction } = useWallet();

  const fetchUserPacks = async () => {
    setLoading(true)
    try {
      const res = await getUserPacks(account?.address);
      const mappedPacks = res.map((p) => ({
        amount: p.amount,
        image: p.current_token_data?.token_uri,
        id: p.current_token_data?.token_name,
        name: p.current_token_data?.token_properties?.Name,
        rarity: p.current_token_data?.token_properties?.Rarity
      }));
      const groupPacks = groupItems(mappedPacks);
      setPacks(groupPacks);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false)
    }
  };

  


  useEffect(() => {
    if (account?.address)  {
      fetchUserPacks();
    }
  }, [account]);

  useEffect(() => {
    if (unpackedTimestamp && selectedPack) {
      setLoadingText("Unpacking...");
      setLoading(true);

      unpack()
        .then(() => {
          const filteredPacks = packs.map((p) => {
            if (p.id === selectedPack.id) {
              return { ...p, amount: p.amount - 1 };
            } else {
              return p;
            }
          }).filter(p=> p.amount > 0);;
          setPacks(filteredPacks);
          setSelectedPack(null);

          startUnpackingVideo();
        })
        .catch((e) => handleError(e))
        .finally(() => setLoading(false));
    }
  }, [unpackedTimestamp]);

  const unpackVideo = useRef(null);
  const unpackVideoDiv = useRef(null);

  const audioBg = <audio id="bgMusic" src={bg_sound} loop autoPlay />;
  const audioBell = new Audio(bell_sound);
  const audioPackPlaced = new Audio(pack_placed_sound);
  const audioPackOpens = new Audio(pack_opens_sound);

  const playSound = (audioName) => {
    audioName.volume = 0.25;
    audioName.play();
  };

  const groupItems = (items) => {
    const groupedItems = {};
    
    items.forEach((item) => {
        const { name, rarity, amount } = item;
        const key = `${name}-${rarity}`;
        
        if (!groupedItems[key]) {
            groupedItems[key] = { ...item, amount: 0 };
        }
        
        groupedItems[key].amount += amount;
    });
    
    // Convert object to array
    const resultArray = Object.values(groupedItems);
    
    return resultArray;
};



  const unpack = async () => {
    await signAndSubmitTransaction({
      sender: account.address,
      data: {
        function: `${contract_address}::unpacking::unpack`,
        typeArguments: [],
        functionArguments: [selectedPack.id],
      },
    });
  };

  const startUnpackingVideo = () => {
    unpackVideoDiv.current.style.display = "block";

    if (unpackVideo) {
      unpackVideo.current.load();
      unpackVideo.current.play();
      setLoading(true);
      getUnpackedItems().then()
      .catch((e) => handleError(e))
      .finally(() => setLoading(false));
      setTimeout(() => {
        unpackVideo.current.pause();
        setOpenModal(true);
      }, 8.5 * 1000);

    }

    setTimeout(() => playSound(audioPackOpens), 1000);
  };

  const getUnpackedItems = async () => {
    try {
    const tokens = await getUnpackedTokens(account?.address);
    setItemsEarned(tokens);
    }catch(error) {
      console.error(error);
    }
  };

  const fetchUnpackedItems = async () => {
    const data = await fetchUnpackedItems(account?.address);

    if (!data.length) {
      await sleep(1000);

      return await fetchUnpackedLands();
    }

    return data;
  };

  const handleError = (error) => {
    console.log(error);
    hideVideo();
    toast.error(error);
  };

  const hideVideo = () => {
    if (unpackVideoDiv) unpackVideoDiv.current.style.display = "none";
  };

  const renderFiveCards = () => {
    playSound(audioBell);

    setUnpackedTimestamp(new Date().getTime());
  };

  const responsivePackStyle = () => {
    const percentage = 4.5;
    return `${packs.length * percentage}%`;
  };

  const renderPacks = (pack) => {
    return (
      <div className="item-and-quantity-container" key={pack.name}>
        <div className="book-container" onClick={() => onPackSelect(pack)}>
          <img
            src={pack.image}
            className="book-image"
            alt=""
            draggable={true}
            onDragStart={(event) => dragPack(event, pack.id)}
            data-id={pack.name}
            onMouseEnter={(event) => onImageHover(event)}
            onMouseLeave={(event) => onImageHoverEnd(event)}
          />
        </div>
        <div className="book-quantity-container">
          <img src={currencyMark} alt="" />
          <p className="quantity-text">{pack.amount}</p>
        </div>
      </div>
    );
  };

  const onPackSelect = (pack) => {
    console.log("pack selected", pack);

    setSelectedPack(pack);

    playSound(audioPackPlaced);
  };

  const dragPack = (event, packItemId) => {
    if (selectedPack) setSelectedPack(null);

    event.dataTransfer.setData("packItemId", packItemId);
  };

  const onImageHover = (event) => {
    event.target.classList.add("book-image--scale");

    return (event.target.style.marginLeft = "-20%");
  };

  const onImageHoverEnd = (event) => {
    event.target.classList.remove("book-image--scale");

    return (event.target.style.marginLeft = "0");
  };

  const dropItem = (event) => {
    event.preventDefault();

    const packItemId = event.dataTransfer.getData("packItemId");
    const pack = packs.find((p) => p.id === packItemId);

    if (pack) {
      setSelectedPack(pack);
      playSound(audioPackPlaced);
    }
  };

  const allowDrop = (event) => {
    event.preventDefault();
  };

  const renderPackToTable = (pack) => {
    if (!pack) return <div />;

    return (
      <img
        src={pack.image}
        className="book-on-table-image"
        onClick={() => onPackUnselect()}
        alt=""
      />
    );
  };

  const onPackUnselect = () => {
    setSelectedPack(null);
  };

  const onAllCardsSeen =  async () => {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${contract_address}::unpacking::claim`,
          typeArguments: [],
          functionArguments: [],
        },
      });
      console.log(response)
      // if you want to wait for transaction
      try {
        await aptos.waitForTransaction({ transactionHash: response.hash });
      } catch (error) {
        console.error(error);
      }

    setOpenModal(false);
    hideVideo();
  };

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  return (
    <>
      <>{audioBg}</>
      <div className="card-unpacker">
        <img
          className="background-image"
          src={backgroundImage}
          alt=""
          draggable={false}
        />
        <div className="overlay" ref={unpackVideoDiv}>
          <video
            ref={unpackVideo}
            width="100%"
            height="100%"
            loop
            src={bg_video_unpacking_and_cycled}
          />
        </div>
        <div
          className="my-cards-container"
          onClick={() => navigate("/staking")}
        >
          <div className="my-cards-image-cover">
            <img
              className="my-cards-image"
              src={yeti}
              alt=""
              draggable={false}
            />
          </div>
          <span className="my-items-text">My items</span>
        </div>
        <img
          className="coffin-image lighted-coffin-image"
          src={lightedCoffin}
          alt=""
          style={{ visibility: selectedPack ? "visible" : "hidden" }}
          draggable={false}
        />
        <img
          className="coffin-image"
          src={coffin}
          alt=""
          style={{ visibility: selectedPack ? "hidden" : "visible" }}
          draggable={false}
        />
        <img className="altar-image" src={altar} alt="" draggable={false} />
        <img
          className="bookShelf-image"
          src={bookShelf}
          alt=""
          draggable={false}
        />
        <img className="table-image" src={table} alt="" draggable={false} />
        <div
          className="dnd-container"
          onDrop={(event) => dropItem(event)}
          onDragOver={(event) => allowDrop(event)}
        />
        <img
          className="bell-image bell-image-active"
          src={bellActive}
          alt=""
          style={{ visibility: selectedPack ? "visible" : "hidden" }}
          onClick={() => renderFiveCards()}
          draggable={false}
        />
        <img
          className="bell-image"
          src={bell}
          alt=""
          style={{ visibility: selectedPack ? "hidden" : "visible" }}
          draggable={false}
        />
        <div
          className="list-of-hero-packs"
          style={{ maxWidth: responsivePackStyle() }}
        >
          {packs && packs.map((pack) => renderPacks(pack))}
        </div>
        {packs.length < 1 &&
          !loading &&
          (!account?.address ? (
            <div className="items-container">
              <LoginFirst />
            </div>
          ) : (
            <span className="no-items">No Packs</span>
          ))}
        {renderPackToTable(selectedPack)}
        <UnpackerResultModal
          visible={openModal}
          onClose={() => {}}
          onDoneClicked={() => onAllCardsSeen()}
          itemsEarned={itemsEarned}
        />
      </div>
      <LoadingOverlay active={loading} spinner text={loadingText} />
    </>
  );
};

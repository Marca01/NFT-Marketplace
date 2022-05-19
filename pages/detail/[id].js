import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faArrowUpRightFromSquare,
  faShareNodes,
  faEllipsisVertical
} from "@fortawesome/free-solid-svg-icons";
import { useContractSigner } from "@/hooks/useContractSigner";
import { ethers } from "ethers";
export default function id() {
  const router = useRouter();
  const nft = router.query;
  const { contract } = useContractSigner();

  const now = new Date();

  const calculateTimeLeft = () => {
    let year = new Date().getFullYear();
    const difference = +new Date(`2022-06-20`) - +new Date();
    let timeLeft = {};

    if (difference >= 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        mins: Math.floor((difference / 1000 / 60) % 60),
        secs: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach(interval => {
    timerComponents.push(
      <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span className="font-mono text-5xl w-14">
          <span>{timeLeft[interval]}</span>
        </span>
        {interval}
      </div>
    );
  });

  const buyNFT = async () => {
    const price = ethers.utils.parseUnits(nft.price, "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    });
    await transaction.wait();
    /* Go to my nfts */
    // router.push()
  };

  const [priceUSD, setPriceUSD] = useState();

  useEffect(() => {
    const fetchMatic = async () => {
      try {
        const data = await axios.get(
          "https://api.nomics.com/v1/currencies/ticker?key=cb1cd017eded670e7fa38baf2a4d07548d1adc01&ids=MATIC,XRP&interval=1d,30d&convert=USD&platform-currency=MATIC&per-page=100&page=1",
          {
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
        setPrice(data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMatic();
  }, []);

  return (
    <main className="px-52 my-10">
      <div className="grid grid-cols-12">
        <div className="col-span-5 mr-10 flex flex-col">
          <div className=" w-full h-full">
            <div className="card w-full bg-base-100 shadow-xl border-2 border-black">
              <figure>
                <img
                  className="object-cover w-full"
                  src={nft?.image}
                  alt="Shoes"
                />
              </figure>
              <div className="card-body">
                <div className="card-actions justify-end">
                  <div className="badge badge-outline">Fashion</div>
                  <div className="badge badge-outline">Products</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full border-2 border-black rounded-lg mt-5">
            <div
              tabindex="0"
              className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-lg">
              <input type="checkbox" className="peer" />
              <div className="collapse-title text-xl font-medium bg-gray-700">
                {nft?.description}
              </div>
              <div className="collapse-content">
                <p className="font-thin text-base pt-5">
                  Created by {nft?.seller === ' 0x0000000000000000000000000000000000000000' ? nft?.owner : nft?.seller}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-7">
          <div className="w-full h-96">
            <div className="w-full h-20">
              <div className="flex flex-row justify-between items-center">
                <div className="text-2xl font-medium text-gray-300">
                  Collection
                </div>
                <div className="btn-group">
                  <button className="btn border-2 border-gray-400 gap-1 peer">
                    <FontAwesomeIcon icon={faArrowRotateRight} />
                  </button>
                  <button className="btn border-2 border-gray-400 gap-1">
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  </button>
                  <button className="btn border-2 border-gray-400 gap-1">
                    <FontAwesomeIcon icon={faShareNodes} />
                  </button>
                  <button className="btn border-2 border-gray-400 gap-1">
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-medium text-white w-full mb-3">
                  {nft?.name}
                </span>
                <span className="text-base font-thin flex flex-row">
                  Owned by {nft?.seller === ' 0x0000000000000000000000000000000000000000' ? nft?.owner : nft?.seller}
                  <span className="ml-10 w-40 flex flex-row">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    15 favorites
                  </span>
                </span>
              </div>
              <div className="flex flex-col w-full border-2 border-black rounded-lg mt-5">
                <div className="px-5 py-5 bg-gray-700 rounded-lg">
                  <div className="mb-5">Sale ends June 20, 2022</div>
                  <div className="flex flex-row gap-5 text-center">
                    {timerComponents}
                  </div>
                </div>
                <div className="px-5 py-5 flex flex-col">
                  <span className="font-semibold text-xl">Current price</span>
                  <span className="font-bold text-3xl text-white flex flex-row  items-end">
                    <img
                      alt="MATIC"
                      className="w-8 h-7"
                      src="https://cryptologos.cc/logos/polygon-matic-logo.svg?v=022"></img>
                    {nft?.price}
                    <span className="font-thin text-base text-slate-300 ml-3">
                      (${+priceUSD?.price * +nft?.price})
                    </span>
                  </span>
                  <div className="mt-5">
                    <button className="btn btn-info btn-wide gap-2 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path
                          fillRule="evenodd"
                          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-sans" onClick={buyNFT}>
                        Buy now
                      </span>
                    </button>
                    <button className="btn btn-wide gap-2 ml-5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-sans">Make offer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

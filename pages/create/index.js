import React, { useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";

import { useContractSigner, useModal } from "hooks";
import { EditSolidIcon } from "assets/icons";
import { sharpenImageApi } from "api";
import { ModalBox } from "components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Create() {
  const router = useRouter();
  const { contract } = useContractSigner();
  const [state, setState] = useState({
    text: "",
    des: "",
    price: null,
    file: null,
    editedImg: null,
    isLoading: false
  });
  const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
  function handleChange(e) {
    if (e.target.files) {
      setState(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
    } else {
      setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  }
  const removeImage = e => {
    setState({ file: null });
  };
  async function uploadIPFS(file) {
    const added = await client.add(file, (err, ipfsHash) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("IPFS Hash:", ipfsHash);
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  }

  async function upMetadataIPFS() {
    const { text: name, des: description, file } = state;
    const image = await uploadIPFS(file);
    const data = JSON.stringify({ name, description, image });
    const added = await client.add(data, (err, ipfsHash) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("IPFS Hash:", ipfsHash);
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  }

  async function handleSubmit(e) {
    setState({ isLoading: true });
    try {
      e.preventDefault();
      const url = await upMetadataIPFS();
      let listingPrice = await contract.getListingPrice();

      const price = ethers.utils.parseUnits(state.price, "ether");

      let transaction = await contract.createToken(url, price, {
        value: listingPrice.toString()
      });
      await transaction.wait();
      setState({ isLoading: false });
      router.push("/home");
    } catch (error) {
      console.log(error);
    }
  }

  // IMAGE PROCESSING
  let urlRegex = /(https?:\/\/[^\s]+)/;
  const applyChanges = editedImg => {
    setState({ editedImg: editedImg });
  };

  console.log("edited create", state.editedImg);

  return (
    <main className="container mx-auto my-10">
      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit}>
          <h1 className="text-5xl font-bold mb-10">Create New Item</h1>
          <label className="mb-2">
            <span
              className="before:content-['*'] before:ml-0.5 before:text-red-500"
              style={{ fontSize: 12, fontWeight: "medium" }}>
              Require fields
            </span>
          </label>
          <div className="flex flex-col relative mb-5">
            <label className="mb-2">
              <span
                className="after:content-['*'] after:ml-0.5 after:text-red-500"
                style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                Image
              </span>
              <br />
              <span className="text-xs font-medium">
                File types supported: JPG, PNG, GIF, SVG. Max size: 100 MB
              </span>
            </label>
            {state.file ? (
              <div
                className="hover:bg-black"
                style={{
                  width: 350,
                  height: 350,
                  borderRadius: 10,
                  background: "#353840",
                  borderStyle: "dashed",
                  borderWidth: 3,
                  borderColor: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative"
                }}>
                <img
                  style={{
                    width: 350,
                    height: 350,
                    borderRadius: 10,
                    objectFit: "cover",
                    position: "relative"
                  }}
                  src={URL.createObjectURL(state.file)}
                  alt="img"
                />
                <div className="absolute top-2 right-3">
                  <div className="flex flex-row justify-end gap-2 w-full">
                    <button
                      className="btn btn-sm btn-circle"
                      onClick={removeImage}>
                      ✕
                    </button>
                    <label
                      for="editImg-modal"
                      className="btn modal-button btn-sm btn-circle">
                      <EditSolidIcon />
                    </label>
                  </div>
                  <ModalBox originImg={state.file} apply={applyChanges} />
                </div>
              </div>
            ) : state.editedImg && urlRegex.test(state.editedImg) ? (
              <div
                className="hover:bg-black"
                style={{
                  width: 350,
                  height: 350,
                  borderRadius: 10,
                  background: "#353840",
                  borderStyle: "dashed",
                  borderWidth: 3,
                  borderColor: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative"
                }}>
                <img
                  style={{
                    width: 350,
                    height: 350,
                    borderRadius: 10,
                    objectFit: "cover",
                    position: "relative"
                  }}
                  src={state.editedImg}
                  alt="img"
                />
                <div className="absolute top-2 right-3">
                  <div className="flex flex-row justify-end gap-2 w-full">
                    <button
                      className="btn btn-sm btn-circle"
                      onClick={removeImage}>
                      ✕
                    </button>
                    <label
                      for="editImg-modal"
                      className="btn modal-button btn-sm btn-circle">
                      <EditSolidIcon />
                    </label>
                  </div>
                  <ModalBox originImg={state.file} apply={applyChanges} />
                </div>
              </div>
            ) : (
              <div
                className="hover:bg-black"
                style={{
                  width: 350,
                  height: 350,
                  borderRadius: 10,
                  background: "#353840",
                  borderStyle: "dashed",
                  borderWidth: 3,
                  borderColor: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative"
                }}>
                <label htmlFor="input">
                  <img
                    style={{
                      width: 80,
                      position: "absolute",
                      left: "39%",
                      top: "36%"
                    }}
                    src="https://icon-library.com/images/upload-icon-vector/upload-icon-vector-10.jpg"
                  />
                </label>
                <input
                  id="file"
                  type="file"
                  name="file"
                  style={{
                    width: 800,
                    height: 200,
                    opacity: 0,
                    zIndex: 100
                  }}
                  onChange={handleChange}
                />
              </div>
            )}
            {/* {state.editedImg && urlRegex.test(state.editedImg) && (
              <div
                className="hover:bg-black"
                style={{
                  width: 350,
                  height: 350,
                  borderRadius: 10,
                  background: "#353840",
                  borderStyle: "dashed",
                  borderWidth: 3,
                  borderColor: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative"
                }}>
                <img
                  style={{
                    width: 350,
                    height: 350,
                    borderRadius: 10,
                    objectFit: "cover",
                    position: "relative"
                  }}
                  src={state.editedImg}
                  alt="img"
                />
                <div className="absolute top-2 right-3">
                  <div className="flex flex-row justify-end gap-2 w-full">
                    <button
                      className="btn btn-sm btn-circle"
                      onClick={removeImage}>
                      ✕
                    </button>
                    <label
                      for="editImg-modal"
                      className="btn modal-button btn-sm btn-circle">
                      <EditSolidIcon />
                    </label>
                  </div>
                  <ModalBox originImg={state.editedImg} apply={applyChanges} />
                </div>
              </div>
            )} */}
          </div>

          <div className="flex flex-col">
            <label className="mb-2">
              <span
                className="after:content-['*'] after:ml-0.5 after:text-red-500"
                style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                Name
              </span>
            </label>
            <input
              name="text"
              type="text"
              placeholder="Item name"
              onChange={handleChange}
              value={state.text}
              required
              style={{
                width: 800,
                height: 40,
                marginBottom: 20,
                borderRadius: 5,
                padding: 12,
                background: "#353840",
                outline: "none",
                fontSize: 16
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2">
              <span style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                Description
              </span>
              <br />
              <span className="text-xs font-medium">
                The description will be included on the item's detail page
                underneath its image
              </span>
            </label>
            <textarea
              name="des"
              placeholder="Provide a detailed description of your item."
              onChange={handleChange}
              value={state.des}
              required
              style={{
                width: 800,
                height: 200,
                fontSize: 16,
                borderRadius: 5,
                padding: 12,
                marginBottom: 20,
                background: "#353840",
                outline: "none"
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2">
              <span style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                Price
              </span>
              <br />
              <span className="text-xs font-medium"></span>
            </label>
            <input
              name="price"
              type="number"
              placeholder="Enter the price"
              onChange={handleChange}
              value={state.price}
              style={{
                width: 800,
                height: 40,
                marginBottom: 20,
                borderRadius: 5,
                padding: 12,
                background: "#353840",
                outline: "none"
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2">
              <span style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                Blockchain
              </span>
            </label>
            <select
              style={{
                width: 800,
                height: 40,
                marginBottom: 20,
                borderRadius: 5,
                padding: 5,
                background: "#353840",
                outline: "none"
              }}>
              <option value={"Ethereum"}>Ethereum</option>
              <option value={"Polygon"}>Polygon</option>
            </select>
          </div>
          {state.isLoading ? (
            <button className="btn btn-info btn-disabled opacity-50 font-bold flex flex-row gap-2">
              <FontAwesomeIcon icon={faSpinner} spin />
              Create
            </button>
          ) : (
            <button className="btn btn-info font-bold " type="submit">
              Create
            </button>
          )}
        </form>
      </div>
    </main>
  );
}

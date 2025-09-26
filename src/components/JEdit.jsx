import React, { useEffect, useRef, useState } from "react";
import ReactView from "react-json-view";
import ReactEditor from "react-json-editor-ajrm";
import "./json.css";
import { AiOutlineMenuUnfold, AiFillCloseCircle } from "react-icons/ai";
import { Baseaxios, LS } from "../Utils/Resuse";
import { Toaster, toast } from "react-hot-toast";
import { IoMdAddCircle } from "react-icons/io";
import { FaUpload } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Tooltip } from "react-tooltip";

function JEdit({ edit, data, filename, id, toggle }) {
  const navigate = useNavigate();

  const location = useLocation();
  let path = location.pathname.split("/")[2];
  const [Navbool, Setnavbool] = useState(false);
  const togglebtn = () => {
    Setnavbool(!Navbool);
  };
  const globaltoast = toast;
  const [Jsondata, Setjsondata] = useState({
    data: data,
    filename: filename,
    error: false,
  });
  const inputRef = useRef(null);
  const handleClick = () => {
    inputRef.current.click();
  };
  const handleChange = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      console.log(e.target.result);
      Setjsondata({ ...Jsondata, data: JSON.parse(e.target.result) });
    };
  };
  const [viewmodel, setViewModal] = useState(false);
  const Senddata = async () => {
    if (Jsondata.filename.length != 0) {
      await Baseaxios.post(edit ? `Updatecsvjson` : `Addcsvjson`, {
        id: id,
        data: JSON.stringify(Jsondata.data),
        name: Jsondata.filename,
        fileid: LS.get("userid"),
      })
        .then((res) => {
          console.log(res.data);

          Setjsondata({
            data: {},
            filename: "",
            error: false,
          });
          setViewModal(false);
          toggle({ data: "Data Successfully Edited", err: false });
        })
        .catch((err) => {
          Setjsondata({
            data: {},
            filename: "",
            error: false,
          });
          setViewModal(false);
          toggle({
            data: "Something has occured please try again later",
            err: true,
          });
          let ec = err.response.status;
          // if (ec == 401) {
          //   toast.error("Login Session has been expired.......");
          //   const timerId = setTimeout(() => {
          //     LS.clear();
          //     navigate("/", { replace: true });
          //   }, 3000);
          // }
          // globaltoast.success("Something has occured please try again later", {
          //   id: globaltoast,
          // });
        });
    }
  };
  return (
    <div className="jsonback h-full w-full p-5">
      <div className="flex items-start justify-between ">
        {Navbool ? <Navbar path={path} togglebtn={togglebtn} /> : <></>}

        <h1 className="lg:text-4xl font-poppins md:text-3xl text-2xl ">
          Json Editor
        </h1>
        <div className="hidden lg:flex">
          <button
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Save Json"
            data-tooltip-place="top"
            className="border-2 bg-[#76ad5f] px-2 py-3 rounded-lg tracking-wider font-mono text-white mr-5"
            onClick={(e) => {
              try {
                if (JSON.stringify(Jsondata.data).length > 2) {
                  setViewModal(true);
                } else {
                  toast.error("Invalid data");
                }
              } catch (e) {
                toast.error("Invalid data");
              }
            }}
          >
            {edit ? "Edit Json" : "Save Json"}
          </button>
          {edit ? (
            <></>
          ) : (
            <button
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Add Json File"
              data-tooltip-place="top"
              className="border-2 bg-[#76ad5f] px-2 py-3 rounded-lg tracking-wider font-mono text-white"
              onClick={handleClick}
            >
              Add Json
            </button>
          )}
          <input
            style={{ display: "none" }}
            ref={inputRef}
            type="file"
            onChange={handleChange}
          />
        </div>
        <div className="lg:hidden flex justify-center items-center space-x-3">
          {edit ? (
            <></>
          ) : (
            <IoMdAddCircle
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Add File"
              data-tooltip-place="top"
              size={30}
              onClick={handleClick}
            />
          )}
          <input
            style={{ display: "none" }}
            ref={inputRef}
            type="file"
            onChange={handleChange}
          />

          <FaUpload
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Upload Json"
            data-tooltip-place="top"
            size={23}
            onClick={(e) => {
              try {
                if (JSON.stringify(Jsondata.data).length > 2) {
                  setViewModal(true);
                } else {
                  toast.error("Invalid data");
                }
              } catch (e) {
                toast.error("Invalid data");
              }
            }}
          />
          <AiOutlineMenuUnfold
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Menu"
            data-tooltip-place="top"
            size={30}
            className="mr-5"
            onClick={(e) => {
              Setnavbool(!Navbool);
            }}
          />
        </div>
      </div>
      <div className="flex items-center flex-col justify-center  h-[90%] lg:flex-row">
        {/* <div>
          <ReactEditor
            height={600}
            width={500}
            placeholder={Jsondata.data}
            onChange={(e) => {
              Setjsondata({ ...Jsondata, error: true });

              if (!e.error) {
                Setjsondata({ ...Jsondata, data: e.jsObject, error: false });
              }
            }}
          />
        </div> */}
        <div style={{ width: "100%", maxWidth: "800px", marginTop: "1rem" }}>
          <ReactEditor
            height="60vh" // 60% of the viewport height
            width="100%" // 100% of the parent container's width
            placeholder={Jsondata.data}
            onChange={(e) => {
              Setjsondata({ ...Jsondata, error: true });

              if (!e.error) {
                Setjsondata({ ...Jsondata, data: e.jsObject, error: false });
              }
            }}
          />
        </div>
        <div
          className=" bg-black p-1 overflow-y-auto h-[60vh]"
          style={{ width: "100%", maxWidth: "800px", marginTop: "1rem" }}
        >
          <ReactView src={Jsondata.data} theme="monokai" />
        </div>
      </div>

      {viewmodel ? (
        <div className=" flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-[5000] outline-none  backdrop-blur-sm backdrop-contrast-50 backdrop-brightness-50 transition duration-100 focus:outline-none">
          <div className="relative my-6 mx-auto max-w-4xl">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
                <h3 className="text-3xl font=semibold text-black">
                  Upload Json to DB
                </h3>
                <button
                  className="bg-transparent border-0 text-black float-right"
                  onClick={() => setViewModal(false)}
                >
                  <span className="text-black opacity-7 h-6 w-6 text-xl block rounded-full">
                    <AiFillCloseCircle onClick={() => setViewModal(false)} />
                  </span>
                </button>
              </div>
              <div className="relative p-6 flex-auto">
                <div className="h-full w-full">
                  <div>
                    <div className="flex items-center justify-start gap-6">
                      <p className="text-xl font-Domine">File Name</p>
                      <input
                        className="border-2 border-black rounded-md px-12 py-2"
                        placeholder="Enter filename"
                        defaultValue={Jsondata.filename}
                        onChange={(e) => {
                          Setjsondata({
                            ...Jsondata,
                            filename: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end  p-6 border-t border-solid border-blueGray-200 rounded-b">
                {Jsondata.filename.length != 0 ? (
                  <a
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify(Jsondata.data)
                    )}`}
                    download={`${Jsondata.filename}.json`}
                  >
                    {`Download Json`}
                  </a>
                ) : (
                  <></>
                )}
                <button
                  className="text-white bg-[#175eab] active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                  type="button"
                  onClick={async (e) => {
                    Senddata();
                  }}
                >
                  Upload
                </button>
              </div>
            </div>
            <Tooltip id="my-tooltip" />
          </div>
          <Toaster position="bottom-center" reverseOrder={false} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default JEdit;

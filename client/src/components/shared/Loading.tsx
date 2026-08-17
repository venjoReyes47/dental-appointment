import React from "react";

export default function Loading() {


    return (
        <>
            <div className="d-flex flex-row justify-content-center align-items-center" style={{ height: "500px" }}>
                <div className="text-center  " >
                    <div className="mx-auto d-block mb-5">
                        <img style={{ width: '150px', cursor: "none" }} src={'https://www.svgrepo.com/show/110595/tooth.svg'} /> <br />


                    </div>

                    <div className="d-block spinner-border spinner-border-lg text-primary  mx-auto" role="status">

                        <span className="sr-only"></span>
                    </div>

                    {/* {setTimeout(() => {
                            return <p>Taking too Long? Refresh the Page</p>
                        }, 10000)} */}

                </div></div>


        </>
    )
}
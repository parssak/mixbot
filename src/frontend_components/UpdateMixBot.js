import React from 'react'

export default function UpdateMixBot({ details, dontCare }) {
    return (
        <div className="update-mixbot">
            <h1>There is a new version of MixBot available!</h1>
            <div className="update-content">
                {details &&
                    details.map((item, idx) =>
                        <div className={"card"} key={item.id + "details"} style={{ flexGrow: 1 }}>
                            <p key={item.id + "text details"}>{item}</p>
                        </div>)
                }
            </div>
            
            <div className="buttons">
                <button onClick={() => { window.open("https://www.parssak.com"); }}>Download Here</button>
                <button className="nothanks" onClick={() => { dontCare()}}>No Thanks</button>
            </div>

        </div>
    )
}

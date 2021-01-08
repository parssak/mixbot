import React from 'react';

const Listbox = props => {

    const clicked = e => {
        e.preventDefault();
        props.clicked(e.target.id);
    }

    return (
        <div className="listbox">
            {
                props.items.map((item, idx) =>
                    <div className={"listbox-button"}>
                        <button key={idx}
                            onClick={clicked}
                            id={item.track.id}>
                            {item.track.name}
                        </button>
                        {/* <div className={"listbox-button-details"}>
                            <p>{item.track.name}</p>
                        </div> */}
                    </div>)
            }
        </div>


    );
}

export default Listbox;